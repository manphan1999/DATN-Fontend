
import {
    useState, useEffect, Button, IconButton, TextField, Box, InputAdornment, Modal, Typography, toast,
    CancelIcon, AddBoxIcon, SaveIcon, VisibilityOff, Visibility, useValidator, socket, CancelPresentation
} from '../../../ImportComponents/Imports';

import { createUser, updateUser } from '../../../../Services/APIDevice';

const ModalUser = (props) => {
    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 500,
        bgcolor: '#fff',
        borderRadius: 2,
        boxShadow: 24,
        p: 3,
        maxHeight: '90vh',
        overflowY: 'auto',
    };
    const { action, openModalAddUser,
        handleCloseModalAddUser, dataModalUser, } = props;

    const defaultData = {
        username: '',
        password: '',
    };

    const { validate } = useValidator();
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [dataUser, setDataUser] = useState(defaultData);

    useEffect(() => {
        if (openModalAddUser === false) return;

        if (action === "UPDATE" && dataModalUser) {
            setDataUser({ ...dataModalUser });
        } else {
            setDataUser(defaultData);
        }

        setErrors({});
    }, [openModalAddUser, dataModalUser, action]);


    const validateAll = () => {
        const newErrors = {};
        Object.entries(dataUser).forEach(([k, v]) => {
            newErrors[k] = validate(k, v);
        });

        setErrors(newErrors);
        return Object.values(newErrors).every(e => e === "");
    };

    const handleInputChange = (value, name) => {
        setDataUser(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: validate(name, value) }));
    };

    const handleConfirm = async () => {
        if (!validateAll()) return;
        let res
        if (action === 'CREATE') { res = await createUser(dataUser); }
        else if (action === 'UPDATE') { res = await updateUser(dataUser); }
        if (res && res.EC === 0) {
            toast.success(res.EM);
            handleCloseModalAddUser();
        }
        else { toast.error(res.EM); }
    };

    return (
        <Modal open={openModalAddUser} onClose={handleCloseModalAddUser}>
            <Box sx={style}>

                {/* Header */}
                <Typography variant="h6" align="center" sx={{ fontWeight: 600 }}>
                    {action === 'CREATE' ? 'Thêm mới' : 'Chỉnh sửa'}
                </Typography>

                <IconButton
                    onClick={handleCloseModalAddUser}
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
                        handleConfirm();
                    }}
                >
                    <TextField
                        label="User Name"
                        variant="standard"
                        fullWidth
                        sx={{ gridColumn: 'span 2' }}
                        value={dataUser.username}
                        onChange={(e) => handleInputChange(e.target.value, 'username')}
                        error={!!errors.username}
                        helperText={errors.username}
                    />

                    <TextField
                        type={showPassword ? 'text' : 'password'}
                        label="Password"
                        variant="standard"
                        fullWidth
                        sx={{ gridColumn: 'span 2' }}
                        value={dataUser.password || ''}
                        onChange={(e) => handleInputChange(e.target.value, 'password')}
                        error={!!errors.password}
                        helperText={errors.password}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => { action === 'CREATE' && setShowPassword(!showPassword) }}
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />

                    <Box sx={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', mt: 1.5 }}>

                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<CancelPresentation />}
                            sx={{ textTransform: 'none' }}
                            onClick={handleCloseModalAddUser}
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
        </Modal>
    );
};

export default ModalUser;