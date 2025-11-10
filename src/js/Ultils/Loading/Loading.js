import { Box, CircularProgress } from "../../ImportComponents/Imports";

const Loading = ({ show = false, text = "", blur = true }) => {
    if (!show) return null;

    return (
        <Box
            sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                //bgcolor: blur ? "rgba(255,255,255,0.7)" : "transparent",
                zIndex: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                //backdropFilter: blur ? "blur(2px)" : "none",
            }}
        >
            <CircularProgress size={60} color="success" />
            {text && (
                <Box sx={{ mt: 2, fontSize: 18, fontWeight: 500, textAlign: "center" }}>
                    {text}
                </Box>
            )}
        </Box>
    );
};

export default Loading;
