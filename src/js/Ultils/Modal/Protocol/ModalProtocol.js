import {
    useState, useEffect, Button, CancelPresentation, MenuItem, TextField, Box,
    Modal, Typography, AddBoxIcon, IconButton, CancelIcon, _, useValidator
} from '../../../ImportComponents/Imports';

const ModalProtocol = (props) => {
    const {
        listProtocol,
        listModbus,
        listSiemens,
        listMqtt,
        isShowModalProtocol,
        handleCloseModalProtocol,
        setisShowModalDevice,
        setdataModalDevice
    } = props;

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
    };

    useEffect(() => {
        if (isShowModalProtocol) {
            setErrors({});
            setdataProtocol(defaultData);
        }
    }, [isShowModalProtocol]);


    const { validate } = useValidator();
    const [errors, setErrors] = useState({});
    const defaultData = { protocol: '', driverName: '' };
    const [dataProtocol, setdataProtocol] = useState(defaultData);

    const handleOnchangeInput = (value, name) => {
        setdataProtocol(prev => ({
            ...prev,
            [name]: value,
            ...(name === "protocol" ? { driverName: "" } : {})
        }));

        //  validate trường hiện tại
        const errorMessage = validate(name, value);

        setErrors(prev => {
            const newErrors = { ...prev, [name]: errorMessage };

            //  Nếu đang đổi protocol → clear lỗi driverName luôn
            if (name === "protocol") {
                newErrors.driverName = "";
            }
            return newErrors;
        });
    };

    const handleClose = () => {
        setErrors({});
        handleCloseModalProtocol();
        setdataProtocol(defaultData)
    };

    // const validateAll = () => {
    //     const newErrors = {};
    //     Object.entries(dataProtocol).forEach(([key, value]) => {
    //         // Nếu là MQTT thì bỏ qua validate driverName
    //         if (dataProtocol.protocol === "MQTT Client" && key === "driverName") {
    //             newErrors[key] = "";
    //         } else {
    //             newErrors[key] = validate(key, value);
    //         }
    //     });

    //     setErrors(newErrors);
    //     return Object.values(newErrors).every((err) => err === "");
    // };

    const validateAll = () => {
        const newErrors = {};
        Object.entries(dataProtocol).forEach(([key, value]) => {
            newErrors[key] = validate(key, value);

        });
        setErrors(newErrors);
        // Kiểm tra xem có lỗi nào không
        return Object.values(newErrors).every((err) => err === "");
    };

    const handleConfirmProtocol = () => {
        if (!validateAll()) {
            return;
        }
        switch (dataProtocol.protocol) {
            case "Modbus": {
                const modbusDriver = listModbus.find(
                    item => item.name === dataProtocol.driverName
                );
                if (modbusDriver) {
                    setdataModalDevice(prev => ({
                        ...prev,
                        protocol: dataProtocol.protocol,
                        driverName: modbusDriver.name
                    }));
                    handleClose();
                    setisShowModalDevice(true);
                }
                // else {
                //     alert("Vui lòng chọn driver Modbus hợp lệ");
                // }
                break;
            }

            case "Siemens": {
                const siemensDriver = listSiemens.find(
                    item => item.name === dataProtocol.driverName
                );
                setdataModalDevice(prev => ({
                    ...prev,
                    protocol: dataProtocol.protocol,
                    driverName: siemensDriver ? siemensDriver.name : ""
                }));
                handleClose();
                setisShowModalDevice(true);
                break;
            }

            case "MQTT": {
                const mqttsDriver = listMqtt.find(
                    item => item.name === dataProtocol.driverName
                );
                setdataModalDevice(prev => ({
                    ...prev,
                    protocol: dataProtocol.protocol,
                    driverName: mqttsDriver ? mqttsDriver.name : ""
                }));
                handleClose();
                setisShowModalDevice(true);
                break;
            }
            default:
                alert("Vui lòng chọn protocol hợp lệ");
                break;
        }
    };

    return (
        <>
            {/* Modal chọn protocol */}
            <Modal open={isShowModalProtocol} onClose={handleClose}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        handleConfirmProtocol();
                    }
                }}
            >
                <Box sx={style}>
                    <Typography variant="h6" align="center" sx={{ fontWeight: 600, }}  >
                        Chọn Protocol
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

                    <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mt={2}>
                        <TextField
                            select
                            label="Protocol"
                            variant="standard"
                            value={dataProtocol.protocol}
                            onChange={(e) => handleOnchangeInput(e.target.value, 'protocol')}
                            sx={{ gridColumn: "1 / -1" }}
                            error={!!errors.protocol}
                            helperText={errors.protocol}
                        >
                            {listProtocol.map((item) => (
                                <MenuItem key={item.id} value={item.name}>
                                    {item.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        {dataProtocol.protocol === 'Modbus' && (
                            <TextField
                                select
                                label="Driver Name"
                                variant="standard"
                                value={dataProtocol.driverName}
                                onChange={(e) => handleOnchangeInput(e.target.value, 'driverName')}
                                sx={{ gridColumn: "1 / -1" }}
                                error={!!errors.driverName}
                                helperText={errors.driverName}
                            >
                                {listModbus.map((item) => (
                                    <MenuItem key={item.id} value={item.name}>
                                        {item.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}

                        {dataProtocol.protocol === 'Siemens' && (
                            <TextField
                                select
                                label="Driver Name"
                                variant="standard"
                                value={dataProtocol.driverName}
                                onChange={(e) => handleOnchangeInput(e.target.value, 'driverName')}
                                sx={{ gridColumn: "1 / -1" }}
                                error={!!errors.driverName}
                                helperText={errors.driverName}
                            >
                                {listSiemens.map((item) => (
                                    <MenuItem key={item.id} value={item.name}>
                                        {item.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}

                        {dataProtocol.protocol === 'MQTT' && (
                            <TextField
                                select
                                label="Driver Name"
                                variant="standard"
                                value={dataProtocol.driverName}
                                onChange={(e) => handleOnchangeInput(e.target.value, 'driverName')}
                                sx={{ gridColumn: "1 / -1" }}
                                error={!!errors.driverName}
                                helperText={errors.driverName}
                            >
                                {listMqtt.map((item) => (
                                    <MenuItem key={item.id} value={item.name}>
                                        {item.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2.5 }}>

                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<CancelPresentation />}
                            sx={{ mt: 1.5, textTransform: 'none' }}
                            onClick={handleClose}
                        >
                            Thoát

                        </Button>

                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<AddBoxIcon />}
                            sx={{ mt: 1.5, ml: 1.5, textTransform: 'none' }}
                            onClick={handleConfirmProtocol}
                        >
                            Thêm
                        </Button>

                    </Box>
                </Box>
            </Modal >

        </>
    );
}

export default ModalProtocol
