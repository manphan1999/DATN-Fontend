import { Tabs, Tab, Paper, Box, useState } from '../ImportComponents/Imports';
import HistoricalData from '../Historical/HistoricalData/HistoricalData'
import HistoricalAlarm from '../Historical/HistoricalAlarm/HistoricalAlarm'
import HistoricalTrend from '../Historical/HistoricalTrend/HistoricalTrend'

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

const HistoricalTab = () => {
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
                        <Tab sx={{ textTransform: 'none', fontWeight: 'bold', fontSize: 15, whiteSpace: 'nowrap' }} label="Historical Trend Data" />
                        <Tab sx={{ textTransform: 'none', fontWeight: 'bold', fontSize: 15, whiteSpace: 'nowrap' }} label="Historical Data" />
                        <Tab sx={{ textTransform: 'none', fontWeight: 'bold', fontSize: 15, whiteSpace: 'nowrap' }} label="Historical Alarm" />
                    </Tabs>
                </Box>
            </Paper>


            <TabPanel value={tabValue} index={0}>
                <HistoricalTrend />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
                <HistoricalData />
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
                <HistoricalAlarm />
            </TabPanel>
        </div>
    );
};

export default HistoricalTab;
