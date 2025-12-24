import {
    useState, useEffect, useMemo, Paper, Button, Box, Fab,
    NoteAddIcon, DeleteForeverIcon, SettingsApplicationsIcon, toast,
    Loading, CustomDataGrid, socket, ModalDelete, ModalConfigHistorical,
    ModalEditConfig, ModalSearchChannels, ModalTagHistorical
} from '../../../ImportComponents/Imports';
import { fetchAllHistorical, deleteHistorical, fetchConfigHistorical, fetchAllChannels } from "../../../../Services/APIDevice";

const ListHistorical = () => {
    const [actionHistorical, setActionHistorical] = useState([]);
    const [openModalAdd, setOpenModalAdd] = useState(false);
    const [isShowModalEdit, setIsShowModalEdit] = useState(false);
    const [openModalConfig, setOpenModalConfig] = useState(false);
    const [openModalEdit, setOpenModalEdit] = useState(false);
    const [dataModalEditConfig, setDataModalEditConfig] = useState({});
    const [dataModalEditTag, setDataModalEditTag] = useState([]);
    const [dataConfig, setDataConfig] = useState([]);
    const [reloadConfig, setReloadConfig] = useState(false);

    const [isShowModalDelete, setIsShowModalDelete] = useState(false);
    const [dataModalDelete, setDataModalDelete] = useState([]);
    const [selectedCount, setSelectedCount] = useState(0);
    const [actionDeleteChannel, setactionDeleteHistorical] = useState([]);

    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5, });
    const [loading, setLoading] = useState(true);
    const [listChannel, setListChannel] = useState([]);
    const [listHistorical, setListHistorical] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);

    // const [dataListHistorical, setDataListHistorical] = useState([]);

    useEffect(() => {
        fetchChannel();
        fetchHistorical();
        fetchConfig();
    }, []);

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
            setListChannel(rowsWithId);
        }
        setLoading(false);
        setSelectedCount(0);
    };

    const fetchHistorical = async () => {
        let response = await fetchAllHistorical();
        setLoading(false);
        if (response && response.EC === 0 && Array.isArray(response.DT?.DT)) {
            const rows = response.DT.DT.map((item) => ({
                id: item._id,
                tagnameId: item.id,
                name: item.name,
                type: item.type
            }));
            setListHistorical(rows);
        }
        setSelectedCount(0);
    };

    const fetchConfig = async () => {
        let response = await fetchConfigHistorical();
        setLoading(false);
        //console.log('check listHistorical: ', response)
        if (response && response.EC === 0 && Array.isArray(response.DT?.DT)) {
            const rows = response.DT.DT.map((item) => ({
                id: item._id,
                name: item.name,
                type: item.type,
                cycle: item.cycle,
            }));
            setDataConfig(rows);
        }
    };

    // mở/đóng Modal Add
    const handleOpenModalAdd = () => {
        setActionHistorical('HISTORICAL');
        setOpenModalAdd(true);
    }
    const handleCloseModalAdd = () => { setOpenModalAdd(false); fetchHistorical(); }

    // mở/đóng Modal Edit
    const handleShowModalEditTag = (row) => {
        //console.log('check data row:', row)
        setDataModalEditTag(row)
        setIsShowModalEdit(true);
    }
    const handleCloseModalEditTag = () => { setIsShowModalEdit(false); fetchHistorical(); }

    // mở/đóng Modal Config
    const handleOpenModalConfig = () => { setOpenModalConfig(true); }
    const handleCloseModalConfig = () => { setOpenModalConfig(false); }

    // mở/đóng Modal Edit
    const handleOpenModalEditConfig = (rowData) => {
        setDataModalEditConfig(rowData);
        setOpenModalEdit(true);
    };

    const handleCloseModalEditConfig = () => {
        setOpenModalEdit(false);
        setReloadConfig(prev => !prev);
    }
    const handleCloseModalDelete = () => { setIsShowModalDelete(false); }
    const handleDeleteHistorical = (historical) => {
        let dataToDelete = [];
        if (historical) {
            dataToDelete = [{ id: historical.id, tagnameId: historical.tagnameId }];
            setSelectedCount(1);
        } else {
            dataToDelete = _listHistorical
                .filter(item => selectedRows.includes(item.id))
                .map(item => ({
                    id: item.id,
                    tagnameId: item.tagnameId
                }));
            setSelectedCount(dataToDelete.length);
        }
        setDataModalDelete(dataToDelete);
        setIsShowModalDelete(true);
        setactionDeleteHistorical('HISTORICAL');
    };

    const conformDeleteHistorical = async () => {
        // Gửi xuống cả id và tagnameId
        let res = await deleteHistorical({ list: dataModalDelete });
        let serverData = res;

        if (+serverData.EC === 0) {
            toast.success(serverData.EM);
            socket.emit('CHANGE HISTORICAL');
            setIsShowModalDelete(false);
            await fetchHistorical();
        } else {
            toast.error(serverData.EM);
        }
    };


    const _listHistorical = useMemo(() => {
        return listHistorical.map(his => {
            const channelInfo = listChannel.find(ch => ch.name === his.name);
            return {
                ...his,
                channel: channelInfo?.channel ?? '',
                deviceName: channelInfo?.deviceName ?? '',
                symbol: channelInfo?.symbol ?? '',
                unit: channelInfo?.unit ?? '',
            };
        });
    }, [listHistorical, listChannel]);

    const columns = [
        { field: 'channel', headerName: 'Channel', flex: 1, width: 80, align: 'center', headerAlign: 'center' },
        { field: 'name', headerName: 'Name', flex: 1, width: 200, align: 'center', headerAlign: 'center' },
        { field: 'deviceName', headerName: 'Device', flex: 1, width: 150, align: 'center', headerAlign: 'center' },
        { field: 'symbol', headerName: 'Symbol', flex: 1, width: 100, align: 'center', headerAlign: 'center' },
        { field: 'unit', headerName: 'Unit', flex: 1, width: 100, align: 'center', headerAlign: 'center' },
        { field: 'type', headerName: 'Group', flex: 1, width: 100, align: 'center', headerAlign: 'center' },
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
                            onClick={(e) => { e.stopPropagation(); handleDeleteHistorical(params.row); }}
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
                    onClick={(e) => { e.stopPropagation(); handleDeleteHistorical(); }}
                    sx={{ textTransform: 'none', visibility: selectedCount > 1 ? 'visible' : 'hidden', }}
                >
                    Xóa nhiều
                </Button>
            </Box>

            <Paper sx={{ height: 371, width: '100%' }}>
                <CustomDataGrid
                    rows={_listHistorical}
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
                <Fab color="primary" onClick={handleOpenModalConfig}>
                    <SettingsApplicationsIcon />
                </Fab>

                <Fab color="success" onClick={handleOpenModalAdd} >
                    <NoteAddIcon />
                </Fab>
            </Box>

            {/* Modal thêm mới */}
            <ModalSearchChannels
                action={actionHistorical}
                openModalAdd={openModalAdd}
                handleCloseModalAdd={handleCloseModalAdd}
                dataConfig={dataConfig}
            />

            {/* Modal chỉnh sửa Tag */}
            <ModalTagHistorical
                handleCloseModalEditTag={handleCloseModalEditTag}
                isShowModalEdit={isShowModalEdit}
                dataModalEditTag={dataModalEditTag}
                dataConfig={dataConfig}
            />

            {/* Modal cấu hình */}
            <ModalConfigHistorical
                openModalConfig={openModalConfig}
                handleCloseModalConfig={handleCloseModalConfig}
                handleOpenModalEditConfig={handleOpenModalEditConfig}
                reloadConfig={reloadConfig}
            />

            {/* Modal chỉnh sửa cấu hình */}
            <ModalEditConfig
                isShowModalEditConfig={openModalEdit}
                handleCloseModalEditConfig={handleCloseModalEditConfig}
                dataModalEditConfig={dataModalEditConfig}
            />

            {/* Modal xác nhận xóa */}
            <ModalDelete
                isShowModalDelete={isShowModalDelete}
                handleCloseModalDelete={handleCloseModalDelete}
                dataModalDelete={dataModalDelete}
                selectedCount={selectedCount}
                action={actionDeleteChannel}
                conformDeleteHistorical={conformDeleteHistorical}
            />
        </div>
    );
}

export default ListHistorical;
