const KEY = 'app_notifications';

export const getAll = () => {
    try {
        return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch {
        return [];
    }
};

const save = (items) => {
    localStorage.setItem(KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('app:notify:update'));
};

export const pushNotify = (item) => {
    const items = getAll();
    items.unshift({
        ...item,
        read: false,
    });
    save(items.slice(0, 100)); // giới hạn 100 thông báo
};

export const markAllRead = () => {
    const items = getAll().map(i => ({ ...i, read: true }));
    save(items);
};

export const clearAll = () => {
    save([]);
};
