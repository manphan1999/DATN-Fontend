import {
    useState, useEffect, Button, IconButton, Modal, Box,
    Typography, TextField, CancelPresentation, MenuItem,
    RadioGroup, Radio, FormControlLabel, CancelIcon, SaveIcon,
    toast, socket, useValidator, Android12Switch, AddBoxIcon
} from '../../../ImportComponents/Imports';
import { createNewChannel, updateCurrentChannel } from '../../../../Services/APIDevice';

const ModalChannel = (props) => {
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90vw',
        maxWidth: 600,
        bgcolor: '#fff',
        borderRadius: 2,
        boxShadow: 24,
        px: 2.5,
        py: 1,
        maxHeight: '90vh',
        overflowY: 'auto',
    };

    const defaultData = {
        channel: '',
        name: '',
        device: null,
        symbol: '',
        unit: '',
        offset: '',
        gain: '',
        slaveId: '',
        functionCode: null,
        address: '',
        topic: '',
        dataFormat: null,
        dataType: null,
        functionText: '',
        permission: false,
        selectFTP: false,
        selectMySQL: false,
        selectSQL: false,
    };

    const [dataChannels, setDataChannels] = useState(defaultData);
    const [errors, setErrors] = useState({});
    const { validate } = useValidator();
    const { action, actionFuncSetting, isShowModalChannel, handleCloseModalChannel, dataModalChannel,
        listDevices, listDataFormat, listDataType, listFunctionCodeModbus = [], listFunctionCodeMQTT = [] } = props;

    // Hàm lấy protocol của device hiện tại
    const getCurrentDeviceProtocol = () => {
        if (!dataChannels.device) return null;
        const selectedDevice = (listDevices || []).find(device => device.id === dataChannels.device._id);
        return selectedDevice ? selectedDevice.protocol : null;
    };

    // Hàm lấy danh sách function code theo device được chọn
    const getFunctionCodeList = (deviceId = null) => {
        if (!deviceId) return [];

        const selectedDevice = (listDevices || []).find(device => device.id === deviceId);

        if (selectedDevice) {
            if (selectedDevice.protocol === "MQTT") {
                return listFunctionCodeMQTT || [];
            } else {
                // Mặc định là Modbus
                return listFunctionCodeModbus || [];
            }
        }

        return [];
    };

    useEffect(() => {
        if (isShowModalChannel) {
            setErrors({});
            if (action === 'EDIT' && dataModalChannel) {
                // Sử dụng hàm getFunctionCodeList với deviceId cụ thể
                const functionCodesForDevice = getFunctionCodeList(dataModalChannel.deviceId);
                const func = functionCodesForDevice.find(f => f.id === dataModalChannel.functionCodeId);
                const format = (listDataFormat || []).find(d => d.id === dataModalChannel.dataFormatId);
                const type = (listDataType || []).find(t => t.id === dataModalChannel.dataTypeId);
                const device = (listDevices || []).find(d => d.name === dataModalChannel.deviceName);

                setDataChannels({
                    id: dataModalChannel.id,
                    channel: dataModalChannel.channel,
                    name: dataModalChannel.name,
                    device: device ? { _id: device.id, name: device.name } : null,
                    symbol: dataModalChannel.symbol,
                    unit: dataModalChannel.unit,
                    offset: dataModalChannel.offset,
                    gain: dataModalChannel.gain,
                    slaveId: dataModalChannel.slaveId,
                    functionCode: func ? func.id : null,
                    address: dataModalChannel.address,
                    topic: dataModalChannel.topic || '',
                    dataFormat: format ? format.id : null,
                    dataType: type ? type.id : null,
                    functionText: dataModalChannel.functionText,
                    permission: dataModalChannel.permission,
                    selectFTP: dataModalChannel.selectFTP,
                    selectMySQL: dataModalChannel.selectMySQL,
                    selectSQL: dataModalChannel.selectSQL
                });
            }
            if (action === 'CREATE') {
                setDataChannels(prev => ({
                    ...defaultData,
                    functionText:
                        `(x) => {
    let y = Number(x.toFixed(2));
    return y;
}`
                }));
            }
        }
    }, [isShowModalChannel, action, actionFuncSetting, dataModalChannel]);

    const handleClose = () => {
        handleCloseModalChannel();
        setDataChannels(defaultData);
        setErrors({});
    };

    const handleInputChange = (value, name) => {
        setDataChannels((prev) => ({
            ...prev,
            [name]: value,
        }));

        const errorMessage = validate(name, value);
        setErrors((prev) => ({
            ...prev,
            [name]: errorMessage,
        }));
    };

    // Hàm xử lý khi thay đổi device
    const handleDeviceChange = (deviceId) => {
        const device = (listDevices || []).find(d => d.id === deviceId);
        if (device) {
            setDataChannels(prev => ({
                ...prev,
                device: { _id: device.id, name: device.name },
                functionCode: '', // Reset function code khi đổi device
                slaveId: device.protocol === 'MQTT' ? '' : prev.slaveId, // Reset slaveId nếu là MQTT
                address: device.protocol === 'MQTT' ? '' : prev.address, // Reset address nếu là MQTT
                topic: device.protocol === 'Modbus' ? '' : prev.topic, // Reset topic nếu là Modbus
                dataFormat: '', // Reset data format
                dataType: '' // Reset data type
            }));
        }
    };

    const validateAll = () => {
        const newErrors = {};
        const currentProtocol = getCurrentDeviceProtocol();

        // Danh sách tất cả các trường cần validate
        const fieldsToValidate = [
            'channel', 'name', 'device', 'symbol', 'unit', 'offset', 'gain',
            'slaveId', 'functionCode', 'address', 'topic', 'dataFormat', 'dataType',
            'functionText', 'permission', 'selectFTP', 'selectMySQL', 'selectSQL'
        ];

        fieldsToValidate.forEach(key => {
            let shouldValidate = true;

            // Các trường không bao giờ validate
            if (key === 'unit' || key === 'functionText') {
                shouldValidate = false;
            }

            // Các trường bắt buộc chung: channel, name, device, functionCode, symbol
            if (['channel', 'name', 'device', 'functionCode', 'symbol'].includes(key)) {
                shouldValidate = true;
            }

            // Xử lý theo protocol
            if (currentProtocol === 'Modbus') {
                // Modbus: validate slaveId, address
                if (key === 'slaveId' || key === 'address') {
                    shouldValidate = true;
                }
                // Modbus: validate dataFormat, offset, gain nếu functionCode phù hợp
                if (key === 'dataFormat' || key === 'offset' || key === 'gain') {
                    shouldValidate = (Number(dataChannels.functionCode) > 2 && Number(dataChannels.functionCode) !== 5);
                }
                // Modbus: validate dataType nếu dataFormat > 2 và functionCode phù hợp
                if (key === 'dataType') {
                    shouldValidate = (Number(dataChannels.functionCode) > 2 && Number(dataChannels.functionCode) !== 5) && Number(dataChannels.dataFormat) > 2;
                }
                // Modbus: không validate topic
                if (key === 'topic') {
                    shouldValidate = false;
                }
            } else if (currentProtocol === 'MQTT') {
                // MQTT: validate topic
                if (key === 'topic') {
                    shouldValidate = true;
                }
                // MQTT: không validate các trường Modbus
                if (['slaveId', 'address', 'dataFormat', 'dataType', 'offset', 'gain'].includes(key)) {
                    shouldValidate = false;
                }
            } else {
                // Nếu chưa có protocol, chỉ validate các trường bắt buộc chung
                if (!['channel', 'name', 'device', 'functionCode', 'symbol'].includes(key)) {
                    shouldValidate = false;
                }
            }

            if (shouldValidate) {
                newErrors[key] = validate(key, dataChannels[key]);
            } else {
                newErrors[key] = "";
            }
        });

        setErrors(newErrors);
        return Object.values(newErrors).every(err => err === "");
    };
    const handleConfirmChannel = async () => {
        if (!validateAll()) {
            return;
        }

        const dataToSave = { ...dataChannels };

        // Nếu dataFormat là 1 hoặc 2 -> ép luôn dataType tương ứng
        if (dataToSave.dataFormat === 1) {
            dataToSave.dataType = 1;
        } else if (dataToSave.dataFormat === 2) {
            dataToSave.dataType = 2;
        }

        const res = action === 'CREATE'
            ? await createNewChannel(dataToSave)
            : await updateCurrentChannel(dataToSave);

        if (res && res.EC === 0) {
            console.log('socket.connected =', socket.connected);
            socket.emit('CHANGE TAGNAME');
            toast.success(res.EM);
            handleClose();
        } else {
            toast.error(res.EM);
        }
    };

    const getDataTypeOptionsByFormat = () => {
        const formatId = Number(dataChannels.dataFormat);
        switch (formatId) {
            case 3: // 32-bit Signed
                return (listDataType || []).filter(item => [7, 8, 9, 10].includes(Number(item._id || item.id)));
            case 4: // 32-bit Unsigned
                return (listDataType || []).filter(item => [11, 12, 13, 14].includes(Number(item._id || item.id)));
            case 5: // 32-bit Float
                return (listDataType || []).filter(item => [3, 4, 5, 6].includes(Number(item._id || item.id)));
            case 6: // 64-bit Signed
                return (listDataType || []).filter(item => [15, 16, 17, 18].includes(Number(item._id || item.id)));
            case 7: // 64-bit Unsigned
                return (listDataType || []).filter(item => [19, 20, 21, 22].includes(Number(item._id || item.id)));
            case 8: // 64-bit Double
                return (listDataType || []).filter(item => [23, 24, 25, 26].includes(Number(item._id || item.id)));
            default:
                return [];
        }
    };

    const currentProtocol = getCurrentDeviceProtocol();

    return (
        <Modal open={isShowModalChannel}
            onClose={handleClose}
            onKeyDown={(e) => {
                if (
                    e.key === "Enter" &&
                    !["functionText"].includes(e.target.name)
                ) {
                    e.preventDefault();
                    handleConfirmChannel();
                }
            }}
        >
            <Box sx={style}>
                {/* Header */}
                <Typography variant="h6" align="center" sx={{ fontWeight: 600, fontSize: 25 }}  >
                    {action === 'CREATE' ? 'Thêm mới' : 'Chỉnh sửa'}
                </Typography>

                <IconButton
                    onClick={handleClose}
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
                        handleConfirmChannel();
                    }}
                >
                    {/* Channel */}
                    <TextField
                        label="Channel"
                        value={dataChannels.channel}
                        variant="standard"
                        onChange={(e) => handleInputChange(e.target.value, 'channel')}
                        error={!!errors.channel}
                        helperText={errors.channel}
                    />

                    {/* Name */}
                    <TextField
                        label="Name"
                        value={dataChannels.name}
                        variant="standard"
                        onChange={(e) => handleInputChange(e.target.value, 'name')}
                        error={!!errors.name}
                        helperText={errors.name}
                    />

                    {/* Device */}
                    <TextField
                        select
                        fullWidth
                        label="Device"
                        variant="standard"
                        value={dataChannels.device?._id || ""}
                        onChange={(e) => handleDeviceChange(e.target.value)}
                        error={!!errors.device}
                        helperText={errors.device}
                    >
                        {(listDevices || []).map((item) => (
                            <MenuItem key={item.id} value={item.id}>
                                {item.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    {/* Function */}
                    <TextField
                        select
                        fullWidth
                        label="Function"
                        variant="standard"
                        value={dataChannels.functionCode || ""}
                        onChange={(e) => {
                            const funcId = Number(e.target.value);
                            const functionCodes = getFunctionCodeList(dataChannels.device?._id);
                            const func = functionCodes.find(f => f.id === funcId);
                            if (func) {
                                setDataChannels((prev) => ({
                                    ...prev,
                                    functionCode: func.id,
                                    dataFormat: (funcId > 2 && funcId !== 5) ? prev.dataFormat : '',
                                    dataType: (funcId > 2 && funcId !== 5) ? prev.dataType : ''
                                }));
                            }
                        }}
                        error={!!errors.functionCode}
                        helperText={errors.functionCode}
                    >
                        {(getFunctionCodeList(dataChannels.device?._id) || []).map((item) => (
                            <MenuItem key={item.id} value={item.id}>
                                {item.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    {/* Hiển thị các field theo protocol */}
                    {currentProtocol === 'Modbus' && (
                        <>
                            {/* Slave Id - chỉ hiển thị cho Modbus */}
                            <TextField
                                label="Slave Id"
                                value={dataChannels.slaveId}
                                variant="standard"
                                onChange={(e) => handleInputChange(e.target.value, 'slaveId')}
                                error={!!errors.slaveId}
                                helperText={errors.slaveId}
                            />

                            {/* Address - chỉ hiển thị cho Modbus */}
                            <TextField
                                label="Address"
                                value={dataChannels.address}
                                variant="standard"
                                onChange={(e) => handleInputChange(e.target.value, 'address')}
                                error={!!errors.address}
                                helperText={errors.address}
                            />

                            {/* Data Format - chỉ hiển thị cho Modbus với function code phù hợp */}
                            {(Number(dataChannels.functionCode) > 2 && Number(dataChannels.functionCode) !== 5) && (
                                <TextField
                                    select
                                    fullWidth
                                    label="Data Format"
                                    value={dataChannels.dataFormat || ""}
                                    variant="standard"
                                    onChange={(e) => {
                                        const formatId = Number(e.target.value);
                                        const format = (listDataFormat || []).find(d => d.id === formatId);
                                        if (format) {
                                            setDataChannels(prev => ({
                                                ...prev,
                                                dataFormat: format.id,
                                                dataType: formatId > 2 ? prev.dataType : ''
                                            }));
                                        }
                                    }}
                                    error={!!errors.dataFormat}
                                    helperText={errors.dataFormat}
                                >
                                    {(listDataFormat || []).map((item) => (
                                        <MenuItem key={item.id} value={item.id}>
                                            {item.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        </>
                    )}

                    {currentProtocol === 'MQTT' && (
                        <>
                            {/* Topic - chỉ hiển thị cho MQTT */}
                            <TextField
                                label="Topic"
                                value={dataChannels.topic}
                                variant="standard"
                                onChange={(e) => handleInputChange(e.target.value, 'topic')}
                                error={!!errors.topic}
                                helperText={errors.topic}
                                sx={{ gridColumn: 'span 2' }} // Chiếm 2 cột
                            />
                        </>
                    )}

                    {/* Data Type - chỉ hiển thị cho Modbus với data format phù hợp */}
                    {currentProtocol === 'Modbus' && Number(dataChannels.dataFormat) > 2 && (
                        <TextField
                            select
                            fullWidth
                            label="Data Type"
                            value={dataChannels.dataType || ""}
                            variant="standard"
                            onChange={(e) => handleInputChange(Number(e.target.value), "dataType")}
                            error={!!errors.dataType}
                            helperText={errors.dataType}
                        >
                            {getDataTypeOptionsByFormat().map(item => (
                                <MenuItem key={item._id || item.id} value={item._id || item.id}>
                                    {item.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}

                    {/* Symbol */}
                    <TextField
                        label="Symbol"
                        value={dataChannels.symbol}
                        variant="standard"
                        onChange={(e) => handleInputChange(e.target.value, 'symbol')}
                        error={!!errors.symbol}
                        helperText={errors.symbol}
                    />

                    {/* Unit - Hiển thị cho cả MQTT và Modbus */}
                    {currentProtocol === 'MQTT' && (
                        <TextField
                            label="Unit"
                            value={dataChannels.unit}
                            variant="standard"
                            onChange={(e) => handleInputChange(e.target.value, 'unit')}
                        />
                    )}

                    {/* Unit, Offset, Gain - chỉ hiển thị cho Modbus với function code phù hợp */}
                    {currentProtocol === 'Modbus' && (Number(dataChannels.functionCode) > 2 && Number(dataChannels.functionCode) !== 5) && (
                        <>
                            {/* Unit */}
                            <TextField
                                label="Unit"
                                value={dataChannels.unit}
                                variant="standard"
                                onChange={(e) => handleInputChange(e.target.value, 'unit')}
                            />

                            {/* Offset */}
                            <TextField
                                label="Offset"
                                value={dataChannels.offset}
                                variant="standard"
                                onChange={(e) => handleInputChange(e.target.value, 'offset')}
                                error={!!errors.offset}
                                helperText={errors.offset}
                            />

                            {/* Gain */}
                            <TextField
                                label="Gain"
                                value={dataChannels.gain}
                                variant="standard"
                                onChange={(e) => handleInputChange(e.target.value, 'gain')}
                                error={!!errors.gain}
                                helperText={errors.gain}
                            />
                        </>
                    )}

                    {/* Function Text */}
                    {actionFuncSetting === 'FUNC' && (
                        <TextField
                            name="functionText"
                            label="Function Text"
                            value={dataChannels.functionText || ""}
                            variant="standard"
                            onChange={(e) => handleInputChange(e.target.value, 'functionText')}
                            multiline
                            minRows={5}
                            maxRows={5}
                            sx={{
                                gridColumn: 'span 2',
                                '& .MuiInputBase-root': {
                                    maxHeight: 250,
                                    overflowY: 'auto',
                                    whiteSpace: 'pre',
                                }
                            }}
                        />
                    )}

                    <Box>
                        <Box >Permission</Box>
                        <RadioGroup
                            row
                            name="row-radio-buttons-group"
                            value={dataChannels.permission}
                            onChange={(e) =>
                                handleInputChange(e.target.value === "true", "permission")
                            }
                        >
                            <FormControlLabel value={false} control={<Radio />} label="Read" />
                            <FormControlLabel value={true} control={<Radio />} label="Read & Write" />
                        </RadioGroup>
                    </Box>

                    <Box display="flex" flexDirection="row" gap={4} sx={{ ml: 2, mt: 0.7 }}>
                        {/* FTP */}
                        <Box display="flex" flexDirection="column" alignItems="center">
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                                FTP
                            </Typography>
                            <Android12Switch
                                checked={dataChannels.selectFTP}
                                onChange={(e) => handleInputChange(e.target.checked, "selectFTP")}
                            />
                        </Box>

                        {/* MySQL */}
                        <Box display="flex" flexDirection="column" alignItems="center">
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                                MySQL
                            </Typography>
                            <Android12Switch
                                checked={dataChannels.selectMySQL}
                                onChange={(e) => handleInputChange(e.target.checked, "selectMySQL")}
                            />
                        </Box>

                        {/* SQL */}
                        <Box display="flex" flexDirection="column" alignItems="center">
                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                                SQL
                            </Typography>
                            <Android12Switch
                                checked={dataChannels.selectSQL}
                                onChange={(e) => handleInputChange(e.target.checked, "selectSQL")}
                            />
                        </Box>
                    </Box>

                    {/* Footer */}
                    <Box mt={3}
                        sx={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<CancelPresentation />}
                            sx={{ mb: 2, textTransform: 'none' }}
                            onClick={handleClose}
                        >
                            Thoát
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="success"
                            startIcon={action === 'CREATE' ? <AddBoxIcon /> : <SaveIcon />}
                            sx={{ ml: 1.5, mb: 2, textTransform: 'none' }}
                        >
                            {action === 'CREATE' ? 'Thêm' : 'Cập nhật'}
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Modal >
    );
}

export default ModalChannel;