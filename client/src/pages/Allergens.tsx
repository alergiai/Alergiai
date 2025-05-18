import React, { useState } from 'react';
import { useAllergens } from '@/hooks/useAllergens';
import { 
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { 
  Plus, 
  X, 
  Wheat, 
  Milk, 
  Fish, 
  Egg, 
  Cookie, 
  Nut, 
  Salad,
  Beef, 
  Banana, 
  Utensils, 
  Candy
} from 'lucide-react';
import { FadeIn, SlideUp, AnimatedContainer } from '@/components/ui/animations';

// Schema for custom allergen form
const customAllergenSchema = z.object({
  name: z.string().min(2, { message: 'Allergen name must be at least 2 characters' }).max(50)
});

const Allergens = () => {
  const { allergenGroups, toggleAllergen, addCustomAllergen, removeCustomAllergen } = useAllergens();
  
  // Form for custom allergens
  const form = useForm<z.infer<typeof customAllergenSchema>>({
    resolver: zodResolver(customAllergenSchema),
    defaultValues: {
      name: ''
    }
  });
  
  const handleAddCustomAllergen = (values: z.infer<typeof customAllergenSchema>) => {
    addCustomAllergen(values.name);
    form.reset();
    toast({
      title: 'Custom restriction added',
      description: `Added ${values.name} to your custom restrictions`
    });
  };
  
  // Map allergen names to icons
  const getAllergenIcon = (allergenName: string) => {
    const name = allergenName.toLowerCase();
    if (name.includes('gluten') || name.includes('wheat') || name.includes('grain')) return Wheat;
    if (name.includes('milk') || name.includes('dairy') || name.includes('lactose')) return Milk;
    if (name.includes('fish') || name.includes('seafood') || name.includes('shellfish')) return Fish;
    if (name.includes('egg')) return Egg;
    if (name.includes('soy')) return Salad;
    if (name.includes('nut') || name.includes('peanut') || name.includes('almond')) return Nut;
    if (name.includes('vegan') || name.includes('vegetarian')) return Salad;
    if (name.includes('halal') || name.includes('kosher')) return Utensils;
    if (name.includes('meat') || name.includes('beef') || name.includes('pork')) return Beef;
    if (name.includes('fruit')) return Banana;
    if (name.includes('sugar') || name.includes('sweet')) return Candy;
    return Cookie; // Default icon
  };

  return (
    <div className="flex-1 p-4">
      <SlideUp duration={0.3} className="bg-white rounded-2xl shadow-lg p-6 mb-4">
        <h2 className="text-xl font-bold mb-5">Your Allergens & Restrictions</h2>
        
        <div className="space-y-6">
          {allergenGroups.map((group, groupIndex) => (
            <FadeIn key={groupIndex} className="space-y-4" delay={groupIndex * 0.1}>
              <h3 className="text-base font-medium text-gray-900 mb-3">{group.title}</h3>
              
              {group.category !== 'custom' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {group.allergens.map(allergen => {
                    const IconComponent = getAllergenIcon(allergen.name);
                    return (
                      <AnimatedContainer
                        key={allergen.id}
                        onClick={() => toggleAllergen(allergen.id)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl cursor-pointer transition-all duration-200 border ${
                          allergen.selected 
                            ? 'bg-primary-50 border-primary text-primary' 
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`p-3 rounded-full mb-2 ${
                          allergen.selected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-center">{allergen.name}</span>
                      </AnimatedContainer>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleAddCustomAllergen)} className="space-y-2">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <div className="flex gap-2">
                                <Input 
                                  placeholder="E.g., MSG, red dye, etc." 
                                  {...field} 
                                  className="flex-1"
                                />
                                <Button type="submit" className="px-4 bg-primary hover:bg-primary/90">
                                  <Plus className="h-4 w-4 mr-1" />
                                  Add
                                </Button>
                              </div>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                  
                  <p className="mt-1 text-xs text-gray-500">
                    Add any other ingredients you want to avoid
                  </p>
                  
                  {group.allergens.length > 0 && (
                    <div className="mt-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {group.allergens.map(allergen => (
                          <div 
                            key={allergen.id} 
                            className="flex items-center p-2 bg-primary-50 rounded-lg border border-primary-100"
                          >
                            <Cookie className="w-4 h-4 text-primary mr-2" />
                            <span className="text-sm text-gray-800 flex-1 truncate">{allergen.name}</span>
                            <button 
                              type="button" 
                              onClick={() => removeCustomAllergen(allergen.id)}
                              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </FadeIn>
          ))}
          
          <Button 
            type="button" 
            className="w-full mt-4 py-4 bg-primary hover:bg-primary/90 rounded-xl"
            onClick={() => {
              toast({
                title: 'Preferences Saved',
                description: 'Your allergen preferences have been updated'
              });
            }}
          >
            Save Preferences
          </Button>
        </div>
      </SlideUp>
    </div>
  );
};

export default Allergens;
