import React, { useState, useEffect } from 'react';
import { invoke } from '@forge/bridge';
import {
    Box,
    Typography,
    TextField,
    Button,
    List,
    ListItem,
    IconButton,
    CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function DefaultChecklistConfig() {
    const [defaultChecklist, setDefaultChecklist] = useState([]);
    const [newItem, setNewItem] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchDefaultChecklist();
    }, []);

    const fetchDefaultChecklist = async () => {
        const result = await invoke('getDefaultQAChecklist');
        console.log("result", result)
        setDefaultChecklist(result || []);
    };

    const handleAddItem = () => {
        if (newItem.trim()) {
            setDefaultChecklist([...defaultChecklist, { name: newItem.trim(), completed: false }]);
            setNewItem('');
        }
    };

    const handleRemoveItem = (index) => {
        setDefaultChecklist(defaultChecklist.filter((_, i) => i !== index));
    };

    const handleSaveDefaultChecklist = async () => {
        setIsLoading(true);
        try {
            console.log("defaultChecklist", defaultChecklist)
            await invoke('setDefaultQAChecklistAndUpdateProjects', { defaultChecklist });
            alert('Default checklist saved and all projects updated successfully!');
        } catch (error) {
            console.error('Failed to save default checklist and update projects:', error);
            alert('Failed to save default checklist and update projects. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Manage Default QA Checklist</Typography>
            <Box sx={{ display: 'flex', mb: 2 }}>
                <TextField
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    label="New Checklist Item"
                    variant="outlined"
                    size="small"
                    sx={{ flexGrow: 1, mr: 1 }}
                />
                <Button variant="contained" onClick={handleAddItem}>Add</Button>
            </Box>
            <List>
                {defaultChecklist.map((item, index) => (
                    <ListItem key={index} secondaryAction={
                        <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveItem(index)}>
                            <DeleteIcon />
                        </IconButton>
                    }>
                        <Typography>{item.name}</Typography>
                    </ListItem>
                ))}
            </List>
            <Button variant="contained" color="primary" onClick={handleSaveDefaultChecklist}>
                Save Checklist
            </Button>
        </Box>
    );
}

export default DefaultChecklistConfig;