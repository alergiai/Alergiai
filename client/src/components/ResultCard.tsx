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
          <div className="bg-white rounded-2xl p-6 mb-5 shadow-lg">
            <div className={`
              ${isSafe 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-rose-50 border-rose-200 text-rose-800'} 
              border rounded-xl p-4 mb-2
            `}>
              <div className="flex items-center">
                <div className={`
                  ${isSafe ? 'bg-emerald-500' : 'bg-rose-500'} 
                  p-3 rounded-full mr-4
                `}>
                  {isSafe ? (
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold">
                    {isSafe ? 'Safe to Consume' : 'Not Safe'}
                  </h2>
                  <p className={`text-base ${isSafe ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {isSafe 
                      ? "No allergens or restrictions found" 
                      : "Contains ingredients that match your restrictions"
                    }
                  </p>
                </div>
              </div>
            </div>
            <div className="text-gray-600 text-sm px-2">
              {isSafe 
                ? "This product appears to be safe based on your specified allergens and dietary restrictions." 
                : "This product contains ingredients that match your specified allergens or dietary restrictions."
              }
            </div>
          </div>
        </Pop>
      )}
      
      <SlideUp duration={0.5} delay={0.1}>
        <div className="bg-white rounded-2xl p-5 mb-5 shadow-lg">
          <div className="flex items-start space-x-4 mb-4">
            <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shadow-sm">
              {result.imageUrl && (
                <img 
                  src={result.imageUrl} 
                  alt={`Thumbnail of ${productName}`} 
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-gray-900">{productName}</h3>
              <p className="text-sm text-gray-500">
                Scanned on {format(new Date(result.timestamp), 'MMMM d, yyyy')}
              </p>
            </div>
          </div>
          
          {detectedAllergens.length > 0 && (
            <div className="mt-4 mb-5">
              <h4 className="text-base font-bold text-gray-900 mb-3">Detected Allergens</h4>
              <StaggeredList className="space-y-3" staggerDelay={0.1}>
                {detectedAllergens.map((allergen, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm p-3 border border-gray-100">
                    <div className="flex items-center">
                      <div className={`${
                        allergen.severity === 'unsafe' ? 
                          'bg-rose-500' : 
                          'bg-amber-500'
                      } p-2 rounded-full mr-3`}>
                        {allergen.severity === 'unsafe' ? (
                          <XCircle className="w-4 h-4 text-white" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div>
                        <h5 className="font-bold text-gray-900">
                          {allergen.severity === 'caution' ? `May contain ${allergen.name}` : allergen.name}
                        </h5>
                        <p className="text-sm text-gray-700">Found in: <span className="font-medium">{allergen.found}</span></p>
                      </div>
                    </div>
                  </div>
                ))}
              </StaggeredList>
            </div>
          )}
          
          <div className="mb-4">
            <h4 className="text-base font-bold text-gray-900 mb-3">Full Ingredients List</h4>
            <div className="bg-gray-50 p-4 rounded-xl">
              <p className="text-sm text-gray-700 leading-relaxed">
                {ingredients}
              </p>
            </div>
          </div>
        </div>
      </SlideUp>
      
      <SlideUp duration={0.5} delay={0.2}>
        <div className="bg-white rounded-2xl p-5 mb-5 shadow-lg">
          <h4 className="text-base font-bold text-gray-900 mb-3">AI Recommendation</h4>
          <div className="bg-gray-50 p-4 rounded-xl mb-4">
            <p className="text-gray-700">
              {recommendation}
            </p>
          </div>
          
          {alternativeSuggestion && (
            <FadeIn delay={0.3}>
              <div className="bg-white rounded-xl border border-primary-200 p-4 shadow-sm">
                <div className="flex items-center mb-2">
                  <div className="bg-primary-100 p-2 rounded-full mr-2">
                    <svg className="w-4 h-4 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h5 className="font-bold text-gray-900">Alternative Suggestions</h5>
                </div>
                <p className="text-gray-700 pl-8">{alternativeSuggestion}</p>
              </div>
            </FadeIn>
          )}
        </div>
      </SlideUp>
      
      <FadeIn delay={0.3}>
        <AnimatedButton 
          onClick={onSave}
          className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center text-lg font-medium"
        >
          <Save className="mr-2 h-5 w-5" /> Save to History
        </AnimatedButton>
      </FadeIn>
    </div>
  );
};

export default ResultCard;
