import React, { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { apiService } from '../utils/api';
import {
    Card,
    CardContent,
    CardHeader,
    CircularProgress,
    FormControl,
    MenuItem,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
} from '@mui/material';

Chart.register(...registerables);

const Dashboard = ({ allIssues }) => {
    const [kpiOverview, setKpiOverview] = useState({
        activeProjects: 0,
        activeMembers: 0,
        totalIssues: 0,
        openIssues: 0,
        closedIssues: 0,
        leadTime: 0,
        cycleTime: 0,
        sprintVelocity: 0,
        defectDensity: 0,
    });

    const [loading, setLoading] = useState({
        kpiOverview: true,
        resolutionTimeChart: true,
        sprintVelocityChart: true,
        defectDensityChart: true,
    });

    const [selectedRanges, setSelectedRanges] = useState({
        resolutionTime: '30',
        sprintVelocity: '5',
        defectDensity: '30',
    });

    const [resolutionTimeChartData, setResolutionTimeChartData] = useState(null);
    const [sprintVelocityChartData, setSprintVelocityChartData] = useState(null);
    const [defectDensityChartData, setDefectDensityChartData] = useState(null);

    const resolutionTimeChartRef = useRef(null);
    const sprintVelocityChartRef = useRef(null);
    const defectDensityChartRef = useRef(null);
    const resolutionTimeChartInstance = useRef(null);
    const sprintVelocityChartInstance = useRef(null);
    const defectDensityChartInstance = useRef(null);

    const [projectData, setProjectData] = useState([]);
    const [projectPage, setProjectPage] = useState(0);
    const [projectRowsPerPage, setProjectRowsPerPage] = useState(5);
    
    const [userData, setUserData] = useState([]);
    const [userPage, setUserPage] = useState(0);
    const [userRowsPerPage, setUserRowsPerPage] = useState(5);

    useEffect(() => {
        getAll();
    }, []);

    const getAll = async () => {
        // const issues = await apiService.fetchAllIssuess({});
        getKpiOverview(allIssues);
        getResolutionTimeChartData();
        getSprintVelocityChartData();
        getDefectDensityChartData();
    };

    useEffect(() => {
        if (resolutionTimeChartData) {
            initResolutionTimeChart();
        }
        if (sprintVelocityChartData) {
            initSprintVelocityChart();
        }
        if (defectDensityChartData) {
            initDefectDensityChart();
        }

        return () => {
            if (resolutionTimeChartInstance.current) {
                resolutionTimeChartInstance.current.destroy();
            }
            if (sprintVelocityChartInstance.current) {
                sprintVelocityChartInstance.current.destroy();
            }
            if (defectDensityChartInstance.current) {
                defectDensityChartInstance.current.destroy();
            }
        };
    }, [resolutionTimeChartData, sprintVelocityChartData, defectDensityChartData]);

    const getKpiOverview = async (issues) => {
        setLoading(prev => ({ ...prev, kpiOverview: true }));
        try {
            const data = await apiService.fetchKPIsOverview(issues);
            console.log("data", data)
            setKpiOverview(data.kpisOverview);
            setProjectData(data.projectKpis);
            setUserData(data.userKpis);
        } catch (error) {
            console.error('Error fetching KPI overview:', error);
        }
        setLoading(prev => ({ ...prev, kpiOverview: false, projectsKpiOverview: false }));
    };

    const getResolutionTimeChartData = async () => {
        setLoading(prev => ({ ...prev, resolutionTimeChart: true }));
        try {
            const data = await apiService.fetchResolutionTimeChartData(selectedRanges.resolutionTime);
            setResolutionTimeChartData(data);
        } catch (error) {
            console.error('Error fetching resolution chart data:', error);
        }
        setLoading(prev => ({ ...prev, resolutionTimeChart: false }));
    };
    
    const getSprintVelocityChartData = async () => {
        setLoading(prev => ({ ...prev, sprintVelocityChart: true }));
        try {
            const data = await apiService.fetchSprintVelocityChartData(selectedRanges.sprintVelocity);
            setSprintVelocityChartData(data)
        } catch (error) {
            console.error('Error fetching sprint velocity chart data:', error);
        }
        setLoading(prev => ({ ...prev, sprintVelocityChart: false }));
    };

    const getDefectDensityChartData = async () => {
        setLoading(prev => ({ ...prev, defectDensityChart: true }));
        try {
            const data = await apiService.fetchDefectDensityChartData(selectedRanges.defectDensity);
            setDefectDensityChartData(data)
        } catch (error) {
            console.error('Error fetching defect densiyt chart data:', error);
        }
        setLoading(prev => ({ ...prev, defectDensityChart: false }));
    };

    const initResolutionTimeChart = () => {
        const ctx = resolutionTimeChartRef.current.getContext('2d');

        if (resolutionTimeChartInstance.current) {
            resolutionTimeChartInstance.current.destroy();
        }

        resolutionTimeChartInstance.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels: resolutionTimeChartData.labels,
                datasets: [
                    {
                        label: 'Resolution Time',
                        data: resolutionTimeChartData.data,
                        fill: false,
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1,
                    },
                ],
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        });
    };

    const initSprintVelocityChart = () => {
        const ctx = sprintVelocityChartRef.current.getContext('2d');

        if (sprintVelocityChartInstance.current) {
            sprintVelocityChartInstance.current.destroy();
        }

        sprintVelocityChartInstance.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sprintVelocityChartData.labels,
                datasets: [
                    {
                        label: 'Story Points',
                        data: sprintVelocityChartData.data,
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                    },
                ],
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        });
    };

    const initDefectDensityChart = () => {
        const ctx = defectDensityChartRef.current.getContext('2d');

        if (defectDensityChartInstance.current) {
            defectDensityChartInstance.current.destroy();
        }

        defectDensityChartInstance.current = new Chart(ctx, {
            type: 'line',
            data: {
                labels: defectDensityChartData.labels,
                datasets: [
                    {
                        label: 'Defect Density',
                        data: defectDensityChartData.data,
                        fill: false,
                        borderColor: 'rgb(255, 99, 132)',
                        tension: 0.1,
                    },
                ],
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        });
    };

    const handleResolutionTimeRangeChange = (e) => {
        setSelectedRanges(prev => ({ ...prev, resolutionTime: e.target.value }));
        getResolutionTimeChartData();
    };

    const handleLastSprintsCountChange = (e) => {
        setSelectedRanges(prev => ({ ...prev, sprintVelocity: e.target.value }));
        getSprintVelocityChartData();
    };

    const handleDefectDensityTimeRangeChange = (e) => {
        setSelectedRanges(prev => ({ ...prev, defectDensity: e.target.value }));
        getDefectDensityChartData();
    };

    const handleChangeProjectRowsPerPage = (event) => {
        setProjectRowsPerPage(parseInt(event.target.value, 10));
        setProjectPage(0);
    };

    const handleChangeUserRowsPerPage = (event) => {
        setUserRowsPerPage(parseInt(event.target.value, 10));
        setUserPage(0);
    };

    const handleChangeProjectPage = (event, newPage) => {
        setProjectPage(newPage);
    };

    const handleChangeUserPage = (event, newPage) => {
        setUserPage(newPage);
    };

    return (
        <div className="dashboard-container" style={{ padding: 20 }}>
            <div className="kpi-overview">
                <h2>KPI Overview {loading.kpiOverview && <CircularProgress size={20} />}</h2>
                <div className="kpi-cards" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                    {Object.entries(kpiOverview).map(([key, value]) => (
                        <Card key={key} style={{ flex: '1 1 200px' }}>
                            <CardHeader title={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} />
                            <CardContent>{value}</CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <div className="kpi-trend-charts">
                <h2>KPI Trend Charts</h2>
                <Card style={{ flex: '1 1 300px' }}>
                    <CardHeader
                        title="Issue Resolution Time"
                        action={
                            <FormControl>
                                <Select
                                    value={selectedRanges.resolutionTime}
                                    onChange={handleResolutionTimeRangeChange}
                                >
                                    <MenuItem value="30">Last 30 Days</MenuItem>
                                    <MenuItem value="60">Last 60 Days</MenuItem>
                                    <MenuItem value="90">Last 90 Days</MenuItem>
                                </Select>
                            </FormControl>
                        }
                    />
                    <CardContent>
                        <canvas ref={resolutionTimeChartRef} />
                        {loading.resolutionTimeChart && <CircularProgress size={20} />}
                    </CardContent>
                </Card>

                <Card style={{ flex: '1 1 300px' }}>
                    <CardHeader
                        title="Sprint Velocity"
                        action={
                            <FormControl>
                                <Select
                                    value={selectedRanges.sprintVelocity}
                                    onChange={handleLastSprintsCountChange}
                                >
                                    <MenuItem value="5">Last 5 Sprints</MenuItem>
                                    <MenuItem value="10">Last 10 Sprints</MenuItem>
                                    <MenuItem value="20">Last 20 Sprints</MenuItem>
                                </Select>
                            </FormControl>
                        }
                    />
                    <CardContent>
                        <canvas ref={sprintVelocityChartRef} />
                        {loading.sprintVelocityChart && <CircularProgress size={20} />}
                    </CardContent>
                </Card>

                <Card style={{ flex: '1 1 300px' }}>
                    <CardHeader
                        title="Defect Density"
                        action={
                            <FormControl>
                                <Select
                                    value={selectedRanges.defectDensity}
                                    onChange={handleDefectDensityTimeRangeChange}
                                >
                                    <MenuItem value="30">Last 30 Days</MenuItem>
                                    <MenuItem value="60">Last 60 Days</MenuItem>
                                    <MenuItem value="90">Last 90 Days</MenuItem>
                                </Select>
                            </FormControl>
                        }
                    />
                    <CardContent>
                        <canvas ref={defectDensityChartRef} />
                        {loading.defectDensityChart && <CircularProgress size={20} />}
                    </CardContent>
                </Card>
            </div>

            <div className="project-overview" style={{ marginBottom: '20px' }}>
                <h2>Project Overview (This week) {loading.kpiOverview && <CircularProgress size={20} />}</h2>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Project Name</TableCell>
                                <TableCell>Total Issues</TableCell>
                                <TableCell>Open Issues</TableCell>
                                <TableCell>Closed Issues</TableCell>
                                <TableCell>Lead Time</TableCell>
                                <TableCell>Cycle Time</TableCell>
                                <TableCell>Sprint Velocity</TableCell>
                                <TableCell>Defect Density</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {projectData
                                .slice(projectPage * projectRowsPerPage, projectPage * projectRowsPerPage + projectRowsPerPage)
                                .map((kpi) => (
                                    <TableRow key={kpi.project}>
                                        <TableCell>{kpi.project}</TableCell>
                                        <TableCell>{kpi.totalIssues}</TableCell>
                                        <TableCell>{kpi.openIssues}</TableCell>
                                        <TableCell>{kpi.closedIssues}</TableCell>
                                        <TableCell>{kpi.leadTime}</TableCell>
                                        <TableCell>{kpi.cycleTime}</TableCell>
                                        <TableCell>{kpi.sprintVelocity}</TableCell>
                                        <TableCell>{kpi.defectDensity}</TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={projectData.length}
                    rowsPerPage={projectRowsPerPage}
                    page={projectPage}
                    onPageChange={handleChangeProjectRowsPerPage}
                    onRowsPerPageChange={handleChangeProjectRowsPerPage}
                />
            </div>

            <div className="user-overview" style={{ marginBottom: '20px' }}>
                <h2>Users Overview (This week) {loading.kpiOverview && <CircularProgress size={20} />}</h2>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>User</TableCell>
                                <TableCell>Total Issues</TableCell>
                                <TableCell>Open Issues</TableCell>
                                <TableCell>Closed Issues</TableCell>
                                <TableCell>Lead Time</TableCell>
                                <TableCell>Cycle Time</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {userData
                                .slice(userPage * userRowsPerPage, userPage * userRowsPerPage + userRowsPerPage)
                                .map((kpi) => (
                                    <TableRow key={kpi.user}>
                                        <TableCell>{kpi.user}</TableCell>
                                        <TableCell>{kpi.totalIssues}</TableCell>
                                        <TableCell>{kpi.openIssues}</TableCell>
                                        <TableCell>{kpi.closedIssues}</TableCell>
                                        <TableCell>{kpi.leadTime}</TableCell>
                                        <TableCell>{kpi.cycleTime}</TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={userData.length}
                    rowsPerPage={userRowsPerPage}
                    page={userPage}
                    onPageChange={handleChangeUserRowsPerPage}
                    onRowsPerPageChange={handleChangeUserRowsPerPage}
                />
            </div>
        </div>
    );
};

export default Dashboard;
