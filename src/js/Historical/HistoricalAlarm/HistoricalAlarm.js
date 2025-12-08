import {
    useState, useEffect, Paper, dayjs, TextField, MenuItem, HelpOutlineIcon, WarningAmberIcon,
    Box, Button, IosShareIcon, Stack, FindInPageIcon, ErrorIcon, InfoOutlinedIcon,
    useValidator, CustomDataGrid, Loading, CustomDateTimePicker, exportToCSV, Chip
} from '../../ImportComponents/Imports';
import { fetchAllAlarmValue, fetchAllTagAlarm, findAlarmTime } from '../../../Services/APIDevice'

const ListAlarm = () => {
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 20 });
    const [loading, setLoading] = useState(true);
    const [listAlarmValue, setListAlarmValue] = useState([]);
    const [listTagAlarm, setListTagAlarm] = useState([]);
    const [selectedTag, setSelectedTag] = useState("");
    const [isSearchClicked, setIsSearchClicked] = useState(false);
    const [errors, setErrors] = useState({});
    const { validate } = useValidator();

    const [startDate, setStartDate] = useState(dayjs().startOf("day"));
    const [endDate, setEndDate] = useState(dayjs().endOf("day"));

    useEffect(() => {
        fetchHistorialValue();
        fetchTagAlarm();
    }, []);

    const validateAll = () => {
        const newErrors = {};
        newErrors.selectedTag = validate("name", selectedTag);

        setErrors(newErrors);
        return Object.values(newErrors).every((err) => err === "");
    };

    const fetchTagAlarm = async () => {
        let response = await fetchAllTagAlarm();
        if (response && response.EC === 0 && response.DT?.DT) {
            const tagAlarm = response.DT.DT.map((item, index) => ({
                id: item._id,
                tagnameId: item.tagnameId,
                name: item.name,
            }));
            setListTagAlarm(tagAlarm);
        }
    };

    const fetchHistorialValue = async () => {
        setLoading(true);
        let response = await fetchAllAlarmValue();
        //console.log('check data response: ', response)
        if (response && response.EC === 0 && response.DT?.DT) {
            const rowsWithId = [];
            let idCounter = 1;
            response.DT.DT.forEach((dayItem) => {
                dayItem.alarms.forEach((alarmGroup) => {
                    alarmGroup.alarm.forEach((alarmItem) => {
                        rowsWithId.push({
                            id: idCounter++,
                            tagname: alarmItem.tagName,
                            value: alarmItem.value,
                            condition: alarmItem.condition,
                            rangeAlarm: alarmItem.rangeAlarm,
                            content: alarmItem.content,
                            title: alarmItem.title,
                            type: alarmItem.type,
                            timestamp: dayjs(alarmGroup.ts).format("DD/MM/YYYY - HH:mm:ss"),
                        });
                    });
                });
            });
            const reversed = rowsWithId.reverse();
            const rowsWithNewId = reversed.map((item, index) => ({
                ...item,
                id: index + 1,
            }));
            setListAlarmValue(rowsWithNewId);
        }
        setLoading(false);
    };

    const handleFindAlarm = async () => {
        if (!validateAll()) return;
        setIsSearchClicked(true);
        setLoading(true);
        try {
            const startTime = startDate.format("YYYY-MM-DD HH:mm:ss");
            const endTime = endDate.format("YYYY-MM-DD HH:mm:ss");
            const selectedTagObj = listTagAlarm.find(tag => tag.tagnameId === selectedTag);
            const tagNameId = selectedTagObj ? selectedTagObj.tagnameId : "";
            const response = await findAlarmTime({ startTime, endTime, tagNameId });
            if (response && response.EC === 0 && Array.isArray(response.DT)) {
                const rows = response.DT.map((item, index) => ({
                    id: index + 1,
                    tagnameId: item.tagnameId,
                    tagname: item.tagName,
                    value: item.value,
                    condition: item.condition,
                    rangeAlarm: item.rangeAlarm,
                    content: item.content,
                    title: item.title,
                    type: item.type,
                    timestamp: dayjs(item.ts).format("DD/MM/YYYY - HH:mm:ss"),
                }));
                const reversed = rows.reverse();
                const rowsWithNewId = reversed.map((item, index) => ({
                    ...item,
                    id: index + 1,
                }));

                setListAlarmValue(rowsWithNewId);
                setLoading(false);
            }
        } catch (error) { }
    };

    const handleExportCSV = () => {
        // console.log('selectedTag: ', selectedTag)
        if (!validateAll()) return;
        const headers = ['STT', 'Ngày và Giờ', 'Tên', 'Giá trị', 'Điều kiện', 'Ngưỡng', 'Tiêu đề', 'Nội dung', 'Loại'];
        const csvData = listAlarmValue.map(item => [
            item.id,
            item.timestamp,
            item.tagname,
            item.value,
            item.condition,
            item.rangeAlarm,
            item.title,
            item.content,
            item.type,
        ]);

        // Lấy tên từ selectedTag
        const selectedTagObj = listTagAlarm.find(tag => tag.tagnameId === selectedTag);
        const tagnamedownload = selectedTagObj ? selectedTagObj.name : 'Alarm_data';
        const filename = `Alarm ${tagnamedownload} data day`
        exportToCSV(headers, csvData, filename);
    };

    const columns = [
        { field: 'id', headerName: 'STT', width: 100, align: 'center', headerAlign: 'center' },
        { field: 'timestamp', headerName: 'Date and Time', width: 160, align: 'center', headerAlign: 'center' },
        { field: 'tagname', headerName: 'Name', flex: 1, align: 'center', headerAlign: 'center' },
        { field: 'value', headerName: 'Value', flex: 1, align: 'center', headerAlign: 'center' },
        { field: 'condition', headerName: 'Condition', width: 100, align: 'center', headerAlign: 'center' },
        { field: 'rangeAlarm', headerName: 'Range', flex: 1, align: 'center', headerAlign: 'center' },
        { field: 'title', headerName: 'Title', flex: 1, align: 'center', headerAlign: 'center' },
        { field: 'content', headerName: 'Content', flex: 1, align: 'center', headerAlign: 'center' },
        {
            field: "type",
            headerName: "Type",
            width: 250,
            headerAlign: "center",
            align: "center",
            renderCell: (params) => {
                const type = params.value || "Unknown";
                let color = "default";
                let icon = <HelpOutlineIcon sx={{ fontSize: 18 }} />;

                switch (type) {
                    case "Info":
                        color = "primary";
                        icon = <InfoOutlinedIcon sx={{ fontSize: 18 }} />;
                        break;
                    case "Warning":
                        color = "warning";
                        icon = <WarningAmberIcon sx={{ fontSize: 18 }} />;
                        break;
                    case "Error":
                        color = "error";
                        icon = <ErrorIcon sx={{ fontSize: 18 }} />;
                        break;
                    default:
                        color = "default";
                        icon = <HelpOutlineIcon sx={{ fontSize: 18 }} />;
                }

                return (
                    <Chip
                        icon={icon}
                        label={type}
                        color={color}
                        variant="filled"
                        sx={{
                            fontWeight: 600,
                            textTransform: "capitalize",
                            minWidth: 120,
                            justifyContent: "center",
                            pl: 1,
                            "& .MuiChip-icon": { ml: 0.3 },
                        }}
                    />
                );
            },
        }
    ];

    return (
        <div>
            <Paper sx={{
                p: 2,
                mb: 2,
                borderRadius: 2,
                filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.25))',
            }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ height: '100%' }}>
                    <Box sx={{ width: '45%' }}>
                        <CustomDateTimePicker
                            startDate={startDate}
                            endDate={endDate}
                            setStartDate={setStartDate}
                            setEndDate={setEndDate}
                        />
                    </Box>
                    {/* Danh sách thẻ */}
                    <TextField
                        select
                        fullWidth
                        label="Name"
                        variant="standard"
                        sx={{ width: '31%' }}
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
                        {listTagAlarm.map((item) => (
                            <MenuItem key={item.id} value={item.tagnameId}>
                                {item.name}
                            </MenuItem>
                        ))}
                    </TextField>


                    {/* Nút tìm kiếm */}
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<FindInPageIcon />}
                        onClick={handleFindAlarm}
                        sx={{
                            textTransform: 'none',
                            height: 'fit-content',
                            minWidth: '120px',
                            ml: 2
                        }}
                    >
                        Tìm kiếm
                    </Button>
                    {/* Nút xuất file */}
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<IosShareIcon />}
                        onClick={handleExportCSV}
                        sx={{
                            textTransform: 'none',
                            height: 'fit-content',
                            minWidth: '120px'
                        }}
                        disabled={
                            selectedTag === "" ||
                            !isSearchClicked ||
                            listAlarmValue.length === 0
                        }
                    >
                        Xuất Excel
                    </Button>

                </Stack>
            </Paper>

            <Paper sx={{ height: 631, width: '100%' }}>
                <CustomDataGrid
                    rows={listAlarmValue}
                    columns={columns}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[20, 50, 100]}
                    pagination
                    disableRowSelectionOnClick
                    checkboxSelection={false}
                    hideFooterSelectedRowCount={true}
                    loading={loading}
                    sx={{
                        '& .MuiTablePagination-toolbar': {
                            justifyContent: 'space-between',
                        },
                        '& .MuiDataGrid-columnHeader .MuiDataGrid-iconButtonContainer': {
                            display: 'none', // Ẩn nút sort
                        },
                        '& .MuiDataGrid-columnHeader .MuiDataGrid-menuIcon': {
                            display: 'none', // Ẩn menu icon
                        },
                    }}
                />

                {loading && <Loading text="Đang tải dữ liệu..." />
                }
            </Paper>

        </div >
    );
}

export default ListAlarm;