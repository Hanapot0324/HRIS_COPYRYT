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
  Select,
  MenuItem,
  Fade,
  Backdrop,
  Avatar,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Badge,
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
  Domain as DomainIcon,
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh,
  Group as GroupIcon,
  People as PeopleIcon,
} from "@mui/icons-material";

import ReorderIcon from '@mui/icons-material/Reorder';
import LoadingOverlay from '../LoadingOverlay';
import AccessDenied from '../AccessDenied';
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";

// Professional styled components
const GlassCard = styled(Paper)(({ theme }) => ({
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

const DepartmentAssignment = () => {
  const [data, setData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [newAssignment, setNewAssignment] = useState({
    code: '',
    name: '',
    employeeNumber: '',
  });
  const [editAssignment, setEditAssignment] = useState(null);
  const [originalAssignment, setOriginalAssignment] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [departmentCodes, setDepartmentCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [expandedDepartment, setExpandedDepartment] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [departmentModalOpen, setDepartmentModalOpen] = useState(false);
  
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
  
  // Employee selection states
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedEditEmployee, setSelectedEditEmployee] = useState(null);
  
  useEffect(() => {
    const userId = localStorage.getItem('employeeNumber');
    const pageId = 11; // Different page ID for department assignment
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
    fetchAssignments();
    fetchDepartmentCodes();
  }, []);

  useEffect(() => {
    // Group assignments by department
    const grouped = data.reduce((acc, assignment) => {
      const deptCode = assignment.code || 'Unassigned';
      if (!acc[deptCode]) {
        acc[deptCode] = {
          code: deptCode,
          employees: []
        };
      }
      acc[deptCode].employees.push(assignment);
      return acc;
    }, {});
    
    const departmentArray = Object.values(grouped);
    setDepartmentData(departmentArray);
  }, [data]);

  const fetchAssignments = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/department-assignment`,
        getAuthHeaders()
      );
      setData(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching data', error);
      showSnackbar('Failed to fetch department assignments. Please try again.', 'error');
    }
  };

  const fetchDepartmentCodes = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/department-table`,
        getAuthHeaders()
      );
      setDepartmentCodes(response.data.map((item) => item.code));
    } catch (error) {
      console.error('Error fetching department codes', error);
    }
  };

  const handleAdd = async () => {
    if (!newAssignment.employeeNumber || newAssignment.employeeNumber.trim() === '') {
      showSnackbar('Please select an employee', 'error');
      return;
    }
    
    setLoading(true);
    try {
      // Filter out empty fields
      const filteredAssignment = Object.fromEntries(
        Object.entries(newAssignment).filter(([_, value]) => value !== '')
      );

      await axios.post(
        `${API_BASE_URL}/api/department-assignment`,
        filteredAssignment,
        getAuthHeaders()
      );
      setNewAssignment({
        code: '',
        name: '',
        employeeNumber: '',
      });
      setSelectedEmployee(null);
      setLoading(false);
      showSnackbar('Employee assigned to department successfully!', 'success');
      fetchAssignments();
    } catch (error) {
      console.error('Error adding entry', error);
      setLoading(false);
      showSnackbar('Failed to add department assignment. Please try again.', 'error');
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/api/department-assignment/${editAssignment.id}`,
        editAssignment,
        getAuthHeaders()
      );
      // Reset all states properly
      setEditAssignment(null);
      setOriginalAssignment(null);
      setSelectedEditEmployee(null);
      setIsEditing(false);
      setModalOpen(false);
      fetchAssignments();
      showSnackbar('Department assignment updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating entry', error);
      showSnackbar('Failed to update department assignment. Please try again.', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/api/department-assignment/${id}`,
        getAuthHeaders()
      );
      // Reset all states properly
      setEditAssignment(null);
      setOriginalAssignment(null);
      setSelectedEditEmployee(null);
      setIsEditing(false);
      setModalOpen(false);
      setDepartmentModalOpen(false);
      setSelectedDepartment(null);
      await fetchAssignments();
      showSnackbar('Department assignment deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting entry', error);
      showSnackbar('Failed to delete department assignment. Please try again.', 'error');
    }
  };

  const handleChange = (field, value, isEdit = false) => {
    if (isEdit) {
      setEditAssignment({ ...editAssignment, [field]: value });
    } else {
      setNewAssignment({ ...newAssignment, [field]: value });
    }
  };

  const handleOpenModal = (assignment, directEdit = false) => {
    setEditAssignment({ ...assignment });
    setOriginalAssignment({ ...assignment });
    setIsEditing(directEdit);
    setModalOpen(true);
    
    // Fetch employee details for edit modal
    if (assignment.employeeNumber) {
      fetchEmployeeById(assignment.employeeNumber, (employee) => {
        setSelectedEditEmployee(employee);
      });
    }
  };

  const fetchEmployeeById = async (employeeNumber, callback) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/Remittance/employees/${employeeNumber}`,
        getAuthHeaders()
      );
      if (callback) callback(response.data);
    } catch (error) {
      console.error('Error fetching employee by ID:', error);
    }
  };

  const handleOpenDepartmentModal = (department) => {
    setSelectedDepartment(department);
    setDepartmentModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditAssignment(null);
    setOriginalAssignment(null);
    setSelectedEditEmployee(null);
    setIsEditing(false);
    setModalOpen(false);
  };

  const handleCloseDepartmentModal = () => {
    setSelectedDepartment(null);
    setDepartmentModalOpen(false);
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditAssignment({ ...originalAssignment });
    setIsEditing(false);
  };

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const handleExpandDepartment = (departmentCode) => {
    if (expandedDepartment === departmentCode) {
      setExpandedDepartment(null);
    } else {
      setExpandedDepartment(departmentCode);
    }
  };

  const handleEmployeeChange = (employeeNumber) => {
    setNewAssignment({ ...newAssignment, employeeNumber });
  };

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
  };

  const handleEditEmployeeChange = (employeeNumber) => {
    setEditAssignment({ ...editAssignment, employeeNumber });
  };

  const handleEditEmployeeSelect = (employee) => {
    setSelectedEditEmployee(employee);
  };

  const hasChanges = () => {
    if (!editAssignment || !originalAssignment) return false;
    
    return (
      editAssignment.code !== originalAssignment.code ||
      editAssignment.name !== originalAssignment.name ||
      editAssignment.employeeNumber !== originalAssignment.employeeNumber
    );
  };

  if (hasAccess === null) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress sx={{ color: "#6d2323", mb: 2 }} />
          <Typography variant="h6" sx={{ color: "#6d2323" }}>
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
        message="You do not have permission to access Department Assignment. Contact your administrator to request access."
        returnPath="/admin-home"
        returnButtonText="Return to Home"
      />
    );
  }

  const filteredDepartmentData = departmentData.filter((department) => {
    const code = department.code?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    
    // Apply department filter if selected
    if (departmentFilter && code !== departmentFilter) {
      return false;
    }
    
    return code.includes(search);
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
                  background: `linear-gradient(135deg, #FEF9E1 0%, #FFF8E7 100%)`,
                  color: '#6d2323',
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
                      <DomainIcon sx={{color: '#6d2323', fontSize: 32 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1, lineHeight: 1.2, color: '#6d2323' }}>
                        Department Assignment Management
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.8, fontWeight: 400, color: '#8B3333' }}>
                        View departments and their assigned employees
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Chip 
                      label="Enterprise Grade" 
                      size="small" 
                      sx={{ 
                        bgcolor: 'rgba(109,35,35,0.15)', 
                        color: '#6d2323',
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
                          color: '#6d2323',
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

        {/* Main Content */}
        <Grid container spacing={4}>
          {/* Add New Assignment Section */}
          <Grid item xs={12} lg={6}>
            <Fade in timeout={700}>
              <GlassCard sx={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
                <Box
                  sx={{
                    p: 4,
                    background: `linear-gradient(135deg, #FEF9E1 0%, #FFF8E7 100%)`,
                    color: '#6d2323',
                    display: "flex",
                    alignItems: "center",
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <DomainIcon sx={{ fontSize: "1.8rem", mr: 2 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Assign Employee to Department
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      Fill in assignment information
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
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#6d2323', display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ mr: 2, fontSize: 24 }} />
                      Assignment Information <span style={{ marginLeft: '12px', fontWeight: 400, opacity: 0.7, color: 'red' }}>*</span>
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: '#6d2323' }}>
                          Department Code
                        </Typography>
                        <FormControl fullWidth>
                          <Select
                            value={newAssignment.code}
                            onChange={(e) => handleChange('code', e.target.value)}
                            displayEmpty
                            size="small"
                            sx={{
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
                                  '& fieldset': {
                                    borderColor: '#6d2323',
                                    borderWidth: '1.5px'
                                  },
                                },
                                '& fieldset': {
                                  borderColor: '#6d2323',
                                  borderWidth: '1.5px'
                                },
                              },
                            }}
                          >
                            <MenuItem value="">Select Department</MenuItem>
                            {departmentCodes.map((code, index) => (
                              <MenuItem key={index} value={code}>
                                {code}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12}>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: '#6d2323' }}>
                          Search Employee
                        </Typography>
                        <EmployeeAutocomplete
                          value={newAssignment.employeeNumber}
                          onChange={handleEmployeeChange}
                          selectedEmployee={selectedEmployee}
                          onEmployeeSelect={handleEmployeeSelect}
                          placeholder="Search and select employee..."
                          required
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: '#6d2323' }}>
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
                            <PersonIcon sx={{ color: '#6d2323', fontSize: 20 }} />
                            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 'bold',
                                  color: '#6d2323',
                                  fontSize: '14px',
                                  lineHeight: 1.2,
                                }}
                              >
                                {selectedEmployee.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: '#666',
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
                                color: '#666',
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

                  <Box sx={{ mt: 'auto', pt: 3 }}>
                    <ProfessionalButton
                      onClick={handleAdd}
                      variant="contained"
                      startIcon={<AddIcon />}
                      fullWidth
                      sx={{
                        backgroundColor: "#6d2323",
                        color: "#FEF9E1",
                        py: 1.5,
                        fontSize: '1rem',
                        "&:hover": { 
                          backgroundColor: "#8B3333",
                        },
                      }}
                    >
                      Assign Employee
                    </ProfessionalButton>
                  </Box>
                </Box>
              </GlassCard>
            </Fade>
          </Grid>

          {/* Department Records Section */}
          <Grid item xs={12} lg={6}>
            <Fade in timeout={900}>
              <GlassCard sx={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
                <Box
                  sx={{
                    p: 4,
                    background: `linear-gradient(135deg, #FEF9E1 0%, #FFF8E7 100%)`,
                    color: '#6d2323',
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <GroupIcon sx={{ fontSize: "1.8rem", mr: 2 }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Departments
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        View departments and their employees
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
                        color: '#6d2323',
                        borderColor: 'rgba(109, 35, 35, 0.5)',
                        padding: '4px 8px',
                        '&.Mui-selected': {
                          backgroundColor: 'rgba(255, 255, 255, 0.3)',
                          color: '#6d2323'
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
                  <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                    <ModernTextField
                      size="small"
                      variant="outlined"
                      placeholder="Search by Department Code"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <SearchIcon sx={{ color: "#6d2323", mr: 1 }} />
                        ),
                      }}
                    />
                    
                    <FormControl sx={{ minWidth: 150 }}>
                      <Select
                        value={departmentFilter}
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                        displayEmpty
                        size="small"
                        sx={{
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
                              '& fieldset': {
                                borderColor: '#6d2323',
                                borderWidth: '1.5px'
                              },
                            },
                            '& fieldset': {
                              borderColor: '#6d2323',
                              borderWidth: '1.5px'
                            },
                          },
                        }}
                      >
                        <MenuItem value="">All Departments</MenuItem>
                        {departmentCodes.map((code, index) => (
                          <MenuItem key={index} value={code}>
                            {code}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
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
                        background: '#6d2323',
                        borderRadius: '3px',
                      },
                    }}
                  >
                    {viewMode === 'grid' ? (
                      <Grid container spacing={2}>
                        {filteredDepartmentData.map((department) => (
                          <Grid item xs={12} sm={6} md={4} key={department.code}>
                            <Card
                              onClick={() => handleOpenDepartmentModal(department)}
                              sx={{
                                cursor: "pointer",
                                border: "1px solid rgba(109, 35, 35, 0.1)",
                                height: "100%",
                                display: 'flex',
                                flexDirection: 'column',
                                "&:hover": { 
                                  borderColor: "#6d2323",
                                  transform: 'translateY(-2px)',
                                  transition: 'all 0.2s ease',
                                  boxShadow: '0 4px 8px rgba(109, 35, 35, 0.15)'
                                },
                              }}
                            >
                              <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <DomainIcon sx={{ fontSize: 18, color: '#6d2323', mr: 0.5 }} />
                                  <Typography variant="caption" sx={{ 
                                    color: '#6d2323', 
                                    px: 0.5, 
                                    py: 0.2, 
                                    borderRadius: 0.5,
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold'
                                  }}>
                                    {department.code}
                                  </Typography>
                                </Box>
                                
                                <Typography variant="body2" fontWeight="bold" color="#333" mb={0.5}>
                                  Department
                                </Typography>
                                
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                  <PeopleIcon sx={{ fontSize: 16, color: '#666', mr: 0.5 }} />
                                  <Typography variant="body2" color="#666">
                                    {department.employees.length} Employees
                                  </Typography>
                                </Box>
                                
                                <Box sx={{ mt: 'auto' }}>
                                  <Badge 
                                    badgeContent={department.employees.length} 
                                    color="primary"
                                    sx={{
                                      '& .MuiBadge-badge': {
                                        backgroundColor: '#6d2323',
                                        color: '#FEF9E1',
                                      }
                                    }}
                                  >
                                    <Chip 
                                      label="View Employees" 
                                      size="small" 
                                      sx={{ 
                                        bgcolor: 'rgba(109,35,35,0.1)', 
                                        color: '#6d2323',
                                        fontWeight: 500,
                                        '&:hover': {
                                          bgcolor: 'rgba(109,35,35,0.2)',
                                        }
                                      }} 
                                    />
                                  </Badge>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      filteredDepartmentData.map((department) => (
                        <Card
                          key={department.code}
                          onClick={() => handleOpenDepartmentModal(department)}
                          sx={{
                            cursor: "pointer",
                            border: "1px solid rgba(109, 35, 35, 0.1)",
                            mb: 1,
                            "&:hover": { 
                              borderColor: "#6d2323",
                              backgroundColor: 'rgba(254, 249, 225, 0.3)'
                            },
                          }}
                        >
                          <Box sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <DomainIcon sx={{ fontSize: 20, color: '#6d2323', mr: 1.5 }} />
                                <Typography variant="body2" fontWeight="bold" color="#333">
                                  {department.code}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <PeopleIcon sx={{ fontSize: 16, color: '#666', mr: 0.5 }} />
                                <Typography variant="body2" color="#666" sx={{ mr: 1 }}>
                                  {department.employees.length}
                                </Typography>
                                <Chip 
                                  label="View" 
                                  size="small" 
                                  sx={{ 
                                    bgcolor: 'rgba(109,35,35,0.1)', 
                                    color: '#6d2323',
                                    fontWeight: 500,
                                    '&:hover': {
                                      bgcolor: 'rgba(109,35,35,0.2)',
                                    }
                                  }} 
                                />
                              </Box>
                            </Box>
                          </Box>
                        </Card>
                      ))
                    )}
                    
                    {filteredDepartmentData.length === 0 && (
                      <Box textAlign="center" py={4}>
                        <Typography variant="h6" color="#6d2323" fontWeight="bold" sx={{ mb: 1 }}>
                          No Departments Found
                        </Typography>
                        <Typography variant="body2" color="#666" sx={{ mt: 0.5 }}>
                          Try adjusting your search criteria or department filter
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </GlassCard>
            </Fade>
          </Grid>
        </Grid>

        {/* Department Employees Modal */}
        <Modal
          open={departmentModalOpen}
          onClose={handleCloseDepartmentModal}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <GlassCard
            sx={{
              width: "90%",
              maxWidth: "800px",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              borderRadius: 2,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
              overflow: 'hidden',
            }}
          >
            {selectedDepartment && (
              <>
                {/* Modal Header */}
                <Box
                  sx={{
                    p: 4,
                    background: `linear-gradient(135deg, #FEF9E1 0%, #FFF8E7 100%)`,
                    color: '#6d2323',
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <DomainIcon sx={{ fontSize: "1.8rem", mr: 2 }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {selectedDepartment.code} Department
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        {selectedDepartment.employees.length} Employees
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton onClick={handleCloseDepartmentModal} sx={{ color: '#6d2323' }}>
                    <Close />
                  </IconButton>
                </Box>

                {/* Modal Content */}
                <Box sx={{ 
                  p: 4, 
                  flexGrow: 1, 
                  overflowY: 'auto',
                  maxHeight: 'calc(90vh - 140px)', // Account for header and sticky footer
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: '#f1f1f1',
                    borderRadius: '3px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#6d2323',
                    borderRadius: '3px',
                  },
                }}>
                  {viewMode === 'grid' ? (
                    <Grid container spacing={2}>
                      {selectedDepartment.employees.map((employee) => (
                        <Grid item xs={12} sm={6} md={4} key={employee.id}>
                          <Card
                            sx={{
                              border: "1px solid rgba(109, 35, 35, 0.1)",
                              height: "100%",
                              display: 'flex',
                              flexDirection: 'column',
                              "&:hover": { 
                                borderColor: "#6d2323",
                                transform: 'translateY(-2px)',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 4px 8px rgba(109, 35, 35, 0.15)'
                              },
                            }}
                          >
                            <CardContent sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <PersonIcon sx={{ fontSize: 18, color: '#6d2323', mr: 0.5 }} />
                                <Typography variant="caption" sx={{ 
                                  color: '#6d2323', 
                                  px: 0.5, 
                                  py: 0.2, 
                                  borderRadius: 0.5,
                                  fontSize: '0.7rem',
                                  fontWeight: 'bold'
                                }}>
                                  ID: {employee.employeeNumber}
                                </Typography>
                              </Box>
                              
                              <Typography variant="body2" fontWeight="bold" color="#333" mb={0.5} noWrap>
                                {employee.name || 'No Name'}
                              </Typography>
                              
                              <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between' }}>
                                <Chip 
                                  label={employee.code} 
                                  size="small" 
                                  sx={{ 
                                    bgcolor: 'rgba(109,35,35,0.1)', 
                                    color: '#6d2323',
                                    fontWeight: 500,
                                  }} 
                                />
                                <Box>
                                  <IconButton 
                                    size="small" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenModal(employee, true); // Direct edit mode
                                    }}
                                    sx={{ color: '#6d2323' }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton 
                                    size="small" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(employee.id);
                                    }}
                                    sx={{ color: '#d32f2f' }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <List sx={{ p: 0 }}>
                      {selectedDepartment.employees.map((employee) => (
                        <Card
                          key={employee.id}
                          sx={{
                            border: "1px solid rgba(109, 35, 35, 0.1)",
                            mb: 1,
                            "&:hover": { 
                              borderColor: "#6d2323",
                              backgroundColor: 'rgba(254, 249, 225, 0.3)'
                            },
                          }}
                        >
                          <Box sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <PersonIcon sx={{ fontSize: 20, color: '#6d2323', mr: 1.5 }} />
                                <Box>
                                  <Typography variant="body2" fontWeight="bold" color="#333">
                                    {employee.name || 'No Name'}
                                  </Typography>
                                  <Typography variant="caption" color="#666" sx={{ mt: 0.2 }}>
                                    ID: {employee.employeeNumber} • {employee.code}
                                  </Typography>
                                </Box>
                              </Box>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <IconButton 
                                  size="small" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenModal(employee, true); // Direct edit mode
                                  }}
                                  sx={{ color: '#6d2323', mr: 0.5 }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton 
                                  size="small" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(employee.id);
                                  }}
                                  sx={{ color: '#d32f2f' }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </Box>
                          </Box>
                        </Card>
                      ))}
                    </List>
                  )}
                  
                  {selectedDepartment.employees.length === 0 && (
                    <Box textAlign="center" py={4}>
                      <Typography variant="h6" color="#6d2323" fontWeight="bold" sx={{ mb: 1 }}>
                        No Employees Found
                      </Typography>
                      <Typography variant="body2" color="#666" sx={{ mt: 0.5 }}>
                        This department has no assigned employees yet
                      </Typography>
                    </Box>
                  )}
                </Box>
              </>
            )}
          </GlassCard>
        </Modal>

        {/* Edit Assignment Modal */}
        <Modal
          open={modalOpen}
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
              display: "flex",
              flexDirection: "column",
              borderRadius: 2,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
              overflow: 'hidden',
            }}
          >
            {editAssignment && (
              <>
                {/* Modal Header */}
                <Box
                  sx={{
                    p: 4,
                    background: `linear-gradient(135deg, #FEF9E1 0%, #FFF8E7 100%)`,
                    color: '#6d2323',
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {isEditing ? "Edit Department Assignment" : "Assignment Details"}
                  </Typography>
                  <IconButton onClick={handleCloseModal} sx={{ color: '#6d2323' }}>
                    <Close />
                  </IconButton>
                </Box>

                {/* Modal Content with Scroll */}
                <Box sx={{ 
                  p: 4, 
                  flexGrow: 1, 
                  overflowY: 'auto',
                  maxHeight: 'calc(90vh - 140px)', // Account for header and sticky footer
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: '#f1f1f1',
                    borderRadius: '3px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#6d2323',
                    borderRadius: '3px',
                  },
                }}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, color: '#6d2323', display: 'flex', alignItems: 'center' }}>
                      <PersonIcon sx={{ mr: 2, fontSize: 24 }} />
                      Assignment Information
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: '#6d2323' }}>
                          Department Code
                        </Typography>
                        {isEditing ? (
                          <FormControl fullWidth>
                            <Select
                              value={editAssignment.code || ''}
                              onChange={(e) => handleChange('code', e.target.value, true)}
                              size="small"
                              sx={{
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
                                    '& fieldset': {
                                      borderColor: '#6d2323',
                                      borderWidth: '1.5px'
                                    },
                                  },
                                  '& fieldset': {
                                    borderColor: '#6d2323',
                                    borderWidth: '1.5px'
                                  },
                                },
                              }}
                            >
                              <MenuItem value="">Select Department</MenuItem>
                              {departmentCodes.map((code, index) => (
                                <MenuItem key={index} value={code}>
                                  {code}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        ) : (
                          <Typography variant="body2" sx={{ p: 1.5, bgcolor: 'rgba(254, 249, 225, 0.5)', borderRadius: 1 }}>
                            {editAssignment.code || 'N/A'}
                          </Typography>
                        )}
                      </Grid>

                      <Grid item xs={12}>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: '#6d2323' }}>
                          Search Employee
                        </Typography>
                        {isEditing ? (
                          <EmployeeAutocomplete
                            value={editAssignment?.employeeNumber || ''}
                            onChange={handleEditEmployeeChange}
                            selectedEmployee={selectedEditEmployee}
                            onEmployeeSelect={handleEditEmployeeSelect}
                            placeholder="Search and select employee..."
                            dropdownDisabled={!isEditing}
                          />
                        ) : (
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
                            <PersonIcon sx={{ color: '#6d2323', fontSize: 20 }} />
                            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 'bold',
                                  color: '#6d2323',
                                  fontSize: '14px',
                                  lineHeight: 1.2,
                                }}
                              >
                                {selectedEditEmployee?.name || 'Unknown'}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: '#666',
                                  fontSize: '12px',
                                  lineHeight: 1.2,
                                }}
                              >
                                ID: {editAssignment?.employeeNumber || 'N/A'}
                              </Typography>
                            </Box>
                          </Box>
                        )}
                      </Grid>
                    </Grid>
                  </Box>
                </Box>

                {/* Sticky Action Buttons */}
                <Box
                  sx={{
                    backgroundColor: "#ffffff",
                    borderTop: "1px solid #e0e0e0",
                    p: 2,
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 2,
                    position: 'sticky',
                    bottom: 0,
                    zIndex: 10,
                    boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  {!isEditing ? (
                    <>
                      <ProfessionalButton
                        onClick={() => handleDelete(editAssignment.id)}
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
                          backgroundColor: "#6d2323", 
                          color: "#FEF9E1",
                          "&:hover": { backgroundColor: "#8B3333" }
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
                          color: "#666",
                          borderColor: "#666",
                          "&:hover": {
                            backgroundColor: "#f5f5f5"
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
                          backgroundColor: hasChanges() ? "#6d2323" : "#ccc", 
                          color: "#FEF9E1",
                          "&:hover": { 
                            backgroundColor: hasChanges() ? "#8B3333" : "#ccc"
                          },
                          "&:disabled": {
                            backgroundColor: "#ccc",
                            color: "#999"
                          }
                        }}
                      >
                        Save
                      </ProfessionalButton>
                    </>
                  )}
                </Box>
              </>
            )}
          </GlassCard>
        </Modal>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{
            '& .MuiSnackbar-root': {
              zIndex: 9999,
            }
          }}
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

export default DepartmentAssignment;