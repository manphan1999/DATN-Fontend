import { useState, Tabs, Paper, Tab, Box } from '../ImportComponents/Imports';
import ListFTP from './FTP/FTP';
import ListMySQL from './MySQL/MySQl';
import ListSQL from './SQL/SQL';

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

const SendTab = () => {
    const [tabValue, setTabValue] = useState(0);

    const handleChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <div className="container">
            <Paper sx={{
                p: 2,
                borderRadius: 2,
                filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.25))',
                mt: 2,
            }}>
                <Box sx={{ height: 20, display: 'flex', alignItems: 'center' }}>
                    {/* Tabs */}
                    <Tabs
                        value={tabValue}
                        onChange={handleChange}
                        variant="fullWidth"
                        sx={{ width: '100%' }}
                    >
                        <Tab sx={{ textTransform: 'none', fontWeight: 'bold', fontSize: 15, whiteSpace: 'nowrap' }} label="Cấu hình FTP" />
                        <Tab sx={{ textTransform: 'none', fontWeight: 'bold', fontSize: 15, whiteSpace: 'nowrap' }} label="Cấu hình MySQL" />
                        <Tab sx={{ textTransform: 'none', fontWeight: 'bold', fontSize: 15, whiteSpace: 'nowrap' }} label="Cấu hình SQL" />
                    </Tabs>
                </Box>
            </Paper>

            <TabPanel value={tabValue} index={0}>
                <ListFTP />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
                <ListMySQL />
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
                <ListSQL />
            </TabPanel>

        </div>
    );
};

export default SendTab;
