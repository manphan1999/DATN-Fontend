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
        width: '90vw', // dùng % thay vì fix px, tự scale theo màn hình
        maxWidth: 600, // không vượt quá 600px trên màn hình lớn
        bgcolor: '#fff',
        borderRadius: 2,
        boxShadow: 24,
        p: 2.5,
        maxHeight: '90vh', // chiều cao tối đa theo viewport
        overflowY: 'auto', // bật scroll dọc khi vượt quá maxHeight
    };

    const defaultData = {
        channel: '',
        name: '',
        device: null,
        symbol: '',
        unit: '',
        offset: '',
        gain: '',
        lowSet: '',
        highSet: '',
        slaveId: '',
        functionCode: null,
        address: '',
        dataFormat: null,
        dataType: null,
        functionText: '',
        permission: false,
        selectFTP: false,
    };

    const [dataChannels, setDataChannels] = useState(defaultData);
    const [errors, setErrors] = useState({});
    const { validate } = useValidator();
    const { action, actionFuncSetting, isShowModalChannel, handleCloseModalChannel, dataModalChannel,
        listDevices, listDataFormat, listDataType, listFunctionCode } = props;

    useEffect(() => {
        if (isShowModalChannel) {
            // console.log('check data tag name from list: ', actionFuncSetting)
            setErrors({});
            if (action === 'EDIT' && dataModalChannel) {
                const func = listFunctionCode.find(f => f.id === dataModalChannel.functionCodeId);
                const format = listDataFormat.find(d => d.id === dataModalChannel.dataFormatId);
                const type = listDataType.find(t => t.id === dataModalChannel.dataTypeId);
                const device = listDevices.find(d => d.name === dataModalChannel.deviceName);

                setDataChannels({
                    id: dataModalChannel.id,
                    channel: dataModalChannel.channel,
                    name: dataModalChannel.name,
                    device: device ? { _id: device.id, name: device.name } : null,
                    symbol: dataModalChannel.symbol,
                    unit: dataModalChannel.unit,
                    offset: dataModalChannel.offset,
                    gain: dataModalChannel.gain,
                    lowSet: dataModalChannel.lowSet,
                    highSet: dataModalChannel.highSet,
                    slaveId: dataModalChannel.slaveId,
                    functionCode: func ? func.id : null,
                    address: dataModalChannel.address,
                    dataFormat: format ? format.id : null,
                    dataType: type ? type.id : null,
                    functionText: dataModalChannel.functionText,
                    permission: dataModalChannel.permission,
                    selectFTP: dataModalChannel.selectFTP
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
        // Cập nhật giá trị dataChannels
        setDataChannels((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Validate ngay khi người dùng nhập và cập nhật errors theo field
        const errorMessage = validate(name, value);
        setErrors((prev) => ({
            ...prev,
            [name]: errorMessage,
        }));
    };

    const validateAll = () => {
        const newErrors = {};
        Object.entries(dataChannels).forEach(([key, value]) => {
            if (key === "functionText" || key === "unit") {
                newErrors[key] = ""; // bỏ qua kiểm tra
            }
            else if (key === "dataType" && Number(dataChannels.dataFormat) <= 2) {
                newErrors[key] = "";
            }
            else if (
                ["dataFormat", "offset", "gain", "lowSet", "highSet"].includes(key) &&
                !(Number(dataChannels.functionCode) > 2 && Number(dataChannels.functionCode) !== 5)
            ) {
                newErrors[key] = "";
            }
            else {
                newErrors[key] = validate(key, value);
            }
        });

        setErrors(newErrors);
        return Object.values(newErrors).every(err => err === "");
    };

    const handleConfirmChannel = async () => {
        if (!validateAll()) {
            // alert('Check Validate again');
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
            socket.emit('CHANGE TAGNAME');
            toast.success(res.EM);
            handleClose();
        } else {
            toast.error(res.EM);
        }
    };

    const getDataTypeOptionsByFormat = () => {
        const formatId = Number(dataChannels.dataFormat);
        // console.log('Check formatId: ', formatId)
        // console.log('Check listDataType: ', listDataType)
        switch (formatId) {
            case 3: // 32-bit Signed
                return listDataType.filter(item => [7, 8, 9, 10].includes(Number(item._id || item.id)));
            case 4: // 32-bit Unsigned
                return listDataType.filter(item => [11, 12, 13, 14].includes(Number(item._id || item.id)));
            case 5: // 32-bit Float
                return listDataType.filter(item => [3, 4, 5, 6].includes(Number(item._id || item.id)));
            case 6: // 64-bit Signed
                return listDataType.filter(item => [15, 16, 17, 18].includes(Number(item._id || item.id)));
            case 7: // 64-bit Unsigned
                return listDataType.filter(item => [19, 20, 21, 22].includes(Number(item._id || item.id)));
            case 8: // 64-bit Double
                return listDataType.filter(item => [23, 24, 25, 26].includes(Number(item._id || item.id)));
            default:
                return [];
        }
    };

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
                        top: 20,
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
                        e.preventDefault(); // chặn reload trang
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
                        onChange={(e) => {
                            const device = listDevices.find(d => d.id === e.target.value);
                            if (device) {
                                handleInputChange({ _id: device.id, name: device.name }, "device");
                            }
                        }}
                        error={!!errors.device}
                        helperText={errors.device}
                    >
                        {listDevices.map((item) => (
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
                            const func = listFunctionCode.find(f => f.id === funcId);
                            if (func) {
                                setDataChannels((prev) => ({
                                    ...prev,
                                    functionCode: func.id,
                                    // Nếu functionCode <= 2 hoặc = 5 thì clear luôn dataFormat và dataType
                                    dataFormat: (funcId > 2 && funcId !== 5) ? prev.dataFormat : '',
                                    dataType: (funcId > 2 && funcId !== 5) ? prev.dataType : ''
                                }));
                            }
                        }}
                        error={!!errors.functionCode}
                        helperText={errors.functionCode}
                    >
                        {listFunctionCode.map((item) => (
                            <MenuItem key={item.id} value={item.id}>
                                {item.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    {/* Slave Id */}
                    <TextField
                        label="Slave Id"
                        value={dataChannels.slaveId}
                        variant="standard"
                        onChange={(e) => handleInputChange(e.target.value, 'slaveId')}
                        error={!!errors.slaveId}
                        helperText={errors.slaveId}
                    />

                    {/* Address */}
                    <TextField
                        label="Address"
                        value={dataChannels.address}
                        variant="standard"
                        onChange={(e) => handleInputChange(e.target.value, 'address')}
                        error={!!errors.address}
                        helperText={errors.address}
                    />

                    {/* Data Format */}
                    {(Number(dataChannels.functionCode) > 2 && Number(dataChannels.functionCode) !== 5) && (
                        <TextField
                            select
                            fullWidth
                            label="Data Format"
                            value={dataChannels.dataFormat || ""}
                            variant="standard"
                            onChange={(e) => {
                                const formatId = Number(e.target.value);
                                const format = listDataFormat.find(d => d.id === formatId);
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
                            {listDataFormat.map((item) => (
                                <MenuItem key={item.id} value={item.id}>
                                    {item.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    )}

                    {/* Data Type */}
                    {Number(dataChannels.dataFormat) > 2 && (
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

                    {(Number(dataChannels.functionCode) > 2 && Number(dataChannels.functionCode) !== 5) && (
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

                            {/* Low Set */}
                            <TextField
                                label="Low Set"
                                value={dataChannels.lowSet}
                                variant="standard"
                                onChange={(e) => handleInputChange(e.target.value, 'lowSet')}
                                error={!!errors.lowSet}
                                helperText={errors.lowSet}
                            />

                            {/* High Set */}
                            <TextField
                                label="High Set"
                                value={dataChannels.highSet}
                                variant="standard"
                                onChange={(e) => handleInputChange(e.target.value, 'highSet')}
                                error={!!errors.highSet}
                                helperText={errors.highSet}
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
                            minRows={5} // số dòng tối thiểu hiển thị
                            maxRows={5} // số dòng tối đa trước khi hiện thanh cuộn
                            // fullWidth
                            sx={{
                                gridColumn: 'span 2',
                                '& .MuiInputBase-root': {
                                    maxHeight: 250,
                                    overflowY: 'auto',
                                    // fontFamily: 'monospace',
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

                    {/* Switch chọn FTP */}
                    <FormControlLabel
                        label="Select FTP"
                        sx={{
                            mb: 2,
                            gap: 1, // khoảng cách giữa label và switch (theme.spacing(2) = 16px)
                            "& .MuiFormControlLabel-label": {
                                marginLeft: "12px", // cách trái 12px
                            },
                        }}
                        control={
                            <Android12Switch
                                checked={dataChannels.selectFTP}
                                onChange={(e) => handleInputChange(e.target.checked, "selectFTP")}
                            />
                        }
                    />

                    {/* Footer */}
                    <Box mt={3}
                        sx={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end' }}>
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
                            type="submit"
                            variant="contained"
                            color="success"
                            startIcon={action === 'CREATE' ? <AddBoxIcon /> : <SaveIcon />}
                            sx={{ ml: 1.5, textTransform: 'none' }}
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
