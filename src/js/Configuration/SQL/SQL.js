import {
    useState, useEffect, Paper, Button, Box, BorderColorIcon, AddCardIcon, DeleteForeverIcon, socket,
    Loading, ModalDelete, CustomDataGrid, ModalDatabase, toast, ModalSearchChannels, TableViewIcon
} from '../../ImportComponents/Imports';

import { fetchAllSQLServer, deleteSQLServer } from '../../../Services/APIDevice';

const ListSQL = () => {
    const [actionAddDatabase, setActionAddDatabase] = useState('');
    const [openModalDatabase, setOpenModalDatabase] = useState(false);
    const [dataModalDatabase, setDataModalDatabase] = useState(null);
    const [openModalSearch, setOpenModalSearch] = useState(false);
    const [actionSQL, setActionSQL] = useState('');
    const [dataDatabase, setDataDatabase] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedRows, setSelectedRows] = useState([]);
    const [selectedCount, setSelectedCount] = useState(0);

    const [isShowModalDelete, setIsShowModalDelete] = useState(false);
    const [dataModalDelete, setDataModalDelete] = useState(null);
    const [actiondeleteSQL, setActiondeleteSQL] = useState('');

    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5, });

    useEffect(() => {
        fetchAllSQL();
    }, []);

    const fetchAllSQL = async () => {
        setLoading(true);
        const res = await fetchAllSQLServer();

        if (res && res.EC === 0 && Array.isArray(res.DT?.DT)) {
            const rows = res.DT.DT.map((item) => ({
                id: item._id,
                ...item,
            }));
            setDataDatabase(rows);
        }
        setLoading(false);
    };

    const handleOpenSearch = () => {
        setActionSQL('DATABASE SQL');
        setOpenModalSearch(true);
    };

    const handleCloseModalSearch = () => {
        setOpenModalSearch(false);
    }

    const handleOpenAdd = () => {
        setActionAddDatabase("CREATE SQL");
        setDataModalDatabase(null);
        setOpenModalDatabase(true);
    };

    const handleEditDatabase = (row) => {
        setActionAddDatabase("UPDATE SQL");
        setDataModalDatabase(row);
        setOpenModalDatabase(true);
    };

    const handleCloseModalDatabase = () => {
        setOpenModalDatabase(false);
        fetchAllSQL();
    };

    const handledeleteSQL = (row) => {
        let dataToDelete = [];
        if (row) {
            dataToDelete = [{ id: row.id }];
            setSelectedCount(1);
        } else {
            dataToDelete = dataDatabase
                .filter(item => selectedRows.includes(item.id))
                .map(item => ({ id: item.id }));
            setSelectedCount(dataToDelete.length);
        }
        setDataModalDelete(dataToDelete);
        setActiondeleteSQL('SQL');
        setIsShowModalDelete(true);
    };

    const confirmDeleteSQL = async () => {
        if (!dataModalDelete || dataModalDelete.length === 0) return;
        const res = await deleteSQLServer({ list: dataModalDelete });
        if (res && res.EC === 0) {
            toast.success(res.EM);
            socket.emit('DELETE MYSQL SERVER', dataModalDelete);
            fetchAllSQL();
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
        { field: 'dataBase', headerName: 'Database', flex: 1, headerAlign: 'center', align: 'center' },
        { field: 'tableName', headerName: 'Table Name', flex: 1, headerAlign: 'center', align: 'center' },
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
                            handleEditDatabase(params.row);
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
                            handledeleteSQL(params.row);
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
                startIcon={<TableViewIcon />}
                sx={{ ml: 1.5, mb: 1.5, textTransform: "none" }}
                onClick={handleOpenSearch}
            >
                Tạo Bảng
            </Button>

            {selectedCount > 1 && (
                <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteForeverIcon />}
                    sx={{ mb: 1.5, ml: 1.5, textTransform: "none" }}
                    onClick={() => handledeleteSQL()}
                >
                    Xóa Tags
                </Button>
            )}

            <Paper sx={{ height: 371, width: "100%" }}>
                <CustomDataGrid
                    rows={dataDatabase}
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

            <ModalDatabase
                actionAddDatabase={actionAddDatabase}
                openModalDatabase={openModalDatabase}
                dataModalDatabase={dataModalDatabase}
                handleCloseModalDatabase={handleCloseModalDatabase}
            />

            <ModalSearchChannels
                actionDatabase={actionSQL}
                openModalSearchTag={openModalSearch}
                handleCloseModalAdd={handleCloseModalSearch}
                dataDatabase={dataDatabase}
            />

            <ModalDelete
                action={actiondeleteSQL}
                isShowModalDelete={isShowModalDelete}
                handleCloseModalDelete={() => setIsShowModalDelete(false)}
                confirmDeleteSQL={confirmDeleteSQL}
                dataModalDelete={dataModalDelete}
                selectedCount={selectedCount}
            />
        </div>
    );
};

export default ListSQL;
