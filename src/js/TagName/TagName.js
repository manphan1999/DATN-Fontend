import { useState, useEffect, Tabs, Paper, Tab, Box } from '../ImportComponents/Imports';
import ListChannels from "./Components/Monitoring/ListChannels";
import ListHistorical from "./Components/Histotical/ListHistorical";
import ListAlarm from "./Components/Alarm/ListAlarm";
import { fetchTagname } from '../../Services/APIDevice';

const TabPanel = (props) => {
    const { children, value, index, ...other } = props;

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            localStorage.setItem("redirectAfterLogin", window.location.pathname);
            window.location.href = '/login';
        } else {
            fetchTagname();
        }
    }, []);

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
            style={{ width: "100%" }}
        >
            {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
        </div>
    );
};

const SetupTab = () => {
    const [tabValue, setTabValue] = useState(0);

    const handleChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <Box sx={{
            p: 1,
            height: "100%",
            maxHeight: "100%",
            display: "flex",
            flexDirection: "column",
            boxSizing: "border-box",
        }}>
            <Paper sx={{
                p: 2,
                borderRadius: 2,
                filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.25))',
                mt: 1,
            }}>
                <Box sx={{ height: 20, display: 'flex', alignItems: 'center' }}>
                    {/* Tabs */}
                    <Tabs
                        value={tabValue}
                        onChange={handleChange}
                        variant="fullWidth"
                        sx={{ width: '100%' }}
                    >
                        <Tab sx={{ textTransform: 'none', fontWeight: 'bold', fontSize: 15, whiteSpace: 'nowrap' }} label="Cấu hình Tagname" />
                        <Tab sx={{ textTransform: 'none', fontWeight: 'bold', fontSize: 15, whiteSpace: 'nowrap' }} label="Cấu hình Historical" />
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

        </Box>
    );
};

export default SetupTab;
