import Grid from '@mui/material/Grid';
import { KPICard } from './KPICard';

export const KPIDisplay = ({ kpis, comparisonKPIs, isLoading, error, onKPIClick }) => {
    if (isLoading) {
        return <p>Loading KPIs...</p>;
    }

    if (error) {
        return <p>Error loading KPIs: {error}</p>;
    }

    if (!kpis || kpis.length === 0) {
        return <p>No KPIs available.</p>;
    }

    return (
        <>
            <h2>Key Performance Indicators</h2>
            <Grid container spacing={2}>
                {kpis.map(kpi => {
                    const comparisonKPI = comparisonKPIs?.find(cKpi => cKpi.id === kpi.id);
                    return (
                        <Grid item xs={4}>
                            <KPICard
                                key={kpi.id}
                                kpi={kpi}
                                comparisonKPI={comparisonKPI}
                                onClick={() => onKPIClick(kpi.id)}
                            />
                        </Grid>
                    );
                })}
            </Grid>
        </>
    );
};