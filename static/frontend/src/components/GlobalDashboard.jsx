
import React, { useState, useEffect } from "react";
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Modal from '@mui/material/Modal';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Checkbox from '@mui/material/Checkbox';
import { TimeFrameSelector } from './TimeFrameSelector';
import { fetchKPIs, saveConfig } from '../utils/api';
import { kpiDefinitions } from '../constants/kpiDefinitions';
import { exportToCSV, exportToPDF } from '../utils/exportUtils';
import { KPIDisplay } from "./KPIDisplay";
import { LineChart } from "./LineChart";

const GlobalDashbaord = (props) => {
  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };
  const [config, setConfig] = useState(props.config);
  const [timeFrame, setTimeFrame] = useState(props.config.defaultTimeFrame || 'last30days');
  const [comparisonTimeFrame, setComparisonTimeFrame] = useState(null);
  const [kpis, setKPIs] = useState([]);
  const [comparisonKPIs, setComparisonKPIs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedKPIs, setSelectedKPIs] = useState(config.globalKPIs || {});
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [selectedKPIForDrillDown, setSelectedKPIForDrillDown] = useState(null);

  useEffect(() => {
    loadKPIs();
  }, [timeFrame, selectedKPIs]);

  useEffect(() => {
    if (comparisonTimeFrame) {
      loadComparisonKPIs();
    }
  }, [comparisonTimeFrame]);

  const loadKPIs = async () => {
    try {
      setIsLoading(true);
      const fetchedKPIs = await fetchKPIs('global', timeFrame);
      console.log("fetchedKPIs:", fetchedKPIs)
      setKPIs(fetchedKPIs.filter(kpi => selectedKPIs[kpi.id]));
      setError(null);
    } catch (err) {
      setError('Failed to load KPIs. Please try again.');
      console.error('Error loading KPIs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadComparisonKPIs = async () => {
    try {
      const fetchedKPIs = await fetchKPIs('global', comparisonTimeFrame);
      setComparisonKPIs(fetchedKPIs.filter(kpi => selectedKPIs[kpi.id]));
    } catch (err) {
      console.error('Error loading comparison KPIs:', err);
    }
  };

  const handleCustomize = async () => {
    setIsCustomizeModalOpen(true);
  };

  const handleKPIToggle = (kpiId) => {
    setSelectedKPIs(prevSelectedKPIs => ({
      ...prevSelectedKPIs,
      [kpiId]: !prevSelectedKPIs[kpiId]
    }));
  };

  const handleSaveCustomization = async () => {
    const newConfig = { ...config, globalKPIs: selectedKPIs };
    await saveConfig(newConfig);
    setConfig(newConfig);
    props.setAppConfig(newConfig);
    setIsCustomizeModalOpen(false);
  };

  const handleExport = async (event) => {
    const format = event.target.value;
    const data = kpis.map(kpi => ({ name: kpi.name, value: kpi.value }));
    if (format === 'csv') {
      await exportToCSV(data, 'global_kpis');
    } else if (format === 'pdf') {
      //await exportToPDF(data, 'Global KPIs');
    }
  };

  const handleKPIClick = (kpiId) => {
    setSelectedKPIForDrillDown(kpiId);
  };

  return (
    <>
      <h2>Global Dashboard</h2>
      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <TimeFrameSelector
              value={timeFrame} 
              onChange={(event) => setTimeFrame(event.target.value)}
              label="Select Time Frame"
            />
          </Grid>

          <Grid item xs={4}>
            <Button variant="contained" onClick={handleCustomize}>
                Customize KPIs
            </Button>
          </Grid>

          <Grid item xs={4}>
            <Button variant="contained" onClick={loadKPIs}>
              Refresh Data
            </Button>
          </Grid>

          <Grid item xs={4}>
            <Select value={'export'} onChange={handleExport} id="export-select">
            <MenuItem value="export"><em>Export as ..</em></MenuItem>
              <MenuItem value={"csv"} key={"csv"} >Export as CSV</MenuItem>
              <MenuItem value={"pdf"} key={"pdf"} >Export as PDF</MenuItem>
            </Select>
          </Grid>

          <Grid item xs={8}>
            <h4>Select comparison time frame</h4>
            <Select 
              onChange={(event) => setComparisonTimeFrame(event.target.value)} 
              id="comparison-timeframe-select"
              value={"last7days"}>
              <MenuItem value={"last7days"} key={"last7days"} >Last 7 Days</MenuItem>
              <MenuItem value={"last30days"} key={"last30days"} >Last 30 Days</MenuItem>
              <MenuItem value={"lastQuarter"} key={"lastQuarter"} >Last Quarter</MenuItem>
            </Select>
          </Grid>
        </Grid>
      </Box>

      <KPIDisplay 
        kpis={kpis} 
        comparisonKPIs={comparisonKPIs}
        isLoading={isLoading}
        error={error}
        onKPIClick={handleKPIClick}
      />

      {selectedKPIForDrillDown && (
        <Modal
          open={selectedKPIForDrillDown}
          onClose={() => setSelectedKPIForDrillDown(null)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
          >
          <Box sx={modalStyle}>
            <h2>KPI Details</h2>
            <p>Detailed view for {kpiDefinitions[selectedKPIForDrillDown].name}</p>
            <LineChart kpiId={selectedKPIForDrillDown} timeFrame={timeFrame} />
          </Box>
        </Modal>
      )}

      {error && (
        <Button variant="contained" onClick={loadKPIs}>
          Retry
        </Button>
      )}

      {isCustomizeModalOpen && (
        <Modal
          open={isCustomizeModalOpen}
          onClose={() => setIsCustomizeModalOpen(false)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
          >
          <Box sx={modalStyle}>
            <h2>Customize KPIs</h2>
            <FormControl sx={{ m: 3 }} component="fieldset" variant="standard">
              <FormGroup>
                {Object.entries(kpiDefinitions).map(([kpiId, kpi]) => (
                  <FormControlLabel control={
                    <Checkbox
                      name={kpiId}
                      checked={selectedKPIs[kpiId] || false}
                      onChange={(_) => handleKPIToggle(kpiId)}
                    />
                  } label={kpi.name} key={kpiId} />
                ))}
              </FormGroup>
            </FormControl>
            
            <Button variant="contained" onClick={handleSaveCustomization}>
              Save
            </Button>
          </Box>
        </Modal>
      )}
    </>
  );
};

export default GlobalDashbaord;