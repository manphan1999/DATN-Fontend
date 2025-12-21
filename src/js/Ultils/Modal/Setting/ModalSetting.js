import {
    Button, Dialog, DialogTitle, DialogContent, useEffect,
    DialogActions, Typography, IconButton, CancelIcon, _,
} from '../../../ImportComponents/Imports';

const ModalSetting = (props) => {
    const { action, isShowModalSetting, handleCloseModalSetting, handleChangeNetwork, handleChangeHeader, handleReboot, } = props
    const actionText = {
        REBOOT: 'Khởi động lại thiết bị',
        NETWORK: 'Thay đổi địa chỉ IP',
        HEADER: 'Thay đổi tiêu đề hệ thống',
    };

    const handleSetting = () => {
        switch (action) {
            case 'REBOOT':
                return handleReboot();
            case 'NETWORK':
                return handleChangeNetwork();
            case 'HEADER':
                return handleChangeHeader();
            default:
                return null;
        }
    };

    return (
        <Dialog
            open={isShowModalSetting} onClose={handleCloseModalSetting}
            // onClose={onClose}
            PaperProps={{
                sx: {
                    width: 400,              // chỉnh chiều rộng
                    bgcolor: "#f9f9f9",      // đổi màu background
                    borderRadius: 2,         // bo góc
                    p: 2,                    // padding
                },
            }}
        >
            {/* Tiêu đề */}
            <DialogTitle sx={{ fontWeight: 600, textAlign: "center", position: "relative", top: "-15px" }}>
                Xác nhận thay đổi ?
            </DialogTitle>
            {/* Nút đóng */}
            <IconButton
                onClick={handleCloseModalSetting}
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
            {/* Nội dung */}
            <DialogContent sx={{ fontWeight: 600, textAlign: "center", position: "relative", top: "-15px" }}>
                {actionText[action] || ''}
            </DialogContent>

            {/* Footer */}
            <DialogActions sx={{ justifyContent: "center", gap: 5 }}>
                <Button
                    onClick={handleCloseModalSetting}
                    variant="contained"
                    sx={{
                        width: '110px',
                        bgcolor: '#ef4444',
                        "&:hover": { bgcolor: '#dc2626' },
                    }}
                >
                    Hủy
                </Button>

                <Button
                    onClick={handleSetting}
                    variant="contained"
                    sx={{
                        width: '110px',
                        bgcolor: '#1657beff',
                        "&:hover": { bgcolor: '#2563eb' },
                    }}
                >
                    Xác nhận
                </Button>

            </DialogActions>
        </Dialog>
    );
}

export default ModalSetting;
