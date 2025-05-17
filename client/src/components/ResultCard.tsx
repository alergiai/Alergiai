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
  XCircle,
  Save
} from 'lucide-react';
import { ScanResult } from '@/types';
import { format } from 'date-fns';
import { FadeIn, SlideUp, AnimatedButton, Pop, StaggeredList } from '@/components/ui/animations';

interface ResultCardProps {
  result: ScanResult;
  onBack: () => void;
  onSave: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, onBack, onSave }) => {
  const { productName, isSafe, detectedAllergens, ingredients, recommendation, alternativeSuggestion } = result;
  
  return (
    <div className="flex-1 flex flex-col p-4">
      <FadeIn duration={0.3}>
        <div className="mb-4">
          <AnimatedButton 
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 px-2 py-1 rounded"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            <span>Back to scan</span>
          </AnimatedButton>
        </div>
      </FadeIn>
      
      {isSafe !== null && (
        <Pop duration={0.4}>
          <div className={`
            ${isSafe ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-emerald-200' : 'bg-gradient-to-r from-red-50 to-rose-50 border-rose-200'} 
            border rounded-lg p-4 mb-4 shadow-md
          `}>
            <div className="flex items-center mb-2">
              {isSafe ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mr-2 animate-pulse-subtle" />
              ) : (
                <AlertCircle className="w-6 h-6 text-rose-500 mr-2 animate-pulse-subtle" />
              )}
              <h2 className={`
                text-lg font-heading font-semibold 
                ${isSafe ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent' : 'bg-gradient-to-r from-rose-600 to-rose-700 bg-clip-text text-transparent'}
              `}>
                {isSafe ? 'Safe to Consume' : 'Not Safe'}
              </h2>
            </div>
            <p className={isSafe ? 'text-emerald-700' : 'text-rose-700'}>
              {isSafe 
                ? "This product does not contain any of your allergens or restrictions." 
                : "This product contains ingredients that match your allergens or restrictions."
              }
            </p>
          </div>
        </Pop>
      )}
      
      <SlideUp duration={0.5} delay={0.1}>
        <Card className="mb-4 shadow-md overflow-hidden border border-gray-200">
          <CardContent className="p-4 pt-4 flex items-start space-x-3">
            <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden shadow">
              {result.imageUrl && (
                <img 
                  src={result.imageUrl} 
                  alt={`Thumbnail of ${productName}`} 
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            
            <div>
              <h3 className="text-base font-medium text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{productName}</h3>
              <p className="text-sm text-gray-500">
                Scanned on {format(new Date(result.timestamp), 'MMMM d, yyyy')}
              </p>
            </div>
          </CardContent>
          
          {detectedAllergens.length > 0 && (
            <CardContent className="border-t border-gray-200 p-4">
              <h4 className="font-heading font-medium text-sm text-gray-500 mb-3">DETECTED ALLERGENS</h4>
              <StaggeredList className="space-y-3" staggerDelay={0.1}>
                {detectedAllergens.map((allergen, index) => (
                  <div key={index} className="flex items-start bg-gray-50 p-2 rounded-lg">
                    <div className="mr-3 mt-0.5">
                      {allergen.severity === 'unsafe' ? (
                        <XCircle className="w-5 h-5 text-rose-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                      )}
                    </div>
                    <div>
                      <h5 className="font-medium">
                        {allergen.severity === 'caution' ? `May contain ${allergen.name}` : allergen.name}
                      </h5>
                      <p className="text-sm text-gray-600">Found in ingredients: <span className="font-medium">{allergen.found}</span></p>
                    </div>
                  </div>
                ))}
              </StaggeredList>
            </CardContent>
          )}
          
          <CardContent className="border-t border-gray-200 p-4">
            <h4 className="font-heading font-medium text-sm text-gray-500 mb-3">FULL INGREDIENTS LIST</h4>
            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg">
              {ingredients}
            </p>
          </CardContent>
        </Card>
      </SlideUp>
      
      <SlideUp duration={0.5} delay={0.2}>
        <Card className="mb-6 shadow-md overflow-hidden border border-gray-200">
          <CardContent className="p-4">
            <h4 className="font-heading font-medium text-sm text-gray-500 mb-3">AI RECOMMENDATION</h4>
            <p className="text-sm text-gray-700 mb-3 bg-gray-50 p-3 rounded-lg">
              {recommendation}
            </p>
            {alternativeSuggestion && (
              <FadeIn delay={0.3}>
                <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-3 rounded-lg border border-primary-100 shadow-sm">
                  <h5 className="font-medium text-primary-700 mb-1">Alternative Suggestions</h5>
                  <p className="text-sm text-primary-700">{alternativeSuggestion}</p>
                </div>
              </FadeIn>
            )}
          </CardContent>
        </Card>
      </SlideUp>
      
      <FadeIn delay={0.3}>
        <AnimatedButton 
          onClick={onSave}
          className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center"
        >
          <Save className="mr-2 h-5 w-5" /> Save to History
        </AnimatedButton>
      </FadeIn>
    </div>
  );
};

export default ResultCard;
