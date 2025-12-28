import {
    useState, useEffect, Paper, Button, Box, ModalSearchChannels, ModalDelete, ModalAddConfigMQTT,
    AddBoxIcon, DeleteForeverIcon, Loading, CustomDataGrid, toast, BorderColorIcon, socket,
    PlayCircleOutlineIcon, StopIcon, SyncIcon, Fab, Grid, ModalConfigMQTT, SettingsApplicationsIcon
} from '../../ImportComponents/Imports';
import { fetchAllPublish, deletePublish, deleteConfigPublish } from '../../../Services/APIDevice';

const ListPublishMqtt = () => {
    const [actionConfig, setActionConfig] = useState([]);
    const [actionAdd, setActionAdd] = useState([]);
    const [actionPublishMqtt, setActionPublishMqtt] = useState([]);
    const [actionDelete, setActionDelete] = useState([]);
    const [openModalAddTag, setOpenModalAddTag] = useState(false);
    const [openModalAddConfigMQTT, setOpenModalAddConfigMQTT] = useState(false);
    const [openModalConfig, setOpenModalConfig] = useState(false);
    const [isShowModalDelete, setIsShowModalDelete] = useState(false);
    const [reloadDataConfig, setReloadDataConfig] = useState(false);
    const [dataModalDelete, setDataModalDelete] = useState([]);
    const [selectedCount, setSelectedCount] = useState(0);

    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5, });
    const [loading, setLoading] = useState(true);
    const [listPublishMqtt, setListPublishMqtt] = useState([]);
    const [dataEditConfig, setDataEditConfig] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);

    useEffect(() => {
        fetchTagPublish();
    }, []);

    const fetchTagPublish = async () => {
        setLoading(true);
        let response = await fetchAllPublish();
        if (response && response.EC === 0 && Array.isArray(response.DT?.DT)) {
            const rowsWithId = response.DT.DT.map((item) => ({
                id: item._id,
                name: item.name,
                channel: item.channel,
                symbol: item.symbol,
                unit: item.unit,
            }));
            setListPublishMqtt(rowsWithId);
        }
        setLoading(false);
    };

    const handleOpenModalAddConfig = () => {
        setActionConfig('CREATE');
        setReloadDataConfig(false);
        setOpenModalAddConfigMQTT(true);
    }

    const handleOpenModalEditConfig = (row) => {
        setActionConfig('UPDATE');
        setReloadDataConfig(false);
        setOpenModalAddConfigMQTT(true);
        setDataEditConfig(row);
    }

    const handleOpenModalAddTag = () => {
        setActionAdd('MQTT');
        setOpenModalAddTag(true);
    }

    const handleCloseModalAddTag = () => { setOpenModalAddTag(false); fetchTagPublish(); }
    const handleCloseModalAddConfigMQTT = () => { setOpenModalAddConfigMQTT(false); setReloadDataConfig(true); }
    const handleCloseModalDelete = () => { setIsShowModalDelete(false); }

    const handleOpenModalConfig = () => {
        setOpenModalConfig(true);
    }
    const handleCloseModalConfig = () => { setOpenModalConfig(false); setReloadDataConfig(false); }

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
        setActionDelete('MQTT');
    };

    const conformDeletePublish = async () => {
        let res = await deletePublish({ list: dataModalDelete });
        let serverData = res;

        if (+serverData.EC === 0) {
            socket.emit('CHANGE PUBLISH');
            toast.success(serverData.EM);
            setIsShowModalDelete(false);
            fetchTagPublish();
        } else {
            toast.error(serverData.EM);
        }
    };

    const handleDeleteConfig = (config) => {
        setReloadDataConfig(false);
        let dataToDelete = [];
        if (config) {
            dataToDelete = [{ id: config.id }];
            setSelectedCount(1);
        }
        setDataModalDelete(dataToDelete);
        setIsShowModalDelete(true);
        setActionDelete('CONFIG MQTT');
    };

    const conformDeleteConfig = async () => {
        let res = await deleteConfigPublish({ list: dataModalDelete });
        let serverData = res;

        if (+serverData.EC === 0) {
            socket.emit('CHANGE PUBLISH');
            toast.success(serverData.EM);
            setIsShowModalDelete(false);
            setReloadDataConfig(true);
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
        { field: 'channel', headerName: 'Channel', flex: 1, width: 80, align: 'center', headerAlign: 'center' },
        { field: 'name', headerName: 'Name', flex: 1, width: 200, align: 'center', headerAlign: 'center' },
        { field: 'symbol', headerName: 'Symbol', flex: 1, width: 100, align: 'center', headerAlign: 'center' },
        { field: 'unit', headerName: 'Unit', flex: 1, width: 100, align: 'center', headerAlign: 'center' },
        {
            field: 'action',
            headerName: 'Action',
            flex: 1,
            headerAlign: 'center', align: 'center',
            renderCell: (params) => (
                <>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, height: '100%', }}  >
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
            {/* {listPublishMqtt.length >= 0 && (
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
            )} */}

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
                <Fab color="primary" onClick={handleOpenModalConfig} >
                    <SettingsApplicationsIcon />
                </Fab>
                <Fab color="success" onClick={handleOpenModalAddTag} >
                    <AddBoxIcon />
                </Fab>
            </Box>

            {/* Modal thêm mới */}
            <ModalAddConfigMQTT
                action={actionConfig}
                openModalAddPublish={openModalAddConfigMQTT}
                handleCloseModalAddConfigMQTT={handleCloseModalAddConfigMQTT}
                dataModalConfig={dataEditConfig}
                setReloadDataConfig={setReloadDataConfig}
            />

            <ModalConfigMQTT
                openModalConfig={openModalConfig}
                reloadDataConfig={reloadDataConfig}
                handleCloseModalConfig={handleCloseModalConfig}
                handleOpenModalAddConfig={handleOpenModalAddConfig}
                handleDeleteConfig={handleDeleteConfig}
                handleOpenModalEditConfig={handleOpenModalEditConfig}
            />

            <ModalSearchChannels
                action={actionAdd}
                openModalAdd={openModalAddTag}
                handleCloseModalAdd={handleCloseModalAddTag}
            />

            <ModalDelete
                isShowModalDelete={isShowModalDelete}
                handleCloseModalDelete={handleCloseModalDelete}
                dataModalDelete={dataModalDelete}
                selectedCount={selectedCount}
                action={actionDelete}
                conformDeleteConfig={conformDeleteConfig}
                conformDeletePublish={conformDeletePublish}
            />

        </div>
    );
}

export default ListPublishMqtt;
