import {
    useState, useEffect, Button, IconButton, MenuItem, TextField,
    Box, Modal, Typography, CancelIcon, socket, SaveIcon,
    CancelPresentation, AddBoxIcon, toast, _, Checkbox, useValidator,
} from '../../../ImportComponents/Imports';
import { createPublish, updatePublish, fetchAllChannels } from '../../../../Services/APIDevice';

const ModalAddTagPublish = (props) => {
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
        tagnameId: '',
        name: '',
        deviceId: '',
        deviceName: '',
        topic: '',
        controlRetain: '',
        controlQoS: ''
    };

    const { validate } = useValidator();
    const [errors, setErrors] = useState({});
    const [dataPublish, setDataPublish] = useState(defaultData);
    const [listChannels, setListChannels] = useState([]);
    const [loading, setLoading] = useState(true);
    const { action, openModalAddPublish, handleCloseModalAddPublish, dataModalPublish } = props;

    useEffect(() => {
        if (action === 'UPDATE' && dataModalPublish) {
            setDataPublish({
                ...dataModalPublish,
                controlQoS: dataModalPublish.controlQoS ?? "0",
                controlRetain: dataModalPublish.controlRetain ?? false
            });
            setErrors({});
        } else {
            setDataPublish(defaultData);
            fetchChannel();
        }
    }, [action, dataModalPublish, openModalAddPublish]);

    const fetchChannel = async () => {
        setLoading(true);
        let response = await fetchAllChannels();

        if (response && response.EC === 0 && Array.isArray(response.DT?.DT)) {
            const rowsWithId = response.DT.DT.map(item => ({
                id: item._id,
                channel: item.channel,
                name: item.name,
                deviceId: item.device?._id,
                deviceName: item.device?.name,
            }));
            setListChannels(rowsWithId);
        }

        setLoading(false);
    };


    const validateAll = () => {
        const newErrors = {};
        // Chỉ validate các trường bắt buộc
        const fieldsToValidate = ["name", "topic", "controlQoS", "controlRetain"];
        fieldsToValidate.forEach((key) => {
            const value = dataPublish[key];
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

    const handleClose = () => {
        handleCloseModalAddPublish();
        setErrors({})
        setDataPublish(defaultData);
    };

    const handleOnchangeInput = (value, name) => {
        if (name === 'topic') {
            value = value.replace(/[^a-zA-Z0-9/_-]/g, '');
        }

        setDataPublish((prev) => ({
            ...prev,
            [name]: value,
        }));

        const errorMessage = validate(name, value);
        setErrors((prev) => ({
            ...prev,
            [name]: errorMessage,
        }));
    };

    const handleSelectChannel = (item) => {
        setDataPublish(prev => ({
            ...prev,
            channel: item.channel,
            name: item.name,
            tagnameId: item.id,
            deviceId: item.deviceId,
            deviceName: item.deviceName
        }));

        const errorMessage = validate("name", item.name);
        setErrors(prev => ({
            ...prev,
            name: errorMessage,
        }));
    };

    const handleCheckboxChange = (label) => {
        setDataPublish((prev) => ({
            ...prev,
            selection: {
                ...prev.selection,
                [label]: !prev.selection?.[label]
            }
        }));
    };

    const handleConfirmPublish = async () => {
        if (!validateAll()) return;

        let res;
        if (action === 'CREATE') {
            res = await createPublish(dataPublish);
        } else {
            res = await updatePublish(dataPublish);
        }
        if (res && res.EC === 0) {
            toast.success(res.EM);
            handleClose();
        } else {
            toast.error(res.EM);
        }
    };

    return (
        <Modal open={openModalAddPublish} onClose={handleClose} onKeyDown={(e) => {

        }}>
            <Box sx={style}>
                {/* Header */}
                <Typography variant="h6" align="center" sx={{ fontWeight: 600, }}  >
                    {action === 'CREATE' ? 'Thêm mới' : 'Chỉnh sửa'}
                </Typography>

                <IconButton
                    onClick={handleClose}
                    sx={{
                        position: "absolute",
                        right: 20,
                        top: 20,
                        width: { xs: 36, md: 48 },
                        height: { xs: 36, md: 25 },
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
                        e.preventDefault(); // chặn reload trang
                        handleConfirmPublish();
                    }}
                >
                    {/* Name */}
                    <TextField
                        label="Name"
                        select
                        fullWidth
                        variant="standard"
                        value={dataPublish.tagnameId}
                        onChange={(e) => {
                            const selected = listChannels.find(ch => ch.id === e.target.value);
                            handleSelectChannel(selected);
                        }}
                        error={!!errors.name}
                        helperText={errors.name}
                    >
                        {listChannels.map(item => (
                            <MenuItem key={item.id} value={item.id}>
                                {item.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    {/* Topic */}
                    <TextField
                        label="Topic"
                        variant="standard"
                        value={dataPublish.topic}
                        onChange={(e) => handleOnchangeInput(e.target.value, 'topic')}
                        error={!!errors.topic}
                        helperText={errors.topic}
                    />

                    {/* QoS */}
                    <TextField
                        label="QoS"
                        variant="standard"
                        value={dataPublish.controlQoS}
                        select
                        fullWidth
                        onChange={(e) => handleOnchangeInput(e.target.value, 'controlQoS')}
                        error={!!errors.controlQoS}
                        helperText={errors.controlQoS}
                    >
                        <MenuItem value="0">0</MenuItem>
                        <MenuItem value="1">1</MenuItem>
                        <MenuItem value="2">2</MenuItem>
                    </TextField>

                    {/* Retain */}
                    <TextField
                        label="Retain"
                        variant="standard"
                        value={dataPublish.controlRetain}
                        select
                        fullWidth
                        onChange={(e) => handleOnchangeInput(e.target.value, 'controlRetain')}
                        error={!!errors.controlRetain}
                        helperText={errors.controlRetain}
                    // sx={{ gridColumn: 'span 2', justifySelf: 'center', width: '50%' }}
                    >
                        <MenuItem value="false">false</MenuItem>
                        <MenuItem value="true">true</MenuItem>
                    </TextField>

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
                            startIcon={action === 'CREATE' ? <AddBoxIcon /> : <SaveIcon />}
                            sx={{ ml: 1.5, textTransform: 'none' }}
                            type="submit"
                        >
                            {action === 'CREATE' ? 'Thêm' : 'Cập nhật'}
                        </Button>

                    </Box>

                </Box>
            </Box>
        </Modal >
    );
}

export default ModalAddTagPublish;
