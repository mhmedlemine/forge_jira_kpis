import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { helpers } from '../../../utils/helpers';

const ProjectComparison = ({
    projectKpis,
    selectedComparison,
    setSelectedComparison
}) => {    

    const getComparisonData = () => {
        const labels = projectKpis.map(kpi => kpi.project);
        let data;
        let label;

        switch (selectedComparison) {
            case 'total-issues':
                data = projectKpis.map(kpi => kpi.totalIssues);
                label = 'Total Issues';
                break;
            case 'resolved-issues':
                data = projectKpis.map(kpi => kpi.closedIssues);
                label = 'Resolved Issues';
                break;
            case 'resolution-rate':
                data = projectKpis.map(kpi => kpi.resolutionRate);
                label = 'Resolution Rate (%)';
                break;
            case 'lead-time':
                data = projectKpis.map(kpi => kpi.leadTime);
                label = 'Average Lead Time (days)';
                break;
            case 'cycle-time':
                data = projectKpis.map(kpi => kpi.cycleTime);
                label = 'Average Cycle Time (days)';
                break;
            case 'sprint-velocity':
                data = projectKpis.map(kpi => kpi.sprintVelocity);
                label = 'Average Sprint Velocity (story points)';
                break;
            case 'defect-density':
                data = projectKpis.map(kpi => kpi.avgProjectDefectDensity);
                label = 'Average Defect Density (%)';
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
            <h2>Project Comparison</h2>
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
                    <MenuItem value="sprint-velocity">Average Sprint Velocity</MenuItem>
                    <MenuItem value="defect-density">Average Defect Density</MenuItem>
                </Select>
            </FormControl>
            <Bar data={chartData} options={chartOptions} />
        </Box>
    );
}
export default ProjectComparison;