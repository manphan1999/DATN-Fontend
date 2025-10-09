import { useState } from "react";
import { Tabs, Tab, Box, Paper } from "@mui/material";
import ListChannels from "./Components/Monitoring/ListChannels";
import ListHistorical from "./Components/Histotical/ListHistorical";
import ListAlarm from "./Components/Alarm/ListAlarm";

const TabPanel = (props) => {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
            style={{ width: "100%" }}
        >
            {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
        </div>
    );
};

const SetupTab = () => {
    const [tabValue, setTabValue] = useState(0);

    const handleChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <div className="container">
            <Paper sx={{ width: "100%", p: 2, borderRadius: 2, boxShadow: 2 }}>
                <Box sx={{ height: 20, display: 'flex', alignItems: 'center' }}>
                    {/* Tabs */}
                    <Tabs
                        value={tabValue}
                        onChange={handleChange}
                        variant="fullWidth"
                        sx={{ width: '100%' }}
                    >
                        <Tab sx={{ textTransform: 'none', fontWeight: 'bold', fontSize: 15, whiteSpace: 'nowrap' }} label="Cấu hình Tagname" />
                        <Tab sx={{ textTransform: 'none', fontWeight: 'bold', fontSize: 15, whiteSpace: 'nowrap' }} label="Cấu hình Record" />
                        <Tab sx={{ textTransform: 'none', fontWeight: 'bold', fontSize: 15, whiteSpace: 'nowrap' }} label="Cấu hình Alarm" />
                    </Tabs>
                </Box>
            </Paper>

            <TabPanel value={tabValue} index={0}>
                <ListChannels />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
                <ListHistorical />
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
                <ListAlarm />
            </TabPanel>

        </div>
    );
};

export default SetupTab;
