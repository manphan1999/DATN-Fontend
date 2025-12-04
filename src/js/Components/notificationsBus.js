// Lightweight notifications bus with localStorage persistence
// Usage anywhere (không cần React):
//  window.dispatchEvent(new CustomEvent('app:error', { detail: 'Thông điệp lỗi' }));
//  window.dispatchEvent(new CustomEvent('app:warn',  { detail: 'Cảnh báo...' }));

const STORAGE_KEY = 'app.notifications';

function load() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        return Array.isArray(arr) ? arr : [];
    } catch {
        return [];
    }
}

function save(list) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch { }
}

function uid() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function nowISO() {
    return new Date().toISOString();
}

function add(type, message) {
    const list = load();
    list.unshift({
        id: uid(),
        type, // 'error' | 'warning'
        message: String(message || ''),
        time: nowISO(),
        read: false,
    });
    // chỉ giữ tối đa 100
    if (list.length > 100) list.length = 100;
    save(list);
    window.dispatchEvent(new CustomEvent('app:notify:update'));
}

export function emitError(msg) {
    add('error', msg);
}

export function emitWarning(msg) {
    add('warning', msg);
}

// Helpers for React component
export function getAll() {
    return load();
}

export function markAllRead() {
    const list = load().map((n) => ({ ...n, read: true }));
    save(list);
    window.dispatchEvent(new CustomEvent('app:notify:update'));
}

export function clearAll() {
    save([]);
    window.dispatchEvent(new CustomEvent('app:notify:update'));
}

// Global listeners for simple integration:
// Từ bất kỳ nơi nào: window.dispatchEvent(new CustomEvent('app:error', { detail: '...' }))
// hoặc:             window.dispatchEvent(new CustomEvent('app:warn',  { detail: '...' }))
window.addEventListener('app:error', (e) => emitError(e?.detail));
window.addEventListener('app:warn', (e) => emitWarning(e?.detail));

// (Không bắt buộc) bắt các lỗi chưa bắt để tiện theo dõi
window.addEventListener('unhandledrejection', (e) => emitError(e?.reason?.message || 'Unhandled promise rejection'));
window.addEventListener('error', (e) => {
    // hạn chế spam: chỉ log message ngắn
    const msg = e?.message || 'Uncaught error';
    emitError(msg.length > 200 ? `${msg.slice(0, 200)}…` : msg);
});
