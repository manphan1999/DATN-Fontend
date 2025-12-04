import { styled } from '@mui/material/styles';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

export const Android12Switch = styled(Switch)(({ theme }) => ({
    width: 55,
    height: 25,
    padding: 0,
    display: "flex",
    "& .MuiSwitch-switchBase": {
        padding: 2,
        "&.Mui-checked": {
            transform: "translateX(28px)",
            color: "#fff",
            "& + .MuiSwitch-track": {
                backgroundColor: "#00C4C4",
                opacity: 1,
                border: 0,
            },
            "& .MuiSwitch-thumb:before": {
                content: '"ON"',
            },
        },
    },
    "& .MuiSwitch-thumb": {
        boxShadow: "none",
        width: 20,
        height: 20,
        borderRadius: 12,
        backgroundColor: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 10,
        fontWeight: "bold",
        "&:before": {
            content: '"OFF"',
            color: "#00C4C4",
        },
    },
    "& .MuiSwitch-track": {
        borderRadius: 32 / 2,
        backgroundColor: "#ddd",
        opacity: 1,
        transition: theme.transitions.create(["background-color"], {
            duration: 300,
        }),
    },
}));

export default function IconSwitch() {
    return (
        <FormControlLabel
            control={<Android12Switch defaultChecked />}
            label="Android 12"
        />
    );
}
