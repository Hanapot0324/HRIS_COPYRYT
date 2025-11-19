import API_BASE_URL from "../../apiConfig";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  AccessTime,
  CalendarToday,
  Print,
  SaveOutlined,
  Search,
  SearchOutlined,
} from "@mui/icons-material";
import PrintIcon from "@mui/icons-material/Print";
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Container,
  Fade,
  IconButton,
  Paper,
  styled,
  TextField,
  Tooltip,
  Typography
} from "@mui/material";
import earistLogo from "../../assets/earistLogo.jpg";

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

const DailyTimeRecord = () => {
  const [personID, setPersonID] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [records, setRecords] = useState([]);
  const [employeeName, setEmployeeName] = useState("");
  const [officialTimes, setOfficialTimes] = useState({});
  
  // Color scheme
  const primaryColor = '#FEF9E1';
  const secondaryColor = '#FFF8E7';
  const accentColor = '#6d2323';
  const accentDark = '#8B3333';
  const grayColor = '#6c757d';

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };
  };

  useEffect(() => {
    // Retrieve and decode the token from local storage
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setPersonID(decoded.employeeNumber); // Set the employeeNumber in state
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/attendance/api/view-attendance`,
        {
          personID,
          startDate,
          endDate,
        },
        getAuthHeaders()
      );

      const data = response.data;

      if (data.length > 0) {
        // Set the records
        setRecords(data);

        // Extract and set the employee name from the first record
        const { firstName, lastName } = data[0];
        setEmployeeName(`${firstName} ${lastName}`);

        // Fetch official times separately using the personID
        await fetchOfficialTimes(personID);
      } else {
        setRecords([]);
        setEmployeeName("No records found");
        setOfficialTimes({});
      }
    } catch (err) {
      console.error(err);
    }
  };

  // New function to fetch official times
  const fetchOfficialTimes = async (employeeID) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/officialtimetable/${employeeID}`,
        getAuthHeaders() // ✅ Pass token headers
      );

      const data = response.data;

      // Map the official times by day
      const officialTimesMap = data.reduce((acc, record) => {
        acc[record.day] = {
          officialTimeIN: record.officialTimeIN,
          officialTimeOUT: record.officialTimeOUT,
          officialBreaktimeIN: record.officialBreaktimeIN,
          officialBreaktimeOUT: record.officialBreaktimeOUT,
        };
        return acc;
      }, {});

      setOfficialTimes(officialTimesMap);
    } catch (error) {
      console.error("Error fetching official times:", error);
      setOfficialTimes({});
    }
  };

  // Also fetch official times when personID changes (on component mount)
  useEffect(() => {
    if (personID) {
      fetchOfficialTimes(personID);
    }
  }, [personID]);

  const printPage = () => {
    const elementsToHide = document.querySelectorAll(".no-print");
    const sidebar = document.querySelector(".MuiDrawer-root");
    const header = document.querySelector(".header");

    if (sidebar) sidebar.style.display = "none";
    if (header) header.style.display = "none";

    elementsToHide.forEach((el) => (el.style.display = "none"));
    window.print();
    elementsToHide.forEach((el) => (el.style.display = ""));
    if (sidebar) sidebar.style.display = "";
    if (header) header.style.display = "";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString(undefined, options);
  };

  const formatMonth = (dateString) => {
    const date = new Date(dateString);
    const options = { month: "long" }; // Only include the month name
    return date.toLocaleDateString(undefined, options).toUpperCase();
  };

  const currentYear = new Date().getFullYear();
  const months = [
      "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
  ];

  const handleMonthClick = (monthIndex) => {
    const year = new Date().getFullYear();
    const start = new Date(Date.UTC(year, monthIndex, 1));
    const end = new Date(Date.UTC(year, monthIndex + 1, 0));

    const formattedStart = start.toISOString().substring(0, 10);
    const formattedEnd = end.toISOString().substring(0, 10);

    setStartDate(formattedStart);
    setEndDate(formattedEnd);
  };

  // Function to format the start date (Month DayNumber)
  const formatStartDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const options = { month: "long", day: "numeric" }; // e.g., October 1
    return date.toLocaleDateString("en-US", options);
  };

  // Function to format the end date (DayNumber, Year)
  const formatEndDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = date.getDate(); // Get the day number
    const year = date.getFullYear(); // Get the year
    return `${day}, ${year}`; // Format as "DayNumber, Year"
  };

  const formattedStartDate = formatStartDate(startDate);
  const formattedEndDate = formatEndDate(endDate);

  return (
    <Container maxWidth="xl" sx={{ py: 4, mt: -5 }}>
      <style>
        {`
          @media print {
            .no-print { 
              display: none !important;
            }

            .header { 
              display: none !important; 
            }

            .table-wrapper { 
              display: flex; 
              justify-content: center; 
              width: 100rem; 
              margin-top: -10rem; 
              padding-top: -5%;
              margin-left: -25.5rem;
              transform: scale(0.7);
              height: 100vh;
              
            }
            
            .table { 
              width: 50%; 
              border: 1px solid black; 
              border-collapse: collapse; 
            }

            .table-side-by-side {
              display: flex; 
              flex-direction: row; 
              gap: 1.5%
            }
          }

          @media print {
            .print-visible {
              display: block !important;
              page-break-before: avoid;
              margin-bottom: 0;
              margin-top: 0;

            }
              @media print {
              .header, .top-banner, .page-banner, header, footer {
                display: none !important;
                visibility: hidden !important;
                height: 0 !important;
                overflow: hidden !important;
              }
            }
              body {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }  
          }
        `}
      </style>
      
      <Box sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
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
                      <AccessTime sx={{color: accentColor, fontSize: 32 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1, lineHeight: 1.2, color: accentColor }}>
                        Daily Time Record
                      </Typography>
                      <Typography variant="body1" sx={{ opacity: 0.8, fontWeight: 400, color: accentDark }}>
                        Filter your DTR records by date
                      </Typography>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Chip 
                      label="Faculty Records" 
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
                        <AccessTime sx={{ fontSize: 24 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Box>
            </GlassCard>
          </Box>
        </Fade>

        {/* Search Section */}
        <Fade in timeout={700}>
          <GlassCard sx={{ mb: 4 }}>
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
              <CalendarToday sx={{ fontSize: "1.8rem", mr: 2 }} />
              <Box>
                <Typography variant="h7" sx={{ opacity: 0.9 }}>
                  Select date range to view records
                </Typography>
              </Box>
            </Box>

            <Box sx={{ p: 4 }}>
              {/* Month Buttons */}
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3, justifyContent: "center" }}>
                {months.map((month, index) => (
                  <ProfessionalButton
                    key={month}
                    variant="contained"
                    onClick={() => handleMonthClick(index)}
                    sx={{ 
                      backgroundColor: accentColor, 
                      color: primaryColor,
                      "&:hover": { backgroundColor: accentDark },
                      py: 0.5,
                      px: 1.5,
                      fontSize: '0.8rem'
                    }}
                  >
                    {month}
                  </ProfessionalButton>
                ))}
              </Box>

              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Box sx={{ minWidth: 225 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                    Employee Number
                  </Typography>
                  <ModernTextField
                    value={personID}
                    variant="outlined"
                    disabled
                    fullWidth
                  />
                </Box>

                <Box sx={{ minWidth: 225 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                    Start Date
                  </Typography>
                  <ModernTextField
                    label="Start Date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Box>

                <Box sx={{ minWidth: 225 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 1, color: accentColor }}>
                    End Date
                  </Typography>
                  <ModernTextField
                    label="End Date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                </Box>

                <ProfessionalButton
                  variant="contained"
                  onClick={fetchRecords}
                  startIcon={<SearchOutlined />}
                  sx={{ 
                    backgroundColor: accentColor, 
                    color: primaryColor,
                    "&:hover": { backgroundColor: accentDark },
                    py: 1.5,
                    px: 3
                  }}
                >
                  Search
                </ProfessionalButton>
              </Box>
            </Box>
          </GlassCard>
        </Fade>

        {/* Records Table */}
        <Fade in timeout={900}>
          <Paper
            elevation={4}
            sx={{
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              border: '1px solid rgba(109, 35, 35, 0.1)',
              mb: 4,
            }}
          >
            <Box sx={{ p: 5, overflowX: 'auto' }}>
              <div className="table-container">
                <div className="table-wrapper">
                  <div
                    style={{ display: "flex", gap: "2%", justifyContent: "center" }}
                    className="table-side-by-side"
                  >
                    <table
                      style={{
                        border: "1px solid black",
                        borderCollapse: "collapse",
                        width: "47%",
                      }}
                      className="print-visble"
                    >
                      <thead style={{ textAlign: "center", position: "relative" }}>
                        <tr>
                          <div
                            style={{
                              position: "absolute",
                              top: "1.5rem",
                              left: "50%",
                              transform: "translateX(-50%)",
                              fontWeight: "bold",
                              fontSize: "13px",
                            }}
                          >
                            Republic of the Philippines
                          </div>

                          <td
                            colSpan="1"
                            style={{
                              position: "relative",
                              padding: "0",
                              lineHeight: "0",
                              height: "0px",
                              textAlign: "right",
                              marginRight: "0",
                            }}
                          >
                            <img
                              src={earistLogo}
                              alt="EARIST Logo"
                              width="55"
                              height="55"
                              style={{
                                position: "absolute",
                                marginTop: "-14%",
                                left: "60%",
                              }}
                            />
                          </td>
                          <td colSpan="3">
                            <p
                              style={{
                                marginTop: "15%",
                                fontSize: "15px",
                                fontWeight: "bold",
                                textAlign: "center",
                                marginLeft: "20%",
                              }}
                            >
                              EULOGIO "AMANG" RODRIGUEZ <br /> INSTITUTE OF SCIENCE &
                              TECHNOLOGY
                            </p>
                          </td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="9">
                            <p
                              style={{
                                fontSize: "14px",
                                fontWeight: "bold",
                                lineHeight: "0",
                              }}
                            >
                              Nagtahan, Sampaloc Manila
                            </p>
                          </td>
                        </tr>
                        <tr>
                          <td colSpan="9">
                            <p
                              style={{
                                fontSize: "12px",
                                fontWeight: "bold",
                                lineHeight: "0",
                              }}
                            >
                              Civil Service Form No. 48
                            </p>
                          </td>
                        </tr>
                        <tr>
                          <td colSpan="9" style={{ padding: "2", lineHeight: "0" }}>
                            <h4>DAILY TIME RECORD</h4>
                          </td>
                        </tr>
                        <tr style={{ position: "relative" }}>
                          <td colSpan="3" style={{ padding: "2", lineHeight: "0" }}>
                            <p
                              style={{
                                fontSize: "15px",
                                margin: "0",
                                height: "20px",
                                textAlign: "left",
                                padding: "0 1rem",
                                marginTop: "6%",
                              }}
                            >
                              NAME: <b>{employeeName}</b>
                            </p>
                          </td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="5" style={{ padding: "2", lineHeight: "0" }}>
                            <p
                              style={{
                                fontSize: "15px",
                                margin: "0",
                                height: "10px",
                                paddingLeft: "1rem",
                                textAlign: "Left",
                              }}
                            >
                              Covered Dates:{" "}
                              <b>
                                {formattedStartDate} - {formattedEndDate}
                              </b>
                            </p>
                          </td>
                        </tr>
                        <tr>
                          <td
                            colSpan="3"
                            style={{ padding: "2", lineHeight: "2", textAlign: "left" }}
                          >
                            <p
                              style={{
                                fontSize: "15px",
                                margin: "0",
                                paddingLeft: "1rem",
                              }}
                            >
                              For the month of:{" "}
                              <b>{startDate ? formatMonth(startDate) : ""}</b>
                            </p>
                          </td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                        </tr>
                        <tr>
                          <td
                            style={{
                              fontSize: "15px",
                              margin: "0",
                              height: "10px",
                              position: "absolute",
                              paddingLeft: "1rem",
                              textAlign: "left",
                            }}
                          >
                            Official hours for arrival (regular day) and departure
                          </td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>

                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>

                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>

                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>

                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>

                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>

                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>
                        </tr>
                        <tr>
                          <td></td>
                          <td></td>

                          <td></td>
                        </tr>
                        <tr>
                          <td></td>
                          <td></td>
                          <td
                            style={{
                              position: "absolute",
                              display: "flex",
                              flexDirection: "column",
                              right: "50%",
                              gap: "1px",
                              paddingBottom: "5rem",
                            }}
                          >
                            Regular days M-TH
                          </td>
                          <td></td>
                          <td></td>

                          <tr
                            style={{
                              position: "absolute",
                              display: "flex",
                              flexDirection: "column",
                              right: "5%",
                              gap: "1px",
                              paddingBottom: "2rem",
                            }}
                          >
                            <td
                              style={{
                                fontSize: "15px",
                                fontWeight: "bold",
                                margin: "0",
                                height: "10px",
                                textAlign: "Left",
                                fontSize: "0.8rem",
                              }}
                            >
                              M -{" "}
                              {officialTimes["Monday"]?.officialTimeIN || "00:00:00"} -{" "}
                              {officialTimes["Monday"]?.officialTimeOUT || "00:00:00"}
                            </td>

                            <td
                              style={{
                                fontSize: "15px",
                                fontWeight: "bold",
                                margin: "0",
                                height: "10px",
                                textAlign: "left",
                                fontSize: "0.8rem",
                              }}
                            >
                              T -{" "}
                              {officialTimes["Tuesday"]?.officialTimeIN || "00:00:00"} -{" "}
                              {officialTimes["Tuesday"]?.officialTimeOUT || "00:00:00"}
                            </td>

                            <td
                              style={{
                                fontSize: "15px",
                                fontWeight: "bold",
                                margin: "0",
                                height: "10px",
                                textAlign: "Left",
                                fontSize: "0.8rem",
                              }}
                            >
                              W -{" "}
                              {officialTimes["Wednesday"]?.officialTimeIN || "00:00:00"}{" "}
                              -{" "}
                              {officialTimes["Wednesday"]?.officialTimeOUT ||
                                "00:00:00"}
                            </td>
                            <td
                              style={{
                                fontSize: "15px",
                                fontWeight: "bold",
                                margin: "0",
                                height: "10px",
                                textAlign: "left",
                                fontSize: "0.8rem",
                              }}
                            >
                              TH -{" "}
                              {officialTimes["Thursday"]?.officialTimeIN || "00:00:00"}{" "}
                              -{" "}
                              {officialTimes["Thursday"]?.officialTimeOUT || "00:00:00"}
                            </td>
                            <td
                              style={{
                                fontSize: "15px",
                                fontWeight: "bold",
                                margin: "0",
                                height: "10px",
                                textAlign: "Left",
                                fontSize: "0.8rem",
                              }}
                            >
                              F -{" "}
                              {officialTimes["Friday"]?.officialTimeIN || "00:00:00"} -{" "}
                              {officialTimes["Friday"]?.officialTimeOUT || "00:00:00"}
                            </td>
                            <td
                              style={{
                                fontSize: "15px",
                                fontWeight: "bold",
                                margin: "0",
                                height: "10px",
                                textAlign: "Left",
                                fontSize: "0.8rem",
                              }}
                            >
                              SAT -{" "}
                              {officialTimes["Saturday"]?.officialTimeIN || "00:00:00"}{" "}
                              -{" "}
                              {officialTimes["Saturday"]?.officialTimeOUT || "00:00:00"}
                            </td>
                            <td
                              style={{
                                fontSize: "15px",
                                fontWeight: "bold",
                                margin: "0",
                                height: "10px",
                                textAlign: "Left",
                                fontSize: "0.8rem",
                              }}
                            >
                              SUN -{" "}
                              {officialTimes["Sunday"]?.officialTimeIN || "00:00:00"} -{" "}
                              {officialTimes["Sunday"]?.officialTimeOUT || "00:00:00"}
                            </td>
                          </tr>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>

                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>

                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>

                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>
                        </tr>{" "}
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>

                          <td></td>
                        </tr>
                        <tr>
                          <td
                            colSpan="3"
                            style={{
                              position: "absolute",
                              display: "flex",
                              justifyContent: "left",
                              flexDirection: "column",
                              right: "58.2%",
                              gap: "1px",
                              paddingBottom: "5rem",
                            }}
                          >
                            Saturdays
                          </td>

                          <td></td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>

                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>

                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>

                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>

                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>

                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>

                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>

                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>
                        </tr>
                      </thead>
                      <tr>
                        <th
                          rowSpan="2"
                          style={{
                            textAlign: "center",
                            verticalAlign: "middle",
                            border: "1px solid black",
                          }}
                        >
                          DAY
                        </th>
                        <th colSpan="2" style={{ border: "1px solid black" }}>
                          A.M.
                        </th>
                        <th colSpan="2" style={{ border: "1px solid black" }}>
                          P.M.
                        </th>
                        <th style={{ border: "1px solid black" }}>Late</th>
                        <th style={{ border: "1px solid black" }}>Undertime</th>
                      </tr>
                      <tr style={{ textAlign: "center" }}>
                        <td style={{ border: "1px solid black" }}>Arrival</td>
                        <td style={{ border: "1px solid black" }}>Departure</td>
                        <td style={{ border: "1px solid black" }}>Arrival</td>
                        <td style={{ border: "1px solid black" }}>Departure</td>
                        <td style={{ border: "1px solid black" }}>Minutes</td>
                        <td style={{ border: "1px solid black" }}>Minutes</td>
                      </tr>

                      <tbody>
                        {Array.from({ length: 31 }, (_, i) => {
                          const day = (i + 1).toString().padStart(2, "0");
                          const record = records.find((r) =>
                            r.date.endsWith(`-${day}`)
                          );

                          return (
                            <tr key={i}>
                              <td
                                style={{
                                  border: "1px solid black",
                                  textAlign: "center",
                                }}
                              >
                                {day}
                              </td>
                              <td
                                style={{
                                  border: "1px solid black",
                                  textAlign: "center",
                                }}
                              >
                                {record?.timeIN || ""}
                              </td>
                              <td
                                style={{
                                  border: "1px solid black",
                                  textAlign: "center",
                                }}
                              >
                                {record?.breaktimeIN || ""}
                              </td>
                              <td
                                style={{
                                  border: "1px solid black",
                                  textAlign: "center",
                                }}
                              >                        
                                {record?.breaktimeOUT || ""}
                              </td>
                              <td
                                style={{
                                  border: "1px solid black",
                                  textAlign: "center",
                                }}
                              >
                                {record?.timeOUT || ""}
                              </td>
                              <td
                                style={{
                                  border: "1px solid black",
                                  textAlign: "center",
                                }}
                              >
                                {record?.minutes || ""}
                              </td>
                              <td
                                style={{
                                  border: "1px solid black",
                                  textAlign: "center",
                                }}
                              >
                                {record?.minutes || ""}
                              </td>
                            </tr>
                          );
                        })}
                        <tr>
                          <td colspan="9">
                            <div className="">
                              <br />
                              <hr
                                style={{
                                  borderTop: "3px solid black",
                                  width: "98%",
                                  margin: "0 auto",
                                }}
                              />
                              <p
                                style={{
                                  textAlign: "justify",
                                  width: "95%",
                                  margin: "0 auto",
                                  marginTop: "10px",
                                }}
                              >
                                I certify on my honor that the above is a true and
                                correct report of the hours of work performed, record of
                                which was made daily at the time of arrival and
                                departure from office.
                              </p>
                              <br />

                              <hr
                                style={{
                                  borderTop: "1px double black",
                                  width: "94%",
                                  margin: "0 auto",
                                }}
                              />
                              <p style={{ textAlign: "center", marginTop: "12px" }}>
                                Verified as to prescribe office hours.
                              </p>
                              <br />
                              <hr
                                style={{
                                  textAlign: "right",
                                  borderTop: "1px solid black",
                                  width: "94%",
                                  marginBottom: "20px",
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* 2nd TABLE */}

                    <table
                      style={{
                        border: "1px solid black",
                        borderCollapse: "collapse",
                        width: "47%",
                      }}
                      className="print-visble"
                    >
                      <thead style={{ textAlign: "center", position: "relative" }}>
                        <tr>
                          <div
                            style={{
                              position: "absolute",
                              top: "1.5rem",
                              left: "50%",
                              transform: "translateX(-50%)",
                              fontWeight: "bold",
                              fontSize: "13px",
                            }}
                          >
                            Republic of the Philippines
                          </div>

                          <td
                            colSpan="1"
                            style={{
                              position: "relative",
                              padding: "0",
                              lineHeight: "0",
                              height: "0px",
                              textAlign: "right",
                              marginRight: "0",
                            }}
                          >
                            <img
                              src={earistLogo}
                              alt="EARIST Logo"
                              width="55"
                              height="55"
                              style={{
                                position: "absolute",
                                marginTop: "-14%",
                                left: "60%",
                              }}
                            />
                          </td>
                          <td colSpan="3">
                            <p
                              style={{
                                marginTop: "15%",
                                fontSize: "15px",
                                fontWeight: "bold",
                                textAlign: "center",
                                marginLeft: "23%",
                              }}
                            >
                              EULOGIO "AMANG" RODRIGUEZ <br /> INSTITUTE OF SCIENCE &
                              TECHNOLOGY
                            </p>
                          </td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="9">
                            <p
                              style={{
                                fontSize: "14px",
                                fontWeight: "bold",
                                lineHeight: "0",
                              }}
                            >
                              Nagtahan, Sampaloc Manila
                            </p>
                          </td>
                        </tr>
                        <tr>
                          <td colSpan="9">
                            <p
                              style={{
                                fontSize: "12px",
                                fontWeight: "bold",
                                lineHeight: "0",
                              }}
                            >
                              Civil Service Form No. 48
                            </p>
                          </td>
                        </tr>
                        <tr>
                          <td colSpan="9" style={{ padding: "2", lineHeight: "0" }}>
                            <h4>DAILY TIME RECORD</h4>
                          </td>
                        </tr>
                        <tr style={{ position: "relative" }}>
                          <td colSpan="3" style={{ padding: "2", lineHeight: "0" }}>
                            <p
                              style={{
                                fontSize: "15px",
                                margin: "0",
                                height: "20px",
                                textAlign: "left",
                                padding: "0 1rem",
                                marginTop: "6%",
                              }}
                            >
                              NAME: <b>{employeeName}</b>
                            </p>
                          </td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="5" style={{ padding: "2", lineHeight: "0" }}>
                            <p
                              style={{
                                fontSize: "15px",
                                margin: "0",
                                height: "10px",
                                paddingLeft: "1rem",
                                textAlign: "Left",
                              }}
                            >
                              Covered Dates:{" "}
                              <b>
                                {formattedStartDate} - {formattedEndDate}
                              </b>
                            </p>
                          </td>
                        </tr>
                        <tr>
                          <td
                            colSpan="3"
                            style={{ padding: "2", lineHeight: "2", textAlign: "left" }}
                          >
                            <p
                              style={{
                                fontSize: "15px",
                                margin: "0",
                                paddingLeft: "1rem",
                              }}
                            >
                              For the month of:{" "}
                              <b>{startDate ? formatMonth(startDate) : ""}</b>
                            </p>
                          </td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                        </tr>
                        <tr>
                          <td
                            style={{
                              fontSize: "15px",
                              margin: "0",
                              height: "10px",
                              position: "absolute",
                              paddingLeft: "1rem",
                              textAlign: "left",
                            }}
                          >
                            Official hours for arrival (regular day) and departure
                          </td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>

                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>

                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>

                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>

                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>

                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>

                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>
                        </tr>
                        <tr>
                          <td></td>
                          <td></td>

                          <td></td>
                        </tr>
                        <tr>
                          <td></td>
                          <td></td>
                          <td
                            style={{
                              position: "absolute",
                              display: "flex",
                              flexDirection: "column",
                              right: "50%",
                              gap: "1px",
                              paddingBottom: "5rem",
                            }}
                          >
                            Regular days M-TH
                          </td>
                          <td></td>
                          <td></td>

                          <tr
                            style={{
                              position: "absolute",
                              display: "flex",
                              flexDirection: "column",
                              right: "5%",
                              gap: "1px",
                              paddingBottom: "2rem",
                            }}
                          >
                            <td
                              style={{
                                fontSize: "15px",
                                fontWeight: "bold",
                                margin: "0",
                                height: "10px",
                                textAlign: "Left",
                                fontSize: "0.8rem",
                              }}
                            >
                              M -{" "}
                              {officialTimes["Monday"]?.officialTimeIN || "00:00:00"} -{" "}
                              {officialTimes["Monday"]?.officialTimeOUT || "00:00:00"}
                            </td>

                            <td
                              style={{
                                fontSize: "15px",
                                fontWeight: "bold",
                                margin: "0",
                                height: "10px",
                                textAlign: "left",
                                fontSize: "0.8rem",
                              }}
                            >
                              T -{" "}
                              {officialTimes["Tuesday"]?.officialTimeIN || "00:00:00"} -{" "}
                              {officialTimes["Tuesday"]?.officialTimeOUT || "00:00:00"}
                            </td>

                            <td
                              style={{
                                fontSize: "15px",
                                fontWeight: "bold",
                                margin: "0",
                                height: "10px",
                                textAlign: "Left",
                                fontSize: "0.8rem",
                              }}
                            >
                              W -{" "}
                              {officialTimes["Wednesday"]?.officialTimeIN || "00:00:00"}{" "}
                              -{" "}
                              {officialTimes["Wednesday"]?.officialTimeOUT ||
                                "00:00:00"}
                            </td>
                            <td
                              style={{
                                fontSize: "15px",
                                fontWeight: "bold",
                                margin: "0",
                                height: "10px",
                                textAlign: "left",
                                fontSize: "0.8rem",
                              }}
                            >
                              TH -{" "}
                              {officialTimes["Thursday"]?.officialTimeIN || "00:00:00"}{" "}
                              -{" "}
                              {officialTimes["Thursday"]?.officialTimeOUT || "00:00:00"}
                            </td>
                            <td
                              style={{
                                fontSize: "15px",
                                fontWeight: "bold",
                                margin: "0",
                                height: "10px",
                                textAlign: "Left",
                                fontSize: "0.8rem",
                              }}
                            >
                              F -{" "}
                              {officialTimes["Friday"]?.officialTimeIN || "00:00:00"} -{" "}
                              {officialTimes["Friday"]?.officialTimeOUT || "00:00:00"}
                            </td>
                            <td
                              style={{
                                fontSize: "15px",
                                fontWeight: "bold",
                                margin: "0",
                                height: "10px",
                                textAlign: "Left",
                                fontSize: "0.8rem",
                              }}
                            >
                              SAT -{" "}
                              {officialTimes["Saturday"]?.officialTimeIN || "00:00:00"}{" "}
                              -{" "}
                              {officialTimes["Saturday"]?.officialTimeOUT || "00:00:00"}
                            </td>
                            <td
                              style={{
                                fontSize: "15px",
                                fontWeight: "bold",
                                margin: "0",
                                height: "10px",
                                textAlign: "Left",
                                fontSize: "0.8rem",
                              }}
                            >
                              SUN -{" "}
                              {officialTimes["Sunday"]?.officialTimeIN || "00:00:00"} -{" "}
                              {officialTimes["Sunday"]?.officialTimeOUT || "00:00:00"}
                            </td>
                          </tr>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>

                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>

                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>

                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>
                        </tr>{" "}
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>

                          <td></td>
                        </tr>
                        <tr>
                          <td
                            colSpan="3"
                            style={{
                              position: "absolute",
                              display: "flex",
                              justifyContent: "left",
                              flexDirection: "column",
                              right: "58.2%",
                              gap: "1px",
                              paddingBottom: "5rem",
                            }}
                          >
                            Saturdays
                          </td>

                          <td></td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>

                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>

                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>

                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>

                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>

                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>

                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>

                          <td></td>
                        </tr>
                        <tr>
                          <td colSpan="3"></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>{" "}
                          <tr>
                            <td colSpan="3"></td>
                            <td></td>
                            <td></td>

                            <td></td>
                          </tr>
                        </tr>
                      </thead>
                      <tr>
                        <th
                          rowSpan="2"
                          style={{
                            textAlign: "center",
                            verticalAlign: "middle",
                            border: "1px solid black",
                          }}
                        >
                          DAY
                        </th>
                        <th colSpan="2" style={{ border: "1px solid black" }}>
                          A.M.
                        </th>
                        <th colSpan="2" style={{ border: "1px solid black" }}>
                          P.M.
                        </th>
                        <th style={{ border: "1px solid black" }}>Late</th>
                        <th style={{ border: "1px solid black" }}>Undertime</th>
                      </tr>
                      <tr style={{ textAlign: "center" }}>
                        <td style={{ border: "1px solid black" }}>Arrival</td>
                        <td style={{ border: "1px solid black" }}>Departure</td>
                        <td style={{ border: "1px solid black" }}>Arrival</td>
                        <td style={{ border: "1px solid black" }}>Departure</td>
                        <td style={{ border: "1px solid black" }}>Minutes</td>
                        <td style={{ border: "1px solid black" }}>Minutes</td>
                      </tr>

                      <tbody>
                        {Array.from({ length: 31 }, (_, i) => {
                          const day = (i + 1).toString().padStart(2, "0");
                          const record = records.find((r) =>
                            r.date.endsWith(`-${day}`)
                          );

                          return (
                            <tr key={i}>
                              <td
                                style={{
                                  border: "1px solid black",
                                  textAlign: "center",
                                }}
                              >
                                {day}
                              </td>
                              <td
                                style={{
                                  border: "1px solid black",
                                  textAlign: "center",
                                }}
                              >
                                {record?.timeIN || ""}
                              </td>
                              <td
                                style={{
                                  border: "1px solid black",
                                  textAlign: "center",
                                }}
                              >
                                {record?.breaktimeIN || ""}
                              </td>
                              <td
                                style={{
                                  border: "1px solid black",
                                  textAlign: "center",
                                }}
                              >
                                {record?.breaktimeOUT || ""}
                              </td>
                              <td
                                style={{
                                  border: "1px solid black",
                                  textAlign: "center",
                                }}
                              >
                                {record?.timeOUT || ""}
                              </td>
                              <td
                                style={{
                                  border: "1px solid black",
                                  textAlign: "center",
                                }}
                              >
                                {record?.minutes || ""}
                              </td>
                              <td
                                style={{
                                  border: "1px solid black",
                                  textAlign: "center",
                                }}
                              >
                                {record?.minutes || ""}
                              </td>
                            </tr>
                          );
                        })}
                        <tr>
                          <td colspan="9">
                            <div className="">
                              <br />
                              <hr
                                style={{
                                  borderTop: "3px solid black",
                                  width: "98%",
                                  margin: "0 auto",
                                }}
                              />
                              <p
                                style={{
                                  textAlign: "justify",
                                  width: "95%",
                                  margin: "0 auto",
                                  marginTop: "10px",
                                }}
                              >
                                I certify on my honor that the above is a true and
                                correct report of the hours of work performed, record of
                                which was made daily at the time of arrival and
                                departure from office.
                              </p>
                              <br />

                              <hr
                                style={{
                                  borderTop: "1px double black",
                                  width: "94%",
                                  margin: "0 auto",
                                }}
                              />
                              <p style={{ textAlign: "center", marginTop: "12px" }}>
                                Verified as to prescribe office hours.
                              </p>
                              <br />
                              <hr
                                style={{
                                  textAlign: "right",
                                  borderTop: "1px solid black",
                                  width: "94%",
                                  marginBottom: "20px",
                                  marginRight: "20px",
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </Box>
          </Paper>
        </Fade>

        {/* Print Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 4 }}>
          <ProfessionalButton
            variant="contained"
            onClick={printPage}
            startIcon={<PrintIcon />}
            className="no-print"
            sx={{ 
              backgroundColor: accentColor, 
              color: primaryColor,
              "&:hover": { backgroundColor: accentDark },
              py: 1.5,
              px: 4
            }}
          >
            Print
          </ProfessionalButton>
        </Box>
      </Box>
    </Container>
  );
};

export default DailyTimeRecord;