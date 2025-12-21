import {
    Box, useEffect, useMemo, useState, Typography, Paper, Chip, Grid, IconButton, Loading, socket,
    CustomDataGrid, HelpOutlineIcon, CheckCircleIcon, WarningAmberIcon, ErrorIcon, SensorsOffIcon,
    TableRowsIcon, ViewModuleIcon, NavigateBeforeIcon, NavigateNextIcon, toast, InputPopover
} from '../ImportComponents/Imports';

/* =============== Mini Gauge (SVG) =============== */
const GaugeMini = ({ value, unit, channel, name, status, handleRowClick }) => {
    const H = 100, W = 100;
    const cx = 50, cy = 50, r = 50;

    const isNormal = status === 'Normal';
    const cardBg = isNormal ? 'rgba(78, 183, 83, 1)' : 'rgba(211,47,47,.95)';
    const cardBorder = isNormal ? 'rgba(46,125,50,1)' : 'rgba(211,47,47,1)';

    return (
        <Paper
            elevation={0} onClick={handleRowClick}
            sx={{
                borderRadius: 5,
                p: 2,
                border: '1px solid',
                borderColor: cardBorder,
                bgcolor: cardBg,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
            }}
        >
            {/* Channel pill */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip
                    label={`CH ${channel ?? '-'}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 700, color: '#fff', borderColor: 'rgba(255,255,255,.55)' }}
                />
                <Box sx={{ width: 24 }} />
            </Box>

            {/* vòng tròn trắng */}
            <Box sx={{ display: 'grid', placeItems: 'center', mt: 0 }}>
                <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
                    <circle cx={cx} cy={cy} r={r} fill="#fff" />
                    <text
                        x="50%" y="50%"
                        dominantBaseline="middle" textAnchor="middle"
                        style={{ fontSize: 25, fontWeight: 600, fill: '#000' }}
                    >
                        {value ?? '--'}
                    </text>
                    <text
                        x="50%" y="75%"
                        dominantBaseline="middle" textAnchor="middle"
                        style={{ fontSize: 12, fill: '#000' }}
                    >
                        {unit || ''}
                    </text>
                </svg>
            </Box>

            {/* Name */}
            <Typography
                variant="subtitle2"
                sx={{ mt: 'auto', textAlign: 'center', fontWeight: 700, color: '#fff' }}
            >
                {name || ''}
            </Typography>
        </Paper>
    );
};

/* =============== Main =============== */
const PAGE_SIZE_GRID = 12; // 4 x 3

export default function HomeLayout() {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);
    // DataGrid pagination
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5 });
    // view toggle
    const [isGrid, setIsGrid] = useState(true);
    const toggleView = () => setIsGrid((v) => !v);

    // Grid pagination
    const [gridPage, setGridPage] = useState(0);
    const startIdx = gridPage * PAGE_SIZE_GRID;
    const endIdx = Math.min(startIdx + PAGE_SIZE_GRID, rows.length);
    const pageRows = rows.slice(startIdx, endIdx);
    const canPrev = gridPage > 0;
    const canNext = endIdx < rows.length;
    const handlePrev = () => canPrev && setGridPage((p) => p - 1);
    const handleNext = () => canNext && setGridPage((p) => p + 1);

    useEffect(() => {
        if (gridPage > 0 && startIdx >= rows.length) setGridPage(0);
    }, [rows.length, gridPage, startIdx]);

    // Socket realtime
    useEffect(() => {
        socket.connect();

        const onHomeData = (data) => {
            const mapped = (Array.isArray(data) ? data : []).map((item) => {
                let statusText = 'Sample';
                if (item.status === 1) statusText = 'Normal';
                else if (item.status === 2) statusText = 'Over range';
                else if (item.status === 3) statusText = 'Disconnect';

                return {
                    name: item.tagname,
                    channel: Number(item.channel ?? 0),
                    deviceName: item.deviceName,//deviceMap[item.deviceId] || item.deviceId || '',
                    deviceId: item.deviceId,
                    symbol: item.symbol,
                    value: item.value,
                    unit: item.unit,
                    status: statusText,
                    slaveId: item.slaveId,
                    address: item.address,
                    functionCode: item.functionCode,
                    dataFormat: item.dataFormat,
                    dataType: item.dataType,
                    permission: item.permission,
                };
            });

            const sorted = mapped
                .sort((a, b) => a.channel - b.channel)
                .map((it, idx) => ({ ...it, id: idx + 1 }));

            setRows(sorted);
            setLoading(false);
        };

        socket.on('SERVER SEND HOME DATA', onHomeData);
        socket.on("SERVER WRITE RESULT", (res) => {
            if (res.success) {
                toast.success(res.message || "Ghi thành công!");
            } else {
                toast.error("Ghi thất bại: " + res.error);
            }
        });
        return () => {
            socket.off("SERVER WRITE RESULT");
            socket.off('SERVER SEND HOME DATA', onHomeData);
            socket.disconnect();
        };
    }, []);

    const handleRowClick = (params, event) => {
        if (params?.row?.permission === true) {
            setSelectedRow(params.row);
            setAnchorEl(event?.currentTarget || event?.target);
        }
    };

    const handleClosePopover = () => {
        setAnchorEl(null);
        setSelectedRow(null);
    };

    const handleConfirmValue = (newValue) => {
        const payload = {
            tagnameId: selectedRow?.id,
            deviceId: selectedRow?.deviceId,
            slaveId: selectedRow?.slaveId,
            address: selectedRow?.address,
            functionCode: selectedRow?.functionCode,
            dataFormat: selectedRow?.dataFormat,
            dataType: selectedRow?.dataType,
            newValue: newValue,
        };
        socket.emit("CLIENT WRITE TAG", payload);
        handleClosePopover();
    };
    // Status chip
    const renderStatus = (params) => {
        const val = params.value || 'Unknown';
        let color = 'default';
        let icon = <HelpOutlineIcon sx={{ fontSize: 18 }} />;
        if (val === 'Normal') { color = 'success'; icon = <CheckCircleIcon sx={{ fontSize: 18 }} />; }
        else if (val === 'Over range') { color = 'warning'; icon = <WarningAmberIcon sx={{ fontSize: 18 }} />; }
        else if (val === 'Disconnect') { color = 'error'; icon = <ErrorIcon sx={{ fontSize: 18 }} />; }
        else if (val === 'Sample') { color = 'secondary'; icon = <SensorsOffIcon sx={{ fontSize: 18 }} />; }

        return (
            <Chip
                icon={icon}
                label={val}
                color={color}
                variant="filled"
                sx={{
                    fontWeight: 600,
                    minWidth: 120,
                    justifyContent: 'center',
                    pl: 1,
                    '& .MuiChip-icon': { ml: .3 }
                }}
            />
        );
    };

    // Table columns
    const columns = useMemo(() => [
        // { field: 'id', headerName: 'ID', flex: 1, headerAlign: 'center', align: 'center', minWidth: 60 },
        { field: 'channel', headerName: 'Channel', flex: 1, headerAlign: 'center', align: 'center', minWidth: 140, sortComparator: (v1, v2) => Number(v1) - Number(v2) },
        { field: 'name', headerName: 'Name', flex: 1, headerAlign: 'center', align: 'center', minWidth: 140 },
        { field: 'deviceName', headerName: 'Device', flex: 1, headerAlign: 'center', align: 'center', minWidth: 140 },
        { field: 'symbol', headerName: 'Symbol', flex: 1, headerAlign: 'center', align: 'center', minWidth: 120 },
        { field: 'value', headerName: 'Value', flex: 1, headerAlign: 'center', align: 'center', minWidth: 120 },
        { field: 'unit', headerName: 'Unit', flex: 1, headerAlign: 'center', align: 'center', minWidth: 90 },
        { field: 'status', headerName: 'Status', flex: 1, headerAlign: 'center', align: 'center', minWidth: 140, renderCell: renderStatus },
    ], []);

    return (
        <Box
            sx={{
                p: 0,
                height: '100%',
                maxHeight: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
            }}
        >
            {/* Header + Toggle */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: 1 }}>
                        DASHBOARD
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                        Welcome to your dashboard
                    </Typography>
                </Box> */}

                <IconButton onClick={toggleView} color="primary" title={isGrid ? 'Chuyển sang bảng' : 'Chuyển sang lưới'}>
                    {isGrid ? <TableRowsIcon /> : <ViewModuleIcon />}
                    {/* {isGrid ? 'Dạng bảng' : 'Chỉnh sửa'} */}
                </IconButton>
            </Box>

            {/* Content – chiếm phần còn lại */}
            <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                {isGrid ? (
                    <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1, }}>
                                <Typography variant="body2" sx={{ mr: 0.5 }}>
                                    Trang hiện tại: {rows.length === 0 ? '0 – 0 / 0' : `${startIdx + 1} – ${endIdx} / ${rows.length}`}
                                </Typography>
                                <IconButton size="small" onClick={handlePrev} disabled={!canPrev}>
                                    <NavigateBeforeIcon />
                                </IconButton>
                                <IconButton size="small" onClick={handleNext} disabled={!canNext}>
                                    <NavigateNextIcon />
                                </IconButton>
                            </Box>

                            <Grid container spacing={2} justifyContent="center" sx={{ px: 2, mb: 1 }}>
                                {pageRows.map((r) => (
                                    <Grid item key={r.id} xs={12} sm={6} md={4} lg={3}>
                                        <GaugeMini
                                            channel={r.channel}
                                            name={r.name}
                                            value={r.value}
                                            unit={r.unit}
                                            status={r.status}
                                            handleRowClick={(event) => handleRowClick({ row: r }, event)}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>

                        {loading && (
                            <Paper sx={{ p: 2, mt: 2 }}>
                                <Loading text="Đang tải dữ liệu realtime..." />
                            </Paper>
                        )}
                    </Box>
                ) : (

                    <Paper sx={{ height: 400, m: 0.5 }}>
                        <CustomDataGrid
                            rows={rows}
                            columns={columns}
                            paginationModel={paginationModel}
                            onPaginationModelChange={setPaginationModel}
                            pageSizeOptions={[5, 10, 20]}
                            pagination
                            onRowClick={handleRowClick}
                            hideFooterSelectedRowCount
                            loading={loading}
                            initialState={{
                                sorting: { sortModel: [{ field: 'channel', sort: 'asc' }] },
                            }}
                        />
                        {loading && <Loading text="Đang tải dữ liệu realtime..." />}
                    </Paper>
                )}
            </Box>

            <InputPopover
                anchorEl={anchorEl}
                onClose={handleClosePopover}
                onConfirm={handleConfirmValue}
                functionCode={selectedRow?.functionCode}
                dataFormat={selectedRow?.dataFormat}
                dataType={selectedRow?.dataType}
                defaultValue={selectedRow?.value || 0}
            />
        </Box>
    );
}
