import {
    useState, useEffect, Button, IconButton, MenuItem, TextField,
    Box, FindInPageIcon, InputAdornment, Modal, Typography, CancelIcon,
    CancelPresentation, AddBoxIcon, toast, _, Checkbox, useValidator,
    socket, SaveIcon
} from '../../../ImportComponents/Imports';
import { createNewAlarm, updateTagAlarm } from '../../../../Services/APIDevice';

const ModalAddTagAlarm = (props) => {
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

    const defaultDataChoose = {
        tagnameId: '',
        name: '',
        deviceId: '',
        deviceName: '',
        condition: '',
        rangeAlarm: '',
        content: '',
        selection: {},
    };

    const { validate } = useValidator();
    const [errors, setErrors] = useState({});
    const [dataAlarm, setDataAlarm] = useState(defaultDataChoose);
    const { action, openModalAddAlarm, handleCloseModalAddAlarm,
        setopenModalSearchTag, setactionAlarm, dataModalAlarm } = props;

    useEffect(() => {
        if (dataModalAlarm) {
            setDataAlarm((prev) => ({
                ...defaultDataChoose,
                ...prev,
                ...dataModalAlarm,
            }));
        }
        // console.log('check data was choose: ', dataModalAlarm)
    }, [dataModalAlarm]);

    useEffect(() => {
        if (action === 'CREATE') {
            setDataAlarm(defaultDataChoose);
            setErrors({});
        }
    }, [action]);

    const validateAll = () => {
        const newErrors = {};
        // Chỉ validate các trường bắt buộc
        const fieldsToValidate = ["name", "condition", "rangeAlarm"];

        fieldsToValidate.forEach((key) => {
            const value = dataAlarm[key];
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
        handleCloseModalAddAlarm();
        setErrors({})
        setDataAlarm(defaultDataChoose);
    };

    const handleOnchangeInput = (value, name) => {
        let _dataAlarm = _.cloneDeep(dataAlarm)
        _dataAlarm[name] = value;
        if (name === 'content' && value.length > 40) {
            return;
        }
        setDataAlarm((prev) => ({
            ...prev,
            [name]: value,
        }));
        const errorMessage = validate(name, value);
        setErrors((prev) => ({
            ...prev,
            [name]: errorMessage,
        }));
    }

    const handleCheckboxChange = (label) => {
        setDataAlarm((prev) => ({
            ...prev,
            selection: {
                ...prev.selection,
                [label]: !prev.selection?.[label]
            }
        }));
    };

    const handleOpenModalSearch = () => {
        setactionAlarm('ALARM');
        setopenModalSearchTag(true);
    }

    const handleConfirmAlarm = async () => {
        if (!validateAll()) return;
        let res;
        let dataToSave;
        if (action === 'CREATE') {
            const { id, ...rest } = dataAlarm;
            dataToSave = { ...rest, tagnameId: id };
            res = await createNewAlarm(dataToSave);
        }
        else if (action === 'UPDATE') {
            const { tagnameId, ...rest } = dataAlarm;
            dataToSave = { ...rest, tagnameId: dataAlarm.tagnameId };
            // console.log('check dataToSave update: ', dataToSave)
            res = await updateTagAlarm(dataToSave);
        }
        if (res && res.EC === 0) {
            toast.success(res.EM);
            socket.emit('CHANGE ALARM');
            setDataAlarm({});
            handleClose();
        } else {
            toast.error(res.EM);
        }
    };

    return (
        <Modal open={openModalAddAlarm} onClose={handleClose} onKeyDown={(e) => {

        }}>
            <Box sx={style}>
                {/* Header */}
                <Typography variant="h6" align="center" sx={{ fontWeight: 600, }}  >
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
                        handleConfirmAlarm();
                    }}
                >
                    {/* Name */}
                    <TextField
                        label="Name"
                        variant="standard"
                        value={dataAlarm.name}
                        onChange={(e) => handleOnchangeInput(e.target.value, 'name')}
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
                        disabled
                        variant="standard"
                        value={dataAlarm.deviceName}
                        onChange={(e) => handleOnchangeInput(e.target.value, 'deviceName')}
                    />

                    {/* Trigger Conditions */}
                    <TextField
                        select
                        label="Điều kiện"
                        value={dataAlarm.condition}
                        variant="standard"
                        onChange={(e) => handleOnchangeInput(e.target.value, 'condition')}
                        error={!!errors.condition}
                        helperText={errors.condition}
                    >
                        <MenuItem value=">" sx={{ fontWeight: 500, fontSize: '1.5rem' }}> &gt; </MenuItem>
                        <MenuItem value="<" sx={{ fontWeight: 500, fontSize: '1.5rem' }}> &lt; </MenuItem>
                        <MenuItem value=">=" sx={{ fontWeight: 500, fontSize: '1.5rem' }}> ≥ </MenuItem>
                        <MenuItem value="<=" sx={{ fontWeight: 500, fontSize: '1.5rem' }}> ≤ </MenuItem>
                        <MenuItem value="=" sx={{ fontWeight: 500, fontSize: '1.5rem' }}> = </MenuItem>
                    </TextField>

                    {/* Range */}
                    <TextField
                        label="Ngưỡng cảnh báo"
                        value={dataAlarm.rangeAlarm}
                        variant="standard"
                        onChange={(e) => handleOnchangeInput(e.target.value, 'rangeAlarm')}
                        error={!!errors.rangeAlarm}
                        helperText={errors.rangeAlarm}
                    />

                    {/* Alarm Content */}
                    <TextField
                        label="Nội dung cảnh báo"
                        value={dataAlarm.content}
                        variant="standard"
                        onChange={(e) => handleOnchangeInput(e.target.value, 'content')}
                        sx={{ gridColumn: 'span 2' }}
                        error={!!errors.content}
                        helperText={`${dataAlarm.content.length}/40 ký tự`}
                        inputProps={{
                            maxLength: 40,
                        }}
                    />

                    <Box
                        sx={{
                            display: "flex", alignItems: "center",
                            justifyContent: "center", gap: 5, gridColumn: "span 2", mt: 1,
                        }}
                    >

                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 500, textAlign: "center", mt: 2.5, ml: -2
                            }}
                        >
                            Cảnh báo đến:
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
                            {[
                                { label: "Line", color: "success" },
                                { label: "Telegram", color: "primary" },
                            ].map((item, idx) => (
                                <Box
                                    key={idx}
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                    }}
                                >
                                    <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 0.5 }}>
                                        {item.label}
                                    </Typography>
                                    <Checkbox
                                        color={item.color}
                                        checked={!!dataAlarm.selection?.[item.label]}
                                        onChange={() => handleCheckboxChange(item.label)}
                                    />
                                </Box>
                            ))}
                        </Box>
                    </Box>

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

export default ModalAddTagAlarm;
