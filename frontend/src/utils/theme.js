import { alpha } from '@mui/material/styles';

/**
 * Theme utility functions for creating styled components with system settings
 */

/**
 * Get theme colors from system settings
 */
export const getThemeColors = (settings) => ({
  primary: settings.primaryColor || '#894444',
  secondary: settings.secondaryColor || '#6d2323',
  accent: settings.accentColor || '#FEF9E1',
  text: settings.textColor || '#FFFFFF',
  textPrimary: settings.textPrimaryColor || '#6D2323',
  textSecondary: settings.textSecondaryColor || '#FEF9E1',
  hover: settings.hoverColor || '#6D2323',
  background: settings.backgroundColor || '#FFFFFF',
});

/**
 * Create a styled card with system theme
 */
export const createThemedCard = (settings) => ({
  borderRadius: 20,
  background: settings.backgroundColor || '#FFFFFF',
  backdropFilter: 'blur(10px)',
  boxShadow: `0 8px 40px ${alpha(settings.primaryColor || '#894444', 0.08)}`,
  border: `1px solid ${alpha(settings.primaryColor || '#894444', 0.1)}`,
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    boxShadow: `0 12px 48px ${alpha(settings.primaryColor || '#894444', 0.15)}`,
    transform: 'translateY(-4px)',
  },
});

/**
 * Create a styled button with system theme
 */
export const createThemedButton = (settings, variant = 'contained') => {
  const base = {
    borderRadius: 12,
    fontWeight: 600,
    padding: '12px 24px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    textTransform: 'none',
    fontSize: '0.95rem',
    letterSpacing: '0.025em',
    '&:hover': {
      transform: 'translateY(-2px)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
  };

  if (variant === 'contained') {
    return {
      ...base,
      backgroundColor: settings.primaryColor || '#894444',
      color: settings.textColor || '#FFFFFF',
      boxShadow: `0 4px 14px ${alpha(settings.accentColor || '#FEF9E1', 0.25)}`,
      '&:hover': {
        ...base['&:hover'],
        backgroundColor: settings.hoverColor || settings.secondaryColor || '#6d2323',
        boxShadow: `0 6px 20px ${alpha(settings.accentColor || '#FEF9E1', 0.35)}`,
      },
    };
  }

  if (variant === 'outlined') {
    return {
      ...base,
      borderColor: settings.primaryColor || '#894444',
      color: settings.textPrimaryColor || settings.primaryColor || '#894444',
      '&:hover': {
        ...base['&:hover'],
        borderColor: settings.hoverColor || settings.secondaryColor || '#6d2323',
        backgroundColor: alpha(settings.accentColor || '#FEF9E1', 0.1),
      },
    };
  }

  return base;
};

/**
 * Create a styled text field with system theme
 */
export const createThemedTextField = (settings) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    backgroundColor: settings.backgroundColor || '#FFFFFF',
    '&:hover': {
      transform: 'translateY(-1px)',
      backgroundColor: settings.backgroundColor || '#FFFFFF',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    },
    '&.Mui-focused': {
      transform: 'translateY(-1px)',
      boxShadow: `0 4px 20px ${alpha(settings.primaryColor || '#894444', 0.15)}`,
      backgroundColor: settings.backgroundColor || '#FFFFFF',
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
    color: settings.textPrimaryColor || '#6D2323',
  },
});

/**
 * Create gradient background with system colors
 */
export const createGradient = (settings, direction = '135deg') => {
  return `linear-gradient(${direction}, ${settings.primaryColor || '#894444'} 0%, ${settings.secondaryColor || '#6d2323'} 100%)`;
};

/**
 * Create shadow with system colors
 */
export const createShadow = (settings, intensity = 'medium') => {
  const shadows = {
    light: `0 2px 8px ${alpha(settings.primaryColor || '#894444', 0.08)}`,
    medium: `0 4px 16px ${alpha(settings.primaryColor || '#894444', 0.12)}`,
    heavy: `0 8px 24px ${alpha(settings.primaryColor || '#894444', 0.16)}`,
    colored: `0 4px 16px ${alpha(settings.primaryColor || '#894444', 0.2)}`,
  };
  return shadows[intensity] || shadows.medium;
};

/**
 * Get text color based on background
 */
export const getContrastText = (backgroundColor) => {
  // Simple contrast calculation
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#FFFFFF';
};

/**
 * Create table head styles with system theme
 */
export const createThemedTableHead = (settings) => ({
  '& .MuiTableCell-head': {
    backgroundColor: settings.primaryColor || '#894444',
    color: settings.textColor || '#FFFFFF',
    fontWeight: 'bold',
  },
});

/**
 * Create chip styles with system theme
 */
export const createThemedChip = (settings) => ({
  backgroundColor: settings.accentColor || '#FEF9E1',
  color: settings.textPrimaryColor || '#6D2323',
});

/**
 * Create app bar styles with system theme
 */
export const createThemedAppBar = (settings) => ({
  backgroundColor: settings.secondaryColor || settings.primaryColor || '#6d2323',
  color: settings.textColor || '#FFFFFF',
});

/**
 * Create footer styles with system theme
 */
export const createThemedFooter = (settings) => ({
  backgroundColor: settings.secondaryColor || settings.primaryColor || '#6d2323',
  color: settings.textColor || '#FFFFFF',
});




