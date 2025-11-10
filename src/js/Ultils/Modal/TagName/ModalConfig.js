import {
    useState, useEffect, Button, CancelPresentation, MenuItem, TextField, Box,
    Modal, Typography, BorderColorIcon, IconButton, CancelIcon, toast, _, useValidator
} from '../../../ImportComponents/Imports';
import { updateCurrentCom } from '../../../../Services/APIDevice';

const ModalConfig = (props) => {
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 500, // chỉnh kích thước
        bgcolor: '#fff', // màu background
        borderRadius: 2,
        boxShadow: 24,
        p: 2.5,
    };
    const defaultData = {
        name: '',
        type: '',
        baudRate: '',
        parity: '',
        dataBit: '',
        stopBit: '',
        serialPort: '',
    }

    const [errors, setErrors] = useState({});
    const { validate } = useValidator();
    const [dataConfig, setdataConfigs] = useState(defaultData);
    const [originalData, setOriginalData] = useState(defaultData);
    const { handleCloseModalConfig, isShowModalConfig, dataModalConfig } = props

    useEffect(() => {
        if (isShowModalConfig) {
            setErrors({});
            const mapped = {
                name: dataModalConfig.name || '',
                type: dataModalConfig.type || '',
                baudRate: dataModalConfig.baudRate ?? '',
                parity: dataModalConfig.parity || '',
                dataBit: dataModalConfig.dataBit || '',
                stopBit: dataModalConfig.stopBit || '',
            }
            setdataConfigs(mapped);
            setOriginalData(mapped);
        }
        else {
            setdataConfigs(defaultData);
            setOriginalData(defaultData);
        }

    }, [isShowModalConfig, dataModalConfig]);

    const handleClose = () => {
        setErrors({});
        handleCloseModalConfig()
    }

    const handleOnchangeInput = (value, name) => {
        let _dataConfig = _.cloneDeep(dataConfig)
        _dataConfig[name] = value;
        setdataConfigs((prev) => ({
            ...prev,
            [name]: value,
        }));
        const errorMessage = validate(name, value);
        setErrors((prev) => ({
            ...prev,
            [name]: errorMessage,
        }));
    }

    const validateAll = () => {
        const newErrors = {};
        Object.entries(dataConfig).forEach(([key, value]) => {
            newErrors[key] = validate(key, value);

        });
        setErrors(newErrors);
        // Kiểm tra xem có lỗi nào không
        return Object.values(newErrors).every((err) => err === "");
    };

    const handleConfirmCom = async () => {
        if (!validateAll()) {
            return;
        }
        const dataToUpdate = { ...dataConfig, id: dataModalConfig.id };
        let res = await updateCurrentCom(dataToUpdate)
        if (res && res && res.EC === 0) {
            toast.success(res.EM)
            handleClose()
        } else {
            toast.error(res.EM)
        }
    }

    return (
        <Modal open={isShowModalConfig} onClose={handleClose}>
            <Box sx={style}>
                {/* Header */}
                <Typography variant="h6" align="center" sx={{ fontWeight: 600, }}  >
                    Chỉnh sửa
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
                    mt={2}
                >
                    {/* Name */}
                    <TextField
                        disabled
                        label="Name"
                        value={dataConfig.name}
                        variant="standard"
                        onChange={(event) => handleOnchangeInput(event.target.value, 'name')}
                        error={!!errors.name}
                        helperText={errors.name}
                    />
                    {/* Type */}
                    <TextField
                        disabled
                        label="Type"
                        value={dataConfig.type}
                        variant="standard"
                        onChange={(event) => handleOnchangeInput(event.target.value, 'type')}
                        error={!!errors.type}
                        helperText={errors.type}
                    >
                    </TextField>
                    {/* Baud Rate */}
                    <TextField
                        label="Baud Rate"
                        value={dataConfig.baudRate}
                        variant="standard"
                        onChange={(event) => handleOnchangeInput(event.target.value, 'baudRate')}
                        error={!!errors.baudRate}
                        helperText={errors.baudRate}
                    />
                    {/* Data Bit */}
                    <TextField
                        select
                        label="Data Bit"
                        value={dataConfig.dataBit}
                        variant="standard"
                        onChange={(event) => handleOnchangeInput(event.target.value, 'dataBit')}
                        error={!!errors.dataBit}
                        helperText={errors.dataBit}
                    >
                        <MenuItem value="7">7</MenuItem>
                        <MenuItem value="8">8</MenuItem>
                    </TextField>
                    {/* Stop Bit*/}
                    <TextField
                        select
                        label="Stop Bit"
                        value={dataConfig.stopBit}
                        variant="standard"
                        onChange={(event) => handleOnchangeInput(event.target.value, 'stopBit')}
                        error={!!errors.stopBit}
                        helperText={errors.stopBit}
                    >
                        <MenuItem value="1">1</MenuItem>
                        <MenuItem value="2">2</MenuItem>
                    </TextField>
                    {/* Parity*/}
                    <TextField
                        select
                        label="Parity"
                        value={dataConfig.parity}
                        variant="standard"
                        onChange={(event) => handleOnchangeInput(event.target.value, 'parity')}
                        error={!!errors.parity}
                        helperText={errors.parity}
                    >
                        <MenuItem value="none">None</MenuItem>
                        <MenuItem value="odd">Odd</MenuItem>
                        <MenuItem value="even">Even</MenuItem>
                    </TextField>
                </Box>

                {/* Footer */}
                {/* <Box mt={3} textAlign="center">
                    <Button
                        variant="contained"
                        color="success"
                        disabled={_.isEqual(dataConfig, originalData)}
                        sx={{ width: '150px' }}
                        onClick={() => handleConfirmCom()}
                    >
                        <span> Chỉnh Sửa </span>
                    </Button>
                </Box> */}

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
                        startIcon={<BorderColorIcon />}
                        sx={{ mt: 1.5, ml: 1.5, textTransform: 'none' }}
                        onClick={() => handleConfirmCom()}
                        disabled={_.isEqual(dataConfig, originalData)}
                    >
                        Chỉnh Sửa
                    </Button>

                </Box>

            </Box>
        </Modal>
    );
}

export default ModalConfig
