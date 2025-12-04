import {
    useState, useEffect, Button, CancelPresentation, MenuItem, TextField, Box, socket,
    Modal, Typography, SaveIcon, IconButton, CancelIcon, toast, _, useValidator,
} from '../../../ImportComponents/Imports';
import { updateCurrentCom } from '../../../../Services/APIDevice';

const ModalCom = (props) => {
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
        maxHeight: '90vh',
        overflowY: 'auto',
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
    const [dataCom, setdataComs] = useState(defaultData);
    const [originalData, setOriginalData] = useState(defaultData);
    const { handleCloseModalCom, isShowModalCom, dataModalCom } = props

    useEffect(() => {
        if (isShowModalCom) {
            setErrors({});
            const mapped = {
                name: dataModalCom.name || '',
                type: dataModalCom.type || '',
                baudRate: dataModalCom.baudRate ?? '',
                parity: dataModalCom.parity || '',
                dataBit: dataModalCom.dataBit || '',
                stopBit: dataModalCom.stopBit || '',
            }
            setdataComs(mapped);
            setOriginalData(mapped);
        }
        else {
            setdataComs(defaultData);
            setOriginalData(defaultData);
        }

    }, [isShowModalCom, dataModalCom]);

    const handleClose = () => {
        setErrors({});
        handleCloseModalCom()
    }

    const handleOnchangeInput = (value, name) => {
        let _dataCom = _.cloneDeep(dataCom)
        _dataCom[name] = value;
        setdataComs((prev) => ({
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
        Object.entries(dataCom).forEach(([key, value]) => {
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
        const dataToUpdate = { ...dataCom, id: dataModalCom.id };
        let res = await updateCurrentCom(dataToUpdate)
        if (res && res && res.EC === 0) {
            toast.success(res.EM)
            socket.emit('UPDATE COM');
            handleClose()
        } else {
            toast.error(res.EM)
        }
    }

    return (
        <Modal open={isShowModalCom} onClose={handleClose}>
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
                        value={dataCom.name}
                        variant="standard"
                        onChange={(event) => handleOnchangeInput(event.target.value, 'name')}
                        error={!!errors.name}
                        helperText={errors.name}
                    />
                    {/* Type */}
                    <TextField
                        disabled
                        label="Type"
                        value={dataCom.type}
                        variant="standard"
                        onChange={(event) => handleOnchangeInput(event.target.value, 'type')}
                        error={!!errors.type}
                        helperText={errors.type}
                    >
                    </TextField>
                    {/* Baud Rate */}
                    <TextField
                        label="Baud Rate"
                        value={dataCom.baudRate}
                        variant="standard"
                        onChange={(event) => handleOnchangeInput(event.target.value, 'baudRate')}
                        error={!!errors.baudRate}
                        helperText={errors.baudRate}
                    />
                    {/* Data Bit */}
                    <TextField
                        select
                        label="Data Bit"
                        value={dataCom.dataBit}
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
                        value={dataCom.stopBit}
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
                        value={dataCom.parity}
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
                        disabled={_.isEqual(dataCom, originalData)}
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
                        startIcon={<SaveIcon />}
                        sx={{ mt: 1.5, ml: 1.5, textTransform: 'none' }}
                        onClick={() => handleConfirmCom()}
                        disabled={_.isEqual(dataCom, originalData)}
                    >
                        Cập nhật
                    </Button>

                </Box>

            </Box>
        </Modal>
    );
}

export default ModalCom
