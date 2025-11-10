import {
    useState, useEffect, Paper, Button, IconButton, Modal, Box,
    Typography, InputAdornment, TextField, AddBoxIcon, SearchIcon,
    CancelIcon, CancelPresentation, MenuItem, toast,
    Loading, useValidator, socket, CustomDataGrid
} from '../../../ImportComponents/Imports';
import { fetchAllChannels, createNewHistorical } from '../../../../Services/APIDevice';

const ModalSearchChannels = (props) => {
    const { actionHistorical, openModalAdd, handleCloseModalAdd, dataConfig,
        openModalSearchTag, actionAlarm, setDataModalAlarm } = props;
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5, });
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 700,
        bgcolor: '#fff',
        borderRadius: 2,
        boxShadow: 24,
        p: 3,
        maxHeight: '90vh', // chiều cao tối đa theo viewport
        overflowY: 'auto',
    };

    const defaultData = {
        type: ""
    };

    const [errors, setErrors] = useState({});
    const { validate } = useValidator();
    const [dataEditTag, setDataEditTag] = useState(defaultData);

    const [listChannelSearch, setlistChannelSearch] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [searched, setSearched] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedRows, setSelectedRows] = useState([]);

    useEffect(() => {
        if (openModalAdd || openModalSearchTag) {
            setDataEditTag(defaultData);
            setSelectedRows([]);
            fetchChannel();
        }
    }, [openModalAdd, openModalSearchTag]);

    const fetchChannel = async () => {
        setLoading(true);
        let response = await fetchAllChannels();
        if (response && response.EC === 0 && Array.isArray(response.DT?.DT)) {
            const rowsWithId = response.DT.DT.map((item) => ({
                id: item._id,
                channel: item.channel,
                name: item.name,
                deviceId: item.device?._id,
                deviceName: item.device?.name,
                symbol: item.symbol,
                unit: item.unit,
            }));
            setlistChannelSearch(rowsWithId);
            setFilteredList(rowsWithId);
        }
        setLoading(false);
    };

    const handleOnchangeInput = (value, name) => {
        setDataEditTag((prev) => ({ ...prev, [name]: value, }));
        const errorMessage = validate(name, value);
        setErrors((prev) => ({ ...prev, [name]: errorMessage, }));
    };

    const validateAll = () => {
        const newErrors = {};
        Object.entries(dataEditTag).forEach(([key, value]) => {
            newErrors[key] = validate(key, value);

        });
        setErrors(newErrors);
        // Kiểm tra xem có lỗi nào không
        return Object.values(newErrors).every((err) => err === "");
    };

    const handleClose = () => {
        handleCloseModalAdd();
        setErrors({});
        setSelectedRows([]);
        setDataEditTag(defaultData);
    };

    const handleSearchChange = (event) => {
        const value = event.target.value;
        setSearched(value);
        const filteredRows = listChannelSearch.filter((row) =>
            row.name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredList(filteredRows);
    };

    const handleAddTagHistorical = async () => {
        if (!validateAll()) {
            return;
        }
        //console.log('check row add historical: ', row.id)
        const selectedData = filteredList
            .filter((row) => selectedRows.includes(row.id))
            .map((row) => ({
                id: row.id,
                name: row.name,
                type: dataEditTag.type,
                device: { _id: row.deviceId },
            }));

        const res = actionHistorical === 'HISTORICAL'
            ? await createNewHistorical(selectedData)
            : []
        if (res && res.EC === 0) {
            toast.success(res.EM);
            socket.emit("CHANGE HISTORICAL");
            handleClose();
        } else {
            toast.error(res.EM);
        }
    };

    const handleChooseTagAlarm = (rowData) => {
        setDataModalAlarm(rowData);
        handleClose();
    }

    const columns = [
        { field: 'channel', headerName: 'Channel', flex: 1, align: 'center', headerAlign: 'center' },
        { field: 'name', headerName: 'Name', flex: 1, align: 'center', headerAlign: 'center' },
        { field: 'deviceName', headerName: 'Device', flex: 1, align: 'center', headerAlign: 'center' },
        { field: 'symbol', headerName: 'Symbol', flex: 1, align: 'center', headerAlign: 'center' },
        { field: 'unit', headerName: 'Unit', flex: 1, align: 'center', headerAlign: 'center' },
        ...(actionAlarm === 'ALARM' ? [
            {
                field: "action",
                headerName: "Action",
                flex: 1,
                headerAlign: 'center',
                align: 'center',
                sortable: false,
                filterable: false,
                renderCell: (params) => (
                    <Button
                        variant="contained"
                        color="primary"
                        sx={{ textTransform: 'capitalize' }}
                        onClick={(e) => { e.stopPropagation(); handleChooseTagAlarm(params.row); }}
                    >
                        Chọn
                    </Button>
                ),
            }
        ] : [])
    ];

    return (
        <Modal open={!!(openModalAdd || openModalSearchTag)} onClose={handleClose}>
            <Box sx={style}>
                {/* Header */}
                <Typography variant="h6" align="center" sx={{ mb: 2, fontWeight: 600 }}>
                    Tìm kiếm Tag Name
                </Typography>

                <IconButton
                    onClick={handleClose}
                    sx={{
                        position: "absolute",
                        right: 20,
                        top: 20,
                        width: { xs: 36, md: 48 },
                        height: { xs: 36, md: 48 },
                    }}
                >
                    <CancelIcon sx={{ fontSize: { xs: 24, md: 32 } }} />
                </IconButton>

                {/* Thanh tìm kiếm */}
                <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={searched}
                    onChange={handleSearchChange}
                    placeholder="Nhập tên kênh cần tìm..."
                    sx={{ mb: 2 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />

                <Paper sx={{ height: 350, width: '100%' }}>
                    <CustomDataGrid
                        rows={filteredList}
                        columns={columns}
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}
                        pageSizeOptions={[5, 10, 20]}
                        pagination
                        {...(actionHistorical === 'HISTORICAL' && { checkboxSelection: true })}
                        onRowSelectionModelChange={(newSelectionModel) => { setSelectedRows(newSelectionModel); }}
                        loading={loading}
                    />

                    {loading && <Loading text="Đang tải dữ liệu..." />}
                </Paper>
                {actionHistorical === 'HISTORICAL' && (
                    <Paper sx={{ mt: 2, width: "100%", p: 2, borderRadius: 2, boxShadow: 2, }} >
                        <Box sx={{ ml: 15, display: "flex", alignItems: "center", height: 50, }} >
                            <Typography sx={{ fontSize: 16, fontWeight: 500, }} >
                                Chọn Group lưu trữ:
                            </Typography>
                            <TextField
                                select
                                label="Type"
                                variant="outlined"
                                sx={{ ml: 3, mt: 0, minWidth: 200 }}
                                value={dataEditTag.type || ""}
                                onChange={(event) => handleOnchangeInput(event.target.value, 'type')}
                                error={!!errors.type}
                                helperText={errors.type}
                            >
                                {dataConfig.map((item) => (
                                    <MenuItem key={item.id} value={item.name}>
                                        {item.name}
                                    </MenuItem>
                                ))}
                            </TextField>

                        </Box>
                    </Paper>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2.5 }}>

                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<CancelPresentation />}
                        sx={{ ml: 1.5, textTransform: 'none' }}
                        onClick={handleClose}
                    >
                        Thoát

                    </Button>
                    {actionHistorical === 'HISTORICAL' && (
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<AddBoxIcon />}
                            sx={{ ml: 1.5, textTransform: 'none' }}
                            onClick={handleAddTagHistorical}
                            disabled={selectedRows.length === 0}
                        >
                            Thêm
                        </Button>
                    )}
                </Box>
            </Box>
        </Modal>
    );
};

export default ModalSearchChannels;