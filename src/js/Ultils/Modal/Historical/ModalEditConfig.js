import {
    useState, useEffect, Button, IconButton, Modal, Box, Typography,
    TextField, CancelIcon, _, MenuItem, toast, useValidator, socket, SaveIcon
} from '../../../ImportComponents/Imports';
import { updateConfigHistorical } from '../../../../Services/APIDevice';

const ModalEditConfig = (props) => {
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400, // chỉnh kích thước
        bgcolor: '#fff', // màu background
        borderRadius: 2,
        boxShadow: 24,
        p: 4,
    };
    const defaultData = {
        name: '',
        type: '',
        cycle: '',
    }

    const [errors, setErrors] = useState({});
    const { validate } = useValidator();
    const [dataConfig, setdataConfig] = useState(defaultData);
    const [originalData, setOriginalData] = useState(defaultData);
    const { handleCloseModalEditConfig, isShowModalEditConfig, dataModalEditConfig } = props

    useEffect(() => {
        if (isShowModalEditConfig) {
            setErrors({});
            const mapped = {
                id: dataModalEditConfig.id || '',
                name: dataModalEditConfig.name || '',
                type: dataModalEditConfig.type || '',
                cycle: dataModalEditConfig.cycle || '',
            }
            setdataConfig(mapped);
            setOriginalData(mapped);
        }
        else {
            setdataConfig(defaultData);
            setOriginalData(defaultData);
        }

    }, [isShowModalEditConfig, dataModalEditConfig]);

    const handleClose = () => {
        setErrors({});
        handleCloseModalEditConfig()
    }

    const handleOnchangeInput = (value, name) => {
        let _dataConfig = _.cloneDeep(dataConfig)
        _dataConfig[name] = value;
        setdataConfig((prev) => ({
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

    const handleConfirmEdit = async () => {
        if (!validateAll()) {
            return;
        }
        const dataToUpdate = { ...dataConfig };
        let res = await updateConfigHistorical(dataToUpdate)
        if (res && res && res.EC === 0) {
            toast.success(res.EM)
            socket.emit("CHANGE HISTORICAL");
            handleClose()
        } else {
            toast.error(res.EM)
        }
    }

    return (
        <Modal open={isShowModalEditConfig} onClose={handleClose}>
            <Box sx={style}>
                {/* Header */}
                <Typography
                    variant="h6"
                    align="center"
                    sx={{
                        position: "relative",
                        top: "-15px"
                    }}
                >
                    <span>Chỉnh Sửa</span>
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
                    mt={2}
                >
                    {/* Name */}
                    <TextField
                        label="Name"
                        value={dataConfig.name}
                        variant="standard"
                        onChange={(event) => handleOnchangeInput(event.target.value, 'name')}
                        error={!!errors.name}
                        helperText={errors.name}
                    />
                    {/* Type */}
                    <TextField
                        select
                        label="Type"
                        value={dataConfig.type}
                        variant="standard"
                        onChange={(event) => handleOnchangeInput(event.target.value, 'type')}
                        error={!!errors.type}
                        helperText={errors.type}
                    >
                        <MenuItem value="None">None</MenuItem>
                        <MenuItem value="Cycle">Cycle</MenuItem>
                        <MenuItem value="TT10/2021">TT10/2021</MenuItem>
                    </TextField>
                    {/* Parity*/}

                    {/* Hiển thị khi Type là "cycle" */}
                    {dataConfig.type === "Cycle" && (
                        <TextField
                            label="Cycle (s)"
                            value={dataConfig.cycle}
                            variant="standard"
                            onChange={(event) => handleOnchangeInput(event.target.value, 'cycle')}
                            error={!!errors.cycle}
                            helperText={errors.cycle}
                            sx={{
                                gridColumn: 'span 2',
                                justifySelf: 'center',
                                width: '50%',
                            }}
                        />
                    )}

                </Box>

                {/* Footer */}
                <Box mt={3} textAlign="center">
                    <Button
                        variant="contained"
                        color="success"
                        disabled={_.isEqual(dataConfig, originalData)}
                        sx={{ width: '150px' }}
                        startIcon={<SaveIcon />}
                        onClick={() => handleConfirmEdit()}
                    >
                        <span> cập nhật </span>
                    </Button>
                </Box>
            </Box>
        </Modal >
    );
}
export default ModalEditConfig
