import {
    useState, useEffect, Paper, Button, Box, ModalUser, Fab, PersonAddIcon,
    DeleteForeverIcon, Loading, CustomDataGrid, BorderColorIcon, ModalDelete, toast
} from '../ImportComponents/Imports';
import { fetchAllUser, deleteUser, fetchUser, } from '../../Services/APIDevice';

const ListUser = () => {
    const [actionUser, setActionUser] = useState([]);
    const [actionDelete, setActionDelete] = useState([]);
    const [dataModalUser, setDataModalUser] = useState([]);
    const [dataModalDelete, setDataModalDelete] = useState([]);
    const [openModalAdd, setOpenModalAdd] = useState(false);
    const [isShowModalDelete, setIsShowModalDelete] = useState(false);
    const [selectedCount, setSelectedCount] = useState(0);

    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 5, });
    const [loading, setLoading] = useState(true);
    const [listUser, setListUser] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);

    useEffect(() => {
        fetchUsers();
        const token = localStorage.getItem('accessToken');
        if (!token) {
            localStorage.setItem("redirectAfterLogin", window.location.pathname);
            window.location.href = '/login';
        } else {
            fetchUser();
        }
    }, []);

    // const fetchUsers = async () => {
    //     setLoading(true);
    //     let response = await fetchAllUser();
    //     if (response && response.EC === 0 && Array.isArray(response.DT?.DT)) {
    //         const rowsWithId = response.DT.DT.map((item) => ({
    //             id: item._id,
    //             username: item.username,
    //             password: item.password
    //         }));
    //         setListUser(rowsWithId);
    //     }
    //     setLoading(false);
    //     setSelectedCount(0);
    // };

    const fetchUsers = async () => {
        setLoading(true);

        let response = await fetchAllUser();

        if (response && response.EC === 0 && Array.isArray(response.DT?.DT)) {

            const rowsWithId = response.DT.DT
                .filter(item => item.username !== 'admin')
                .map(item => ({
                    id: item._id,
                    username: item.username,
                    password: item.password
                }));

            setListUser(rowsWithId);
        }

        setLoading(false);
        setSelectedCount(0);
    };

    const handleOpenModalAdd = () => {
        setActionUser('CREATE');
        setOpenModalAdd(true);
    }
    const handleCloseModalAddUser = () => { setOpenModalAdd(false); fetchUsers(); }

    const handleEditUser = (row) => {
        setDataModalUser(row);
        setActionUser('UPDATE');
        setOpenModalAdd(true);
    }

    const handleCloseModalDelete = () => { setIsShowModalDelete(false); fetchUsers(); }

    const handleDeleteUser = (row) => {
        let dataToDelete = [];
        if (row) {
            dataToDelete = [{ id: row.id }];
            setSelectedCount(1);
        } else {
            dataToDelete = listUser
                .filter(item => selectedRows.includes(item.id))
                .map(item => ({ id: item.id }));
            setSelectedCount(dataToDelete.length);
        }
        setDataModalDelete(dataToDelete);
        setActionDelete('USER');
        setIsShowModalDelete(true);
    };

    const conformDeleteUser = async () => {
        if (!dataModalDelete || dataModalDelete.length === 0) return;
        const res = await deleteUser({ list: dataModalDelete });
        if (res && res.EC === 0) {
            toast.success(res.EM);
            fetchUsers();
        } else {
            toast.error(res.EM);
        }
        setIsShowModalDelete(false);
    };

    const columns = [
        { field: 'username', headerName: 'User Name', flex: 1, align: 'center', headerAlign: 'center' },
        {
            field: 'action',
            headerName: 'Action',
            width: 200,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => (
                <>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, height: '100%', }}  >
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<BorderColorIcon />}
                            sx={{ textTransform: 'none', minWidth: 80 }}
                            onClick={(e) => { e.stopPropagation(); handleEditUser(params.row); }}
                        >
                            Sửa
                        </Button>

                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<DeleteForeverIcon />}
                            sx={{ textTransform: 'none', minWidth: 80 }}
                            onClick={(e) => { e.stopPropagation(); handleDeleteUser(params.row); }}
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
                    onClick={(e) => { e.stopPropagation(); handleDeleteUser(); }}
                    sx={{ textTransform: 'none', visibility: selectedCount > 1 ? 'visible' : 'hidden', }}
                >
                    Xóa nhiều
                </Button>
            </Box>

            <Paper sx={{ height: 371, m: 2 }}>
                <CustomDataGrid
                    rows={listUser}
                    columns={columns}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[5, 10, 20]}
                    pagination
                    checkboxSelection
                    loading={loading}
                    onRowSelectionModelChange={(newSelection) => {
                        setSelectedRows(newSelection);
                        setSelectedCount(newSelection.length);
                    }}
                />

                {loading && <Loading text="Đang tải dữ liệu..." />}
            </Paper>

            <Box
                sx={{
                    position: 'fixed', bottom: 24, right: 24, '& > :not(style)': { m: 1 }, zIndex: 1200,    // luôn nổi trên UI
                }}
            >
                <Fab color="success" aria-label="edit" onClick={handleOpenModalAdd} >
                    <PersonAddIcon />
                </Fab>
            </Box>

            {/* Modal thêm mới */}
            <ModalUser
                action={actionUser}
                openModalAddUser={openModalAdd}
                handleCloseModalAddUser={handleCloseModalAddUser}
                dataModalUser={dataModalUser}
            />

            <ModalDelete
                isShowModalDelete={isShowModalDelete}
                selectedCount={selectedCount}
                action={actionDelete}
                conformDeleteUser={conformDeleteUser}
                handleCloseModalDelete={handleCloseModalDelete}
            />

        </div>
    );
}

export default ListUser;
