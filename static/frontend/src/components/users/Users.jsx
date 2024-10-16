import React, { useState, useEffect } from 'react';
import { Container, Button, Box, CircularProgress } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { Chart as ChartJS, registerables } from 'chart.js';

import UserStatistics from './components/UserStatistics';
import UserList from './components/UserList';
import UserKpis from './components/UserKpis';
import UserComparison from './components/UserComparison';
import {apiService } from '../../utils/api';

ChartJS.register(...registerables);

const Users = ({ navigate }) => {
    const [loadingUser, setLoadingUsers] = useState(true);
    const [loadingKpis, setLoadingKpis] = useState(true);
    const [users, setUsers] = useState([]);
    const [userKpis, setUserKpis] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [activeUsers, setActiveUsers] = useState(0);
    const [startDate, setStartDate] = useState(dayjs().subtract(1, 'month'));
    const [endDate, setEndDate] = useState(dayjs());
    const [selectedComparison, setSelectedComparison] = useState('total-issues');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const formattedStartDate = startDate.format('YYYY-MM-DD');
            const formattedEndDate = endDate.format('YYYY-MM-DD');
            const data = await apiService.getUsersDashboardData(formattedStartDate, formattedEndDate);
            console.log("Data:", data)
            setTotalUsers(data.totalMembers);
            setActiveUsers(data.activeMembers);
            setUsers(data.users);
            //setUserKpis(data.userKpis);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
        setLoadingUsers(false);
    };

    const fetchUserKpis = async () => {
        setLoadingKpis(true)
        try {
            const formattedStartDate = startDate.format('YYYY-MM-DD');
            const formattedEndDate = endDate.format('YYYY-MM-DD');
            const data = await apiService.getUsersDashboardKpisData(formattedStartDate, formattedEndDate, users);
            console.log("kpisdata", data);
            setUserKpis(data);
        } catch (error) {
            console.error('Error fetching Kpis:', error);
        }
        setLoadingKpis(false)
    };

    useEffect(() => {
        fetchUserKpis();
    }, [startDate, endDate]);

    const goToUserDetails = (userKey) => {
        navigate('user-details', { userKey });
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Container maxWidth="lg">
                {loadingUser && <p>Loading...</p>}
                
                {!loadingUser &&<UserStatistics totalUsers={totalUsers} activeUsers={activeUsers} />}

                {!loadingUser &&<UserList users={users} goToUserDetails={goToUserDetails} />}

                
                <h2>User Performance Summary</h2>
                {loadingKpis ? <p>Loading...</p> :
                <>
                <Box sx={{ mt: 2, mb: 2 }}>
                        <DatePicker
                            label="Start Date"
                            value={startDate}
                            onChange={(newValue) => setStartDate(newValue)}
                        />
                        <DatePicker
                            label="End Date"
                            value={endDate}
                            onChange={(newValue) => setEndDate(newValue)}
                        />
                </Box>

                <UserKpis userKpis={userKpis} goToUserDetails={goToUserDetails} />

                <UserComparison
                    userKpis={userKpis}
                    selectedComparison={selectedComparison}
                    setSelectedComparison={setSelectedComparison}
                    />
                </>
                }
            </Container>
        </LocalizationProvider>
    );
};

export default Users;