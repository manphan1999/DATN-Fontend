import {
    useState, useEffect, Paper, Button, IconButton,
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
    const [listFunctionCode, setlistFunctionCode] = useState([]);
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
            await fetchDevices();
            await fetchChannel(functionCodes, dataFormats, dataTypes);
            setLoading(false);
        };
        init();
    }, [isShowModalChannel]);

    const fetchChannel = async (functionCodes = [], dataFormats = [], dataTypes = []) => {
        setLoading(true);
        let response = await fetchAllChannels();
        // console.log('tag name data: ', response)
        if (response && response.EC === 0 && Array.isArray(response.DT?.DT)) {
            const rowsWithId = response.DT.DT.map((item) => {
                const func = functionCodes.find(f => f.id === item.functionCode);
                const format = dataFormats.find(f => f.id === item.dataFormat);
                const type = dataTypes.find(t => t.id === item.dataType);
                return {
                    id: item._id,
                    channel: item.channel,
                    name: item.name,
                    deviceId: item.device?._id,
                    deviceName: item.device?.name,
                    symbol: item.symbol,
                    unit: item.unit,
                    offset: item.offset,
                    gain: item.gain,
                    lowSet: item.lowSet,
                    highSet: item.highSet,
                    slaveId: item.slaveId,
                    address: item.address,
                    functionCodeId: func ? func.id : item.functionCode,
                    functionCodeName: func ? func.name : '',
                    dataFormatId: format ? format.id : item.dataFormat,
                    dataFormatName: format ? format.name : '',
                    dataTypeId: type ? type.id : item.dataType,
                    dataTypeName: type ? type.name : '',
                    functionText: item.functionText,
                    permission: item.permission,
                    selectFTP: item.selectFTP
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
        // console.log('Check Lisst COM: ', response)
        if (response && response.EC === 0 && response.DT?.DT) {
            const listDevices = response.DT.DT.map((item, index) => ({
                id: item._id,
                name: item.name,
            }));
            setListDevices(listDevices);
        }
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
        if (response && response.EC === 0 && Array.isArray(response.DT?.DT)) {
            const listFunctions = response.DT.DT.map((item) => ({
                id: item._id,
                name: item.name
            }));
            setlistFunctionCode(listFunctions);
            return listFunctions;
        }
        return [];
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
            flex: 1,
            headerAlign: 'center',
            align: 'center',
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <>
                    <IconButton
                        color="primary"
                        title="Chỉnh sửa"
                        onClick={(e) => { e.stopPropagation(); handleEditChannel(params.row); }}
                    >
                        <BorderColorIcon />
                    </IconButton>
                    <IconButton
                        color="error"
                        title="Xóa"
                        onClick={(e) => { e.stopPropagation(); handleDeleteDevice(params.row); }}
                    >
                        <DeleteForeverIcon />
                    </IconButton>
                </>
            ),
        },
    ];


    return (
        <>
            <div >
                <Button
                    variant="contained"
                    color="success"
                    startIcon={<AddCardIcon />}
                    onClick={() => handleAddChannel()}
                    sx={{ mb: 1.5, textTransform: 'none' }}
                >
                    Thêm Tag
                </Button>

                <Button
                    variant="contained"
                    color="success"
                    startIcon={<SettingsApplicationsIcon />}
                    // onClick={handleOpenModalConfig}
                    sx={{ mb: 1.5, ml: 1.5, textTransform: 'none' }}
                >
                    Cấu hình
                </Button>

                {selectedCount > 0 && (
                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<DeleteForeverIcon />}
                        onClick={(e) => { e.stopPropagation(); handleDeleteDevice(); }}
                        sx={{ mb: 1.5, mx: 1.5, textTransform: 'none' }}
                    >
                        Xóa Tag
                    </Button>
                )}

                <Paper sx={{ height: 600, width: '100%' }}>
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

            <ModalChannel
                isShowModalChannel={isShowModalChannel}
                action={actionModalChannel}
                dataModalChannel={dataModalChannel}
                handleCloseModalChannel={handleCloseModalChannel}
                listDevices={listDevices}
                listDataFormat={listDataFormat}
                listDataType={listDataType}
                listFunctionCode={listFunctionCode}
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

