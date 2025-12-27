import {
    useState, useEffect, Button, IconButton, TextField, Box,
    InputAdornment, Modal, Typography, toast, LeakAddIcon,
    CancelIcon, AddBoxIcon, SaveIcon, VisibilityOff, Visibility,
    useValidator, socket, CancelPresentation
} from '../../../ImportComponents/Imports';

import {
    createMySQLServer, updateMySQLServer, createSQLServer,
    updateSQLServer, testMySQLServer, testSQLServer,
} from '../../../../Services/APIDevice';

const ModalDatabase = (props) => {
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 500,
        bgcolor: '#fff',
        borderRadius: 2,
        boxShadow: 24,
        p: 3,
        maxHeight: '90vh',
        overflowY: 'auto',
    };
    const { actionAddDatabase, openModalDatabase,
        handleCloseModalDatabase, dataModalDatabase, } = props;

    const defaultData = {
        name: '',
        host: '',
        port: '',
        username: '',
        password: '',
        interval: '',
        tableName: '',
        dataBase: '',
    };

    const { validate } = useValidator();
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [enableAdd, setEnableAdd] = useState(true);
    const [dataDatabase, setDataDatabase] = useState(defaultData);

    useEffect(() => {
        if (openModalDatabase === false) return;
        if (actionAddDatabase === "UPDATE MYSQL" ||
            (actionAddDatabase === "CREATE SQL" && dataModalDatabase)) {
            setDataDatabase({ ...dataModalDatabase });
        } else {
            setDataDatabase(defaultData);
        }
        setErrors({});
    }, [openModalDatabase, dataModalDatabase, actionAddDatabase]);

    const validateAll = () => {
        const newErrors = {};
        // Chỉ validate các trường bắt buộc
        const fieldsToValidate = ["name", "host", "port", "username", "interval", "tableName", "dataBase"];

        fieldsToValidate.forEach((key) => {
            const value = dataDatabase[key];
            const errorMsg = validate(key, value);
            newErrors[key] = errorMsg;
            if (errorMsg) {
                console.warn(`Lỗi ở ${key}: ${errorMsg}`);
            }
        });

        setErrors(newErrors);
        // Trả về true nếu không có lỗi
        return Object.values(newErrors).every(err => err === "");
    };

    const handleInputChange = (value, name) => {
        setDataDatabase(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: validate(name, value) }));
    };

    const handleTestConnect = async () => {
        if (!validateAll()) return;
        let res;

        if (actionAddDatabase === 'CREATE MYSQL' || actionAddDatabase === 'UPDATE MYSQL') {
            res = await testMySQLServer(dataDatabase);
        } else {
            res = await testSQLServer(dataDatabase);
        }
        if (res && res.EC === 0) {
            toast.success(res.EM);
            setEnableAdd(false);
        } else {
            setEnableAdd(true);
            const detail = res.DT?.DT ? `: ${res.DT.DT}` : '';
            toast.error(res.EM + detail);
        }
    };

    const handleConfirm = async () => {
        if (!validateAll()) return;
        let res;
        if (actionAddDatabase === 'CREATE MYSQL') { res = await createMySQLServer(dataDatabase); }
        else if (actionAddDatabase === 'UPDATE MYSQL') { res = await updateMySQLServer(dataDatabase); }
        else if (actionAddDatabase === 'CREATE SQL') { res = await createSQLServer(dataDatabase); }
        else if (actionAddDatabase === 'UPDATE SQL') { res = await updateSQLServer(dataDatabase); }
        if (res && res.EC === 0) {
            toast.success(res.EM);
            console.log('socket.connected =', socket.connected);
            socket.emit('CHANGE DATABASE SERVER');
            handleCloseModalDatabase();
        }
        else { toast.error(res.EM); }
    };

    return (
        <Modal open={openModalDatabase} onClose={handleCloseModalDatabase}>
            <Box sx={style}>

                {/* Header */}
                <Typography variant="h6" align="center" sx={{ fontWeight: 600 }}>
                    {actionAddDatabase === 'CREATE MYSQL' || actionAddDatabase === 'CREATE SQL' ? 'Thêm mới' : 'Cập nhật'}
                </Typography>

                <IconButton
                    onClick={handleCloseModalDatabase}
                    sx={{
                        position: "absolute",
                        right: 20,
                        top: 5,
                        width: { xs: 36, md: 48 },
                        height: { xs: 36, md: 48 },
                    }}
                >
                    <CancelIcon sx={{ fontSize: { xs: 24, md: 32 } }} />
                </IconButton>

                {/* Form */}
                <Box
                    component="form"
                    display="grid"
                    gridTemplateColumns="1fr 1fr"
                    gap={2}
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleConfirm();
                    }}
                >
                    <TextField label="Name" variant="standard"
                        value={dataDatabase.name}
                        onChange={(e) => handleInputChange(e.target.value, 'name')}
                        error={!!errors.name} helperText={errors.name} />

                    <TextField label="Host" variant="standard"
                        value={dataDatabase.host}
                        onChange={(e) => handleInputChange(e.target.value, 'host')}
                        error={!!errors.host} helperText={errors.host} />

                    <TextField label="Port" variant="standard"
                        value={dataDatabase.port}
                        onChange={(e) => handleInputChange(e.target.value, 'port')}
                        error={!!errors.port} helperText={errors.port} />

                    <TextField label="Interval (Min)" variant="standard"
                        value={dataDatabase.interval}
                        onChange={(e) => handleInputChange(e.target.value, 'interval')}
                        error={!!errors.interval} helperText={errors.interval} />

                    <TextField label="DataBase" variant="standard"
                        value={dataDatabase.dataBase}
                        onChange={(e) => handleInputChange(e.target.value, 'dataBase')}
                        error={!!errors.dataBase} helperText={errors.dataBase} />

                    <TextField label="Table Name" variant="standard"
                        value={dataDatabase.tableName}
                        onChange={(e) => handleInputChange(e.target.value, 'tableName')}
                        error={!!errors.tableName}
                        helperText={errors.tableName}
                    />

                    <TextField label="User Name" variant="standard"
                        value={dataDatabase.username}
                        onChange={(e) => handleInputChange(e.target.value, 'username')}
                        error={!!errors.username} helperText={errors.username} />

                    <TextField
                        type={showPassword ? 'text' : 'password'}
                        label="Password"
                        variant="standard"
                        value={dataDatabase.password || ''}
                        onChange={(e) => handleInputChange(e.target.value, 'password')}
                        error={!!errors.password}
                        helperText={errors.password}
                        InputProps={{
                            endAdornment:
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                        }}
                    />

                    <Box sx={{
                        gridColumn: 'span 2', display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', mt: 1.5
                    }}  >
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<LeakAddIcon />}
                            sx={{ textTransform: 'none' }}
                            onClick={handleTestConnect}
                        >
                            Test Connect
                        </Button>

                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Button
                                variant="contained"
                                color="error"
                                startIcon={<CancelPresentation />}
                                sx={{ ml: 1.5, textTransform: 'none' }}
                                onClick={handleCloseModalDatabase}
                            >
                                Thoát
                            </Button>

                            <Button
                                variant="contained"
                                color="success"
                                startIcon={
                                    actionAddDatabase === 'CREATE MYSQL' || actionAddDatabase === 'CREATE SQL'
                                        ? <AddBoxIcon />
                                        : <SaveIcon />
                                }
                                disabled={enableAdd}
                                sx={{ ml: 1.5, textTransform: 'none' }}
                                type="submit"
                            >
                                {actionAddDatabase === 'CREATE MYSQL' || actionAddDatabase === 'CREATE SQL' ? 'Thêm' : 'Cập nhật'}
                            </Button>
                        </Box>

                    </Box>

                </Box>
            </Box>
        </Modal >
    );
};

export default ModalDatabase;