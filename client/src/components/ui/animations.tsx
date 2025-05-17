import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Fade In Animation
interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export const FadeIn: React.FC<FadeInProps> = ({ 
  children, 
  delay = 0, 
  duration = 0.3,
  className = "" 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Slide Up Animation
interface SlideUpProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export const SlideUp: React.FC<SlideUpProps> = ({ 
  children, 
  delay = 0, 
  duration = 0.4,
  className = "" 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ 
        duration, 
        delay,
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Pop Animation
interface PopProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export const Pop: React.FC<PopProps> = ({ 
  children, 
  delay = 0, 
  duration = 0.3,
  className = "" 
}) => {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{ 
        duration, 
        delay,
        type: "spring",
        stiffness: 300,
        damping: 20
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Page Transition
interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ 
  children,
  className = "" 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ 
        duration: 0.3,
        type: "tween",
        ease: "easeInOut"
      }}
      className={`w-full ${className}`}
    >
      {children}
    </motion.div>
  );
};

// Staggered List Animation
interface StaggeredListProps {
  children: React.ReactNode[];
  delay?: number;
  staggerDelay?: number;
  className?: string;
}

export const StaggeredList: React.FC<StaggeredListProps> = ({
  children,
  delay = 0,
  staggerDelay = 0.05,
  className = ""
}) => {
  return (
    <div className={className}>
      <AnimatePresence>
        {React.Children.map(children, (child, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{
              delay: delay + i * staggerDelay,
              duration: 0.3,
              ease: "easeOut"
            }}
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Animated Container with Motion Functionality
interface AnimatedContainerProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  className = "",
  onClick
}) => {
  return (
    <motion.div
      className={className}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};

// Animated Button - Provides interactive feedback
interface AnimatedButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  className = "",
  onClick,
  disabled = false
}) => {
  return (
    <motion.button
      className={className}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.03 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      transition={{ 
        duration: 0.2,
        type: "spring",
        stiffness: 400
      }}
    >
      {children}
    </motion.button>
  );
};