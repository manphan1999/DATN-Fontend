import {
    useState, useEffect, Paper, Button, Box, Typography, SaveIcon,
    MenuItem, RestartAltIcon, Loading, BorderColorIcon, CancelPresentation,
    TextField, toast, _, useValidator
} from '../ImportComponents/Imports';

import { fetchSetting, fetchHeader, updateHeader } from '../../Services/APIDevice';

const ListSetting = () => {
    const [enableConfigNetwork, setEnableConfigNetwork] = useState(false);
    const [enableConfigHeader, setEnableConfigHeader] = useState(false);
    const [dataNetwork, setDataNetwork] = useState({});
    const [originalDataNetwork, setOriginalDataNetwork] = useState({});
    const [dataHeader, setDataHeader] = useState({ content: "", id: "" });
    const [originalDataHeader, setOriginalDataHeader] = useState({ content: "", id: "" });
    const { validate } = useValidator();
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            localStorage.setItem("redirectAfterLogin", window.location.pathname);
            window.location.href = '/login';
        } else {
            fetchSetting();
            fetchContentHeader();
            console.log(dataNetwork);
        }
    }, []);

    const fetchContentHeader = async () => {
        setLoading(true);
        let response = await fetchHeader();
        if (response && response.EC === 0 && Array.isArray(response.DT?.DT)) {
            const item = response.DT.DT.find(i => i.content !== undefined);
            if (item) { setDataHeader({ content: item.content, id: item._id }); }
            if (item) { setOriginalDataHeader({ content: item.content, id: item._id }); }
        }
        setLoading(false);
    }

    const validateAllNetwork = () => {
        const newErrors = {};
        let fieldsToValidate = ["ipAddress", "subnet", "gateway", "dns"];

        fieldsToValidate.forEach((key) => {
            const value = dataNetwork[key];
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

    const handleOnchangeNetwork = (value, name) => {
        setDataNetwork(prev => ({ ...prev, [name]: value }));
    };

    const handleOnchangeHeader = (value, name) => {
        setDataHeader(prev => ({ ...prev, [name]: value }));
    };

    const handleReboot = () => {

    }

    const handleConfigNetwork = () => {
        if (!enableConfigNetwork) {
            setEnableConfigNetwork(true);
        } else {
            setEnableConfigNetwork(false);
        }
    }

    const handleConfigHeader = () => {
        if (!enableConfigHeader) {
            setEnableConfigHeader(true);
        } else {
            setEnableConfigHeader(false);
        }
    }

    const handleChangeNetwork = async () => {
        if (!validateAllNetwork()) return;

    }

    const handleChangeHeader = async () => {
        const res = await updateHeader(dataHeader);
        if (res && res.EC === 0) {
            toast.success(res.EM);
            setEnableConfigHeader(false);
            fetchContentHeader();
        }
    }

    return (
        <>
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Paper sx={{ p: 1.5, ml: 2, my: 2, width: 400, borderRadius: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Typography sx={{ fontWeight: 600, fontSize: 20, mb: 2 }}>
                            Cấu hình IP
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography sx={{ mt: 1.5, width: '100px', fontWeight: 600 }}>
                                Chế độ:
                            </Typography>
                            <TextField
                                disabled={!enableConfigNetwork}
                                select
                                label=""
                                variant="standard"
                                sx={{ ml: 1, width: '240px' }}
                                value={dataNetwork.mode ?? ""}
                                onChange={(e) => handleOnchangeNetwork(e.target.value, 'mode')}
                                SelectProps={{
                                    sx: { textAlign: 'center' }
                                }}

                            >
                                <MenuItem value="Static IP">Static IP</MenuItem>
                                <MenuItem value="DHCP">DHCP</MenuItem>
                            </TextField>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography sx={{ mt: 2.5, width: '100px', fontWeight: 600 }}>
                                Ip Address:
                            </Typography>
                            <TextField
                                disabled={!enableConfigNetwork}
                                label="Ip Address"
                                variant="standard"
                                sx={{ ml: 1, flex: 1, width: '240px' }}
                                value={dataNetwork.ipAddress ?? ""}
                                onChange={(e) => handleOnchangeNetwork(e.target.value, 'ipAddress')}
                                error={!!errors.ipAddress}
                                helperText={errors.ipAddress}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography sx={{ mt: 2.5, width: '100px', fontWeight: 600 }}>
                                Sub Net:
                            </Typography>
                            <TextField
                                disabled={!enableConfigNetwork}
                                label="Sub Net"
                                variant="standard"
                                sx={{ ml: 1, flex: 1, width: '240px' }}
                                value={dataNetwork.subnet ?? ""}
                                onChange={(e) => handleOnchangeNetwork(e.target.value, 'subnet')}
                                error={!!errors.subnet}
                                helperText={errors.subnet}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography sx={{ mt: 2.5, width: '100px', fontWeight: 600 }}>
                                Gateway:
                            </Typography>
                            <TextField
                                disabled={!enableConfigNetwork}
                                label="Gateway"
                                variant="standard"
                                sx={{ ml: 1, flex: 1, width: '240px' }}
                                value={dataNetwork.gateway ?? ""}
                                onChange={(e) => handleOnchangeNetwork(e.target.value, 'gateway')}
                                error={!!errors.gateway}
                                helperText={errors.gateway}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
                            <Typography sx={{ mt: 2.5, width: '100px', fontWeight: 600 }}>
                                DNS:
                            </Typography>
                            <TextField
                                disabled={!enableConfigNetwork}
                                label="DNS"
                                variant="standard"
                                sx={{ ml: 1, flex: 1, width: '240px' }}
                                value={dataNetwork.dns ?? ""}
                                onChange={(e) => handleOnchangeNetwork(e.target.value, 'dns')}
                                error={!!errors.dns}
                                helperText={errors.dns}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, height: '100%', }}  >
                            <Button
                                variant="contained"
                                color={(!enableConfigNetwork) ? "primary" : "error"}
                                startIcon={(!enableConfigNetwork) ? <BorderColorIcon /> : <CancelPresentation />}
                                sx={{
                                    textTransform: "none", height: 38, minWidth: 150,
                                    fontSize: 18, borderRadius: 2, mr: 2
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleConfigNetwork();
                                }}
                            >
                                {(!enableConfigNetwork) ? 'Chỉnh sửa' : 'Thoát'}
                            </Button>

                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<SaveIcon />}
                                sx={{
                                    textTransform: "none", height: 38, minWidth: 150,
                                    fontSize: 18, borderRadius: 2, mr: 2
                                }}
                                disabled={_.isEqual(dataNetwork, originalDataNetwork)}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleChangeNetwork();
                                }}
                            >
                                Cập nhật
                            </Button>
                        </Box>
                    </Box>
                </Paper >
                <Paper sx={{ p: 1.5, flex: 1, mr: 2, my: 2, width: 350, borderRadius: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Typography sx={{ fontWeight: 600, fontSize: 20, mb: 2 }}>
                            Cấu hình nội dung Header
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <TextField
                            disabled={!enableConfigHeader}
                            label="Nội dung cần hiển thị"
                            variant="standard"
                            sx={{ ml: 1, flex: 1 }}
                            value={dataHeader.content ?? ""}
                            onChange={(e) => handleOnchangeHeader(e.target.value, 'content')}
                            error={!!errors.content}
                            helperText={errors.content}
                        />
                    </Box>

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}  >
                        <Button
                            variant="contained"
                            color={(!enableConfigHeader) ? "primary" : "error"}
                            startIcon={(!enableConfigHeader) ? <BorderColorIcon /> : <CancelPresentation />}
                            sx={{
                                textTransform: "none", height: 45, minWidth: 180,
                                fontSize: 18, borderRadius: 2, mr: 2
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleConfigHeader();
                            }}
                        >
                            {(!enableConfigHeader) ? 'Chỉnh sửa' : 'Thoát'}
                        </Button>
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<SaveIcon />}
                            sx={{
                                textTransform: "none", height: 45, minWidth: 180,
                                fontSize: 18, borderRadius: 2
                            }}
                            disabled={_.isEqual(dataHeader, originalDataHeader)}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleChangeHeader();
                            }}
                        >
                            Cập nhật
                        </Button>
                    </Box>

                    {/* <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <TextField
                            disabled={!enableConfigNetwork}
                            label="Nội dung cần hiển thị"
                            variant="standard"
                            sx={{ ml: 1, flex: 1 }}
                            value={dataNetwork.content ?? ""}
                            onChange={(e) => handleOnchangeNetwork(e.target.value, 'content')}
                            error={!!errors.content}
                            helperText={errors.content}
                        />
                    </Box> */}
                </Paper>

            </Box>
            <Paper
                sx={{ p: 1.5, flex: 1, mx: 2, mb: 2, borderRadius: 3 }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography sx={{ fontWeight: 600, fontSize: 20, mb: 2 }}>
                        Cấu hình hệ thống
                    </Typography>
                </Box>

                <Box sx={{ mt: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}  >
                    <Button
                        variant="contained"
                        color="warning"
                        startIcon={<RestartAltIcon />}
                        sx={{
                            textTransform: "none", height: 50, minWidth: 180,
                            fontSize: 18, borderRadius: 2
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleReboot();
                        }}
                    >
                        Khởi động lại
                    </Button>
                </Box>
            </Paper>

        </>
    );


}

export default ListSetting;
