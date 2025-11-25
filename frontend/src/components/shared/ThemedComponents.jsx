/**
 * Shared Themed Components
 * 
 * Import these components instead of creating your own styled components.
 * They automatically use system settings from SystemSettings.jsx
 * 
 * Usage:
 *   import { GlassCard, ProfessionalButton, ModernTextField, PremiumTableContainer, PremiumTableCell } from '../shared/ThemedComponents';
 */

import React from 'react';
import { styled } from '@mui/material/styles';
import { Card, Button, TextField, TableContainer, TableCell } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useSystemSettings } from '../../hooks/useSystemSettings';

/**
 * GlassCard - Themed card component
 * Automatically uses system settings for colors
 */
export const GlassCard = styled(Card)(() => {
  const { settings } = useSystemSettings();
  
  return {
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
  };
});

/**
 * ProfessionalButton - Themed button component
 * Supports 'contained' and 'outlined' variants
 */
export const ProfessionalButton = styled(Button)(({ variant = 'contained' }) => {
  const { settings } = useSystemSettings();
  
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

  // Outlined variant
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
});

/**
 * ModernTextField - Themed text field component
 */
export const ModernTextField = styled(TextField)(() => {
  const { settings } = useSystemSettings();
  
  return {
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
  };
});

/**
 * PremiumTableContainer - Themed table container
 */
export const PremiumTableContainer = styled(TableContainer)(() => {
  const { settings } = useSystemSettings();
  
  return {
    borderRadius: 16,
    overflow: 'hidden',
    boxShadow: `0 4px 24px ${alpha(settings.primaryColor || '#894444', 0.06)}`,
    border: `1px solid ${alpha(settings.primaryColor || '#894444', 0.08)}`,
  };
});

/**
 * PremiumTableCell - Themed table cell
 * Supports isHeader prop for header styling
 */
export const PremiumTableCell = styled(TableCell)(({ isHeader = false }) => {
  const { settings } = useSystemSettings();
  
  return {
    fontWeight: isHeader ? 600 : 500,
    padding: '18px 20px',
    borderBottom: isHeader 
      ? `2px solid ${alpha(settings.accentColor || '#FEF9E1', 0.5)}` 
      : `1px solid ${alpha(settings.primaryColor || '#894444', 0.06)}`,
    fontSize: '0.95rem',
    letterSpacing: '0.025em',
    ...(isHeader && {
      backgroundColor: settings.primaryColor || '#894444',
      color: settings.textColor || '#FFFFFF',
    }),
  };
});

/**
 * Helper function to get theme colors
 * Use this if you need colors directly in your component
 */
export const useThemeColors = () => {
  const { settings } = useSystemSettings();
  
  return {
    primaryColor: settings.primaryColor || '#894444',
    secondaryColor: settings.secondaryColor || '#6d2323',
    accentColor: settings.accentColor || '#FEF9E1',
    textColor: settings.textColor || '#FFFFFF',
    textPrimaryColor: settings.textPrimaryColor || '#6D2323',
    textSecondaryColor: settings.textSecondaryColor || '#FEF9E1',
    hoverColor: settings.hoverColor || '#6D2323',
    backgroundColor: settings.backgroundColor || '#FFFFFF',
    blackColor: '#1a1a1a',
    whiteColor: '#FFFFFF',
    grayColor: '#6c757d',
  };
};




