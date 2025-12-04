import AppRoutes from './js/routes/AppRoutes';
import {
  ToastContainer, Bounce, useState, useMemo, useEffect,
  ThemeProvider, createTheme, CssBaseline, socket
} from '../src/js/ImportComponents/Imports';
import { BrowserRouter as Router } from "react-router-dom";
import ColorModeContext from "./js/Theme/ColorModeContext";

function App() {

  useEffect(() => {

  })

  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect()
    };
  }, []);

  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem("mui-mode");
    return saved === "dark" || saved === "light" ? saved : "light";
  });

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prev) => {
          const next = prev === "light" ? "dark" : "light";
          localStorage.setItem("mui-mode", next);
          return next;
        });
      },
    }),
    []
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: { mode },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: { transition: "background-color .2s ease" },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <AppRoutes />
            {/* <div className='app-container'>
            
            </div> */}
          </Router>
        </ThemeProvider>
      </ColorModeContext.Provider>
      <ToastContainer
        position="top-right"
        autoClose={1500}
        hideProgressBar
        newestOnTop
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Bounce}
      />


    </>
  );
}

export default App;
