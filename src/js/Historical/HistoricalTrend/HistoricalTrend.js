import {
    useState, useEffect, Paper, dayjs, TextField, MenuItem, CustomDateTimePicker, useValidator,
    Box, Button, Stack, FindInPageIcon, Chart, Card, CardContent, Typography
} from '../../ImportComponents/Imports';
import { fetchAllHistoricalValue, fetchAllHistorical, findHistoricalTime } from '../../../Services/APIDevice';

const HistoricalTrend = (props) => {
    const [loading, setLoading] = useState(true);
    const [listHistoricalValue, setListHistoricalValue] = useState([]);
    const [listTagHistorical, setListTagHistorical] = useState([]);
    const [errors, setErrors] = useState({});
    const { validate } = useValidator();
    const [selectedTag, setSelectedTag] = useState("");
    const [startDate, setStartDate] = useState(dayjs().startOf("day"));
    const [endDate, setEndDate] = useState(dayjs().endOf("day"));

    useEffect(() => {
        fetchTagHistorical();
    }, []);

    const validateAll = () => {
        const newErrors = {};
        newErrors.selectedTag = validate("name", selectedTag);
        setErrors(newErrors);
        return Object.values(newErrors).every((err) => err === "");
    };

    const fetchTagHistorical = async () => {
        let response = await fetchAllHistorical();
        if (response && response.EC === 0 && response.DT?.DT) {
            const listTagHistorical = response.DT.DT.map((item) => ({
                id: item.id,
                name: item.name,
            }));
            setListTagHistorical(listTagHistorical);
        }
    };

    // const fetchAllHistorical = async () => {
    //     let response = await fetchAllHistoricalValue();
    //     console.log('response = ', response)
    //     if (response && response.EC === 0 && Array.isArray(response.DT)) {
    //         const dataHistorical = response.DT.map(item => ({
    //             time: item.ts,
    //             value: item.value.value,  // lấy giá trị đo
    //             tagname: item.value.tagname,
    //             unit: item.value.unit
    //         }));
    //         setListHistoricalValue(dataHistorical);
    //     }
    // };

    const handleFindHistorical = async () => {
        if (!validateAll()) return;
        try {
            const startTime = startDate.format("YYYY-MM-DD HH:mm:ss");
            const endTime = endDate.format("YYYY-MM-DD HH:mm:ss");
            const selectedTagObj = listTagHistorical.find(tag => tag.id === selectedTag);
            const tagNameId = selectedTagObj ? selectedTagObj.id : "";
            const tagName = selectedTagObj ? selectedTagObj.name : "";

            const response = await findHistoricalTime({ startTime, endTime, tagNameId });
            if (response && response.EC === 0 && Array.isArray(response.DT)) {
                const dataFinds = response.DT.map(item => ({
                    time: item.ts,
                    value: item.value.value,  // lấy giá trị đo
                    tagname: item.value.tagname || tagName,
                    unit: item.value.unit
                }));
                setListHistoricalValue(dataFinds);
            }
        } catch (error) { }
    };

    const chartData = {
        series: [
            {
                name:
                    listHistoricalValue.length > 0
                        ? listHistoricalValue[0]?.tagname || "Giá trị"
                        : "Giá trị",
                data: listHistoricalValue.map(item => ({
                    x: dayjs(item.time).add(7, 'hour').valueOf(),
                    y: Number(item.value)
                })),
            },
        ],
        options: {
            chart: {
                type: "line",
                height: 400,
                zoom: { enabled: true },
                toolbar: {
                    show: true,
                    tools: {
                        download: true,
                        selection: true,
                        zoom: true,
                        zoomin: true,
                        zoomout: true,
                        pan: true,
                        reset: true
                    }
                },
                background: '#fff',
                parentHeightOffset: 0,
            },
            dataLabels: { enabled: false },
            stroke: { curve: "smooth", width: 2 },
            grid: {
                borderColor: "#e0e0e0",
                row: { colors: ["#f9f9f9", "transparent"], opacity: 0.5 },
                padding: {
                    bottom: 20,
                    top: 0,
                    left: 10,
                    right: 10,
                },
            },
            markers: { size: 0, hover: { sizeOffset: 5 } },
            xaxis: {
                type: "datetime",
                labels: {
                    rotate: 0,
                    style: { fontSize: "12px" },
                    datetimeFormatter: { hour: "HH:mm", day: "dd/MM" },
                },
                title: {
                    text: "Thời gian",
                    offsetY: 15,
                    style: { fontSize: "13px", fontWeight: 700 },
                },
            },
            yaxis: {
                labels: {
                    formatter: (val) => `${val.toFixed(2)} ${listHistoricalValue[0]?.unit || ""}`,
                    style: { fontSize: "13px" },
                },
                title: {
                    text: listHistoricalValue[0]?.unit
                        ? `Giá trị (${listHistoricalValue[0]?.unit})`
                        : "Giá trị đo",
                    style: { fontSize: "13px", fontWeight: 500 },
                },
            },
            tooltip: {
                theme: "light",
                x: { show: true, format: "dd/MM HH:mm" },
                y: { formatter: (val) => `${val.toFixed(2)} ${listHistoricalValue[0]?.unit || ""}` },
            },
            legend: {
                position: "bottom",
                horizontalAlign: "center",
                markers: { radius: 12 },
            },
            colors: ["#2979ff"],
            title: {
                text: `Biểu đồ: ${listHistoricalValue[0]?.tagname || "—"}`,
                align: "center",
                style: { fontSize: "16px", fontWeight: "bold", color: "#263238" },
            },
            subtitle: {
                text: `(${startDate.format("DD/MM/YYYY HH:mm:ss")} - ${endDate.format("DD/MM/YYYY HH:mm:ss")})`,
                align: "center",
                style: { fontSize: "13px", color: "#757575", fontFamily: 'Roboto, sans-serif', marginTop: '5px' }
            },

        },
    };

    return (
        <>
            <Paper
                sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                    filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.25))',
                }}
            >
                <Stack direction="row" spacing={2} alignItems="center" sx={{ height: '100%' }}>
                    <Box sx={{ width: '45%' }}>
                        <CustomDateTimePicker
                            startDate={startDate}
                            endDate={endDate}
                            setStartDate={setStartDate}
                            setEndDate={setEndDate}
                        />
                    </Box>

                    <TextField
                        select
                        fullWidth
                        label="Name"
                        variant="standard"
                        sx={{ width: '35%', mr: 5 }}
                        value={selectedTag}
                        onChange={(e) => {
                            setSelectedTag(e.target.value);
                            if (errors.selectedTag) {
                                setErrors((prev) => ({ ...prev, selectedTag: "" }));
                            }
                        }}
                        error={!!errors.selectedTag}
                        helperText={errors.selectedTag}
                    >
                        {listTagHistorical.map((item) => (
                            <MenuItem key={item.id} value={item.id}>
                                {item.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<FindInPageIcon />}
                        onClick={handleFindHistorical}
                        sx={{
                            textTransform: 'none',
                            height: 'fit-content',
                            minWidth: '120px',
                            ml: 33,
                        }}
                    >
                        Tìm kiếm
                    </Button>
                </Stack>
            </Paper>

            <Card sx={{
                maxWidth: '100%',
                margin: "30px auto",
                boxShadow: 3,
                p: 0,
                mb: 2,
                borderRadius: 2,
                filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.25))',
            }}>
                <CardContent>
                    {listHistoricalValue.length > 0 ? (
                        <Chart
                            options={chartData.options}
                            series={chartData.series}
                            type="line"
                            height={350}
                        />
                    ) : (
                        <Typography align="center" color="text.secondary">
                            Không có dữ liệu
                        </Typography>
                    )}
                </CardContent>
            </Card>
        </>
    );
};

export default HistoricalTrend;
