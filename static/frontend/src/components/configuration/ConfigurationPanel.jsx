import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import Alert from '@mui/material/Alert';
import { apiService, saveConfig } from '../../utils/api';
import { kpiDefinitions } from '../../constants/kpiDefinitions';
import DefaultChecklistConfig from './DefaultChecklistConfig';

const ConfigurationPanel = () => {
    const [loading, setLoading] = useState(false);
    const [canAccessConfig, setCanAccessConfig] = useState(false);

    const deleteCache = async () => {
        setLoading(true)
        try {
            await apiService.deleteAllStorage();
        } catch (error) {
            console.log("error deleting cache", error);
        }
        setLoading(false);
    }

    useEffect(() => {
        const checkAdminStatus = async () => {
          setLoading(true);
          const data = await apiService.checkAdminStatus();
          console.log("data", data)
          setCanAccessConfig(data.groups.items.some(group => group.name === 'site-admins'));
          setLoading(false);
        };
        checkAdminStatus();
      }, []);

    if (loading) {
        return (<p>Loading...</p>);
    }

    if (!canAccessConfig) {
        return (<p>You do not have permission to access this page.</p>);
    }

    return (
        <>
            <h1>Configurations</h1>
            {loading && <CircularProgress size={20} />}
            <div className="w-full h-screen flex items-center justify-center bg-gray-100">
                <iframe
                    title="Jira-Projects-Dashboard"
                    width="1140"
                    height="541.25"
                    src="https://app.powerbi.com/view?r=eyJrIjoiZTVjYWFjZmMtYjE4OS00ODdiLTg1Y2YtYjcyYzRiYTk4NDdkIiwidCI6IjMwZjRjYzhmLThlOWQtNDA2My05MzU4LWY3ZmZkZTg0ODViZiJ9"
                    frameBorder="0"
                    allowFullScreen={true}
                    className="shadow-lg rounded-lg"
                />
            </div>
            {/* <DefaultChecklistConfig /> */}
            {/* <Button variant="contained" onClick={deleteCache} fullWidth>
                DELETE CACHE
            </Button> */}
        </>
    );
};

export default ConfigurationPanel;