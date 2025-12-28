import {
    useState, useEffect, Popover, Button, TextField,
    Box, FormControlLabel, Android12Switch, useValidator
} from '../../ImportComponents/Imports'

const InputPopover = ({
    anchorEl,              // hiển thị popover
    onClose,               // đóng popover
    onConfirm,            // xử lý khi nhấn Confirm
    defaultValue = 0,     // giá trị mặc định hiển thị khi mở
    dataFormat,
    functionCode,
}) => {
    // console.log('check dataFormat: ', dataFormat)
    const open = Boolean(anchorEl);
    const [inputValue, setInputValue] = useState(defaultValue);
    const [errors, setErrors] = useState({});
    const { validate } = useValidator();

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (open) {
            if (!token) {
                window.location.href = '/login';
            } else {
            }
        }
    }, [open]);

    useEffect(() => {
        if (open) {
            setInputValue(defaultValue);
            setErrors({});
        }
    }, [open, defaultValue]);

    const handleInputChange = (value, name) => {
        setInputValue(value);
        let errorMessage = validate(name, value);
        const num = Number(value);

        if (isNaN(num)) {
            errorMessage = "⚠️ Giá trị phải là số!";
        } else {
            switch (dataFormat) {
                case 0:
                    if (num !== 0 && num !== 1) {
                        errorMessage = "⚠️ Nhập giá trị là 0 hoặc 1";
                    }
                    break;
                case 1:
                    if (num < -32767 || num > 32767) {
                        errorMessage = "⚠️ Giá trị phải từ -32767 đến 32767";
                    }
                    break;
                case 2:
                    if (num < 0 || num > 65535) {
                        errorMessage = "⚠️ Giá trị phải từ 0 đến 65535";
                    }
                    break;
                default:
                    break;
            }
        }

        setErrors((prev) => ({
            ...prev,
            [name]: errorMessage,
        }));
    };
    const handleConfirm = () => {
        if (functionCode !== 5 && errors.popover) return;
        const num = Number(inputValue);
        onConfirm(num);
        onClose();
    };

    return (
        <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={onClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            transformOrigin={{ vertical: "top", horizontal: "center" }}
            slotProps={{
                paper: {
                    sx: {
                        width: 250,
                        mt: 1.2,
                        p: 0,
                        overflow: "visible",
                        position: "relative",
                        "&::before": {
                            content: '""',
                            position: "absolute",
                            top: -8,
                            left: "calc(50% - 8px)",
                            width: 16,
                            height: 16,
                            bgcolor: "background.paper",
                            transform: "rotate(45deg)",
                            boxShadow: 1,
                            zIndex: 0,
                        },
                    },
                },
            }}
        >
            <Box
                component="form"
                onSubmit={(e) => {
                    e.preventDefault();
                    handleConfirm();
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                        e.preventDefault();
                        onClose();
                    }
                }}
                sx={{ p: 2, position: "relative", zIndex: 1 }}
            >
                {functionCode === 5 ? (
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center", // căn giữa ngang trong Popover
                            alignItems: "center",      // căn giữa dọc
                            mb: 2,
                        }}
                    >
                        <FormControlLabel
                            label="Trạng thái"
                            labelPlacement="start"
                            control={
                                <Android12Switch
                                    checked={Boolean(inputValue)}
                                    onChange={(e) => setInputValue(e.target.checked ? 1 : 0)}
                                />
                            }
                            sx={{
                                m: 0,                  // bỏ margin mặc định
                                gap: 2,                // khoảng cách giữa chữ và switch
                                "& .MuiFormControlLabel-label": {
                                    fontSize: 16,
                                    fontWeight: 500,
                                },
                            }}
                        />
                    </Box>
                ) : (

                    <TextField
                        fullWidth
                        autoFocus
                        label="Enter value"
                        value={inputValue}
                        onChange={(e) => handleInputChange(e.target.value, "popover")}
                        error={!!errors.popover}
                        helperText={errors.popover}
                    />


                )}

                <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
                    <Button variant="outlined" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        type="submit"
                    >
                        Confirm
                    </Button>
                </Box>
            </Box>
        </Popover>
    );
};
export default InputPopover;
