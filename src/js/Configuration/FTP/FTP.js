import {
    useState, useEffect, Paper, Button, Box, BorderColorIcon, AddCardIcon, DeleteForeverIcon,
    Loading, ModalDelete, CustomDataGrid, ModalAddFTPServer, toast, socket, SyncIcon
} from '../../ImportComponents/Imports';

import { fetchAllFTPServer, deleteFTPServer } from '../../../Services/APIDevice';

const ListFTP = () => {
    const [actionAddFTPServer, setActionAddFTPServer] = useState('');
    const [openModalAddFTPServer, setOpenModalAddFTPServer] = useState(false);
    const [dataModalAddFTPServer, setDataModalAddFTPServer] = useState(null);

    const [dataFTPServer, setDataFTPServer] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedRows, setSelectedRows] = useState([]);
    const [selectedCount, setSelectedCount] = useState(0);

    const [isShowModalDelete, setIsShowModalDelete] = useState(false);
    const [dataModalDelete, setDataModalDelete] = useState(null);
    const [actionDeleteFTPServer, setActionDeleteFTPServer] = useState('');

    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5, });

    useEffect(() => {
        fetchAllFTP();

        socket.on("SERVER SYNC RESULT", (res) => {
            if (res && res.EC === 0) {
                toast.success(res.EM);
            } else {
                toast.error(res.EM);
            }
        });
    }, []);

    const fetchAllFTP = async () => {
        setLoading(true);
        const res = await fetchAllFTPServer();

        if (res && res.EC === 0 && Array.isArray(res.DT?.DT)) {
            const rows = res.DT.DT.map((item) => ({
                id: item._id,
                ...item,
            }));
            setDataFTPServer(rows);
        }
        setLoading(false);
    };

    const handleOpenAdd = () => {
        setActionAddFTPServer("CREATE");
        setDataModalAddFTPServer(null);
        setOpenModalAddFTPServer(true);
    };

    const handleEditFTPServer = (row) => {
        setActionAddFTPServer("UPDATE");
        setDataModalAddFTPServer(row);
        setOpenModalAddFTPServer(true);
    };

    const handleSyncFTP = () => {
        socket.emit('SYNC FTP SERVER');
    }

    const handleCloseModalAddFTPServer = () => {
        setOpenModalAddFTPServer(false);
        fetchAllFTP();
    };

    const handleDeleteFTPServer = (row) => {
        let dataToDelete = [];
        if (row) {
            dataToDelete = [{ id: row.id }];
            setSelectedCount(1);
        } else {
            dataToDelete = dataFTPServer
                .filter(item => selectedRows.includes(item.id))
                .map(item => ({ id: item.id }));
            setSelectedCount(dataToDelete.length);
        }
        setDataModalDelete(dataToDelete);
        setActionDeleteFTPServer('FTPSERVER');
        setIsShowModalDelete(true);
    };

    const confirmDeleteFTPServer = async () => {
        if (!dataModalDelete || dataModalDelete.length === 0) return;
        const res = await deleteFTPServer({ list: dataModalDelete });
        if (res && res.EC === 0) {
            toast.success(res.EM);
            socket.emit('DELETE FTP SERVER', dataModalDelete);
            fetchAllFTP();
        } else {
            toast.error(res.EM);
        }
        setIsShowModalDelete(false);
    };

    const columns = [
        { field: 'name', headerName: 'Name', flex: 1, headerAlign: 'center', align: 'center' },
        { field: 'host', headerName: 'Host', flex: 1, headerAlign: 'center', align: 'center' },
        { field: 'port', headerName: 'Port', flex: 1, headerAlign: 'center', align: 'center' },
        { field: 'interval', headerName: 'Interval', flex: 1, headerAlign: 'center', align: 'center' },
        { field: 'fileName', headerName: 'File Name', flex: 1, headerAlign: 'center', align: 'center' },
        { field: 'fileType', headerName: 'File Type', width: 100, headerAlign: 'center', align: 'center' },
        { field: 'folderName', headerName: 'Folder Name', flex: 1, headerAlign: 'center', align: 'center' },

        {
            field: "action",
            headerName: "Action",
            width: 200,
            align: "center",
            headerAlign: "center",
            renderCell: (params) => (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, height: '100%', }}  >
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<BorderColorIcon />}
                        sx={{ textTransform: "none" }}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEditFTPServer(params.row);
                        }}
                    >
                        Sửa
                    </Button>

                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<DeleteForeverIcon />}
                        sx={{ textTransform: "none" }}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFTPServer(params.row);
                        }}
                    >
                        Xóa
                    </Button>
                </Box>
            )
        }
    ];

    return (
        <div>
            <Button
                variant="contained"
                color="success"
                startIcon={<AddCardIcon />}
                sx={{ mb: 1.5, textTransform: "none" }}
                onClick={handleOpenAdd}
            >
                Thêm Server
            </Button>

            <Button
                variant="contained"
                color="success"
                startIcon={<SyncIcon />}
                sx={{ mb: 1.5, ml: 1.5, textTransform: "none" }}
                onClick={handleSyncFTP}
            >
                Đồng bộ
            </Button>

            {selectedCount > 1 && (
                <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteForeverIcon />}
                    sx={{ mb: 1.5, ml: 1.5, textTransform: "none" }}
                    onClick={() => handleDeleteFTPServer()}
                >
                    Xóa Tags
                </Button>
            )}

            <Paper sx={{ height: 370, width: "100%" }}>
                <CustomDataGrid
                    rows={dataFTPServer}
                    columns={columns}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[5, 10, 20]}
                    checkboxSelection
                    pagination
                    loading={loading}
                    onRowSelectionModelChange={(sel) => {
                        setSelectedRows(sel);
                        setSelectedCount(sel.length);
                    }}
                />
                {loading && <Loading text="Đang tải dữ liệu..." />}
            </Paper>

            <ModalAddFTPServer
                actionAddFTPServer={actionAddFTPServer}
                openModalAddFTPServer={openModalAddFTPServer}
                dataModalAddFTPServer={dataModalAddFTPServer}
                handleCloseModalAddFTPServer={handleCloseModalAddFTPServer}
            />

            <ModalDelete
                action={actionDeleteFTPServer}
                isShowModalDelete={isShowModalDelete}
                handleCloseModalDelete={() => setIsShowModalDelete(false)}
                conformDeleteFTPServer={confirmDeleteFTPServer}
                dataModalDelete={dataModalDelete}
                selectedCount={selectedCount}
            />
        </div>
    );
};

export default ListFTP;
