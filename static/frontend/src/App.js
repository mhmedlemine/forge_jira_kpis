import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import React, { useEffect, useState } from "react";
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import ConfigurationPanel from "./components/configuration/ConfigurationPanel";
import Dashboard from './components/Dashboard';
import Projects from "./components/projects/Projects";
import ProjectDetails from './components/projects/project-details/ProjectDetails';
import Users from './components/users/Users';
import UserDetails from './components/users/user-details/UserDetails';
import Reports from './components/reports/Reports';
import { helpers } from './utils/helpers';
import { darkTheme, lightTheme } from './constants/themes';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { apiService } from './utils/api';

function App() {
  const [theme, setTheme] = useState(lightTheme);
  const [currentView, setCurrentView] = useState('main');
  const [viewParams, setViewParams] = useState({});
  const [tabIndex, setTabIndex] = React.useState('1');
  const [config, setConfig] = useState(null);
  const [allIssues, setAllIssues] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canAccessConfig, setCanAccessConfig] = useState(false);
  const [canAccessApp, setCanAccessApp] = useState(false);
  const [isQaTeam, setIsQaTeam] = useState(false);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      setIsLoading(true);
      const data = await apiService.checkAdminStatus();
      console.log("data", data)
      setCanAccessConfig(data.groups.items.some(group => group.name === 'site-admins'));
      setCanAccessApp(data.groups.items.some(group => group.name === 'smart_jira_kpis_users'));
      setIsQaTeam(data.groups.items.some(group => group.name === 'smart-qa-team'));
      setIsLoading(false);
    };
    checkAdminStatus();
  }, []);

  useEffect(() => {
    const applyTheme = async () => {
      const jiraTheme = await helpers.getJiraTheme();
      setTheme(jiraTheme.colorMode === 'dark' ? darkTheme : lightTheme);
      console.log('jiraTheme', jiraTheme);
    };
    applyTheme();

    // loadConfig();
  }, []);

  useEffect(() => {
    loadAllIssues(); 
    // loadConfig();
  }, []);
  const loadAllIssues = async () => {
    setIsLoading(true);
    try {
      const issues = await apiService.fetchAllIssuess({});
      setAllIssues(issues);
      setError(null);
    } catch (err) {
      console.error('Error loading configuration:', err);
      setError(`Failed to load configuration: ${err.message}`);
    }
    setIsLoading(false);
  };

  const loadConfig = async () => {
    try {
      //await apiService.deleteAllStorage();
      setIsLoading(true);
      //const fetchedConfig = await fetchConfig();
      //setConfig(fetchedConfig);
      setIsLoading(false);
      setError(null);
    } catch (err) {
      console.error('Error loading configuration:', err);
      setError(`Failed to load configuration: ${err.message}`);
      setIsLoading(false);
    }
  };

  const handleTabChange = (event, newIndex) => {
    setTabIndex(newIndex);
  };

  const navigate = (view, params = {}) => {
    setCurrentView(view);
    setViewParams(params);
  };

  if (!canAccessApp && !isLoadingPermissions) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <p>You do not have permission to access this page.</p>
      </ThemeProvider>
    );
  }

  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <p>Loading...</p>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <p>Error: {error}</p>
      </ThemeProvider>
    );
  }
  
  const renderRoute = () => {
    if (currentView === 'project-details') {
      return <ProjectDetails projectKey={viewParams.projectKey} navigate={navigate} />;
    }
    if (currentView === 'user-details') {
      return <UserDetails userKey={viewParams.userKey} navigate={navigate} />;
    }
    
    return (
      <Box sx={{ width: '100%', typography: 'body1' }}>
        <TabContext value={tabIndex}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList onChange={handleTabChange} aria-label="Main Menu">
              <Tab label="Global Dashboard" value="1" />
              <Tab label="Projects" value="2" />
              <Tab label="Users" value="3" />
              <Tab label="Reports" value="4" />
              <Tab label="Configuration" value="5" />
            </TabList>
          </Box>
          <TabPanel value="1"><Dashboard allIssues={allIssues} /></TabPanel>
          <TabPanel value="2"><Projects navigate={navigate} /></TabPanel>
          <TabPanel value="3"><Users navigate={navigate} /></TabPanel>
          <TabPanel value="4"><Reports /></TabPanel>
          <TabPanel value="5"><ConfigurationPanel /></TabPanel>
        </TabContext>
      </Box>
    );
  };
  
  return (
    <ThemeProvider theme={theme}>
      {/* <CssBaseline /> */}
      {renderRoute()}
    </ThemeProvider>
  );

}
export default App;
