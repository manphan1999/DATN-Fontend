import {
    Button, Dialog, DialogTitle, DialogContent,
    DialogActions, Typography, IconButton, CancelIcon, _,
} from '../../../ImportComponents/Imports';

const ModalDelete = (props) => {
    const { action, isShowModalDelete, handleCloseModalDelete, conformDeleteDevice, conformDeleteChannel,
        conformDeleteHistorical, conformDeleteAlarm, conformDeleteFTPServer, confirmDeleteMySQL,
        confirmDeleteSQL, conformDeletePublish, conformDeleteRTUServer, conformDeleteTCPServer,
        conformDeleteUser, conformDeleteConfig, selectedCount } = props
    const handleDelete = () => {
        switch (action) {
            case 'CHANNEL':
                return conformDeleteChannel();
            case 'DEVICE':
                return conformDeleteDevice();
            case 'HISTORICAL':
                return conformDeleteHistorical();
            case 'ALARM':
                return conformDeleteAlarm();
            case 'FTPSERVER':
                return conformDeleteFTPServer();
            case 'MYSQL':
                return confirmDeleteMySQL();
            case 'SQL':
                return confirmDeleteSQL();
            case 'MQTT':
                return conformDeletePublish();
            case 'CONFIG MQTT':
                return conformDeleteConfig();
            case 'RTUSERVER':
                return conformDeleteRTUServer();
            case 'TCPSERVER':
                return conformDeleteTCPServer();
            case 'USER':
                return conformDeleteUser();
            default:

                return null;
        }
    };
    return (
        <Dialog
            open={isShowModalDelete} onClose={handleCloseModalDelete}
            // onClose={onClose}
            PaperProps={{
                sx: {
                    width: 400,              // chỉnh chiều rộng
                    bgcolor: "#f9f9f9",      // đổi màu background
                    borderRadius: 2,         // bo góc
                    p: 1,                    // padding
                },
            }}
        >
            {/* Tiêu đề */}
            <DialogTitle sx={{ fontWeight: 600, textAlign: "center", position: "relative", top: "-15px", fontSize: 22, }}>
                Xác nhận xoá ?
            </DialogTitle>
            {/* Nút đóng */}
            <IconButton
                onClick={handleCloseModalDelete}
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
            <DialogContent sx={{ fontWeight: 600, textAlign: "center", position: "relative", top: "-15px", fontSize: 20, }}>
                <Typography> Số hàng đã chọn : {selectedCount}</Typography>
            </DialogContent>

            {/* Footer */}
            <DialogActions sx={{ justifyContent: "center", gap: 5 }}>
                <Button
                    onClick={handleCloseModalDelete}
                    variant="contained"
                    sx={{
                        width: '110px',
                        bgcolor: '#ef4444',
                        "&:hover": { bgcolor: '#dc2626' },
                        textTransform: "none", height: 45, minWidth: 150,
                        fontSize: 20, borderRadius: 2,
                    }}
                >
                    Hủy
                </Button>

                <Button
                    onClick={handleDelete}
                    variant="contained"
                    sx={{
                        width: '110px',
                        bgcolor: '#1657beff',
                        "&:hover": { bgcolor: '#2563eb' },
                        textTransform: "none", height: 45, minWidth: 150,
                        fontSize: 20, borderRadius: 2,
                    }}
                >
                    Xác nhận
                </Button>

            </DialogActions>
        </Dialog>
    );
}

export default ModalDelete;
