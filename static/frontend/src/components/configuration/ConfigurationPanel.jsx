import React, { useState } from 'react';
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

const ConfigurationPanel = (props) => {
    const [loading, setLoading] = useState(false);
    const deleteCache = async () => {
        setLoading(true)
        try {
            await apiService.deleteAllStorage();
        } catch (error) {
            console.log("error deleting cache", error)
        }
        setLoading(false);
    }

    return (
        <>
            <h1>Configurations</h1>
            {loading && <CircularProgress size={20} />}
            <Button variant="contained" onClick={deleteCache} fullWidth>
                DELETE CACHE
            </Button>
        </>
    );
};

export default ConfigurationPanel;