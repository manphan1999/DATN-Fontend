import {
    useState, useEffect, Button, IconButton, Modal, Box, socket,
    Typography, TextField, CloseIcon, _, MenuItem, toast, useValidator
} from '../../../ImportComponents/Imports';
import { updateConfigHistorical } from '../../../../Services/APIDevice';

const ModalAddHistorical = (props) => {
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
    }

    const [errors, setErrors] = useState({});
    const { validate } = useValidator();
    const [dataEditTag, setDataEditTag] = useState(defaultData);
    const [originalData, setOriginalData] = useState(defaultData);
    const { handleCloseModalEditTag, isShowModalEdit, dataModalEditTag, dataConfig } = props

    useEffect(() => {
        if (isShowModalEdit) {
            setErrors({});
            if (dataModalEditTag) {
                setDataEditTag({
                    id: dataModalEditTag.id || '',
                    name: dataModalEditTag.name || '',
                    channel: dataModalEditTag.channel,
                    deviceId: dataModalEditTag.device?._id,
                    deviceName: dataModalEditTag.device?.name,
                    symbol: dataModalEditTag.symbol,
                    unit: dataModalEditTag.unit,
                });
            }
            else {
                setDataEditTag(defaultData);
            }
        }
    }, [isShowModalEdit]);

    const handleClose = () => {
        setErrors({});
        handleCloseModalEditTag()
    }

    const handleOnchangeInput = (value, name) => {
        let _dataEditTag = _.cloneDeep(dataEditTag)
        _dataEditTag[name] = value;
        setDataEditTag((prev) => ({ ...prev, [name]: value, }));
        const errorMessage = validate(name, value);
        setErrors((prev) => ({ ...prev, [name]: errorMessage, }));
    }

    const validateAll = () => {
        const newErrors = {};
        Object.entries(dataEditTag).forEach(([key, value]) => {
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
        const dataToUpdate = { ...dataEditTag };
        // console.log('check dataToUpdate: ', dataToUpdate)
        let res = await updateConfigHistorical(dataToUpdate)
        if (res && res && res.EC === 0) {
            toast.success(res.EM)
            socket.emit('CHANGE HISTORICAL');
            handleClose()
        } else {
            toast.error(res.EM)
        }
    }

    return (
        <Modal open={isShowModalEdit} onClose={handleClose}>
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
                    Chỉnh sửa
                </Typography>

                <IconButton
                    onClick={handleClose}
                    sx={{
                        position: "absolute",
                        right: 20,
                        top: "8%",
                        transform: "translateY(-50%)"
                    }}
                >
                    <CloseIcon />
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
                        value={dataEditTag.name}
                        variant="standard"
                    />

                    {/* Channel */}
                    <TextField
                        disabled
                        label="Channel"
                        value={dataEditTag.channel}
                        variant="standard"
                    />

                    {/* Device */}
                    <TextField
                        disabled
                        label="Device"
                        value={dataEditTag.deviceName}
                        variant="standard"
                    />

                    {/* Symbol */}
                    <TextField
                        disabled
                        label="Symbol"
                        value={dataEditTag.symbol}
                        variant="standard"
                    />

                    {/* Unit */}
                    <TextField
                        disabled
                        label="Unit"
                        value={dataEditTag.unit}
                        variant="standard"
                    />

                    {/* Group */}
                    <TextField
                        select
                        label="Type"
                        value={dataEditTag.type}
                        variant="standard"
                        onChange={(event) => handleOnchangeInput(event.target.value, 'type')}
                        error={!!errors.type}
                        helperText={errors.type}
                    >
                        <MenuItem value="none">None</MenuItem>
                        <MenuItem value="cycle">Cycle</MenuItem>
                        <MenuItem value="trigger">Trigger</MenuItem>
                    </TextField>
                </Box>

                {/* Footer */}
                <Box mt={3} textAlign="center">
                    <Button
                        variant="contained"
                        color="success"
                        disabled={_.isEqual(dataEditTag, originalData)}
                        sx={{ width: '150px' }}
                        onClick={() => handleConfirmEdit()}
                    >
                        <span> Chỉnh Sửa </span>
                    </Button>
                </Box>
            </Box>
        </Modal >
    );
}
export default ModalAddHistorical
