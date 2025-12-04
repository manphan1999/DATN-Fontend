import { DataGrid, useMemo } from './Imports';

const CustomDataGrid = ({ sx = {}, ...props }) => {
    const mergedSx = useMemo(() => ({
        // Styles mặc định cho tất cả DataGrid
        '& .MuiTablePagination-root': {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'flex-end',
            flexWrap: 'nowrap',
            gap: '8px',
        },
        '& .MuiTablePagination-toolbar': {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'nowrap',
            minHeight: '52px',
            padding: '0 16px',
            gap: '8px',
        },
        '& .MuiTablePagination-spacer': {
            flex: 'none',
        },
        '& .MuiTablePagination-selectLabel': {
            margin: 0,
            whiteSpace: 'nowrap',
        },
        '& .MuiTablePagination-displayedRows': {
            margin: 0,
            whiteSpace: 'nowrap',
        },
        '& .MuiTablePagination-actions': {
            margin: 0,
            flexShrink: 0,
        },
        '& .MuiInputBase-root': {
            margin: '0 8px',
        },
        '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#908d96ff',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '15px',
        },
        '& .MuiDataGrid-columnHeader': {
            backgroundColor: '#968d8d',
            color: '#fff',
            fontWeight: 'bold',
        },
        '& .MuiDataGrid-columnHeaderTitle': {
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '15px',
        },
        '& .MuiDataGrid-cell:focus': {
            outline: 'none',
        },
        '& .MuiDataGrid-columnHeader:focus': {
            outline: 'none',
        },
        '& .MuiDataGrid-columnSeparator': {
            display: 'none',
        },
        // Merge với styles custom từ props
        ...sx,
    }), [sx]);

    const defaultLocaleText = {
        noRowsLabel: 'Không có dữ liệu',
        footerRowSelected: (count) =>
            `${count} ${count === 1 ? 'hàng' : 'hàng'} được chọn`,
    };

    const defaultSlotProps = {
        pagination: {
            labelRowsPerPage: 'Số hàng mỗi trang:',
            labelDisplayedRows: ({ from, to, count }) =>
                `${from} – ${to} trong tổng ${count !== -1 ? count : `hơn ${to}`}`,
        }
    };

    return (
        <DataGrid
            sx={mergedSx}
            localeText={{ ...defaultLocaleText, ...props.localeText }}
            slotProps={{ ...defaultSlotProps, ...props.slotProps }}
            disableRowSelectionOnClick
            {...props}
        />
    );
};

export default CustomDataGrid;