import {
    useState, useEffect, Paper, Button, IconButton, Modal, Box,
    Typography, InputAdornment, TextField, AddBoxIcon, SearchIcon,
    CancelIcon, CancelPresentation, MenuItem, toast, Checkbox,
    Loading, useValidator, socket, CustomDataGrid
} from '../../../ImportComponents/Imports';
import {
    fetchAllChannels, createNewHistorical, createTableMySQL, createTableSQL,
} from '../../../../Services/APIDevice';

const ModalSearchChannels = (props) => {
    const { action, openModalAdd, handleCloseModalAdd, dataConfig, setDataModalServer,
        openModalSearchTag, actionChooseTag, setDataModalAlarm, dataDatabase } = props;
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5, });
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 800,
        bgcolor: '#fff',
        borderRadius: 2,
        boxShadow: 24,
        p: 2,
        maxHeight: '90vh', // chiều cao tối đa theo viewport
        overflowY: 'auto',
    };

    const defaultData = {
        type: "",
        group: ""
    };

    const [errors, setErrors] = useState({});
    const { validate } = useValidator();
    const [dataEditTag, setDataEditTag] = useState(defaultData);
    const [selectedServers, setSelectedServers] = useState([]);
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
            let rowsWithId = response.DT.DT.map((item) => ({
                id: item._id,
                channel: item.channel,
                name: item.name,
                deviceId: item.device?._id,
                deviceName: item.device?.name,
                symbol: item.symbol,
                unit: item.unit,
                functionCode: item.functionCode,
                dataType: item.dataType,
                dataFormat: item.dataFormat,
                selectMySQL: item.selectMySQL,
                selectSQL: item.selectSQL
            }));
            if (action === 'DATABASE MYSQL') {
                rowsWithId = rowsWithId.filter(item => item.selectMySQL === true);
            }
            if (action === 'DATABASE SQL') {
                rowsWithId = rowsWithId.filter(item => item.selectSQL === true);
            }
            setlistChannelSearch(rowsWithId);
            setFilteredList(rowsWithId);
        } setLoading(false);
    };

    const handleOnchangeInput = (value, name) => {
        setDataEditTag((prev) => ({ ...prev, [name]: value, }));
        const errorMessage = validate(name, value);
        setErrors((prev) => ({ ...prev, [name]: errorMessage, }));
    };

    // hàm toggle checkbox server
    const handleServerCheckboxChange = (serverName) => {
        setSelectedServers(prev =>
            prev.includes(serverName)
                ? prev.filter(item => item !== serverName)
                : [...prev, serverName]
        );
    };

    const validateAll = () => {
        const newErrors = {};
        if (action === 'HISTORICAL') {
            newErrors.type = validate('type', dataEditTag.type);
            newErrors.group = "";
        } else if (action === 'DATABASE MYSQL' || action === 'DATABASE SQL') {
            newErrors.type = "";
            newErrors.group = selectedServers.length === 0 ? "Vui lòng chọn ít nhất 1 server" : "";
        }
        setErrors(newErrors);
        return Object.values(newErrors).every((err) => err === "");
    };

    const handleClose = () => {
        handleCloseModalAdd();
        setErrors({});
        setSelectedRows([]);
        setSelectedServers([]);
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

    const handleAddTag = async () => {
        if (!validateAll()) {
            return;
        }
        const selectedData = filteredList
            .filter((row) => selectedRows.includes(row.id))
            .map((row) => ({
                id: row.id,
                name: row.name,
                type: dataEditTag.type,
                channel: row.channel,
                symbol: row.symbol,
                unit: row.unit,
                device: { _id: row.deviceId, name: row.deviceName },
                dataFormat: row.dataFormat,
                selectMySQL: row.selectMySQL,
                selectSQL: row.selectSQL,
            }));

        if (action === 'DATABASE MYSQL') {
            const res = await createTableMySQL(dataDatabase, selectedData);
            if (res && res.EC === 0) {
                console.log('socket.connected =', socket.connected);
                socket.emit('CREATE TABLE MYSQL');
                toast.success(res.EM);
                handleClose();
            } else if (res && res.EC === 1) {
                const messages = res.DT.map(
                    item => `Server ${item.server}: ${item.existedTags.join(', ')}`
                ).join(' | ');
                toast.error(`${res.EM}: ${messages}`);
            } else {
                toast.error(res.EM);
            }
            return;
        }

        if (action === 'DATABASE SQL') {
            const res = await createTableSQL(dataDatabase, selectedData);
            if (res && res.EC === 0) {
                console.log('socket.connected =', socket.connected);
                socket.emit('CREATE TABLE SQL');
                toast.success(res.EM);
                handleClose();
            } else if (res && res.EC === 1) {
                const messages = res.DT.map(item => `Server ${item.server}: ${item.existedTags.join(', ')}`).join(' | ');
                toast.error(`${res.EM}: ${messages}`);
            } else {
                toast.error(res.EM);
            }
            return;
        }

        const res = await createNewHistorical(selectedData)
        if (res && res.EC === 0) {
            toast.success(res.EM);
            console.log('socket.connected =', socket.connected);
            socket.emit("CHANGE HISTORICAL");
            handleClose();
        } else {
            toast.error(res.EM);
        }
    };

    const handleChooseTagAlarm = (rowData) => {
        if (actionChooseTag === 'ALARM') {
            setDataModalAlarm(rowData);
        }
        else {
            console.log(rowData)
            setDataModalServer(rowData);
        }
        handleClose();
    }

    const columns = [
        { field: 'channel', headerName: 'Channel', flex: 1, align: 'center', headerAlign: 'center' },
        { field: 'name', headerName: 'Name', flex: 1, align: 'center', headerAlign: 'center' },
        { field: 'deviceName', headerName: 'Device', flex: 1, align: 'center', headerAlign: 'center' },
        { field: 'symbol', headerName: 'Symbol', flex: 1, align: 'center', headerAlign: 'center' },
        { field: 'unit', headerName: 'Unit', flex: 1, align: 'center', headerAlign: 'center' },
        ...((actionChooseTag === 'ALARM' || actionChooseTag === 'SERVER') ? [
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
                        right: 10,
                        top: 20,
                        width: { xs: 36, md: 48 },
                        height: { xs: 36, md: 25 },
                    }}
                >
                    <CancelIcon sx={{ fontSize: { xs: 32, md: 32 } }} />
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
                        {...((action === 'HISTORICAL' || action === 'DATABASE MYSQL' ||
                            action === 'DATABASE SQL' || action === 'MQTT') && { checkboxSelection: true })}
                        onRowSelectionModelChange={(newSelectionModel) => { setSelectedRows(newSelectionModel); }}
                        loading={loading}
                    />

                    {loading && <Loading text="Đang tải dữ liệu..." />}
                </Paper>
                {action === 'HISTORICAL' && (
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

                {(action === 'DATABASE MYSQL' || action === 'DATABASE SQL') && (
                    <Paper sx={{ mt: 2, width: "100%", p: 2, borderRadius: 2, boxShadow: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3, flexWrap: "wrap" }}>
                            <Typography sx={{ fontSize: 16, fontWeight: 500 }}>
                                Chọn Server:
                            </Typography>

                            {dataDatabase.map((server) => (
                                <Box key={server.id} sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                    <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 0.5 }}>
                                        {server.name}
                                    </Typography>
                                    <Checkbox
                                        checked={selectedServers.includes(server.name)}
                                        onChange={() => handleServerCheckboxChange(server.name)}
                                    />
                                </Box>
                            ))}
                        </Box>
                        {errors.group && (
                            <Typography sx={{ color: "red", mt: 1, fontSize: 12, textAlign: "center" }}>
                                {errors.group}
                            </Typography>
                        )}
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
                    {(action === 'HISTORICAL' || action === 'DATABASE MYSQL'
                        || action === 'DATABASE SQL' || action === 'MQTT') && (
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<AddBoxIcon />}
                                sx={{ ml: 1.5, textTransform: 'none' }}
                                onClick={handleAddTag}
                                disabled={selectedRows.length === 0}
                            >
                                {(action === 'HISTORICAL' || action === 'MQTT') ? 'Thêm' : 'Tạo Bảng'}
                            </Button>
                        )}
                </Box>
            </Box>
        </Modal>
    );
};

export default ModalSearchChannels;