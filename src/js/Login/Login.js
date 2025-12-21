import {
    useState, useRef, toast, Box, Grid, Paper, TextField, Button, Typography, SupervisorAccountIcon,
    Checkbox, FormControlLabel, Link, Stack, InputAdornment, IconButton, LockIcon,
    SensorsOutlinedIcon, DashboardOutlinedIcon, CloudUploadOutlinedIcon, NotificationsActiveOutlinedIcon,
    Visibility, VisibilityOff, FactoryOutlinedIcon, useValidator, useNavigate, useLocation
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
                    {/* Title */}
                    <Typography
                        variant="h3"
                        fontWeight={800}
                        sx={{
                            mb: 1,
                            fontFamily: 'Montserrat'
                        }}
                    >
                        ĐỒ ÁN TỐT NGHIỆP
                    </Typography>

                    <Typography
                        variant="h5"
                        fontWeight={700}
                        color="primary"
                        sx={{ mb: 3 }}
                    >
                        Thiết bị thu thập dữ liệu Datalogger
                    </Typography>

                    {/* Introduction */}
                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mb: 4 }}
                    >
                        Datalogger là giải pháp giám sát và điều khiển thiết bị công nghiệp từ xa
                        thông qua Internet. Hệ thống cho phép thu thập, lưu trữ và truyền dữ liệu
                        thời gian thực, giúp quản lý và vận hành hệ thống hiệu quả.
                    </Typography>

                    {/* Features */}
                    <Box sx={{ display: 'grid', gap: 3 }}>
                        {/* Feature 1 */}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <SensorsOutlinedIcon color="primary" />
                            <Box>
                                <Typography fontWeight={700}>
                                    Thu thập & Kết nối thiết bị
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Kết nối PLC, cảm biến, biến tần thông qua các giao thức
                                    Modbus RTU, Modbus TCP và MQTT.
                                </Typography>
                            </Box>
                        </Box>

                        {/* Feature 2 */}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <DashboardOutlinedIcon color="primary" />
                            <Box>
                                <Typography fontWeight={700}>
                                    Giám sát & Điều khiển từ xa
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Hiển thị dữ liệu trực tuyến qua giao diện web và cho phép
                                    điều khiển thiết bị mọi lúc, mọi nơi.
                                </Typography>
                            </Box>
                        </Box>

                        {/* Feature 3 */}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <CloudUploadOutlinedIcon color="primary" />
                            <Box>
                                <Typography fontWeight={700}>
                                    Lưu trữ & Truyền dữ liệu
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Lưu dữ liệu trên server, hỗ trợ truyền dữ liệu về
                                    FTP, MySQL, SQL và MQTT.
                                </Typography>
                            </Box>
                        </Box>

                        {/* Feature 4 */}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <NotificationsActiveOutlinedIcon color="primary" />
                            <Box>
                                <Typography fontWeight={700}>
                                    Cảnh báo & Thông báo
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Gửi cảnh báo khi có sự cố thông qua Telegram, Line
                                    theo cấu hình người dùng.
                                </Typography>
                            </Box>
                        </Box>

                        {/* Feature 5 */}
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <FactoryOutlinedIcon color="primary" />
                            <Box>
                                <Typography fontWeight={700}>
                                    Ứng dụng thực tế
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Ứng dụng trong nhà máy sản xuất, trạm năng lượng,
                                    hệ thống HVAC và nông nghiệp thông minh.
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
                    justifyContent: 'center',
                    px: { xs: 3, md: 8 },
                    py: { xs: 6, md: 0 },
                }}
            >
                <Paper
                    elevation={6}
                    sx={{
                        width: '100%',
                        maxWidth: 420,
                        p: { xs: 3.5, sm: 4 },
                        borderRadius: 4
                    }}
                >
                    {/* Header */}
                    <Typography variant="h5" fontWeight={800} textAlign="center" sx={{ mb: 2 }}>
                        Đăng Nhập Hệ Thống
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        textAlign="center"
                        sx={{ mt: 0.5, mb: 3 }}
                    >
                        Vui lòng đăng nhập để tiếp tục
                    </Typography>

                    {/* Form */}
                    <Box
                        component="form"
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleConfirm();
                        }}
                        sx={{ display: 'grid', gap: 2.5 }}
                    >
                        {/* Username */}
                        <TextField
                            label="Tên người dùng"
                            fullWidth
                            value={dataUser.username}
                            onChange={(e) => handleInputChange(e.target.value, 'username')}
                            error={!!errors.username}
                            helperText={errors.username}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SupervisorAccountIcon />
                                    </InputAdornment>
                                )
                            }}
                        />

                        {/* Password */}
                        <TextField
                            type={showPassword ? 'text' : 'password'}
                            label="Mật khẩu"
                            fullWidth
                            inputRef={pwdRef}
                            value={dataUser.password || ''}
                            onChange={(e) => handleInputChange(e.target.value, 'password')}
                            error={!!errors.password}
                            helperText={errors.password}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockIcon />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            size="small"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />

                        {/* Remember + Forgot */}
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={remember}
                                        onChange={(e) => setRemember(e.target.checked)}
                                        size="small"
                                    />
                                }
                                label="Ghi nhớ đăng nhập"
                            />
                            <Link
                                component="button"
                                type="button"
                                underline="hover"
                                onClick={() => toast.info('Chức năng chưa được phát triển')}
                            >
                                Quên mật khẩu?
                            </Link>
                        </Stack>

                        {/* Submit */}
                        <Button
                            type="submit"
                            fullWidth
                            size="large"
                            variant="contained"
                            disabled={loading}
                            sx={{
                                mt: 1,
                                py: 1.4,
                                fontWeight: 700,
                                borderRadius: 3,
                                textTransform: 'none'
                            }}
                        >
                            {loading ? 'Đang đăng nhập…' : 'Đăng nhập'}
                        </Button>
                    </Box>

                    {/* Footer */}
                    <Typography
                        align="center"
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 3 }}
                    >
                        © 2025 – Đồ án tốt nghiệp | Datalogger IoT
                    </Typography>
                </Paper>
            </Grid>

        </Grid>
    );
}

export default Login;

