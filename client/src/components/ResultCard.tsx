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
            ${isSafe 
              ? 'bg-emerald-600 text-white border-emerald-700' 
              : 'bg-rose-600 text-white border-rose-700'} 
            border-2 rounded-lg p-6 mb-6 shadow-lg
          `}>
            <div className="flex items-center mb-3">
              {isSafe ? (
                <CheckCircle2 className="w-8 h-8 text-white mr-3 animate-pulse-subtle" />
              ) : (
                <AlertCircle className="w-8 h-8 text-white mr-3 animate-pulse-subtle" />
              )}
              <h2 className="text-2xl font-bold text-white">
                {isSafe ? 'SAFE TO CONSUME' : 'NOT SAFE'}
              </h2>
            </div>
            <p className="text-white text-lg ml-11">
              {isSafe 
                ? "This product does not contain any of your allergens or restrictions." 
                : "This product contains ingredients that match your allergens or restrictions."
              }
            </p>
          </div>
        </Pop>
      )}
      
      <SlideUp duration={0.5} delay={0.1}>
        <Card className="mb-5 shadow-lg overflow-hidden border-2 border-gray-300 bg-white">
          <CardHeader className="p-4 bg-gray-100">
            <CardTitle className="text-lg font-bold">Product Information</CardTitle>
          </CardHeader>
          
          <CardContent className="p-4 pt-4 flex items-start space-x-3 bg-white">
            <div className="w-18 h-18 bg-gray-100 rounded-md overflow-hidden shadow-md border border-gray-300">
              {result.imageUrl && (
                <img 
                  src={result.imageUrl} 
                  alt={`Thumbnail of ${productName}`} 
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-gray-900">{productName}</h3>
              <p className="text-sm text-gray-500">
                Scanned on {format(new Date(result.timestamp), 'MMMM d, yyyy')}
              </p>
            </div>
          </CardContent>
          
          {detectedAllergens.length > 0 && (
            <div className="mt-2">
              <CardHeader className="p-3 border-t-2 border-b-2 border-gray-200 bg-rose-50">
                <CardTitle className="text-rose-800 text-base font-bold">
                  DETECTED ALLERGENS
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 bg-white">
                <StaggeredList className="space-y-3" staggerDelay={0.1}>
                  {detectedAllergens.map((allergen, index) => (
                    <div key={index} className={`flex items-start p-3 rounded-lg border-l-4 ${
                      allergen.severity === 'unsafe' ? 
                        'border-l-rose-500 bg-rose-50' : 
                        'border-l-amber-500 bg-amber-50'
                    }`}>
                      <div className="mr-3 mt-0.5">
                        {allergen.severity === 'unsafe' ? (
                          <XCircle className="w-5 h-5 text-rose-600" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-amber-600" />
                        )}
                      </div>
                      <div>
                        <h5 className="font-bold text-gray-900">
                          {allergen.severity === 'caution' ? `May contain ${allergen.name}` : allergen.name}
                        </h5>
                        <p className="text-sm text-gray-700">Found in ingredients: <span className="font-medium">{allergen.found}</span></p>
                      </div>
                    </div>
                  ))}
                </StaggeredList>
              </CardContent>
            </div>
          )}
          
          <CardHeader className="p-3 border-t-2 border-b-2 border-gray-200 bg-gray-100">
            <CardTitle className="text-gray-700 text-base font-bold">
              FULL INGREDIENTS LIST
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-4 bg-white">
            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-200">
              {ingredients}
            </p>
          </CardContent>
        </Card>
      </SlideUp>
      
      <SlideUp duration={0.5} delay={0.2}>
        <Card className="mb-6 shadow-lg overflow-hidden border-2 border-primary-300 bg-white">
          <CardHeader className="p-3 bg-primary-100">
            <CardTitle className="text-primary-800 text-base font-bold">AI RECOMMENDATION</CardTitle>
          </CardHeader>
          
          <CardContent className="p-4 bg-white">
            <p className="text-gray-700 mb-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
              {recommendation}
            </p>
            {alternativeSuggestion && (
              <FadeIn delay={0.3}>
                <div className="bg-primary-100 p-4 rounded-lg border border-primary-300 shadow">
                  <h5 className="font-bold text-primary-800 mb-2">Alternative Suggestions</h5>
                  <p className="text-primary-700">{alternativeSuggestion}</p>
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
