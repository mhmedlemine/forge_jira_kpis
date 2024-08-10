import React from 'react';
import { Paper, Grid, Typography } from '@mui/material';
import ChartComponent from '../../../ChartComponent';

const KPITrends = ({ issues, kpis, cycleTimes, leadTimes }) => {
    const prepareCycleLeadTimeData = () => {
        console.log("cycleTimes", cycleTimes)
        console.log("leadTimes", leadTimes)
        if (!cycleTimes && !leadTimes) {
            cycleTimes = [];
            leadTimes = [];
    
            issues.forEach(issue => {
                if (issue.resolutiondate) {
                    const createdDate = new Date(issue.created);
                    const resolutionDate = new Date(issue.resolutiondate);
                    const leadTime = (resolutionDate - createdDate) / (1000 * 60 * 60 * 24);
                    leadTimes.push({
                        date: resolutionDate.toISOString().split('T')[0],
                        time: leadTime
                    });
    
                    if (issue.startdate) {
                        const startDate = new Date(issue.startdate);
                        const cycleTime = (resolutionDate - startDate) / (1000 * 60 * 60 * 24);
                        cycleTimes.push({
                            date: resolutionDate.toISOString().split('T')[0],
                            time: cycleTime
                        });
                    }
                }
            });

        }


        const sortedCycleTimes = cycleTimes ? cycleTimes.sort((a, b) => new Date(a.date) - new Date(b.date)) : [];
        const sortedLeadTimes = leadTimes ? leadTimes.sort((a, b) => new Date(a.date) - new Date(b.date)) : [];

        return {
            labels: sortedCycleTimes.map(ct => ct.date),
            datasets: [
                {
                    label: 'Cycle Time (days)',
                    data: sortedCycleTimes.map(ct => ct.time),
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    fill: false
                },
                {
                    label: 'Lead Time (days)',
                    data: sortedLeadTimes.map(lt => lt.time),
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                    fill: false
                }
            ]
        };
    };

    return (
        <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="h5" gutterBottom>KPI Trends</Typography>
            <Typography variant="h6" gutterBottom>Cycle Time and Lead Time</Typography>
            <Typography variant="subtitle1">
                Average Cycle Time: {kpis.cycleTime} days
            </Typography>
            <Typography variant="subtitle1">
                Average Lead Time: {kpis.leadTime} days
            </Typography>
            <ChartComponent type="line" data={prepareCycleLeadTimeData()} />
        </Paper>
    );
};

export default KPITrends;