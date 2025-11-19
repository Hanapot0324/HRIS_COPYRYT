import API_BASE_URL from '../../apiConfig';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Chip,
  Modal,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  Fade,
  Divider,
  Backdrop,
  styled,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Close,
  Search as SearchIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  VolunteerActivism as VolunteerActivismIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh,
} from '@mui/icons-material';

import ReorderIcon from '@mui/icons-material/Reorder';
import LoadingOverlay from '../LoadingOverlay';
import SuccessfullOverlay from '../SuccessfulOverlay';
import AccessDenied from '../AccessDenied';
import { useNavigate } from 'react-router-dom';

// Professional styled components
const GlassCard = styled(Card)(({ theme }) => ({
  borderRadius: 20,
  background: 'rgba(254, 249, 225, 0.95)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 8px 40px rgba(109, 35, 35, 0.08)',
  border: '1px solid rgba(109, 35, 35, 0.1)',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    boxShadow: '0 12px 48px rgba(109, 35, 35, 0.15)',
    transform: 'translateY(-4px)',
  },
}));

const ProfessionalButton = styled(Button)(({ theme, variant, color = 'primary' }) => ({
  borderRadius: 12,
  fontWeight: 600,
  padding: '12px 24px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  textTransform: 'none',
  fontSize: '0.95rem',
  letterSpacing: '0.025em',
  boxShadow: variant === 'contained' ? '0 4px 14px rgba(254, 249, 225, 0.25)' : 'none',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: variant === 'contained' ? '0 6px 20px rgba(254, 249, 225, 0.35)' : 'none',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
}));

const ModernTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    '&:hover': {
      transform: 'translateY(-1px)',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
    },
    '&.Mui-focused': {
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 20px rgba(254, 249, 225, 0.25)',
      backgroundColor: 'rgba(255, 255, 255, 1)',
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
  },
}));

// Auth header helper
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
};

// Date formatting helper
const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    // Check if the date is valid
    if (isNaN(date.getTime())) return dateString;
    
    // Format as "Month Day, Year" (e.g., "October 1, 2025")
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

// Date range formatting helper
const formatDateRange = (dateFrom, dateTo) => {
  if (!dateFrom && !dateTo) return '';
  if (!dateFrom) return `Until ${formatDate(dateTo)}`;
  if (!dateTo) return `From ${formatDate(dateFrom)}`;
  
  try {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    
    // If same month and year, format as "October 1-31, 2025"
    if (from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear()) {
      return `${from.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} ${from.getDate()}-${to.getDate()}`;
    }
    
    // Otherwise, format as "October 1, 2025 - November 15, 2025"
    return `${formatDate(dateFrom)} - ${formatDate(dateTo)}`;
  } catch (error) {
    console.error('Error formatting date range:', error);
    return `${formatDate(dateFrom)} - ${formatDate(dateTo)}`;
  }
};

// Employee Autocomplete Component
const EmployeeAutocomplete = ({
  value,
  onChange,
  placeholder = 'Search employee...',
  required = false,
  disabled = false,
  error = false,
  helperText = '',
  selectedEmployee,
  onEmployeeSelect,
  dropdownDisabled = false,
}) => {
  const [query, setQuery] = useState('');
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (value && !selectedEmployee) {
      fetchEmployeeById(value);
    }
  }, [value]);

  useEffect(() => {
    if (selectedEmployee) {
      setQuery(selectedEmployee.name || '');
    } else if (!value) {
      setQuery('');
    }
  }, [selectedEmployee, value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchEmployees = async (searchQuery) => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/Remittance/employees/search?q=${encodeURIComponent(
          searchQuery
        )}`,
        getAuthHeaders()
      );
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllEmployees = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/Remittance/employees/search`,
        getAuthHeaders()
      );
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployeeById = async (employeeNumber) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/Remittance/employees/${employeeNumber}`,
        getAuthHeaders()
      );
      const employee = response.data;
      onEmployeeSelect(employee);
      setQuery(employee.name || '');
    } catch (error) {
      console.error('Error fetching employee by ID:', error);
    }
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setQuery(inputValue);
    setShowDropdown(true);

    if (selectedEmployee && inputValue !== selectedEmployee.name) {
      onEmployeeSelect(null);
      onChange('');
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (inputValue.trim().length >= 2) {
        fetchEmployees(inputValue);
      } else if (inputValue.trim().length === 0) {
        fetchAllEmployees();
      } else {
        setEmployees([]);
      }
    }, 300);
  };

  const handleEmployeeSelect = (employee) => {
    onEmployeeSelect(employee);
    setQuery(employee.name);
    setShowDropdown(false);
    onChange(employee.employeeNumber);
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
    if (employees.length === 0 && !isLoading) {
      if (query.length >= 2) {
        fetchEmployees(query);
      } else {
        fetchAllEmployees();
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const handleDropdownClick = () => {
    if (!showDropdown) {
      setShowDropdown(true);
      if (employees.length === 0 && !isLoading) {
        fetchAllEmployees();
      }
    } else {
      setShowDropdown(false);
    }
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }} ref={dropdownRef}>
      <ModernTextField
        ref={inputRef}
        value={query}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        error={error}
        helperText={helperText}
        fullWidth
        autoComplete="off"
        size="small"
        InputProps={{
          startAdornment: <PersonIcon sx={{ color: '#6D2323', mr: 1 }} />,
          endAdornment: (
            <IconButton
              onClick={dropdownDisabled ? undefined : handleDropdownClick}
              size="small"
              disabled={dropdownDisabled}
              sx={{ color: '#6D2323' }}
            >
              {showDropdown ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          ),
        }}
      />

      {showDropdown && (
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            maxHeight: 300,
            overflow: 'auto',
            mt: 1,
            borderRadius: 2,
          }}
        >
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" sx={{ ml: 1 }}>
                Loading...
              </Typography>
            </Box>
          ) : employees.length > 0 ? (
            <List dense>
              {employees.map((employee) => (
                <ListItem
                  key={employee.employeeNumber}
                  button
                  onClick={() => handleEmployeeSelect(employee)}
                  sx={{
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                    },
                  }}
                >
                  <ListItemText
                    primary={employee.name}
                    secondary={`#${employee.employeeNumber}`}
                    primaryTypographyProps={{ fontWeight: 'bold' }}
                    secondaryTypographyProps={{ color: '#666' }}
                  />
                </ListItem>
              ))}
            </List>
          ) : query.length >= 2 ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                No employees found matching "{query}"
              </Typography>
            </Box>
          ) : (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                {employees.length === 0
                  ? 'No employees available'
                  : 'Type to search or scroll to browse'}
              </Typography>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
};

const VoluntaryWork = () => {
  const [data, setData] = useState([]);
  const [employeeNames, setEmployeeNames] = useState({});
  const [newVoluntary, setNewVoluntary] = useState({
    nameAndAddress: '',
    dateFrom: '',
    dateTo: '',
    numberOfHours: '',
    natureOfWork: '',
    person_id: '',
  });
  const [editVoluntary, setEditVoluntary] = useState(null);
  const [originalVoluntary, setOriginalVoluntary] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successAction, setSuccessAction] = useState('');
  const [errors, setErrors] = useState({});
  const [viewMode, setViewMode] = useState('grid');

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedEditEmployee, setSelectedEditEmployee] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const [hasAccess, setHasAccess] = useState(null);
  const navigate = useNavigate();
  
  // Color scheme
  const primaryColor = '#FEF9E1';
  const secondaryColor = '#FFF8E7';
  const accentColor = '#6d2323';
  const accentDark = '#8B3333';
  const grayColor = '#6c757d';

  useEffect(() => {
    const userId = localStorage.getItem('employeeNumber');
    const pageId = 9;
    if (!userId) {
      setHasAccess(false);
      return;
    }
    const checkAccess = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/page_access/${userId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          const accessData = await response.json();
          const hasPageAccess = accessData.some(
            (access) =>
              access.page_id === pageId && String(access.page_privilege) === '1'
          );
          setHasAccess(hasPageAccess);
        } else {
          setHasAccess(false);
        }
      } catch (error) {
        console.error('Error checking access:', error);
        setHasAccess(false);
      }
    };
    checkAccess();
  }, []);

  useEffect(() => {
    fetchVoluntaryWork();
  }, []);

  const fetchVoluntaryWork = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/VoluntaryRoute/voluntary-work`
      );
      setData(res.data);

      const uniqueEmployeeIds = [
        ...new Set(res.data.map((c) => c.person_id).filter(Boolean)),
      ];
      const namesMap = {};

      await Promise.all(
        uniqueEmployeeIds.map(async (id) => {
          try {
            const response = await axios.get(
              `${API_BASE_URL}/Remittance/employees/${id}`,
              getAuthHeaders()
            );
            namesMap[id] = response.data.name || 'Unknown';
          } catch (error) {
            namesMap[id] = 'Unknown';
          }
        })
      );

      setEmployeeNames(namesMap);
    } catch (err) {
      console.error('Error fetching data:', err);
      showSnackbar(
        'Failed to fetch voluntary work records. Please try again.',
        'error'
      );
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      'nameAndAddress',
      'dateFrom',
      'dateTo',
      'person_id',
    ];

    requiredFields.forEach((field) => {
      if (!newVoluntary[field] || newVoluntary[field].trim() === '') {
        newErrors[field] = 'This field is required';
      }
    });

    if (newVoluntary.dateFrom && newVoluntary.dateTo) {
      if (new Date(newVoluntary.dateFrom) > new Date(newVoluntary.dateTo)) {
        newErrors.dateTo = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = async () => {
    if (!validateForm()) {
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API_BASE_URL}/VoluntaryRoute/voluntary-work`,
        newVoluntary
      );
      setNewVoluntary({
        nameAndAddress: '',
        dateFrom: '',
        dateTo: '',
        numberOfHours: '',
        natureOfWork: '',
        person_id: '',
      });
      setSelectedEmployee(null);
      setErrors({});
      setTimeout(() => {
        setLoading(false);
        setSuccessAction('adding');
        setSuccessOpen(true);
        setTimeout(() => setSuccessOpen(false), 2000);
      }, 300);
      fetchVoluntaryWork();
    } catch (err) {
      console.error('Error adding data:', err);
      setLoading(false);
      showSnackbar(
        'Failed to add voluntary work record. Please try again.',
        'error'
      );
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/VoluntaryRoute/voluntary-work/${editVoluntary.id}`,
        editVoluntary
      );
      setEditVoluntary(null);
      setOriginalVoluntary(null);
      setSelectedEditEmployee(null);
      setIsEditing(false);
      fetchVoluntaryWork();
      setSuccessAction('edit');
      setSuccessOpen(true);
      setTimeout(() => setSuccessOpen(false), 2000);
    } catch (err) {
      console.error('Error updating data:', err);
      showSnackbar(
        'Failed to update voluntary work record. Please try again.',
        'error'
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/VoluntaryRoute/voluntary-work/${id}`);
      setEditVoluntary(null);
      setOriginalVoluntary(null);
      setSelectedEditEmployee(null);
      setIsEditing(false);
      fetchVoluntaryWork();
      setSuccessAction('delete');
      setSuccessOpen(true);
      setTimeout(() => setSuccessOpen(false), 2000);
    } catch (err) {
      console.error('Error deleting data:', err);
      showSnackbar(
        'Failed to delete voluntary work record. Please try again.',
        'error'
      );
    }
  };

  const handleChange = (field, value, isEdit = false) => {
    if (isEdit) {
      setEditVoluntary({ ...editVoluntary, [field]: value });
    } else {
      setNewVoluntary({ ...newVoluntary, [field]: value });
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    }
  };

  const handleEmployeeChange = (employeeNumber) => {
    setNewVoluntary({ ...newVoluntary, person_id: employeeNumber });
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.person_id;
      return newErrors;
    });
  };

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
  };

  const handleEditEmployeeChange = (employeeNumber) => {
    setEditVoluntary({ ...editVoluntary, person_id: employeeNumber });
  };

  const handleEditEmployeeSelect = (employee) => {
    setSelectedEditEmployee(employee);
  };

  const handleOpenModal = async (voluntary) => {
    const employeeName = employeeNames[voluntary.person_id] || 'Unknown';

    setEditVoluntary({ ...voluntary });
    setOriginalVoluntary({ ...voluntary });
    setSelectedEditEmployee({
      name: employeeName,
      employeeNumber: voluntary.person_id,
    });
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditVoluntary({ ...originalVoluntary });
    setSelectedEditEmployee({
      name: employeeNames[originalVoluntary.person_id] || 'Unknown',
      employeeNumber: originalVoluntary.person_id,
    });
    setIsEditing(false);
  };

  const handleCloseModal = () => {
    setEditVoluntary(null);
    setOriginalVoluntary(null);
    setSelectedEditEmployee(null);
    setIsEditing(false);
  };

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const hasChanges = () => {
    if (!editVoluntary || !originalVoluntary) return false;

    return (
      editVoluntary.nameAndAddress !== originalVoluntary.nameAndAddress ||
      editVoluntary.dateFrom !== originalVoluntary.dateFrom ||
      editVoluntary.dateTo !== originalVoluntary.dateTo ||
      editVoluntary.numberOfHours !== originalVoluntary.numberOfHours ||
      editVoluntary.natureOfWork !== originalVoluntary.natureOfWork ||
      editVoluntary.person_id !== originalVoluntary.person_id
    );
  };

  if (hasAccess === null) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <CircularProgress sx={{ color: accentColor, mb: 2 }} />
          <Typography variant="h6" sx={{ color: accentColor }}>
            Loading access information...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!hasAccess) {
    return (
      <AccessDenied
        title="Access Denied"
        message="You do not have permission to access Voluntary Work Information. Contact your administrator to request access."
        returnPath="/admin-home"
        returnButtonText="Return to Home"
      />
    );
  }

  const filteredData = data.filter((voluntary) => {
    const nameAndAddress = voluntary.nameAndAddress?.toLowerCase() || '';
    const personId = voluntary.person_id?.toString() || '';
    const employeeName =
      employeeNames[voluntary.person_id]?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return (
      personId.includes(search) ||
      nameAndAddress.includes(search) ||
      employeeName.includes(search)
    );
  });

  return (
    <Box sx={{ 
      py: 4,
      mt: -5,
      width: '1600px',
      mx: 'auto',
      overflow: 'hidden',
    }}>
      <Box sx={{ px: 6 }}>
        {/* Header */}
        <Fade in timeout={500}>
          <Box sx={{ mb: 4 }}>
            <GlassCard>
              <Box
                sx={{
                  p: 5,
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                  color: accentColor,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    background: 'radial-gradient(circle, rgba(109,35,35,0.1) 0%, rgba(109,35,35,0) 70%)',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -30,
                    left: '30%',
                    width: 150,
                    height: 150,
                    background: 'radial-gradient(circle, rgba(109,35,35,0.08) 0%, rgba(109,35,35,0) 70%)',
                  }}
                />
                
                <Box display="flex" alignItems="center" justifyContent="space-between" position="relative" zIndex={1}>
                  <Box display="flex" alignItems="center">
                    <Avatar 
                      sx={{ 
                        bgcolor: 'rgba(109,35,35,0.15)', 
                        mr: 4, 
                        width: 64,
                        height: 64,
                        boxShadow: '0 8px 24px rgba(109,35,35,0.15)'
                      }}
                    >
                      <VolunteerActivismIcon sx={{color: accentColor, fontSize: 32 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1, lineHeight: 1.2, color: accentColor }}>
                        Voluntary Work Information Management
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.8, fontWeight: 400, color: accentDark }}>
                        Add and manage voluntary work records for employees
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Chip 
                      label="Enterprise Grade" 
                      size="small" 
                      sx={{ 
                        bgcolor: 'rgba(109,35,35,0.15)', 
                        color: accentColor,
                        fontWeight: 500,
                        '& .MuiChip-label': { px: 1 }
                      }} 
                    />
                    <Tooltip title="Refresh Data">
                      <IconButton 
                        onClick={() => window.location.reload()}
                        sx={{ 
                          bgcolor: 'rgba(109,35,35,0.1)', 
                          '&:hover': { bgcolor: 'rgba(109,35,35,0.2)' },
                          color: accentColor,
                          width: 48,
                          height: 48,
                        }}
                      >
                        <Refresh sx={{ fontSize: 24 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Box>
            </GlassCard>
          </Box>
        </Fade>

        {/* Loading Backdrop */}
        <Backdrop
          sx={{ color: primaryColor, zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={loading}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress color="inherit" size={60} thickness={4} />
            <Typography variant="h6" sx={{ mt: 2, color: primaryColor }}>
              Processing voluntary work record...
            </Typography>
          </Box>
        </Backdrop>

        {/* Main Content */}
        <Grid container spacing={4}>
          {/* Add New Voluntary Work Section */}
          <Grid item xs={12} lg={6}>
            <Fade in timeout={700}>
              <GlassCard sx={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
                <Box
                  sx={{
                    p: 4,
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    color: accentColor,
                    display: "flex",
                    alignItems: "center",
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <VolunteerActivismIcon sx={{ fontSize: "1.8rem", mr: 2 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Add New Voluntary Work
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      Fill in the voluntary work information
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ 
                  p: 4, 
                  flexGrow: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  overflowY: 'auto'
                }}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: accentColor, display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ mr: 2, fontSize: 24 }} />
                      Employee Information <span style={{ marginLeft: '12px', fontWeight: 400, opacity: 0.7, color: 'red' }}>*</span>
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                          Search Employee
                        </Typography>
                        <EmployeeAutocomplete
                          value={newVoluntary.person_id}
                          onChange={handleEmployeeChange}
                          selectedEmployee={selectedEmployee}
                          onEmployeeSelect={handleEmployeeSelect}
                          placeholder="Search and select employee..."
                          required
                          error={!!errors.person_id}
                          helperText={errors.person_id || ''}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                          Selected Employee
                        </Typography>
                        {selectedEmployee ? (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              backgroundColor: 'rgba(254, 249, 225, 0.8)',
                              border: '1px solid rgba(109, 35, 35, 0.3)',
                              borderRadius: 2,
                              paddingLeft: '10px',
                              gap: 1.5,
                            }}
                          >
                            <PersonIcon sx={{ color: accentColor, fontSize: 20 }} />
                            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 'bold',
                                  color: accentColor,
                                  fontSize: '14px',
                                  lineHeight: 1.2,
                                }}
                              >
                                {selectedEmployee.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: grayColor,
                                  fontSize: '12px',
                                  lineHeight: 1.2,
                                }}
                              >
                                ID: {selectedEmployee.employeeNumber}
                              </Typography>
                            </Box>
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'rgba(0, 0, 0, 0.05)',
                              border: '2px dashed rgba(109, 35, 35, 0.3)',
                              borderRadius: 2,
                              minHeight: '30px',
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                color: grayColor,
                                fontStyle: 'italic',
                                fontSize: '14px',
                              }}
                            >
                              No employee selected
                            </Typography>
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider sx={{ my: 3, borderColor: 'rgba(109,35,35,0.1)' }} />

                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: accentColor, display: 'flex', alignItems: 'center' }}>
                    <VolunteerActivismIcon sx={{ mr: 2, fontSize: 24 }} />
                    Voluntary Work Details
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                        Organization Name and Address <span style={{ color: 'red' }}>*</span>
                      </Typography>
                      <ModernTextField
                        value={newVoluntary.nameAndAddress}
                        onChange={(e) =>
                          handleChange('nameAndAddress', e.target.value)
                        }
                        fullWidth
                        size="small"
                        error={!!errors.nameAndAddress}
                        helperText={errors.nameAndAddress || ''}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                        Date From <span style={{ color: 'red' }}>*</span>
                      </Typography>
                      <ModernTextField
                        type="date"
                        value={newVoluntary.dateFrom}
                        onChange={(e) => handleChange('dateFrom', e.target.value)}
                        fullWidth
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.dateFrom}
                        helperText={errors.dateFrom || ''}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                        Date To <span style={{ color: 'red' }}>*</span>
                      </Typography>
                      <ModernTextField
                        type="date"
                        value={newVoluntary.dateTo}
                        onChange={(e) => handleChange('dateTo', e.target.value)}
                        fullWidth
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.dateTo}
                        helperText={errors.dateTo || ''}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                        Number of Hours
                      </Typography>
                      <ModernTextField
                        value={newVoluntary.numberOfHours}
                        onChange={(e) =>
                          handleChange('numberOfHours', e.target.value)
                        }
                        fullWidth
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                        Nature of Work
                      </Typography>
                      <ModernTextField
                        value={newVoluntary.natureOfWork}
                        onChange={(e) =>
                          handleChange('natureOfWork', e.target.value)
                        }
                        fullWidth
                        size="small"
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 'auto', pt: 3 }}>
                    <ProfessionalButton
                      onClick={handleAdd}
                      variant="contained"
                      startIcon={<AddIcon />}
                      fullWidth
                      sx={{
                        backgroundColor: accentColor,
                        color: primaryColor,
                        py: 1.5,
                        fontSize: '1rem',
                        "&:hover": { 
                          backgroundColor: accentDark,
                        },
                      }}
                    >
                      Add Voluntary Work Record
                    </ProfessionalButton>
                  </Box>
                </Box>
              </GlassCard>
            </Fade>
          </Grid>

          {/* Voluntary Work Records Section */}
          <Grid item xs={12} lg={6}>
            <Fade in timeout={900}>
              <GlassCard sx={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
                <Box
                  sx={{
                    p: 4,
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    color: accentColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <ReorderIcon sx={{ fontSize: "1.8rem", mr: 2 }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Voluntary Work Records
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        View and manage existing records
                      </Typography>
                    </Box>
                  </Box>
                  
                  <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={handleViewModeChange}
                    aria-label="view mode"
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      '& .MuiToggleButton-root': {
                        color: accentColor,
                        borderColor: 'rgba(109, 35, 35, 0.5)',
                        padding: '4px 8px',
                        '&.Mui-selected': {
                          backgroundColor: 'rgba(255, 255, 255, 0.3)',
                          color: accentColor
                        },
                      }
                    }}
                  >
                    <ToggleButton value="grid" aria-label="grid view">
                      <ViewModuleIcon fontSize="small" />
                    </ToggleButton>
                    <ToggleButton value="list" aria-label="list view">
                      <ViewListIcon fontSize="small" />
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                <Box sx={{ 
                  p: 4, 
                  flexGrow: 1, 
                  display: 'flex', 
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}>
                  <Box sx={{ mb: 3 }}>
                    <ModernTextField
                      size="small"
                      variant="outlined"
                      placeholder="Search by Employee ID, Name, or Organization"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <SearchIcon sx={{ color: accentColor, mr: 1 }} />
                        ),
                      }}
                    />
                  </Box>

                  <Box 
                    sx={{ 
                      flexGrow: 1, 
                      overflowY: 'auto',
                      pr: 1,
                      '&::-webkit-scrollbar': {
                        width: '6px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: '#f1f1f1',
                        borderRadius: '3px',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: accentColor,
                        borderRadius: '3px',
                      },
                    }}
                  >
                    {viewMode === 'grid' ? (
                      <Grid container spacing={2}>
                        {filteredData.map((voluntary) => (
                          <Grid item xs={12} sm={6} md={4} key={voluntary.id}>
                            <Card
                              onClick={() => handleOpenModal(voluntary)}
                              sx={{
                                cursor: "pointer",
                                border: "1px solid rgba(109, 35, 35, 0.1)",
                                height: "100%",
                                display: 'flex',
                                flexDirection: 'column',
                                "&:hover": { 
                                  borderColor: accentColor,
                                  transform: 'translateY(-2px)',
                                  transition: 'all 0.2s ease',
                                  boxShadow: '0 4px 8px rgba(109,35,35,0.15)'
                                },
                              }}
                            >
                              <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <VolunteerActivismIcon sx={{ fontSize: 18, color: accentColor, mr: 0.5 }} />
                                  <Typography variant="caption" sx={{ 
                                    color: accentColor, 
                                    px: 0.5, 
                                    py: 0.2, 
                                    borderRadius: 0.5,
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold'
                                  }}>
                                    ID: {voluntary.person_id}
                                  </Typography>
                                </Box>
                                
                                <Typography variant="body2" fontWeight="bold" color="#333" mb={0.5} noWrap>
                                  {employeeNames[voluntary.person_id] || 'Loading...'}
                                </Typography>
                                
                                <Typography variant="body2" fontWeight="bold" color="#333" mb={1} noWrap sx={{ flexGrow: 1 }}>
                                  {voluntary.nameAndAddress || 'No Organization'}
                                </Typography>
                                
                                {voluntary.numberOfHours && (
                                  <Box
                                    sx={{
                                      display: 'inline-block',
                                      px: 1,
                                      py: 0.3,
                                      borderRadius: 0.5,
                                      backgroundColor: 'rgba(109, 35, 35, 0.1)',
                                      border: '1px solid rgba(109, 35, 35, 0.2)',
                                      alignSelf: 'flex-start'
                                    }}
                                  >
                                    <Typography variant="caption" sx={{ 
                                      color: accentColor,
                                      fontSize: '0.7rem',
                                      fontWeight: 'bold'
                                    }}>
                                      {voluntary.numberOfHours} hours
                                    </Typography>
                                  </Box>
                                )}
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      filteredData.map((voluntary) => (
                        <Card
                          key={voluntary.id}
                          onClick={() => handleOpenModal(voluntary)}
                          sx={{
                            cursor: "pointer",
                            border: "1px solid rgba(109, 35, 35, 0.1)",
                            mb: 1,
                            "&:hover": { 
                              borderColor: accentColor,
                              backgroundColor: 'rgba(254, 249, 225, 0.3)'
                            },
                          }}
                        >
                          <Box sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                              <Box sx={{ mr: 1.5, mt: 0.2 }}>
                                <VolunteerActivismIcon sx={{ fontSize: 20, color: accentColor }} />
                              </Box>
                              
                              <Box sx={{ flexGrow: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                  <Typography variant="caption" sx={{ 
                                    color: accentColor,
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold',
                                    mr: 1
                                  }}>
                                    ID: {voluntary.person_id}
                                  </Typography>
                                  <Typography variant="body2" fontWeight="bold" color="#333">
                                    {employeeNames[voluntary.person_id] || 'Loading...'}
                                  </Typography>
                                </Box>
                                
                                <Typography variant="body2" color="#666" sx={{ mb: 0.5 }}>
                                  {voluntary.nameAndAddress || 'No Organization'}
                                </Typography>
                                
                                {voluntary.numberOfHours && (
                                  <Box
                                    sx={{
                                      display: 'inline-block',
                                      px: 1,
                                      py: 0.3,
                                      borderRadius: 0.5,
                                      backgroundColor: 'rgba(109, 35, 35, 0.1)',
                                      border: '1px solid rgba(109, 35, 35, 0.2)',
                                    }}
                                  >
                                    <Typography variant="caption" sx={{ 
                                      color: accentColor,
                                      fontSize: '0.7rem',
                                      fontWeight: 'bold'
                                    }}>
                                      Hours: {voluntary.numberOfHours}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            </Box>
                          </Box>
                        </Card>
                      ))
                    )}
                    
                    {filteredData.length === 0 && (
                      <Box textAlign="center" py={4}>
                        <Typography variant="h6" color={accentColor} fontWeight="bold" sx={{ mb: 1 }}>
                          No Records Found
                        </Typography>
                        <Typography variant="body2" color={grayColor}>
                          Try adjusting your search criteria
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </GlassCard>
            </Fade>
          </Grid>
        </Grid>

        {/* Edit Modal */}
        <Modal
          open={!!editVoluntary}
          onClose={handleCloseModal}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <GlassCard
            sx={{
              width: "90%",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflowY: 'auto',
            }}
          >
            {editVoluntary && (
              <>
                <Box
                  sx={{
                    p: 4,
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                    color: accentColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {isEditing
                      ? "Edit Voluntary Work Information"
                      : "Voluntary Work Details"}
                  </Typography>
                  <IconButton onClick={handleCloseModal} sx={{ color: accentColor }}>
                    <Close />
                  </IconButton>
                </Box>

                <Box sx={{ p: 4 }}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: accentColor, display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ mr: 2, fontSize: 24 }} />
                      Employee Information
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                          Search Employee
                        </Typography>
                        <EmployeeAutocomplete
                          value={editVoluntary?.person_id || ''}
                          onChange={
                            isEditing ? handleEditEmployeeChange : () => {}
                          }
                          selectedEmployee={selectedEditEmployee}
                          onEmployeeSelect={
                            isEditing ? handleEditEmployeeSelect : () => {}
                          }
                          placeholder="Search and select employee..."
                          required
                          disabled={!isEditing}
                          dropdownDisabled={!isEditing}
                        />
                        {!isEditing && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: grayColor,
                              fontStyle: 'italic',
                              display: 'block',
                              mt: 0.5,
                            }}
                          >
                            Contact administrator for assistance.
                          </Typography>
                        )}
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                          Selected Employee
                        </Typography>
                        {selectedEditEmployee ? (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              backgroundColor: 'rgba(254, 249, 225, 0.8)',
                              border: '1px solid rgba(109, 35, 35, 0.3)',
                              borderRadius: 2,
                              padding: '12px',
                              gap: 1.5,
                            }}
                          >
                            <PersonIcon sx={{ color: accentColor, fontSize: 20 }} />
                            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 'bold',
                                  color: accentColor,
                                  fontSize: '14px',
                                  lineHeight: 1.2,
                                }}
                              >
                                {selectedEditEmployee.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: grayColor,
                                  fontSize: '12px',
                                  lineHeight: 1.2,
                                }}
                              >
                                ID: {selectedEditEmployee.employeeNumber}
                              </Typography>
                            </Box>
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'rgba(0, 0, 0, 0.05)',
                              border: '2px dashed rgba(109, 35, 35, 0.3)',
                              borderRadius: 2,
                              padding: '12px',
                              minHeight: '48px',
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                color: grayColor,
                                fontStyle: 'italic',
                                fontSize: '14px',
                              }}
                            >
                              No employee selected
                            </Typography>
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider sx={{ my: 3, borderColor: 'rgba(109,35,35,0.1)' }} />

                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: accentColor, display: 'flex', alignItems: 'center' }}>
                    <VolunteerActivismIcon sx={{ mr: 2, fontSize: 24 }} />
                    Voluntary Work Details
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                        Organization Name and Address
                      </Typography>
                      {isEditing ? (
                        <ModernTextField
                          value={editVoluntary.nameAndAddress}
                          onChange={(e) =>
                            handleChange('nameAndAddress', e.target.value, true)
                          }
                          fullWidth
                          size="small"
                        />
                      ) : (
                        <Box sx={{ 
                          p: 1.5, 
                          bgcolor: 'rgba(254, 249, 225, 0.5)', 
                          borderRadius: 1,
                          border: '1px solid rgba(109, 35, 35, 0.2)'
                        }}>
                          <Typography variant="body2">
                            {editVoluntary.nameAndAddress}
                          </Typography>
                        </Box>
                      )}
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                        Date From
                      </Typography>
                      {isEditing ? (
                        <ModernTextField
                          type="date"
                          value={editVoluntary.dateFrom?.split('T')[0] || ''}
                          onChange={(e) =>
                            handleChange('dateFrom', e.target.value, true)
                          }
                          fullWidth
                          size="small"
                        />
                      ) : (
                        <Box sx={{ 
                          p: 1.5, 
                          bgcolor: 'rgba(254, 249, 225, 0.5)', 
                          borderRadius: 1,
                          border: '1px solid rgba(109, 35, 35, 0.2)'
                        }}>
                          <Typography variant="body2">
                            {formatDate(editVoluntary.dateFrom)}
                          </Typography>
                        </Box>
                      )}
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                        Date To
                      </Typography>
                      {isEditing ? (
                        <ModernTextField
                          type="date"
                          value={editVoluntary.dateTo?.split('T')[0] || ''}
                          onChange={(e) =>
                            handleChange('dateTo', e.target.value, true)
                          }
                          fullWidth
                          size="small"
                        />
                      ) : (
                        <Box sx={{ 
                          p: 1.5, 
                          bgcolor: 'rgba(254, 249, 225, 0.5)', 
                          borderRadius: 1,
                          border: '1px solid rgba(109, 35, 35, 0.2)'
                        }}>
                          <Typography variant="body2">
                            {formatDate(editVoluntary.dateTo)}
                          </Typography>
                        </Box>
                      )}
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                        Number of Hours
                      </Typography>
                      {isEditing ? (
                        <ModernTextField
                          value={editVoluntary.numberOfHours}
                          onChange={(e) =>
                            handleChange('numberOfHours', e.target.value, true)
                          }
                          fullWidth
                          size="small"
                        />
                      ) : (
                        <Box sx={{ 
                          p: 1.5, 
                          bgcolor: 'rgba(254, 249, 225, 0.5)', 
                          borderRadius: 1,
                          border: '1px solid rgba(109, 35, 35, 0.2)'
                        }}>
                          <Typography variant="body2">
                            {editVoluntary.numberOfHours || 'N/A'}
                          </Typography>
                        </Box>
                      )}
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                        Nature of Work
                      </Typography>
                      {isEditing ? (
                        <ModernTextField
                          value={editVoluntary.natureOfWork}
                          onChange={(e) =>
                            handleChange('natureOfWork', e.target.value, true)
                          }
                          fullWidth
                          size="small"
                        />
                      ) : (
                        <Box sx={{ 
                          p: 1.5, 
                          bgcolor: 'rgba(254, 249, 225, 0.5)', 
                          borderRadius: 1,
                          border: '1px solid rgba(109, 35, 35, 0.2)'
                        }}>
                          <Typography variant="body2">
                            {editVoluntary.natureOfWork || 'N/A'}
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                  </Grid>

                  <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'flex-end' }}>
                    {!isEditing ? (
                      <>
                        <ProfessionalButton
                          onClick={() => handleDelete(editVoluntary.id)}
                          variant="outlined"
                          startIcon={<DeleteIcon />}
                          sx={{
                            color: "#d32f2f",
                            borderColor: "#d32f2f",
                            "&:hover": {
                              backgroundColor: "#d32f2f",
                              color: "#fff"
                            }
                          }}
                        >
                          Delete
                        </ProfessionalButton>
                        <ProfessionalButton
                          onClick={handleStartEdit}
                          variant="contained"
                          startIcon={<EditIcon />}
                          sx={{ 
                            backgroundColor: accentColor, 
                            color: primaryColor,
                            "&:hover": { backgroundColor: accentDark }
                          }}
                        >
                          Edit
                        </ProfessionalButton>
                      </>
                    ) : (
                      <>
                        <ProfessionalButton
                          onClick={handleCancelEdit}
                          variant="outlined"
                          startIcon={<CancelIcon />}
                          sx={{
                            color: grayColor,
                            borderColor: grayColor,
                            "&:hover": {
                              backgroundColor: 'rgba(108, 117, 125, 0.1)'
                            }
                          }}
                        >
                          Cancel
                        </ProfessionalButton>
                        <ProfessionalButton
                          onClick={handleUpdate}
                          variant="contained"
                          startIcon={<SaveIcon />}
                          disabled={!hasChanges()}
                          sx={{ 
                            backgroundColor: hasChanges() ? accentColor : grayColor, 
                            color: primaryColor,
                            "&:hover": { 
                              backgroundColor: hasChanges() ? accentDark : grayColor
                            },
                            "&:disabled": {
                              backgroundColor: grayColor,
                              color: "#999"
                            }
                          }}
                        >
                          Save
                        </ProfessionalButton>
                      </>
                    )}
                  </Box>
                </Box>
              </>
            )}
          </GlassCard>
        </Modal>

        <SuccessfullOverlay open={successOpen} action={successAction} />
        
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default VoluntaryWork;