import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Snackbar, Alert } from '@mui/material';
import ReportTypes from './components/ReportTypes';
import ReportFilters from './components/ReportFilters';
import ReportPreview from './components/ReportPreview';
import ReportDownload from './components/ReportDownload';
import ReportScheduling from './components/ReportScheduling';
import { apiService } from '../../utils/api';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [error, setError] = useState(null);
  const [reportType, setReportType] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState([]);
  const [issueTypes, setIssueTypes] = useState([]);
  const [selectedIssueType, setSelectedIssueType] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [selectedSprint, setSelectedSprint] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [selectedPriority, setSelectedPriority] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await getReportFiltersData();
      setLoading(false);
    };
    fetchData();
  }, []);

  const getReportFiltersData = async () => {
    try {
      const data = await apiService.getReportFiltersData();
      setProjects(data.projects);
      setUsers(data.users);
      setSprints(data.sprints);
      setIssueTypes(data.issueTypes);
      setPriorities(data.issuePriorities);
      setStatuses(data.issuesStatuses);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const generateReport = async () => {
    setLoadingReport(true);
    setError(null);
    try {
      const filters = {
        reportType,
        startDate,
        endDate,
        projectIds: selectedProject,
        userIds: selectedUser,
        issueTypes: selectedIssueType,
        sprintIds: selectedSprint,
        priorities: selectedPriority,
        statuses: selectedStatus
      };

      const data = await apiService.generateReport(filters);
      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Failed to generate report. Please try again.');
    } finally {
      setLoadingReport(false);
    }
  };

  if (loading) {
    return (
      <p>Loading...</p>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 3, my: 3 }}>
        <Typography variant="h4" gutterBottom>Reports</Typography>
        <ReportTypes reportType={reportType} setReportType={setReportType} />
        <ReportFilters
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          projects={projects}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          users={users}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          issueTypes={issueTypes}
          selectedIssueType={selectedIssueType}
          setSelectedIssueType={setSelectedIssueType}
          sprints={sprints}
          selectedSprint={selectedSprint}
          setSelectedSprint={setSelectedSprint}
          priorities={priorities}
          selectedPriority={selectedPriority}
          setSelectedPriority={setSelectedPriority}
          statuses={statuses}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          generateReport={generateReport}
          isLoading={loadingReport}
        />
        {reportData && <ReportDownload reportData={reportData} reportType={reportType} />}
        {reportData && <ReportPreview reportData={reportData} reportType={reportType} />}
        <ReportScheduling filters={
            {
              reportType,
              startDate,
              endDate,
              projectIds: selectedProject,
              userIds: selectedUser,
              issueTypes: selectedIssueType,
              sprintIds: selectedSprint,
              priorities: selectedPriority,
              statuses: selectedStatus
            }
          } 
        />
      </Paper>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}
export default Reports;