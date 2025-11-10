import {
    useState, useEffect, Paper, Button, IconButton, Modal, Box,
    Typography, CancelIcon, CancelPresentation,
    Loading, CustomDataGrid
} from '../../../ImportComponents/Imports';
import { fetchAllApp } from '../../../../Services/APIDevice';

const ModalConfigAlarm = (props) => {
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
        maxHeight: '90vh', // chiều cao tối đa theo viewport
        overflowY: 'auto',
    };

    const defaultData = {
        name: '',
        token: '',
        groupId: '',
    };

    const { setopenModalEditApp, openModalAddApp, handleCloseModalApp, setreloadDataApp, reloadDataApp, setDataModalApp } = props;
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5, });
    const [dataApp, setDataApp] = useState(defaultData);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetAllApp();
    }, [openModalAddApp, reloadDataApp]);

    const handleClose = () => {
        handleCloseModalApp();
    };

    const handleOpenEditApp = (row) => {
        setDataModalApp(row);
        setreloadDataApp(false);
        setopenModalEditApp(true);
    };

    const fetAllApp = async () => {
        setLoading(true);
        let response = await fetchAllApp();
        if (response && response.EC === 0 && Array.isArray(response.DT?.DT)) {
            const rowsWithId = response.DT.DT.map((item, index) => ({
                id: item._id,
                stt: index + 1,
                token: item.token,
                groupId: item.groupId,
                name: item.name,
            }));
            setDataApp(rowsWithId);
        }
        setLoading(false);
    };

    const columns = [
        { field: 'stt', headerName: 'No.', width: 80, align: 'center', headerAlign: 'center' },
        { field: 'name', headerName: 'Name', width: 150, align: 'center', headerAlign: 'center' },
        { field: 'token', headerName: 'Token', flex: 1, align: 'center', headerAlign: 'center' },
        { field: 'groupId', headerName: 'List Group', flex: 1, align: 'center', headerAlign: 'center' },
        {
            field: "action",
            headerName: "Action",
            width: 120,
            headerAlign: 'center',
            align: 'center',
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <Button
                    variant="contained"
                    color="primary"
                    sx={{ textTransform: 'capitalize' }}
                    onClick={(e) => { e.stopPropagation(); handleOpenEditApp(params.row); }}
                >
                    Sửa
                </Button>
            ),
        }
    ];

    return (
        <Modal open={openModalAddApp} onClose={handleClose}>
            <Box sx={style}>
                {/* Header */}
                <Typography variant="h6" align="center" sx={{ mb: 2, fontWeight: 600 }}>
                    Cấu hình ứng dụng cảnh báo
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


                <Paper sx={{ height: 350, width: '100%' }}>
                    <CustomDataGrid
                        rows={dataApp}
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

                    {/* <Button
                        variant="contained"
                        color="success"
                        startIcon={<CancelPresentation />}
                        sx={{ ml: 1.5, textTransform: 'none' }}
                        onClick={handleOpenEditApp}
                    >
                        Thêm
                    </Button> */}
                </Box>
            </Box>
        </Modal>
    );
};

export default ModalConfigAlarm;