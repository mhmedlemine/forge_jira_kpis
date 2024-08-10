import React, { useState, useEffect } from 'react';
import { Line } from "react-chartjs-2";
import { Chart, registerables } from 'chart.js';
import { fetchHistoricalKPIData } from '../utils/api';

export const LineChart = ({ kpiId, timeFrame, projectId, userId }) => {
    Chart.register(...registerables);
    const [data, setData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadHistoricalData();
    }, [kpiId, timeFrame, projectId, userId]);

    const loadHistoricalData = async () => {
        try {
            setIsLoading(true);
            const historicalData = await fetchHistoricalKPIData(kpiId, timeFrame, projectId, userId);
            setData(getChartData(historicalData));
            setError(null);
        } catch (err) {
            setError('Failed to load historical data. Please try again.');
            console.error('Error loading historical data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const getChartData = (historicalData) => {
        return {
            labels: historicalData.map(d => d.date),
            datasets: [
                {
                    label: "First dataset",
                    data: historicalData.map(d => d.value),
                    fill: true,
                    backgroundColor: "rgba(75,192,192,0.2)",
                    borderColor: "rgba(75,192,192,1)"
                }
            ]
        };
    }

    if (isLoading) return <p>Loading chart data...</p>;
    if (error) return <p>{error}</p>;

    return (
        <>
            <Line data={data} />
        </>
    );
};