import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const ReportTypes = ({ reportType, setReportType }) => {
    const reportTypes = [
        'Project Performance Report',
        'User Performance Report',
        'Issues Report',
    ];

    return (
        <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Report Type</InputLabel>
            <Select
                value={reportType}
                label="Report Type"
                onChange={(e) => setReportType(e.target.value)}
            >
                {reportTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                        {type}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}
export default ReportTypes;