import { toast } from '../../ImportComponents/Imports';

export const exportToCSV = (headers, data, filename = 'export_data') => {
    if (!data || data.length === 0) {
        toast.error('Không có dữ liệu để xuất!');
        return false;
    }

    if (!headers || headers.length === 0) {
        toast.error('Thiếu thông tin headers!');
        return false;
    }

    const csvContent = "\uFEFF" + [headers, ...data]
        .map(row =>
            row.map(field => {
                const stringField = String(field !== null && field !== undefined ? field : '');
                if (stringField.includes(',') || stringField.includes('\n') || stringField.includes('"')) {
                    return `"${stringField.replace(/"/g, '""')}"`;
                }
                return stringField;
            }).join(',')
        )
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
};

export default exportToCSV;