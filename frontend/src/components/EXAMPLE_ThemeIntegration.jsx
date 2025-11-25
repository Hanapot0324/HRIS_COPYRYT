/**
 * EXAMPLE COMPONENT - Shows how to integrate SystemSettings theme
 * 
 * This file demonstrates how to update existing components to use the
 * centralized theme system from SystemSettings.jsx
 * 
 * Copy the patterns from this file to update your components.
 */

import React from 'react';
import { styled } from '@mui/material/styles';
import { Card, Button, TextField, Box, TableHead, TableCell } from '@mui/material';
import { alpha } from '@mui/material/styles';

// STEP 1: Import the hook
import { useSystemSettings } from '../hooks/useSystemSettings';

// STEP 2: Import theme utilities (optional, but recommended)
import {
  createThemedCard,
  createThemedButton,
  createThemedTextField,
  createThemedTableHead,
  createShadow,
  createGradient,
} from '../utils/theme';

// ============================================
// PATTERN 1: Using theme utilities
// ============================================

function ExampleWithThemeUtilities() {
  const { settings } = useSystemSettings();

  // Create styled components using utilities
  const ThemedCard = styled(Card)(() => createThemedCard(settings));
  const ThemedButton = styled(Button)(() => createThemedButton(settings, 'contained'));
  const ThemedTextField = styled(TextField)(() => createThemedTextField(settings));

  return (
    <ThemedCard>
      <ThemedButton>Click me</ThemedButton>
      <ThemedTextField label="Enter text" />
    </ThemedCard>
  );
}

// ============================================
// PATTERN 2: Direct usage in styled components
// ============================================

function ExampleWithDirectUsage() {
  const { settings } = useSystemSettings();

  // Create styled components directly with settings
  const StyledCard = styled(Card)(({ theme }) => ({
    borderRadius: 20,
    background: settings.backgroundColor,
    boxShadow: createShadow(settings, 'medium'),
    border: `1px solid ${alpha(settings.primaryColor, 0.1)}`,
    '&:hover': {
      boxShadow: createShadow(settings, 'heavy'),
      transform: 'translateY(-4px)',
    },
  }));

  const StyledButton = styled(Button)(({ theme }) => ({
    backgroundColor: settings.primaryColor,
    color: settings.textColor,
    '&:hover': {
      backgroundColor: settings.hoverColor,
    },
  }));

  return (
    <StyledCard>
      <StyledButton>Click me</StyledButton>
    </StyledCard>
  );
}

// ============================================
// PATTERN 3: Using sx prop (most flexible)
// ============================================

function ExampleWithSxProp() {
  const { settings } = useSystemSettings();

  return (
    <Box
      sx={{
        background: createGradient(settings),
        color: settings.textColor,
        p: 3,
        borderRadius: 2,
        '&:hover': {
          background: settings.hoverColor,
        },
      }}
    >
      <Button
        sx={{
          bgcolor: settings.primaryColor,
          color: settings.textColor,
          '&:hover': {
            bgcolor: settings.hoverColor,
          },
        }}
      >
        Click me
      </Button>
    </Box>
  );
}

// ============================================
// PATTERN 4: Updating existing hardcoded components
// ============================================

// BEFORE (hardcoded):
/*
const GlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(254, 249, 225, 0.95)',
  boxShadow: '0 8px 40px rgba(109, 35, 35, 0.08)',
  border: '1px solid rgba(109, 35, 35, 0.1)',
}));
*/

// AFTER (using system settings):
function ExampleUpdatedComponent() {
  const { settings } = useSystemSettings();

  const GlassCard = styled(Card)(({ theme }) => ({
    background: settings.backgroundColor,
    boxShadow: createShadow(settings, 'medium'),
    border: `1px solid ${alpha(settings.primaryColor, 0.1)}`,
    '&:hover': {
      boxShadow: createShadow(settings, 'heavy'),
    },
  }));

  return <GlassCard>Content</GlassCard>;
}

// ============================================
// PATTERN 5: Table components
// ============================================

function ExampleTableComponent() {
  const { settings } = useSystemSettings();

  const ThemedTableHead = styled(TableHead)(() => createThemedTableHead(settings));

  const ThemedTableCell = styled(TableCell)(({ theme }) => ({
    backgroundColor: settings.primaryColor,
    color: settings.textColor,
    fontWeight: 'bold',
  }));

  return (
    <ThemedTableHead>
      <ThemedTableCell>Header</ThemedTableCell>
    </ThemedTableHead>
  );
}

// ============================================
// PATTERN 6: Using institution information
// ============================================

function ExampleWithInstitutionInfo() {
  const { settings } = useSystemSettings();

  return (
    <Box>
      <h1>{settings.institutionName}</h1>
      <p>{settings.systemName}</p>
      <p>{settings.footerText}</p>
      {settings.institutionLogo && (
        <img src={settings.institutionLogo} alt="Institution Logo" />
      )}
      {settings.hrisLogo && (
        <img src={settings.hrisLogo} alt="HRIS Logo" />
      )}
    </Box>
  );
}

// ============================================
// COMPLETE EXAMPLE: Full component update
// ============================================

export default function CompleteExample() {
  const { settings } = useSystemSettings();

  // Create all styled components
  const ThemedCard = styled(Card)(() => createThemedCard(settings));
  const ThemedButton = styled(Button)(() => createThemedButton(settings, 'contained'));
  const OutlinedButton = styled(Button)(() => createThemedButton(settings, 'outlined'));
  const ThemedTextField = styled(TextField)(() => createThemedTextField(settings));

  return (
    <Box sx={{ p: 3, bgcolor: settings.backgroundColor }}>
      <ThemedCard sx={{ p: 3, mb: 2 }}>
        <h2 style={{ color: settings.textPrimaryColor }}>
          {settings.systemName}
        </h2>
        <p style={{ color: settings.textPrimaryColor }}>
          {settings.institutionName}
        </p>
      </ThemedCard>

      <ThemedCard sx={{ p: 3 }}>
        <ThemedTextField
          label="Name"
          fullWidth
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', gap: 2 }}>
          <ThemedButton>Save</ThemedButton>
          <OutlinedButton>Cancel</OutlinedButton>
        </Box>
      </ThemedCard>
    </Box>
  );
}




