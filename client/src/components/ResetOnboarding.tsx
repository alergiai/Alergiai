import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

const ResetOnboarding = () => {
  const resetOnboarding = () => {
    if (window.confirm('This will reset your onboarding and reload the page. Continue?')) {
      localStorage.removeItem('onboarding_completed');
      localStorage.removeItem('onboarding_data');
      localStorage.removeItem('free_trial_started');
      window.location.reload();
    }
  };

  return (
    <Button
      onClick={resetOnboarding}
      variant="outline"
      size="sm"
      className="fixed top-4 right-4 z-50 bg-white shadow-md"
    >
      <RotateCcw className="w-4 h-4 mr-2" />
      Reset Onboarding
    </Button>
  );
};

export default ResetOnboarding;