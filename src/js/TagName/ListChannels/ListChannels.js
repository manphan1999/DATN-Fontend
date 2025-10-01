import { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import './Listchannels.scss'
import toast from 'react-hot-toast';
import { Android12Switch } from '../../Switch/IconSwitch'
import { fetchAllDevices, fetchAllChannels, fetchAllDataFormat, fetchAllDataType, fetchAllFunctionCode, deleteChannel } from "../../../Services/APIDevice";
import ModalChannel from '../../Modal/ModalChannel';
import ModalDelete from '../../Modal/ModalDelete';

const ListChannels = (props) => {
    const [pageSize, setPageSize] = useState(5);
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

    useEffect(() => {
        const init = async () => {
            const functionCodes = await fetchFunctionCode();
            const dataFormats = await fetchDataFormat();
            const dataTypes = await fetchDataType();
            await fetchDevices();
            await fetchChannel(functionCodes, dataFormats, dataTypes);
        };
        init();
    }, [isShowModalChannel]);

    const fetchChannel = async (functionCodes = [], dataFormats = [], dataTypes = []) => {
        let response = await fetchAllChannels();
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
                    selectFTP: item.selectFTP
                };
            });

            setListChannel(rowsWithId);
        }
        setSelectionChannel([]);
        setSelectedCount(0);
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
        // console.log('Check channel update: ', device)
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
            await fetchChannel()
        }
        else {
            toast.error(serverData.EM)
        }
    };

    const columns = [
        {
            field: "acction",
            headerName: "Action",
            minWidth: 100,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <>
                    <IconButton
                        color="primary"
                        onClick={(e) => { e.stopPropagation(); handleEditChannel(params.row); }}
                    >
                        <EditIcon />
                    </IconButton>
                    <IconButton
                        color="error"
                        onClick={(e) => { e.stopPropagation(); handleDeleteDevice(params.row); }}
                    >
                        <DeleteIcon />
                    </IconButton>
                </>
            ),
        },
        { field: 'channel', headerName: 'Channel', width: 80, headerAlign: 'center', align: 'center' },
        { field: 'name', headerName: 'Name', width: 150, headerAlign: 'center', align: 'center' },
        { field: 'deviceName', headerName: 'Device', width: 150, headerAlign: 'center', align: 'center' },
        { field: 'symbol', headerName: 'Symbol', width: 80, headerAlign: 'center', align: 'center' },
        { field: 'unit', headerName: 'Unit', width: 70, headerAlign: 'center', align: 'center' },
        { field: 'gain', headerName: 'Gain', width: 70, headerAlign: 'center', align: 'center' },
        { field: 'offset', headerName: 'OffSet', width: 70, headerAlign: 'center', align: 'center' },
        { field: 'lowSet', headerName: 'LowSet', width: 100, headerAlign: 'center', align: 'center' },
        { field: 'highSet', headerName: 'HighSet', width: 100, headerAlign: 'center', align: 'center' },
        { field: 'slaveId', headerName: 'Slave Id', width: 80, headerAlign: 'center', align: 'center' },
        { field: 'address', headerName: 'Address', width: 100, headerAlign: 'center', align: 'center' },
        {
            field: 'functionCodeName',
            headerName: 'Function Code',
            width: 200,
            headerAlign: 'center',
            align: 'center',
        },
        {
            field: 'dataFormatName',
            headerName: 'Data Format',
            width: 150,
            headerAlign: 'center',
            align: 'center',
        },
        {
            field: 'dataTypeName',
            headerName: 'Data Type',
            width: 150,
            headerAlign: 'center',
            align: 'center',
        },
        {
            field: 'selectFTP',
            headerName: 'Send Data',
            width: 120,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <Android12Switch checked={params.row.selectFTP === true} />
            ),
        },
    ];


    return (
        <>
            <div className='container'>
                <button
                    className='btn btn-success '
                    onClick={() => handleAddChannel()}
                >
                    <i className="fa fa-refresh"></i> Add
                </button>

                {selectedCount > 0 && (
                    <IconButton
                        color="error"
                        onClick={(e) => { e.stopPropagation(); handleDeleteDevice(); }}
                    >
                        <DeleteIcon />
                    </IconButton>
                )}

                <Paper sx={{ height: 600, width: '100%' }}>
                    <DataGrid
                        rows={listChannel}
                        columns={columns}
                        pageSize={pageSize}
                        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                        rowsPerPageOptions={[5, 10, 20]}
                        pagination
                        checkboxSelection
                        selectionModel={selectionChannel}
                        onSelectionModelChange={(newSelection) => {
                            // cho phép chọn nhiều khi dùng checkbox/checkall
                            setSelectionChannel(newSelection);
                            setSelectedCount(newSelection.length);

                        }}
                        sx={{
                            "& .MuiDataGrid-columnSeparator": {
                                display: "none",
                            },

                        }}

                        localeText={{
                            noRowsLabel: 'Không có dữ liệu',
                            footerRowSelected: (count) => `${count} hàng đã chọn`,
                            MuiTablePagination: {
                                labelRowsPerPage: 'Số hàng mỗi trang:',
                            },
                        }}

                    />
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

