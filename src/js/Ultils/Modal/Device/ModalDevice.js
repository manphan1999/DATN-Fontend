import {
    useState, useEffect, Button, IconButton, MenuItem, TextField,
    Box, useValidator, InputAdornment, Modal, Typography, CancelIcon,
    CancelPresentation, SaveIcon, toast, _, Visibility, VisibilityOff, socket,
} from '../../../ImportComponents/Imports';
import { createNewDevice, updateCurrentDevice, fetchAllComs } from '../../../../Services/APIDevice';

const ModalDevice = (props) => {
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
        id: '',
        name: '',
        serialPort: '',
        protocol: '',
        driverName: '',
        timeOut: '',
        ipAddress: '',
        username: '',
        password: '',
        port: '',
    };

    const { validate } = useValidator();
    const [errors, setErrors] = useState({});
    const [dataDevice, setDataDevice] = useState(defaultData);
    const [listComs, setListComs] = useState([]);
    const [showPassword, setShowPassword] = useState(false);

    const { action, isShowModalDevice, handleCloseModalDevice,
        dataModalDevice, listProtocol, listModbus, listSiemens, listMqtt } = props;

    useEffect(() => {
        fetchComs();
    }, []);

    const fetchComs = async () => {
        let response = await fetchAllComs();
        if (response && response.EC === 0 && response.DT?.DT) {
            const rows = response.DT.DT.map((item) => ({
                name: item.name,
                serialPort: item.serialPort,
            }));
            setListComs(rows);
        }
    };

    useEffect(() => {
        if (isShowModalDevice) {
            setErrors({});
            if (action === 'EDIT' && dataModalDevice) {
                //console.log('Check dataModalDevice: ', listProtocol)
                setDataDevice({
                    id: dataModalDevice.id || '',
                    name: dataModalDevice.name || '',
                    serialPort: dataModalDevice.serialPort || '',
                    protocol: dataModalDevice.protocol || '',
                    driverName: dataModalDevice.driverName || '',
                    timeOut: dataModalDevice.timeOut || '',
                    ipAddress: dataModalDevice.ipAddress || '',
                    username: dataModalDevice.username || '',
                    password: dataModalDevice.password || '',
                    port: dataModalDevice.port || '',
                });
            } else if (action === 'CREATE' && dataModalDevice) {
                setDataDevice(prev => ({
                    ...prev,
                    protocol: dataModalDevice.protocol || '',
                    driverName: dataModalDevice.driverName || '',
                    ipAddress: '',
                    port: '',
                    serialPort: '',
                }));
            } else {
                setDataDevice(defaultData);
            }
        }
    }, [isShowModalDevice, action, dataModalDevice]);

    const handleClose = () => {
        setErrors({});
        handleCloseModalDevice();
        setDataDevice(defaultData);
    };

    const handleOnchangeInput = (value, name) => {
        // Khi đổi Protocol → reset toàn bộ các trường liên quan
        if (name === "protocol") {
            setDataDevice(prev => {
                let updated = {
                    ...prev,
                    protocol: value,
                    driverName: "",
                    ipAddress: "",
                    port: "",
                    username: "",
                    password: "",
                };

                if (value === "Siemens" || value === "MQTT") {
                    updated.serialPort = "";
                }

                return updated;
            });
            return;
        }

        // Khi đổi DriverName → xử lý riêng
        if (name === "driverName") {
            setDataDevice(prev => {
                let updated = { ...prev, driverName: value };

                switch (value) {
                    case "Modbus RTU Client":
                        updated.ipAddress = "";
                        updated.port = "";
                        updated.username = "";
                        updated.password = "";
                        break;

                    case "Modbus TCP Client":
                    case "S7-1200":
                        updated.serialPort = "";
                        updated.username = "";
                        updated.password = "";
                        break;

                    case "MQTT Client":
                        updated.serialPort = "";
                        break;

                    default:
                        updated.serialPort = "";
                        updated.ipAddress = "";
                        updated.port = "";
                        updated.username = "";
                        updated.password = "";
                        break;
                }
                return updated;
            });
            return;
        }

        // Cập nhật các field khác bình thường
        setDataDevice(prev => ({
            ...prev,
            [name]: value,
        }));

        // Validate lại
        const errorMessage = validate(name, value);
        setErrors(prev => ({
            ...prev,
            [name]: errorMessage,
        }));
    };

    const validateAll = () => {
        const newErrors = {};
        const isRTU = dataDevice.driverName === "Modbus RTU Client";
        const isTCP = dataDevice.driverName === "Modbus TCP Client";
        const isS7 = dataDevice.driverName === "S7-1200";
        const isMQTT = dataDevice.driverName === "MQTT Client";

        let fieldsToValidate = ["name", "protocol", "timeOut"];

        if (isMQTT) {
            fieldsToValidate.push("username", "password");
        }

        if (isRTU) {
            fieldsToValidate.push("serialPort");
        }

        if (isTCP || isS7 || isMQTT) {
            fieldsToValidate.push("ipAddress", "port");
        }
        fieldsToValidate.forEach((key) => {
            const value = dataDevice[key];
            const errorMsg = validate(key, value);
            newErrors[key] = errorMsg;
            if (errorMsg) {
                console.warn(`Lỗi ở ${key}: ${errorMsg}`);
            }
        });

        setErrors(newErrors);
        return Object.values(newErrors).every((err) => err === "");
    };

    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleMouseUpPassword = (event) => {
        event.preventDefault();
    };
    const handleConfirmDevice = async () => {
        if (!validateAll()) {
            return;
        }
        const dataToUpdate = { ...dataDevice, id: dataModalDevice?.id };
        let res = action === 'CREATE'
            ? await createNewDevice(dataDevice)
            : await updateCurrentDevice(dataToUpdate);
        if (res && res.EC === 0) {
            toast.success(res.EM);
            socket.emit('CHANGE DEVICE');
            handleClose();
        } else {
            toast.error(res.EM);
        }
    };

    return (
        <Modal open={isShowModalDevice} onClose={handleClose} onKeyDown={(e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                handleConfirmDevice();
            }
        }}>
            <Box sx={style}>
                {/* Header */}
                <Typography variant="h6" align="center" sx={{ fontWeight: 600, mb: 2 }}  >
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
                        handleConfirmDevice();
                    }}
                >
                    {/* Name */}
                    <TextField
                        label="Name"
                        value={dataDevice.name}
                        variant="standard"
                        onChange={(e) => handleOnchangeInput(e.target.value, 'name')}
                        error={!!errors.name}
                        helperText={errors.name}
                    />
                    {/* Protocol */}
                    <TextField
                        select
                        label="Protocol"
                        value={dataDevice.protocol}
                        variant="standard"
                        onChange={(e) => handleOnchangeInput(e.target.value, 'protocol')}
                        error={!!errors.protocol}
                        helperText={errors.protocol}
                    >
                        {listProtocol.map((item) => (
                            <MenuItem key={item.id} value={item.name}>
                                {item.name}
                            </MenuItem>
                        ))}
                    </TextField>
                    {/* Driver Name */}
                    <TextField
                        select
                        label="Driver Name"
                        value={dataDevice.driverName}
                        variant="standard"
                        onChange={(e) => handleOnchangeInput(e.target.value, 'driverName')}
                        error={!!errors.driverName}
                        helperText={errors.driverName}
                    >
                        {dataDevice.protocol === 'Modbus' ? (
                            listModbus.map((item) => (
                                <MenuItem key={item.id} value={item.name}>
                                    {item.name}
                                </MenuItem>
                            ))
                        ) : dataDevice.protocol === 'Siemens' ? (
                            listSiemens.map((item) => (
                                <MenuItem key={item.id} value={item.name}>
                                    {item.name}
                                </MenuItem>
                            ))
                        ) : dataDevice.protocol === 'MQTT' ? (
                            listMqtt.map((item) => (
                                <MenuItem key={item.id} value={item.name}>
                                    {item.name}
                                </MenuItem>
                            ))
                        ) : (
                            <MenuItem disabled>— Chọn protocol trước —</MenuItem>
                        )}
                    </TextField>
                    {/* Serial Port cho Modbus RTU */}
                    {dataDevice.driverName === 'Modbus RTU Client' && (
                        <TextField
                            select
                            label="Serial Port"
                            value={dataDevice.serialPort}
                            variant="standard"
                            onChange={(e) => handleOnchangeInput(e.target.value, 'serialPort')}
                            error={!!errors.serialPort}
                            helperText={errors.serialPort}
                        >
                            {listComs.map((com, idx) => (
                                <MenuItem key={idx} value={com.serialPort}>
                                    {com.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}

                    {/* Ip + Port cho Modbus TCP, S7-1200, MQTT Client*/}
                    {(
                        dataDevice.driverName === 'Modbus TCP Client' ||
                        dataDevice.driverName === 'S7-1200' ||
                        dataDevice.driverName === 'MQTT Client'
                    ) && (
                            <>
                                <TextField
                                    label="Ip Address"
                                    value={dataDevice.ipAddress || ''}
                                    variant="standard"
                                    onChange={(e) => handleOnchangeInput(e.target.value, 'ipAddress')}
                                    error={!!errors.ipAddress}
                                    helperText={errors.ipAddress}
                                />
                                <TextField
                                    label="Port"
                                    value={dataDevice.port || ''}
                                    variant="standard"
                                    onChange={(e) => handleOnchangeInput(e.target.value, 'port')}
                                    error={!!errors.port}
                                    helperText={errors.port}
                                />
                            </>
                        )}

                    {/* User + Pass cho MQTT Client*/}
                    {dataDevice.protocol === 'MQTT' && (
                        <>
                            <TextField
                                label="User Name"
                                value={dataDevice.username || ''}
                                variant="standard"
                                onChange={(e) => handleOnchangeInput(e.target.value, 'username')}
                                error={!!errors.username}
                                helperText={errors.username}
                            />
                            <TextField
                                type={showPassword ? 'text' : 'password'}
                                label="Password"
                                value={dataDevice.password || ''}
                                onChange={(e) => handleOnchangeInput(e.target.value, 'password')}
                                error={!!errors.password}
                                helperText={errors.password}
                                variant="standard"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={handleClickShowPassword}
                                                onMouseDown={handleMouseDownPassword}
                                                onMouseUp={handleMouseUpPassword}
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </>
                    )}

                    {/* Time Out */}
                    <TextField
                        label="TimeOut (ms)"
                        InputProps={{ style: { textAlign: 'center' } }}
                        value={dataDevice.timeOut}
                        variant="standard"
                        onChange={(e) => handleOnchangeInput(e.target.value, 'timeOut')}
                        error={!!errors.timeOut}
                        helperText={errors.timeOut}
                        sx={dataDevice.driverName === 'Modbus RTU Client' ? {
                            gridColumn: 'span 2',
                            justifySelf: 'center',
                            width: '50%'
                        } : {}}
                    />
                    {/* Footer */}
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
                            startIcon={<SaveIcon />}
                            sx={{ ml: 1.5, textTransform: 'none' }}
                            type="submit"
                        // disabled={_.isEqual(dataCom, originalData)}
                        >
                            {action === 'CREATE' ? 'Thêm' : 'Chỉnh sửa'}
                        </Button>

                    </Box>

                </Box>
            </Box>
        </Modal >
    );
}

export default ModalDevice;
