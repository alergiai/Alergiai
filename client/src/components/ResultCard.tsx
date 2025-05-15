import React from 'react';
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AlertCircle, 
  AlertTriangle, 
  ArrowLeft, 
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { ScanResult } from '@/types';
import { format } from 'date-fns';

interface ResultCardProps {
  result: ScanResult;
  onBack: () => void;
  onSave: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, onBack, onSave }) => {
  const { productName, isSafe, detectedAllergens, ingredients, recommendation, alternativeSuggestion } = result;
  
  return (
    <div className="flex-1 flex flex-col p-4">
      <div className="mb-4">
        <button 
          type="button" 
          className="flex items-center text-gray-600"
          onClick={onBack}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          <span>Back to scan</span>
        </button>
      </div>
      
      <div className={`
        ${isSafe ? 'bg-success-50 border-success-200' : 'bg-danger-50 border-danger-200'} 
        border rounded-lg p-4 mb-4
      `}>
        <div className="flex items-center mb-2">
          {isSafe ? (
            <CheckCircle2 className="w-6 h-6 text-success-500 mr-2" />
          ) : (
            <AlertCircle className="w-6 h-6 text-danger-500 mr-2" />
          )}
          <h2 className={`
            text-lg font-heading font-semibold 
            ${isSafe ? 'text-success-700' : 'text-danger-700'}
          `}>
            {isSafe ? 'Safe to Consume' : 'Not Safe'}
          </h2>
        </div>
        <p className={isSafe ? 'text-success-700' : 'text-danger-700'}>
          {isSafe 
            ? "This product does not contain any of your allergens or restrictions." 
            : "This product contains ingredients that match your allergens or restrictions."
          }
        </p>
      </div>
      
      <Card className="mb-4">
        <CardContent className="p-4 pt-4 flex items-start space-x-3">
          <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
            {result.imageUrl && (
              <img 
                src={result.imageUrl} 
                alt={`Thumbnail of ${productName}`} 
                className="w-full h-full object-cover"
              />
            )}
          </div>
          
          <div>
            <h3 className="text-base font-medium text-gray-900">{productName}</h3>
            <p className="text-sm text-gray-500">
              Scanned on {format(new Date(result.timestamp), 'MMMM d, yyyy')}
            </p>
          </div>
        </CardContent>
        
        {detectedAllergens.length > 0 && (
          <>
            <CardContent className="border-t border-gray-200 p-4">
              <h4 className="font-heading font-medium text-sm text-gray-500 mb-3">DETECTED ALLERGENS</h4>
              <div className="space-y-3">
                {detectedAllergens.map((allergen, index) => (
                  <div key={index} className="flex items-start">
                    <div className="mr-3 mt-0.5">
                      {allergen.severity === 'unsafe' ? (
                        <XCircle className="w-5 h-5 text-danger-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-warning-500" />
                      )}
                    </div>
                    <div>
                      <h5 className="font-medium">
                        {allergen.severity === 'caution' ? `May contain ${allergen.name}` : allergen.name}
                      </h5>
                      <p className="text-sm text-gray-600">Found in ingredients: {allergen.found}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </>
        )}
        
        <CardContent className="border-t border-gray-200 p-4">
          <h4 className="font-heading font-medium text-sm text-gray-500 mb-3">FULL INGREDIENTS LIST</h4>
          <p className="text-sm text-gray-700 leading-relaxed">
            {ingredients}
          </p>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardContent className="p-4">
          <h4 className="font-heading font-medium text-sm text-gray-500 mb-3">AI RECOMMENDATION</h4>
          <p className="text-sm text-gray-700 mb-3">
            {recommendation}
          </p>
          {alternativeSuggestion && (
            <div className="bg-primary-50 p-3 rounded-lg">
              <h5 className="font-medium text-primary-700 mb-1">Alternative Suggestions</h5>
              <p className="text-sm text-primary-700">{alternativeSuggestion}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Button 
        onClick={onSave}
        className="w-full"
      >
        Save to History
      </Button>
    </div>
  );
};

export default ResultCard;
