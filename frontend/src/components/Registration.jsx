import API_BASE_URL from '../apiConfig';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  TextField,
  Button,
  Container,
  Paper,
  Typography,
  Grid,
  InputAdornment,
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Fade,
  Grow,
  Zoom,
  IconButton,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  PersonOutline,
  EmailOutlined,
  BadgeOutlined,
  LockOutlined,
  PersonAddAlt1,
  GroupAdd,
  CheckCircleOutline,
  ErrorOutline,
  WarningAmber,
  CheckCircle,
  Close,
  WorkOutline,
} from '@mui/icons-material';
import AccessDenied from './AccessDenied';
import { CategoryOutlined } from '@mui/icons-material';

const Registration = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    nameExtension: '',
    email: '',
    employeeNumber: '',
    password: '',
    employmentCategory: 0,
  });

  const [errMessage, setErrorMessage] = useState();
  const [successMessage, setSuccessMessage] = useState('');
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [completedSteps, setCompletedSteps] = useState({
    remittance: false,
    department: false,
    itemTable: false,
  });

  const navigate = useNavigate();

  // Load completed steps from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('setupCompletedSteps');
    if (saved) {
      setCompletedSteps(JSON.parse(saved));
    }
  }, []);

  const handleNavigateToSetup = (page) => {
    setShowSetupModal(false);
    navigate(page);
  };

  const markStepComplete = (step) => {
    const updated = { ...completedSteps, [step]: true };
    setCompletedSteps(updated);
    localStorage.setItem('setupCompletedSteps', JSON.stringify(updated));
  };

  // Page access control states
  const [hasAccess, setHasAccess] = useState(null);

  // Page access control
  useEffect(() => {
    const userId = localStorage.getItem('employeeNumber');
    const pageId = 16;
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

  // Check if setup modal should be shown
  useEffect(() => {
    if (hasAccess === true) {
      setShowSetupModal(true);
    }
  }, [hasAccess]);

  const handleChanges = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'employmentCategory' ? Number(value) : value,
    }));
  };

  const isValidName = (name) => {
    if (!name || name.trim().length === 0) return false;
    const trimmedName = name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 50) return false;
    if (!/^[a-zA-Z\s'-]+$/.test(trimmedName)) return false;
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { firstName, lastName, email, employeeNumber, password } = formData;

    if (!firstName || !lastName || !employeeNumber || !password || !email) {
      setErrorMessage(
        'Please fill all required fields (First Name, Last Name, Email, Employee Number, Password).'
      );
      setSuccessMessage('');
      return;
    }

    if (!isValidName(firstName)) {
      setErrorMessage(
        'Please enter a valid first name (2-50 characters, letters only).'
      );
      setSuccessMessage('');
      return;
    }

    if (!isValidName(lastName)) {
      setErrorMessage(
        'Please enter a valid last name (2-50 characters, letters only).'
      );
      setSuccessMessage('');
      return;
    }

    if (formData.middleName && !isValidName(formData.middleName)) {
      setErrorMessage(
        'Please enter a valid middle name (2-50 characters, letters only).'
      );
      setSuccessMessage('');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccessMessage(
          'User registered successfully! Login Information have been sent to their email.'
        );
        setErrorMessage('');
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
        setFormData({
          firstName: '',
          middleName: '',
          lastName: '',
          nameExtension: '',
          email: '',
          employeeNumber: '',
          password: '',
          employmentCategory: 0,
        });
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'Registration failed. Try again.');
        setSuccessMessage('');
      }
    } catch (err) {
      console.error('Registration Error', err);
      setErrorMessage('Something went wrong.');
      setSuccessMessage('');
    }
  };

  const handleSetupLater = () => {
    setShowSetupModal(false);
  };

  const handleGoToSetup = () => {
    setShowSetupModal(false);
    navigate('/setup-dashboard');
  };

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
          <CircularProgress
            sx={{
              color: '#6d2323',
              mb: 2,
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              },
            }}
            size={60}
            thickness={4}
          />
          <Typography variant="h6" sx={{ color: '#6d2323', fontWeight: 600 }}>
            Loading access information...
          </Typography>
        </Box>
      </Container>
    );
  }

  // Access denied state
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

  return (
    <Container
      maxWidth="md"
      sx={{
        display: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'radial-gradient(circle at 20% 50%, rgba(109, 35, 35, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(245, 230, 230, 0.4) 0%, transparent 50%)',
          pointerEvents: 'none',
        },
      }}
    >
      {/* Setup Reminder Modal */}
      <Dialog
        open={showSetupModal}
        onClose={() => {}}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: '2px solid #f5e6e6',
            boxShadow: '0 20px 60px rgba(109, 35, 35, 0.15)',
            overflow: 'hidden',
          },
        }}
      >
        <Box
          sx={{
            background: 'linear-gradient(135deg, #6d2323 0%, #8a4747 100%)',
            p: 3,
            position: 'relative',
          }}
        >
          <IconButton
            onClick={handleSetupLater}
            sx={{
              position: 'absolute',
              right: 16,
              top: 16,
              color: '#fff',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                transform: 'rotate(90deg)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <Close />
          </IconButton>
          <DialogTitle
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '1.75rem',
              p: 0,
              pr: 5,
            }}
          >
            <Box
              sx={{
                bgcolor: 'rgba(255, 193, 7, 0.2)',
                p: 1.5,
                borderRadius: 2,
                display: 'flex',
              }}
            >
              <WarningAmber sx={{ fontSize: 36, color: '#ffc107' }} />
            </Box>
            Initial Setup Required
          </DialogTitle>
        </Box>

        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <DialogContentText
            sx={{ color: '#333', fontSize: '1.05rem', mb: 3, fontWeight: 500 }}
          >
            Before registering users, please ensure the following tables are set
            up:
          </DialogContentText>
          <Box sx={{ pl: 1, mb: 2 }}>
            {[
              {
                title: 'Remittances',
                desc: 'Configure employee remittance',
                route: '/remittance-table',
              },
              {
                title: 'Department Assignment',
                desc: 'Department designations',
                route: '/department-assignment',
              },
              {
                title: 'Item Table',
                desc: 'Setting up Plantilla',
                route: '/item-table',
              },
            ].map((item, idx) => (
              <Fade in={true} timeout={500 + idx * 200} key={idx}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    mb: 2,
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid #e0e0e0',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: 'rgba(109, 35, 35, 0.04)',
                      borderColor: '#6d2323',
                      boxShadow: '0 2px 8px rgba(109, 35, 35, 0.1)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: '#6d2323',
                      p: 0.75,
                      borderRadius: 1.5,
                      display: 'flex',
                      boxShadow: '0 2px 8px rgba(109, 35, 35, 0.2)',
                    }}
                  >
                    <CheckCircleOutline sx={{ fontSize: 22, color: '#fff' }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: '#6d2323',
                        fontSize: '1rem',
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography sx={{ color: '#666', fontSize: '0.9rem' }}>
                      {item.desc}
                    </Typography>
                  </Box>
                  <Button
                    onClick={() => {
                      setShowSetupModal(false);
                      navigate(item.route);
                    }}
                    variant="contained"
                    size="small"
                    sx={{
                      bgcolor: '#6d2323',
                      color: '#fff',
                      px: 2,
                      py: 0.75,
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '0.875rem',
                      minWidth: '80px',
                      boxShadow: '0 2px 8px rgba(109, 35, 35, 0.25)',
                      '&:hover': {
                        bgcolor: '#5a1e1e',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(109, 35, 35, 0.35)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Set Up
                  </Button>
                </Box>
              </Fade>
            ))}
          </Box>
          <DialogContentText
            sx={{
              color: '#666',
              fontSize: '0.95rem',
              fontStyle: 'italic',
              bgcolor: '#fff8e1',
              p: 2,
              borderRadius: 2,
              borderLeft: '4px solid #6d2323',
            }}
          >
            These tables are essential for Payroll Management Records.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 2 }}>
          <Button
            onClick={handleSetupLater}
            variant="outlined"
            startIcon={<CheckCircle />}
            sx={{
              color: '#6d2323',
              borderColor: '#6d2323',
              borderWidth: 2,
              px: 3,
              py: 1.2,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
              '&:hover': {
                borderColor: '#5a1e1e',
                borderWidth: 2,
                backgroundColor: 'rgba(109, 35, 35, 0.08)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Already Updated
          </Button>
        </DialogActions>
      </Dialog>

      <Grow in={true} timeout={600}>
        <Paper
          elevation={0}
          sx={{
            padding: { xs: 3, sm: 5 },
            width: '100%',
            maxWidth: 650,
            borderRadius: 4,
            textAlign: 'center',
            border: '2px solid #f5e6e6',
            background: 'linear-gradient(135deg, #ffffff 0%, #fffef9 100%)',
            boxShadow: '0 20px 60px rgba(109, 35, 35, 0.12)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 6,
              background:
                'linear-gradient(90deg, #6d2323 0%, #8a4747 50%, #6d2323 100%)',
            },
          }}
        >
          {/* Header */}
          <Zoom in={true} timeout={400}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1,
                gap: 2,
              }}
            >
              <Box
                sx={{
                  bgcolor: 'rgba(109, 35, 35, 0.1)',
                  p: 1.5,
                  borderRadius: 3,
                  display: 'flex',
                  boxShadow: '0 4px 12px rgba(109, 35, 35, 0.15)',
                }}
              >
                <PersonAddAlt1 sx={{ fontSize: 42, color: '#6d2323' }} />
              </Box>
              <Typography
                variant="h3"
                sx={{
                  color: '#6d2323',
                  fontWeight: 800,
                  background:
                    'linear-gradient(135deg, #6d2323 0%, #8a4747 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Single Registration
              </Typography>
            </Box>
          </Zoom>

          <Typography
            gutterBottom
            sx={{
              mt: 1,
              mb: 4,
              color: '#8a4747',
              fontSize: '1.1rem',
              fontWeight: 600,
            }}
          >
            Register users one at a time
          </Typography>

          {/* Alert Messages */}
          {errMessage && (
            <Fade in={true}>
              <Alert
                icon={<ErrorOutline fontSize="inherit" />}
                sx={{
                  mb: 3,
                  backgroundColor: '#6d2323',
                  color: 'white',
                  borderRadius: 2,
                  fontWeight: 500,
                  fontSize: '0.95rem',
                  boxShadow: '0 4px 12px rgba(109, 35, 35, 0.3)',
                  '& .MuiAlert-icon': {
                    color: 'white',
                  },
                }}
                severity="error"
              >
                {errMessage}
              </Alert>
            </Fade>
          )}
          {successMessage && (
            <Fade in={true}>
              <Alert
                icon={<CheckCircleOutline fontSize="inherit" />}
                sx={{
                  mb: 3,
                  backgroundColor: '#dcf8e3ff',
                  color: '#41644a',
                  border: '2px solid #41644a',
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  boxShadow: '0 4px 12px rgba(65, 100, 74, 0.2)',
                  '& .MuiAlert-icon': {
                    color: '#41644a',
                  },
                }}
                severity="success"
              >
                {successMessage}
              </Alert>
            </Fade>
          )}

          <form onSubmit={handleRegister}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="firstName"
                  label="First Name *"
                  type="text"
                  fullWidth
                  value={formData.firstName}
                  onChange={handleChanges}
                  onFocus={() => setFocusedField('firstName')}
                  onBlur={() => setFocusedField(null)}
                  InputLabelProps={{
                    required: false,
                    sx: { fontWeight: 600 },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutline
                          sx={{
                            color:
                              focusedField === 'firstName'
                                ? '#6d2323'
                                : '#8a4747',
                            transition: 'color 0.3s ease',
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                      },
                      '&:hover fieldset': {
                        borderColor: '#8a4747',
                        borderWidth: 2,
                      },
                      '&.Mui-focused': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(109, 35, 35, 0.15)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#6d2323',
                        borderWidth: 2,
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#6d2323',
                      fontWeight: 700,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="middleName"
                  label="Middle Name"
                  type="text"
                  fullWidth
                  value={formData.middleName}
                  onChange={handleChanges}
                  onFocus={() => setFocusedField('middleName')}
                  onBlur={() => setFocusedField(null)}
                  InputLabelProps={{
                    required: false,
                    sx: { fontWeight: 600 },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutline
                          sx={{
                            color:
                              focusedField === 'middleName'
                                ? '#6d2323'
                                : '#8a4747',
                            transition: 'color 0.3s ease',
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                      },
                      '&:hover fieldset': {
                        borderColor: '#8a4747',
                        borderWidth: 2,
                      },
                      '&.Mui-focused': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(109, 35, 35, 0.15)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#6d2323',
                        borderWidth: 2,
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#6d2323',
                      fontWeight: 700,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="lastName"
                  label="Last Name *"
                  type="text"
                  fullWidth
                  value={formData.lastName}
                  onChange={handleChanges}
                  onFocus={() => setFocusedField('lastName')}
                  onBlur={() => setFocusedField(null)}
                  InputLabelProps={{
                    required: false,
                    sx: { fontWeight: 600 },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutline
                          sx={{
                            color:
                              focusedField === 'lastName'
                                ? '#6d2323'
                                : '#8a4747',
                            transition: 'color 0.3s ease',
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                      },
                      '&:hover fieldset': {
                        borderColor: '#8a4747',
                        borderWidth: 2,
                      },
                      '&.Mui-focused': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(109, 35, 35, 0.15)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#6d2323',
                        borderWidth: 2,
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#6d2323',
                      fontWeight: 700,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="nameExtension"
                  label="Name Extension"
                  type="text"
                  fullWidth
                  value={formData.nameExtension}
                  onChange={handleChanges}
                  onFocus={() => setFocusedField('nameExtension')}
                  onBlur={() => setFocusedField(null)}
                  InputLabelProps={{
                    required: false,
                    sx: { fontWeight: 600 },
                  }}
                  placeholder="Jr., Sr., III, etc."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutline
                          sx={{
                            color:
                              focusedField === 'nameExtension'
                                ? '#6d2323'
                                : '#8a4747',
                            transition: 'color 0.3s ease',
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                      },
                      '&:hover fieldset': {
                        borderColor: '#8a4747',
                        borderWidth: 2,
                      },
                      '&.Mui-focused': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(109, 35, 35, 0.15)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#6d2323',
                        borderWidth: 2,
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#6d2323',
                      fontWeight: 700,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="email"
                  label="Email Address *"
                  type="email"
                  fullWidth
                  value={formData.email}
                  onChange={handleChanges}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  InputLabelProps={{
                    required: false,
                    sx: { fontWeight: 600 },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlined
                          sx={{
                            color:
                              focusedField === 'email' ? '#6d2323' : '#8a4747',
                            transition: 'color 0.3s ease',
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                      },
                      '&:hover fieldset': {
                        borderColor: '#8a4747',
                        borderWidth: 2,
                      },
                      '&.Mui-focused': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(109, 35, 35, 0.15)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#6d2323',
                        borderWidth: 2,
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#6d2323',
                      fontWeight: 700,
                    },
                  }}
                />
              </Grid>

              <Grid container spacing={5}>
                <Grid item xs={12} sm={6}>
                  <FormControl
                    fullWidth
                    variant="outlined"
                    sx={{
                      mt: 2.5,
                      ml: 2.5,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                        },
                        '&:hover fieldset': {
                          borderColor: '#8a4747',
                          borderWidth: 2,
                        },
                        '&.Mui-focused': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(109, 35, 35, 0.15)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#6d2323',
                          borderWidth: 2,
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#6d2323',
                        fontWeight: 700,
                      },
                    }}
                  >
                    <InputLabel
                      id="employmentCategory-label"
                      sx={{
                        fontWeight: 600,
                      }}
                    >
                      Employment Category *
                    </InputLabel>

                    <Select
                      labelId="employmentCategory-label"
                      name="employmentCategory"
                      value={formData.employmentCategory || ''}
                      label="Employment Categoryx"
                      onChange={handleChanges}
                      onFocus={() => setFocusedField('employmentCategory')}
                      onBlur={() => setFocusedField(null)}
                      startAdornment={
                        <InputAdornment position="start">
                          <WorkOutline
                            sx={{
                              color:
                                focusedField === 'employmentCategory'
                                  ? '#6d2323'
                                  : '#8a4747',
                              transition: 'color 0.3s ease',
                            }}
                          />
                        </InputAdornment>
                      }
                    >
                      <MenuItem value={0}>Job Order</MenuItem>
                      <MenuItem value={1}>Regular</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Employee Number */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="employeeNumber"
                    label="Employee Number *"
                    type="number"
                    fullWidth
                    value={formData.employeeNumber}
                    onChange={handleChanges}
                    onFocus={() => setFocusedField('employeeNumber')}
                    onBlur={() => setFocusedField(null)}
                    InputLabelProps={{
                      required: false,
                      sx: { fontWeight: 600 },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeOutlined
                            sx={{
                              color:
                                focusedField === 'employeeNumber'
                                  ? '#6d2323'
                                  : '#8a4747',
                              transition: 'color 0.3s ease',
                            }}
                          />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      mt: 2.5,
                      '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button':
                        {
                          WebkitAppearance: 'none',
                          margin: 0,
                        },
                      '& input[type=number]': {
                        MozAppearance: 'textfield',
                      },
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                        },
                        '&:hover fieldset': {
                          borderColor: '#8a4747',
                          borderWidth: 2,
                        },
                        '&.Mui-focused': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(109, 35, 35, 0.15)',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#6d2323',
                          borderWidth: 2,
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#6d2323',
                        fontWeight: 700,
                      },
                    }}
                  />
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  name="password"
                  label="Password *"
                  type="password"
                  fullWidth
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChanges}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  InputLabelProps={{
                    required: false,
                    sx: { fontWeight: 600 },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined
                          sx={{
                            color:
                              focusedField === 'password'
                                ? '#6d2323'
                                : '#8a4747',
                            transition: 'color 0.3s ease',
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                      },
                      '&:hover fieldset': {
                        borderColor: '#8a4747',
                        borderWidth: 2,
                      },
                      '&.Mui-focused': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(109, 35, 35, 0.15)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#6d2323',
                        borderWidth: 2,
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#6d2323',
                      fontWeight: 700,
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                startIcon={<PersonAddAlt1 />}
                sx={{
                  bgcolor: '#6d2323',
                  py: 1.8,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  borderRadius: 2,
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(109, 35, 35, 0.3)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background:
                      'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    transition: 'left 0.5s ease',
                  },
                  '&:hover::before': {
                    left: '100%',
                  },
                  '&:hover': {
                    bgcolor: '#5a1e1e',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 8px 24px rgba(109, 35, 35, 0.4)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Register User
              </Button>

              <Button
                type="button"
                variant="contained"
                fullWidth
                startIcon={<GroupAdd />}
                sx={{
                  bgcolor: '#000',
                  py: 1.8,
                  fontSize: '1rem',
                  fontWeight: 700,
                  borderRadius: 2,
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background:
                      'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                    transition: 'left 0.5s ease',
                  },
                  '&:hover::before': {
                    left: '100%',
                  },
                  '&:hover': {
                    bgcolor: '#2a2a2a',
                    transform: 'translateY(-3px)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                  },
                  transition: 'all 0.3s ease',
                }}
                onClick={() => navigate('/bulk-register')}
              >
                Bulk Registration
              </Button>
            </Box>
          </form>
        </Paper>
      </Grow>
    </Container>
  );
};

export default Registration;
