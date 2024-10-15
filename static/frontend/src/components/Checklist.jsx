import React, { useEffect, useState } from 'react';
import { invoke, view } from '@forge/bridge';
import {
    Box,
    Typography,
    Checkbox,
    FormControlLabel,
    List,
    ListItem,
    Paper,
    Button,
    CircularProgress
} from '@mui/material';
import { apiService } from '../utils/api';

const Checklist = () => {
    const [projectStatus, setProjectStatus] = useState('');
    const [qaCheckList, setQACheckList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [canAccessConfig, setCanAccessConfig] = useState(false);
    const [isQaTeam, setIsQaTeam] = useState(false);
    const [project, setProject] = useState(null);

    useEffect(() => {
        const checkAdminStatus = async () => {
          setLoading(true);
          const data = await apiService.checkAdminStatus();
          console.log("data", data)
          setCanAccessConfig(data.groups.items.some(group => group.name === 'site-admins'));
          setIsQaTeam(data.groups.items.some(group => group.name === 'smart-qa-team'));
          setLoading(false);
        };
        checkAdminStatus();
      }, []);

    useEffect(() => {
        const getProjectContext = async () => {
            const context = await view.getContext();
            console.log("project", context.extension.project)
            if (context && context.extension && context.extension.project.id) {
                setProject(context.extension.project);
            }
        };
        getProjectContext();
    }, []);

    useEffect(() => {
        if (project) {
            fetchProjectProperties();
        }
    }, [project]);

    const fetchProjectProperties = async () => {
        setLoading(true);
        try {
            const result = await invoke('getProjectProperties', { projectId: project.id });
            console.log("result", result.qaCheckList)
            setProjectStatus(result.projectStatus);
            setQACheckList(result.qaCheckList.checklist || []);
        } catch (error) {
            console.error('Error fetching project properties:', error);
        }
        setLoading(false);
    };

    const handleCheckboxChange = async (index) => {
        const updatedChecklist = qaCheckList.map((item, i) =>
            i === index ? { ...item, completed: !item.completed } : item
        );
        setQACheckList(updatedChecklist);
        
        try {
            await invoke('updateQACheckList', { projectId: project.id, updatedChecklist });
        } catch (error) {
            console.error('Error updating QA checklist:', error);
        }
        fetchProjectProperties();
    };
    const handleUpdateProjectStatus = async () => {
        try {
            await invoke('moveProjectStatusToProd', { projectId: project.id });
        } catch (error) {
            console.error('Error updating QA checklist:', error);
        }
        fetchProjectProperties();
    };


    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!canAccessConfig && !isQaTeam) {
        return (
            <p>You do not have access to veiw this page.</p>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>Project: {project.key}</Typography>
            <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6">Project Status: {projectStatus.status}</Typography>
                {(projectStatus.status === "Ready for Prod" && canAccessConfig) && 
                <Button variant="contained" color="primary" onClick={handleUpdateProjectStatus}>
                    Move To Prod
                </Button>}
            </Paper>
            <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>QA Checklist:</Typography>
                <List>
                    {qaCheckList.map((item, index) => (
                        <ListItem key={index} disablePadding>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        disabled={!isQaTeam || projectStatus.status !== "development"}
                                        checked={item.completed}
                                        onChange={() => handleCheckboxChange(index)}
                                    />
                                }
                                label={item.name}
                            />
                        </ListItem>
                    ))}
                </List>
            </Paper>
        </Box>
    );
}

export default Checklist;