import React from 'react';
import { Button, Typography, Box } from '@mui/material';
import { PictureAsPdf, TableChart, Description } from '@mui/icons-material';

const ReportDownload = ({ reportData, reportType }) => {
    const downloadReport = (format) => {
        let content = '';
        const fileName = `${reportType.replace(/\s+/g, '_')}_${new Date().toISOString()}.${format}`;

        if (format === 'csv') {
            content = convertToCSV(reportData);
        } else if (format === 'json') {
            content = JSON.stringify(reportData, null, 2);
        } else {
            console.error('Unsupported format');
            return;
        }

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);
    };

    const convertToCSV = (data) => {
        if (data.length === 0) return '';

        const header = Object.keys(data[0]).join(',') + '\n';
        const rows = data.map(obj => Object.values(obj).join(','));
        return header + rows.join('\n');
    };

    return (
        <Box sx={{ mt: 3 }}>
            <Button
                variant="contained"
                onClick={() => downloadReport('csv')}
                sx={{ mr: 1 }}
            >
                EXPORT CSV
            </Button>
            {/* <Button
                variant="contained"
                onClick={() => downloadReport('json')}
            >
                JSON
            </Button> */}
        </Box>
    );
}
export default ReportDownload;