import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Tooltip from '@mui/material/Tooltip';
import { Fragment } from 'react';

export const KPICard = ({ kpi, comparisonKPI, onClick }) => {
    const { id, name, value, description } = kpi;

    const getTrendData = () => {
        if (!comparisonKPI) return null;
        const diff = value - comparisonKPI.value;
        const percentage = ((diff / comparisonKPI.value) * 100).toFixed(2);
        return {
            trend: diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable',
            percentage: Math.abs(percentage)
        };
    };

    const trendData = getTrendData();

    const getTrendColor = (trend) => {
        if (trend === 'up') return 'success';
        if (trend === 'down') return 'removed';
        return 'default';
    };

    const getTrendIcon = (trend) => {
        if (trend === 'up') return '↑';
        if (trend === 'down') return '↓';
        return '→';
    };

    return (
        <>
            <Box>
                <Card variant="elevation" onClick={onClick}>
                    <Tooltip title={description}>
                        <Fragment>
                            <h3>{name}</h3>
                            <h2>{value}</h2>
                            {trendData && (
                                <Typography sx={{ mb: 1.5 }} >
                                    `${getTrendIcon(trendData.trend)} ${trendData.percentage}%`
                                </Typography>
                            )}
                        </Fragment>
                    </Tooltip>
                </Card>
            </Box>
        </>
    );
};