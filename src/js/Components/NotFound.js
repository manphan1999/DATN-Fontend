// src/js/Components/NotFound.js
import { useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                padding: 3
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    padding: 6,
                    maxWidth: 600,
                    width: '100%',
                    textAlign: 'center',
                    borderRadius: 3
                }}
            >
                <ErrorOutlineIcon
                    sx={{
                        fontSize: 120,
                        color: 'error.main',
                        mb: 2
                    }}
                />

                <Typography
                    variant="h1"
                    sx={{
                        fontSize: { xs: 60, md: 80 },
                        fontWeight: 700,
                        color: 'primary.main',
                        mb: 2
                    }}
                >
                    404
                </Typography>

                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                        mb: 2
                    }}
                >
                    Không tìm thấy trang
                </Typography>

                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 4 }}
                >
                    Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button
                        variant="contained"
                        startIcon={<HomeIcon />}
                        onClick={() => navigate('/')}
                        sx={{
                            textTransform: 'none',
                            px: 4,
                            py: 1.5,
                            borderRadius: 2
                        }}
                    >
                        Về trang chủ
                    </Button>

                    <Button
                        variant="outlined"
                        onClick={() => navigate(-1)}
                        sx={{
                            textTransform: 'none',
                            px: 4,
                            py: 1.5,
                            borderRadius: 2
                        }}
                    >
                        Quay lại
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
};

export default NotFound;