import React from 'react';
import { AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const AppBarBack = ({ title, navigate }) => {
  const handleBack = () => {
    navigate('main', { });
  };

  return (
    <AppBar 
        position="static"
        elevation={0} 
        sx={{ 
            backgroundColor: 'transparent',
            color: 'black'
        }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="back"
          onClick={handleBack}
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>

        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default AppBarBack;