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
import { Plus, X } from 'lucide-react';

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
  
  return (
    <div className="flex-1 p-4">
      <h2 className="text-xl font-heading font-semibold mb-4">Your Allergens & Restrictions</h2>
      
      <div className="space-y-6">
        {allergenGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">{group.title}</h3>
            
            {group.category !== 'custom' ? (
              <div className="space-y-2">
                {group.allergens.map(allergen => (
                  <div key={allergen.id} className="flex items-center">
                    <Checkbox 
                      id={allergen.id} 
                      checked={allergen.selected}
                      onCheckedChange={() => toggleAllergen(allergen.id)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor={allergen.id} className="ml-3 text-sm text-gray-700">
                      {allergen.name}
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <div>
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
                              <Button type="submit" size="sm" className="px-3">
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
                    <div className="flex flex-wrap gap-2">
                      {group.allergens.map(allergen => (
                        <Badge 
                          key={allergen.id} 
                          variant="secondary"
                          className="flex items-center gap-1 px-3 py-1"
                        >
                          <span>{allergen.name}</span>
                          <button 
                            type="button" 
                            onClick={() => removeCustomAllergen(allergen.id)}
                            className="ml-1 text-gray-500 hover:text-gray-700 p-0.5 rounded-full hover:bg-gray-200"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        
        <Button 
          type="button" 
          className="w-full mt-4"
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
    </div>
  );
};

export default Allergens;
