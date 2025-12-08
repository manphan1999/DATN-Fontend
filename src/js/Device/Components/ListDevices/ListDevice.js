import {
    useState, useEffect, Paper, Button, Box, socket,
    AddCardIcon, BorderColorIcon, DeleteForeverIcon, toast,
    ModalDelete, ModalProtocol, ModalDevice, Loading, CustomDataGrid
} from '../../../ImportComponents/Imports';
import { fetchAllDevices, deleteDevice, fetchAllComs, fetchAllProtocol } from "../../../../Services/APIDevice";

const ListDevices = (props) => {
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5, });
    const [listDevices, setListDevices] = useState([]);
    const [listComs, setListComs] = useState([])
    const [listProtocol, setListProtocol] = useState([])
    const [listModbus, setListModbus] = useState([])
    const [listSiemens, setListSiemens] = useState([])
    const [listMqtt, setListMqtt] = useState([])
    const [actionModalDevice, setactionModalDevice] = useState('CREATE');
    const [actionDeleteDevice, setactionDeleteDevice] = useState('');
    // State cho các modal
    const [isShowModalDelete, setisShowModalDelete] = useState(false);
    const [isShowModalProtocol, setisShowModalProtocol] = useState(false);
    const [isShowModalDevice, setisShowModalDevice] = useState(false);

    const [dataModalDelete, setdataModalDelete] = useState([]);
    const [dataModalDevice, setdataModalDevice] = useState([])
    const [selectionModel, setSelectionModel] = useState([]);
    const [selectedCount, setSelectedCount] = useState([])
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            await fetchComs();
            await fetchDevices();
            await fetchProtocol();
        };
        init();
    }, []);

    const fetchDevices = async () => {
        setLoading(true);
        let response = await fetchAllDevices();
        if (response && response.EC === 0 && response.DT?.DT) {
            const rowsWithId = response.DT.DT.filter(item => !!item._id).map((item) => ({
                ...item,
                id: item._id,
                name: item.name,
                protocol: item.protocol,
                driverName: item.driverName,
                ipAddress: item.ipAddress,
                port: item.port,
                username: item.username,
                password: item.password,
                serialPort: item.serialPort,
                timeOut: item.timeOut
            }));
            setListDevices(rowsWithId);
        }
        setSelectionModel([]);
        setSelectedCount(0);
        setLoading(false);
    };

    const fetchComs = async () => {
        let response = await fetchAllComs();
        if (response && response.EC === 0 && response.DT?.DT) {
            const rows = response.DT.DT.map((item) => ({
                name: item.name,
                serialPort: item.serialPort,
            }));
            setListComs(rows);
        }
    };

    const fetchProtocol = async () => {
        let response = await fetchAllProtocol();

        if (response && response.EC === 0 && response.DT) {
            const protocol = response.DT.Protocol?.map(item => ({
                id: item._id,
                name: item.name,
            })) || [];

            const modbus = response.DT.Modbus?.map(item => ({
                id: item._id,
                name: item.name,
            })) || [];

            const siemens = response.DT.Siemens?.map(item => ({
                id: item._id,
                name: item.name,
            })) || [];

            const mqtt = response.DT.MQTT?.map(item => ({
                id: item._id,
                name: item.name,
            })) || [];

            setListProtocol(protocol);
            setListModbus(modbus);
            setListSiemens(siemens);
            setListMqtt(mqtt);
        }
    };

    const handleCloseModalDevice = () => {
        setisShowModalDevice(false);
        fetchDevices();
    };

    const handleCloseModalDelete = () => setisShowModalDelete(false);
    const handleCloseModalProtocol = () => setisShowModalProtocol(false);

    const handleAddDevice = () => {
        setactionModalDevice("CREATE");
        setisShowModalProtocol(true);
    };

    const handleEditDevice = (device) => {
        // console.log('check device update: ', device)
        setSelectionModel([device.id]);
        setactionModalDevice("EDIT");
        setdataModalDevice(device)
        setisShowModalDevice(true);
    };

    const handleDeleteDevice = (device) => {
        if (device) {
            setSelectionModel([device.id]);
            setdataModalDelete([device.id]);
            setSelectedCount(1);
        } else {
            setdataModalDelete(selectionModel);
            setSelectedCount(selectionModel.length);
        }
        setactionDeleteDevice('DEVICE')
        setisShowModalDelete(true);
    };

    const conformDeleteDevice = async () => {
        let res = await deleteDevice({ ids: dataModalDelete });
        let serverData = res
        if (+serverData.EC === 0) {
            toast.success(serverData.EM)
            socket.emit('CHANGE DEVICE');
            setisShowModalDelete(false)
            await fetchDevices()
        }
        else {
            toast.error(serverData.EM)
        }
    };

    const columns = [
        { field: 'name', headerName: 'Name', flex: 1, headerAlign: 'center', align: 'center' },
        { field: 'driverName', headerName: 'Driver Name', flex: 1, headerAlign: 'center', align: 'center' },
        { field: 'ipAddress', headerName: 'IP Address', flex: 1, headerAlign: 'center', align: 'center' },
        { field: 'port', headerName: 'Port', flex: 1, headerAlign: 'center', align: 'center' },
        {
            field: 'serialPort',
            headerName: 'Serial Port',
            flex: 1,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => {
                const serialPort = params.row?.serialPort;
                const com = Array.isArray(listComs)
                    ? listComs.find(c => c.serialPort === serialPort)
                    : null;
                return com?.name || serialPort || '';
            },
        },
        {
            field: 'action',
            headerName: 'Action',
            width: 190,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => {
                // Kiểm tra params tồn tại
                if (!params || !params.row) {
                    return null;
                }
                return (
                    <>
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, height: '100%', }}  >
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<BorderColorIcon />}
                                sx={{ textTransform: 'none', minWidth: 80 }}
                                onClick={(e) => { e.stopPropagation(); handleEditDevice(params.row); }}
                            >
                                Sửa
                            </Button>

                            <Button
                                variant="contained"
                                color="error"
                                startIcon={<DeleteForeverIcon />}
                                sx={{ textTransform: 'none', minWidth: 80 }}
                                onClick={(e) => { e.stopPropagation(); handleDeleteDevice(params.row); }}
                            >
                                Xóa
                            </Button>
                        </Box>
                    </>
                );
            },
        },
    ];

    return (
        <>
            < >
                <Button
                    variant="contained"
                    color="success"
                    startIcon={<AddCardIcon />}
                    onClick={handleAddDevice}
                    sx={{ mb: 1.5, textTransform: 'none' }}
                >
                    Thêm
                </Button>

                {selectedCount > 1 && (
                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<DeleteForeverIcon />}
                        onClick={(e) => { e.stopPropagation(); handleDeleteDevice(); }}
                        sx={{ mb: 1.5, ml: 1.5, textTransform: 'none' }}
                    >
                        Xóa nhiều
                    </Button>
                )}

                <Paper sx={{ height: 400, width: '100%' }}>
                    <CustomDataGrid
                        getRowId={(row) => row.id}
                        rows={listDevices || []}
                        columns={columns}
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}
                        pageSizeOptions={[5, 10, 20]}
                        pagination
                        checkboxSelection
                        selectionModel={selectionModel}
                        rowSelectionModel={selectionModel}
                        onRowSelectionModelChange={(newSelection) => {
                            setSelectionModel(newSelection);
                            setSelectedCount(newSelection.length);
                        }}
                        loading={loading}
                    />
                    {loading && (
                        <Loading text="Đang tải dữ liệu..." />
                    )}
                </Paper>
            </>

            {/* Modal chọn protocol */}
            <ModalProtocol
                action={actionModalDevice}
                listProtocol={listProtocol}
                listModbus={listModbus}
                listSiemens={listSiemens}
                listMqtt={listMqtt}
                dataModalDevice={dataModalDevice}
                isShowModalProtocol={isShowModalProtocol}
                handleCloseModalProtocol={handleCloseModalProtocol}
                fetchDevices={fetchDevices}
                // thêm props để mở ModalDevice khi Add → chọn xong Protocol
                setisShowModalDevice={setisShowModalDevice}
                setdataModalDevice={setdataModalDevice}
            />

            {/* Modal nhập thông tin thiết bị (Edit sẽ mở trực tiếp) */}
            <ModalDevice
                listProtocol={listProtocol}
                listModbus={listModbus}
                listSiemens={listSiemens}
                listMqtt={listMqtt}
                action={actionModalDevice}
                dataModalDevice={dataModalDevice}
                isShowModalDevice={isShowModalDevice}
                handleCloseModalDevice={handleCloseModalDevice}
            />

            <ModalDelete
                isShowModalDelete={isShowModalDelete}
                action={actionDeleteDevice}
                handleCloseModalDelete={handleCloseModalDelete}
                conformDeleteDevice={conformDeleteDevice}
                dataModalDelete={dataModalDelete}
                selectedCount={selectedCount}
            />

        </>
    );
};

export default ListDevices;
