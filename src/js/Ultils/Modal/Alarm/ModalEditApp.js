import {
    useState, useEffect, Button, IconButton, TextField,
    Box, Modal, Typography, CancelIcon, CancelPresentation,
    toast, _, useValidator, socket, SaveIcon
} from '../../../ImportComponents/Imports';
import { updateApp } from '../../../../Services/APIDevice';

const ModalEditApp = (props) => {
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 500,
        bgcolor: '#fff',
        borderRadius: 2,
        boxShadow: 24,
        p: 2.5,
        maxHeight: '90vh',
        overflowY: 'auto',
    };

    const defaultData = {
        name: '',
        token: '',
        groupId: '',
    };

    const { validate } = useValidator();
    const [errors, setErrors] = useState({});
    const [dataApp, setDataApp] = useState(defaultData);
    const { openModalEditApp, handleCloseModalEditApp, dataModalApp } = props;

    useEffect(() => {
        if (openModalEditApp) {
            setErrors({});
            const mapped = {
                id: dataModalApp.id,
                name: dataModalApp.name || '',
                token: dataModalApp.token || '',
                groupId: Array.isArray(dataModalApp.groupId)
                    ? dataModalApp.groupId.join(',')
                    : dataModalApp.groupId || '',
            }
            setDataApp(mapped);
        }
    }, [openModalEditApp, dataModalApp]);

    const handleClose = () => {
        handleCloseModalEditApp();
        setErrors({});
        setDataApp(defaultData);
    };

    const handleOnchangeInput = (value, name) => {
        let _dataApp = _.cloneDeep(dataApp);
        _dataApp[name] = value;
        setDataApp(_dataApp);

        const errorMessage = validate(name, value);
        setErrors((prev) => ({
            ...prev,
            [name]: errorMessage,
        }));
    };

    const validateAll = () => {
        const newErrors = {};
        Object.entries(dataApp).forEach(([key, value]) => {
            newErrors[key] = validate(key, value);
        });
        console.log("validateAll errors:", newErrors);
        setErrors(newErrors);
        return Object.values(newErrors).every((err) => err === "");
    };

    const handleConfirm = async () => {
        //console.log("dataApp dataApp:", dataApp);
        if (!validateAll()) return;

        const groups = dataApp.groupId
            .split(',')
            .map(g => g.trim())
            .filter(g => g !== "");
        const dataToSave = { ...dataApp, groupId: groups, };
        const res = await updateApp(dataToSave);
        if (res && res.EC === 0) {
            toast.success(res.EM);
            socket.emit("CHANGE APP");
            handleClose();
        } else {
            toast.error(res.EM);
        }
    };

    return (
        <Modal open={openModalEditApp} onClose={handleClose}>
            <Box sx={style}>
                {/* Header */}
                <Typography variant="h6" align="center" sx={{ fontWeight: 600 }}>
                    Chỉnh sửa
                </Typography>

                <IconButton
                    onClick={handleClose}
                    sx={{
                        position: "absolute",
                        right: 20,
                        top: 20,
                    }}
                >
                    <CancelIcon sx={{ fontSize: 28 }} />
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

                    {/* Name */}
                    <TextField
                        label="Name"
                        disabled
                        variant="standard"
                        value={dataApp.name}
                        onChange={(e) => handleOnchangeInput(e.target.value, 'name')}
                        error={!!errors.name}
                        helperText={errors.name}
                        sx={{ gridColumn: 'span 2' }}
                    />

                    {/* Bot Token */}
                    <TextField
                        label="Bot Token"
                        variant="standard"
                        value={dataApp.token}
                        onChange={(e) => handleOnchangeInput(e.target.value, 'token')}
                        error={!!errors.token}
                        helperText={errors.token}
                        sx={{ gridColumn: 'span 2' }}
                    />

                    {/* Group ID */}
                    <TextField
                        label="Group ID (tối đa 5, cách nhau dấu phẩy)"
                        variant="standard"
                        value={dataApp.groupId}
                        onChange={(e) => handleOnchangeInput(e.target.value, 'groupId')}
                        error={!!errors.groupId}
                        helperText={errors.groupId}
                        sx={{ gridColumn: 'span 2' }}
                    />

                    {/* Buttons */}
                    <Box sx={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', mt: 1.5 }}>
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<CancelPresentation />}
                            sx={{ textTransform: 'none' }}
                            onClick={handleClose}
                        >
                            Thoát
                        </Button>

                        <Button
                            variant="contained"
                            color="success"
                            startIcon={< SaveIcon />}
                            sx={{ ml: 1.5, textTransform: 'none' }}
                            type="submit"
                        >
                            Cập nhật
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Modal >
    );
};

export default ModalEditApp;
