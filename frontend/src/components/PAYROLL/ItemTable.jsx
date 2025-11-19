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
  FormControl,
  Autocomplete,
  Fade,
  Divider,
  Backdrop,
  styled,
  alpha,
  Avatar,
  Tooltip,
} from "@mui/material";
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
  Label as FactCheckIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh,
} from "@mui/icons-material";

import ReorderIcon from '@mui/icons-material/Reorder';
import LoadingOverlay from '../LoadingOverlay';
import SuccessfullOverlay from '../SuccessfulOverlay';
import AccessDenied from '../AccessDenied';
import { useNavigate } from "react-router-dom";

// Professional styled components matching PayslipOverall
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
        `${API_BASE_URL}/Remittance/employees/search?q=${encodeURIComponent(searchQuery)}`,
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

const ItemTable = () => {
  const [data, setData] = useState([]);
  const [employeeNames, setEmployeeNames] = useState({});
  const [newItem, setNewItem] = useState({
    item_description: '',
    employeeID: '',
    name: '',
    item_code: '',
    salary_grade: '',
    step: '',
    effectivityDate: '',
  });
  const [editItem, setEditItem] = useState(null);
  const [originalItem, setOriginalItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successAction, setSuccessAction] = useState("");
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
  
  // Color scheme matching PayslipOverall
  const primaryColor = '#FEF9E1'; // Cream is primary
  const secondaryColor = '#FFF8E7'; // Light cream
  const accentColor = '#6d2323'; // Burgundy is accent
  const accentDark = '#8B3333'; // Darker burgundy
  const blackColor = '#1a1a1a';
  const whiteColor = '#FFFFFF';
  const grayColor = '#6c757d';
  
  useEffect(() => {
    const userId = localStorage.getItem('employeeNumber');
    const pageId = 10; // Different page ID for items
    if (!userId) {
      setHasAccess(false);
      return;
    }
    const checkAccess = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/page_access/${userId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (response.ok) {
          const accessData = await response.json();
          const hasPageAccess = accessData.some(access => 
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
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/item-table`, getAuthHeaders());
      setData(res.data);
      
      // Fetch employee names for all records
      const uniqueEmployeeIds = [...new Set(res.data.map(item => item.employeeID).filter(Boolean))];
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
      showSnackbar('Failed to fetch item records. Please try again.', 'error');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['item_description', 'employeeID', 'name'];
    
    requiredFields.forEach(field => {
      if (!newItem[field] || newItem[field].trim() === '') {
        newErrors[field] = 'This field is required';
      }
    });
    
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
      await axios.post(`${API_BASE_URL}/api/item-table`, newItem, getAuthHeaders());
      setNewItem({
        item_description: '',
        employeeID: '',
        name: '',
        item_code: '',
        salary_grade: '',
        step: '',
        effectivityDate: '',
      });
      setSelectedEmployee(null);
      setErrors({});
      setTimeout(() => {     
        setLoading(false);  
        setSuccessAction("adding");
        setSuccessOpen(true);
        setTimeout(() => setSuccessOpen(false), 2000);
      }, 300);  
      fetchItems();
    } catch (err) {
      console.error('Error adding data:', err);
      setLoading(false);
      showSnackbar('Failed to add item record. Please try again.', 'error');
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${API_BASE_URL}/api/item-table/${editItem.id}`, editItem, getAuthHeaders());
      setEditItem(null);
      setOriginalItem(null);
      setSelectedEditEmployee(null);
      setIsEditing(false);
      fetchItems();
      setSuccessAction("edit");
      setSuccessOpen(true);
      setTimeout(() => setSuccessOpen(false), 2000);
    } catch (err) {
      console.error('Error updating data:', err);
      showSnackbar('Failed to update item record. Please try again.', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/item-table/${id}`, getAuthHeaders());
      setEditItem(null);
      setOriginalItem(null);
      setSelectedEditEmployee(null);
      setIsEditing(false);
      fetchItems();
      setSuccessAction("delete");
      setSuccessOpen(true);
      setTimeout(() => setSuccessOpen(false), 2000);
    } catch (err) {
      console.error('Error deleting data:', err);
      showSnackbar('Failed to delete item record. Please try again.', 'error');
    }
  };

  const handleChange = (field, value, isEdit = false) => {
    if (isEdit) {
      setEditItem({ ...editItem, [field]: value });
    } else {
      setNewItem({ ...newItem, [field]: value });
      if (errors[field]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    }
  };

  const handleEmployeeChange = (employeeNumber) => {
    setNewItem({ ...newItem, employeeID });
    // Auto-fill name when employee is selected
    if (selectedEmployee) {
      setNewItem({ 
        ...newItem, 
        employeeID: employeeNumber,
        name: selectedEmployee.name
      });
    }
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.employeeID;
      delete newErrors.name;
      return newErrors;
    });
  };

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
    // Auto-fill name when employee is selected
    setNewItem({ 
      ...newItem, 
      employeeID: employee.employeeNumber,
      name: employee.name
    });
  };

  const handleEditEmployeeChange = (employeeNumber) => {
    setEditItem({ ...editItem, employeeID });
    // Auto-fill name when employee is selected
    if (selectedEditEmployee) {
      setEditItem({ 
        ...editItem, 
        employeeID: employeeNumber,
        name: selectedEditEmployee.name
      });
    }
  };

  const handleEditEmployeeSelect = (employee) => {
    setSelectedEditEmployee(employee);
    // Auto-fill name when employee is selected
    setEditItem({ 
      ...editItem, 
      employeeID: employee.employeeNumber,
      name: employee.name
    });
  };

  const handleOpenModal = async (item) => {
    const employeeName = employeeNames[item.employeeID] || item.name || 'Unknown';
    
    setEditItem({ ...item });
    setOriginalItem({ ...item });
    setSelectedEditEmployee({
      name: employeeName,
      employeeNumber: item.employeeID,
    });
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditItem({ ...originalItem });
    setSelectedEditEmployee({
      name: employeeNames[originalItem.employeeID] || originalItem.name || 'Unknown',
      employeeNumber: originalItem.employeeID,
    });
    setIsEditing(false);
  };

  const handleCloseModal = () => {
    setEditItem(null);
    setOriginalItem(null);
    setSelectedEditEmployee(null);
    setIsEditing(false);
  };

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const hasChanges = () => {
    if (!editItem || !originalItem) return false;
    
    return (
      editItem.item_description !== originalItem.item_description ||
      editItem.employeeID !== originalItem.employeeID ||
      editItem.name !== originalItem.name ||
      editItem.item_code !== originalItem.item_code ||
      editItem.salary_grade !== originalItem.salary_grade ||
      editItem.step !== originalItem.step ||
      editItem.effectivityDate !== originalItem.effectivityDate
    );
  };

  const salaryGradeOptions = [
    'JO GRAD',
    'JO UNDERGRAD',
    ...Array.from({ length: 33 }, (_, index) => `${index + 1}`),
  ];

  const stepOptions = [...Array(8)].map((_, index) => `step${index + 1}`);

  // Function to get year from salary grade
  const getYearFromSalaryGrade = (salaryGrade) => {
    if (!salaryGrade) return new Date().getFullYear().toString();
    
    // For JO grades, use current year
    if (salaryGrade.includes('JO')) {
      return new Date().getFullYear().toString();
    }
    
    // For regular grades, you might have a mapping logic
    // For now, we'll use current year as default
    return new Date().getFullYear().toString();
  };

  if (hasAccess === null) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
        message="You do not have permission to access Item Information. Contact your administrator to request access."
        returnPath="/admin-home"
        returnButtonText="Return to Home"
      />
    );
  }

  const filteredData = data.filter((item) => {
    const employeeID = item.employeeID?.toString() || "";
    const name = item.name?.toLowerCase() || "";
    const itemDescription = item.item_description?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return employeeID.includes(search) || name.includes(search) || itemDescription.includes(search);
  });

  return (
    <Box sx={{ 
      py: 4,
      mt: -5,
      width: '1600px', // Fixed width
      mx: 'auto', // Center horizontally
      overflow: 'hidden', // Prevent horizontal scroll
    }}>
      {/* Container with fixed width */}
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
                {/* Decorative elements */}
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
                      <FactCheckIcon sx={{color: accentColor, fontSize: 32 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1, lineHeight: 1.2, color: accentColor }}>
                        Item Information Management
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.8, fontWeight: 400, color: accentDark }}>
                        Add and manage item records for employees
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
              Processing item record...
            </Typography>
          </Box>
        </Backdrop>

        {/* Main Content */}
        <Grid container spacing={4}>
          {/* Add New Item Section */}
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
                  <FactCheckIcon sx={{ fontSize: "1.8rem", mr: 2 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Add New Item
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      Fill in item information
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
                          value={newItem.employeeID}
                          onChange={handleEmployeeChange}
                          selectedEmployee={selectedEmployee}
                          onEmployeeSelect={handleEmployeeSelect}
                          placeholder="Search and select employee..."
                          required
                          error={!!errors.employeeID}
                          helperText={errors.employeeID || ''}
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
                              paddingLeft: '12px',
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
                              minHeight: '31px',
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
                    <FactCheckIcon sx={{ mr: 2, fontSize: 24 }} />
                    Item Details
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                        Position <span style={{ marginLeft: '12px', fontWeight: 400, opacity: 0.7, color: 'red' }}>*</span>
                      </Typography>
                      <ModernTextField
                        value={newItem.item_description}
                        onChange={(e) => handleChange("item_description", e.target.value)}
                        fullWidth
                        size="small"
                        error={!!errors.item_description}
                        helperText={errors.item_description || ''}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                        Item Code
                      </Typography>
                      <ModernTextField
                        value={newItem.item_code}
                        onChange={(e) => handleChange("item_code", e.target.value)}
                        fullWidth
                        size="small"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                        Salary Grade
                      </Typography>
                      <FormControl fullWidth>
                        <Autocomplete
                          freeSolo
                          options={salaryGradeOptions}
                          value={newItem.salary_grade}
                          onChange={(event, newValue) => {
                            handleChange("salary_grade", newValue || '');
                            // Auto-update effectivity date when salary grade changes
                            if (newValue) {
                              handleChange("effectivityDate", getYearFromSalaryGrade(newValue));
                            }
                          }}
                          onInputChange={(event, newInputValue) => {
                            handleChange("salary_grade", newInputValue);
                            // Auto-update effectivity date when salary grade changes
                            if (newInputValue) {
                              handleChange("effectivityDate", getYearFromSalaryGrade(newInputValue));
                            }
                          }}
                          renderInput={(params) => (
                            <ModernTextField 
                              {...params} 
                              size="small"
                            />
                          )}
                        />
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                        Step
                      </Typography>
                      <FormControl fullWidth>
                        <Autocomplete
                          freeSolo
                          options={stepOptions}
                          value={newItem.step}
                          onChange={(event, newValue) =>
                            handleChange("step", newValue || '')
                          }
                          onInputChange={(event, newInputValue) =>
                            handleChange("step", newInputValue)
                          }
                          renderInput={(params) => (
                            <ModernTextField 
                              {...params} 
                              size="small"
                            />
                          )}
                        />
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                        Effectivity Date (Year)
                      </Typography>
                      <ModernTextField
                        value={newItem.effectivityDate}
                        onChange={(e) => handleChange("effectivityDate", e.target.value)}
                        fullWidth
                        size="small"
                        placeholder="YYYY"
                        inputProps={{ maxLength: 4 }}
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
                      Add Item Record
                    </ProfessionalButton>
                  </Box>
                </Box>
              </GlassCard>
            </Fade>
          </Grid>

          {/* Item Records Section */}
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
                        Item Records
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
                      placeholder="Search by Employee ID, Name, or Position"
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
                        {filteredData.map((item) => (
                          <Grid item xs={12} sm={6} md={4} key={item.id}>
                            <Card
                              onClick={() => handleOpenModal(item)}
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
                                  <FactCheckIcon sx={{ fontSize: 18, color: accentColor, mr: 0.5 }} />
                                  <Typography variant="caption" sx={{ 
                                    color: accentColor, 
                                    px: 0.5, 
                                    py: 0.2, 
                                    borderRadius: 0.5,
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold'
                                  }}>
                                    ID: {item.employeeID}
                                  </Typography>
                                </Box>
                                
                                <Typography variant="body2" fontWeight="bold" color="#333" mb={0.5} noWrap>
                                  {employeeNames[item.employeeID] || item.name || 'Loading...'}
                                </Typography>
                                
                                <Typography variant="body2" fontWeight="bold" color="#333" mb={1} noWrap sx={{ flexGrow: 1 }}>
                                  {item.item_description || 'No Position'}
                                </Typography>
                                
                                {item.salary_grade && (
                                  <Box
                                    sx={{
                                      display: 'inline-block',
                                      px: 1,
                                      py: 0.3,
                                      borderRadius: 0.5,
                                      backgroundColor: 'rgba(254, 249, 225, 0.5)',
                                      border: '1px solid rgba(109, 35, 35, 0.2)',
                                      alignSelf: 'flex-start'
                                    }}
                                  >
                                    <Typography variant="caption" sx={{ 
                                      color: accentColor, 
                                      fontSize: '0.7rem',
                                      fontWeight: 'bold'
                                    }}>
                                      Grade: {item.salary_grade}
                                    </Typography>
                                  </Box>
                                )}
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      filteredData.map((item) => (
                        <Card
                          key={item.id}
                          onClick={() => handleOpenModal(item)}
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
                                <FactCheckIcon sx={{ fontSize: 20, color: accentColor }} />
                              </Box>
                              
                              <Box sx={{ flexGrow: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                  <Typography variant="caption" sx={{ 
                                    color: accentColor, 
                                    px: 0.5, 
                                    py: 0.2, 
                                    borderRadius: 0.5,
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold',
                                    mr: 1
                                  }}>
                                    ID: {item.employeeID}
                                  </Typography>
                                  <Typography variant="body2" fontWeight="bold" color="#333">
                                    {employeeNames[item.employeeID] || item.name || 'Loading...'}
                                  </Typography>
                                </Box>
                                
                                <Typography variant="body2" color={grayColor} sx={{ mb: 0.5 }}>
                                  {item.item_description || 'No Position'}
                                </Typography>
                                
                                {item.salary_grade && (
                                  <Box
                                    sx={{
                                      display: 'inline-block',
                                      px: 1,
                                      py: 0.3,
                                      borderRadius: 0.5,
                                      backgroundColor: 'rgba(254, 249, 225, 0.5)',
                                      border: '1px solid rgba(109, 35, 35, 0.2)'
                                    }}
                                  >
                                    <Typography variant="caption" sx={{ 
                                      color: accentColor, 
                                      fontSize: '0.7rem',
                                      fontWeight: 'bold'
                                    }}>
                                      Grade: {item.salary_grade}
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
          open={!!editItem}
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
            {editItem && (
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
                    {isEditing ? "Edit Item Information" : "Item Details"}
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
                          value={editItem?.employeeID || ''}
                          onChange={isEditing ? handleEditEmployeeChange : () => {}}
                          selectedEmployee={selectedEditEmployee}
                          onEmployeeSelect={isEditing ? handleEditEmployeeSelect : () => {}}
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
                    <FactCheckIcon sx={{ mr: 2, fontSize: 24 }} />
                    Item Details
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                        Position
                      </Typography>
                      {isEditing ? (
                        <ModernTextField
                          value={editItem.item_description}
                          onChange={(e) => handleChange("item_description", e.target.value, true)}
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
                            {editItem.item_description || 'N/A'}
                          </Typography>
                        </Box>
                      )}
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                        Item Code
                      </Typography>
                      {isEditing ? (
                        <ModernTextField
                          value={editItem.item_code}
                          onChange={(e) => handleChange("item_code", e.target.value, true)}
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
                            {editItem.item_code || 'N/A'}
                          </Typography>
                        </Box>
                      )}
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                        Salary Grade
                      </Typography>
                      {isEditing ? (
                        <FormControl fullWidth>
                          <Autocomplete
                            freeSolo
                            options={salaryGradeOptions}
                            value={editItem.salary_grade}
                            onChange={(event, newValue) => {
                              handleChange("salary_grade", newValue || '', true);
                              // Auto-update effectivity date when salary grade changes
                              if (newValue) {
                                handleChange("effectivityDate", getYearFromSalaryGrade(newValue), true);
                              }
                            }}
                            onInputChange={(event, newInputValue) => {
                              handleChange("salary_grade", newInputValue, true);
                              // Auto-update effectivity date when salary grade changes
                              if (newInputValue) {
                                handleChange("effectivityDate", getYearFromSalaryGrade(newInputValue), true);
                              }
                            }}
                            renderInput={(params) => (
                              <ModernTextField 
                                {...params} 
                                size="small"
                              />
                            )}
                          />
                        </FormControl>
                      ) : (
                        <Box sx={{ 
                          p: 1.5, 
                          bgcolor: 'rgba(254, 249, 225, 0.5)', 
                          borderRadius: 1,
                          border: '1px solid rgba(109, 35, 35, 0.2)'
                        }}>
                          <Typography variant="body2">
                            {editItem.salary_grade || 'N/A'}
                          </Typography>
                        </Box>
                      )}
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                        Step
                      </Typography>
                      {isEditing ? (
                        <FormControl fullWidth>
                          <Autocomplete
                            freeSolo
                            options={stepOptions}
                            value={editItem.step}
                            onChange={(event, newValue) =>
                              handleChange("step", newValue || '', true)
                            }
                            onInputChange={(event, newInputValue) =>
                              handleChange("step", newInputValue, true)
                            }
                            renderInput={(params) => (
                              <ModernTextField 
                                {...params} 
                                size="small"
                              />
                            )}
                          />
                        </FormControl>
                      ) : (
                        <Box sx={{ 
                          p: 1.5, 
                          bgcolor: 'rgba(254, 249, 225, 0.5)', 
                          borderRadius: 1,
                          border: '1px solid rgba(109, 35, 35, 0.2)'
                        }}>
                          <Typography variant="body2">
                            {editItem.step || 'N/A'}
                          </Typography>
                        </Box>
                      )}
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                        Effectivity Date (Year)
                      </Typography>
                      {isEditing ? (
                        <ModernTextField
                          value={editItem.effectivityDate}
                          onChange={(e) => handleChange("effectivityDate", e.target.value, true)}
                          fullWidth
                          size="small"
                          placeholder="YYYY"
                          inputProps={{ maxLength: 4 }}
                        />
                      ) : (
                        <Box sx={{ 
                          p: 1.5, 
                          bgcolor: 'rgba(254, 249, 225, 0.5)', 
                          borderRadius: 1,
                          border: '1px solid rgba(109, 35, 35, 0.2)'
                        }}>
                          <Typography variant="body2">
                            {editItem.effectivityDate || 'N/A'}
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                  </Grid>

                  <Box sx={{ display: 'flex', gap: 2, mt: 4, justifyContent: 'flex-end' }}>
                    {!isEditing ? (
                      <>
                        <ProfessionalButton
                          onClick={() => handleDelete(editItem.id)}
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

export default ItemTable;