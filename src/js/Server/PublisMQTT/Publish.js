import {
    useState, useEffect, Paper, Button, Box, ModalSearchChannels, ModalDelete, ModalAddTagPublish,
    AddBoxIcon, DeleteForeverIcon, Loading, CustomDataGrid, toast, BorderColorIcon, socket,
    PlayCircleOutlineIcon, StopIcon, SyncIcon, Fab, Grid
} from '../../ImportComponents/Imports';
import { fetchAllPublish, deletePublish, fetchAllDevices } from '../../../Services/APIDevice';

const ListPublishMqtt = () => {
    const [action, setAction] = useState([]);
    const [actionPublishMqtt, setActionPublishMqtt] = useState([]);
    const [actionDeletePublish, setActionDeletePublish] = useState([]);
    const [openModalAddTagPublish, setOpenModalAdd] = useState(false);

    const [isShowModalDelete, setIsShowModalDelete] = useState(false);
    const [dataModalDelete, setDataModalDelete] = useState([]);
    const [selectedCount, setSelectedCount] = useState(0);

    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5, });
    const [loading, setLoading] = useState(true);
    const [listPublishMqtt, setListPublishMqtt] = useState([]);
    const [dataEdit, setDataEdit] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);

    useEffect(() => {
        fetchPublish();
    }, []);

    const fetchPublish = async () => {
        setLoading(true);
        let response = await fetchAllPublish();
        if (response && response.EC === 0 && Array.isArray(response.DT?.DT)) {
            const rowsWithId = response.DT.DT.map((item) => ({
                id: item._id,
                tagnameId: item.tagnameId,
                channel: item.channel,
                name: item.name,
                deviceId: item.deviceId,
                deviceName: item.deviceName,
                controlRetain: item.controlRetain,
                controlQoS: item.controlQoS,
                topic: item.topic,
            }));
            setListPublishMqtt(rowsWithId);
        }
        setLoading(false);
        setSelectedCount(0);
    };

    const handleOpenModalAdd = () => {
        setAction('CREATE');
        setOpenModalAdd(true);
    }

    const handleOpenModalEdit = (row) => {
        setAction('UPDATE');
        setOpenModalAdd(true);
        setDataEdit(row);
    }

    const handleCloseModalAddPublish = () => { setOpenModalAdd(false); fetchPublish(); }

    const handleCloseModalDelete = () => { setIsShowModalDelete(false); }

    const handleDeletePublish = (PublishMqtt) => {
        let dataToDelete = [];
        if (PublishMqtt) {
            dataToDelete = [{ id: PublishMqtt.id }];
            setSelectedCount(1);
        } else {
            dataToDelete = listPublishMqtt
                .filter(item => selectedRows.includes(item.id))
                .map(item => ({ id: item.id }));
            setSelectedCount(dataToDelete.length);
        }
        setDataModalDelete(dataToDelete);
        setIsShowModalDelete(true);
        setActionDeletePublish('MQTT');
    };

    const conformDeletePublish = async () => {
        let res = await deletePublish({ list: dataModalDelete });
        let serverData = res;

        if (+serverData.EC === 0) {
            toast.success(serverData.EM);
            setIsShowModalDelete(false);
            fetchPublish();
        } else {
            toast.error(serverData.EM);
        }
    };

    const handleStartMQTTServer = () => {
        socket.emit('START MQTT SERVER', (res) => {
            if (res.success) {
                toast.success(res.message);
            } else {
                toast.error(res.message);
                console.error(res.error);
            }
        });
    }

    const handleStopMQTTServer = () => {
        socket.emit('STOP MQTT SERVER', (res) => {
            if (res.success) {
                toast.success(res.message);
            } else {
                toast.error(res.message);
                console.error(res.error);
            }
        });
    }

    const handleReloadMQTTServer = () => {
        socket.emit('RELOAD MQTT SERVER', (res) => {
            if (res.success) {
                toast.success(res.message);
            } else {
                toast.error(res.message);
                console.error(res.error);
            }
        });
    }

    const columns = [
        { field: 'channel', headerName: 'Channel', flex: 1, align: 'center', headerAlign: 'center' },
        { field: 'name', headerName: 'Name', flex: 1, align: 'center', headerAlign: 'center' },
        { field: 'deviceName', headerName: 'Device', flex: 1, align: 'center', headerAlign: 'center' },
        { field: 'topic', headerName: 'Topic', flex: 1, align: 'center', headerAlign: 'center' },
        { field: 'controlQoS', headerName: 'QoS', flex: 1, align: 'center', headerAlign: 'center' },
        { field: 'controlRetain', headerName: 'Retain', flex: 1, align: 'center', headerAlign: 'center' },
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
                            onClick={(e) => { e.stopPropagation(); handleOpenModalEdit(params.row); }}
                        >
                            Sửa
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<DeleteForeverIcon />}
                            sx={{ textTransform: 'none', minWidth: 80 }}
                            onClick={(e) => { e.stopPropagation(); handleDeletePublish(params.row); }}
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
            {listPublishMqtt.length >= 0 && (
                <Grid
                    container
                    columnSpacing={55}
                    rowSpacing={0}
                    sx={{ px: 25, mb: 1.5 }}
                >
                    <Grid item xs={4}>
                        <Button
                            fullWidth
                            variant="contained"
                            color="success"
                            startIcon={<PlayCircleOutlineIcon />}
                            onClick={handleStartMQTTServer}
                            sx={{ height: 45, fontSize: 18, borderRadius: 2 }}
                        >
                            Start
                        </Button>
                    </Grid>

                    <Grid item xs={4}>
                        <Button
                            fullWidth
                            variant="contained"
                            color="error"
                            startIcon={<StopIcon />}
                            onClick={handleStopMQTTServer}
                            sx={{ height: 45, fontSize: 18, borderRadius: 2 }}
                        >
                            Stop
                        </Button>
                    </Grid>

                    <Grid item xs={4}>
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            startIcon={<SyncIcon />}
                            onClick={handleReloadMQTTServer}
                            sx={{ height: 45, fontSize: 18, borderRadius: 2 }}
                        >
                            Reload
                        </Button>
                    </Grid>
                </Grid>
            )}

            <Box sx={{ height: 30, display: 'flex', alignItems: 'center', pb: 2 }}  >
                <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteForeverIcon />}
                    onClick={(e) => { e.stopPropagation(); handleDeletePublish(); }}
                    sx={{ textTransform: 'none', visibility: selectedCount > 1 ? 'visible' : 'hidden', }}
                >
                    Xóa nhiều
                </Button>
            </Box>

            <Paper sx={{ height: 400, width: '100%' }}>
                <CustomDataGrid
                    rows={listPublishMqtt}
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
                <Fab color="success" onClick={handleOpenModalAdd} >
                    <AddBoxIcon />
                </Fab>
            </Box>

            {/* Modal thêm mới */}
            <ModalAddTagPublish
                action={action}
                openModalAddPublish={openModalAddTagPublish}
                handleCloseModalAddPublish={handleCloseModalAddPublish}
                dataModalPublish={dataEdit}
            />

            <ModalSearchChannels

            />

            <ModalDelete
                isShowModalDelete={isShowModalDelete}
                handleCloseModalDelete={handleCloseModalDelete}
                dataModalDelete={dataModalDelete}
                selectedCount={selectedCount}
                action={actionDeletePublish}
                conformDeletePublish={conformDeletePublish}
            />

        </div>
    );
}

export default ListPublishMqtt;
