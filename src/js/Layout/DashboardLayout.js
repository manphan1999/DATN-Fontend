import {
    useState, useEffect, useContext, useTheme, useNavigate, useLocation, socket,
    AppBar, Box, Drawer, Toolbar, List, ListItemButton, ListItemText, ListItemIcon,
    Typography, IconButton, Divider, Avatar, Menu, MenuItem, Paper, ListItemIcon as MenuItemIcon,
    // Icons
    MenuIcon, MenuOpenIcon, HomeWorkIcon, DevicesIcon, HistoryIcon, LabelIcon, StorageIcon,
    DisplaySettingsIcon, Brightness4Icon, Brightness7Icon, PersonOutlineIcon, LogoutIcon, toast,
    SettingsApplicationsIcon, PeopleOutlineIcon
} from "../ImportComponents/Imports";
import Tooltip from '@mui/material/Tooltip';
import ColorModeContext from '../Theme/ColorModeContext';
import FunctionSettings from "../FunctionSetting/FunctionSettings";
import DeviceTab from "../Device/DeviceTab";
import TagName from "../TagName/TagName";
import HistoricalTab from "../Historical/HistoricalTab";
import ConfigTab from "../Configuration/ConfigTab";
import ServerTab from "../Server/ServerTab";
import User from '../UserManagement/Users'
import HomeLayout from '../HomeLayout/HomeLayout'
import ListSetting from "../Setting/Setting";
import NotificationBell from "../Components/NotificationBell";
import { fetchHeader } from "../../Services/APIDevice";

const drawerWidth = 180;
const miniWidth = 70;

const DashboardLayout = () => {
    const theme = useTheme();
    const colorMode = useContext(ColorModeContext);

    const navigate = useNavigate();
    const location = useLocation();

    // Drawer
    const [mobileOpen, setMobileOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [configOpen, setConfigOpen] = useState(false);

    // User menu
    const [userMenuEl, setUserMenuEl] = useState(null);
    const userMenuOpen = Boolean(userMenuEl);
    const username = localStorage.getItem("username") || "User";
    const currentPage = location.pathname.split("/")[1] || "home";
    const [dataHeader, setDataHeader] = useState({ content: "", id: "" });

    useEffect(() => {
        if (currentPage === "tagname" || currentPage === "funcSettings") {
            setConfigOpen(true);
        }
    }, [currentPage]);

    useEffect(() => {
        socket.on("UPDATE HEADER", () => {
            fetchContentHeader();
        });
        return () => {
            socket.off("UPDATE HEADER");
        };
    }, []);

    useEffect(() => {
        fetchContentHeader();
    }, []);

    const fetchContentHeader = async () => {
        let response = await fetchHeader();
        if (response && response.EC === 0 && Array.isArray(response.DT?.DT)) {
            const item = response.DT.DT.find(i => i.content !== undefined);
            if (item) { setDataHeader({ content: item.content, id: item._id }); }
        }
    }

    // Clock
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);
    const pad2 = (n) => (n < 10 ? `0${n}` : `${n}`);
    const timeLabel = `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;
    const dateLabel = `${pad2(now.getDate())}/${pad2(now.getMonth() + 1)}/${pad2(now.getFullYear())}`;
    const handleDrawerToggleMobile = () => setMobileOpen((v) => !v);
    const handleDrawerToggleDesktop = () => setDrawerOpen((v) => !v);
    const handleConfigToggle = () => setConfigOpen((v) => !v);

    const handlePageChange = (page) => {
        const to = page === "home" ? "/home" : `/${page}`;
        if (location.pathname !== to) navigate(to);
        if (window.innerWidth < 900) setMobileOpen(false);
    };

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("username");
        toast.info("Đã đăng xuất!");
        navigate("/");
    };

    const openUserMenu = (e) => setUserMenuEl(e.currentTarget);
    const closeUserMenu = () => setUserMenuEl(null);
    const goMyAccount = () => {
        closeUserMenu();
        navigate("/user");
    };

    const onLogoutClick = () => {
        closeUserMenu();
        handleLogout();
    };

    const mainMenuItems = [
        { id: "home", text: "Trang chủ", icon: <HomeWorkIcon />, path: "/home" },
        { id: "device", text: "Thiết bị", icon: <DevicesIcon />, path: "/device" },
        { id: "tagname", text: "Tag Name", icon: <LabelIcon />, path: "/tagname" },
        { id: "configuration", text: "Cấu hình", icon: <DisplaySettingsIcon />, path: "/configuration" },
        { id: "servers", text: "Server", icon: <StorageIcon />, path: "/servers" },
        { id: "user", text: "Tài khoản", icon: <PeopleOutlineIcon />, path: "/user" },
        { id: "setting", text: "Cài đặt", icon: <SettingsApplicationsIcon />, path: "/setting" },
        { id: "historical", text: "Lịch sử", icon: <HistoryIcon />, path: "/historical" },
    ];

    const drawerContent = (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Toolbar
                sx={{
                    px: 1.5, gap: 1, justifyContent: drawerOpen ? "space-between" : "left",
                }}
            >
                {drawerOpen && (
                    <Typography
                        variant="subtitle1"
                        noWrap
                        sx={{ color: "primary.main", fontWeight: 700, fontSize: 16, ml: 0.5, }}     >
                        Menu
                    </Typography>
                )}
                <IconButton
                    onClick={handleDrawerToggleDesktop}
                    size="small"
                    title={drawerOpen ? "Thu gọn" : "Mở rộng"}
                >
                    {drawerOpen ? <MenuOpenIcon /> : <MenuIcon />}
                </IconButton>
            </Toolbar>
            <Divider />

            <Box sx={{ overflowY: "auto", flex: 1 }}>
                {/* MAIN */}
                <Box sx={{ mt: 0 }}>
                    <List sx={{ px: 1 }}>
                        {mainMenuItems.map((item) => {
                            const button = (

                                <Tooltip
                                    key={item.id}
                                    title={item.text}
                                    placement="right"
                                    arrow
                                >
                                    <ListItemButton
                                        selected={currentPage === item.id}
                                        onClick={() => handlePageChange(item.id)}
                                        sx={{
                                            borderRadius: 1.5,
                                            mt: 1,
                                            "&.Mui-selected": {
                                                backgroundColor: "rgba(33,150,243,0.08)",
                                                borderLeft: "3px solid",
                                                borderColor: "primary.main",
                                                "&:hover": { backgroundColor: "rgba(33,150,243,0.12)" },
                                            },
                                        }}
                                    >
                                        <ListItemIcon
                                            sx={{
                                                minWidth: 40,
                                                color: currentPage === item.id ? "primary.main" : "text.secondary",
                                            }}
                                        >
                                            {item.icon}
                                        </ListItemIcon>
                                        {drawerOpen && (
                                            <ListItemText
                                                primary={item.text}
                                                primaryTypographyProps={{
                                                    fontSize: 14,
                                                    fontWeight: currentPage === item.id ? 600 : 400,
                                                }}
                                            />
                                        )}
                                    </ListItemButton>
                                </Tooltip>

                            );
                            return button;
                        })}
                    </List>
                </Box>

            </Box>
        </Box>
    );

    const renderContent = () => {
        switch (currentPage) {
            case "home":
                return <HomeLayout />;
            case "device":
                return <DeviceTab />
            case "tagname":
                return <TagName />;
            case "funcSettings":
                return <FunctionSettings />;
            case "servers":
                return <ServerTab />;
            case "configuration":
                return <ConfigTab />;
            case "historical":
                return <HistoricalTab />;
            case "user":
                return <User />;
            case 'setting':
                return <ListSetting />
            default:
                return <HomeLayout />;
        }
    };

    /* ---------- NỀN CHUNG CHO MỌI TRANG ---------- */
    const isLight = theme.palette.mode === "light";
    const baseGradient = isLight
        ? "linear-gradient(180deg, #d2dff1e5 0%, #e9efd4ff 100%)"
        : "linear-gradient(180deg, #0b1220 0%, #0e172a 100%)";

    const dotColorA = isLight ? "rgba(2,6,23,0.04)" : "rgba(255,255,255,0.04)";
    const dotColorB = isLight ? "rgba(2,6,23,0.03)" : "rgba(255,255,255,0.03)";
    const bgImage = `
    radial-gradient(${dotColorA} 1px, transparent 1px),
    radial-gradient(${dotColorB} 1px, transparent 1px),
    ${baseGradient}
  `;

    return (
        <>
            <Box sx={{ display: "flex", height: "100%", maxHeight: "100%" }}>
                {/* APP BAR */}
                <AppBar
                    position="fixed"
                    sx={{
                        width: {
                            sm: `calc(100% - ${drawerOpen ? drawerWidth : miniWidth
                                }px)`,
                        },
                        ml: { sm: `${drawerOpen ? drawerWidth : miniWidth}px` },
                        bgcolor: "background.paper",
                        color: "text.primary",
                        //boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                        borderBottom: 1,
                        borderColor: "divider",
                        transition: theme.transitions.create(["width", "margin-left"], {
                            duration: 250,
                            easing: theme.transitions.easing.easeInOut,
                        }),
                    }}
                >
                    <Toolbar sx={{ display: "flex", alignItems: "center" }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 700,
                                    color: "primary.main",
                                    fontSize: { xs: 14, sm: 18 },
                                    ml: 1,
                                    whiteSpace: "nowrap"
                                }}
                            >
                                {dataHeader.content ?? ""}
                            </Typography>
                        </Box>
                        <Box sx={{ flexGrow: 1 }} />
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mr: 1.5 }}>

                            <Box
                                component="img"
                                src="/LogoHCMUTE.png"
                                alt="Logo Right"
                                sx={{ width: 100, height: 50, objectFit: "contain" }}
                            />

                            <Box
                                component="img"
                                src="/LogoUTE.jpg"
                                alt="Logo Right"
                                sx={{ width: 100, height: 50, objectFit: "contain" }}
                            />

                            {/* Time/Date */}
                            <Box sx={{
                                display: { xs: "none", sm: "flex" }, flexDirection: "column",
                                alignItems: "center", justifyContent: "center", textAlign: "center",
                            }}>
                                <Typography sx={{ fontFamily: "Roboto Mono", fontWeight: 600 }}>
                                    {timeLabel}
                                </Typography>
                                <Typography sx={{ fontFamily: "Roboto Mono", fontWeight: 600 }}>
                                    {dateLabel}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Notifications bell */}
                        <NotificationBell />

                        {/* Toggle theme */}
                        <IconButton
                            onClick={colorMode.toggleColorMode}
                            color="inherit"
                            title={
                                theme.palette.mode === "dark" ? "Chuyển sáng" : "Chuyển tối"
                            }
                            sx={{ ml: 0.5 }}
                        >
                            {theme.palette.mode === "dark" ? (
                                <Brightness7Icon />
                            ) : (
                                <Brightness4Icon />
                            )}
                        </IconButton>

                        {/* User menu */}
                        <Tooltip title="Tài khoản">
                            <IconButton
                                onClick={openUserMenu}
                                size="small"
                                sx={{ ml: 0.5 }}
                                aria-controls={userMenuOpen ? "user-menu" : undefined}
                                aria-haspopup="true"
                                aria-expanded={userMenuOpen ? "true" : undefined}
                            >
                                <Avatar sx={{ width: 36, height: 36 }}>
                                    {String(username).charAt(0).toUpperCase()}
                                </Avatar>
                            </IconButton>
                        </Tooltip>

                        <Menu
                            anchorEl={userMenuEl}
                            id="user-menu"
                            open={userMenuOpen}
                            onClose={closeUserMenu}
                            transformOrigin={{ horizontal: "right", vertical: "top" }}
                            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                            PaperProps={{ elevation: 4, sx: { mt: 1, minWidth: 220 } }}
                        >
                            <Divider sx={{ my: 0.5 }} />
                            {/* Chỉ hiển thị nếu đã đăng nhập */}
                            {localStorage.getItem("accessToken") ? (
                                <>
                                    <MenuItem onClick={goMyAccount}>
                                        <MenuItemIcon><PersonOutlineIcon fontSize="small" /></MenuItemIcon>
                                        Quản lý tài khoản
                                    </MenuItem>

                                    {/* <MenuItem onClick={goResetPassword}>
                                    <MenuItemIcon><ShieldOutlinedIcon fontSize="small" /></MenuItemIcon>
                                    Reset Password
                                </MenuItem> */}

                                    <Divider sx={{ my: 0.5 }} />

                                    <MenuItem onClick={onLogoutClick}>
                                        <MenuItemIcon><LogoutIcon fontSize="small" /></MenuItemIcon>
                                        Đăng xuất
                                    </MenuItem>
                                </>
                            ) : (
                                <MenuItem onClick={() => navigate("/login")}>
                                    <MenuItemIcon><LogoutIcon fontSize="small" /></MenuItemIcon>
                                    Đăng nhập
                                </MenuItem>
                            )}
                        </Menu>
                    </Toolbar>
                </AppBar>

                {/* NAV: Drawer */}
                <Box
                    component="nav"
                    sx={{
                        width: { sm: drawerOpen ? drawerWidth : miniWidth },
                        flexShrink: { sm: 0 },
                        height: "100%",
                    }}
                >
                    {/* Mobile Drawer */}
                    <Drawer
                        variant="temporary"
                        open={mobileOpen}
                        onClose={handleDrawerToggleMobile}
                        ModalProps={{ keepMounted: true }}
                        sx={{
                            display: { xs: "block", sm: "none" },
                            "& .MuiDrawer-paper": {
                                boxSizing: "border-box",
                                width: drawerWidth,
                            },
                        }}
                    >
                        {drawerContent}
                    </Drawer>

                    {/* Desktop Drawer */}
                    <Drawer
                        variant="permanent"
                        open
                        sx={{
                            display: { xs: "none", sm: "block" },
                            "& .MuiDrawer-paper": {
                                boxSizing: "border-box",
                                overflowX: "hidden",
                                width: drawerOpen ? drawerWidth : miniWidth,
                                transition: theme.transitions.create("width", {
                                    easing: theme.transitions.easing.easeInOut,
                                    duration: 250,
                                }),
                                borderRight: 1,
                                borderColor: "divider",
                            },
                        }}
                    >
                        <Paper elevation={0} square sx={{ height: "100%" }}>
                            {drawerContent}
                        </Paper>
                    </Drawer>
                </Box>

                {/* MAIN – nền chung + vùng nội dung scroll trong khung */}
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        width: {
                            sm: `calc(100% - ${drawerOpen ? drawerWidth : miniWidth
                                }px)`,
                        },
                        height: "100%",
                        minHeight: '100vh',
                        display: "flex",
                        flexDirection: "column",
                        transition: theme.transitions.create(["width"], {
                            duration: 250,
                            easing: theme.transitions.easing.easeInOut,
                        }),

                        // Background cho toàn bộ trang con
                        backgroundImage: bgImage,
                        backgroundSize: "20px 20px, 40px 40px, 100% 100%",
                        backgroundPosition: "0 0, 10px 10px, 0 0",
                    }}
                >
                    {/* chừa khoảng cho AppBar cố định */}
                    <Toolbar />

                    {/* vùng nội dung thực sự: chiếm phần còn lại & scroll nếu dài */}
                    <Box sx={{ p: 0 }} >
                        {renderContent()}
                    </Box>
                </Box>
            </Box>
        </>
    );

}

export default DashboardLayout;