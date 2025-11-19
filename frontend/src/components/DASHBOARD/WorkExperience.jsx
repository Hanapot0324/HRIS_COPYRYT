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
  ListItemIcon,
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
  WorkHistory as WorkHistoryIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh,
} from '@mui/icons-material';
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';

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

const WorkExperience = () => {
  const [data, setData] = useState([]);
  const [employeeNames, setEmployeeNames] = useState({});
  const [newWorkExperience, setNewWorkExperience] = useState({
    workDateFrom: '',
    workDateTo: '',
    workPositionTitle: '',
    workCompany: '',
    workMonthlySalary: '',
    SalaryJobOrPayGrade: '',
    StatusOfAppointment: '',
    isGovtService: '',
    person_id: '',
  });
  const [editWorkExperience, setEditWorkExperience] = useState(null);
  const [originalWorkExperience, setOriginalWorkExperience] = useState(null);
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
    const pageId = 10;
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
    fetchWorkExperiences();
  }, []);

  const fetchWorkExperiences = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/WorkExperienceRoute/work-experience-table`
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
        'Failed to fetch work experience records. Please try again.',
        'error'
      );
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      'workDateFrom',
      'workDateTo',
      'workPositionTitle',
      'workCompany',
      'person_id',
    ];

    requiredFields.forEach((field) => {
      if (!newWorkExperience[field] || newWorkExperience[field].trim() === '') {
        newErrors[field] = 'This field is required';
      }
    });

    if (newWorkExperience.workDateFrom && newWorkExperience.workDateTo) {
      if (
        new Date(newWorkExperience.workDateFrom) >
        new Date(newWorkExperience.workDateTo)
      ) {
        newErrors.workDateTo = 'End date must be after start date';
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
        `${API_BASE_URL}/WorkExperienceRoute/work-experience-table`,
        newWorkExperience
      );
      setNewWorkExperience({
        workDateFrom: '',
        workDateTo: '',
        workPositionTitle: '',
        workCompany: '',
        workMonthlySalary: '',
        SalaryJobOrPayGrade: '',
        StatusOfAppointment: '',
        isGovtService: '',
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
      fetchWorkExperiences();
    } catch (err) {
      console.error('Error adding data:', err);
      setLoading(false);
      showSnackbar(
        'Failed to add work experience record. Please try again.',
        'error'
      );
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/WorkExperienceRoute/work-experience-table/${editWorkExperience.id}`,
        editWorkExperience
      );
      setEditWorkExperience(null);
      setOriginalWorkExperience(null);
      setSelectedEditEmployee(null);
      setIsEditing(false);
      fetchWorkExperiences();
      setSuccessAction('edit');
      setSuccessOpen(true);
      setTimeout(() => setSuccessOpen(false), 2000);
    } catch (err) {
      console.error('Error updating data:', err);
      showSnackbar(
        'Failed to update work experience record. Please try again.',
        'error'
      );
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/WorkExperienceRoute/work-experience-table/${id}`
      );
      setEditWorkExperience(null);
      setOriginalWorkExperience(null);
      setSelectedEditEmployee(null);
      setIsEditing(false);
      fetchWorkExperiences();
      setSuccessAction('delete');
      setSuccessOpen(true);
      setTimeout(() => setSuccessOpen(false), 2000);
    } catch (err) {
      console.error('Error deleting data:', err);
      showSnackbar(
        'Failed to delete work experience record. Please try again.',
        'error'
      );
    }
  };

  const handleChange = (field, value, isEdit = false) => {
    if (isEdit) {
      setEditWorkExperience({ ...editWorkExperience, [field]: value });
    } else {
      setNewWorkExperience({ ...newWorkExperience, [field]: value });
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
    setNewWorkExperience({ ...newWorkExperience, person_id: employeeNumber });
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
    setEditWorkExperience({ ...editWorkExperience, person_id: employeeNumber });
  };

  const handleEditEmployeeSelect = (employee) => {
    setSelectedEditEmployee(employee);
  };

  const handleOpenModal = async (workExp) => {
    const employeeName = employeeNames[workExp.person_id] || 'Unknown';

    setEditWorkExperience({ ...workExp });
    setOriginalWorkExperience({ ...workExp });
    setSelectedEditEmployee({
      name: employeeName,
      employeeNumber: workExp.person_id,
    });
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditWorkExperience({ ...originalWorkExperience });
    setSelectedEditEmployee({
      name: employeeNames[originalWorkExperience.person_id] || 'Unknown',
      employeeNumber: originalWorkExperience.person_id,
    });
    setIsEditing(false);
  };

  const handleCloseModal = () => {
    setEditWorkExperience(null);
    setOriginalWorkExperience(null);
    setSelectedEditEmployee(null);
    setIsEditing(false);
  };

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const hasChanges = () => {
    if (!editWorkExperience || !originalWorkExperience) return false;

    return (
      editWorkExperience.workDateFrom !== originalWorkExperience.workDateFrom ||
      editWorkExperience.workDateTo !== originalWorkExperience.workDateTo ||
      editWorkExperience.workPositionTitle !==
        originalWorkExperience.workPositionTitle ||
      editWorkExperience.workCompany !== originalWorkExperience.workCompany ||
      editWorkExperience.workMonthlySalary !==
        originalWorkExperience.workMonthlySalary ||
      editWorkExperience.SalaryJobOrPayGrade !==
        originalWorkExperience.SalaryJobOrPayGrade ||
      editWorkExperience.StatusOfAppointment !==
        originalWorkExperience.StatusOfAppointment ||
      editWorkExperience.isGovtService !==
        originalWorkExperience.isGovtService ||
      editWorkExperience.person_id !== originalWorkExperience.person_id
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
        message="You do not have permission to access Work Experience Information. Contact your administrator to request access."
        returnPath="/admin-home"
        returnButtonText="Return to Home"
      />
    );
  }

  const filteredData = data.filter((workExp) => {
    const companyName = workExp.workCompany?.toLowerCase() || '';
    const positionTitle = workExp.workPositionTitle?.toLowerCase() || '';
    const personId = workExp.person_id?.toString() || '';
    const employeeName = employeeNames[workExp.person_id]?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return (
      personId.includes(search) ||
      companyName.includes(search) ||
      positionTitle.includes(search) ||
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
                      <WorkHistoryIcon sx={{color: accentColor, fontSize: 32 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1, lineHeight: 1.2, color: accentColor }}>
                        Work Experience Information Management
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.8, fontWeight: 400, color: accentDark }}>
                        Add and manage work experience records for employees
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
              Processing work experience record...
            </Typography>
          </Box>
        </Backdrop>

        {/* Main Content */}
        <Grid container spacing={4}>
          {/* Add New Work Experience Section */}
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
                  <WorkHistoryIcon sx={{ fontSize: "1.8rem", mr: 2 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Add New Work Experience
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      Fill in the work experience information
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
                          value={newWorkExperience.person_id}
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
                    <WorkHistoryIcon sx={{ mr: 2, fontSize: 24 }} />
                    Work Experience Details
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                        Date From <span style={{ color: 'red' }}>*</span>
                      </Typography>
                      <ModernTextField
                        type="date"
                        value={newWorkExperience.workDateFrom}
                        onChange={(e) => handleChange('workDateFrom', e.target.value)}
                        fullWidth
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.workDateFrom}
                        helperText={errors.workDateFrom || ''}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                        Date To <span style={{ color: 'red' }}>*</span>
                      </Typography>
                      <ModernTextField
                        type="date"
                        value={newWorkExperience.workDateTo}
                        onChange={(e) => handleChange('workDateTo', e.target.value)}
                        fullWidth
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        error={!!errors.workDateTo}
                        helperText={errors.workDateTo || ''}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                        Position Title <span style={{ color: 'red' }}>*</span>
                      </Typography>
                      <ModernTextField
                        value={newWorkExperience.workPositionTitle}
                        onChange={(e) => handleChange('workPositionTitle', e.target.value)}
                        fullWidth
                        size="small"
                        error={!!errors.workPositionTitle}
                        helperText={errors.workPositionTitle || ''}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                        Company <span style={{ color: 'red' }}>*</span>
                      </Typography>
                      <ModernTextField
                        value={newWorkExperience.workCompany}
                        onChange={(e) => handleChange('workCompany', e.target.value)}
                        fullWidth
                        size="small"
                        error={!!errors.workCompany}
                        helperText={errors.workCompany || ''}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                        Monthly Salary
                      </Typography>
                      <ModernTextField
                        value={newWorkExperience.workMonthlySalary}
                        onChange={(e) => handleChange('workMonthlySalary', e.target.value)}
                        fullWidth
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                        Salary Job/Pay Grade
                      </Typography>
                      <ModernTextField
                        value={newWorkExperience.SalaryJobOrPayGrade}
                        onChange={(e) => handleChange('SalaryJobOrPayGrade', e.target.value)}
                        fullWidth
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                        Status of Appointment
                      </Typography>
                      <ModernTextField
                        value={newWorkExperience.StatusOfAppointment}
                        onChange={(e) => handleChange('StatusOfAppointment', e.target.value)}
                        fullWidth
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                        Government Service
                      </Typography>
                      <FormControl fullWidth size="small">
                        <Select
                          value={newWorkExperience.isGovtService || 'No'}
                          onChange={(e) => handleChange('isGovtService', e.target.value)}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 12,
                              backgroundColor: 'rgba(255, 255, 255, 0.8)',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              },
                              '&.Mui-focused': {
                                backgroundColor: 'rgba(255, 255, 255, 1)',
                                boxShadow: '0 4px 20px rgba(254, 249, 225, 0.25)',
                              },
                              '& fieldset': {
                                borderColor: 'rgba(109, 35, 35, 0.5)',
                                borderWidth: '1.5px',
                              },
                              '&:hover fieldset': {
                                borderColor: 'rgba(109, 35, 35, 0.7)',
                              },
                              '&.Mui-focused fieldset': {
                                borderColor: accentColor,
                              },
                            },
                          }}
                        >
                          <MenuItem value="Yes">Yes</MenuItem>
                          <MenuItem value="No">No</MenuItem>
                        </Select>
                      </FormControl>
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
                      Add Work Experience Record
                    </ProfessionalButton>
                  </Box>
                </Box>
              </GlassCard>
            </Fade>
          </Grid>

          {/* Work Experience Records Section */}
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
                        Work Experience Records
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
                      placeholder="Search by Employee ID, Name, Company, or Position"
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
                        {filteredData.map((workExp) => (
                          <Grid item xs={12} sm={6} md={4} key={workExp.id}>
                            <Card
                              onClick={() => handleOpenModal(workExp)}
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
                                  <WorkHistoryIcon sx={{ fontSize: 18, color: accentColor, mr: 0.5 }} />
                                  <Typography variant="caption" sx={{ 
                                    color: accentColor, 
                                    px: 0.5, 
                                    py: 0.2, 
                                    borderRadius: 0.5,
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold'
                                  }}>
                                    ID: {workExp.person_id}
                                  </Typography>
                                </Box>
                                
                                <Typography variant="body2" fontWeight="bold" color="#333" mb={0.5} noWrap>
                                  {employeeNames[workExp.person_id] || 'Loading...'}
                                </Typography>
                                
                                <Typography variant="body2" fontWeight="bold" color="#333" mb={1} noWrap sx={{ flexGrow: 1 }}>
                                  {workExp.workCompany || 'No Company'}
                                </Typography>
                                
                                {workExp.workPositionTitle && (
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
                                      {workExp.workPositionTitle}
                                    </Typography>
                                  </Box>
                                )}
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      filteredData.map((workExp) => (
                        <Card
                          key={workExp.id}
                          onClick={() => handleOpenModal(workExp)}
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
                                <WorkHistoryIcon sx={{ fontSize: 20, color: accentColor }} />
                              </Box>
                              
                              <Box sx={{ flexGrow: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                  <Typography variant="caption" sx={{ 
                                    color: accentColor,
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold',
                                    mr: 1
                                  }}>
                                    ID: {workExp.person_id}
                                  </Typography>
                                  <Typography variant="body2" fontWeight="bold" color="#333">
                                    {employeeNames[workExp.person_id] || 'Loading...'}
                                  </Typography>
                                </Box>
                                
                                <Typography variant="body2" color="#666" sx={{ mb: 0.5 }}>
                                  {workExp.workCompany || 'No Company'}
                                </Typography>
                                
                                {workExp.workPositionTitle && (
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
                                      Position: {workExp.workPositionTitle}
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
          open={!!editWorkExperience}
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
            {editWorkExperience && (
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
                      ? "Edit Work Experience Information"
                      : "Work Experience Details"}
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
                          value={editWorkExperience?.person_id || ''}
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
                    <WorkHistoryIcon sx={{ mr: 2, fontSize: 24 }} />
                    Work Experience Details
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                        Date From
                      </Typography>
                      {isEditing ? (
                        <ModernTextField
                          type="date"
                          value={editWorkExperience.workDateFrom?.split('T')[0] || ''}
                          onChange={(e) => handleChange('workDateFrom', e.target.value, true)}
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
                            {editWorkExperience.workDateFrom?.split('T')[0] || 'N/A'}
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
                          value={editWorkExperience.workDateTo?.split('T')[0] || ''}
                          onChange={(e) => handleChange('workDateTo', e.target.value, true)}
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
                            {editWorkExperience.workDateTo?.split('T')[0] || 'N/A'}
                          </Typography>
                        </Box>
                      )}
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                        Position Title
                      </Typography>
                      {isEditing ? (
                        <ModernTextField
                          value={editWorkExperience.workPositionTitle}
                          onChange={(e) => handleChange('workPositionTitle', e.target.value, true)}
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
                            {editWorkExperience.workPositionTitle || 'N/A'}
                          </Typography>
                        </Box>
                      )}
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                        Company
                      </Typography>
                      {isEditing ? (
                        <ModernTextField
                          value={editWorkExperience.workCompany}
                          onChange={(e) => handleChange('workCompany', e.target.value, true)}
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
                            {editWorkExperience.workCompany || 'N/A'}
                          </Typography>
                        </Box>
                      )}
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                        Monthly Salary
                      </Typography>
                      {isEditing ? (
                        <ModernTextField
                          value={editWorkExperience.workMonthlySalary}
                          onChange={(e) => handleChange('workMonthlySalary', e.target.value, true)}
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
                            {editWorkExperience.workMonthlySalary || 'N/A'}
                          </Typography>
                        </Box>
                      )}
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                        Salary Job/Pay Grade
                      </Typography>
                      {isEditing ? (
                        <ModernTextField
                          value={editWorkExperience.SalaryJobOrPayGrade}
                          onChange={(e) => handleChange('SalaryJobOrPayGrade', e.target.value, true)}
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
                            {editWorkExperience.SalaryJobOrPayGrade || 'N/A'}
                          </Typography>
                        </Box>
                      )}
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                        Status of Appointment
                      </Typography>
                      {isEditing ? (
                        <ModernTextField
                          value={editWorkExperience.StatusOfAppointment}
                          onChange={(e) => handleChange('StatusOfAppointment', e.target.value, true)}
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
                            {editWorkExperience.StatusOfAppointment || 'N/A'}
                          </Typography>
                        </Box>
                      )}
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                        Government Service
                      </Typography>
                      {isEditing ? (
                        <FormControl fullWidth size="small">
                          <Select
                            value={editWorkExperience.isGovtService || 'No'}
                            onChange={(e) => handleChange('isGovtService', e.target.value, true)}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 12,
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                },
                                '&.Mui-focused': {
                                  backgroundColor: 'rgba(255, 255, 255, 1)',
                                  boxShadow: '0 4px 20px rgba(254, 249, 225, 0.25)',
                                },
                                '& fieldset': {
                                  borderColor: 'rgba(109, 35, 35, 0.5)',
                                  borderWidth: '1.5px',
                                },
                                '&:hover fieldset': {
                                  borderColor: 'rgba(109, 35, 35, 0.7)',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: accentColor,
                                },
                              },
                            }}
                          >
                            <MenuItem value="Yes">Yes</MenuItem>
                            <MenuItem value="No">No</MenuItem>
                          </Select>
                        </FormControl>
                      ) : (
                        <Box sx={{ 
                          p: 1.5, 
                          bgcolor: 'rgba(254, 249, 225, 0.5)', 
                          borderRadius: 1,
                          border: '1px solid rgba(109, 35, 35, 0.2)'
                        }}>
                          <Typography variant="body2">
                            {editWorkExperience.isGovtService || 'N/A'}
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                  </Grid>

                  <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'flex-end' }}>
                    {!isEditing ? (
                      <>
                        <ProfessionalButton
                          onClick={() => handleDelete(editWorkExperience.id)}
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

export default WorkExperience;