# System Settings Theme Integration - Complete Setup

## ✅ What Has Been Created

### 1. **SystemSettingsContext** (`src/contexts/SystemSettingsContext.jsx`)
   - Provides system settings to all components via React Context
   - Automatically loads settings from API and localStorage
   - Updates all components when settings change
   - Sets CSS variables for global styling

### 2. **useSystemSettings Hook** (`src/hooks/useSystemSettings.js`)
   - Easy-to-use hook for accessing system settings
   - Can be imported in any component

### 3. **Theme Utilities** (`src/utils/theme.js`)
   - Pre-built styled component creators
   - Functions for cards, buttons, text fields, tables, etc.
   - Gradient and shadow generators
   - All use system settings automatically

### 4. **Updated App.jsx**
   - Wrapped with `SystemSettingsProvider`
   - Uses settings from context instead of local state
   - All components now have access to settings

### 5. **Updated SystemSettings.jsx**
   - Dispatches events when settings are saved/reset
   - Notifies all components of changes

### 6. **Example Files**
   - `EXAMPLE_ThemeIntegration.jsx` - Shows all usage patterns
   - `themeUsageGuide.md` - Detailed documentation

## 🚀 How to Use in Your Components

### Quick Start (3 steps):

```jsx
// 1. Import the hook
import { useSystemSettings } from '../hooks/useSystemSettings';

// 2. Get settings in your component
function MyComponent() {
  const { settings } = useSystemSettings();
  
  // 3. Use settings anywhere
  return (
    <Box sx={{ bgcolor: settings.primaryColor, color: settings.textColor }}>
      <h1>{settings.institutionName}</h1>
    </Box>
  );
}
```

### Available Settings

```javascript
settings = {
  primaryColor: '#894444',        // Main brand color
  secondaryColor: '#6d2323',       // Secondary brand color
  accentColor: '#FEF9E1',          // Accent/highlight color
  textColor: '#FFFFFF',            // Text on dark backgrounds
  textPrimaryColor: '#6D2323',     // Primary text color
  textSecondaryColor: '#FEF9E1',   // Secondary text color
  hoverColor: '#6D2323',           // Hover state color
  backgroundColor: '#FFFFFF',      // Background color
  institutionLogo: '',             // Institution logo URL
  hrisLogo: '',                    // HRIS logo URL
  institutionName: '...',          // Institution name
  systemName: '...',               // System name
  institutionAbbreviation: '...', // Institution abbreviation
  footerText: '...',               // Footer text
  copyrightSymbol: '©',           // Copyright symbol
  enableWatermark: true,           // Watermark toggle
}
```

## 📝 Migration Guide

### For Each Component:

1. **Add import:**
   ```jsx
   import { useSystemSettings } from '../hooks/useSystemSettings';
   ```

2. **Get settings:**
   ```jsx
   const { settings } = useSystemSettings();
   ```

3. **Replace hardcoded colors:**
   - `'#894444'` → `settings.primaryColor`
   - `'#6d2323'` → `settings.secondaryColor`
   - `'#FEF9E1'` → `settings.accentColor`
   - `'#FFFFFF'` → `settings.textColor` or `settings.backgroundColor`
   - etc.

4. **Replace hardcoded text:**
   - Institution name → `settings.institutionName`
   - System name → `settings.systemName`
   - Footer text → `settings.footerText`

5. **Use theme utilities for styled components:**
   ```jsx
   import { createThemedCard } from '../utils/theme';
   const ThemedCard = styled(Card)(() => createThemedCard(settings));
   ```

## 🎨 Common Patterns

### Pattern 1: Styled Components with Utilities
```jsx
import { createThemedCard, createThemedButton } from '../utils/theme';

const ThemedCard = styled(Card)(() => createThemedCard(settings));
const ThemedButton = styled(Button)(() => createThemedButton(settings, 'contained'));
```

### Pattern 2: Direct sx Prop Usage
```jsx
<Box sx={{ 
  bgcolor: settings.primaryColor, 
  color: settings.textColor 
}}>
```

### Pattern 3: Conditional Styling
```jsx
<Box sx={{ 
  bgcolor: isActive ? settings.primaryColor : settings.accentColor,
  color: isActive ? settings.textColor : settings.textPrimaryColor,
}}>
```

## 🔄 How It Works

1. **SystemSettingsProvider** wraps the entire app
2. Settings are loaded from API on app start
3. Settings are cached in localStorage for instant display
4. When settings change in SystemSettings.jsx:
   - Settings are saved to API
   - localStorage is updated
   - Custom event is dispatched
   - All components using `useSystemSettings` automatically update
5. CSS variables are set for global styling

## ✨ Benefits

- ✅ **Easy Rebranding**: Change colors in one place (SystemSettings.jsx)
- ✅ **Consistent Theming**: All components use the same colors
- ✅ **Real-time Updates**: Changes reflect immediately
- ✅ **Buyer-Ready**: Easy to customize for different buyers
- ✅ **Type-Safe**: Settings are consistent across components
- ✅ **Performance**: Settings cached in localStorage

## 📚 Files to Reference

- **Usage Examples**: `src/components/EXAMPLE_ThemeIntegration.jsx`
- **Detailed Guide**: `src/utils/themeUsageGuide.md`
- **Theme Utilities**: `src/utils/theme.js`
- **Context Provider**: `src/contexts/SystemSettingsContext.jsx`

## 🎯 Next Steps

1. Start updating components one by one
2. Use the example file as a reference
3. Replace hardcoded colors with `settings.*`
4. Test with different color palettes in SystemSettings
5. All components will automatically use the new colors!

## 💡 Tips

- Use theme utilities for common patterns (cards, buttons, etc.)
- Use direct `settings.*` for custom styling
- Test with different color combinations
- Keep accessibility in mind (contrast ratios)
- Use `getContrastText()` utility for automatic text color

---

**Ready to rebrand!** 🎨 Just update colors in SystemSettings.jsx and all components will follow.




