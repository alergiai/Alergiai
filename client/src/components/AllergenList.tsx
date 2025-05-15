import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Allergen } from '@/types';

interface AllergenListProps {
  allergens: Allergen[];
  className?: string;
}

const AllergenList: React.FC<AllergenListProps> = ({ allergens, className = '' }) => {
  // If no allergens are selected, show a message
  if (!allergens.length) {
    return (
      <div className={`text-sm text-gray-500 italic ${className}`}>
        No allergens or restrictions selected
      </div>
    );
  }

  // Group allergens by category for appropriate styling
  const commonAllergens = allergens.filter(a => a.category === 'common');
  const dietaryRestrictions = allergens.filter(a => a.category === 'dietary');
  const religiousRestrictions = allergens.filter(a => a.category === 'religious');
  const customRestrictions = allergens.filter(a => a.category === 'custom');

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {commonAllergens.map(allergen => (
        <Badge 
          key={allergen.id} 
          className="bg-primary-100 hover:bg-primary-200 text-primary-800 px-3 py-1.5 rounded-full font-medium"
          variant="outline"
        >
          {allergen.name}
        </Badge>
      ))}
      
      {dietaryRestrictions.map(allergen => (
        <Badge 
          key={allergen.id} 
          className="bg-success-100 hover:bg-success-200 text-success-800 px-3 py-1.5 rounded-full font-medium"
          variant="outline"
        >
          {allergen.name}
        </Badge>
      ))}
      
      {religiousRestrictions.map(allergen => (
        <Badge 
          key={allergen.id} 
          className="bg-warning-100 hover:bg-warning-200 text-warning-800 px-3 py-1.5 rounded-full font-medium"
          variant="outline"
        >
          {allergen.name} (Religious)
        </Badge>
      ))}
      
      {customRestrictions.map(allergen => (
        <Badge 
          key={allergen.id} 
          className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-full font-medium"
          variant="outline"
        >
          {allergen.name}
        </Badge>
      ))}
    </div>
  );
};

export default AllergenList;
