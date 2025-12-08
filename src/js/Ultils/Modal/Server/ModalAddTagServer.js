import {
    useState, useEffect, Button, IconButton, MenuItem, TextField,
    Box, FindInPageIcon, InputAdornment, Modal, Typography, CancelIcon,
    CancelPresentation, AddBoxIcon, toast, _, useValidator, SaveIcon,
} from '../../../ImportComponents/Imports';
import {
    createRTUServer, updateRTUServer, createTCPServer, updateTCPServer,
} from '../../../../Services/APIDevice';

const ModalAddTagServer = (props) => {
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 500,
        bgcolor: '#fff',
        borderRadius: 2,
        boxShadow: 24,
        p: 2,
        maxHeight: '90vh',
        overflowY: 'auto',
    };

    const defaultData = {
        id: '',
        name: '',
        deviceId: '',
        deviceName: '',
        functionCode: null,
        dataFormat: null,
        dataType: null,
        slaveId: '',
        address: ''
    };

    const { validate } = useValidator();
    const [errors, setErrors] = useState({});
    const [dataServer, setDataServer] = useState(defaultData);
    const { action, openModalAddServer, handleCloseModalAddServer,
        setopenModalSearchTag, setActionChooseTag, dataModalServer,
        listDataFormat, listDataType, listFunctionCode } = props;

    useEffect(() => {
        if (dataModalServer) {
            const newData = {
                ...defaultData,
                ...dataModalServer,
                name: dataModalServer.name || "",
                deviceId: dataModalServer.deviceId || "",
                deviceName: dataModalServer.deviceName || "",
                functionCode: dataModalServer.functionCode ?? "",
                dataFormat: dataModalServer.dataFormat ?? "",
                slaveId: dataModalServer.slaveId ?? "",
                address: dataModalServer.address ?? ""
            };
            setDataServer(newData);
        }
    }, [dataModalServer]);

    useEffect(() => {
        if (action === 'CREATE RTU' || action === 'CREATE TCP') {
            setDataServer(defaultData);
            setErrors({});
        } else {
            setDataServer(dataModalServer);
        }
    }, [action]);

    const validateAll = () => {
        const newErrors = {};
        let fieldsToValidate = ["address"];

        if (action === 'CREATE TCP' || action === 'UPDATE TCP') {
            fieldsToValidate = fieldsToValidate.filter(f => f !== "slaveId");
            newErrors.slaveId = "";
        }

        fieldsToValidate.forEach((key) => {
            const value = dataServer[key];
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
        handleCloseModalAddServer();
        setErrors({})
        setDataServer(defaultData);
    };

    const handleOnchangeInput = (value, name) => {
        setDataServer(prev => ({ ...prev, [name]: value }));
    };

    const handleOpenModalSearch = () => {
        setActionChooseTag('SERVER');
        setopenModalSearchTag(true);
    }

    const handleConfirmServer = async () => {
        if (!validateAll()) return;
        let res;
        if (action === 'CREATE RTU') {
            res = await createRTUServer(dataServer);
        } else if (action === 'UPDATE RTU') {
            res = await updateRTUServer(dataServer);
        } else if (action === 'CREATE TCP') {
            res = await createTCPServer(dataServer);
        } else if (action === 'UPDATE TCP') {
            res = await updateTCPServer(dataServer);
        }

        if (res && res.EC === 0) {
            toast.success(res.EM);
            handleClose();
        } else {
            toast.error(res.EM);
        }
    };

    const getDataTypeOptionsByFormat = () => {
        const formatId = Number(dataModalServer.dataFormat);
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

    return (
        <Modal open={openModalAddServer} onClose={handleClose} onKeyDown={(e) => {

        }}>
            <Box sx={style}>
                {/* Header */}
                <Typography variant="h6" align="center" sx={{ mb: 1, fontWeight: 600, }}  >
                    {(action === 'CREATE RTU' || action === 'CREATE TCP') ? 'Thêm mới' : 'Chỉnh sửa'}
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
                        handleConfirmServer();
                    }}
                >
                    {/* Name */}
                    <TextField
                        label="Name"
                        variant="standard"
                        value={dataServer.name ?? ""}
                        // onChange={(e) => handleOnchangeInput(e.target.value, 'name')}
                        error={!!errors.name}
                        helperText={errors.name}
                        InputProps={{
                            readOnly: true,
                            endAdornment: (
                                <InputAdornment position="end" sx={{ mr: 1 }}>
                                    <IconButton
                                        edge="end"
                                        onClick={handleOpenModalSearch}
                                    >
                                        <FindInPageIcon />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    {/* Device */}
                    <TextField
                        label="Thiết bị"
                        variant="standard"
                        value={dataServer.deviceName ?? ""}
                    />

                    {/* Function */}
                    <TextField
                        select
                        disabled
                        fullWidth
                        sx={{ gridColumn: 'span 2' }}
                        label="Function"
                        value={dataServer.functionCode ?? ""}
                        variant="standard"
                        //onChange={(e) => handleOnchangeInput(e.target.value, 'functionCode')}
                        error={!!errors.functionCode}
                        helperText={errors.functionCode}
                    >
                        {[...listFunctionCode.modbus, ...listFunctionCode.mqtt].map((item) => (
                            <MenuItem key={item.id} value={item.id}>
                                {item.name}
                            </MenuItem>
                        ))}
                    </TextField>
                    {/* 
        
                    {(action === 'CREATE RTU' || action === 'UPDATE RTU') && (
                        <TextField
                            label="Slave Id"
                            value={dataServer.slaveId ?? ""}
                            variant="standard"
                            onChange={(e) => handleOnchangeInput(e.target.value, 'slaveId')}
                            error={!!errors.slaveId}
                            helperText={errors.slaveId}
                        />
                    )} */}
                    {/* Address */}
                    <TextField
                        label="Address"
                        value={dataServer.address ?? ""}
                        variant="standard"
                        onChange={(e) => handleOnchangeInput(e.target.value, 'address')}
                        error={!!errors.address}
                        helperText={errors.address}
                    />
                    {/* Data Format */}
                    <TextField
                        select
                        disabled
                        label="Data Format"
                        value={dataServer.dataFormat ?? ""}
                        variant="standard"
                        // onChange={(e) => handleOnchangeInput(e.target.value, 'dataFormat')}
                        sx={(action === 'CREATE RTU' || action === 'UPDATE RTU') && Number(dataModalServer.dataFormat) < 2 ? {
                            gridColumn: 'span 2',
                            justifySelf: 'center',
                            width: '50%'
                        } : {}}
                        error={!!errors.dataFormat}
                        helperText={errors.dataFormat}
                    >
                        {listDataFormat.map((item) => (
                            <MenuItem key={item.id} value={item.id}>
                                {item.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    {/* Data Type */}
                    {Number(dataModalServer.dataFormat) > 2 && (
                        <TextField
                            select
                            label="Data Type"
                            value={dataServer.dataType ?? ""}
                            variant="standard"
                            sx={(action === 'CREATE TCP' || action === 'UPDATE TCP') ? {
                                gridColumn: 'span 2',
                                justifySelf: 'center',
                                width: '50%'
                            } : {}}
                            //      sx={{ gridColumn: 'span 2', justifySelf: 'center', width: '50%' }}
                            onChange={(e) => handleOnchangeInput(e.target.value, 'dataType')}
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
                            startIcon={(action === 'CREATE RTU' || action === 'CREATE TCP') ? <AddBoxIcon /> : <SaveIcon />}
                            sx={{ ml: 1.5, textTransform: 'none' }}

                            type="submit"
                        >
                            {(action === 'CREATE RTU' || action === 'CREATE TCP') ? 'Thêm' : 'Cập nhật'}
                        </Button>

                    </Box>

                </Box>
            </Box>
        </Modal >
    );
}

export default ModalAddTagServer;
