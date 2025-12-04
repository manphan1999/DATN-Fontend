import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    typography: {
        fontFamily: 'Roboto, Arial, sans-serif', // font mặc định body
        h1: { fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800 },
        h2: { fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800 },
        h3: { fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 800 },
        h4: { fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 700 },
        h5: { fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 700 },
        h6: { fontFamily: 'Montserrat, Arial, sans-serif', fontWeight: 700 },
    }
});

export default theme;
