import {
    useState, useEffect, Paper, Button, Box, ModalSearchChannels, ModalAddTagServer,
    AddBoxIcon, DeleteForeverIcon, Loading, CustomDataGrid, BorderColorIcon, Grid,
    ModalDelete, toast, socket, PlayCircleOutlineIcon, SyncIcon, StopIcon, Fab
} from '../../ImportComponents/Imports';
import {
    fetchAllTCPServer, fetchAllDataFormat, fetchAllDataType, fetchAllFunctionCode, deleteTCPServer,
} from '../../../Services/APIDevice';

const ListTCPServer = () => {
    const [actionTCPServer, setActionTCPServer] = useState([]);
    const [actionChooseTag, setActionChooseTag] = useState([]);
    const [actionDelete, setActionDelete] = useState([]);
    const [dataModalServer, setDataModalServer] = useState([]);
    const [dataModalDelete, setDataModalDelete] = useState([]);
    const [openModalAdd, setOpenModalAdd] = useState(false);
    const [openModalSearchTag, setOpenModalSearchTag] = useState(false);
    const [isShowModalDelete, setIsShowModalDelete] = useState(false);
    const [selectedCount, setSelectedCount] = useState(0);

    const [listDataFormat, setlistDataFormat] = useState([]);
    const [listDataType, setlistDataType] = useState([]);
    const [listFunctionCode, setlistFunctionCode] = useState({ modbus: [], mqtt: [] });
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5, });
    const [loading, setLoading] = useState(true);
    const [listTCPServer, setListTCPServer] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);

    useEffect(() => {
        fetchTCPServer();

    }, []);

    useEffect(() => {
        const init = async () => {
            await fetchFunctionCode();
            await fetchDataFormat();
            await fetchDataType();
        };
        init();
    }, [dataModalServer]);

    const findNameById = (id, list) => {
        const item = list.find(item => item.id === id);
        return item ? item.name : id;
    };

    const findFunctionCodeNameById = (id) => {
        let item = listFunctionCode.modbus.find(item => item.id === id);
        if (item) return item.name;

        item = listFunctionCode.mqtt.find(item => item.id === id);
        return item ? item.name : id;
    };

    const fetchTCPServer = async () => {
        setLoading(true);
        let response = await fetchAllTCPServer();
        if (response && response.EC === 0 && Array.isArray(response.DT?.DT)) {
            const rowsWithId = response.DT.DT.map((item) => ({
                id: item._id,
                name: item.name,
                deviceId: item.deviceId,
                deviceName: item.deviceName,
                address: item.address,
                functionCode: item.functionCode,
                functionCodeName: findFunctionCodeNameById(item.functionCode),
                dataFormat: item.dataFormat,
                dataFormatName: findNameById(item.dataFormat, listDataFormat),
                dataType: item.dataType,
                dataTypeName: findNameById(item.dataType, listDataType),
            }));
            setListTCPServer(rowsWithId);
        }
        setLoading(false);
        setSelectedCount(0);
    };
    const fetchDataFormat = async () => {
        let response = await fetchAllDataFormat();

        if (response && response.EC === 0 && Array.isArray(response.DT?.DT)) {
            const listDataFormats = response.DT.DT.map((item) => ({
                id: item._id,
                name: item.name,
            }));
            setlistDataFormat(listDataFormats);
            return listDataFormats;
        }
        return [];
    };

    const fetchDataType = async () => {
        let response = await fetchAllDataType();
        if (response && response.EC === 0 && Array.isArray(response.DT?.DT)) {
            const listDataTypes = response.DT.DT.map((item) => ({
                id: item._id,
                name: item.name,
            }));
            setlistDataType(listDataTypes);
            return listDataTypes;
        }
        return [];
    };

    const fetchFunctionCode = async () => {
        let response = await fetchAllFunctionCode();
        if (response && response.EC === 0 && response.DT) {
            const listFuncModbus = response.DT.Modbus?.map(item => ({
                id: item._id,
                name: item.name,
            })) || [];

            const listFuncMQTT = response.DT.MQTT?.map(item => ({
                id: item._id,
                name: item.name,
            })) || [];

            setlistFunctionCode({
                modbus: listFuncModbus,
                mqtt: listFuncMQTT
            });

            return {
                modbus: listFuncModbus,
                mqtt: listFuncMQTT
            };
        }
        return { modbus: [], mqtt: [] };
    };

    const handleOpenModalAdd = () => {
        setActionTCPServer('CREATE TCP');
        setOpenModalAdd(true);
    }
    const handleCloseModalAddServer = () => { setOpenModalAdd(false); fetchTCPServer(); }

    const handleCloseModalSearch = () => { setOpenModalSearchTag(false); fetchTCPServer(); }

    const handleEditTCPServer = (row) => {
        setDataModalServer(row);
        setActionTCPServer('UPDATE TCP');
        setOpenModalAdd(true);
    }

    const handleCloseModalDelete = () => { setIsShowModalDelete(false); fetchTCPServer(); }

    const handleDeleteTCPServer = (row) => {
        let dataToDelete = [];
        if (row) {
            dataToDelete = [{ id: row.id }];
            setSelectedCount(1);
        } else {
            dataToDelete = listTCPServer
                .filter(item => selectedRows.includes(item.id))
                .map(item => ({ id: item.id }));
            setSelectedCount(dataToDelete.length);
        }
        setDataModalDelete(dataToDelete);
        setActionDelete('TCPSERVER');
        setIsShowModalDelete(true);
    };

    const handleStartTCPServer = () => {
        if (listTCPServer.length > 0) {
            socket.emit('START TCP SERVER', (res) => {
                if (res.success) {
                    toast.success(res.message);
                } else {
                    toast.error(res.message);
                    console.error(res.error);
                }
            });
        } else {
            toast.info('Vui lòng tạo tag để sử dụng');
        }
    }

    const handleStopTCPServer = () => {
        if (listTCPServer.length > 0) {
            socket.emit('STOP TCP SERVER', (res) => {
                if (res.success) {
                    toast.success(res.message);
                } else {
                    toast.error(res.message);
                    console.error(res.error);
                }
            });
        } else {
            toast.info('Vui lòng tạo tag để sử dụng');
        }
    }

    const handleReloadTCPServer = () => {
        if (listTCPServer.length > 0) {
            socket.emit('RELOAD TCP SERVER', (res) => {
                if (res.success) {
                    toast.success(res.message);
                } else {
                    toast.error(res.message);
                    console.error(res.error);
                }
            });
        } else {
            toast.info('Vui lòng tạo tag để sử dụng');
        }
    }

    const conformDeleteTCPServer = async () => {
        if (!dataModalDelete || dataModalDelete.length === 0) return;
        const res = await deleteTCPServer({ list: dataModalDelete });
        if (res && res.EC === 0) {
            toast.success(res.EM);
            fetchTCPServer();
        } else {
            toast.error(res.EM);
        }
        setIsShowModalDelete(false);
    };

    const columns = [
        { field: 'name', headerName: 'Name', flex: 1, align: 'center', headerAlign: 'center' },
        { field: 'address', headerName: 'Address', flex: 1, align: 'center', headerAlign: 'center' },
        {
            field: 'functionCode',
            headerName: 'Function',
            flex: 1,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => findFunctionCodeNameById(params.row.functionCode)
        },
        {
            field: 'dataFormat',
            headerName: 'Data Format',
            flex: 1,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => findNameById(params.row.dataFormat, listDataFormat)
        },
        // {
        //     field: 'dataType',
        //     headerName: 'Data Type',
        //     width: 200,
        //     align: 'center',
        //     headerAlign: 'center',
        //     renderCell: (params) => findNameById(params.row.dataType, listDataType)
        // },
        {
            field: 'action',
            headerName: 'Action',
            width: 250,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, height: '100%', }}  >
                        {/* <Button
                            variant="contained"
                            color="primary"
                            startIcon={<BorderColorIcon />}
                            sx={{ textTransform: 'none', minWidth: 80 }}
                            onClick={(e) => { e.stopPropagation(); handleEditTCPServer(params.row); }}
                        >
                            Sửa
                        </Button> */}

                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<DeleteForeverIcon />}
                            sx={{ textTransform: 'none', minWidth: 80 }}
                            onClick={(e) => { e.stopPropagation(); handleDeleteTCPServer(params.row); }}
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
            {listTCPServer.length >= 0 && (
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
                            onClick={handleStartTCPServer}
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
                            onClick={handleStopTCPServer}
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
                            onClick={handleReloadTCPServer}
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
                    onClick={(e) => { e.stopPropagation(); handleDeleteTCPServer(); }}
                    sx={{ textTransform: 'none', visibility: selectedCount > 1 ? 'visible' : 'hidden', }}
                >
                    Xóa nhiều
                </Button>
            </Box>

            <Paper sx={{ height: 400, width: '100%' }}>
                <CustomDataGrid
                    rows={listTCPServer}
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
            <ModalAddTagServer
                action={actionTCPServer}
                openModalAddServer={openModalAdd}
                handleCloseModalAddServer={handleCloseModalAddServer}
                setActionChooseTag={setActionChooseTag}
                setopenModalSearchTag={setOpenModalSearchTag}
                dataModalServer={dataModalServer}
                listDataFormat={listDataFormat}
                listDataType={listDataType}
                listFunctionCode={listFunctionCode}
            />

            <ModalSearchChannels
                actionChooseTag={actionChooseTag}
                handleCloseModalAdd={handleCloseModalSearch}
                openModalSearchTag={openModalSearchTag}
                setDataModalServer={setDataModalServer}
            />

            <ModalDelete
                isShowModalDelete={isShowModalDelete}
                selectedCount={selectedCount}
                action={actionDelete}
                conformDeleteTCPServer={conformDeleteTCPServer}
                handleCloseModalDelete={handleCloseModalDelete}
            />

        </div>
    );
}

export default ListTCPServer;
