import { useState, useEffect, Tabs, Paper, Tab, Box } from '../ImportComponents/Imports';
import ModbusRTUServer from '../Server/ModbusRTUServer/ModbusRTUServer';
import ModbusTCPServer from '../Server/ModbusTCPServer/ModbusTCPServer';
import ListPublishMqtt from '../Server/PublisMQTT/Publish';
import { fetchServer } from '../../Services/APIDevice';
const TabPanel = (props) => {
    const { children, value, index, ...other } = props;

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            localStorage.setItem("redirectAfterLogin", window.location.pathname);
            window.location.href = '/login';
        } else {
            fetchServer();
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

const ServerTab = () => {
    const [tabValue, setTabValue] = useState(0);

    const handleChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <Box sx={{
            p: 1, height: "100%", maxHeight: "100%", display: "flex", flexDirection: "column", boxSizing: "border-box",
        }}>
            <Paper sx={{
                p: 2, borderRadius: 2, filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.25))', mt: 1,
            }}>
                <Box sx={{ height: 20, display: 'flex', alignItems: 'center' }}>
                    {/* Tabs */}
                    <Tabs
                        value={tabValue}
                        onChange={handleChange}
                        variant="fullWidth"
                        sx={{ width: '100%' }}
                    >
                        <Tab sx={{ textTransform: 'none', fontWeight: 'bold', fontSize: 15, whiteSpace: 'nowrap' }} label="Modbus RTU Server" />
                        <Tab sx={{ textTransform: 'none', fontWeight: 'bold', fontSize: 15, whiteSpace: 'nowrap' }} label="Modbus TCP Server" />
                        <Tab sx={{ textTransform: 'none', fontWeight: 'bold', fontSize: 15, whiteSpace: 'nowrap' }} label="Publish MQTT" />
                    </Tabs>
                </Box>
            </Paper>

            <TabPanel value={tabValue} index={2}>
                <ListPublishMqtt />
            </TabPanel>
            <TabPanel value={tabValue} index={0}>
                <ModbusRTUServer />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
                <ModbusTCPServer />
            </TabPanel>

        </Box>
    );
};

export default ServerTab;
