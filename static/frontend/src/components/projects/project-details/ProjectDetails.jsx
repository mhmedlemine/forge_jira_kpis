import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { apiService } from '../../../utils/api'
import ProjectOverview from './components/ProjectOverview';
import ProjectKPIs from './components/ProjectKPIs';
import SprintOverview from './components/SprintOverview';
import IssueDistribution from './components/IssueDistribution';
import TeamMembers from './components/TeamMembers';
import IssueTable from './components/IssueTable';
import AppBarBack from '../../AppBarBack';

const ProjectDetails = ({ projectKey, navigate }) => {
    const [project, setProject] = useState(null);
    const [kpis, setKpis] = useState(null);
    const [sprints, setSprints] = useState([]);
    const [currentSprint, setCurrentSprint] = useState(null);
    const [currentSprintTotalIssues, setCurrentSprintTotalIssues] = useState(0);
    const [currentSprintClosedIssues, setCurrentSprintClosedIssues] = useState(0);
    const [issues, setIssues] = useState([]);
    const [numberOfIssues, setNumberOfIssues] = useState(0);
    const [userKpis, setUserKpis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusCount, setStatusCount] = useState(null);
    const [typeCount, setTypeCount] = useState(null);
    const [issuesLoading, setIssuesLoading] = useState(false);

    useEffect(() => {
        getProjectDetails();
    }, [projectKey]);

    const getProjectIssues = async () => {
        setIssuesLoading(true);
        const isData = await apiService.getIssueByProjectKey(projectKey);
        setIssues(isData.issues);
        setIssuesLoading(false);
    }
    const getProjectDetails = async () => {
        setLoading(true);
        try {
            const data = await apiService.getKPIsByProjectKey(projectKey);
            console.log("data", data)
            setProject(data.project);
            setKpis(data.kpis);
            setSprints(data.sprints);
            setUserKpis(data.userKpis);
            setNumberOfIssues(data.numberofIssues);
            setCurrentSprint(data.currentSprint);
            setCurrentSprintTotalIssues(data.currentSprintTotalIssues);
            setCurrentSprintClosedIssues(data.currentSprintClosedIssues);
            setStatusCount(data.statusCount);
            setTypeCount(data.typeCount);
            if (data.issues) {
                setIssues(data.issues);
            } else {
                getProjectIssues();
            }
        } catch (error) {
            console.error('Error fetching project details:', error);
        }
        setLoading(false);
    };

    if (loading) {
        return (<>
            <AppBarBack title={`Project ${projectKey}` } navigate={navigate} />
            <div className="spinner-container">Loading...</div>
        </>);
    }

    return (
        <div className="project-details-container">
            <AppBarBack title={`Project ${projectKey}`} navigate={ navigate } />
            <h1>{projectKey}</h1>
            <ProjectOverview project={project} />
            {numberOfIssues === 0 ? (
                <h3>Key Performance Indicators: Project Has No Issues.</h3>
            ) : (
                <>
                    <ProjectKPIs kpis={kpis} />
                    <SprintOverview sprints={sprints} currentSprint={currentSprint} currentSprintTotalIssues={currentSprintTotalIssues} currentSprintClosedIssues={currentSprintClosedIssues} />
                    <IssueDistribution statusCount={statusCount} typeCount={typeCount} />
                    <TeamMembers userKpis={userKpis} />
                    {issuesLoading > 0 ? (
                        <Box><Typography variant="">Loading Issues</Typography> <CircularProgress size={20} /></Box>
                    ) : (
                        <IssueTable issues={issues} userKpis={userKpis} />
                    )}
                </>
            )}
        </div>
    );
};
export default ProjectDetails;