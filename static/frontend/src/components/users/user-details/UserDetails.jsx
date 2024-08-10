import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress } from '@mui/material';
import UserKPI from './components/UserKpi';
import IssueDistributionCharts from './components/IssueDistributionCharts';
import KPITrends from './components/KPITrends';
import UserIssues from './components/UserIssues';
import { apiService } from '../../../utils/api';
import AppBarBack from '../../AppBarBack';

const UserDetails = ({ userKey, navigate }) => {
    const [loadingIssues, setLoadingIssues] = useState(false);
    const [user, setUser] = useState(null);
    const [kpis, setKpis] = useState(null);
    const [issues, setIssues] = useState([]);
    const [projects, setProjects] = useState([]);
    const [issuesByType, setIssuesByType] = useState(null);
    const [resolutionTimes, setResolutionTimes] = useState(null);
    const [cycleTimes, setCycleTimes] = useState(null);
    const [leadTimes, setLeadTimes] = useState(null);

    useEffect(() => {
        getUserDetails();
    }, []);

    const getUserIssues = async () => {
        setLoadingIssues(true);
        const issuesData = await apiService.getIssuesByUserKey(userKey);
        setIssues(issuesData.issues);
        setLoadingIssues(false);
    }

    const getUserDetails = async () => {
        try {
            const data = await apiService.getKPIsByUserKey(userKey);
            console.log("data:", data);
            setUser(data.user);
            setKpis(data.kpis);
            setProjects(data.projects);
            setIssuesByType(data.issuesByType);
            setResolutionTimes(data.resolutionTimes);
            setCycleTimes(data.cycleTimes);
            setLeadTimes(data.leadTimes);
            if (data.issues) {
                setIssues(data.issues);
            } else {
                getUserIssues();
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
        }
    };

    if (!user || !kpis) {
        return (
            <>
                <AppBarBack title={`User Details`} navigate={navigate} />
                <Typography>Loading...</Typography>
            </>
        );
    }

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <AppBarBack title="User Details" navigate={navigate} />
            <Typography variant="h4">{user.displayName}</Typography>

            <UserKPI kpis={kpis} projectsCount={projects.length} />

            <IssueDistributionCharts issues={issues} kpis={kpis} issuesByType={issuesByType} resolutionTimes={resolutionTimes} />

            <KPITrends issues={issues} kpis={kpis} cycleTimes={cycleTimes} leadTimes={leadTimes} />

            {loadingIssues ? (
                <Box><Typography variant="">Loading Issues</Typography> <CircularProgress size={20} /></Box>
            ) : ( 
                <UserIssues issues={issues} projects={projects} />
            )}
        </Box>
    );
};

export default UserDetails;