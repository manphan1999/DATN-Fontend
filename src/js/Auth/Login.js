import React, { useState, useRef } from 'react';
import {
    Box, Grid, Paper, TextField, Button, Typography,
    Checkbox, FormControlLabel, Link, Stack, InputAdornment, IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../Setup/Axios';

import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';


function createDummyToken(email, hours = 24) {
    // JWT giả: header.alg = "none", có exp để PrivateRoute kiểm tra hạn
    const header = { alg: 'none', typ: 'JWT' };
    const payload = {
        sub: email,
        name: email.split('@')[0] || 'User',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + hours * 3600,
    };
    const b64 = (obj) => btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
    return `${b64(header)}.${b64(payload)}.`; // chữ ký rỗng
}

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(true);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const pwdRef = useRef(null);

    const doSuccess = (token, userName) => {
        localStorage.setItem('access_token', token);
        localStorage.setItem('username', userName || email.split('@')[0] || 'User');
        localStorage.setItem('isAuthenticated', 'true'); // nếu nơi khác còn dùng
        if (remember) localStorage.setItem('remember_me', '1');
        else localStorage.removeItem('remember_me');
        toast.success('Đăng nhập thành công');
        navigate('/home', { replace: true });
    };

    const clearPassword = () => {
        setPassword('');
        // focus lại vào ô password cho nhập lại nhanh
        setTimeout(() => pwdRef.current?.focus(), 0);
    };

    const tryFallbackLogin = () => {
        // --- F A L L B A C K --- (XÓA/COMMENT khi backend sẵn sàng)
        if (email.toLowerCase() === 'admin' && password === 'admin') {
            const token = createDummyToken(email, 24);
            const userName = 'admin';
            doSuccess(token, userName);
            return true;
        } else {
            toast.error('Email hoặc mật khẩu không đúng ⚠️');
            clearPassword();
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim() || !password) {
            toast.error('Vui lòng nhập email và mật khẩu');
            return;
        }

        try {
            setLoading(true);

            // TODO: đổi đúng endpoint backend khi có
            // backend nên trả { EC: 0, EM: 'OK', DT: { token, user: { username, ... } } }
            const res = await axios.post('/api/v1/auth/login', { email, password });

            if (res && +res.EC === 0 && res.DT?.token) {
                const { token, user } = res.DT;
                doSuccess(token, user?.username || email.split('@')[0]);
            } else {
                // API có nhưng trả lỗi → fallback
                tryFallbackLogin();
            }
        } catch (err) {
            // API không tồn tại/404/Network error → fallback
            const ok = tryFallbackLogin();
            if (!ok) {
                // giữ toast lỗi server nếu bạn muốn hiển thị kèm
                toast.error('Lỗi Server (404)');
            }
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
                    <Typography variant="h3" fontWeight={800} sx={{ mb: 3 }}>
                        Sitemark
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

                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <TextField
                            label="Email"
                            type="email"
                            fullWidth
                            size="medium"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            sx={{ mb: 2 }}
                            autoComplete="email"
                        />

                        <TextField
                            inputRef={pwdRef}
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            fullWidth
                            size="medium"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => setShowPassword((v) => !v)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
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

