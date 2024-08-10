import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { helpers } from '../../../utils/helpers';

const UserComparison = ({
    userKpis,
    selectedComparison,
    setSelectedComparison
}) => {    

    const getComparisonData = () => {
        const labels = userKpis.map(kpi => kpi.user);
        let data;
        let label;

        switch (selectedComparison) {
            case 'total-issues':
                data = userKpis.map(kpi => kpi.totalIssues);
                label = 'Total Issues';
                break;
            case 'resolved-issues':
                data = userKpis.map(kpi => kpi.closedIssues);
                label = 'Resolved Issues';
                break;
            case 'resolution-rate':
                data = userKpis.map(kpi => kpi.resolutionRate);
                label = 'Resolution Rate (%)';
                break;
            case 'lead-time':
                data = userKpis.map(kpi => kpi.leadTime);
                label = 'Average Lead Time (days)';
                break;
            case 'cycle-time':
                data = userKpis.map(kpi => kpi.cycleTime);
                label = 'Average Cycle Time (days)';
                break;
            default:
                data = [];
                label = '';
        }

        return { labels, data, label };
    };

    const { labels, data, label } = getComparisonData();

    const chartData = {
        labels,
        datasets: [
            {
                label,
                data,
                backgroundColor: helpers.random_rgba(),
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <Box>
            <h2>User Comparison</h2>
            <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Comparison Metric</InputLabel>
                <Select
                    value={selectedComparison}
                    onChange={(e) => setSelectedComparison(e.target.value)}
                >
                    <MenuItem value="total-issues">Total Issues</MenuItem>
                    <MenuItem value="resolved-issues">Resolved Issues</MenuItem>
                    <MenuItem value="resolution-rate">Resolution Rate</MenuItem>
                    <MenuItem value="lead-time">Average Lead Time</MenuItem>
                    <MenuItem value="cycle-time">Average Cycle Time</MenuItem>
                </Select>
            </FormControl>
            <Bar data={chartData} options={chartOptions} />
        </Box>
    );
}
export default UserComparison;