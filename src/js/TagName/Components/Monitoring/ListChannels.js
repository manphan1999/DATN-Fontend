import {
    useState, useEffect, Paper, Button, Box, Fab,
    AddCardIcon, BorderColorIcon, DeleteForeverIcon, SettingsApplicationsIcon, toast,
    ModalChannel, ModalDelete, Loading, CustomDataGrid
} from '../../../ImportComponents/Imports';
import {
    fetchAllDevices,
    fetchAllChannels,
    fetchAllDataFormat,
    fetchAllDataType,
    fetchAllFunctionCode,
    deleteChannel
} from '../../../../Services/APIDevice';

const ListChannels = (props) => {
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5, });
    const [listChannel, setListChannel] = useState([]);
    const [listDataFormat, setlistDataFormat] = useState([]);
    const [listDataType, setlistDataType] = useState([]);
    const [listFunctionCode, setlistFunctionCode] = useState({ modbus: [], mqtt: [] });
    const [listDevices, setListDevices] = useState([])
    const [actionModalChannel, setactionModalChannel] = useState('CREATE');
    const [actionDeleteChannel, setactionDeleteChannel] = useState('');
    // State cho các modal
    const [isShowModalDelete, setisShowModalDelete] = useState(false);
    const [isShowModalChannel, setisShowModalChannel] = useState(false);

    const [dataModalChannel, setdataModalChannel] = useState([]);
    const [dataModalDelete, setdataModalDelete] = useState([]);
    const [selectionChannel, setSelectionChannel] = useState([]);
    const [selectedCount, setSelectedCount] = useState([])
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            const functionCodes = await fetchFunctionCode();
            const dataFormats = await fetchDataFormat();
            const dataTypes = await fetchDataType();
            const devices = await fetchDevices(); // Lấy danh sách devices
            await fetchChannel(functionCodes, dataFormats, dataTypes, devices); // Truyền devices vào fetchChannel
            setLoading(false);
        };
        init();
    }, [isShowModalChannel]);


    const fetchChannel = async (functionCodes = { modbus: [], mqtt: [] }, dataFormats = [], dataTypes = [], devices = []) => {
        setLoading(true);
        let response = await fetchAllChannels();

        if (response && response.EC === 0 && Array.isArray(response.DT?.DT)) {
            const rowsWithId = response.DT.DT.map((item) => {
                // Sử dụng tham số devices thay vì listDevices từ state
                const deviceInfo = devices.find(device => device.id === item.device?._id);
                const deviceProtocol = deviceInfo ? deviceInfo.protocol : null; // Hoặc driverName tùy theo dữ liệu

                let func;
                if (deviceProtocol === "MQTT") {
                    func = functionCodes.mqtt.find(f =>
                        f.id == item.functionCode ||
                        Number(f.id) === Number(item.functionCode) ||
                        String(f.id) === String(item.functionCode)
                    );
                } else {
                    func = functionCodes.modbus.find(f =>
                        f.id == item.functionCode ||
                        Number(f.id) === Number(item.functionCode) ||
                        String(f.id) === String(item.functionCode)
                    );
                }

                const format = dataFormats.find(f => Number(f.id) === Number(item.dataFormat));
                const type = dataTypes.find(t => Number(t.id) === Number(item.dataType));

                return {
                    id: item._id,
                    channel: item.channel,
                    name: item.name,
                    deviceId: item.device?._id,
                    deviceName: item.device?.name,
                    deviceProtocol: deviceProtocol,
                    symbol: item.symbol,
                    unit: item.unit,
                    offset: item.offset,
                    gain: item.gain,
                    slaveId: item.slaveId,
                    address: item.address,
                    topic: item.topic,
                    functionCodeId: func ? func.id : item.functionCode,
                    functionCodeName: func ? func.name : `Unknown (${item.functionCode})`,
                    dataFormatId: format ? format.id : item.dataFormat,
                    dataFormatName: format ? format.name : '',
                    dataTypeId: type ? type.id : item.dataType,
                    dataTypeName: type ? type.name : '',
                    functionText: item.functionText,
                    permission: item.permission,
                    selectFTP: item.selectFTP,
                    selectMySQL: item.selectMySQL,
                    selectSQL: item.selectSQL
                };
            });

            setListChannel(rowsWithId);
        }
        setSelectionChannel([]);
        setSelectedCount(0);
        setLoading(false);
    };
    const fetchDevices = async () => {
        let response = await fetchAllDevices();
        if (response && response.EC === 0 && response.DT?.DT) {
            const listDevices = response.DT.DT.map((item, index) => ({
                id: item._id,
                name: item.name,
                protocol: item.protocol, // hoặc driverName tùy theo dữ liệu
            }));
            setListDevices(listDevices); // Vẫn set state để sử dụng ở nơi khác
            return listDevices; // Trả về danh sách devices
        }
        return []; // Trả về mảng rỗng nếu có lỗi
    };

    const fetchDataFormat = async () => {
        let response = await fetchAllDataFormat();
        // console.log('Check Data Format : ', response)
        if (response && response.EC === 0 && Array.isArray(response.DT?.DT)) {
            const listDataFormats = response.DT.DT.map((item) => ({
                id: item._id,
                name: item.name
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
                name: item.name
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

    const handleCloseModalChannel = () => {
        setisShowModalChannel(false);
    };

    const handleCloseModalDelete = () => setisShowModalDelete(false);

    const handleAddChannel = () => {
        setactionModalChannel("CREATE");
        setisShowModalChannel(true);
    };

    const handleEditChannel = (device) => {
        setSelectionChannel([device.id]);
        setactionModalChannel("EDIT");
        setdataModalChannel(device);
        setisShowModalChannel(true);
    };

    const handleDeleteDevice = (device) => {
        if (device) {
            setSelectionChannel([device.id]);
            setdataModalDelete([device.id]);
            setSelectedCount(1);
        } else {
            setdataModalDelete(selectionChannel);
            setSelectedCount(selectionChannel.length);
        }
        setactionDeleteChannel('CHANNEL')
        setisShowModalDelete(true);
    };


    const conformDeleteChannel = async () => {
        let res = await deleteChannel({ ids: dataModalDelete });
        let serverData = res
        if (+serverData.EC === 0) {
            toast.success(serverData.EM)
            setisShowModalDelete(false)
            await fetchChannel();
        }
        else {
            toast.error(serverData.EM)
        }
    };

    const columns = [
        { field: 'channel', headerName: 'Channel', flex: 1, width: 80, headerAlign: 'center', align: 'center' },
        { field: 'name', headerName: 'Name', flex: 1, width: 150, headerAlign: 'center', align: 'center' },
        { field: 'deviceName', headerName: 'Device', flex: 1, width: 150, headerAlign: 'center', align: 'center' },
        { field: 'slaveId', headerName: 'Slave Id', flex: 1, width: 80, headerAlign: 'center', align: 'center' },
        { field: 'address', headerName: 'Address', flex: 1, width: 100, headerAlign: 'center', align: 'center' },
        {
            field: 'functionCodeName',
            headerName: 'Function Code',
            width: 250,
            headerAlign: 'center',
            align: 'center',
        },
        {
            field: "acction",
            headerName: "Action",
            width: 190,
            headerAlign: 'center',
            align: 'center',
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, height: '100%', }}  >
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<BorderColorIcon />}
                            sx={{ textTransform: 'none', minWidth: 80 }}
                            onClick={(e) => { e.stopPropagation(); handleEditChannel(params.row); }}
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
            ),
        },
    ];

    return (
        <>
            <div >
                {selectedCount > 1 && (
                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<DeleteForeverIcon />}
                        onClick={(e) => { e.stopPropagation(); handleDeleteDevice(); }}
                        sx={{ mb: 1.5, ml: 0.3, textTransform: 'none' }}
                    >
                        Xóa Nhiều
                    </Button>
                )}

                <Paper sx={{ height: 400, width: '100%' }}>
                    <CustomDataGrid
                        rows={listChannel}
                        columns={columns}
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}
                        pageSizeOptions={[5, 10, 20]}
                        pagination
                        checkboxSelection
                        rowSelectionModel={selectionChannel}
                        onRowSelectionModelChange={(newSelection) => {
                            setSelectionChannel(newSelection);
                            setSelectedCount(newSelection.length);
                        }}
                        loading={loading}
                    />

                    {loading && (
                        <Loading text="Đang tải dữ liệu..." />
                    )}
                </Paper>
            </div>

            <Box
                sx={{
                    position: 'fixed', bottom: 24, right: 24, '& > :not(style)': { m: 1 }, zIndex: 1200,    // luôn nổi trên UI
                }}
            >
                <Fab color="primary" >
                    <SettingsApplicationsIcon />
                </Fab>

                <Fab color="secondary" onClick={handleAddChannel} >
                    <AddCardIcon />
                </Fab>
            </Box>

            <ModalChannel
                isShowModalChannel={isShowModalChannel}
                action={actionModalChannel}
                dataModalChannel={dataModalChannel}
                handleCloseModalChannel={handleCloseModalChannel}
                listDevices={listDevices}
                listDataFormat={listDataFormat}
                listDataType={listDataType}
                listFunctionCodeModbus={listFunctionCode.modbus}
                listFunctionCodeMQTT={listFunctionCode.mqtt}
            />

            <ModalDelete
                action={actionDeleteChannel}
                isShowModalDelete={isShowModalDelete}
                handleCloseModalDelete={handleCloseModalDelete}
                conformDeleteChannel={conformDeleteChannel}
                dataModalDelete={dataModalDelete}
                selectedCount={selectedCount}
            />
        </>
    );
};

export default ListChannels;

