import {
    useState, useEffect, Button, IconButton, TextField, Box,
    InputAdornment, MenuItem, Modal, Typography, toast,
    CancelIcon, AddBoxIcon, SaveIcon, VisibilityOff, Visibility,
    useValidator, socket, CancelPresentation
} from '../../../ImportComponents/Imports';

import { createFTPServer, updateFTPServer } from '../../../../Services/APIDevice';

const ModalAddFTPServer = (props) => {
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
    const { actionAddFTPServer, openModalAddFTPServer,
        handleCloseModalAddFTPServer, dataModalAddFTPServer, } = props;

    const defaultData = {
        name: '',
        host: '',
        port: '',
        username: '',
        password: '',
        interval: '',
        fileName: '',
        fileType: '',
        folderName: '',
    };

    const { validate } = useValidator();
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [dataFTPServer, setDataFTPServer] = useState(defaultData);

    useEffect(() => {
        if (openModalAddFTPServer === false) return;

        if (actionAddFTPServer === "UPDATE" && dataModalAddFTPServer) {
            setDataFTPServer({ ...dataModalAddFTPServer });
        } else {
            setDataFTPServer(defaultData);
        }

        setErrors({});
    }, [openModalAddFTPServer, dataModalAddFTPServer, actionAddFTPServer]);


    const validateAll = () => {
        const newErrors = {};
        Object.entries(dataFTPServer).forEach(([k, v]) => {
            newErrors[k] = validate(k, v);
        });

        setErrors(newErrors);
        return Object.values(newErrors).every(e => e === "");
    };

    const handleInputChange = (value, name) => {
        setDataFTPServer(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: validate(name, value) }));
    };

    const handleConfirm = async () => {
        if (!validateAll()) return;
        let res
        if (actionAddFTPServer === 'CREATE') { res = await createFTPServer(dataFTPServer); }
        else if (actionAddFTPServer === 'UPDATE') { res = await updateFTPServer(dataFTPServer); }
        if (res && res.EC === 0) {
            toast.success(res.EM);
            console.log('socket.connected =', socket.connected);
            socket.emit('CHANGE FTP SERVER', dataFTPServer);
            handleCloseModalAddFTPServer();
        }
        else { toast.error(res.EM); }
    };

    return (
        <Modal open={openModalAddFTPServer} onClose={handleCloseModalAddFTPServer}>
            <Box sx={style}>

                {/* Header */}
                <Typography variant="h6" align="center" sx={{ fontWeight: 600 }}>
                    {actionAddFTPServer === 'CREATE' ? 'Thêm mới' : 'Chỉnh sửa'}
                </Typography>

                <IconButton
                    onClick={handleCloseModalAddFTPServer}
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
                        value={dataFTPServer.name}
                        onChange={(e) => handleInputChange(e.target.value, 'name')}
                        error={!!errors.name} helperText={errors.name} />

                    <TextField label="Host" variant="standard"
                        value={dataFTPServer.host}
                        onChange={(e) => handleInputChange(e.target.value, 'host')}
                        error={!!errors.host} helperText={errors.host} />

                    <TextField label="Port" variant="standard"
                        value={dataFTPServer.port}
                        onChange={(e) => handleInputChange(e.target.value, 'port')}
                        error={!!errors.port} helperText={errors.port} />

                    <TextField label="User Name" variant="standard"
                        value={dataFTPServer.username}
                        onChange={(e) => handleInputChange(e.target.value, 'username')}
                        error={!!errors.username} helperText={errors.username} />

                    <TextField
                        type={showPassword ? 'text' : 'password'}
                        label="Password"
                        variant="standard"
                        value={dataFTPServer.password || ''}
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

                    <TextField label="Interval (Min)" variant="standard"
                        value={dataFTPServer.interval}
                        onChange={(e) => handleInputChange(e.target.value, 'interval')}
                        error={!!errors.interval} helperText={errors.interval} />

                    <TextField label="File Name" variant="standard"
                        value={dataFTPServer.fileName}
                        onChange={(e) => handleInputChange(e.target.value, 'fileName')}
                        error={!!errors.fileName} helperText={errors.fileName} />

                    <TextField label="File Type" variant="standard" select
                        value={dataFTPServer.fileType}
                        onChange={(e) => handleInputChange(e.target.value, 'fileType')}
                        error={!!errors.fileType}
                        helperText={errors.fileType}
                    >
                        <MenuItem value="TXT">TXT</MenuItem>
                        <MenuItem value="CSV">CSV</MenuItem>
                    </TextField>

                    {/* Folder Name chiếm full 2 cột */}
                    <Box sx={{ gridColumn: "span 2" }}>
                        <TextField label="Folder Name" variant="standard" fullWidth
                            value={dataFTPServer.folderName}
                            onChange={(e) => handleInputChange(e.target.value, 'folderName')}
                            error={!!errors.folderName} helperText={errors.folderName} />
                    </Box>

                    <Box sx={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', mt: 1.5 }}>

                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<CancelPresentation />}
                            sx={{ textTransform: 'none' }}
                            onClick={handleCloseModalAddFTPServer}
                        >
                            Thoát
                        </Button>

                        <Button
                            variant="contained"
                            color="success"
                            startIcon={actionAddFTPServer === 'CREATE' ? <AddBoxIcon /> : <SaveIcon />}
                            sx={{ ml: 1.5, textTransform: 'none' }}
                            type="submit"
                        >
                            {actionAddFTPServer === 'CREATE' ? 'Thêm' : 'Cập nhật'}
                        </Button>

                    </Box>


                </Box>
            </Box>
        </Modal>
    );
};

export default ModalAddFTPServer;