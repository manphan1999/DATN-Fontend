import {
    useState, useEffect, _, Typography, Checkbox, Paper, Button, BorderColorIcon,
    NoteAddIcon, DeleteForeverIcon, Box, toast, SettingsApplicationsIcon, Loading,
    ModalSearchChannels, ModalDelete, CustomDataGrid, ModalAddTagAlarm, ModalConfigAlarm,
    ModalEditApp, socket, InfoOutlinedIcon, WarningAmberIcon, ErrorIcon, Fab
} from '../../../ImportComponents/Imports';
import { fetchAllTagAlarm, deleteTagAlarm } from "../../../../Services/APIDevice";

const ListAlarm = () => {
    const [action, setAction] = useState();
    const [actionChooseTag, setActionChooseTag] = useState();
    const [openModalAddAlarm, setopenModalAddAlarm] = useState(false);
    const [openModalSearchTag, setopenModalSearchTag] = useState(false);
    const [openModalAddApp, setopenModalAddApp] = useState(false);
    const [openModalEditApp, setopenModalEditApp] = useState(false);
    const [reloadDataApp, setreloadDataApp] = useState(false);
    const [dataModalAlarm, setDataModalAlarm] = useState([]);
    const [dataModalApp, setDataModalApp] = useState([]);

    const [isShowModalDelete, setIsShowModalDelete] = useState(false);
    const [dataModalDelete, setDataModalDelete] = useState([]);
    const [selectedCount, setSelectedCount] = useState(0);

    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5, });
    const [loading, setLoading] = useState(true);
    const [listAlarm, setlistAlarm] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);

    useEffect(() => {
        fetchTagAlarm();
    }, []);

    const fetchTagAlarm = async () => {
        setLoading(true);
        let response = await fetchAllTagAlarm();
        //console.log('check fetchAllTagAlarm: ', response)
        if (response && response.EC === 0 && Array.isArray(response.DT?.DT)) {
            const rowsWithId = response.DT.DT.map((item) => ({
                id: item._id,
                tagnameId: item.tagnameId,
                name: item.name,
                deviceId: item.deviceId,
                deviceName: item.deviceName,
                condition: item.condition,
                content: item.content,
                type: item.type,
                title: item.title,
                rangeAlarm: item.rangeAlarm,
                selection: item.selection,
            }));
            setlistAlarm(rowsWithId);
        }
        setLoading(false);
        setSelectedCount(0);
    };

    // mở/đóng Modal Add
    const handleopenModalAddAlarm = () => {
        setAction('CREATE');
        setopenModalAddAlarm(true);
    }

    const handleopenModalApp = () => {
        setopenModalAddApp(true);
    }

    const handleEditAlarm = (tagAlarm) => {
        //  console.log('check tag Alarm update: ', tagAlarm)
        setAction('UPDATE')
        setopenModalAddAlarm(true);
        setDataModalAlarm(tagAlarm);
    };

    const handleCloseModalAddApp = () => { setopenModalAddApp(false); }
    const handleCloseModalEditApp = () => { setopenModalEditApp(false); setreloadDataApp(true); }

    const handleCloseModalAddAlarm = () => {
        setopenModalAddAlarm(false);
        fetchTagAlarm();
    }
    const handleCloseModalSearchTag = () => { setopenModalSearchTag(false); }
    const handleCloseModalDelete = () => { setIsShowModalDelete(false); setSelectedCount(0); }

    const handleDeleteTagAlarm = (rawData) => {
        let dataToDelete = [];
        if (rawData) {
            dataToDelete = [{ id: rawData.id, tagnameId: rawData.tagnameId }];
            setSelectedCount(1);
        } else {
            dataToDelete = listAlarm
                .filter(item => selectedRows.includes(item.id))
                .map(item => ({
                    id: item.id,
                    tagnameId: item.tagnameId
                }));
            setSelectedCount(dataToDelete.length);
        }
        setDataModalDelete(dataToDelete);
        setIsShowModalDelete(true);
        setActionChooseTag('ALARM');
    };

    const conformDeleteAlarm = async () => {
        // Gửi xuống cả id và tagnameId
        console.log('check { list: dataModalDelete } ', { list: dataModalDelete })
        let res = await deleteTagAlarm({ list: dataModalDelete });
        let serverData = res;
        if (+serverData.EC === 0) {
            toast.success(serverData.EM);
            socket.emit('DELETE ALARM');
            setIsShowModalDelete(false);
            await fetchTagAlarm();
        } else {
            toast.error(serverData.EM);
        }
    };

    const columns = [
        { field: 'name', headerName: 'Name', flex: 1, width: 200, align: 'center', headerAlign: 'center' },
        { field: 'deviceName', headerName: 'Device', flex: 1, width: 150, align: 'center', headerAlign: 'center' },
        { field: 'condition', headerName: 'Condition', flex: 1, width: 100, align: 'center', headerAlign: 'center' },
        { field: 'rangeAlarm', headerName: 'Range', flex: 1, width: 100, align: 'center', headerAlign: 'center' },
        {
            field: 'type',
            headerName: 'Type',
            flex: 1,
            width: 100,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                const type = params.row.type;

                const typeMap = {
                    Info: { icon: <InfoOutlinedIcon color="primary" />, label: 'Info' },
                    Warning: { icon: <WarningAmberIcon color="warning" />, label: 'Warning' },
                    Error: { icon: <ErrorIcon color="error" />, label: 'Error' },
                };

                const current = typeMap[type] || { icon: null, label: '-' };

                return (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                            width: '100%',
                            height: '100%',
                        }}
                    >
                        {current.icon}
                        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                            {current.label}
                        </Typography>
                    </Box>
                );
            },
        },
        {
            field: 'selection',
            headerName: 'Notify',
            flex: 1,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => {
                const selection = params.row.selection || {};
                const notifyList = [
                    { name: "Line", color: "success" },
                    { name: "Telegram", color: "primary" },
                ];
                return (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
                        {notifyList.map(({ name, color }) => (
                            <Box
                                key={name}
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{name}</Typography>
                                <Checkbox
                                    color={color}
                                    checked={!!selection[name]}
                                />
                            </Box>
                        ))}
                    </Box>
                );
            },
        },
        {
            field: 'action',
            headerName: 'Action',
            width: 190,
            headerAlign: 'center', align: 'center',
            renderCell: (params) => (
                <>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, height: '100%', }}  >
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<BorderColorIcon />}
                            sx={{ textTransform: 'none', minWidth: 80 }}
                            onClick={(e) => { e.stopPropagation(); handleEditAlarm(params.row); }}
                        >
                            Sửa
                        </Button>

                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<DeleteForeverIcon />}
                            sx={{ textTransform: 'none', minWidth: 80 }}
                            onClick={(e) => { e.stopPropagation(); handleDeleteTagAlarm(params.row); }}
                        >
                            Xóa
                        </Button>
                    </Box>

                </>
            ),
        }
    ];

    return (
        <div>
            <Box sx={{ height: 30, display: 'flex', alignItems: 'center', pb: 2 }}  >
                <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteForeverIcon />}
                    onClick={(e) => { e.stopPropagation(); handleDeleteTagAlarm(); }}
                    sx={{ textTransform: 'none', visibility: selectedCount > 1 ? 'visible' : 'hidden', }}
                >
                    Xóa nhiều
                </Button>
            </Box>

            <Paper sx={{ height: 371, width: '100%' }}>
                <CustomDataGrid
                    rows={listAlarm}
                    columns={columns}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[5, 10, 20]}
                    pagination
                    checkboxSelection
                    onRowSelectionModelChange={(newSelection) => {
                        setSelectedRows(newSelection);
                        setSelectedCount(newSelection.length);
                    }}

                    loading={loading}
                />
                {loading && <Loading text="Đang tải dữ liệu..." />}
            </Paper>

            <Box
                sx={{
                    position: 'fixed', bottom: 24, right: 24, '& > :not(style)': { m: 1 }, zIndex: 1200,    // luôn nổi trên UI
                }}
            >
                <Fab color="primary" onClick={handleopenModalApp}>
                    <SettingsApplicationsIcon />
                </Fab>

                <Fab color="success" onClick={handleopenModalAddAlarm} >
                    <NoteAddIcon />
                </Fab>
            </Box>

            {/* Modal thêm mới */}
            <ModalAddTagAlarm
                action={action}
                setActionChooseTag={setActionChooseTag}
                openModalAddAlarm={openModalAddAlarm}
                handleCloseModalAddAlarm={handleCloseModalAddAlarm}
                setopenModalSearchTag={setopenModalSearchTag}
                dataModalAlarm={dataModalAlarm}
            //dataConfig={dataConfig}
            />

            <ModalSearchChannels
                actionChooseTag={actionChooseTag}
                openModalSearchTag={openModalSearchTag}
                handleCloseModalAdd={handleCloseModalSearchTag}
                setDataModalAlarm={setDataModalAlarm}
            />

            {/* Modal xác nhận xóa */}
            <ModalDelete
                isShowModalDelete={isShowModalDelete}
                handleCloseModalDelete={handleCloseModalDelete}
                dataModalDelete={dataModalDelete}
                conformDeleteAlarm={conformDeleteAlarm}
                selectedCount={selectedCount}
                action={actionChooseTag}
            />

            {/* Modal cấu hình app cảnh báo */}
            <ModalConfigAlarm
                openModalAddApp={openModalAddApp}
                handleCloseModalApp={handleCloseModalAddApp}
                setopenModalEditApp={setopenModalEditApp}
                setreloadDataApp={setreloadDataApp}
                reloadDataApp={reloadDataApp}
                setDataModalApp={setDataModalApp}
            />

            {/* Modal chỉnh sửa cấu hình app */}
            <ModalEditApp
                openModalEditApp={openModalEditApp}
                dataModalApp={dataModalApp}
                handleCloseModalApp={handleCloseModalAddApp}
                handleCloseModalEditApp={handleCloseModalEditApp}
            />
        </div>
    );
}

export default ListAlarm;
