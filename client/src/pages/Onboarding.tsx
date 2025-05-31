import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ArrowRight, CheckCircle2, Heart, Shield, Clock, Zap } from 'lucide-react';
import { useAllergens } from '@/hooks/useAllergens';
import { Allergen, AllergenCategory } from '@/types';
import { FadeIn, SlideUp, Pop } from '@/components/ui/animations';

interface OnboardingData {
  reason: string;
  hasStruggles: boolean;
  features: string[];
  selectedAllergens: string[];
}

const Onboarding = () => {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    reason: '',
    hasStruggles: false,
    features: [],
    selectedAllergens: []
  });
  const { allergenGroups, toggleAllergen, getSelectedAllergens } = useAllergens();

  const reasons = [
    { id: 'health', label: 'I have food allergies or health conditions', icon: Heart },
    { id: 'family', label: 'I need to keep my family safe', icon: Shield },
    { id: 'time', label: 'I want to save time while shopping', icon: Clock },
    { id: 'peace', label: 'I want peace of mind about food safety', icon: CheckCircle2 }
  ];

  const features = [
    { id: 'instant', label: 'Instant ingredient analysis' },
    { id: 'alerts', label: 'Real-time allergen alerts' },
    { id: 'history', label: 'Scan history tracking' },
    { id: 'suggestions', label: 'Alternative product suggestions' }
  ];

  const handleReasonSelect = (reason: string) => {
    setData(prev => ({ ...prev, reason }));
    setTimeout(() => setCurrentStep(2), 300);
  };

  const handleStruggleResponse = (hasStruggles: boolean) => {
    setData(prev => ({ ...prev, hasStruggles }));
    setTimeout(() => setCurrentStep(3), 300);
  };

  const handleFeatureToggle = (feature: string) => {
    setData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleAllergenToggle = (allergenId: string) => {
    toggleAllergen(allergenId);
    const selectedAllergens = getSelectedAllergens();
    const isSelected = selectedAllergens.some(a => a.id === allergenId);
    setData(prev => ({
      ...prev,
      selectedAllergens: isSelected
        ? [...prev.selectedAllergens, allergenId]
        : prev.selectedAllergens.filter(id => id !== allergenId)
    }));
  };

  const completeOnboarding = () => {
    const selectedAllergens = getSelectedAllergens();
    setData(prev => ({ ...prev, selectedAllergens: selectedAllergens.map(a => a.id) }));
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.setItem('onboarding_data', JSON.stringify(data));
    setCurrentStep(5);
  };

  const startFreeTrial = () => {
    localStorage.setItem('free_trial_started', 'true');
    setLocation('/');
  };

  const continueFree = () => {
    setLocation('/');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Welcome
        return (
          <FadeIn>
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-purple-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome to Alergi.AI</h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Your personal food safety assistant that helps you make confident choices every time you shop.
              </p>
              <p className="text-base text-gray-500">
                Let's get to know you better so we can provide the most helpful experience.
              </p>
              <Button 
                onClick={() => setCurrentStep(1)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </FadeIn>
        );

      case 1: // Why using app
        return (
          <FadeIn>
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">What brings you here?</h2>
                <p className="text-gray-600">Understanding your needs helps us serve you better</p>
              </div>
              <div className="space-y-3">
                {reasons.map((reason) => {
                  const Icon = reason.icon;
                  return (
                    <SlideUp key={reason.id} delay={reasons.indexOf(reason) * 0.1}>
                      <Card 
                        className="cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] border-2 hover:border-purple-200"
                        onClick={() => handleReasonSelect(reason.id)}
                      >
                        <CardContent className="p-4 flex items-center space-x-4">
                          <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                            <Icon className="w-6 h-6 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{reason.label}</p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-400" />
                        </CardContent>
                      </Card>
                    </SlideUp>
                  );
                })}
              </div>
            </div>
          </FadeIn>
        );

      case 2: // Struggle with labels
        return (
          <FadeIn>
            <div className="text-center space-y-8">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <Zap className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Have you ever felt overwhelmed reading ingredient labels?
                </h2>
                <p className="text-gray-600">
                  You're not alone. Many people find it challenging to quickly identify potential allergens in long ingredient lists.
                </p>
              </div>
              <div className="space-y-4">
                <Button 
                  onClick={() => handleStruggleResponse(true)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3"
                >
                  Yes, it's been a real challenge
                </Button>
                <Button 
                  onClick={() => handleStruggleResponse(false)}
                  variant="outline"
                  className="w-full py-3"
                >
                  No, I usually manage fine
                </Button>
              </div>
            </div>
          </FadeIn>
        );

      case 3: // Features
        return (
          <FadeIn>
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">What matters most to you?</h2>
                <p className="text-gray-600">Select the features that would help you the most</p>
              </div>
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <SlideUp key={feature.id} delay={index * 0.1}>
                    <Card 
                      className={`cursor-pointer transition-all hover:shadow-md border-2 ${
                        data.features.includes(feature.id) 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-200 hover:border-purple-200'
                      }`}
                      onClick={() => handleFeatureToggle(feature.id)}
                    >
                      <CardContent className="p-4 flex items-center space-x-4">
                        <Checkbox 
                          checked={data.features.includes(feature.id)}
                          className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                        />
                        <p className="flex-1 font-medium text-gray-900">{feature.label}</p>
                      </CardContent>
                    </Card>
                  </SlideUp>
                ))}
              </div>
              <Button 
                onClick={() => setCurrentStep(4)}
                disabled={data.features.length === 0}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 mt-8"
              >
                Continue
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </FadeIn>
        );

      case 4: // Allergens
        return (
          <FadeIn>
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Set up your safety profile</h2>
                <p className="text-gray-600">
                  Select any allergens or dietary restrictions we should watch for
                </p>
              </div>
              
              <div className="space-y-6">
                {allergenGroups.map((group) => (
                  <div key={group.category}>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      {group.title}
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {group.allergens.map((allergen) => (
                        <Card 
                          key={allergen.id}
                          className={`cursor-pointer transition-all border-2 ${
                            allergen.selected 
                              ? 'border-purple-500 bg-purple-50' 
                              : 'border-gray-200 hover:border-purple-200'
                          }`}
                          onClick={() => handleAllergenToggle(allergen.id)}
                        >
                          <CardContent className="p-3 flex items-center space-x-2">
                            <Checkbox 
                              checked={allergen.selected}
                              className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                            />
                            <span className="text-sm font-medium">{allergen.name}</span>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex space-x-3 mt-8">
                <Button 
                  onClick={() => setCurrentStep(3)}
                  variant="outline"
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Back
                </Button>
                <Button 
                  onClick={completeOnboarding}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Complete Setup
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          </FadeIn>
        );

      case 5: // Setup complete
        return (
          <Pop>
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">You're all set!</h2>
              <p className="text-gray-600 leading-relaxed">
                Your personalized safety profile is ready. We'll now scan for {data.selectedAllergens.length > 0 ? `your ${data.selectedAllergens.length} selected allergen${data.selectedAllergens.length > 1 ? 's' : ''}` : 'any potential concerns'} and provide instant alerts.
              </p>
              <Button 
                onClick={() => setCurrentStep(6)}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
              >
                Continue
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </Pop>
        );

      case 6: // Free trial offer
        return (
          <FadeIn>
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Ready to experience Alergi.AI?
                </h2>
                <p className="text-gray-600 mb-4">
                  Start your free trial to unlock unlimited scans, detailed analysis, and premium safety features.
                </p>
                <div className="bg-purple-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-purple-900 mb-2">Free Trial Includes:</h3>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• Unlimited ingredient scans</li>
                    <li>• Advanced allergen detection</li>
                    <li>• Detailed safety recommendations</li>
                    <li>• Product alternative suggestions</li>
                  </ul>
                </div>
              </div>
              <div className="space-y-3">
                <Button 
                  onClick={startFreeTrial}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 text-lg font-semibold"
                >
                  Start Free Trial
                </Button>
                <Button 
                  onClick={continueFree}
                  variant="outline"
                  className="w-full py-3"
                >
                  Continue with Free Plan
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Free plan includes basic scanning with limited features
              </p>
            </div>
          </FadeIn>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardContent className="p-8">
            {renderStep()}
          </CardContent>
        </Card>
        
        {/* Progress indicator */}
        {currentStep > 0 && currentStep < 6 && (
          <div className="mt-6 flex justify-center">
            <div className="flex space-x-2">
              {Array.from({ length: 5 }, (_, i) => (
                <div 
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i < currentStep ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;