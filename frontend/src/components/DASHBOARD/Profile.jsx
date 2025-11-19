import API_BASE_URL from '../../apiConfig';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {
  Avatar,
  Typography,
  Box,
  CircularProgress,
  Paper,
  Grid,
  Container,
  Button,
  Modal,
  TextField,
  Chip,
  IconButton,
  Card,
  CardContent,
  Tooltip,
  useTheme,
  alpha,
  Backdrop,
  Tabs,
  Tab,
  useMediaQuery,
  Fab,
  Snackbar,
  SnackbarContent,
  useScrollTrigger,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  ToggleButton,
  ToggleButtonGroup,
  List,
  ListItem,
  ListItemText as MuiListItemText,
  ListItemIcon as MuiListItemIcon,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem as MuiMenuItem,
  InputAdornment,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';
import BadgeIcon from '@mui/icons-material/Badge';
import HomeIcon from '@mui/icons-material/Home';
import CallIcon from '@mui/icons-material/Call';
import GroupIcon from '@mui/icons-material/Group';
import SchoolIcon from '@mui/icons-material/School';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CakeIcon from '@mui/icons-material/Cake';
import WorkIcon from '@mui/icons-material/Work';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import RefreshIcon from '@mui/icons-material/Refresh';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import SettingsIcon from '@mui/icons-material/Settings';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PhotoSizeSelectActualIcon from '@mui/icons-material/PhotoSizeSelectActual';
import CropOriginalIcon from '@mui/icons-material/CropOriginal';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import { ExitToApp } from '@mui/icons-material';
import ChildCareIcon from '@mui/icons-material/ChildCare';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import PercentIcon from '@mui/icons-material/Percent';
import PsychologyIcon from '@mui/icons-material/Psychology';
import BookIcon from '@mui/icons-material/Book';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import InfoIcon from '@mui/icons-material/Info';
import ConstructionIcon from '@mui/icons-material/Construction';

// HR Professional Color Palette
const colors = {
  primary: '#6d2323',
  primaryLight: '#8a2e2e',
  primaryDark: '#4a1818',
  secondary: '#f5f5dc',
  textPrimary: '#000000',
  textSecondary: '#555555',
  textLight: '#ffffff',
  background: '#fafafa',
  surface: '#ffffff',
  border: '#e0e0e0',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
  gradientPrimary: 'linear-gradient(135deg, #6d2323 0%, #8a2e2e 100%)',
};

const shadows = {
  light: '0 2px 8px rgba(0,0,0,0.08)',
  medium: '0 4px 16px rgba(0,0,0,0.12)',
  heavy: '0 8px 24px rgba(0,0,0,0.16)',
  colored: '0 4px 16px rgba(109, 35, 35, 0.2)',
};

const ProfileContainer = styled(Container)(({ theme }) => ({
  maxWidth: '1400px',
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(8),
  minHeight: '100vh',
  backgroundColor: colors.background,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '300px',
    background: colors.gradientPrimary,
    zIndex: 0,
    borderBottomLeftRadius: '50% 20%',
    borderBottomRightRadius: '50% 20%',
  },
}));

const ProfileHeader = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(5),
  marginBottom: theme.spacing(4),
  borderRadius: theme.spacing(3),
  boxShadow: shadows.medium,
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
  background: colors.surface,
  zIndex: 1,
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    textAlign: 'center',
    padding: theme.spacing(4),
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '8px',
    background: colors.gradientPrimary,
  },
}));

const ProfileAvatarContainer = styled(Box)(({ theme }) => ({
  marginRight: theme.spacing(4),
  position: 'relative',
  [theme.breakpoints.down('md')]: {
    marginRight: 0,
    marginBottom: theme.spacing(3),
  },
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(24),
  height: theme.spacing(24),
  border: `4px solid ${colors.surface}`,
  boxShadow: shadows.medium,
  cursor: 'pointer',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: shadows.colored,
  },
}));

const ProfileInfo = styled(Box)(({ theme }) => ({
  flex: 1,
}));

const ProfileName = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '2rem',
  color: colors.textPrimary,
  marginBottom: theme.spacing(0.5),
  transition: 'color 0.3s ease',
  '&:hover': {
    color: colors.primary,
  },
}));

const ProfileSubtitle = styled(Typography)(({ theme }) => ({
  color: colors.textSecondary,
  marginBottom: theme.spacing(2),
  fontSize: '1.1rem',
}));

const ProfileActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1.5),
  [theme.breakpoints.down('md')]: {
    justifyContent: 'center',
    marginTop: theme.spacing(2),
    flexWrap: 'wrap',
  },
}));

const SectionPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  borderRadius: theme.spacing(3),
  boxShadow: shadows.light,
  transition: 'box-shadow 0.3s ease, transform 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    boxShadow: shadows.medium,
    transform: 'translateY(-4px)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '6px',
    height: '100%',
    background: colors.gradientPrimary,
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover::before': {
    opacity: 1,
  },
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.5rem',
  color: colors.textPrimary,
  marginBottom: theme.spacing(3),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -theme.spacing(1),
    left: 0,
    width: '60px',
    height: '3px',
    background: colors.gradientPrimary,
    borderRadius: theme.spacing(1),
  },
}));

const InfoItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  marginBottom: theme.spacing(2.5),
  alignItems: 'flex-start',
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(2),
  transition: 'background-color 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(colors.primary, 0.05),
  },
}));

const InfoLabel = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: colors.textSecondary,
  minWidth: '160px',
  marginRight: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const InfoValue = styled(Typography)(({ theme }) => ({
  color: colors.textPrimary,
  flex: 1,
  fontWeight: 500,
  fontSize: '1rem',
}));

const TabContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  position: 'relative',
}));

const CustomTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '1rem',
  minWidth: 'auto',
  padding: theme.spacing(1.5, 2),
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease',
  '&.Mui-selected': {
    color: colors.textLight,
    backgroundColor: colors.primary,
  },
  '&:not(.Mui-selected)': {
    color: colors.textSecondary,
    '&:hover': {
      backgroundColor: alpha(colors.primary, 0.1),
      color: colors.primary,
    },
  },
}));

const CustomTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: alpha(colors.secondary, 0.7),
  borderRadius: theme.spacing(3),
  padding: theme.spacing(0.5),
  '& .MuiTabs-indicator': {
    display: 'none',
  },
  marginBottom: theme.spacing(4),
}));

const ActionButton = styled(Button)(({ theme, variant = 'contained' }) => ({
  borderRadius: theme.spacing(2),
  textTransform: 'none',
  fontWeight: 600,
  padding: theme.spacing(1.2, 2.5),
  transition: 'all 0.3s ease',
  boxShadow: shadows.light,
  ...(variant === 'contained' && {
    background: colors.gradientPrimary,
    color: colors.textLight,
    '&:hover': {
      background: colors.primaryDark,
      transform: 'translateY(-2px)',
      boxShadow: shadows.medium,
    },
  }),
  ...(variant === 'outlined' && {
    color: colors.primary,
    borderColor: colors.primary,
    borderWidth: '2px',
    '&:hover': {
      backgroundColor: alpha(colors.primary, 0.1),
      borderColor: colors.primaryDark,
      transform: 'translateY(-2px)',
    },
  }),
}));

const ModalContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '900px',
  backgroundColor: colors.surface,
  borderRadius: theme.spacing(3),
  boxShadow: shadows.heavy,
  padding: 0,
  maxHeight: '90vh',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
}));

const ModalHeader = styled(Box)(({ theme }) => ({
  background: colors.gradientPrimary,
  padding: theme.spacing(3, 4),
  color: colors.textLight,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const ModalTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.5rem',
}));

const ModalBody = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  overflowY: 'auto',
  flex: 1,
}));

const FormField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2.5),
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(2),
    transition: 'all 0.3s ease',
    '& fieldset': {
      borderColor: colors.border,
    },
    '&:hover fieldset': {
      borderColor: colors.primaryLight,
    },
    '&.Mui-focused fieldset': {
      borderColor: colors.primary,
      borderWidth: '2px',
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
    '&.Mui-focused': {
      color: colors.primary,
    },
  },
}));

const ViewToggleButton = styled(ToggleButton)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(1, 2),
  textTransform: 'none',
  fontWeight: 500,
  '&.Mui-selected': {
    backgroundColor: colors.primary,
    color: colors.textLight,
    '&:hover': {
      backgroundColor: colors.primaryDark,
    },
  },
}));

const ImagePreviewModal = styled(Modal)(({ theme }) => ({
  '& .MuiModal-backdrop': {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
}));

const ImagePreviewContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  maxWidth: '90vw',
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  outline: 'none',
}));

const ImagePreviewContent = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  maxWidth: '100%',
  maxHeight: '80vh',
}));

const PreviewImage = styled('img')(({ theme }) => ({
  maxWidth: '100%',
  maxHeight: '80vh',
  borderRadius: theme.spacing(2),
  boxShadow: shadows.heavy,
  objectFit: 'contain',
}));

const ImagePreviewActions = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  display: 'flex',
  gap: theme.spacing(1),
  backgroundColor: alpha(colors.surface, 0.9),
  borderRadius: theme.spacing(2),
  padding: theme.spacing(0.5),
}));

const ImagePreviewButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: colors.surface,
  color: colors.textPrimary,
  '&:hover': {
    backgroundColor: colors.primary,
    color: colors.textLight,
  },
}));

const EditModalPictureSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(3),
  padding: theme.spacing(3),
  backgroundColor: alpha(colors.secondary, 0.3),
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(3),
  position: 'relative',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    textAlign: 'center',
  },
}));

const EditModalAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(20),
  height: theme.spacing(20),
  border: `3px solid ${colors.surface}`,
  boxShadow: shadows.medium,
  cursor: 'pointer',
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const EditModalPictureInfo = styled(Box)(({ theme }) => ({
  flex: 1,
}));

const EditModalPictureActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

const ContentContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  position: 'relative',
  minHeight: '600px',
}));

const ViewWrapper = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  opacity: 0,
  visibility: 'hidden',
  transition: 'opacity 0.3s ease, visibility 0.3s ease',
  '&.active': {
    opacity: 1,
    visibility: 'visible',
  },
}));

const Notification = styled(SnackbarContent)(({ theme, variant }) => ({
  backgroundColor:
    variant === 'success'
      ? colors.success
      : variant === 'error'
      ? colors.error
      : variant === 'warning'
      ? colors.warning
      : colors.info,
  color: colors.textLight,
  fontWeight: 500,
  borderRadius: theme.spacing(2),
  boxShadow: shadows.medium,
}));

const FloatingButton = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(4),
  right: theme.spacing(4),
  background: colors.gradientPrimary,
  color: colors.textLight,
  boxShadow: shadows.medium,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: shadows.colored,
  },
}));

const ChildCard = styled(Card)(({ theme }) => ({
  border: '1px solid #e0e0e0',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    borderColor: colors.primary,
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease',
    boxShadow: shadows.medium,
  },
}));

const ChildListItem = styled(ListItem)(({ theme }) => ({
  border: '1px solid #e0e0e0',
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(1),
  '&:hover': {
    borderColor: colors.primary,
    backgroundColor: alpha(colors.primary, 0.05),
  },
}));

const CollegeCard = styled(Card)(({ theme }) => ({
  border: '1px solid #e0e0e0',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    borderColor: colors.primary,
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease',
    boxShadow: shadows.medium,
  },
}));

const CollegeListItem = styled(ListItem)(({ theme }) => ({
  border: '1px solid #e0e0e0',
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(1),
  '&:hover': {
    borderColor: colors.primary,
    backgroundColor: alpha(colors.primary, 0.05),
  },
}));

const GraduateCard = styled(Card)(({ theme }) => ({
  border: '1px solid #e0e0e0',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    borderColor: colors.primary,
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease',
    boxShadow: shadows.medium,
  },
}));

const GraduateListItem = styled(ListItem)(({ theme }) => ({
  border: '1px solid #e0e0e0',
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(1),
  '&:hover': {
    borderColor: colors.primary,
    backgroundColor: alpha(colors.primary, 0.05),
  },
}));

const ScrollableContainer = styled(Box)(({ theme }) => ({
  maxHeight: '500px',
  overflowY: 'auto',
  paddingRight: theme.spacing(1),
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: '#f1f1f1',
    borderRadius: '3px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: colors.primary,
    borderRadius: '3px',
  },
}));

const EducationSubTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: alpha(colors.secondary, 0.5),
  borderRadius: theme.spacing(2),
  padding: theme.spacing(0.5),
  marginBottom: theme.spacing(3),
  '& .MuiTabs-indicator': {
    display: 'none',
  },
}));

const EducationSubTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.9rem',
  minWidth: 'auto',
  padding: theme.spacing(1, 2),
  borderRadius: theme.spacing(1.5),
  transition: 'all 0.3s ease',
  '&.Mui-selected': {
    color: colors.textLight,
    backgroundColor: colors.primary,
  },
  '&:not(.Mui-selected)': {
    color: colors.textSecondary,
    '&:hover': {
      backgroundColor: alpha(colors.primary, 0.1),
      color: colors.primary,
    },
  },
}));

const EligibilityCard = styled(Card)(({ theme }) => ({
  border: '1px solid #e0e0e0',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    borderColor: colors.primary,
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease',
    boxShadow: shadows.medium,
  },
}));

const EligibilityListItem = styled(ListItem)(({ theme }) => ({
  border: '1px solid #e0e0e0',
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(1),
  '&:hover': {
    borderColor: colors.primary,
    backgroundColor: alpha(colors.primary, 0.05),
  },
}));

// Learning and Development Card and ListItem
const LearningDevelopmentCard = styled(Card)(({ theme }) => ({
  border: '1px solid #e0e0e0',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    borderColor: colors.primary,
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease',
    boxShadow: shadows.medium,
  },
}));

const LearningDevelopmentListItem = styled(ListItem)(({ theme }) => ({
  border: '1px solid #e0e0e0',
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(1),
  '&:hover': {
    borderColor: colors.primary,
    backgroundColor: alpha(colors.primary, 0.05),
  },
}));

// Other Information Card and ListItem
const OtherInformationCard = styled(Card)(({ theme }) => ({
  border: '1px solid #e0e0e0',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    borderColor: colors.primary,
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease',
    boxShadow: shadows.medium,
  },
}));

const OtherInformationListItem = styled(ListItem)(({ theme }) => ({
  border: '1px solid #e0e0e0',
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(1),
  '&:hover': {
    borderColor: colors.primary,
    backgroundColor: alpha(colors.primary, 0.05),
  },
}));

const VocationalCard = styled(Card)(({ theme }) => ({
  border: '1px solid #e0e0e0',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    borderColor: colors.primary,
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease',
    boxShadow: shadows.medium,
  },
}));

const VocationalListItem = styled(ListItem)(({ theme }) => ({
  border: '1px solid #e0e0e0',
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(1),
  '&:hover': {
    borderColor: colors.primary,
    backgroundColor: alpha(colors.primary, 0.05),
  },
}));

const WorkExperienceCard = styled(Card)(({ theme }) => ({
  border: '1px solid #e0e0e0',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    borderColor: colors.primary,
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease',
    boxShadow: shadows.medium,
  },
}));

const WorkExperienceListItem = styled(ListItem)(({ theme }) => ({
  border: '1px solid #e0e0e0',
  borderRadius: theme.spacing(1),
  marginBottom: theme.spacing(1),
  '&:hover': {
    borderColor: colors.primary,
    backgroundColor: alpha(colors.primary, 0.05),
  },
}));

const StickyActionBar = styled(Box)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  backgroundColor: colors.surface,
  padding: theme.spacing(2),
  borderBottom: `1px solid ${colors.border}`,
  zIndex: 10,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
}));

// Percentage Input Component
const PercentageInput = ({
  value,
  onChange,
  label,
  disabled = false,
  error = false,
  helperText = '',
}) => {
  const [inputValue, setInputValue] = useState(value || '');

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const handleInputChange = (e) => {
    let newValue = e.target.value;

    // Remove any non-digit characters except for decimal point
    newValue = newValue.replace(/[^\d.]/g, '');

    // Ensure only one decimal point
    const parts = newValue.split('.');
    if (parts.length > 2) {
      newValue = parts[0] + '.' + parts.slice(1).join('');
    }

    // Limit to 2 decimal places
    if (parts.length === 2 && parts[1].length > 2) {
      newValue = parts[0] + '.' + parts[1].substring(0, 2);
    }

    // Ensure value is between 0 and 100
    const numValue = parseFloat(newValue);
    if (!isNaN(numValue) && numValue > 100) {
      newValue = '100';
    }

    setInputValue(newValue);
    onChange(newValue);
  };

  return (
    <Box>
      <Typography
        variant="caption"
        sx={{ fontWeight: 'bold', mb: 0.5, color: '#333', display: 'block' }}
      >
        {label}
      </Typography>
      <TextField
        value={inputValue}
        onChange={handleInputChange}
        placeholder="0.00"
        fullWidth
        size="small"
        disabled={disabled}
        error={error}
        helperText={helperText}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <PercentIcon sx={{ color: '#6D2323' }} />
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: error ? 'red' : '#6D2323',
              borderWidth: '1.5px',
            },
            '&:hover fieldset': {
              borderColor: error ? 'red' : '#6D2323',
            },
            '&.Mui-focused fieldset': {
              borderColor: error ? 'red' : '#6D2323',
            },
          },
        }}
      />
    </Box>
  );
};

const Profile = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [person, setPerson] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadStatus, setUploadStatus] = useState({ message: '', type: '' });
  const [editOpen, setEditOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [tabValue, setTabValue] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [imageZoomOpen, setImageZoomOpen] = useState(false);
  const [editImageZoomOpen, setEditImageZoomOpen] = useState(false);
  const [moreMenuAnchorEl, setMoreMenuAnchorEl] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const employeeNumber = localStorage.getItem('employeeNumber');
  const profileRef = useRef(null);

  // Children related state
  const [children, setChildren] = useState([]);
  const [childrenFormData, setChildrenFormData] = useState([]);

  // College related state
  const [colleges, setColleges] = useState([]);
  const [collegesFormData, setCollegesFormData] = useState([]);

  // Graduate studies related state
  const [graduates, setGraduates] = useState([]);
  const [graduatesFormData, setGraduatesFormData] = useState([]);

  // Eligibility related state
  const [eligibilities, setEligibilities] = useState([]);
  const [eligibilitiesFormData, setEligibilitiesFormData] = useState([]);

  // Learning and Development related state
  const [learningDevelopment, setLearningDevelopment] = useState([]);
  const [learningDevelopmentFormData, setLearningDevelopmentFormData] =
    useState([]);

  // Other Information related state
  const [otherInformation, setOtherInformation] = useState([]);
  const [otherInformationFormData, setOtherInformationFormData] = useState([]);

  // Education sub-tab state
  const [educationSubTabValue, setEducationSubTabValue] = useState(0);

  // Vocational related state
  const [vocational, setVocational] = useState([]);
  const [vocationalFormData, setVocationalFormData] = useState([]);

  const [workExperiences, setWorkExperiences] = useState([]);
  const [workExperiencesFormData, setWorkExperiencesFormData] = useState([]);

  useEffect(() => {
    const fetchPersonData = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/personalinfo/person_table`
        );
        const match = response.data.find(
          (p) => p.agencyEmployeeNum === employeeNumber
        );
        setPerson(match);

        if (match) {
          setProfilePicture(match.profile_picture);
          const formattedData = { ...match };
          if (match.birthDate) {
            const date = new Date(match.birthDate);
            if (!isNaN(date.getTime())) {
              formattedData.birthDate = date.toISOString().split('T')[0];
            }
          }
          setFormData(formattedData);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setUploadStatus({
          message: 'Failed to load profile data',
          type: 'error',
        });
        setNotificationOpen(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonData();
  }, [employeeNumber]);

  // Fetch children data for current user
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/ChildrenRoute/children-by-person/${employeeNumber}`
        );
        console.log('Children data:', response.data);
        setChildren(response.data);

        // Initialize form data with fetched children
        const formattedChildren = response.data.map((child) => ({
          ...child,
          dateOfBirth: child.dateOfBirth ? child.dateOfBirth.split('T')[0] : '',
        }));
        setChildrenFormData(formattedChildren);
      } catch (error) {
        console.error('Error fetching children:', error);
        setUploadStatus({
          message: 'Failed to load children data',
          type: 'error',
        });
        setNotificationOpen(true);
      }
    };

    if (employeeNumber) {
      fetchChildren();
    }
  }, [employeeNumber]);

  // Fetch college data for current user
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/college/college-by-person/${employeeNumber}`
        );
        console.log('College data:', response.data);
        setColleges(response.data);
        setCollegesFormData(response.data);
      } catch (error) {
        console.error('Error fetching colleges:', error);
        setUploadStatus({
          message: 'Failed to load college data',
          type: 'error',
        });
        setNotificationOpen(true);
      }
    };

    if (employeeNumber) {
      fetchColleges();
    }
  }, [employeeNumber]);

  // Fetch graduate studies data for current user
  useEffect(() => {
    const fetchGraduates = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/GraduateRoute/graduate-by-person/${employeeNumber}`
        );
        console.log('Graduate data:', response.data);
        setGraduates(response.data);
        setGraduatesFormData(response.data);
      } catch (error) {
        console.error('Error fetching graduates:', error);
        setUploadStatus({
          message: 'Failed to load graduate data',
          type: 'error',
        });
        setNotificationOpen(true);
      }
    };

    if (employeeNumber) {
      fetchGraduates();
    }
  }, [employeeNumber]);

  // Fetch eligibility data for current user
  useEffect(() => {
    const fetchEligibilities = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/eligibilityRoute/eligibility-by-person/${employeeNumber}`
        );
        console.log('Eligibility data:', response.data);
        setEligibilities(response.data);

        // Initialize form data with fetched eligibilities
        const formattedEligibilities = response.data.map((eligibility) => ({
          ...eligibility,
          eligibilityDateOfExam: eligibility.eligibilityDateOfExam
            ? eligibility.eligibilityDateOfExam.split('T')[0]
            : '',
          DateOfValidity: eligibility.DateOfValidity
            ? eligibility.DateOfValidity.split('T')[0]
            : '',
        }));
        setEligibilitiesFormData(formattedEligibilities);
      } catch (error) {
        console.error('Error fetching eligibilities:', error);
        setUploadStatus({
          message: 'Failed to load eligibility data',
          type: 'error',
        });
        setNotificationOpen(true);
      }
    };

    if (employeeNumber) {
      fetchEligibilities();
    }
  }, [employeeNumber]);

  // Fetch learning and development data for current user
  useEffect(() => {
    const fetchLearningDevelopment = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/learning_and_development_table/by-person/${employeeNumber}`
        );
        console.log('Learning and Development data:', response.data);
        setLearningDevelopment(response.data);
        setLearningDevelopmentFormData(response.data);
      } catch (error) {
        console.error('Error fetching learning and development:', error);
        setUploadStatus({
          message: 'Failed to load learning and development data',
          type: 'error',
        });
        setNotificationOpen(true);
      }
    };

    if (employeeNumber) {
      fetchLearningDevelopment();
    }
  }, [employeeNumber]);

  // Fetch other information data for current user
  useEffect(() => {
    const fetchOtherInformation = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/OtherInfo/other-information-by-person/${employeeNumber}`
        );
        console.log('Other Information data:', response.data);
        setOtherInformation(response.data);
        setOtherInformationFormData(response.data);
      } catch (error) {
        console.error('Error fetching other information:', error);
        setUploadStatus({
          message: 'Failed to load other information data',
          type: 'error',
        });
        setNotificationOpen(true);
      }
    };

    if (employeeNumber) {
      fetchOtherInformation();
    }
  }, [employeeNumber]);

  // Fetch vocational data for current user
  useEffect(() => {
    const fetchVocational = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/vocational/vocational-by-person/${employeeNumber}`
        );
        console.log('Vocational data:', response.data);
        setVocational(response.data);
        setVocationalFormData(response.data);
      } catch (error) {
        console.error('Error fetching vocational:', error);
        setUploadStatus({
          message: 'Failed to load vocational data',
          type: 'error',
        });
        setNotificationOpen(true);
      }
    };

    if (employeeNumber) {
      fetchVocational();
    }
  }, [employeeNumber]);

  useEffect(() => {
    const fetchWorkExperiences = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/WorkExperienceRoute/work-experience-by-person/${employeeNumber}`
        );
        console.log('Work Experience data:', response.data);
        setWorkExperiences(response.data);

        // Initialize form data with fetched work experiences
        const formattedWorkExperiences = response.data.map((workExp) => ({
          ...workExp,
          workDateFrom: workExp.workDateFrom
            ? workExp.workDateFrom.split('T')[0]
            : '',
          workDateTo: workExp.workDateTo
            ? workExp.workDateTo.split('T')[0]
            : '',
        }));
        setWorkExperiencesFormData(formattedWorkExperiences);
      } catch (error) {
        console.error('Error fetching work experiences:', error);
        setUploadStatus({
          message: 'Failed to load work experience data',
          type: 'error',
        });
        setNotificationOpen(true);
      }
    };

    if (employeeNumber) {
      fetchWorkExperiences();
    }
  }, [employeeNumber]);

  const handleEditOpen = () => {
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      // Save personal info
      await axios.put(
        `${API_BASE_URL}/personalinfo/person_table/by-employee/${employeeNumber}`,
        formData
      );
      setPerson(formData);

      // Save children data
      for (const child of childrenFormData) {
        if (child.id) {
          // Update existing child
          await axios.put(
            `${API_BASE_URL}/ChildrenRoute/children-table/${child.id}`,
            child
          );
        } else if (
          child.childrenFirstName &&
          child.childrenLastName &&
          child.dateOfBirth
        ) {
          // Add new child
          await axios.post(
            `${API_BASE_URL}/ChildrenRoute/children-table`,
            child
          );
        }
      }

      // Save college data
      for (const college of collegesFormData) {
        if (college.id) {
          // Update existing college
          await axios.put(
            `${API_BASE_URL}/college/college-table/${college.id}`,
            college
          );
        } else if (college.collegeNameOfSchool && college.collegeDegree) {
          // Add new college
          await axios.post(`${API_BASE_URL}/college/college-table`, college);
        }
      }

      // Save graduate studies data
      for (const graduate of graduatesFormData) {
        if (graduate.id) {
          // Update existing graduate
          await axios.put(
            `${API_BASE_URL}/graduate/graduate-table/${graduate.id}`,
            graduate
          );
        } else if (graduate.graduateNameOfSchool && graduate.graduateDegree) {
          // Add new graduate
          await axios.post(`${API_BASE_URL}/graduate/graduate-table`, graduate);
        }
      }

      // Save eligibility data
      for (const eligibility of eligibilitiesFormData) {
        if (eligibility.id) {
          // Update existing eligibility
          await axios.put(
            `${API_BASE_URL}/eligibilityRoute/eligibility/${eligibility.id}`,
            eligibility
          );
        } else if (eligibility.eligibilityName && eligibility.DateOfValidity) {
          // Add new eligibility
          await axios.post(
            `${API_BASE_URL}/eligibilityRoute/eligibility`,
            eligibility
          );
        }
      }

      // Save learning and development data
      for (const learning of learningDevelopmentFormData) {
        if (learning.id) {
          // Update existing learning and development
          await axios.put(
            `${API_BASE_URL}/learning_and_development_table/${learning.id}`,
            learning
          );
        } else if (
          learning.titleOfProgram &&
          learning.dateFrom &&
          learning.dateTo
        ) {
          // Add new learning and development
          await axios.post(
            `${API_BASE_URL}/learning_and_development_table`,
            learning
          );
        }
      }

      // Save other information data
      for (const info of otherInformationFormData) {
        if (info.id) {
          // Update existing other information
          await axios.put(
            `${API_BASE_URL}/OtherInfo/other-information/${info.id}`,
            info
          );
        } else {
          // Add new other information
          await axios.post(`${API_BASE_URL}/OtherInfo/other-information`, info);
        }
      }

      // Save vocational data
      for (const voc of vocationalFormData) {
        if (voc.id) {
          // Update existing vocational record
          await axios.put(
            `${API_BASE_URL}/vocational/vocational-table/${voc.id}`,
            voc
          );
        } else if (voc.vocationalNameOfSchool && voc.vocationalDegree) {
          // Add new vocational record
          await axios.post(`${API_BASE_URL}/vocational/vocational-table`, voc);
        }
      }

      for (const workExp of workExperiencesFormData) {
        if (workExp.id) {
          // Update existing work experience
          await axios.put(
            `${API_BASE_URL}/WorkExperienceRoute/work-experience-table/${workExp.id}`,
            workExp
          );
        } else if (
          workExp.workPositionTitle &&
          workExp.workCompany &&
          workExp.workDateFrom &&
          workExp.workDateTo
        ) {
          // Add new work experience
          await axios.post(
            `${API_BASE_URL}/WorkExperienceRoute/work-experience-table`,
            workExp
          );
        }
      }

      setEditOpen(false);
      setUploadStatus({
        message: 'Profile updated successfully!',
        type: 'success',
      });
      setNotificationOpen(true);

      // Refresh data
      window.location.reload();
    } catch (err) {
      console.error('Update failed:', err);
      setUploadStatus({ message: 'Failed to update profile', type: 'error' });
      setNotificationOpen(true);
    }
  };

  const handlePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !employeeNumber) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setUploadStatus({
        message: 'Please upload a valid image file (JPEG, PNG, GIF)',
        type: 'error',
      });
      setNotificationOpen(true);
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadStatus({
        message: 'File size must be less than 5MB',
        type: 'error',
      });
      setNotificationOpen(true);
      return;
    }

    const fd = new FormData();
    fd.append('profile', file);

    try {
      setUploadStatus({ message: 'Uploading...', type: 'info' });
      setNotificationOpen(true);

      const res = await axios.post(
        `${API_BASE_URL}/upload-profile-picture/${employeeNumber}`,
        fd,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 30000,
        }
      );

      const newPicturePath = res.data.filePath;
      setProfilePicture(newPicturePath);

      if (person) {
        setPerson((prev) => ({ ...prev, profile_picture: newPicturePath }));
      }

      setUploadStatus({
        message: 'Profile picture updated successfully!',
        type: 'success',
      });
      setNotificationOpen(true);
    } catch (err) {
      console.error('Image upload failed:', err);
      const errorMessage =
        err.response?.data?.message ||
        'Failed to upload image. Please try again.';
      setUploadStatus({ message: errorMessage, type: 'error' });
      setNotificationOpen(true);
    }
  };

  const handleRemovePicture = () => {
    if (!person?.id) return;

    try {
      axios.delete(
        `${API_BASE_URL}/personalinfo/remove-profile-picture/${person.id}`
      );
      setProfilePicture(null);
      setPerson((prev) => ({ ...prev, profile_picture: null }));
      setUploadStatus({
        message: 'Profile picture removed successfully!',
        type: 'success',
      });
      setNotificationOpen(true);
    } catch (err) {
      console.error('Remove picture failed:', err);
      setUploadStatus({ message: 'Failed to remove picture.', type: 'error' });
      setNotificationOpen(true);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleImageZoom = () => {
    setImageZoomOpen(true);
  };

  const handleImageZoomClose = () => {
    setImageZoomOpen(false);
  };

  const handleEditImageZoom = () => {
    setEditImageZoomOpen(true);
  };

  const handleEditImageZoomClose = () => {
    setEditImageZoomOpen(false);
  };

  const handleNotificationClose = () => {
    setNotificationOpen(false);
  };

  const handleRefresh = () => {
    setLoading(true);
    window.location.reload();
  };

  const handleMoreMenuOpen = (event) => {
    setMoreMenuAnchorEl(event.currentTarget);
  };

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const trigger = useScrollTrigger({
    threshold: 100,
    disableHysteresis: true,
  });

  const scrollToTop = () => {
    profileRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Children related functions
  const handleChildrenFormChange = (index, e) => {
    const { name, value } = e.target;
    const updatedChildren = [...childrenFormData];
    updatedChildren[index] = { ...updatedChildren[index], [name]: value };
    setChildrenFormData(updatedChildren);
  };

  const handleAddChild = () => {
    setChildrenFormData([
      ...childrenFormData,
      {
        childrenFirstName: '',
        childrenMiddleName: '',
        childrenLastName: '',
        childrenNameExtension: '',
        dateOfBirth: '',
        person_id: employeeNumber,
      },
    ]);
  };

  const handleRemoveChild = (index) => {
    const updatedChildren = [...childrenFormData];
    updatedChildren.splice(index, 1);
    setChildrenFormData(updatedChildren);
  };

  // College related functions
  const handleCollegeFormChange = (index, e) => {
    const { name, value } = e.target;
    const updatedColleges = [...collegesFormData];
    updatedColleges[index] = { ...updatedColleges[index], [name]: value };
    setCollegesFormData(updatedColleges);
  };

  const handleAddCollege = () => {
    setCollegesFormData([
      ...collegesFormData,
      {
        collegeNameOfSchool: '',
        collegeDegree: '',
        collegePeriodFrom: '',
        collegePeriodTo: '',
        collegeHighestAttained: '',
        collegeYearGraduated: '',
        collegeScholarshipAcademicHonorsReceived: '',
        person_id: employeeNumber,
      },
    ]);
  };

  const handleRemoveCollege = (index) => {
    const updatedColleges = [...collegesFormData];
    updatedColleges.splice(index, 1);
    setCollegesFormData(updatedColleges);
  };

  // Graduate studies related functions
  const handleGraduateFormChange = (index, e) => {
    const { name, value } = e.target;
    const updatedGraduates = [...graduatesFormData];
    updatedGraduates[index] = { ...updatedGraduates[index], [name]: value };
    setGraduatesFormData(updatedGraduates);
  };

  const handleAddGraduate = () => {
    setGraduatesFormData([
      ...graduatesFormData,
      {
        graduateNameOfSchool: '',
        graduateDegree: '',
        graduatePeriodFrom: '',
        graduatePeriodTo: '',
        graduateHighestLevel: '',
        graduateYearGraduated: '',
        graduateScholarshipAcademicHonorsReceived: '',
        person_id: employeeNumber,
      },
    ]);
  };

  const handleRemoveGraduate = (index) => {
    const updatedGraduates = [...graduatesFormData];
    updatedGraduates.splice(index, 1);
    setGraduatesFormData(updatedGraduates);
  };

  // Eligibility related functions
  const handleEligibilityFormChange = (index, e) => {
    const { name, value } = e.target;
    const updatedEligibilities = [...eligibilitiesFormData];
    updatedEligibilities[index] = {
      ...updatedEligibilities[index],
      [name]: value,
    };
    setEligibilitiesFormData(updatedEligibilities);
  };

  const handleAddEligibility = () => {
    setEligibilitiesFormData([
      ...eligibilitiesFormData,
      {
        eligibilityName: '',
        eligibilityRating: '',
        eligibilityDateOfExam: '',
        eligibilityPlaceOfExam: '',
        licenseNumber: '',
        DateOfValidity: '',
        person_id: employeeNumber,
      },
    ]);
  };

  const handleRemoveEligibility = (index) => {
    const updatedEligibilities = [...eligibilitiesFormData];
    updatedEligibilities.splice(index, 1);
    setEligibilitiesFormData(updatedEligibilities);
  };

  // Learning and Development related functions
  const handleLearningDevelopmentFormChange = (index, e) => {
    const { name, value } = e.target;
    const updatedLearningDevelopment = [...learningDevelopmentFormData];
    updatedLearningDevelopment[index] = {
      ...updatedLearningDevelopment[index],
      [name]: value,
    };
    setLearningDevelopmentFormData(updatedLearningDevelopment);
  };

  const handleAddLearningDevelopment = () => {
    setLearningDevelopmentFormData([
      ...learningDevelopmentFormData,
      {
        titleOfProgram: '',
        dateFrom: '',
        dateTo: '',
        numberOfHours: '',
        typeOfLearningDevelopment: '',
        conductedSponsored: '',
        person_id: employeeNumber,
      },
    ]);
  };

  const handleRemoveLearningDevelopment = (index) => {
    const updatedLearningDevelopment = [...learningDevelopmentFormData];
    updatedLearningDevelopment.splice(index, 1);
    setLearningDevelopmentFormData(updatedLearningDevelopment);
  };

  // Other Information related functions
  const handleOtherInformationFormChange = (index, e) => {
    const { name, value } = e.target;
    const updatedOtherInformation = [...otherInformationFormData];
    updatedOtherInformation[index] = {
      ...updatedOtherInformation[index],
      [name]: value,
    };
    setOtherInformationFormData(updatedOtherInformation);
  };

  const handleAddOtherInformation = () => {
    setOtherInformationFormData([
      ...otherInformationFormData,
      {
        specialSkills: '',
        nonAcademicDistinctions: '',
        membershipInAssociation: '',
        person_id: employeeNumber,
      },
    ]);
  };

  const handleRemoveOtherInformation = (index) => {
    const updatedOtherInformation = [...otherInformationFormData];
    updatedOtherInformation.splice(index, 1);
    setOtherInformationFormData(updatedOtherInformation);
  };

  // Vocational related functions
  const handleVocationalFormChange = (index, e) => {
    const { name, value } = e.target;
    const updatedVocational = [...vocationalFormData];
    updatedVocational[index] = { ...updatedVocational[index], [name]: value };
    setVocationalFormData(updatedVocational);
  };

  const handleAddVocational = () => {
    setVocationalFormData([
      ...vocationalFormData,
      {
        vocationalNameOfSchool: '',
        vocationalDegree: '',
        vocationalPeriodFrom: '',
        vocationalPeriodTo: '',
        vocationalHighestAttained: '',
        vocationalYearGraduated: '',
        vocationalScholarshipAcademicHonorsReceived: '',
        person_id: employeeNumber,
      },
    ]);
  };

  const handleRemoveVocational = (index) => {
    const updatedVocational = [...vocationalFormData];
    updatedVocational.splice(index, 1);
    setVocationalFormData(updatedVocational);
  };

  const handleWorkExperienceFormChange = (index, e) => {
    const { name, value } = e.target;
    const updatedWorkExperiences = [...workExperiencesFormData];
    updatedWorkExperiences[index] = {
      ...updatedWorkExperiences[index],
      [name]: value,
    };
    setWorkExperiencesFormData(updatedWorkExperiences);
  };

  // Add new work experience
  const handleAddWorkExperience = () => {
    setWorkExperiencesFormData([
      ...workExperiencesFormData,
      {
        workDateFrom: '',
        workDateTo: '',
        workPositionTitle: '',
        workCompany: '',
        workMonthlySalary: '',
        SalaryJobOrPayGrade: '',
        StatusOfAppointment: '',
        isGovtService: 'No',
        person_id: employeeNumber,
      },
    ]);
  };

  // Remove work experience
  const handleRemoveWorkExperience = (index) => {
    const updatedWorkExperiences = [...workExperiencesFormData];
    updatedWorkExperiences.splice(index, 1);
    setWorkExperiencesFormData(updatedWorkExperiences);
  };

  const getAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';

    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Format rating as percentage for display
  const formatRating = (rating) => {
    if (!rating) return 'N/A';
    const numRating = parseFloat(rating);
    if (isNaN(numRating)) return 'N/A';
    return `${numRating}%`;
  };

  // Always include the Children, College, Eligibility, Learning and Development, and Other Information tabs
  const tabs = [
    { key: 0, label: 'Personal', icon: <PersonIcon /> },
    { key: 1, label: 'Gov. IDs', icon: <BadgeIcon /> },
    { key: 2, label: 'Addresses', icon: <HomeIcon /> },
    { key: 3, label: 'Contact', icon: <CallIcon /> },
    { key: 4, label: 'Family', icon: <GroupIcon /> },
    { key: 5, label: 'Education', icon: <SchoolIcon /> },
    { key: 6, label: 'Children', icon: <ChildCareIcon /> },
    { key: 7, label: 'Eligibility', icon: <FactCheckIcon /> },
    { key: 8, label: 'Learning & Development', icon: <BookIcon /> },
    { key: 9, label: 'Other Information', icon: <InfoIcon /> },
    { key: 10, label: 'Work Experience', icon: <WorkIcon /> }, // Add this line
  ];

  const formFields = {
    0: [
      {
        label: 'First Name',
        name: 'firstName',
        icon: <PersonIcon fontSize="small" />,
      },
      {
        label: 'Middle Name',
        name: 'middleName',
        icon: <PersonIcon fontSize="small" />,
      },
      {
        label: 'Last Name',
        name: 'lastName',
        icon: <PersonIcon fontSize="small" />,
      },
      {
        label: 'Name Extension',
        name: 'nameExtension',
        icon: <PersonIcon fontSize="small" />,
      },
      {
        label: 'Date of Birth',
        name: 'birthDate',
        type: 'date',
        icon: <CakeIcon fontSize="small" />,
      },
      {
        label: 'Place of Birth',
        name: 'placeOfBirth',
        icon: <LocationOnIcon fontSize="small" />,
      },
    ],
    1: [
      {
        label: 'GSIS Number',
        name: 'gsisNum',
        disabled: true,
        icon: <BadgeIcon fontSize="small" />,
      },
      {
        label: 'Pag-IBIG Number',
        name: 'pagibigNum',
        disabled: true,
        icon: <BadgeIcon fontSize="small" />,
      },
      {
        label: 'PhilHealth Number',
        name: 'philhealthNum',
        disabled: true,
        icon: <BadgeIcon fontSize="small" />,
      },
      {
        label: 'SSS Number',
        name: 'sssNum',
        disabled: true,
        icon: <BadgeIcon fontSize="small" />,
      },
      {
        label: 'TIN Number',
        name: 'tinNum',
        disabled: true,
        icon: <BadgeIcon fontSize="small" />,
      },
      {
        label: 'Agency Employee Number',
        name: 'agencyEmployeeNum',
        disabled: true,
        icon: <BadgeIcon fontSize="small" />,
      },
    ],
    2: [
      {
        label: 'House & Lot Number',
        name: 'permanent_houseBlockLotNum',
        icon: <HomeIcon fontSize="small" />,
      },
      {
        label: 'Street',
        name: 'permanent_streetName',
        icon: <HomeIcon fontSize="small" />,
      },
      {
        label: 'Subdivision',
        name: 'permanent_subdivisionOrVillage',
        icon: <HomeIcon fontSize="small" />,
      },
      {
        label: 'Barangay',
        name: 'permanent_barangay',
        icon: <HomeIcon fontSize="small" />,
      },
      {
        label: 'City/Municipality',
        name: 'permanent_cityOrMunicipality',
        icon: <HomeIcon fontSize="small" />,
      },
      {
        label: 'Province',
        name: 'permanent_provinceName',
        icon: <HomeIcon fontSize="small" />,
      },
      {
        label: 'Zip Code',
        name: 'permanent_zipcode',
        icon: <HomeIcon fontSize="small" />,
      },
    ],
    3: [
      {
        label: 'Telephone',
        name: 'telephone',
        icon: <CallIcon fontSize="small" />,
      },
      {
        label: 'Mobile',
        name: 'mobileNum',
        icon: <PhoneIcon fontSize="small" />,
      },
      {
        label: 'Email',
        name: 'emailAddress',
        icon: <EmailIcon fontSize="small" />,
      },
    ],
    4: [
      {
        label: 'Spouse First Name',
        name: 'spouseFirstName',
        icon: <GroupIcon fontSize="small" />,
      },
      {
        label: 'Spouse Middle Name',
        name: 'spouseMiddleName',
        icon: <GroupIcon fontSize="small" />,
      },
      {
        label: 'Spouse Last Name',
        name: 'spouseLastName',
        icon: <GroupIcon fontSize="small" />,
      },
      {
        label: 'Spouse Occupation',
        name: 'spouseOccupation',
        icon: <WorkIcon fontSize="small" />,
      },
    ],
    5: [], // Education tab will have sub-tabs
    6: [], // Children tab doesn't have form fields
    7: [], // Eligibility tab doesn't have form fields
    8: [], // Learning and Development tab doesn't have form fields
    9: [], // Other Information tab doesn't have form fields
    10: [], // Work Experience tab doesn't have form fields
  };

  if (loading) {
    return (
      <ProfileContainer ref={profileRef}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="70vh"
        >
          <Box textAlign="center">
            <CircularProgress
              size={64}
              thickness={4}
              sx={{ color: colors.primary, mb: 3 }}
            />
            <Typography
              variant="h6"
              color={colors.textPrimary}
              fontWeight={600}
            >
              Loading Profile...
            </Typography>
            <Typography variant="body2" color={colors.textSecondary} mt={1}>
              Fetching data securely — this may take a moment.
            </Typography>
          </Box>
        </Box>
      </ProfileContainer>
    );
  }

  const renderTabContentGrid = (tabIndex) => {
    // Special handling for Education tab with sub-tabs
    // Special handling for Education tab with sub-tabs
    if (tabIndex === 5) {
      return (
        <Box>
          <EducationSubTabs
            value={educationSubTabValue}
            onChange={(e, newValue) => setEducationSubTabValue(newValue)}
            variant="fullWidth"
          >
            <EducationSubTab
              label="Elementary & Secondary"
              icon={<SchoolIcon />}
            />
            <EducationSubTab label="College" icon={<SchoolRoundedIcon />} />
            <EducationSubTab
              label="Graduate Studies"
              icon={<PsychologyIcon />}
            />
            <EducationSubTab label="Vocational" icon={<ConstructionIcon />} />
          </EducationSubTabs>

          {educationSubTabValue === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: shadows.medium,
                    },
                  }}
                >
                  <CardContent sx={{ flex: 1 }}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <SchoolIcon fontSize="small" />
                      <Typography
                        variant="subtitle2"
                        color={colors.textSecondary}
                        ml={1}
                      >
                        Elementary School
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight={500}>
                      {person?.elementaryNameOfSchool || '—'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: shadows.medium,
                    },
                  }}
                >
                  <CardContent sx={{ flex: 1 }}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <SchoolIcon fontSize="small" />
                      <Typography
                        variant="subtitle2"
                        color={colors.textSecondary}
                        ml={1}
                      >
                        Elementary Degree
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight={500}>
                      {person?.elementaryDegree || '—'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: shadows.medium,
                    },
                  }}
                >
                  <CardContent sx={{ flex: 1 }}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <SchoolIcon fontSize="small" />
                      <Typography
                        variant="subtitle2"
                        color={colors.textSecondary}
                        ml={1}
                      >
                        Secondary School
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight={500}>
                      {person?.secondaryNameOfSchool || '—'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: shadows.medium,
                    },
                  }}
                >
                  <CardContent sx={{ flex: 1 }}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <SchoolIcon fontSize="small" />
                      <Typography
                        variant="subtitle2"
                        color={colors.textSecondary}
                        ml={1}
                      >
                        Secondary Degree
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight={500}>
                      {person?.secondaryDegree || '—'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {educationSubTabValue === 1 && (
            <Box>
              {colleges.length > 0 ? (
                <Grid container spacing={3}>
                  {colleges.map((college) => (
                    <Grid item xs={12} sm={6} md={4} key={college.id}>
                      <CollegeCard>
                        <CardContent sx={{ flex: 1 }}>
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            color={colors.textPrimary}
                            mb={1}
                          >
                            {college.collegeNameOfSchool}
                          </Typography>
                          <Typography
                            variant="body2"
                            color={colors.textSecondary}
                            mb={1}
                          >
                            {college.collegeDegree}
                          </Typography>
                          {college.collegePeriodFrom &&
                            college.collegePeriodTo && (
                              <Box display="flex" alignItems="center">
                                <CalendarTodayIcon
                                  sx={{
                                    fontSize: 16,
                                    color: colors.textSecondary,
                                    mr: 1,
                                  }}
                                />
                                <Typography
                                  variant="body2"
                                  color={colors.textSecondary}
                                >
                                  {college.collegePeriodFrom} -{' '}
                                  {college.collegePeriodTo}
                                </Typography>
                              </Box>
                            )}
                        </CardContent>
                      </CollegeCard>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="h6" color={colors.textSecondary}>
                    No college records found
                  </Typography>
                  <Typography
                    variant="body2"
                    color={colors.textSecondary}
                    mt={1}
                  >
                    Click "Edit Profile" to add college records
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {educationSubTabValue === 2 && (
            <Box>
              {graduates.length > 0 ? (
                <Grid container spacing={3}>
                  {graduates.map((graduate) => (
                    <Grid item xs={12} sm={6} md={4} key={graduate.id}>
                      <GraduateCard>
                        <CardContent sx={{ flex: 1 }}>
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            color={colors.textPrimary}
                            mb={1}
                          >
                            {graduate.graduateNameOfSchool}
                          </Typography>
                          <Typography
                            variant="body2"
                            color={colors.textSecondary}
                            mb={1}
                          >
                            {graduate.graduateDegree}
                          </Typography>
                          {graduate.graduatePeriodFrom &&
                            graduate.graduatePeriodTo && (
                              <Box display="flex" alignItems="center">
                                <CalendarTodayIcon
                                  sx={{
                                    fontSize: 16,
                                    color: colors.textSecondary,
                                    mr: 1,
                                  }}
                                />
                                <Typography
                                  variant="body2"
                                  color={colors.textSecondary}
                                >
                                  {graduate.graduatePeriodFrom} -{' '}
                                  {graduate.graduatePeriodTo}
                                </Typography>
                              </Box>
                            )}
                        </CardContent>
                      </GraduateCard>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="h6" color={colors.textSecondary}>
                    No graduate studies records found
                  </Typography>
                  <Typography
                    variant="body2"
                    color={colors.textSecondary}
                    mt={1}
                  >
                    Click "Edit Profile" to add graduate studies records
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {educationSubTabValue === 3 && (
            <Box>
              {vocational.length > 0 ? (
                <Grid container spacing={3}>
                  {vocational.map((voc) => (
                    <Grid item xs={12} sm={6} md={4} key={voc.id}>
                      <VocationalCard>
                        <CardContent sx={{ flex: 1 }}>
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            color={colors.textPrimary}
                            mb={1}
                          >
                            {voc.vocationalNameOfSchool}
                          </Typography>
                          <Typography
                            variant="body2"
                            color={colors.textSecondary}
                            mb={1}
                          >
                            {voc.vocationalDegree}
                          </Typography>
                          {voc.vocationalPeriodFrom &&
                            voc.vocationalPeriodTo && (
                              <Box display="flex" alignItems="center">
                                <CalendarTodayIcon
                                  sx={{
                                    fontSize: 16,
                                    color: colors.textSecondary,
                                    mr: 1,
                                  }}
                                />
                                <Typography
                                  variant="body2"
                                  color={colors.textSecondary}
                                >
                                  {voc.vocationalPeriodFrom} -{' '}
                                  {voc.vocationalPeriodTo}
                                </Typography>
                              </Box>
                            )}
                        </CardContent>
                      </VocationalCard>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="h6" color={colors.textSecondary}>
                    No vocational records found
                  </Typography>
                  <Typography
                    variant="body2"
                    color={colors.textSecondary}
                    mt={1}
                  >
                    Click "Edit Profile" to add vocational records
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      );
    }

    // Special handling for Children tab
    if (tabIndex === 6) {
      return (
        <Box>
          <ScrollableContainer>
            {children.length > 0 ? (
              <Grid container spacing={3}>
                {children.map((child) => (
                  <Grid item xs={12} sm={6} md={4} key={child.id}>
                    <ChildCard>
                      <CardContent sx={{ flex: 1 }}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <ChildCareIcon
                            sx={{ color: colors.primary, mr: 1 }}
                          />
                        </Box>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color={colors.textPrimary}
                          mb={1}
                        >
                          {child.childrenFirstName} {child.childrenMiddleName}{' '}
                          {child.childrenLastName}
                          {child.childrenNameExtension &&
                            ` ${child.childrenNameExtension}`}
                        </Typography>
                        {child.dateOfBirth && (
                          <Box display="flex" alignItems="center" mb={1}>
                            <CakeIcon
                              sx={{
                                fontSize: 16,
                                color: colors.textSecondary,
                                mr: 1,
                              }}
                            />
                            <Typography
                              variant="body2"
                              color={colors.textSecondary}
                            >
                              {new Date(child.dateOfBirth).toLocaleDateString()}{' '}
                              (Age: {getAge(child.dateOfBirth)})
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </ChildCard>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box textAlign="center" py={4}>
                <Typography variant="h6" color={colors.textSecondary}>
                  No children records found
                </Typography>
                <Typography variant="body2" color={colors.textSecondary} mt={1}>
                  Click "Edit Profile" to add children records
                </Typography>
              </Box>
            )}
          </ScrollableContainer>
        </Box>
      );
    }

    // Special handling for Eligibility tab
    if (tabIndex === 7) {
      return (
        <Box>
          <ScrollableContainer>
            {eligibilities.length > 0 ? (
              <Grid container spacing={3}>
                {eligibilities.map((eligibility) => (
                  <Grid item xs={12} sm={6} md={4} key={eligibility.id}>
                    <EligibilityCard>
                      <CardContent sx={{ flex: 1 }}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <FactCheckIcon
                            sx={{ color: colors.primary, mr: 1 }}
                          />
                        </Box>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color={colors.textPrimary}
                          mb={1}
                        >
                          {eligibility.eligibilityName}
                        </Typography>
                        <Typography
                          variant="body2"
                          color={colors.textSecondary}
                          mb={1}
                        >
                          Rating: {formatRating(eligibility.eligibilityRating)}
                        </Typography>
                        {eligibility.licenseNumber && (
                          <Box display="flex" alignItems="center" mb={1}>
                            <Typography
                              variant="body2"
                              color={colors.textSecondary}
                              sx={{ mr: 1 }}
                            >
                              License:
                            </Typography>
                            <Typography
                              variant="body2"
                              color={colors.textPrimary}
                            >
                              {eligibility.licenseNumber}
                            </Typography>
                          </Box>
                        )}
                        {eligibility.DateOfValidity && (
                          <Box display="flex" alignItems="center">
                            <Typography
                              variant="body2"
                              color={colors.textSecondary}
                              sx={{ mr: 1 }}
                            >
                              Valid Until:
                            </Typography>
                            <Typography
                              variant="body2"
                              color={colors.textPrimary}
                            >
                              {new Date(
                                eligibility.DateOfValidity
                              ).toLocaleDateString()}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </EligibilityCard>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box textAlign="center" py={4}>
                <Typography variant="h6" color={colors.textSecondary}>
                  No eligibility records found
                </Typography>
                <Typography variant="body2" color={colors.textSecondary} mt={1}>
                  Click "Edit Profile" to add eligibility records
                </Typography>
              </Box>
            )}
          </ScrollableContainer>
        </Box>
      );
    }

    // Special handling for Learning and Development tab
    if (tabIndex === 8) {
      return (
        <Box>
          <ScrollableContainer>
            {learningDevelopment.length > 0 ? (
              <Grid container spacing={3}>
                {learningDevelopment.map((learning) => (
                  <Grid item xs={12} sm={6} md={4} key={learning.id}>
                    <LearningDevelopmentCard>
                      <CardContent sx={{ flex: 1 }}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <LightbulbIcon
                            sx={{ color: colors.primary, mr: 1 }}
                          />
                        </Box>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color={colors.textPrimary}
                          mb={1}
                        >
                          {learning.titleOfProgram}
                        </Typography>
                        <Typography
                          variant="body2"
                          color={colors.textSecondary}
                          mb={1}
                        >
                          Type: {learning.typeOfLearningDevelopment || 'N/A'}
                        </Typography>
                        {learning.dateFrom && learning.dateTo && (
                          <Box display="flex" alignItems="center" mb={1}>
                            <CalendarTodayIcon
                              sx={{
                                fontSize: 16,
                                color: colors.textSecondary,
                                mr: 1,
                              }}
                            />
                            <Typography
                              variant="body2"
                              color={colors.textSecondary}
                            >
                              {learning.dateFrom} - {learning.dateTo}
                            </Typography>
                          </Box>
                        )}
                        {learning.numberOfHours && (
                          <Typography
                            variant="body2"
                            color={colors.textSecondary}
                            mb={1}
                          >
                            Hours: {learning.numberOfHours}
                          </Typography>
                        )}
                        {learning.conductedSponsored && (
                          <Typography
                            variant="body2"
                            color={colors.textSecondary}
                          >
                            Conducted/Sponsored by:{' '}
                            {learning.conductedSponsored}
                          </Typography>
                        )}
                      </CardContent>
                    </LearningDevelopmentCard>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box textAlign="center" py={4}>
                <Typography variant="h6" color={colors.textSecondary}>
                  No learning and development records found
                </Typography>
                <Typography variant="body2" color={colors.textSecondary} mt={1}>
                  Click "Edit Profile" to add learning and development records
                </Typography>
              </Box>
            )}
          </ScrollableContainer>
        </Box>
      );
    }

    // Special handling for Other Information tab
    if (tabIndex === 9) {
      return (
        <Box>
          <ScrollableContainer>
            {otherInformation.length > 0 ? (
              <Grid container spacing={3}>
                {otherInformation.map((info) => (
                  <Grid item xs={12} sm={6} md={4} key={info.id}>
                    <OtherInformationCard>
                      <CardContent sx={{ flex: 1 }}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <InfoIcon sx={{ color: colors.primary, mr: 1 }} />
                        </Box>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color={colors.textPrimary}
                          mb={1}
                        >
                          Other Information
                        </Typography>
                        {info.specialSkills && (
                          <Typography
                            variant="body2"
                            color={colors.textSecondary}
                            mb={1}
                          >
                            Skills:{' '}
                            {info.specialSkills.length > 50
                              ? `${info.specialSkills.substring(0, 50)}...`
                              : info.specialSkills}
                          </Typography>
                        )}
                        {info.nonAcademicDistinctions && (
                          <Typography
                            variant="body2"
                            color={colors.textSecondary}
                            mb={1}
                          >
                            Distinctions:{' '}
                            {info.nonAcademicDistinctions.length > 50
                              ? `${info.nonAcademicDistinctions.substring(
                                  0,
                                  50
                                )}...`
                              : info.nonAcademicDistinctions}
                          </Typography>
                        )}
                        {info.membershipInAssociation && (
                          <Typography
                            variant="body2"
                            color={colors.textSecondary}
                          >
                            Associations:{' '}
                            {info.membershipInAssociation.length > 50
                              ? `${info.membershipInAssociation.substring(
                                  0,
                                  50
                                )}...`
                              : info.membershipInAssociation}
                          </Typography>
                        )}
                      </CardContent>
                    </OtherInformationCard>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box textAlign="center" py={4}>
                <Typography variant="h6" color={colors.textSecondary}>
                  No other information records found
                </Typography>
                <Typography variant="body2" color={colors.textSecondary} mt={1}>
                  Click "Edit Profile" to add other information records
                </Typography>
              </Box>
            )}
          </ScrollableContainer>
        </Box>
      );
    }

    if (tabIndex === 10) {
      return (
        <Box>
          <ScrollableContainer>
            {workExperiences.length > 0 ? (
              <Grid container spacing={3}>
                {workExperiences.map((workExp) => (
                  <Grid item xs={12} sm={6} md={4} key={workExp.id}>
                    <WorkExperienceCard>
                      <CardContent sx={{ flex: 1 }}>
                        <Box display="flex" alignItems="center" mb={1}>
                          <WorkIcon sx={{ color: colors.primary, mr: 1 }} />
                        </Box>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color={colors.textPrimary}
                          mb={1}
                        >
                          {workExp.workPositionTitle}
                        </Typography>
                        <Typography
                          variant="body2"
                          color={colors.textSecondary}
                          mb={1}
                        >
                          {workExp.workCompany}
                        </Typography>
                        {workExp.workDateFrom && workExp.workDateTo && (
                          <Box display="flex" alignItems="center" mb={1}>
                            <CalendarTodayIcon
                              sx={{
                                fontSize: 16,
                                color: colors.textSecondary,
                                mr: 1,
                              }}
                            />
                            <Typography
                              variant="body2"
                              color={colors.textSecondary}
                            >
                              {new Date(
                                workExp.workDateFrom
                              ).toLocaleDateString()}{' '}
                              -{' '}
                              {new Date(
                                workExp.workDateTo
                              ).toLocaleDateString()}
                            </Typography>
                          </Box>
                        )}
                        {workExp.workMonthlySalary && (
                          <Typography
                            variant="body2"
                            color={colors.textSecondary}
                            mb={1}
                          >
                            Salary: ₱
                            {parseFloat(
                              workExp.workMonthlySalary
                            ).toLocaleString()}
                          </Typography>
                        )}
                        {workExp.isGovtService && (
                          <Chip
                            label={
                              workExp.isGovtService === 'Yes'
                                ? 'Government'
                                : 'Private'
                            }
                            size="small"
                            sx={{
                              backgroundColor:
                                workExp.isGovtService === 'Yes'
                                  ? alpha(colors.primary, 0.1)
                                  : alpha(colors.secondary, 0.5),
                              color:
                                workExp.isGovtService === 'Yes'
                                  ? colors.primary
                                  : colors.textSecondary,
                              fontWeight: 600,
                            }}
                          />
                        )}
                      </CardContent>
                    </WorkExperienceCard>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box textAlign="center" py={4}>
                <Typography variant="h6" color={colors.textSecondary}>
                  No work experience records found
                </Typography>
                <Typography variant="body2" color={colors.textSecondary} mt={1}>
                  Click "Edit Profile" to add work experience records
                </Typography>
              </Box>
            )}
          </ScrollableContainer>
        </Box>
      );
    }

    const fields = formFields[tabIndex] || [];

    return (
      <Grid container spacing={3}>
        {fields.map((field, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: shadows.medium,
                },
              }}
            >
              <CardContent sx={{ flex: 1 }}>
                <Box display="flex" alignItems="center" mb={1}>
                  {field.icon}
                  <Typography
                    variant="subtitle2"
                    color={colors.textSecondary}
                    ml={1}
                  >
                    {field.label}
                  </Typography>
                </Box>
                <Typography variant="body1" fontWeight={500}>
                  {person?.[field.name] || '—'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderTabContentList = (tabIndex) => {
    // Special handling for Education tab with sub-tabs
    // Special handling for Education tab with sub-tabs
    if (tabIndex === 5) {
      return (
        <Box>
          <EducationSubTabs
            value={educationSubTabValue}
            onChange={(e, newValue) => setEducationSubTabValue(newValue)}
            variant="fullWidth"
          >
            <EducationSubTab
              label="Elementary & Secondary"
              icon={<SchoolIcon />}
            />
            <EducationSubTab label="College" icon={<SchoolRoundedIcon />} />
            <EducationSubTab
              label="Graduate Studies"
              icon={<PsychologyIcon />}
            />
            <EducationSubTab label="Vocational" icon={<ConstructionIcon />} />
          </EducationSubTabs>

          {educationSubTabValue === 0 && (
            <Box>
              <InfoItem>
                <InfoLabel variant="body2">
                  <SchoolIcon fontSize="small" />
                  Elementary School:
                </InfoLabel>
                <InfoValue variant="body1">
                  {person?.elementaryNameOfSchool || '—'}
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel variant="body2">
                  <SchoolIcon fontSize="small" />
                  Elementary Degree:
                </InfoLabel>
                <InfoValue variant="body1">
                  {person?.elementaryDegree || '—'}
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel variant="body2">
                  <SchoolIcon fontSize="small" />
                  Secondary School:
                </InfoLabel>
                <InfoValue variant="body1">
                  {person?.secondaryNameOfSchool || '—'}
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel variant="body2">
                  <SchoolIcon fontSize="small" />
                  Secondary Degree:
                </InfoLabel>
                <InfoValue variant="body1">
                  {person?.secondaryDegree || '—'}
                </InfoValue>
              </InfoItem>
            </Box>
          )}

          {educationSubTabValue === 1 && (
            <Box>
              <ScrollableContainer>
                {colleges.length > 0 ? (
                  <List>
                    {colleges.map((college) => (
                      <React.Fragment key={college.id}>
                        <CollegeListItem>
                          <MuiListItemIcon>
                            <SchoolRoundedIcon sx={{ color: colors.primary }} />
                          </MuiListItemIcon>
                          <MuiListItemText
                            primary={college.collegeNameOfSchool}
                            secondary={
                              college.collegeDegree
                                ? `${college.collegeDegree} (${
                                    college.collegePeriodFrom || 'N/A'
                                  } - ${college.collegePeriodTo || 'N/A'})`
                                : 'No degree information'
                            }
                          />
                        </CollegeListItem>
                        <Divider variant="inset" component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Box textAlign="center" py={4}>
                    <Typography variant="h6" color={colors.textSecondary}>
                      No college records found
                    </Typography>
                    <Typography
                      variant="body2"
                      color={colors.textSecondary}
                      mt={1}
                    >
                      Click "Edit Profile" to add college records
                    </Typography>
                  </Box>
                )}
              </ScrollableContainer>
            </Box>
          )}

          {educationSubTabValue === 2 && (
            <Box>
              <ScrollableContainer>
                {graduates.length > 0 ? (
                  <List>
                    {graduates.map((graduate) => (
                      <React.Fragment key={graduate.id}>
                        <GraduateListItem>
                          <MuiListItemIcon>
                            <PsychologyIcon sx={{ color: colors.primary }} />
                          </MuiListItemIcon>
                          <MuiListItemText
                            primary={graduate.graduateNameOfSchool}
                            secondary={
                              graduate.graduateDegree
                                ? `${graduate.graduateDegree} (${
                                    graduate.graduatePeriodFrom || 'N/A'
                                  } - ${graduate.graduatePeriodTo || 'N/A'})`
                                : 'No degree information'
                            }
                          />
                        </GraduateListItem>
                        <Divider variant="inset" component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Box textAlign="center" py={4}>
                    <Typography variant="h6" color={colors.textSecondary}>
                      No graduate studies records found
                    </Typography>
                    <Typography
                      variant="body2"
                      color={colors.textSecondary}
                      mt={1}
                    >
                      Click "Edit Profile" to add graduate studies records
                    </Typography>
                  </Box>
                )}
              </ScrollableContainer>
            </Box>
          )}

          {educationSubTabValue === 3 && (
            <Box>
              <ScrollableContainer>
                {vocational.length > 0 ? (
                  <List>
                    {vocational.map((voc) => (
                      <React.Fragment key={voc.id}>
                        <VocationalListItem>
                          <MuiListItemIcon>
                            <ConstructionIcon sx={{ color: colors.primary }} />
                          </MuiListItemIcon>
                          <MuiListItemText
                            primary={voc.vocationalNameOfSchool}
                            secondary={
                              voc.vocationalDegree
                                ? `${voc.vocationalDegree} (${
                                    voc.vocationalPeriodFrom || 'N/A'
                                  } - ${voc.vocationalPeriodTo || 'N/A'})`
                                : 'No degree information'
                            }
                          />
                        </VocationalListItem>
                        <Divider variant="inset" component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Box textAlign="center" py={4}>
                    <Typography variant="h6" color={colors.textSecondary}>
                      No vocational records found
                    </Typography>
                    <Typography
                      variant="body2"
                      color={colors.textSecondary}
                      mt={1}
                    >
                      Click "Edit Profile" to add vocational records
                    </Typography>
                  </Box>
                )}
              </ScrollableContainer>
            </Box>
          )}
        </Box>
      );
    }

    // Special handling for Children tab
    if (tabIndex === 6) {
      return (
        <Box>
          <ScrollableContainer>
            {children.length > 0 ? (
              <List>
                {children.map((child) => (
                  <React.Fragment key={child.id}>
                    <ChildListItem>
                      <MuiListItemIcon>
                        <ChildCareIcon sx={{ color: colors.primary }} />
                      </MuiListItemIcon>
                      <MuiListItemText
                        primary={`${child.childrenFirstName} ${
                          child.childrenMiddleName
                        } ${child.childrenLastName}${
                          child.childrenNameExtension
                            ? ` ${child.childrenNameExtension}`
                            : ''
                        }`}
                        secondary={
                          child.dateOfBirth
                            ? `Born: ${new Date(
                                child.dateOfBirth
                              ).toLocaleDateString()} (Age: {getAge(child.dateOfBirth)})`
                            : 'No birth date recorded'
                        }
                      />
                    </ChildListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box textAlign="center" py={4}>
                <Typography variant="h6" color={colors.textSecondary}>
                  No children records found
                </Typography>
                <Typography variant="body2" color={colors.textSecondary} mt={1}>
                  Click "Edit Profile" to add children records
                </Typography>
              </Box>
            )}
          </ScrollableContainer>
        </Box>
      );
    }

    // Special handling for Eligibility tab
    if (tabIndex === 7) {
      return (
        <Box>
          <ScrollableContainer>
            {eligibilities.length > 0 ? (
              <List>
                {eligibilities.map((eligibility) => (
                  <React.Fragment key={eligibility.id}>
                    <EligibilityListItem>
                      <MuiListItemIcon>
                        <FactCheckIcon sx={{ color: colors.primary }} />
                      </MuiListItemIcon>
                      <MuiListItemText
                        primary={eligibility.eligibilityName}
                        secondary={
                          <>
                            Rating:{' '}
                            {formatRating(eligibility.eligibilityRating)}
                            {eligibility.licenseNumber && (
                              <Typography component="span" sx={{ ml: 1 }}>
                                License: {eligibility.licenseNumber}
                              </Typography>
                            )}
                            {eligibility.DateOfValidity && (
                              <Typography
                                component="span"
                                sx={{ ml: 1, display: 'block' }}
                              >
                                Valid Until:{' '}
                                {new Date(
                                  eligibility.DateOfValidity
                                ).toLocaleDateString()}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </EligibilityListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box textAlign="center" py={4}>
                <Typography variant="h6" color={colors.textSecondary}>
                  No eligibility records found
                </Typography>
                <Typography variant="body2" color={colors.textSecondary} mt={1}>
                  Click "Edit Profile" to add eligibility records
                </Typography>
              </Box>
            )}
          </ScrollableContainer>
        </Box>
      );
    }

    // Special handling for Learning and Development tab
    if (tabIndex === 8) {
      return (
        <Box>
          <ScrollableContainer>
            {learningDevelopment.length > 0 ? (
              <List>
                {learningDevelopment.map((learning) => (
                  <React.Fragment key={learning.id}>
                    <LearningDevelopmentListItem>
                      <MuiListItemIcon>
                        <LightbulbIcon sx={{ color: colors.primary }} />
                      </MuiListItemIcon>
                      <MuiListItemText
                        primary={learning.titleOfProgram}
                        secondary={
                          <>
                            Type: {learning.typeOfLearningDevelopment || 'N/A'}
                            {learning.dateFrom && learning.dateTo && (
                              <Typography
                                component="span"
                                sx={{ ml: 1, display: 'block' }}
                              >
                                Period: {learning.dateFrom} - {learning.dateTo}
                              </Typography>
                            )}
                            {learning.numberOfHours && (
                              <Typography
                                component="span"
                                sx={{ ml: 1, display: 'block' }}
                              >
                                Hours: {learning.numberOfHours}
                              </Typography>
                            )}
                            {learning.conductedSponsored && (
                              <Typography
                                component="span"
                                sx={{ ml: 1, display: 'block' }}
                              >
                                Conducted/Sponsored by:{' '}
                                {learning.conductedSponsored}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </LearningDevelopmentListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box textAlign="center" py={4}>
                <Typography variant="h6" color={colors.textSecondary}>
                  No learning and development records found
                </Typography>
                <Typography variant="body2" color={colors.textSecondary} mt={1}>
                  Click "Edit Profile" to add learning and development records
                </Typography>
              </Box>
            )}
          </ScrollableContainer>
        </Box>
      );
    }

    // Special handling for Other Information tab
    if (tabIndex === 9) {
      return (
        <Box>
          <ScrollableContainer>
            {otherInformation.length > 0 ? (
              <List>
                {otherInformation.map((info) => (
                  <React.Fragment key={info.id}>
                    <OtherInformationListItem>
                      <MuiListItemIcon>
                        <InfoIcon sx={{ color: colors.primary }} />
                      </MuiListItemIcon>
                      <MuiListItemText
                        primary="Other Information"
                        secondary={
                          <>
                            {info.specialSkills && (
                              <Typography
                                component="span"
                                sx={{ display: 'block' }}
                              >
                                Skills: {info.specialSkills}
                              </Typography>
                            )}
                            {info.nonAcademicDistinctions && (
                              <Typography
                                component="span"
                                sx={{ display: 'block' }}
                              >
                                Distinctions: {info.nonAcademicDistinctions}
                              </Typography>
                            )}
                            {info.membershipInAssociation && (
                              <Typography
                                component="span"
                                sx={{ display: 'block' }}
                              >
                                Associations: {info.membershipInAssociation}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </OtherInformationListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box textAlign="center" py={4}>
                <Typography variant="h6" color={colors.textSecondary}>
                  No other information records found
                </Typography>
                <Typography variant="body2" color={colors.textSecondary} mt={1}>
                  Click "Edit Profile" to add other information records
                </Typography>
              </Box>
            )}
          </ScrollableContainer>
        </Box>
      );
    }

    if (tabIndex === 10) {
      return (
        <Box>
          <ScrollableContainer>
            {workExperiences.length > 0 ? (
              <List>
                {workExperiences.map((workExp) => (
                  <React.Fragment key={workExp.id}>
                    <WorkExperienceListItem>
                      <MuiListItemIcon>
                        <WorkIcon sx={{ color: colors.primary }} />
                      </MuiListItemIcon>
                      <MuiListItemText
                        primary={workExp.workPositionTitle}
                        secondary={
                          <>
                            <Typography
                              component="span"
                              sx={{ display: 'block' }}
                            >
                              {workExp.workCompany}
                            </Typography>
                            {workExp.workDateFrom && workExp.workDateTo && (
                              <Typography
                                component="span"
                                sx={{ display: 'block' }}
                              >
                                {new Date(
                                  workExp.workDateFrom
                                ).toLocaleDateString()}{' '}
                                -{' '}
                                {new Date(
                                  workExp.workDateTo
                                ).toLocaleDateString()}
                              </Typography>
                            )}
                            {workExp.workMonthlySalary && (
                              <Typography
                                component="span"
                                sx={{ display: 'block' }}
                              >
                                Salary: ₱
                                {parseFloat(
                                  workExp.workMonthlySalary
                                ).toLocaleString()}
                              </Typography>
                            )}
                            {workExp.isGovtService && (
                              <Typography
                                component="span"
                                sx={{ display: 'block' }}
                              >
                                Service Type:{' '}
                                {workExp.isGovtService === 'Yes'
                                  ? 'Government'
                                  : 'Private'}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </WorkExperienceListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box textAlign="center" py={4}>
                <Typography variant="h6" color={colors.textSecondary}>
                  No work experience records found
                </Typography>
                <Typography variant="body2" color={colors.textSecondary} mt={1}>
                  Click "Edit Profile" to add work experience records
                </Typography>
              </Box>
            )}
          </ScrollableContainer>
        </Box>
      );
    }

    const fields = formFields[tabIndex] || [];

    return (
      <Box>
        {fields.map((field, idx) => (
          <InfoItem key={idx}>
            <InfoLabel variant="body2">
              {field.icon}
              {field.label}:
            </InfoLabel>
            <InfoValue variant="body1">{person?.[field.name] || '—'}</InfoValue>
          </InfoItem>
        ))}
      </Box>
    );
  };

  const renderFormFields = () => {
    // Special handling for Education tab with sub-tabs
    if (tabValue === 5) {
      return (
        <Box>
          <Typography variant="h6" gutterBottom>
            Education Information
          </Typography>

          {/* Add the sub-tabs navigation here */}
          <EducationSubTabs
            value={educationSubTabValue}
            onChange={(e, newValue) => setEducationSubTabValue(newValue)}
            variant="fullWidth"
          >
            <EducationSubTab
              label="Elementary & Secondary"
              icon={<SchoolIcon />}
            />
            <EducationSubTab label="College" icon={<SchoolRoundedIcon />} />
            <EducationSubTab
              label="Graduate Studies"
              icon={<PsychologyIcon />}
            />
            <EducationSubTab label="Vocational" icon={<ConstructionIcon />} />
          </EducationSubTabs>

          {educationSubTabValue === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Elementary & Secondary Education
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                This section displays your elementary and secondary education
                information.
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormField
                    fullWidth
                    label="Elementary School"
                    name="elementaryNameOfSchool"
                    value={formData.elementaryNameOfSchool || ''}
                    onChange={handleFormChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormField
                    fullWidth
                    label="Elementary Degree"
                    name="elementaryDegree"
                    value={formData.elementaryDegree || ''}
                    onChange={handleFormChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormField
                    fullWidth
                    label="Secondary School"
                    name="secondaryNameOfSchool"
                    value={formData.secondaryNameOfSchool || ''}
                    onChange={handleFormChange}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormField
                    fullWidth
                    label="Secondary Degree"
                    name="secondaryDegree"
                    value={formData.secondaryDegree || ''}
                    onChange={handleFormChange}
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {educationSubTabValue === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                College Information
              </Typography>

              {collegesFormData.length > 0 ? (
                <Box>
                  {collegesFormData.map((college, index) => (
                    <Box
                      key={index}
                      mb={3}
                      p={2}
                      sx={{
                        backgroundColor: alpha(colors.secondary, 0.3),
                        borderRadius: 2,
                      }}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={2}
                      >
                        <Typography variant="h6">
                          College {index + 1}
                        </Typography>
                        <IconButton
                          onClick={() => handleRemoveCollege(index)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <FormField
                            fullWidth
                            label="College Name"
                            name="collegeNameOfSchool"
                            value={college.collegeNameOfSchool || ''}
                            onChange={(e) => handleCollegeFormChange(index, e)}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <FormField
                            fullWidth
                            label="Degree"
                            name="collegeDegree"
                            value={college.collegeDegree || ''}
                            onChange={(e) => handleCollegeFormChange(index, e)}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormField
                            fullWidth
                            label="Period From"
                            name="collegePeriodFrom"
                            value={college.collegePeriodFrom || ''}
                            onChange={(e) => handleCollegeFormChange(index, e)}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormField
                            fullWidth
                            label="Period To"
                            name="collegePeriodTo"
                            value={college.collegePeriodTo || ''}
                            onChange={(e) => handleCollegeFormChange(index, e)}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormField
                            fullWidth
                            label="Highest Attained"
                            name="collegeHighestAttained"
                            value={college.collegeHighestAttained || ''}
                            onChange={(e) => handleCollegeFormChange(index, e)}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormField
                            fullWidth
                            label="Year Graduated"
                            name="collegeYearGraduated"
                            value={college.collegeYearGraduated || ''}
                            onChange={(e) => handleCollegeFormChange(index, e)}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <FormField
                            fullWidth
                            label="Honors Received"
                            name="collegeScholarshipAcademicHonorsReceived"
                            value={
                              college.collegeScholarshipAcademicHonorsReceived ||
                              ''
                            }
                            onChange={(e) => handleCollegeFormChange(index, e)}
                            variant="outlined"
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="h6" color={colors.textSecondary}>
                    No college records found
                  </Typography>
                </Box>
              )}

              <Box mt={2} display="flex" justifyContent="center">
                <ActionButton
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddCollege}
                >
                  Add College
                </ActionButton>
              </Box>
            </Box>
          )}

          {educationSubTabValue === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Graduate Studies Information
              </Typography>

              {graduatesFormData.length > 0 ? (
                <Box>
                  {graduatesFormData.map((graduate, index) => (
                    <Box
                      key={index}
                      mb={3}
                      p={2}
                      sx={{
                        backgroundColor: alpha(colors.secondary, 0.3),
                        borderRadius: 2,
                      }}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={2}
                      >
                        <Typography variant="h6">
                          Graduate Studies {index + 1}
                        </Typography>
                        <IconButton
                          onClick={() => handleRemoveGraduate(index)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <FormField
                            fullWidth
                            label="School Name"
                            name="graduateNameOfSchool"
                            value={graduate.graduateNameOfSchool || ''}
                            onChange={(e) => handleGraduateFormChange(index, e)}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <FormField
                            fullWidth
                            label="Degree"
                            name="graduateDegree"
                            value={graduate.graduateDegree || ''}
                            onChange={(e) => handleGraduateFormChange(index, e)}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormField
                            fullWidth
                            label="Period From"
                            name="graduatePeriodFrom"
                            value={graduate.graduatePeriodFrom || ''}
                            onChange={(e) => handleGraduateFormChange(index, e)}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormField
                            fullWidth
                            label="Period To"
                            name="graduatePeriodTo"
                            value={graduate.graduatePeriodTo || ''}
                            onChange={(e) => handleGraduateFormChange(index, e)}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormField
                            fullWidth
                            label="Highest Level"
                            name="graduateHighestLevel"
                            value={graduate.graduateHighestLevel || ''}
                            onChange={(e) => handleGraduateFormChange(index, e)}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormField
                            fullWidth
                            label="Year Graduated"
                            name="graduateYearGraduated"
                            value={graduate.graduateYearGraduated || ''}
                            onChange={(e) => handleGraduateFormChange(index, e)}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <FormField
                            fullWidth
                            label="Honors Received"
                            name="graduateScholarshipAcademicHonorsReceived"
                            value={
                              graduate.graduateScholarshipAcademicHonorsReceived ||
                              ''
                            }
                            onChange={(e) => handleGraduateFormChange(index, e)}
                            variant="outlined"
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="h6" color={colors.textSecondary}>
                    No graduate studies records found
                  </Typography>
                </Box>
              )}

              <Box mt={2} display="flex" justifyContent="center">
                <ActionButton
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddGraduate}
                >
                  Add Graduate Studies
                </ActionButton>
              </Box>
            </Box>
          )}

          {educationSubTabValue === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Vocational Information
              </Typography>

              {vocationalFormData.length > 0 ? (
                <Box>
                  {vocationalFormData.map((voc, index) => (
                    <Box
                      key={index}
                      mb={3}
                      p={2}
                      sx={{
                        backgroundColor: alpha(colors.secondary, 0.3),
                        borderRadius: 2,
                      }}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={2}
                      >
                        <Typography variant="h6">
                          Vocational {index + 1}
                        </Typography>
                        <IconButton
                          onClick={() => handleRemoveVocational(index)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <FormField
                            fullWidth
                            label="School Name"
                            name="vocationalNameOfSchool"
                            value={voc.vocationalNameOfSchool || ''}
                            onChange={(e) =>
                              handleVocationalFormChange(index, e)
                            }
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <FormField
                            fullWidth
                            label="Degree"
                            name="vocationalDegree"
                            value={voc.vocationalDegree || ''}
                            onChange={(e) =>
                              handleVocationalFormChange(index, e)
                            }
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormField
                            fullWidth
                            label="Period From"
                            name="vocationalPeriodFrom"
                            value={voc.vocationalPeriodFrom || ''}
                            onChange={(e) =>
                              handleVocationalFormChange(index, e)
                            }
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormField
                            fullWidth
                            label="Period To"
                            name="vocationalPeriodTo"
                            value={voc.vocationalPeriodTo || ''}
                            onChange={(e) =>
                              handleVocationalFormChange(index, e)
                            }
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormField
                            fullWidth
                            label="Highest Attained"
                            name="vocationalHighestAttained"
                            value={voc.vocationalHighestAttained || ''}
                            onChange={(e) =>
                              handleVocationalFormChange(index, e)
                            }
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormField
                            fullWidth
                            label="Year Graduated"
                            name="vocationalYearGraduated"
                            value={voc.vocationalYearGraduated || ''}
                            onChange={(e) =>
                              handleVocationalFormChange(index, e)
                            }
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <FormField
                            fullWidth
                            label="Honors Received"
                            name="vocationalScholarshipAcademicHonorsReceived"
                            value={
                              voc.vocationalScholarshipAcademicHonorsReceived ||
                              ''
                            }
                            onChange={(e) =>
                              handleVocationalFormChange(index, e)
                            }
                            variant="outlined"
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="h6" color={colors.textSecondary}>
                    No vocational records found
                  </Typography>
                </Box>
              )}

              <Box mt={2} display="flex" justifyContent="center">
                <ActionButton
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddVocational}
                >
                  Add Vocational
                </ActionButton>
              </Box>
            </Box>
          )}
        </Box>
      );
    }

    // Special handling for Children tab
    if (tabValue === 6) {
      return (
        <Box>
          <Typography variant="h6" gutterBottom>
            Children Information
          </Typography>

          {childrenFormData.length > 0 ? (
            <Box>
              {childrenFormData.map((child, index) => (
                <Box
                  key={index}
                  mb={3}
                  p={2}
                  sx={{
                    backgroundColor: alpha(colors.secondary, 0.3),
                    borderRadius: 2,
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h6">Child {index + 1}</Typography>
                    <IconButton
                      onClick={() => handleRemoveChild(index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="First Name"
                        name="childrenFirstName"
                        value={child.childrenFirstName || ''}
                        onChange={(e) => handleChildrenFormChange(index, e)}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Middle Name"
                        name="childrenMiddleName"
                        value={child.childrenMiddleName || ''}
                        onChange={(e) => handleChildrenFormChange(index, e)}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Last Name"
                        name="childrenLastName"
                        value={child.childrenLastName || ''}
                        onChange={(e) => handleChildrenFormChange(index, e)}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Name Extension"
                        name="childrenNameExtension"
                        value={child.childrenNameExtension || ''}
                        onChange={(e) => handleChildrenFormChange(index, e)}
                        variant="outlined"
                        placeholder="e.g., Jr., Sr., III"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormField
                        fullWidth
                        label="Date of Birth"
                        name="dateOfBirth"
                        type="date"
                        value={child.dateOfBirth || ''}
                        onChange={(e) => handleChildrenFormChange(index, e)}
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Box>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color={colors.textSecondary}>
                No children records found
              </Typography>
            </Box>
          )}

          <Box mt={2} display="flex" justifyContent="center">
            <ActionButton
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddChild}
            >
              Add Child
            </ActionButton>
          </Box>
        </Box>
      );
    }

    // Special handling for Eligibility tab
    if (tabValue === 7) {
      return (
        <Box>
          <Typography variant="h6" gutterBottom>
            Eligibility Information
          </Typography>

          {eligibilitiesFormData.length > 0 ? (
            <Box>
              {eligibilitiesFormData.map((eligibility, index) => (
                <Box
                  key={index}
                  mb={3}
                  p={2}
                  sx={{
                    backgroundColor: alpha(colors.secondary, 0.3),
                    borderRadius: 2,
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h6">
                      Eligibility {index + 1}
                    </Typography>
                    <IconButton
                      onClick={() => handleRemoveEligibility(index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormField
                        fullWidth
                        label="Eligibility Name"
                        name="eligibilityName"
                        value={eligibility.eligibilityName || ''}
                        onChange={(e) => handleEligibilityFormChange(index, e)}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ mb: 1 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 'bold',
                            mb: 0.5,
                            color: '#333',
                            display: 'block',
                          }}
                        >
                          Rating
                        </Typography>
                        <PercentageInput
                          value={eligibility.eligibilityRating || ''}
                          onChange={(value) =>
                            handleEligibilityFormChange(index, {
                              target: { name: 'eligibilityRating', value },
                            })
                          }
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Date of Exam"
                        name="eligibilityDateOfExam"
                        type="date"
                        value={eligibility.eligibilityDateOfExam || ''}
                        onChange={(e) => handleEligibilityFormChange(index, e)}
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Place of Exam"
                        name="eligibilityPlaceOfExam"
                        value={eligibility.eligibilityPlaceOfExam || ''}
                        onChange={(e) => handleEligibilityFormChange(index, e)}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="License Number"
                        name="licenseNumber"
                        value={eligibility.licenseNumber || ''}
                        onChange={(e) => handleEligibilityFormChange(index, e)}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Date of Validity"
                        name="DateOfValidity"
                        type="date"
                        value={eligibility.DateOfValidity || ''}
                        onChange={(e) => handleEligibilityFormChange(index, e)}
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Box>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color={colors.textSecondary}>
                No eligibility records found
              </Typography>
            </Box>
          )}

          <Box mt={2} display="flex" justifyContent="center">
            <ActionButton
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddEligibility}
            >
              Add Eligibility
            </ActionButton>
          </Box>
        </Box>
      );
    }

    // Special handling for Learning and Development tab
    if (tabValue === 8) {
      return (
        <Box>
          <Typography variant="h6" gutterBottom>
            Learning and Development Information
          </Typography>

          {learningDevelopmentFormData.length > 0 ? (
            <Box>
              {learningDevelopmentFormData.map((learning, index) => (
                <Box
                  key={index}
                  mb={3}
                  p={2}
                  sx={{
                    backgroundColor: alpha(colors.secondary, 0.3),
                    borderRadius: 2,
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h6">
                      Learning Program {index + 1}
                    </Typography>
                    <IconButton
                      onClick={() => handleRemoveLearningDevelopment(index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormField
                        fullWidth
                        label="Title of Program"
                        name="titleOfProgram"
                        value={learning.titleOfProgram || ''}
                        onChange={(e) =>
                          handleLearningDevelopmentFormChange(index, e)
                        }
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Date From"
                        name="dateFrom"
                        type="date"
                        value={learning.dateFrom || ''}
                        onChange={(e) =>
                          handleLearningDevelopmentFormChange(index, e)
                        }
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Date To"
                        name="dateTo"
                        type="date"
                        value={learning.dateTo || ''}
                        onChange={(e) =>
                          handleLearningDevelopmentFormChange(index, e)
                        }
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Number of Hours"
                        name="numberOfHours"
                        value={learning.numberOfHours || ''}
                        onChange={(e) =>
                          handleLearningDevelopmentFormChange(index, e)
                        }
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Type of Learning Development"
                        name="typeOfLearningDevelopment"
                        value={learning.typeOfLearningDevelopment || ''}
                        onChange={(e) =>
                          handleLearningDevelopmentFormChange(index, e)
                        }
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormField
                        fullWidth
                        label="Conducted/Sponsored"
                        name="conductedSponsored"
                        value={learning.conductedSponsored || ''}
                        onChange={(e) =>
                          handleLearningDevelopmentFormChange(index, e)
                        }
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Box>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color={colors.textSecondary}>
                No learning and development records found
              </Typography>
            </Box>
          )}

          <Box mt={2} display="flex" justifyContent="center">
            <ActionButton
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddLearningDevelopment}
            >
              Add Learning Program
            </ActionButton>
          </Box>
        </Box>
      );
    }

    // Special handling for Other Information tab
    if (tabValue === 9) {
      return (
        <Box>
          <Typography variant="h6" gutterBottom>
            Other Information
          </Typography>

          {otherInformationFormData.length > 0 ? (
            <Box>
              {otherInformationFormData.map((info, index) => (
                <Box
                  key={index}
                  mb={3}
                  p={2}
                  sx={{
                    backgroundColor: alpha(colors.secondary, 0.3),
                    borderRadius: 2,
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h6">
                      Information {index + 1}
                    </Typography>
                    <IconButton
                      onClick={() => handleRemoveOtherInformation(index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormField
                        fullWidth
                        label="Special Skills"
                        name="specialSkills"
                        value={info.specialSkills || ''}
                        onChange={(e) =>
                          handleOtherInformationFormChange(index, e)
                        }
                        variant="outlined"
                        multiline
                        rows={2}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormField
                        fullWidth
                        label="Non-Academic Distinctions"
                        name="nonAcademicDistinctions"
                        value={info.nonAcademicDistinctions || ''}
                        onChange={(e) =>
                          handleOtherInformationFormChange(index, e)
                        }
                        variant="outlined"
                        multiline
                        rows={2}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormField
                        fullWidth
                        label="Membership in Association"
                        name="membershipInAssociation"
                        value={info.membershipInAssociation || ''}
                        onChange={(e) =>
                          handleOtherInformationFormChange(index, e)
                        }
                        variant="outlined"
                        multiline
                        rows={2}
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Box>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color={colors.textSecondary}>
                No other information records found
              </Typography>
            </Box>
          )}

          <Box mt={2} display="flex" justifyContent="center">
            <ActionButton
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddOtherInformation}
            >
              Add Other Information
            </ActionButton>
          </Box>
        </Box>
      );
    }

    if (tabValue === 10) {
      return (
        <Box>
          <Typography variant="h6" gutterBottom>
            Work Experience Information
          </Typography>

          {workExperiencesFormData.length > 0 ? (
            <Box>
              {workExperiencesFormData.map((workExp, index) => (
                <Box
                  key={index}
                  mb={3}
                  p={2}
                  sx={{
                    backgroundColor: alpha(colors.secondary, 0.3),
                    borderRadius: 2,
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h6">
                      Work Experience {index + 1}
                    </Typography>
                    <IconButton
                      onClick={() => handleRemoveWorkExperience(index)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Date From"
                        name="workDateFrom"
                        type="date"
                        value={workExp.workDateFrom || ''}
                        onChange={(e) =>
                          handleWorkExperienceFormChange(index, e)
                        }
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Date To"
                        name="workDateTo"
                        type="date"
                        value={workExp.workDateTo || ''}
                        onChange={(e) =>
                          handleWorkExperienceFormChange(index, e)
                        }
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormField
                        fullWidth
                        label="Position Title"
                        name="workPositionTitle"
                        value={workExp.workPositionTitle || ''}
                        onChange={(e) =>
                          handleWorkExperienceFormChange(index, e)
                        }
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormField
                        fullWidth
                        label="Company"
                        name="workCompany"
                        value={workExp.workCompany || ''}
                        onChange={(e) =>
                          handleWorkExperienceFormChange(index, e)
                        }
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Monthly Salary"
                        name="workMonthlySalary"
                        value={workExp.workMonthlySalary || ''}
                        onChange={(e) =>
                          handleWorkExperienceFormChange(index, e)
                        }
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Salary Job/Pay Grade"
                        name="SalaryJobOrPayGrade"
                        value={workExp.SalaryJobOrPayGrade || ''}
                        onChange={(e) =>
                          handleWorkExperienceFormChange(index, e)
                        }
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormField
                        fullWidth
                        label="Status of Appointment"
                        name="StatusOfAppointment"
                        value={workExp.StatusOfAppointment || ''}
                        onChange={(e) =>
                          handleWorkExperienceFormChange(index, e)
                        }
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Government Service</InputLabel>
                        <Select
                          name="isGovtService"
                          value={workExp.isGovtService || 'No'}
                          onChange={(e) =>
                            handleWorkExperienceFormChange(index, e)
                          }
                          label="Government Service"
                        >
                          <MenuItem value="Yes">Yes</MenuItem>
                          <MenuItem value="No">No</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Box>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color={colors.textSecondary}>
                No work experience records found
              </Typography>
            </Box>
          )}

          <Box mt={2} display="flex" justifyContent="center">
            <ActionButton
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddWorkExperience}
            >
              Add Work Experience
            </ActionButton>
          </Box>
        </Box>
      );
    }

    const fields = formFields[tabValue] || [];

    return (
      <Grid container spacing={3}>
        {fields.map((field, idx) => (
          <Grid item xs={12} sm={6} key={idx}>
            <FormField
              fullWidth
              label={field.label}
              name={field.name}
              value={formData[field.name] || ''}
              onChange={handleFormChange}
              variant="outlined"
              disabled={field.disabled}
              type={field.type || 'text'}
              InputLabelProps={field.type === 'date' ? { shrink: true } : {}}
            />
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <ProfileContainer ref={profileRef}>
      <ProfileHeader>
        <ProfileAvatarContainer>
          <ProfileAvatar
            src={
              profilePicture
                ? `${API_BASE_URL}${profilePicture}?t=${Date.now()}`
                : undefined
            }
            alt="Profile Picture"
            onClick={handleImageZoom}
          >
            {!profilePicture && <PersonIcon sx={{ fontSize: 80 }} />}
          </ProfileAvatar>
        </ProfileAvatarContainer>

        <ProfileInfo>
          <ProfileName>
            {person
              ? `${person.firstName} ${person.middleName} ${person.lastName} ${
                  person.nameExtension || ''
                }`.trim()
              : 'Employee Profile'}
          </ProfileName>
          <ProfileSubtitle>
            Employee No.: <b>{person?.agencyEmployeeNum || '—'}</b>
          </ProfileSubtitle>
        </ProfileInfo>

        <ProfileActions>
          <Tooltip title="Refresh profile">
            <IconButton
              onClick={handleRefresh}
              sx={{
                backgroundColor: alpha(colors.primary, 0.1),
                color: colors.primary,
                '&:hover': {
                  backgroundColor: alpha(colors.primary, 0.2),
                },
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          <ActionButton
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEditOpen}
          >
            Edit Profile
          </ActionButton>
        </ProfileActions>
      </ProfileHeader>

      <SectionPaper>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <SectionTitle>
            <PersonIcon />
            Employee Details
          </SectionTitle>
          <Box display="flex" alignItems="center">
            <Typography variant="body2" color={colors.textSecondary} mr={2}>
              View Mode:
            </Typography>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              aria-label="view mode"
              size="small"
            >
              <ViewToggleButton value="grid" aria-label="grid view">
                <GridViewIcon />
              </ViewToggleButton>
              <ViewToggleButton value="list" aria-label="list view">
                <ViewListIcon />
              </ViewToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        <TabContainer>
          <CustomTabs
            value={tabValue}
            onChange={handleTabChange}
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons={isMobile ? 'auto' : false}
          >
            {tabs.map((tab) => (
              <CustomTab
                key={tab.key}
                label={tab.label}
                icon={tab.icon}
                iconPosition="start"
              />
            ))}
          </CustomTabs>
        </TabContainer>

        <ContentContainer>
          <ViewWrapper className={viewMode === 'grid' ? 'active' : ''}>
            {renderTabContentGrid(tabValue)}
          </ViewWrapper>
          <ViewWrapper className={viewMode === 'list' ? 'active' : ''}>
            {renderTabContentList(tabValue)}
          </ViewWrapper>
        </ContentContainer>
      </SectionPaper>

      {/* Edit Profile Modal */}
      <Modal
        open={editOpen}
        onClose={handleEditClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Backdrop open={editOpen} onClick={handleEditClose}>
          <ModalContainer onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Edit Profile</ModalTitle>
              <IconButton
                onClick={handleEditClose}
                sx={{ color: colors.textLight }}
              >
                <CloseIcon />
              </IconButton>
            </ModalHeader>

            <EditModalPictureSection>
              <EditModalAvatar
                src={
                  profilePicture
                    ? `${API_BASE_URL}${profilePicture}?t=${Date.now()}`
                    : undefined
                }
                alt="Profile Picture"
                onClick={handleEditImageZoom}
              >
                {!profilePicture && <PersonIcon sx={{ fontSize: 60 }} />}
              </EditModalAvatar>
              <EditModalPictureInfo>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 600, color: colors.primary, mb: 1 }}
                >
                  Profile Picture
                </Typography>
                <Typography
                  variant="body2"
                  color={colors.textSecondary}
                  sx={{ mb: 2 }}
                >
                  Click on image to preview. Upload a professional headshot (max
                  5MB, JPEG/PNG)
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  <Chip
                    icon={<PhotoSizeSelectActualIcon fontSize="small" />}
                    label="High Quality"
                    size="small"
                    sx={{
                      backgroundColor: alpha(colors.primary, 0.1),
                      color: colors.primary,
                      fontWeight: 600,
                    }}
                  />
                  <Chip
                    icon={<CropOriginalIcon fontSize="small" />}
                    label="Recommended: 400x400px"
                    size="small"
                    sx={{
                      backgroundColor: alpha(colors.secondary, 0.5),
                      color: colors.textSecondary,
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </EditModalPictureInfo>
              <EditModalPictureActions>
                <input
                  accept="image/*"
                  id="profile-picture-upload-modal"
                  type="file"
                  style={{ display: 'none' }}
                  onChange={handlePictureChange}
                />
                <label htmlFor="profile-picture-upload-modal">
                  <ActionButton
                    component="span"
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                  >
                    Upload Photo
                  </ActionButton>
                </label>
                <ActionButton
                  variant="outlined"
                  startIcon={<DeleteIcon />}
                  onClick={handleRemovePicture}
                  fullWidth
                >
                  Remove Photo
                </ActionButton>
              </EditModalPictureActions>
            </EditModalPictureSection>

            <ModalBody>
              <Box sx={{ mb: 3 }}>
                <CustomTabs
                  value={tabValue}
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  {tabs.map((tab) => (
                    <CustomTab
                      key={tab.key}
                      label={tab.label}
                      icon={tab.icon}
                      iconPosition="start"
                    />
                  ))}
                </CustomTabs>
              </Box>

              {renderFormFields()}
            </ModalBody>

            {/* Fixed Bottom Action Bar - Right Aligned */}
            <Box
              sx={{
                position: 'sticky',
                bottom: 0,
                backgroundColor: colors.surface,
                padding: theme.spacing(2),
                borderTop: `1px solid ${colors.border}`,
                display: 'flex',
                justifyContent: 'flex-end',
                gap: theme.spacing(2),
                boxShadow: '0 -2px 8px rgba(0,0,0,0.08)',
              }}
            >
              <ActionButton variant="outlined" onClick={handleEditClose}>
                Cancel
              </ActionButton>
              <ActionButton
                variant="contained"
                onClick={handleSave}
                startIcon={<SaveIcon />}
              >
                Save Changes
              </ActionButton>
            </Box>
          </ModalContainer>
        </Backdrop>
      </Modal>

      {/* Image Preview Modals */}
      <ImagePreviewModal
        open={imageZoomOpen}
        onClose={handleImageZoomClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Backdrop open={imageZoomOpen} onClick={handleImageZoomClose}>
          <ImagePreviewContainer onClick={(e) => e.stopPropagation()}>
            <ImagePreviewContent>
              <PreviewImage
                src={
                  profilePicture
                    ? `${API_BASE_URL}${profilePicture}?t=${Date.now()}`
                    : undefined
                }
                alt="Profile Picture Preview"
              />
              <ImagePreviewActions>
                <ImagePreviewButton
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = profilePicture
                      ? `${API_BASE_URL}${profilePicture}?t=${Date.now()}`
                      : '';
                    link.download = 'profile-picture.jpg';
                    link.click();
                  }}
                  title="Download"
                >
                  <DownloadIcon />
                </ImagePreviewButton>
                <ImagePreviewButton
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'Profile Picture',
                        url: profilePicture
                          ? `${API_BASE_URL}${profilePicture}?t=${Date.now()}`
                          : '',
                      });
                    }
                  }}
                  title="Share"
                >
                  <ShareIcon />
                </ImagePreviewButton>
                <ImagePreviewButton
                  onClick={handleImageZoomClose}
                  title="Close"
                >
                  <CloseIcon />
                </ImagePreviewButton>
              </ImagePreviewActions>
            </ImagePreviewContent>
          </ImagePreviewContainer>
        </Backdrop>
      </ImagePreviewModal>

      <ImagePreviewModal
        open={editImageZoomOpen}
        onClose={handleEditImageZoomClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Backdrop open={editImageZoomOpen} onClick={handleEditImageZoomClose}>
          <ImagePreviewContainer onClick={(e) => e.stopPropagation()}>
            <ImagePreviewContent>
              <PreviewImage
                src={
                  profilePicture
                    ? `${API_BASE_URL}${profilePicture}?t=${Date.now()}`
                    : undefined
                }
                alt="Profile Picture Preview"
              />
              <ImagePreviewActions>
                <ImagePreviewButton
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = profilePicture
                      ? `${API_BASE_URL}${profilePicture}?t=${Date.now()}`
                      : '';
                    link.download = 'profile-picture.jpg';
                    link.click();
                  }}
                  title="Download"
                >
                  <DownloadIcon />
                </ImagePreviewButton>
                <ImagePreviewButton
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'Profile Picture',
                        url: profilePicture
                          ? `${API_BASE_URL}${profilePicture}?t=${Date.now()}`
                          : '',
                      });
                    }
                  }}
                  title="Share"
                >
                  <ShareIcon />
                </ImagePreviewButton>
                <ImagePreviewButton
                  onClick={handleEditImageZoomClose}
                  title="Close"
                >
                  <CloseIcon />
                </ImagePreviewButton>
              </ImagePreviewActions>
            </ImagePreviewContent>
          </ImagePreviewContainer>
        </Backdrop>
      </ImagePreviewModal>

      <Snackbar
        open={notificationOpen}
        autoHideDuration={5000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Notification
          variant={uploadStatus.type}
          message={uploadStatus.message}
          action={
            <IconButton
              size="small"
              color="inherit"
              onClick={handleNotificationClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        />
      </Snackbar>

      {trigger && (
        <FloatingButton onClick={scrollToTop} aria-label="scroll back to top">
          <KeyboardArrowUpIcon />
        </FloatingButton>
      )}
    </ProfileContainer>
  );
};

export default Profile;


