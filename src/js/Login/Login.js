import {
    useState, useRef, toast, Box, Grid, Paper, TextField, Button, Typography, GoogleIcon,
    Checkbox, FormControlLabel, Link, Stack, InputAdornment, IconButton, FacebookIcon,
    navigate, SettingsOutlinedIcon, BoltOutlinedIcon, ThumbUpAltOutlinedIcon,
    Visibility, VisibilityOff, AutoAwesomeOutlinedIcon, useValidator, useNavigate, useLocation
} from '../ImportComponents/Imports'

import { handleLoginWeb } from '../../Services/APIDevice'

const Login = () => {
    const defaultData = {
        username: '',
        password: ''
    }

    const { validate } = useValidator();
    const [errors, setErrors] = useState(defaultData);
    const [dataUser, setDataUser] = useState([])
    const [remember, setRemember] = useState(true);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const pwdRef = useRef(null);

    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || "/home";

    const handleInputChange = (value, name) => {
        setDataUser(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: validate(name, value) }));
    };

    const clearPassword = () => {
        setDataUser(dataUser);
        // focus lại vào ô password cho nhập lại nhanh
        setTimeout(() => pwdRef.current?.focus(), 0);
    };

    const validateAll = () => {
        const newErrors = {};
        // Chỉ validate các trường bắt buộc
        const fieldsToValidate = ["username", "password"];

        fieldsToValidate.forEach((key) => {
            const value = dataUser[key];
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

    const handleConfirm = async () => {
        if (!validateAll()) return;
        setLoading(true);
        try {
            const res = await handleLoginWeb(dataUser);
            if (res && res.DT?.access_token) {
                localStorage.setItem('accessToken', res.DT.access_token);
                localStorage.setItem('username', dataUser.username);

                toast.success("Đăng nhập thành công!");
                const redirect = localStorage.getItem("redirectAfterLogin") || '/home';
                localStorage.removeItem("redirectAfterLogin");

                navigate(redirect);
            } else {
                toast.error(res?.EM || "Login failed");
                clearPassword();
            }

        } catch (error) {
            toast.error("Có lỗi khi đăng nhập!");
            clearPassword();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Grid
            container
            sx={{
                minHeight: '100vh',
                bgcolor: (t) => t.palette.mode === 'light' ? 'rgba(2,132,199,0.03)' : 'background.default',
            }}
        >
            {/* Bên trái: điểm mạnh sản phẩm */}
            <Grid
                item
                xs={12}
                md={6}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: { xs: 3, md: 8 },
                    py: { xs: 6, md: 0 },
                }}
            >
                <Box sx={{ maxWidth: 520, width: '100%' }}>
                    <Typography
                        variant="h3"
                        fontWeight={800}
                        sx={{
                            mb: 3,
                            fontFamily: 'Montserrat'
                        }}
                    >
                        ĐỒ ÁN TỐT NGHIỆP
                    </Typography>


                    <Box sx={{ display: 'grid', gap: 3 }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <SettingsOutlinedIcon color="primary" />
                            <Box>
                                <Typography fontWeight={700}>Adaptable performance</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Our product effortlessly adjusts to your needs, boosting efficiency and simplifying your tasks.
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <BoltOutlinedIcon color="primary" />
                            <Box>
                                <Typography fontWeight={700}>Built to last</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Experience unmatched durability that goes above and beyond with lasting investment.
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <ThumbUpAltOutlinedIcon color="primary" />
                            <Box>
                                <Typography fontWeight={700}>Great user experience</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Integrate our product into your routine with an intuitive and easy-to-use interface.
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <AutoAwesomeOutlinedIcon color="primary" />
                            <Box>
                                <Typography fontWeight={700}>Innovative functionality</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Stay ahead with features that set new standards, addressing your evolving needs better than the rest.
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Grid>

            {/* Bên phải: form đăng nhập */}
            <Grid
                item
                xs={12}
                md={6}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: { xs: 'center', md: 'flex-start' },
                    pl: { md: 6 },
                    pr: { xs: 3, md: 8 },
                    py: { xs: 6, md: 0 },
                }}
            >
                <Paper elevation={8} sx={{ width: '100%', maxWidth: 460, p: { xs: 3, sm: 4 }, borderRadius: 3 }}>
                    <Typography variant="h5" fontWeight={800} sx={{ mb: 3 }}>
                        Sign in
                    </Typography>

                    <Box component="form" onSubmit={(e) => {
                        e.preventDefault();
                        handleConfirm();
                    }}>
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
                                        <IconButton onClick={() => { setShowPassword(!showPassword) }}  >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
                            <FormControlLabel
                                control={<Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)} size="small" />}
                                label="Remember me"
                            />
                            <Link component="button" type="button" onClick={() => toast.info('Chức năng quên mật khẩu (demo)')} underline="hover">
                                Forgot your password?
                            </Link>
                        </Stack>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{ mt: 2, py: 1.2, fontWeight: 700, borderRadius: 2 }}
                        >
                            {loading ? 'Signing in…' : 'Sign in'}
                        </Button>
                    </Box>

                    <Typography align="center" sx={{ my: 2, color: 'text.secondary' }}>
                        or
                    </Typography>

                    <Stack spacing={1.5}>
                        <Button variant="outlined" fullWidth startIcon={<GoogleIcon />}>
                            Sign in with Google
                        </Button>
                        <Button variant="outlined" fullWidth startIcon={<FacebookIcon />}>
                            Sign in with Facebook
                        </Button>
                    </Stack>
                </Paper>
            </Grid>
        </Grid>
    );
}

export default Login;

