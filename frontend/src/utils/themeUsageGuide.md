# System Settings Theme Usage Guide

This guide shows how to connect all components to the SystemSettings.jsx for easy palette customization.

## Quick Start

### 1. Import the hook in your component

```jsx
import { useSystemSettings } from '../hooks/useSystemSettings';
// or
import { useSystemSettings } from '../contexts/SystemSettingsContext';
```

### 2. Get settings in your component

```jsx
function MyComponent() {
  const { settings } = useSystemSettings();
  
  // Now you can use:
  // settings.primaryColor
  // settings.secondaryColor
  // settings.accentColor
  // settings.textColor
  // settings.textPrimaryColor
  // settings.textSecondaryColor
  // settings.hoverColor
  // settings.backgroundColor
  // settings.institutionName
  // settings.systemName
  // etc.
}
```

### 3. Use theme utilities for styled components

```jsx
import { styled } from '@mui/material/styles';
import { useSystemSettings } from '../hooks/useSystemSettings';
import { createThemedCard, createThemedButton } from '../utils/theme';

function MyComponent() {
  const { settings } = useSystemSettings();
  
  const ThemedCard = styled(Card)(() => createThemedCard(settings));
  const ThemedButton = styled(Button)(() => createThemedButton(settings, 'contained'));
  
  return (
    <ThemedCard>
      <ThemedButton>Click me</ThemedButton>
    </ThemedCard>
  );
}
```

### 4. Direct usage in sx prop

```jsx
import { useSystemSettings } from '../hooks/useSystemSettings';

function MyComponent() {
  const { settings } = useSystemSettings();
  
  return (
    <Box
      sx={{
        backgroundColor: settings.primaryColor,
        color: settings.textColor,
        '&:hover': {
          backgroundColor: settings.hoverColor,
        },
      }}
    >
      Content
    </Box>
  );
}
```

## Available Theme Utilities

All utilities are in `src/utils/theme.js`:

- `getThemeColors(settings)` - Get all theme colors as an object
- `createThemedCard(settings)` - Card styles
- `createThemedButton(settings, variant)` - Button styles (contained/outlined)
- `createThemedTextField(settings)` - TextField styles
- `createGradient(settings, direction)` - Gradient background
- `createShadow(settings, intensity)` - Shadow with theme colors
- `getContrastText(backgroundColor)` - Get contrasting text color
- `createThemedTableHead(settings)` - Table header styles
- `createThemedChip(settings)` - Chip styles
- `createThemedAppBar(settings)` - AppBar styles
- `createThemedFooter(settings)` - Footer styles

## Example: Updating an Existing Component

### Before (hardcoded colors):

```jsx
const GlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(254, 249, 225, 0.95)',
  boxShadow: '0 8px 40px rgba(109, 35, 35, 0.08)',
}));

function MyComponent() {
  return (
    <GlassCard>
      <Button sx={{ bgcolor: '#894444', color: '#FFFFFF' }}>
        Click
      </Button>
    </GlassCard>
  );
}
```

### After (using system settings):

```jsx
import { styled } from '@mui/material/styles';
import { useSystemSettings } from '../hooks/useSystemSettings';
import { createThemedCard, createThemedButton } from '../utils/theme';

function MyComponent() {
  const { settings } = useSystemSettings();
  
  const GlassCard = styled(Card)(() => createThemedCard(settings));
  const ThemedButton = styled(Button)(() => createThemedButton(settings, 'contained'));
  
  return (
    <GlassCard>
      <ThemedButton>Click</ThemedButton>
    </GlassCard>
  );
}
```

## Common Patterns

### Pattern 1: Styled Components
```jsx
const StyledBox = styled(Box)(({ theme, settings }) => ({
  backgroundColor: settings.primaryColor,
  color: settings.textColor,
}));
```

### Pattern 2: Inline Styles
```jsx
<Box sx={{ bgcolor: settings.primaryColor, color: settings.textColor }}>
```

### Pattern 3: Conditional Colors
```jsx
<Box sx={{ 
  bgcolor: isActive ? settings.primaryColor : settings.accentColor,
  color: isActive ? settings.textColor : settings.textPrimaryColor,
}}>
```

## Migration Checklist

For each component:
1. ✅ Import `useSystemSettings` hook
2. ✅ Get `settings` from the hook
3. ✅ Replace hardcoded colors with `settings.*Color`
4. ✅ Replace hardcoded text with `settings.institutionName`, etc.
5. ✅ Use theme utilities for styled components
6. ✅ Test with different color palettes

## Benefits

- ✅ Easy rebranding for different buyers
- ✅ Centralized color management
- ✅ Consistent theming across all components
- ✅ Real-time updates when settings change
- ✅ No need to modify individual components for color changes




