import React from 'react';
import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const ReportPreview = ({ reportData, reportType }) => {
    if (!reportData || reportData.length === 0) {
        return <Typography>No data available for preview.</Typography>;
    }

    const renderTable = () => (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        {Object.keys(reportData[0]).map((key) => {
                            if (typeof reportData[0][key] !== 'object') {
                                return (
                                    <TableCell key={key}>{key}</TableCell>
                                )
                            }
                        })}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {reportData.map((row, index) => (
                        <TableRow key={index}>
                            {Object.values(row).map((value, i) => {
                                if (typeof value !== 'object') {
                                    return (
                                        <TableCell key={i}>{value}</TableCell>
                                    )
                                }
                            })}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

    const renderChart = () => {
        let labels, datasets;

        switch (reportType) {
            case 'Project Performance Report':
                labels = reportData.map(item => item.project);
                datasets = [
                    {
                        label: 'Resolved Issues',
                        data: reportData.map(item => item.resolvedIssues),
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    },
                    {
                        label: 'Total Issues',
                        data: reportData.map(item => item.totalIssues),
                        backgroundColor: 'rgba(153, 102, 255, 0.6)',
                    }
                ];
                break;
            case 'User Performance Report':
                labels = reportData.map(item => item.user);
                datasets = [
                    {
                        label: 'Resolved Issues',
                        data: reportData.map(item => item.resolvedIssues),
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    },
                    {
                        label: 'Total Issues',
                        data: reportData.map(item => item.totalIssues),
                        backgroundColor: 'rgba(153, 102, 255, 0.6)',
                    }
                ];
                break;
            case 'Issues Report':
                const statusCounts = reportData.reduce((acc, issue) => {
                    acc[issue.status] = (acc[issue.status] || 0) + 1;
                    return acc;
                }, {});
                labels = Object.keys(statusCounts);
                datasets = [
                    {
                        label: 'Issue Count',
                        data: Object.values(statusCounts),
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    }
                ];
                break;
            default:
                return null;
        }

        const data = { labels, datasets };

        const options = {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: reportType,
                },
            },
        };

        return <Bar options={options} data={data} />;
    };

    return (
        <Paper elevation={2} sx={{ p: 2, my: 3 }}>
            <Typography variant="h6" gutterBottom>Report Preview</Typography>
            {/* <div style={{ height: 300, marginBottom: 20 }}>
                {renderChart()}
            </div> */}
            {renderTable()}
        </Paper>
    );
}
export default ReportPreview;