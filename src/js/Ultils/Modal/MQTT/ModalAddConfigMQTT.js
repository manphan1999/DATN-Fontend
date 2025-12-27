import {
    useState, useEffect, Button, IconButton, MenuItem, TextField,
    Box, Modal, Typography, CancelIcon, socket, SaveIcon,
    CancelPresentation, AddBoxIcon, toast, _, Checkbox, useValidator,
} from '../../../ImportComponents/Imports';

import { createConfigPublish, updateConfigPublish, fetchAllDevices } from '../../../../Services/APIDevice';

const ModalAddConfigMQTT = (props) => {
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
        deviceId: '',
        deviceName: '',
        topic: '',
        controlQoS: '',
        controlRetain: '',
    };

    const { validate } = useValidator();
    const [errors, setErrors] = useState({});
    const [dataPublish, setDataPublish] = useState(defaultData);
    const [listConfig, SetListConfig] = useState([]);
    const [loading, setLoading] = useState(true);
    const { action, openModalAddPublish, handleCloseModalAddConfigMQTT, dataModalConfig } = props;

    useEffect(() => {
        if (action === 'UPDATE' && dataModalConfig) {
            setDataPublish({
                ...dataModalConfig,
                controlQoS: String(dataModalConfig.controlQoS ?? '0'),
                controlRetain: String(dataModalConfig.controlRetain ?? 'false'),
            });
            setErrors({});
        } else {
            setDataPublish(defaultData);
            fetchDevices();
        }
    }, [action, dataModalConfig, openModalAddPublish]);

    const fetchDevices = async () => {
        setLoading(true);
        const response = await fetchAllDevices();

        if (response?.EC === 0 && Array.isArray(response.DT?.DT)) {
            const mqttDevices = response.DT.DT
                .filter(item => item.protocol === 'MQTT')
                .map(item => ({
                    id: item._id,
                    name: item.name,
                    ipAddress: item.ipAddress,
                    port: item.port,
                    protocol: item.protocol,
                    driverName: item.driverName,
                    username: item.username,
                    password: item.password,
                }));
            // console.log('DEVICES:', mqttDevices);
            SetListConfig(mqttDevices);
        }
        setLoading(false);
    };

    const validateAll = () => {
        const newErrors = {};
        const fields = [
            'deviceId',
            'topic',
            'controlQoS',
            'controlRetain',
        ];

        fields.forEach(key => {
            const value = dataPublish[key];
            const error = validate(key, value);
            newErrors[key] = error;
        });
        setErrors(newErrors);
        const isValid = Object.values(newErrors).every(e => !e);
        return isValid;
    };

    const handleClose = () => {
        handleCloseModalAddConfigMQTT();
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

    const handleSelectDevice = (device) => {
        if (!device) return;

        setDataPublish(prev => ({
            ...prev,
            deviceId: device.id,
            deviceName: device.name,
            ipAddress: device.ipAddress,
            port: device.port,
            protocol: device.protocol,
            driverName: device.driverName,
            username: device.username,
            password: device.password,
        }));

        setErrors(prev => ({
            ...prev,
            deviceId: validate('deviceId', device.id),
        }));
    };

    const handleConfirmPublish = async () => {
        if (!validateAll()) return;
        let res;
        if (action === 'CREATE') {
            res = await createConfigPublish(dataPublish);
        } else {
            res = await updateConfigPublish(dataPublish);
        }
        if (res && res.EC === 0) {
            console.log('socket.connected =', socket.connected);
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
                    {action === 'CREATE' ? 'Thêm mới' : 'Cập nhật'}
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
                        label="MQTT Device"
                        select
                        fullWidth
                        variant="standard"
                        value={dataPublish.deviceId}
                        onChange={(e) => {
                            const selected = listConfig.find(d => d.id === e.target.value);
                            handleSelectDevice(selected);
                        }}
                        error={!!errors.deviceId}
                        helperText={errors.deviceId}
                    >
                        {listConfig.map(item => (
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

export default ModalAddConfigMQTT;
