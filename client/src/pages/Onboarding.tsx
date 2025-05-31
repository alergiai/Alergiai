import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Heart,
  Shield,
  Clock,
  Zap,
  Utensils,
  Apple,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import Header from "@/components/Header";
import { useAllergens } from "@/hooks/useAllergens";
import { Allergen, AllergenCategory } from "@/types";
import { FadeIn, SlideUp, Pop } from "@/components/ui/animations";

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
    reason: "",
    hasStruggles: false,
    features: [],
    selectedAllergens: [],
  });
  const { allergenGroups, toggleAllergen, getSelectedAllergens } =
    useAllergens();

  const reasons = [
    {
      id: "health",
      label: "I have food allergies or health conditions",
      icon: AlertTriangle,
      color: "bg-red-100 text-red-600",
    },
    {
      id: "family",
      label: "I need to track what my family eats",
      icon: Shield,
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: "time",
      label: "I want to save time while shopping",
      icon: Clock,
      color: "bg-green-100 text-green-600",
    },
    {
      id: "peace",
      label: "I want peace of mind about food safety",
      icon: CheckCircle2,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  const features = [
    {
      id: "instant",
      label: "Instant ingredient analysis",
      icon: Zap,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      id: "alerts",
      label: "Real-time allergen alerts",
      icon: AlertTriangle,
      color: "bg-red-100 text-red-600",
    },
    {
      id: "history",
      label: "Scan history tracking",
      icon: Clock,
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: "suggestions",
      label: "Alternative product suggestions",
      icon: Sparkles,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  const handleReasonSelect = (reason: string) => {
    setData((prev) => ({ ...prev, reason }));
    setTimeout(() => setCurrentStep(2), 300);
  };

  const handleStruggleResponse = (hasStruggles: boolean) => {
    setData((prev) => ({ ...prev, hasStruggles }));
    setTimeout(() => setCurrentStep(3), 300);
  };

  const handleFeatureToggle = (feature: string) => {
    setData((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const handleAllergenToggle = (allergenId: string) => {
    toggleAllergen(allergenId);
    const selectedAllergens = getSelectedAllergens();
    const isSelected = selectedAllergens.some((a) => a.id === allergenId);
    setData((prev) => ({
      ...prev,
      selectedAllergens: isSelected
        ? [...prev.selectedAllergens, allergenId]
        : prev.selectedAllergens.filter((id) => id !== allergenId),
    }));
  };

  const completeOnboarding = () => {
    const selectedAllergens = getSelectedAllergens();
    setData((prev) => ({
      ...prev,
      selectedAllergens: selectedAllergens.map((a) => a.id),
    }));
    localStorage.setItem("onboarding_completed", "true");
    localStorage.setItem("onboarding_data", JSON.stringify(data));
    setCurrentStep(5);
  };

  const startFreeTrial = () => {
    localStorage.setItem("free_trial_started", "true");
    setLocation("/");
  };

  const continueFree = () => {
    setLocation("/");
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Welcome
        return (
          <FadeIn>
            <div className="text-center space-y-6">
              <div className="mb-8">
                <Header />
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                Your AI-powered food safety companion that scans ingredients and
                alerts you to allergens in seconds.
              </p>
              <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                <p className="text-primary font-medium">
                  🍎 Scan any food product instantly
                  <br />
                  🛡️ Get personalized safety alerts
                  <br />⚡ Make confident food choices
                </p>
              </div>
              <Button
                onClick={() => setCurrentStep(1)}
                className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white py-4 text-lg font-semibold shadow-lg"
              >
                Start Your Food Safety Journey
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
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Apple className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  What brings you to  Alergi.AI?
                </h2>
                <p className="text-gray-600">
                  Help us understand your food journey
                </p>
              </div>
              <div className="space-y-3">
                {reasons.map((reason) => {
                  const Icon = reason.icon;
                  return (
                    <SlideUp
                      key={reason.id}
                      delay={reasons.indexOf(reason) * 0.1}
                    >
                      <Card
                        className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 hover:border-primary/30"
                        onClick={() => handleReasonSelect(reason.id)}
                      >
                        <CardContent className="p-4 flex items-center space-x-4">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center ${reason.color}`}
                          >
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {reason.label}
                            </p>
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
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Ever struggled reading tiny ingredient labels while shopping?
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  Many shoppers spend minutes squinting at ingredient lists,
                  trying to spot allergens in complex chemical names and fine
                  print.
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border">
                <p className="text-sm text-gray-700 italic">
                  "Contains: Wheat flour, milk powder, soy lecithin, natural
                  flavors, sodium metabisulfite..."
                </p>
              </div>
              <div className="space-y-4">
                <Button
                  onClick={() => handleStruggleResponse(true)}
                  className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white py-4 font-semibold"
                >
                  Yes, it's frustrating and time-consuming
                </Button>
                <Button
                  onClick={() => handleStruggleResponse(false)}
                  variant="outline"
                  className="w-full py-4 border-2 hover:bg-gray-50"
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
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Which food safety features excite you most?
                </h2>
                <p className="text-gray-600">
                  Select what would make your grocery shopping easier
                </p>
              </div>
              <div className="space-y-3">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <SlideUp key={feature.id} delay={index * 0.1}>
                      <Card
                        className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
                          data.features.includes(feature.id)
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-gray-200 hover:border-primary/30"
                        }`}
                        onClick={() => handleFeatureToggle(feature.id)}
                      >
                        <CardContent className="p-4 flex items-center space-x-4">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${feature.color}`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <p className="flex-1 font-medium text-gray-900">
                            {feature.label}
                          </p>
                          <Checkbox
                            checked={data.features.includes(feature.id)}
                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                        </CardContent>
                      </Card>
                    </SlideUp>
                  );
                })}
              </div>
              <Button
                onClick={() => setCurrentStep(4)}
                disabled={data.features.length === 0}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-4 mt-8 font-semibold"
              >
                Continue to Safety Setup
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
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Create your personal food safety profile
                </h2>
                <p className="text-gray-600">
                  Tell us what ingredients to watch out for in your scans
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
                              ? "border-purple-500 bg-purple-50"
                              : "border-gray-200 hover:border-purple-200"
                          }`}
                          onClick={() => handleAllergenToggle(allergen.id)}
                        >
                          <CardContent className="p-3 flex items-center space-x-2">
                            <Checkbox
                              checked={allergen.selected}
                              className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                            />
                            <span className="text-sm font-medium">
                              {allergen.name}
                            </span>
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
                  className="flex-1 bg-primary hover:bg-primary/90 text-white"
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
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Your food safety profile is ready!
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Perfect! Alergi.AI will now scan ingredients and instantly alert
                you to{" "}
                {data.selectedAllergens.length > 0
                  ? `your ${data.selectedAllergens.length} selected allergen${data.selectedAllergens.length > 1 ? "s" : ""}`
                  : "any potential food safety concerns"}{" "}
                in every product you scan.
              </p>
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <p className="text-green-800 font-medium text-sm">
                  🎯 Personalized safety alerts
                  <br />
                  ⚡ Instant ingredient analysis
                  <br />
                  🛡️ Confident food choices
                </p>
              </div>
              <Button
                onClick={() => setCurrentStep(6)}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 font-semibold"
              >
                Continue to Premium Features
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </Pop>
        );

      case 6: // Free trial offer
        return (
          <FadeIn>
            <div className="text-center space-y-6">
              <div className="mb-4">
                <Header />
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Unlock the full power of food safety AI
                </h2>
                <p className="text-gray-600 mb-4">
                  Your safety profile is ready. Now experience premium
                  AI-powered ingredient analysis with unlimited scans and
                  advanced safety features.
                </p>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 mb-6 border border-purple-200">
                  <div className="flex items-center justify-center mb-3">
                    <Utensils className="w-5 h-5 text-purple-600 mr-2" />
                    <h3 className="font-bold text-purple-900">
                      Premium Food Safety Features
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm text-purple-800">
                    <div className="flex items-center">
                      <Zap className="w-4 h-4 mr-2" />
                      Unlimited scans
                    </div>
                    <div className="flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Advanced alerts
                    </div>
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 mr-2" />
                      Detailed analysis
                    </div>
                    <div className="flex items-center">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Smart suggestions
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <Button
                  onClick={startFreeTrial}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-4 text-lg font-bold shadow-lg"
                >
                  Start Free Trial
                  <Sparkles className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  onClick={continueFree}
                  variant="outline"
                  className="w-full py-3 border-2 hover:bg-gray-50"
                >
                  Continue with Basic Plan
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Basic plan includes limited scans with essential safety features
              </p>
            </div>
          </FadeIn>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardContent className="p-8">{renderStep()}</CardContent>
        </Card>

        {/* Progress indicator */}
        {currentStep > 0 && currentStep < 6 && (
          <div className="mt-6 flex justify-center">
            <div className="flex space-x-2">
              {Array.from({ length: 5 }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i < currentStep ? "bg-primary" : "bg-gray-300"
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
