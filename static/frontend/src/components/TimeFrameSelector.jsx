import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

export const TimeFrameSelector = ({ value, onChange, label = "Select Time Frame", id = "default-time-frame-select" }) => {
    return (
        <>
            <h4>{label}</h4>
            <Select
                id={id}
                value={value}
                onChange={onChange}
                >
                <MenuItem value={"last7days"} key={"last7days"} >Last 7 Days</MenuItem>
                <MenuItem value={"last30days"} key={"last30days"} >Last 30 Days</MenuItem>
                <MenuItem value={"lastSprint"} key={"lastSprint"} >Last Sprint</MenuItem>
                <MenuItem value={"currentSprint"} key={"currentSprint"} >Current Sprint</MenuItem>
                <MenuItem value={"lastQuarter"} key={"lastQuarter"} >Last Quarter</MenuItem>
                <MenuItem value={"yearToDate"} key={"yearToDate"} >Year to Date</MenuItem>
            </Select>
        </>
    );
};