import API_BASE_URL from '../../apiConfig';
import React, { useEffect, useState, useRef } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import axios from 'axios';
import {
  Button,
  Box,
  TextField,
  Container,
  Grid,
  Typography,
  Chip,
  Modal,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper,
  CircularProgress,
  FormHelperText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Close,
  Person as PersonIcon,
  Search as SearchIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  Reorder,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  FactCheck as FactCheckIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CreditCard,
  Home,
  FamilyRestroom,
  School,
} from '@mui/icons-material';
import LoadingOverlay from '../LoadingOverlay';
import SuccessfullOverlay from '../SuccessfulOverlay';
import AccessDenied from '../AccessDenied';
import { useNavigate } from 'react-router-dom';

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
        )}`
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
        `${API_BASE_URL}/Remittance/employees/search`
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
        `${API_BASE_URL}/Remittance/employees/${employeeNumber}`
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
      <TextField
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
        sx={{
          '& .MuiOutlinedInput-root': {
            height: '40px',
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

const PersonTable = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successAction, setSuccessAction] = useState('');
  const [errors, setErrors] = useState({});
  const [stepErrors, setStepErrors] = useState({});
  const [viewMode, setViewMode] = useState('grid');
  const [activeStep, setActiveStep] = useState(0);

  //ACCESSING
  // Page access control states
  const [hasAccess, setHasAccess] = useState(null);
  const navigate = useNavigate();
  // Page access control - Add this useEffect
  useEffect(() => {
    const userId = localStorage.getItem('employeeNumber');
    // Change this pageId to match the ID you assign to this page in your page management
    const pageId = 2; // You'll need to set this to the appropriate page ID for ViewAttendanceRecord
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
  // ACCESSING END

  // Stepper state
  const [newPerson, setNewPerson] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    nameExtension: '',
    birthDate: '',
    placeOfBirth: '',
    sex: '',
    civilStatus: '',
    citizenship: '',
    heightCm: '',
    weightKg: '',
    bloodType: '',
    gsisNum: '',
    pagibigNum: '',
    philhealthNum: '',
    sssNum: '',
    tinNum: '',
    agencyEmployeeNum: '',
    permanent_houseBlockLotNum: '',
    permanent_streetName: '',
    permanent_subdivisionOrVillage: '',
    permanent_barangayName: '',
    permanent_cityOrMunicipality: '',
    permanent_provinceName: '',
    permanent_zipcode: '',
    residential_houseBlockLotNum: '',
    residential_streetName: '',
    residential_subdivisionOrVillage: '',
    residential_barangayName: '',
    residential_cityOrMunicipality: '',
    residential_provinceName: '',
    residential_zipcode: '',
    telephone: '',
    mobileNum: '',
    emailAddress: '',
    spouseFirstName: '',
    spouseMiddleName: '',
    spouseLastName: '',
    spouseNameExtension: '',
    spouseOccupation: '',
    spouseEmployerBusinessName: '',
    spouseBusinessAddress: '',
    spouseTelephone: '',
    fatherFirstName: '',
    fatherMiddleName: '',
    fatherLastName: '',
    fatherNameExtension: '',
    motherMaidenFirstName: '',
    motherMaidenMiddleName: '',
    motherMaidenLastName: '',
    elementaryNameOfSchool: '',
    elementaryDegree: '',
    elementaryPeriodFrom: '',
    elementaryPeriodTo: '',
    elementaryHighestAttained: '',
    elementaryYearGraduated: '',
    elementaryScholarshipAcademicHonorsReceived: '',
    secondaryNameOfSchool: '',
    secondaryDegree: '',
    secondaryPeriodFrom: '',
    secondaryPeriodTo: '',
    secondaryHighestAttained: '',
    secondaryYearGraduated: '',
    secondaryScholarshipAcademicHonorsReceived: '',
  });

  // Modal state for viewing/editing
  const [editPerson, setEditPerson] = useState(null);
  const [originalPerson, setOriginalPerson] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

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

  useEffect(() => {
    fetchPersons();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    const filtered = data.filter(
      (person) =>
        person.firstName?.toLowerCase().includes(query) ||
        person.lastName?.toLowerCase().includes(query) ||
        person.agencyEmployeeNum?.toLowerCase().includes(query)
    );
    setFilteredData(filtered);
  }, [searchQuery, data]);

  const fetchPersons = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/personalinfo/person_table`
      );
      setData(response.data);
      setFilteredData(response.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      'firstName',
      'lastName',
      'birthDate',
      'sex',
      'civilStatus',
      'citizenship',
    ];

    requiredFields.forEach((field) => {
      if (!newPerson[field] || newPerson[field].trim() === '') {
        newErrors[field] = 'This field is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCurrentStep = () => {
    const currentStepFields = steps[activeStep].fields;
    const requiredFields = [
      'firstName',
      'lastName',
      'birthDate',
      'sex',
      'civilStatus',
      'citizenship',
      'agencyEmployeeNum',
    ];
    const stepRequiredFields = currentStepFields.filter((field) =>
      requiredFields.includes(field)
    );

    const newErrors = {};
    let hasError = false;

    stepRequiredFields.forEach((field) => {
      if (!newPerson[field] || newPerson[field].trim() === '') {
        newErrors[field] = 'This field is required';
        hasError = true;
      }
    });

    if (hasError) {
      setErrors(newErrors);
      setStepErrors({ [activeStep]: true });
      showSnackbar(
        'Please fill in all required fields before proceeding',
        'error'
      );
      return false;
    }

    setStepErrors((prev) => {
      const newStepErrors = { ...prev };
      delete newStepErrors[activeStep];
      return newStepErrors;
    });

    return true;
  };

  const handleAdd = async () => {
    if (!validateForm()) {
      showSnackbar('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/personalinfo/person_table`, newPerson);
      setNewPerson(
        Object.fromEntries(Object.keys(newPerson).map((k) => [k, '']))
      );
      setActiveStep(0);
      setErrors({});
      setStepErrors({});
      setSelectedEmployee(null);
      setTimeout(() => {
        setLoading(false);
        setSuccessAction('adding');
        setSuccessOpen(true);
        setTimeout(() => setSuccessOpen(false), 2000);
      }, 300);
      fetchPersons();
    } catch (error) {
      console.error('Error adding person:', error);
      setLoading(false);
      showSnackbar(
        'Failed to add Personal Information. Employee Number needs to be setup. Please try again.',
        'error'
      );
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `${API_BASE_URL}/personalinfo/person_table/${editPerson.id}`,
        editPerson
      );
      setEditPerson(null);
      setOriginalPerson(null);
      setSelectedEditEmployee(null);
      setIsEditing(false);
      fetchPersons();
      setSuccessAction('edit');
      setSuccessOpen(true);
      setTimeout(() => setSuccessOpen(false), 2000);
    } catch (error) {
      console.error('Error updating person:', error);
      showSnackbar('Failed to update person. Please try again.', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/personalinfo/person_table/${id}`);
      setEditPerson(null);
      setOriginalPerson(null);
      setSelectedEditEmployee(null);
      setIsEditing(false);
      fetchPersons();
      setSuccessAction('delete');
      setSuccessOpen(true);
      setTimeout(() => setSuccessOpen(false), 2000);
    } catch (error) {
      console.error('Error deleting person:', error);
      showSnackbar('Failed to delete person. Please try again.', 'error');
    }
  };

  const handleChange = (field, value, isEdit = false) => {
    if (isEdit) {
      setEditPerson({ ...editPerson, [field]: value });
    } else {
      setNewPerson({ ...newPerson, [field]: value });
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
      if (stepErrors[activeStep]) {
        setStepErrors((prev) => {
          const newStepErrors = { ...prev };
          delete newStepErrors[activeStep];
          return newStepErrors;
        });
      }
    }
  };

  const handleEmployeeChange = (employeeNumber) => {
    setNewPerson({ ...newPerson, agencyEmployeeNum: employeeNumber });
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.agencyEmployeeNum;
      return newErrors;
    });
  };

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
  };

  const handleEditEmployeeChange = (employeeNumber) => {
    setEditPerson({ ...editPerson, agencyEmployeeNum: employeeNumber });
  };

  const handleEditEmployeeSelect = (employee) => {
    setSelectedEditEmployee(employee);
  };

  const handleOpenModal = (person) => {
    setEditPerson({ ...person });
    setOriginalPerson({ ...person });
    setSelectedEditEmployee({
      name: `${person.firstName} ${person.lastName}`,
      employeeNumber: person.agencyEmployeeNum,
    });
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditPerson({ ...originalPerson });
    setSelectedEditEmployee({
      name: `${originalPerson.firstName} ${originalPerson.lastName}`,
      employeeNumber: originalPerson.agencyEmployeeNum,
    });
    setIsEditing(false);
  };

  const handleCloseModal = () => {
    setEditPerson(null);
    setOriginalPerson(null);
    setSelectedEditEmployee(null);
    setIsEditing(false);
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return;
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const hasChanges = () => {
    if (!editPerson || !originalPerson) return false;

    return (
      editPerson.firstName !== originalPerson.firstName ||
      editPerson.middleName !== originalPerson.middleName ||
      editPerson.lastName !== originalPerson.lastName ||
      editPerson.nameExtension !== originalPerson.nameExtension ||
      editPerson.birthDate !== originalPerson.birthDate ||
      editPerson.placeOfBirth !== originalPerson.placeOfBirth ||
      editPerson.sex !== originalPerson.sex ||
      editPerson.civilStatus !== originalPerson.civilStatus ||
      editPerson.citizenship !== originalPerson.citizenship ||
      editPerson.heightCm !== originalPerson.heightCm ||
      editPerson.weightKg !== originalPerson.weightKg ||
      editPerson.bloodType !== originalPerson.bloodType ||
      editPerson.gsisNum !== originalPerson.gsisNum ||
      editPerson.pagibigNum !== originalPerson.pagibigNum ||
      editPerson.philhealthNum !== originalPerson.philhealthNum ||
      editPerson.sssNum !== originalPerson.sssNum ||
      editPerson.tinNum !== originalPerson.tinNum ||
      editPerson.agencyEmployeeNum !== originalPerson.agencyEmployeeNum ||
      editPerson.permanent_houseBlockLotNum !==
        originalPerson.permanent_houseBlockLotNum ||
      editPerson.permanent_streetName !== originalPerson.permanent_streetName ||
      editPerson.permanent_subdivisionOrVillage !==
        originalPerson.permanent_subdivisionOrVillage ||
      editPerson.permanent_barangayName !==
        originalPerson.permanent_barangayName ||
      editPerson.permanent_cityOrMunicipality !==
        originalPerson.permanent_cityOrMunicipality ||
      editPerson.permanent_provinceName !==
        originalPerson.permanent_provinceName ||
      editPerson.permanent_zipcode !== originalPerson.permanent_zipcode ||
      editPerson.residential_houseBlockLotNum !==
        originalPerson.residential_houseBlockLotNum ||
      editPerson.residential_streetName !==
        originalPerson.residential_streetName ||
      editPerson.residential_subdivisionOrVillage !==
        originalPerson.residential_subdivisionOrVillage ||
      editPerson.residential_barangayName !==
        originalPerson.residential_barangayName ||
      editPerson.residential_cityOrMunicipality !==
        originalPerson.residential_cityOrMunicipality ||
      editPerson.residential_provinceName !==
        originalPerson.residential_provinceName ||
      editPerson.residential_zipcode !== originalPerson.residential_zipcode ||
      editPerson.telephone !== originalPerson.telephone ||
      editPerson.mobileNum !== originalPerson.mobileNum ||
      editPerson.emailAddress !== originalPerson.emailAddress ||
      editPerson.spouseFirstName !== originalPerson.spouseFirstName ||
      editPerson.spouseMiddleName !== originalPerson.spouseMiddleName ||
      editPerson.spouseLastName !== originalPerson.spouseLastName ||
      editPerson.spouseNameExtension !== originalPerson.spouseNameExtension ||
      editPerson.spouseOccupation !== originalPerson.spouseOccupation ||
      editPerson.spouseEmployerBusinessName !==
        originalPerson.spouseEmployerBusinessName ||
      editPerson.spouseBusinessAddress !==
        originalPerson.spouseBusinessAddress ||
      editPerson.spouseTelephone !== originalPerson.spouseTelephone ||
      editPerson.fatherFirstName !== originalPerson.fatherFirstName ||
      editPerson.fatherMiddleName !== originalPerson.fatherMiddleName ||
      editPerson.fatherLastName !== originalPerson.fatherLastName ||
      editPerson.fatherNameExtension !== originalPerson.fatherNameExtension ||
      editPerson.motherMaidenFirstName !==
        originalPerson.motherMaidenFirstName ||
      editPerson.motherMaidenMiddleName !==
        originalPerson.motherMaidenMiddleName ||
      editPerson.motherMaidenLastName !== originalPerson.motherMaidenLastName ||
      editPerson.elementaryNameOfSchool !==
        originalPerson.elementaryNameOfSchool ||
      editPerson.elementaryDegree !== originalPerson.elementaryDegree ||
      editPerson.elementaryPeriodFrom !== originalPerson.elementaryPeriodFrom ||
      editPerson.elementaryPeriodTo !== originalPerson.elementaryPeriodTo ||
      editPerson.elementaryHighestAttained !==
        originalPerson.elementaryHighestAttained ||
      editPerson.elementaryYearGraduated !==
        originalPerson.elementaryYearGraduated ||
      editPerson.elementaryScholarshipAcademicHonorsReceived !==
        originalPerson.elementaryScholarshipAcademicHonorsReceived ||
      editPerson.secondaryNameOfSchool !==
        originalPerson.secondaryNameOfSchool ||
      editPerson.secondaryDegree !== originalPerson.secondaryDegree ||
      editPerson.secondaryPeriodFrom !== originalPerson.secondaryPeriodFrom ||
      editPerson.secondaryPeriodTo !== originalPerson.secondaryPeriodTo ||
      editPerson.secondaryHighestAttained !==
        originalPerson.secondaryHighestAttained ||
      editPerson.secondaryYearGraduated !==
        originalPerson.secondaryYearGraduated ||
      editPerson.secondaryScholarshipAcademicHonorsReceived !==
        originalPerson.secondaryScholarshipAcademicHonorsReceived
    );
  };

  const steps = [
    {
      label: 'Personal Information',
      subtitle: 'Basic details about yourself',
      fields: [
        'firstName',
        'middleName',
        'lastName',
        'nameExtension',
        'birthDate',
        'placeOfBirth',
        'sex',
        'civilStatus',
        'citizenship',
        'heightCm',
        'weightKg',
        'bloodType',
        'mobileNum',
        'telephone',
        'emailAddress',
      ],
    },
    {
      label: 'Government ID Information',
      subtitle: 'Your government identification numbers',
      fields: [
        'gsisNum',
        'pagibigNum',
        'philhealthNum',
        'sssNum',
        'tinNum',
        'agencyEmployeeNum',
      ],
      disabledFields: ['agencyEmployeeNum'],
    },
    {
      label: 'Address Information',
      subtitle: 'Your permanent and residential addresses',
      fields: [
        'permanent_houseBlockLotNum',
        'permanent_streetName',
        'permanent_subdivisionOrVillage',
        'permanent_barangayName',
        'permanent_cityOrMunicipality',
        'permanent_provinceName',
        'permanent_zipcode',
        'residential_houseBlockLotNum',
        'residential_streetName',
        'residential_subdivisionOrVillage',
        'residential_barangayName',
        'residential_cityOrMunicipality',
        'residential_provinceName',
        'residential_zipcode',
      ],
    },
    {
      label: 'Spouse Information',
      subtitle: 'Information about your spouse',
      fields: [
        'spouseFirstName',
        'spouseMiddleName',
        'spouseLastName',
        'spouseNameExtension',
        'spouseOccupation',
        'spouseEmployerBusinessName',
        'spouseBusinessAddress',
        'spouseTelephone',
      ],
    },
    {
      label: "Parents' Information",
      subtitle: 'Information about your parents',
      fields: [
        'fatherFirstName',
        'fatherMiddleName',
        'fatherLastName',
        'fatherNameExtension',
        'motherMaidenFirstName',
        'motherMaidenMiddleName',
        'motherMaidenLastName',
      ],
    },
    {
      label: 'Educational Background',
      subtitle: 'Your elementary and secondary education',
      fields: [
        'elementaryNameOfSchool',
        'elementaryDegree',
        'elementaryPeriodFrom',
        'elementaryPeriodTo',
        'elementaryHighestAttained',
        'elementaryYearGraduated',
        'elementaryScholarshipAcademicHonorsReceived',
        'secondaryNameOfSchool',
        'secondaryDegree',
        'secondaryPeriodFrom',
        'secondaryPeriodTo',
        'secondaryHighestAttained',
        'secondaryYearGraduated',
        'secondaryScholarshipAcademicHonorsReceived',
      ],
    },
  ];

  const renderStepContent = (step) => (
    <Grid container spacing={3} sx={{ mt: 1 }}>
      {step.fields.map((field) => {
        const requiredFields = [
          'firstName',
          'lastName',
          'birthDate',
          'sex',
          'civilStatus',
          'citizenship',
          'agencyEmployeeNum',
        ];
        const isRequired = requiredFields.includes(field);
        const hasError = errors[field];

        // Field label mapping for user-friendly display
        const fieldLabels = {
          firstName: 'First Name',
          middleName: 'Middle Name',
          lastName: 'Last Name',
          nameExtension: 'Name Extension (Jr., Sr., etc.)',
          birthDate: 'Date of Birth',
          placeOfBirth: 'Place of Birth',
          sex: 'Sex',
          civilStatus: 'Civil Status',
          citizenship: 'Citizenship',
          heightCm: 'Height (cm)',
          weightKg: 'Weight (kg)',
          bloodType: 'Blood Type',
          gsisNum: 'GSIS Number',
          pagibigNum: 'Pag-IBIG Number',
          philhealthNum: 'PhilHealth Number',
          sssNum: 'SSS Number',
          tinNum: 'TIN Number',
          agencyEmployeeNum: 'Employee Number',
          permanent_houseBlockLotNum: 'Permanent Address - House/Block/Lot No.',
          permanent_streetName: 'Permanent Address - Street Name',
          permanent_subdivisionOrVillage:
            'Permanent Address - Subdivision/Village',
          permanent_barangayName: 'Permanent Address - Barangay',
          permanent_cityOrMunicipality: 'Permanent Address - City/Municipality',
          permanent_provinceName: 'Permanent Address - Province',
          permanent_zipcode: 'Permanent Address - Zip Code',
          residential_houseBlockLotNum:
            'Residential Address - House/Block/Lot No.',
          residential_streetName: 'Residential Address - Street Name',
          residential_subdivisionOrVillage:
            'Residential Address - Subdivision/Village',
          residential_barangayName: 'Residential Address - Barangay',
          residential_cityOrMunicipality:
            'Residential Address - City/Municipality',
          residential_provinceName: 'Residential Address - Province',
          residential_zipcode: 'Residential Address - Zip Code',
          telephone: 'Telephone Number',
          mobileNum: 'Mobile Number',
          emailAddress: 'Email Address',
          spouseFirstName: "Spouse's First Name",
          spouseMiddleName: "Spouse's Middle Name",
          spouseLastName: "Spouse's Last Name",
          spouseNameExtension: "Spouse's Name Extension",
          spouseOccupation: "Spouse's Occupation",
          spouseEmployerBusinessName: "Spouse's Employer/Business Name",
          spouseBusinessAddress: "Spouse's Business Address",
          spouseTelephone: "Spouse's Telephone",
          fatherFirstName: "Father's First Name",
          fatherMiddleName: "Father's Middle Name",
          fatherLastName: "Father's Last Name",
          fatherNameExtension: "Father's Name Extension",
          motherMaidenFirstName: "Mother's Maiden First Name",
          motherMaidenMiddleName: "Mother's Maiden Middle Name",
          motherMaidenLastName: "Mother's Maiden Last Name",
          elementaryNameOfSchool: 'Elementary School Name',
          elementaryDegree: 'Elementary Degree',
          elementaryPeriodFrom: 'Elementary Period From',
          elementaryPeriodTo: 'Elementary Period To',
          elementaryHighestAttained: 'Elementary Highest Attained',
          elementaryYearGraduated: 'Elementary Year Graduated',
          elementaryScholarshipAcademicHonorsReceived:
            'Elementary Scholarship/Academic Honors',
          secondaryNameOfSchool: 'Secondary School Name',
          secondaryDegree: 'Secondary Degree',
          secondaryPeriodFrom: 'Secondary Period From',
          secondaryPeriodTo: 'Secondary Period To',
          secondaryHighestAttained: 'Secondary Highest Attained',
          secondaryYearGraduated: 'Secondary Year Graduated',
          secondaryScholarshipAcademicHonorsReceived:
            'Secondary Scholarship/Academic Honors',
        };

        // Render dropdown for specific fields
        if (field === 'sex') {
          return (
            <Grid item xs={12} sm={6} key={field}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 'bold', mb: 1 }}
              >
                {fieldLabels[field]}
                {isRequired && <span style={{ color: 'red' }}> *</span>}
              </Typography>
              <FormControl fullWidth error={!!hasError}>
                <Select
                  value={newPerson[field]}
                  onChange={(e) => handleChange(field, e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: hasError ? 'red' : '#6D2323',
                      },
                      '&:hover fieldset': {
                        borderColor: hasError ? 'red' : '#6D2323',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: hasError ? 'red' : '#6D2323',
                      },
                    },
                  }}
                >
                  <MenuItem value="">Select Sex</MenuItem>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
                {hasError && <FormHelperText>{hasError}</FormHelperText>}
              </FormControl>
            </Grid>
          );
        }

        if (field === 'civilStatus') {
          return (
            <Grid item xs={12} sm={6} key={field}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 'bold', mb: 1 }}
              >
                {fieldLabels[field]}
                {isRequired && <span style={{ color: 'red' }}> *</span>}
              </Typography>
              <FormControl fullWidth error={!!hasError}>
                <Select
                  value={newPerson[field]}
                  onChange={(e) => handleChange(field, e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: hasError ? 'red' : '#6D2323',
                      },
                      '&:hover fieldset': {
                        borderColor: hasError ? 'red' : '#6D2323',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: hasError ? 'red' : '#6D2323',
                      },
                    },
                  }}
                >
                  <MenuItem value="">Select Civil Status</MenuItem>
                  <MenuItem value="Single">Single</MenuItem>
                  <MenuItem value="Married">Married</MenuItem>
                  <MenuItem value="Widowed">Widowed</MenuItem>
                  <MenuItem value="Separated">Separated</MenuItem>
                  <MenuItem value="Divorced">Divorced</MenuItem>
                </Select>
                {hasError && <FormHelperText>{hasError}</FormHelperText>}
              </FormControl>
            </Grid>
          );
        }

        if (field === 'bloodType') {
          return (
            <Grid item xs={12} sm={6} key={field}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 'bold', mb: 1 }}
              >
                {fieldLabels[field]}
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={newPerson[field]}
                  onChange={(e) => handleChange(field, e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#6D2323',
                      },
                      '&:hover fieldset': {
                        borderColor: '#6D2323',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#6D2323',
                      },
                    },
                  }}
                >
                  <MenuItem value="">Select Blood Type</MenuItem>
                  <MenuItem value="A+">A+</MenuItem>
                  <MenuItem value="A-">A-</MenuItem>
                  <MenuItem value="B+">B+</MenuItem>
                  <MenuItem value="B-">B-</MenuItem>
                  <MenuItem value="AB+">AB+</MenuItem>
                  <MenuItem value="AB-">AB-</MenuItem>
                  <MenuItem value="O+">O+</MenuItem>
                  <MenuItem value="O-">O-</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          );
        }

        // Special handling for agencyEmployeeNum field
        if (field === 'agencyEmployeeNum') {
          return (
            <Grid item xs={12} sm={6} key={field}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 'bold', mb: 1 }}
              >
                {fieldLabels[field]}
                {isRequired && <span style={{ color: 'red' }}> *</span>}
              </Typography>
              <EmployeeAutocomplete
                value={newPerson[field]}
                onChange={handleEmployeeChange}
                selectedEmployee={selectedEmployee}
                onEmployeeSelect={handleEmployeeSelect}
                placeholder="Search and select employee..."
                required
                error={!!hasError}
                helperText={hasError || ''}
              />
            </Grid>
          );
        }

        // Default text field for other fields
        return (
          <Grid item xs={12} sm={6} key={field}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              {fieldLabels[field]}
              {isRequired && <span style={{ color: 'red' }}> *</span>}
            </Typography>
            <TextField
              value={newPerson[field]}
              onChange={(e) => handleChange(field, e.target.value)}
              fullWidth
              type={
                field.includes('Date') ||
                field.includes('From') ||
                field.includes('To') ||
                field.includes('Graduated')
                  ? 'date'
                  : 'text'
              }
              error={!!hasError}
              helperText={hasError || ''}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: hasError ? 'red' : '#6D2323',
                  },
                  '&:hover fieldset': {
                    borderColor: hasError ? 'red' : '#6D2323',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: hasError ? 'red' : '#6D2323',
                  },
                },
              }}
            />
          </Grid>
        );
      })}
    </Grid>
  );

  // ACCESSING 2
  // Loading state
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
          <CircularProgress sx={{ color: '#6d2323', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#6d2323' }}>
            Loading access information...
          </Typography>
        </Box>
      </Container>
    );
  }
  // Access denied state - Now using the reusable component
  if (!hasAccess) {
    return (
      <AccessDenied
        title="Access Denied"
        message="You do not have permission to access View Attendance Records. Contact your administrator to request access."
        returnPath="/admin-home"
        returnButtonText="Return to Home"
      />
    );
  }
  //ACCESSING END2

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        pt: 2,
        mt: -5,
      }}
    >
      {/* Loading Overlay */}
      <LoadingOverlay open={loading} message="Adding person record..." />

      {/* Success Overlay */}
      <SuccessfullOverlay open={successOpen} action={successAction} />

      <Box sx={{ textAlign: 'center', mb: 3, px: 2 }}>
        <Typography
          variant="h4"
          sx={{ color: '#6D2323', fontWeight: 'bold', mb: 0.5 }}
        >
          Personal Information Management
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          Add and manage personal information records
        </Typography>
      </Box>

      <Container
        maxWidth="xl"
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
      >
        <Grid container spacing={3} sx={{ flexGrow: 1 }}>
          <Grid
            item
            xs={12}
            lg={6}
            sx={{ display: 'flex', flexDirection: 'column' }}
          >
            <Paper
              elevation={4}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(109, 35, 35, 0.1)',
                height: { xs: 'auto', lg: 'calc(100vh - 200px)' },
                maxHeight: { xs: 'none', lg: 'calc(100vh - 200px)' },
              }}
            >
              <Box
                sx={{
                  backgroundColor: '#6D2323',
                  color: '#ffffff',
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                }}
              >
                <PersonIcon sx={{ fontSize: '1.8rem', mr: 2 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    Add New Personal Information
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    Fill in the personal information details
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  p: 3,
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  overflowY: 'auto',
                }}
              >
                <Stepper activeStep={activeStep} orientation="vertical">
                  {steps.map((step, index) => (
                    <Step key={step.label}>
                      <StepLabel
                        error={stepErrors[index]}
                        sx={{
                          '& .MuiStepLabel-iconContainer': {
                            color: stepErrors[index] ? 'red' : undefined,
                          },
                        }}
                      >
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {step.label}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          {step.subtitle}
                        </Typography>
                      </StepLabel>
                      <StepContent>
                        {renderStepContent(step)}
                        <Box sx={{ mb: 2, mt: 3 }}>
                          <div>
                            {index === steps.length - 1 ? (
                              <Button
                                variant="contained"
                                onClick={handleAdd}
                                startIcon={<AddIcon />}
                                sx={{
                                  mr: 1,
                                  backgroundColor: '#6D2323',
                                  color: '#FEF9E1',
                                  '&:hover': { backgroundColor: '#a31d1d' },
                                  width: '80%',
                                }}
                              >
                                Add Person
                              </Button>
                            ) : (
                              <Button
                                variant="contained"
                                onClick={handleNext}
                                sx={{
                                  mr: 1,
                                  backgroundColor: '#6D2323',
                                  color: '#FEF9E1',
                                  '&:hover': { backgroundColor: '#a31d1d' },
                                }}
                                endIcon={<NextIcon />}
                              >
                                Next
                              </Button>
                            )}
                            <Button
                              disabled={index === 0}
                              onClick={handleBack}
                              sx={{
                                mr: 1,
                                border: '1px solid #6d2323',
                                color: '#6d2323',
                              }}
                              startIcon={<PrevIcon />}
                            >
                              Back
                            </Button>
                          </div>
                        </Box>
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>
              </Box>
            </Paper>
          </Grid>

          <Grid
            item
            xs={12}
            lg={6}
            sx={{ display: 'flex', flexDirection: 'column' }}
          >
            <Paper
              elevation={4}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(109, 35, 35, 0.1)',
                height: { xs: 'auto', lg: 'calc(100vh - 200px)' },
                maxHeight: { xs: 'none', lg: 'calc(100vh - 200px)' },
              }}
            >
              <Box
                sx={{
                  backgroundColor: '#6D2323',
                  color: '#ffffff',
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Reorder sx={{ fontSize: '1.8rem', mr: 2 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Personal Information Records
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
                      color: 'white',
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      padding: '4px 8px',
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                        color: 'white',
                      },
                    },
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

              <Box
                sx={{
                  p: 3,
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ mb: 2 }}>
                  <TextField
                    size="small"
                    variant="outlined"
                    placeholder="Search by Employee Number or Name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#6D2323',
                          borderWidth: '1.5px',
                        },
                        '&:hover fieldset': {
                          borderColor: '#6D2323',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#6D2323',
                        },
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <SearchIcon sx={{ color: '#6D2323', mr: 1 }} />
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
                      background: '#6D2323',
                      borderRadius: '3px',
                    },
                  }}
                >
                  {viewMode === 'grid' ? (
                    <Grid container spacing={1.5}>
                      {filteredData.map((person) => (
                        <Grid item xs={12} sm={6} md={4} key={person.id}>
                          <Card
                            onClick={() => handleOpenModal(person)}
                            sx={{
                              cursor: 'pointer',
                              border: '1px solid #ddd',
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              '&:hover': {
                                borderColor: '#6d2323',
                                transform: 'translateY(-2px)',
                                transition: 'all 0.2s ease',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                              },
                            }}
                          >
                            <CardContent
                              sx={{
                                p: 1.5,
                                flexGrow: 1,
                                display: 'flex',
                                flexDirection: 'column',
                              }}
                            >
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  mb: 1,
                                }}
                              >
                                <PersonIcon
                                  sx={{
                                    fontSize: 18,
                                    color: '#6d2323',
                                    mr: 0.5,
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: '#6d2323',
                                    px: 0.5,
                                    py: 0.2,
                                    borderRadius: 0.5,
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold',
                                  }}
                                >
                                  {person.agencyEmployeeNum}
                                </Typography>
                              </Box>

                              <Typography
                                variant="body2"
                                fontWeight="bold"
                                color="#333"
                                mb={0.5}
                                noWrap
                              >
                                {person.firstName} {person.lastName}
                              </Typography>

                              <Typography
                                variant="body2"
                                color="#666"
                                sx={{ flexGrow: 1 }}
                              >
                                {person.civilStatus} • {person.sex}
                              </Typography>

                              <Chip
                                label={person.citizenship || 'No Citizenship'}
                                size="small"
                                sx={{
                                  backgroundColor: '#6d2323',
                                  color: '#fff',
                                  fontWeight: 'bold',
                                  fontSize: '0.7rem',
                                  alignSelf: 'flex-start',
                                }}
                              />
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    filteredData.map((person) => (
                      <Card
                        key={person.id}
                        onClick={() => handleOpenModal(person)}
                        sx={{
                          cursor: 'pointer',
                          border: '1px solid #ddd',
                          mb: 1,
                          '&:hover': {
                            borderColor: '#6d2323',
                            backgroundColor: '#fafafa',
                          },
                        }}
                      >
                        <Box sx={{ p: 1.5 }}>
                          <Box
                            sx={{ display: 'flex', alignItems: 'flex-start' }}
                          >
                            <Box sx={{ mr: 1.5, mt: 0.2 }}>
                              <PersonIcon
                                sx={{ fontSize: 20, color: '#6d2323' }}
                              />
                            </Box>

                            <Box sx={{ flexGrow: 1 }}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  mb: 0.5,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{
                                    backgroundColor: '#6d2323',
                                    color: 'white',
                                    px: 0.5,
                                    py: 0.2,
                                    borderRadius: 0.5,
                                    fontSize: '0.7rem',
                                    fontWeight: 'bold',
                                    mr: 1,
                                  }}
                                >
                                  {person.agencyEmployeeNum}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  fontWeight="bold"
                                  color="#333"
                                >
                                  {person.firstName} {person.lastName}
                                </Typography>
                              </Box>

                              <Typography
                                variant="body2"
                                color="#666"
                                sx={{ mb: 0.5 }}
                              >
                                {person.civilStatus} • {person.sex} •{' '}
                                {person.citizenship}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </Card>
                    ))
                  )}

                  {filteredData.length === 0 && (
                    <Box textAlign="center" py={4}>
                      <Typography
                        variant="body1"
                        color="#555"
                        fontWeight="bold"
                      >
                        No Records Found
                      </Typography>
                      <Typography variant="body2" color="#666" sx={{ mt: 0.5 }}>
                        Try adjusting your search criteria
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Edit Modal */}
      {/* Edit Modal */}
      <Modal
        open={!!editPerson}
        onClose={handleCloseModal}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          sx={{
            width: '90%',
            maxWidth: '800px',
            height: '85vh',
            maxHeight: '85vh',
            overflow: 'hidden',
            borderRadius: 2,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {editPerson && (
            <>
              {/* Modal Header with Floating Action Buttons */}
              <Box
                sx={{
                  backgroundColor: '#6D2323',
                  color: '#ffffff',
                  p: 2,
                  borderRadius: '8px 8px 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonIcon sx={{ fontSize: '1.8rem', mr: 2 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {isEditing
                        ? 'Edit Personal Information'
                        : 'Personal Information Details'}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9 }}>
                      {editPerson.firstName} {editPerson.lastName} -{' '}
                      {editPerson.agencyEmployeeNum}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {!isEditing ? (
                    <>
                      <Button
                        onClick={() => handleDelete(editPerson.id)}
                        variant="outlined"
                        startIcon={<DeleteIcon />}
                        sx={{
                          color: '#ffffff',
                          borderColor: '#ffffff',
                          mr: 1,
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            borderColor: '#ffffff',
                          },
                        }}
                      >
                        Delete
                      </Button>
                      <Button
                        onClick={handleStartEdit}
                        variant="contained"
                        startIcon={<EditIcon />}
                        sx={{
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          color: '#ffffff',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.3)',
                          },
                        }}
                      >
                        Edit
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={handleCancelEdit}
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        sx={{
                          color: '#ffffff',
                          borderColor: '#ffffff',
                          mr: 1,
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            borderColor: '#ffffff',
                          },
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleUpdate}
                        variant="contained"
                        startIcon={<SaveIcon />}
                        disabled={!hasChanges()}
                        sx={{
                          backgroundColor: hasChanges()
                            ? 'rgba(255, 255, 255, 0.2)'
                            : 'rgba(255, 255, 255, 0.1)',
                          color: '#ffffff',
                          '&:hover': {
                            backgroundColor: hasChanges()
                              ? 'rgba(255, 255, 255, 0.3)'
                              : 'rgba(255, 255, 255, 0.1)',
                          },
                          '&:disabled': {
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            color: 'rgba(255, 255, 255, 0.5)',
                          },
                        }}
                      >
                        Save Changes
                      </Button>
                    </>
                  )}
                  <IconButton
                    onClick={handleCloseModal}
                    sx={{ color: '#fff', ml: 1 }}
                  >
                    <Close />
                  </IconButton>
                </Box>
              </Box>

              {/* Scrollable Content Area */}
              <Box
                sx={{
                  flexGrow: 1,
                  overflowY: 'auto',
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: '#f1f1f1',
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#6D2323',
                    borderRadius: '4px',
                  },
                }}
              >
                <Box sx={{ p: 3 }}>
                  {/* Personal Information Section */}
                  <Accordion
                    defaultExpanded
                    sx={{
                      mb: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      '&:before': { display: 'none' },
                      border: '1px solid #e0e0e0',
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{
                        backgroundColor: '#f8f9fa',
                        '&:hover': { backgroundColor: '#f0f0f0' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon sx={{ color: '#6D2323', mr: 2 }} />
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 'bold', color: '#6D2323' }}
                        >
                          Personal Information
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List dense>
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="Full Name"
                            secondary={
                              isEditing ? (
                                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                  <TextField
                                    size="small"
                                    label="First Name"
                                    value={editPerson.firstName || ''}
                                    onChange={(e) =>
                                      handleChange(
                                        'firstName',
                                        e.target.value,
                                        true
                                      )
                                    }
                                    sx={{ flex: 1 }}
                                  />
                                  <TextField
                                    size="small"
                                    label="Middle Name"
                                    value={editPerson.middleName || ''}
                                    onChange={(e) =>
                                      handleChange(
                                        'middleName',
                                        e.target.value,
                                        true
                                      )
                                    }
                                    sx={{ flex: 1 }}
                                  />
                                  <TextField
                                    size="small"
                                    label="Last Name"
                                    value={editPerson.lastName || ''}
                                    onChange={(e) =>
                                      handleChange(
                                        'lastName',
                                        e.target.value,
                                        true
                                      )
                                    }
                                    sx={{ flex: 1 }}
                                  />
                                </Box>
                              ) : (
                                `${editPerson.firstName || ''} ${
                                  editPerson.middleName || ''
                                } ${editPerson.lastName || ''}`
                              )
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="Date of Birth"
                            secondary={
                              isEditing ? (
                                <TextField
                                  size="small"
                                  type="date"
                                  value={
                                    editPerson.birthDate?.split('T')[0] || ''
                                  }
                                  onChange={(e) =>
                                    handleChange(
                                      'birthDate',
                                      e.target.value,
                                      true
                                    )
                                  }
                                  sx={{ mt: 1, width: '100%' }}
                                />
                              ) : editPerson.birthDate ? (
                                new Date(
                                  editPerson.birthDate
                                ).toLocaleDateString()
                              ) : (
                                'Not specified'
                              )
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="Place of Birth"
                            secondary={
                              isEditing ? (
                                <TextField
                                  size="small"
                                  value={editPerson.placeOfBirth || ''}
                                  onChange={(e) =>
                                    handleChange(
                                      'placeOfBirth',
                                      e.target.value,
                                      true
                                    )
                                  }
                                  sx={{ mt: 1, width: '100%' }}
                                />
                              ) : (
                                editPerson.placeOfBirth || 'Not specified'
                              )
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="Sex"
                            secondary={
                              isEditing ? (
                                <FormControl
                                  size="small"
                                  sx={{ mt: 1, width: '100%' }}
                                >
                                  <Select
                                    value={editPerson.sex || ''}
                                    onChange={(e) =>
                                      handleChange('sex', e.target.value, true)
                                    }
                                  >
                                    <MenuItem value="">Select Sex</MenuItem>
                                    <MenuItem value="Male">Male</MenuItem>
                                    <MenuItem value="Female">Female</MenuItem>
                                    <MenuItem value="Other">Other</MenuItem>
                                  </Select>
                                </FormControl>
                              ) : (
                                editPerson.sex || 'Not specified'
                              )
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="Civil Status"
                            secondary={
                              isEditing ? (
                                <FormControl
                                  size="small"
                                  sx={{ mt: 1, width: '100%' }}
                                >
                                  <Select
                                    value={editPerson.civilStatus || ''}
                                    onChange={(e) =>
                                      handleChange(
                                        'civilStatus',
                                        e.target.value,
                                        true
                                      )
                                    }
                                  >
                                    <MenuItem value="">
                                      Select Civil Status
                                    </MenuItem>
                                    <MenuItem value="Single">Single</MenuItem>
                                    <MenuItem value="Married">Married</MenuItem>
                                    <MenuItem value="Widowed">Widowed</MenuItem>
                                    <MenuItem value="Separated">
                                      Separated
                                    </MenuItem>
                                    <MenuItem value="Divorced">
                                      Divorced
                                    </MenuItem>
                                  </Select>
                                </FormControl>
                              ) : (
                                editPerson.civilStatus || 'Not specified'
                              )
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="Citizenship"
                            secondary={
                              isEditing ? (
                                <TextField
                                  size="small"
                                  value={editPerson.citizenship || ''}
                                  onChange={(e) =>
                                    handleChange(
                                      'citizenship',
                                      e.target.value,
                                      true
                                    )
                                  }
                                  sx={{ mt: 1, width: '100%' }}
                                />
                              ) : (
                                editPerson.citizenship || 'Not specified'
                              )
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="Physical Attributes"
                            secondary={
                              isEditing ? (
                                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                  <TextField
                                    size="small"
                                    label="Height (cm)"
                                    value={editPerson.heightCm || ''}
                                    onChange={(e) =>
                                      handleChange(
                                        'heightCm',
                                        e.target.value,
                                        true
                                      )
                                    }
                                    sx={{ flex: 1 }}
                                  />
                                  <TextField
                                    size="small"
                                    label="Weight (kg)"
                                    value={editPerson.weightKg || ''}
                                    onChange={(e) =>
                                      handleChange(
                                        'weightKg',
                                        e.target.value,
                                        true
                                      )
                                    }
                                    sx={{ flex: 1 }}
                                  />
                                  <FormControl size="small" sx={{ flex: 1 }}>
                                    <Select
                                      value={editPerson.bloodType || ''}
                                      onChange={(e) =>
                                        handleChange(
                                          'bloodType',
                                          e.target.value,
                                          true
                                        )
                                      }
                                      displayEmpty
                                    >
                                      <MenuItem value="">Blood Type</MenuItem>
                                      <MenuItem value="A+">A+</MenuItem>
                                      <MenuItem value="A-">A-</MenuItem>
                                      <MenuItem value="B+">B+</MenuItem>
                                      <MenuItem value="B-">B-</MenuItem>
                                      <MenuItem value="AB+">AB+</MenuItem>
                                      <MenuItem value="AB-">AB-</MenuItem>
                                      <MenuItem value="O+">O+</MenuItem>
                                      <MenuItem value="O-">O-</MenuItem>
                                    </Select>
                                  </FormControl>
                                </Box>
                              ) : (
                                `Height: ${
                                  editPerson.heightCm || 'N/A'
                                } cm, Weight: ${
                                  editPerson.weightKg || 'N/A'
                                } kg, Blood Type: ${
                                  editPerson.bloodType || 'N/A'
                                }`
                              )
                            }
                          />
                        </ListItem>
                      </List>
                    </AccordionDetails>
                  </Accordion>

                  {/* Contact Information Section */}
                  <Accordion
                    sx={{
                      mb: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      '&:before': { display: 'none' },
                      border: '1px solid #e0e0e0',
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{
                        backgroundColor: '#f8f9fa',
                        '&:hover': { backgroundColor: '#f0f0f0' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon sx={{ color: '#6D2323', mr: 2 }} />
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 'bold', color: '#6D2323' }}
                        >
                          Contact Information
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List dense>
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="Telephone Number"
                            secondary={
                              isEditing ? (
                                <TextField
                                  size="small"
                                  value={editPerson.telephone || ''}
                                  onChange={(e) =>
                                    handleChange(
                                      'telephone',
                                      e.target.value,
                                      true
                                    )
                                  }
                                  sx={{ mt: 1, width: '100%' }}
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        📞
                                      </InputAdornment>
                                    ),
                                  }}
                                />
                              ) : (
                                editPerson.telephone || 'Not specified'
                              )
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="Mobile Number"
                            secondary={
                              isEditing ? (
                                <TextField
                                  size="small"
                                  value={editPerson.mobileNum || ''}
                                  onChange={(e) =>
                                    handleChange(
                                      'mobileNum',
                                      e.target.value,
                                      true
                                    )
                                  }
                                  sx={{ mt: 1, width: '100%' }}
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        📱
                                      </InputAdornment>
                                    ),
                                  }}
                                />
                              ) : (
                                editPerson.mobileNum || 'Not specified'
                              )
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="Email Address"
                            secondary={
                              isEditing ? (
                                <TextField
                                  size="small"
                                  type="email"
                                  value={editPerson.emailAddress || ''}
                                  onChange={(e) =>
                                    handleChange(
                                      'emailAddress',
                                      e.target.value,
                                      true
                                    )
                                  }
                                  sx={{ mt: 1, width: '100%' }}
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        ✉️
                                      </InputAdornment>
                                    ),
                                  }}
                                />
                              ) : (
                                editPerson.emailAddress || 'Not specified'
                              )
                            }
                          />
                        </ListItem>
                      </List>
                    </AccordionDetails>
                  </Accordion>

                  {/* Government IDs Section */}
                  <Accordion
                    sx={{
                      mb: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      '&:before': { display: 'none' },
                      border: '1px solid #e0e0e0',
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{
                        backgroundColor: '#f8f9fa',
                        '&:hover': { backgroundColor: '#f0f0f0' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CreditCard sx={{ color: '#6D2323', mr: 2 }} />
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 'bold', color: '#6D2323' }}
                        >
                          Government IDs
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <List dense>
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="Employee Number"
                            secondary={
                              isEditing ? (
                                <TextField
                                  size="small"
                                  value={editPerson.agencyEmployeeNum || ''}
                                  onChange={(e) =>
                                    handleChange(
                                      'agencyEmployeeNum',
                                      e.target.value,
                                      true
                                    )
                                  }
                                  sx={{ mt: 1, width: '100%' }}
                                  disabled
                                  helperText="Cannot be changed"
                                />
                              ) : (
                                <Box>
                                  <Typography variant="body2">
                                    {editPerson.agencyEmployeeNum ||
                                      'Not specified'}
                                  </Typography>
                                  <Typography variant="caption" color="error">
                                    Contact administrator to change
                                  </Typography>
                                </Box>
                              )
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="GSIS Number"
                            secondary={
                              isEditing ? (
                                <TextField
                                  size="small"
                                  value={editPerson.gsisNum || ''}
                                  onChange={(e) =>
                                    handleChange(
                                      'gsisNum',
                                      e.target.value,
                                      true
                                    )
                                  }
                                  sx={{ mt: 1, width: '100%' }}
                                />
                              ) : (
                                editPerson.gsisNum || 'Not specified'
                              )
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="Pag-IBIG Number"
                            secondary={
                              isEditing ? (
                                <TextField
                                  size="small"
                                  value={editPerson.pagibigNum || ''}
                                  onChange={(e) =>
                                    handleChange(
                                      'pagibigNum',
                                      e.target.value,
                                      true
                                    )
                                  }
                                  sx={{ mt: 1, width: '100%' }}
                                />
                              ) : (
                                editPerson.pagibigNum || 'Not specified'
                              )
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="PhilHealth Number"
                            secondary={
                              isEditing ? (
                                <TextField
                                  size="small"
                                  value={editPerson.philhealthNum || ''}
                                  onChange={(e) =>
                                    handleChange(
                                      'philhealthNum',
                                      e.target.value,
                                      true
                                    )
                                  }
                                  sx={{ mt: 1, width: '100%' }}
                                />
                              ) : (
                                editPerson.philhealthNum || 'Not specified'
                              )
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="SSS Number"
                            secondary={
                              isEditing ? (
                                <TextField
                                  size="small"
                                  value={editPerson.sssNum || ''}
                                  onChange={(e) =>
                                    handleChange('sssNum', e.target.value, true)
                                  }
                                  sx={{ mt: 1, width: '100%' }}
                                />
                              ) : (
                                editPerson.sssNum || 'Not specified'
                              )
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="TIN Number"
                            secondary={
                              isEditing ? (
                                <TextField
                                  size="small"
                                  value={editPerson.tinNum || ''}
                                  onChange={(e) =>
                                    handleChange('tinNum', e.target.value, true)
                                  }
                                  sx={{ mt: 1, width: '100%' }}
                                />
                              ) : (
                                editPerson.tinNum || 'Not specified'
                              )
                            }
                          />
                        </ListItem>
                      </List>
                    </AccordionDetails>
                  </Accordion>

                  {/* Address Information Section */}
                  <Accordion
                    sx={{
                      mb: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      '&:before': { display: 'none' },
                      border: '1px solid #e0e0e0',
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{
                        backgroundColor: '#f8f9fa',
                        '&:hover': { backgroundColor: '#f0f0f0' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Home sx={{ color: '#6D2323', mr: 2 }} />
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 'bold', color: '#6D2323' }}
                        >
                          Address Information
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 'bold', mb: 2, color: '#6D2323' }}
                      >
                        🏠 Permanent Address
                      </Typography>
                      <List dense>
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="House/Block/Lot Number"
                            secondary={
                              isEditing ? (
                                <TextField
                                  size="small"
                                  value={
                                    editPerson.permanent_houseBlockLotNum || ''
                                  }
                                  onChange={(e) =>
                                    handleChange(
                                      'permanent_houseBlockLotNum',
                                      e.target.value,
                                      true
                                    )
                                  }
                                  sx={{ mt: 1, width: '100%' }}
                                />
                              ) : (
                                editPerson.permanent_houseBlockLotNum ||
                                'Not specified'
                              )
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="Street Name"
                            secondary={
                              isEditing ? (
                                <TextField
                                  size="small"
                                  value={editPerson.permanent_streetName || ''}
                                  onChange={(e) =>
                                    handleChange(
                                      'permanent_streetName',
                                      e.target.value,
                                      true
                                    )
                                  }
                                  sx={{ mt: 1, width: '100%' }}
                                />
                              ) : (
                                editPerson.permanent_streetName ||
                                'Not specified'
                              )
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="Subdivision/Village"
                            secondary={
                              isEditing ? (
                                <TextField
                                  size="small"
                                  value={
                                    editPerson.permanent_subdivisionOrVillage ||
                                    ''
                                  }
                                  onChange={(e) =>
                                    handleChange(
                                      'permanent_subdivisionOrVillage',
                                      e.target.value,
                                      true
                                    )
                                  }
                                  sx={{ mt: 1, width: '100%' }}
                                />
                              ) : (
                                editPerson.permanent_subdivisionOrVillage ||
                                'Not specified'
                              )
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="Barangay"
                            secondary={
                              isEditing ? (
                                <TextField
                                  size="small"
                                  value={
                                    editPerson.permanent_barangayName || ''
                                  }
                                  onChange={(e) =>
                                    handleChange(
                                      'permanent_barangayName',
                                      e.target.value,
                                      true
                                    )
                                  }
                                  sx={{ mt: 1, width: '100%' }}
                                />
                              ) : (
                                editPerson.permanent_barangayName ||
                                'Not specified'
                              )
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="City/Municipality"
                            secondary={
                              isEditing ? (
                                <TextField
                                  size="small"
                                  value={
                                    editPerson.permanent_cityOrMunicipality ||
                                    ''
                                  }
                                  onChange={(e) =>
                                    handleChange(
                                      'permanent_cityOrMunicipality',
                                      e.target.value,
                                      true
                                    )
                                  }
                                  sx={{ mt: 1, width: '100%' }}
                                />
                              ) : (
                                editPerson.permanent_cityOrMunicipality ||
                                'Not specified'
                              )
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="Province"
                            secondary={
                              isEditing ? (
                                <TextField
                                  size="small"
                                  value={
                                    editPerson.permanent_provinceName || ''
                                  }
                                  onChange={(e) =>
                                    handleChange(
                                      'permanent_provinceName',
                                      e.target.value,
                                      true
                                    )
                                  }
                                  sx={{ mt: 1, width: '100%' }}
                                />
                              ) : (
                                editPerson.permanent_provinceName ||
                                'Not specified'
                              )
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="Zip Code"
                            secondary={
                              isEditing ? (
                                <TextField
                                  size="small"
                                  value={editPerson.permanent_zipcode || ''}
                                  onChange={(e) =>
                                    handleChange(
                                      'permanent_zipcode',
                                      e.target.value,
                                      true
                                    )
                                  }
                                  sx={{ mt: 1, width: '100%' }}
                                />
                              ) : (
                                editPerson.permanent_zipcode || 'Not specified'
                              )
                            }
                          />
                        </ListItem>
                      </List>

                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 'bold',
                          mb: 2,
                          mt: 3,
                          color: '#6D2323',
                        }}
                      >
                        🏡 Residential Address
                      </Typography>
                      <List dense>
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="House/Block/Lot Number"
                            secondary={
                              isEditing ? (
                                <TextField
                                  size="small"
                                  value={
                                    editPerson.residential_houseBlockLotNum ||
                                    ''
                                  }
                                  onChange={(e) =>
                                    handleChange(
                                      'residential_houseBlockLotNum',
                                      e.target.value,
                                      true
                                    )
                                  }
                                  sx={{ mt: 1, width: '100%' }}
                                />
                              ) : (
                                editPerson.residential_houseBlockLotNum ||
                                'Not specified'
                              )
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="Street Name"
                            secondary={
                              isEditing ? (
                                <TextField
                                  size="small"
                                  value={
                                    editPerson.residential_streetName || ''
                                  }
                                  onChange={(e) =>
                                    handleChange(
                                      'residential_streetName',
                                      e.target.value,
                                      true
                                    )
                                  }
                                  sx={{ mt: 1, width: '100%' }}
                                />
                              ) : (
                                editPerson.residential_streetName ||
                                'Not specified'
                              )
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="Subdivision/Village"
                            secondary={
                              isEditing ? (
                                <TextField
                                  size="small"
                                  value={
                                    editPerson.residential_subdivisionOrVillage ||
                                    ''
                                  }
                                  onChange={(e) =>
                                    handleChange(
                                      'residential_subdivisionOrVillage',
                                      e.target.value,
                                      true
                                    )
                                  }
                                  sx={{ mt: 1, width: '100%' }}
                                />
                              ) : (
                                editPerson.residential_subdivisionOrVillage ||
                                'Not specified'
                              )
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="Barangay"
                            secondary={
                              isEditing ? (
                                <TextField
                                  size="small"
                                  value={
                                    editPerson.residential_barangayName || ''
                                  }
                                  onChange={(e) =>
                                    handleChange(
                                      'residential_barangayName',
                                      e.target.value,
                                      true
                                    )
                                  }
                                  sx={{ mt: 1, width: '100%' }}
                                />
                              ) : (
                                editPerson.residential_barangayName ||
                                'Not specified'
                              )
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="City/Municipality"
                            secondary={
                              isEditing ? (
                                <TextField
                                  size="small"
                                  value={
                                    editPerson.residential_cityOrMunicipality ||
                                    ''
                                  }
                                  onChange={(e) =>
                                    handleChange(
                                      'residential_cityOrMunicipality',
                                      e.target.value,
                                      true
                                    )
                                  }
                                  sx={{ mt: 1, width: '100%' }}
                                />
                              ) : (
                                editPerson.residential_cityOrMunicipality ||
                                'Not specified'
                              )
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="Province"
                            secondary={
                              isEditing ? (
                                <TextField
                                  size="small"
                                  value={
                                    editPerson.residential_provinceName || ''
                                  }
                                  onChange={(e) =>
                                    handleChange(
                                      'residential_provinceName',
                                      e.target.value,
                                      true
                                    )
                                  }
                                  sx={{ mt: 1, width: '100%' }}
                                />
                              ) : (
                                editPerson.residential_provinceName ||
                                'Not specified'
                              )
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="Zip Code"
                            secondary={
                              isEditing ? (
                                <TextField
                                  size="small"
                                  value={editPerson.residential_zipcode || ''}
                                  onChange={(e) =>
                                    handleChange(
                                      'residential_zipcode',
                                      e.target.value,
                                      true
                                    )
                                  }
                                  sx={{ mt: 1, width: '100%' }}
                                />
                              ) : (
                                editPerson.residential_zipcode ||
                                'Not specified'
                              )
                            }
                          />
                        </ListItem>
                      </List>
                    </AccordionDetails>
                  </Accordion>

                  {/* Family Information Section */}
                  <Accordion
                    sx={{
                      mb: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      '&:before': { display: 'none' },
                      border: '1px solid #e0e0e0',
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{
                        backgroundColor: '#f8f9fa',
                        '&:hover': { backgroundColor: '#f0f0f0' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FamilyRestroom sx={{ color: '#6D2323', mr: 2 }} />
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 'bold', color: '#6D2323' }}
                        >
                          Family Information
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 'bold', mb: 2, color: '#6D2323' }}
                      >
                        💑 Spouse Information
                      </Typography>
                      <List dense>
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="Full Name"
                            secondary={
                              isEditing ? (
                                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                  <TextField
                                    size="small"
                                    label="First Name"
                                    value={editPerson.spouseFirstName || ''}
                                    onChange={(e) =>
                                      handleChange(
                                        'spouseFirstName',
                                        e.target.value,
                                        true
                                      )
                                    }
                                    sx={{ flex: 1 }}
                                  />
                                  <TextField
                                    size="small"
                                    label="Middle Name"
                                    value={editPerson.spouseMiddleName || ''}
                                    onChange={(e) =>
                                      handleChange(
                                        'spouseMiddleName',
                                        e.target.value,
                                        true
                                      )
                                    }
                                    sx={{ flex: 1 }}
                                  />
                                  <TextField
                                    size="small"
                                    label="Last Name"
                                    value={editPerson.spouseLastName || ''}
                                    onChange={(e) =>
                                      handleChange(
                                        'spouseLastName',
                                        e.target.value,
                                        true
                                      )
                                    }
                                    sx={{ flex: 1 }}
                                  />
                                </Box>
                              ) : (
                                `${editPerson.spouseFirstName || ''} ${
                                  editPerson.spouseMiddleName || ''
                                } ${editPerson.spouseLastName || ''}` ||
                                'Not specified'
                              )
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="Occupation"
                            secondary={
                              isEditing ? (
                                <TextField
                                  size="small"
                                  value={editPerson.spouseOccupation || ''}
                                  onChange={(e) =>
                                    handleChange(
                                      'spouseOccupation',
                                      e.target.value,
                                      true
                                    )
                                  }
                                  sx={{ mt: 1, width: '100%' }}
                                />
                              ) : (
                                editPerson.spouseOccupation || 'Not specified'
                              )
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="Employer/Business Name"
                            secondary={
                              isEditing ? (
                                <TextField
                                  size="small"
                                  value={
                                    editPerson.spouseEmployerBusinessName || ''
                                  }
                                  onChange={(e) =>
                                    handleChange(
                                      'spouseEmployerBusinessName',
                                      e.target.value,
                                      true
                                    )
                                  }
                                  sx={{ mt: 1, width: '100%' }}
                                />
                              ) : (
                                editPerson.spouseEmployerBusinessName ||
                                'Not specified'
                              )
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="Business Address"
                            secondary={
                              isEditing ? (
                                <TextField
                                  size="small"
                                  value={editPerson.spouseBusinessAddress || ''}
                                  onChange={(e) =>
                                    handleChange(
                                      'spouseBusinessAddress',
                                      e.target.value,
                                      true
                                    )
                                  }
                                  sx={{ mt: 1, width: '100%' }}
                                />
                              ) : (
                                editPerson.spouseBusinessAddress ||
                                'Not specified'
                              )
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="Telephone"
                            secondary={
                              isEditing ? (
                                <TextField
                                  size="small"
                                  value={editPerson.spouseTelephone || ''}
                                  onChange={(e) =>
                                    handleChange(
                                      'spouseTelephone',
                                      e.target.value,
                                      true
                                    )
                                  }
                                  sx={{ mt: 1, width: '100%' }}
                                />
                              ) : (
                                editPerson.spouseTelephone || 'Not specified'
                              )
                            }
                          />
                        </ListItem>
                      </List>

                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 'bold',
                          mb: 2,
                          mt: 3,
                          color: '#6D2323',
                        }}
                      >
                        👨‍👩‍👧‍👦 Parents Information
                      </Typography>
                      <List dense>
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="Father's Full Name"
                            secondary={
                              isEditing ? (
                                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                  <TextField
                                    size="small"
                                    label="First Name"
                                    value={editPerson.fatherFirstName || ''}
                                    onChange={(e) =>
                                      handleChange(
                                        'fatherFirstName',
                                        e.target.value,
                                        true
                                      )
                                    }
                                    sx={{ flex: 1 }}
                                  />
                                  <TextField
                                    size="small"
                                    label="Middle Name"
                                    value={editPerson.fatherMiddleName || ''}
                                    onChange={(e) =>
                                      handleChange(
                                        'fatherMiddleName',
                                        e.target.value,
                                        true
                                      )
                                    }
                                    sx={{ flex: 1 }}
                                  />
                                  <TextField
                                    size="small"
                                    label="Last Name"
                                    value={editPerson.fatherLastName || ''}
                                    onChange={(e) =>
                                      handleChange(
                                        'fatherLastName',
                                        e.target.value,
                                        true
                                      )
                                    }
                                    sx={{ flex: 1 }}
                                  />
                                </Box>
                              ) : (
                                `${editPerson.fatherFirstName || ''} ${
                                  editPerson.fatherMiddleName || ''
                                } ${editPerson.fatherLastName || ''}` ||
                                'Not specified'
                              )
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="Mother's Maiden Full Name"
                            secondary={
                              isEditing ? (
                                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                  <TextField
                                    size="small"
                                    label="First Name"
                                    value={
                                      editPerson.motherMaidenFirstName || ''
                                    }
                                    onChange={(e) =>
                                      handleChange(
                                        'motherMaidenFirstName',
                                        e.target.value,
                                        true
                                      )
                                    }
                                    sx={{ flex: 1 }}
                                  />
                                  <TextField
                                    size="small"
                                    label="Middle Name"
                                    value={
                                      editPerson.motherMaidenMiddleName || ''
                                    }
                                    onChange={(e) =>
                                      handleChange(
                                        'motherMaidenMiddleName',
                                        e.target.value,
                                        true
                                      )
                                    }
                                    sx={{ flex: 1 }}
                                  />
                                  <TextField
                                    size="small"
                                    label="Last Name"
                                    value={
                                      editPerson.motherMaidenLastName || ''
                                    }
                                    onChange={(e) =>
                                      handleChange(
                                        'motherMaidenLastName',
                                        e.target.value,
                                        true
                                      )
                                    }
                                    sx={{ flex: 1 }}
                                  />
                                </Box>
                              ) : (
                                `${editPerson.motherMaidenFirstName || ''} ${
                                  editPerson.motherMaidenMiddleName || ''
                                } ${editPerson.motherMaidenLastName || ''}` ||
                                'Not specified'
                              )
                            }
                          />
                        </ListItem>
                      </List>
                    </AccordionDetails>
                  </Accordion>

                  {/* Educational Background Section */}
                  <Accordion
                    sx={{
                      mb: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      '&:before': { display: 'none' },
                      border: '1px solid #e0e0e0',
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{
                        backgroundColor: '#f8f9fa',
                        '&:hover': { backgroundColor: '#f0f0f0' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <School sx={{ color: '#6D2323', mr: 2 }} />
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 'bold', color: '#6D2323' }}
                        >
                          Educational Background
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 'bold', mb: 2, color: '#6D2323' }}
                      >
                        🎓 Elementary Education
                      </Typography>
                      <List dense>
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="School Name"
                            secondary={
                              isEditing ? (
                                <TextField
                                  size="small"
                                  value={
                                    editPerson.elementaryNameOfSchool || ''
                                  }
                                  onChange={(e) =>
                                    handleChange(
                                      'elementaryNameOfSchool',
                                      e.target.value,
                                      true
                                    )
                                  }
                                  sx={{ mt: 1, width: '100%' }}
                                />
                              ) : (
                                editPerson.elementaryNameOfSchool ||
                                'Not specified'
                              )
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="Degree/Course"
                            secondary={
                              isEditing ? (
                                <TextField
                                  size="small"
                                  value={editPerson.elementaryDegree || ''}
                                  onChange={(e) =>
                                    handleChange(
                                      'elementaryDegree',
                                      e.target.value,
                                      true
                                    )
                                  }
                                  sx={{ mt: 1, width: '100%' }}
                                />
                              ) : (
                                editPerson.elementaryDegree || 'Not specified'
                              )
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="Period Attended"
                            secondary={
                              isEditing ? (
                                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                  <TextField
                                    size="small"
                                    label="From"
                                    type="number"
                                    value={
                                      editPerson.elementaryPeriodFrom || ''
                                    }
                                    onChange={(e) =>
                                      handleChange(
                                        'elementaryPeriodFrom',
                                        e.target.value,
                                        true
                                      )
                                    }
                                    sx={{ flex: 1 }}
                                  />
                                  <TextField
                                    size="small"
                                    label="To"
                                    type="number"
                                    value={editPerson.elementaryPeriodTo || ''}
                                    onChange={(e) =>
                                      handleChange(
                                        'elementaryPeriodTo',
                                        e.target.value,
                                        true
                                      )
                                    }
                                    sx={{ flex: 1 }}
                                  />
                                </Box>
                              ) : (
                                `${
                                  editPerson.elementaryPeriodFrom || 'N/A'
                                } - ${editPerson.elementaryPeriodTo || 'N/A'}`
                              )
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="Highest Attained"
                            secondary={
                              isEditing ? (
                                <TextField
                                  size="small"
                                  value={
                                    editPerson.elementaryHighestAttained || ''
                                  }
                                  onChange={(e) =>
                                    handleChange(
                                      'elementaryHighestAttained',
                                      e.target.value,
                                      true
                                    )
                                  }
                                  sx={{ mt: 1, width: '100%' }}
                                />
                              ) : (
                                editPerson.elementaryHighestAttained ||
                                'Not specified'
                              )
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="Year Graduated"
                            secondary={
                              isEditing ? (
                                <TextField
                                  size="small"
                                  type="number"
                                  value={
                                    editPerson.elementaryYearGraduated || ''
                                  }
                                  onChange={(e) =>
                                    handleChange(
                                      'elementaryYearGraduated',
                                      e.target.value,
                                      true
                                    )
                                  }
                                  sx={{ mt: 1, width: '100%' }}
                                />
                              ) : (
                                editPerson.elementaryYearGraduated ||
                                'Not specified'
                              )
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="Scholarship/Academic Honors"
                            secondary={
                              isEditing ? (
                                <TextField
                                  size="small"
                                  multiline
                                  rows={2}
                                  value={
                                    editPerson.elementaryScholarshipAcademicHonorsReceived ||
                                    ''
                                  }
                                  onChange={(e) =>
                                    handleChange(
                                      'elementaryScholarshipAcademicHonorsReceived',
                                      e.target.value,
                                      true
                                    )
                                  }
                                  sx={{ mt: 1, width: '100%' }}
                                />
                              ) : (
                                editPerson.elementaryScholarshipAcademicHonorsReceived ||
                                'Not specified'
                              )
                            }
                          />
                        </ListItem>
                      </List>

                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 'bold',
                          mb: 2,
                          mt: 3,
                          color: '#6D2323',
                        }}
                      >
                        🎓 Secondary Education
                      </Typography>
                      <List dense>
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="School Name"
                            secondary={
                              isEditing ? (
                                <TextField
                                  size="small"
                                  value={editPerson.secondaryNameOfSchool || ''}
                                  onChange={(e) =>
                                    handleChange(
                                      'secondaryNameOfSchool',
                                      e.target.value,
                                      true
                                    )
                                  }
                                  sx={{ mt: 1, width: '100%' }}
                                />
                              ) : (
                                editPerson.secondaryNameOfSchool ||
                                'Not specified'
                              )
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="Degree/Course"
                            secondary={
                              isEditing ? (
                                <TextField
                                  size="small"
                                  value={editPerson.secondaryDegree || ''}
                                  onChange={(e) =>
                                    handleChange(
                                      'secondaryDegree',
                                      e.target.value,
                                      true
                                    )
                                  }
                                  sx={{ mt: 1, width: '100%' }}
                                />
                              ) : (
                                editPerson.secondaryDegree || 'Not specified'
                              )
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="Period Attended"
                            secondary={
                              isEditing ? (
                                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                  <TextField
                                    size="small"
                                    label="From"
                                    type="number"
                                    value={editPerson.secondaryPeriodFrom || ''}
                                    onChange={(e) =>
                                      handleChange(
                                        'secondaryPeriodFrom',
                                        e.target.value,
                                        true
                                      )
                                    }
                                    sx={{ flex: 1 }}
                                  />
                                  <TextField
                                    size="small"
                                    label="To"
                                    type="number"
                                    value={editPerson.secondaryPeriodTo || ''}
                                    onChange={(e) =>
                                      handleChange(
                                        'secondaryPeriodTo',
                                        e.target.value,
                                        true
                                      )
                                    }
                                    sx={{ flex: 1 }}
                                  />
                                </Box>
                              ) : (
                                `${editPerson.secondaryPeriodFrom || 'N/A'} - ${
                                  editPerson.secondaryPeriodTo || 'N/A'
                                }`
                              )
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="Highest Attained"
                            secondary={
                              isEditing ? (
                                <TextField
                                  size="small"
                                  value={
                                    editPerson.secondaryHighestAttained || ''
                                  }
                                  onChange={(e) =>
                                    handleChange(
                                      'secondaryHighestAttained',
                                      e.target.value,
                                      true
                                    )
                                  }
                                  sx={{ mt: 1, width: '100%' }}
                                />
                              ) : (
                                editPerson.secondaryHighestAttained ||
                                'Not specified'
                              )
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="Year Graduated"
                            secondary={
                              isEditing ? (
                                <TextField
                                  size="small"
                                  type="number"
                                  value={
                                    editPerson.secondaryYearGraduated || ''
                                  }
                                  onChange={(e) =>
                                    handleChange(
                                      'secondaryYearGraduated',
                                      e.target.value,
                                      true
                                    )
                                  }
                                  sx={{ mt: 1, width: '100%' }}
                                />
                              ) : (
                                editPerson.secondaryYearGraduated ||
                                'Not specified'
                              )
                            }
                          />
                        </ListItem>
                        <Divider />
                        <ListItem sx={{ py: 0.5 }}>
                          <ListItemText
                            primary="Scholarship/Academic Honors"
                            secondary={
                              isEditing ? (
                                <TextField
                                  size="small"
                                  multiline
                                  rows={2}
                                  value={
                                    editPerson.secondaryScholarshipAcademicHonorsReceived ||
                                    ''
                                  }
                                  onChange={(e) =>
                                    handleChange(
                                      'secondaryScholarshipAcademicHonorsReceived',
                                      e.target.value,
                                      true
                                    )
                                  }
                                  sx={{ mt: 1, width: '100%' }}
                                />
                              ) : (
                                editPerson.secondaryScholarshipAcademicHonorsReceived ||
                                'Not specified'
                              )
                            }
                          />
                        </ListItem>
                      </List>
                    </AccordionDetails>
                  </Accordion>
                </Box>
              </Box>
            </>
          )}
        </Paper>
      </Modal>

      {/* Snackbar */}
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
  );
};

export default PersonTable;
