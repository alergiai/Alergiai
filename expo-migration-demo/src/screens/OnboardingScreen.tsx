import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAllergens } from '../hooks/useAllergens';
import { Allergen } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface OnboardingData {
  reason: string;
  hasStruggles: boolean;
  features: string[];
  selectedAllergens: string[];
}

const OnboardingScreen = () => {
  const navigation = useNavigation();
  const { allergens, updateAllergen, addCustomAllergen } = useAllergens();

  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    reason: '',
    hasStruggles: false,
    features: [],
    selectedAllergens: [],
  });
  const [customAllergenInput, setCustomAllergenInput] = useState('');

  const steps = [
    'welcome',
    'reason',
    'struggles', 
    'features',
    'allergens',
    'custom',
    'complete'
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCompleteOnboarding = async () => {
    try {
      // Mark onboarding as complete
      await AsyncStorage.setItem('onboarding_completed', 'true');
      
      // Navigate to main app
      navigation.navigate('Home');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  };

  const handleReasonSelect = (reason: string) => {
    setOnboardingData(prev => ({ ...prev, reason }));
    setTimeout(handleNext, 300);
  };

  const handleStrugglesSelect = (hasStruggles: boolean) => {
    setOnboardingData(prev => ({ ...prev, hasStruggles }));
    setTimeout(handleNext, 300);
  };

  const handleFeatureToggle = (feature: string) => {
    setOnboardingData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleAllergenToggle = async (allergenId: string) => {
    const allergen = allergens.find(a => a.id === allergenId);
    if (allergen) {
      await updateAllergen(allergenId, !allergen.selected);
    }
  };

  const handleAddCustomAllergen = async () => {
    const trimmedInput = customAllergenInput.trim();
    if (trimmedInput) {
      await addCustomAllergen(trimmedInput);
      setCustomAllergenInput('');
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill,
            { width: `${((currentStep + 1) / steps.length) * 100}%` }
          ]}
        />
      </View>
      <Text style={styles.stepCounter}>
        {currentStep + 1} of {steps.length}
      </Text>
    </View>
  );

  const renderWelcomeStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.welcomeTitle}>Welcome to Alergi.AI! 🎉</Text>
      <Text style={styles.welcomeSubtitle}>
        Your AI-powered food safety companion
      </Text>
      <Text style={styles.description}>
        We'll help you scan food products and identify allergens, intolerances, 
        and dietary restrictions that matter to you.
      </Text>
      <Text style={styles.description}>
        Let's get you set up in just a few quick steps.
      </Text>
    </View>
  );

  const renderReasonStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What brings you to Alergi.AI?</Text>
      <Text style={styles.stepSubtitle}>Help us understand your needs</Text>
      
      <View style={styles.optionsContainer}>
        {[
          'I have food allergies',
          'Dietary restrictions (vegan, keto, etc.)',
          'Religious/cultural dietary needs',
          'Family member has allergies',
          'General food safety awareness'
        ].map((option) => (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              onboardingData.reason === option && styles.optionButtonSelected
            ]}
            onPress={() => handleReasonSelect(option)}
          >
            <Text style={[
              styles.optionText,
              onboardingData.reason === option && styles.optionTextSelected
            ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderStrugglesStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Do you struggle with reading food labels?</Text>
      <Text style={styles.stepSubtitle}>
        Many people find ingredient lists confusing or hard to read
      </Text>
      
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[
            styles.optionButton,
            onboardingData.hasStruggles === true && styles.optionButtonSelected
          ]}
          onPress={() => handleStrugglesSelect(true)}
        >
          <Text style={[
            styles.optionText,
            onboardingData.hasStruggles === true && styles.optionTextSelected
          ]}>
            Yes, it's often overwhelming
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.optionButton,
            onboardingData.hasStruggles === false && styles.optionButtonSelected
          ]}
          onPress={() => handleStrugglesSelect(false)}
        >
          <Text style={[
            styles.optionText,
            onboardingData.hasStruggles === false && styles.optionTextSelected
          ]}>
            No, but I want to be more careful
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFeaturesStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>What features interest you most?</Text>
      <Text style={styles.stepSubtitle}>Select all that apply</Text>
      
      <View style={styles.optionsContainer}>
        {[
          'Instant allergen detection',
          'Alternative product suggestions',
          'Scan history tracking',
          'Custom allergen alerts',
          'Ingredient analysis'
        ].map((feature) => (
          <TouchableOpacity
            key={feature}
            style={[
              styles.checkboxButton,
              onboardingData.features.includes(feature) && styles.checkboxButtonSelected
            ]}
            onPress={() => handleFeatureToggle(feature)}
          >
            <View style={[
              styles.checkbox,
              onboardingData.features.includes(feature) && styles.checkboxSelected
            ]}>
              {onboardingData.features.includes(feature) && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>
            <Text style={styles.checkboxText}>{feature}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderAllergensStep = () => {
    const commonAllergens = allergens.filter(a => a.category === 'common');
    const otherAllergens = allergens.filter(a => a.category !== 'common' && a.category !== 'custom');
    
    return (
      <ScrollView style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Select your allergens & restrictions</Text>
        <Text style={styles.stepSubtitle}>
          Choose everything you need to avoid
        </Text>
        
        {/* Common Allergens */}
        <Text style={styles.sectionTitle}>Common Allergens</Text>
        <View style={styles.allergensGrid}>
          {commonAllergens.map((allergen) => (
            <TouchableOpacity
              key={allergen.id}
              style={[
                styles.allergenChip,
                allergen.selected && styles.allergenChipSelected
              ]}
              onPress={() => handleAllergenToggle(allergen.id)}
            >
              <Text style={[
                styles.allergenChipText,
                allergen.selected && styles.allergenChipTextSelected
              ]}>
                {allergen.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Other Restrictions */}
        {otherAllergens.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Other Restrictions</Text>
            <View style={styles.allergensGrid}>
              {otherAllergens.map((allergen) => (
                <TouchableOpacity
                  key={allergen.id}
                  style={[
                    styles.allergenChip,
                    allergen.selected && styles.allergenChipSelected
                  ]}
                  onPress={() => handleAllergenToggle(allergen.id)}
                >
                  <Text style={[
                    styles.allergenChipText,
                    allergen.selected && styles.allergenChipTextSelected
                  ]}>
                    {allergen.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    );
  };

  const renderCustomStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Any custom restrictions?</Text>
      <Text style={styles.stepSubtitle}>
        Add anything specific that's not listed above
      </Text>
      
      <View style={styles.customInputContainer}>
        <TextInput
          style={styles.customInput}
          placeholder="e.g., Artificial colors, MSG, Caffeine..."
          value={customAllergenInput}
          onChangeText={setCustomAllergenInput}
          onSubmitEditing={handleAddCustomAllergen}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[
            styles.addButton,
            !customAllergenInput.trim() && styles.addButtonDisabled
          ]}
          onPress={handleAddCustomAllergen}
          disabled={!customAllergenInput.trim()}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Display custom allergens */}
      <View style={styles.customAllergensContainer}>
        {allergens
          .filter(a => a.category === 'custom')
          .map((allergen) => (
            <View key={allergen.id} style={styles.customAllergenTag}>
              <Text style={styles.customAllergenText}>{allergen.name}</Text>
            </View>
          ))}
      </View>
    </View>
  );

  const renderCompleteStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.completeTitle}>You're all set! 🎊</Text>
      <Text style={styles.completeSubtitle}>
        Alergi.AI is ready to help you scan food products safely
      </Text>
      
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Quick Summary:</Text>
        <Text style={styles.summaryText}>
          • {allergens.filter(a => a.selected).length} allergens/restrictions selected
        </Text>
        <Text style={styles.summaryText}>
          • Instant AI-powered ingredient analysis
        </Text>
        <Text style={styles.summaryText}>
          • Up to 100 scans in your history
        </Text>
        <Text style={styles.summaryText}>
          • Safe & unsafe product identification
        </Text>
      </View>
    </View>
  );

  const getCurrentStepContent = () => {
    switch (steps[currentStep]) {
      case 'welcome': return renderWelcomeStep();
      case 'reason': return renderReasonStep();
      case 'struggles': return renderStrugglesStep();
      case 'features': return renderFeaturesStep();
      case 'allergens': return renderAllergensStep();
      case 'custom': return renderCustomStep();
      case 'complete': return renderCompleteStep();
      default: return renderWelcomeStep();
    }
  };

  const canProceed = () => {
    switch (steps[currentStep]) {
      case 'reason': return onboardingData.reason !== '';
      case 'struggles': return onboardingData.hasStruggles !== undefined;
      default: return true;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderProgressBar()}
      
      <View style={styles.content}>
        {getCurrentStepContent()}
      </View>

      {/* Navigation buttons */}
      <View style={styles.navigationContainer}>
        {currentStep > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[
            styles.nextButton,
            !canProceed() && styles.nextButtonDisabled
          ]}
          onPress={currentStep === steps.length - 1 ? handleCompleteOnboarding : handleNext}
          disabled={!canProceed()}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  progressContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7C3AED',
    borderRadius: 2,
  },
  stepCounter: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContainer: {
    flex: 1,
    paddingTop: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 18,
    color: '#7C3AED',
    textAlign: 'center',
    marginBottom: 32,
    fontWeight: '600',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  optionButtonSelected: {
    backgroundColor: '#ede9fe',
    borderColor: '#7C3AED',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#7C3AED',
    fontWeight: '600',
  },
  checkboxButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  checkboxButtonSelected: {
    backgroundColor: '#f3f4f6',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxText: {
    fontSize: 16,
    color: '#374151',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
    marginTop: 8,
  },
  allergensGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  allergenChip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  allergenChipSelected: {
    backgroundColor: '#7C3AED',
    borderColor: '#5b21b6',
  },
  allergenChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  allergenChipTextSelected: {
    color: 'white',
  },
  customInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  customInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 12,
  },
  addButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  customAllergensContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  customAllergenTag: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  customAllergenText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  completeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  completeSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  summaryContainer: {
    backgroundColor: '#f9fafb',
    padding: 20,
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 6,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  backButtonText: {
    color: '#374151',
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  nextButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default OnboardingScreen;