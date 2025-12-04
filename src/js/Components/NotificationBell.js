import {
    useEffect, useMemo, useState, Badge, Box, Divider, IconButton, List, ListItem,
    ListItemIcon, ListItemText, Menu, Tooltip, Typography, Button, NotificationsNoneIcon,
    ErrorOutlineIcon, WarningAmberIcon
} from '../ImportComponents/Imports';

import { getAll, markAllRead, clearAll } from './notificationsBus';

export default function NotificationBell() {
    const [anchorEl, setAnchorEl] = useState(null);
    const [items, setItems] = useState(() => getAll());
    const open = Boolean(anchorEl);

    const unread = useMemo(() => items.filter((i) => !i.read).length, [items]);

    useEffect(() => {
        const onUpdate = () => setItems(getAll());
        window.addEventListener('app:notify:update', onUpdate);
        onUpdate();
        return () => window.removeEventListener('app:notify:update', onUpdate);
    }, []);

    const handleOpen = (e) => setAnchorEl(e.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const handleMarkAll = () => markAllRead();
    const handleClearAll = () => clearAll();

    return (
        <>
            <Tooltip title="Thông báo">
                <IconButton color="inherit" onClick={handleOpen} aria-label="notifications">
                    <Badge color="error" overlap="circular" badgeContent={unread > 0 ? unread : 0}>
                        <NotificationsNoneIcon />
                    </Badge>
                </IconButton>
            </Tooltip>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{ sx: { width: 380, maxWidth: '90vw' } }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        Thông báo
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {unread > 0 ? `${unread} chưa đọc` : 'Không có thông báo mới'}
                    </Typography>
                </Box>

                <Divider />

                <List dense disablePadding sx={{ maxHeight: 360, overflowY: 'auto' }}>
                    {items.length === 0 ? (
                        <ListItem>
                            <ListItemText primary="Danh sách trống" />
                        </ListItem>
                    ) : (
                        items.map((it) => {
                            const Icon = it.type === 'error' ? ErrorOutlineIcon : WarningAmberIcon;
                            const time = new Date(it.time).toLocaleString();
                            return (
                                <ListItem key={it.id} sx={{ opacity: it.read ? 0.7 : 1, py: 1 }}>
                                    <ListItemIcon sx={{ minWidth: 36, color: it.type === 'error' ? 'error.main' : 'warning.main' }}>
                                        <Icon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{it.message}</Typography>}
                                        secondary={<Typography variant="caption" color="text.secondary">{time}</Typography>}
                                    />
                                </ListItem>
                            );
                        })
                    )}
                </List>

                <Divider />

                <Box sx={{ display: 'flex', gap: 1, p: 1, justifyContent: 'flex-end' }}>
                    <Button size="small" onClick={handleMarkAll} disabled={items.length === 0}>
                        Đánh dấu đã đọc
                    </Button>
                    <Button size="small" color="error" onClick={handleClearAll} disabled={items.length === 0}>
                        Xóa tất cả
                    </Button>
                </Box>
            </Menu>
        </>
    );
}
