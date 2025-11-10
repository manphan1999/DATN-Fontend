import { useState, Tabs, Paper, Tab, Box } from '../ImportComponents/Imports';
import ListDevices from "./Components/ListDevices/ListDevice";
import ListCom from "./Components/ListCom/ListCom";

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

const DeviceTab = () => {
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
                        <Tab sx={{ textTransform: 'none', fontWeight: 'bold', fontSize: 15, whiteSpace: 'nowrap' }} label="Cấu hình Device" />
                        <Tab sx={{ textTransform: 'none', fontWeight: 'bold', fontSize: 15, whiteSpace: 'nowrap' }} label="Cấu hình COM" />
                    </Tabs>
                </Box>
            </Paper>


            <TabPanel value={tabValue} index={0}>
                <ListDevices />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
                <ListCom />
            </TabPanel>

        </div>
    );
};

export default DeviceTab;
