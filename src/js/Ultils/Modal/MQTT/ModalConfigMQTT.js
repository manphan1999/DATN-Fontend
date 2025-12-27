import {
    useState, useEffect, Paper, Button, IconButton, Modal, Box, Typography, CancelIcon,
    CancelPresentation, AddBoxIcon, DeleteForeverIcon, Loading, CustomDataGrid,
    BorderColorIcon
} from '../../../ImportComponents/Imports';
import { fetchAllConfigPublish } from '../../../../Services/APIDevice';

const ModalConfigMQTT = (props) => {
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 1000,
        bgcolor: '#fff',
        borderRadius: 2,
        boxShadow: 24,
        p: 3,
        maxHeight: '90vh',
        overflowY: 'auto',
    };

    const defaultData = {
        name: '',
        token: '',
        groupId: '',
    };

    const { openModalConfig, handleCloseModalConfig, handleOpenModalAddConfig, reloadDataConfig,
        handleDeleteConfig, handleOpenModalEditConfig
    } = props;
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5, });
    const [loading, setLoading] = useState(true);
    const [listPublishMqtt, setListPublishMqtt] = useState([]);

    useEffect(() => {
        fetchConfigPublish();
    }, [openModalConfig, reloadDataConfig]);

    const fetchConfigPublish = async () => {
        setLoading(true);
        let response = await fetchAllConfigPublish();
        if (response && response.EC === 0 && Array.isArray(response.DT?.DT)) {
            const rowsWithId = response.DT.DT.map((item) => ({
                id: item._id,
                controlRetain: item.controlRetain,
                controlQoS: item.controlQoS,
                deviceId: item.deviceId,
                driverName: item.driverName,
                deviceName: item.deviceName,
                ipAddress: item.ipAddress,
                username: item.username,
                password: item.password,
                port: item.port,
                protocol: item.protocol,
                topic: item.topic,
            }));
            setListPublishMqtt(rowsWithId);
        }
        setLoading(false);
    };

    const handleClose = () => {
        handleCloseModalConfig();
    };

    const handleAdd = () => {
        handleOpenModalAddConfig();
    };

    const handleEdit = (row) => {
        handleOpenModalEditConfig(row)
    }

    const handleDelete = (row) => {
        handleDeleteConfig(row);
    }

    const columns = [
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
                            onClick={(e) => { e.stopPropagation(); handleEdit(params.row); }}
                        >
                            Sửa
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<DeleteForeverIcon />}
                            sx={{ textTransform: 'none', minWidth: 80 }}
                            onClick={(e) => { e.stopPropagation(); handleDelete(params.row); }}
                        >
                            Xóa
                        </Button>
                    </Box>

                </>
            ),
        }
    ];

    return (
        <Modal open={openModalConfig} onClose={handleClose}>
            <Box sx={style}>
                {/* Header */}
                <Typography variant="h6" align="center" sx={{ mb: 2, fontWeight: 600 }}>
                    Cấu hình thiết bị gửi dữ liệu về MQTT
                </Typography>

                <IconButton
                    onClick={handleClose}
                    sx={{
                        position: "absolute",
                        right: 20,
                        top: 20,
                        width: { xs: 36, md: 48 },
                        height: { xs: 36, md: 48 },
                    }}
                >
                    <CancelIcon sx={{ fontSize: { xs: 24, md: 32 } }} />
                </IconButton>


                <Paper sx={{ height: 371, width: '100%' }}>
                    <CustomDataGrid
                        rows={listPublishMqtt}
                        columns={columns}
                        paginationModel={paginationModel}
                        onPaginationModelChange={setPaginationModel}
                        pageSizeOptions={[5, 10, 20]}
                        pagination
                        loading={loading}
                    />

                    {loading && <Loading text="Đang tải dữ liệu..." />}
                </Paper>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2.5 }}>

                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<CancelPresentation />}
                        sx={{ ml: 1.5, textTransform: 'none' }}
                        onClick={handleClose}
                    >
                        Thoát
                    </Button>

                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<AddBoxIcon />}
                        sx={{ ml: 1.5, textTransform: 'none' }}
                        onClick={handleAdd}
                    >
                        Thêm
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default ModalConfigMQTT;