import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { RentalProvider } from './contexts/RentalContext';
import App from './components/App';
import './styles.css';

const theme = createTheme({
  palette: { primary: { main: '#254b3f' }, secondary: { main: '#dbe9a5' }, background: { default: '#faf9f6' } },
  typography: { fontFamily: 'Inter, "Segoe UI", Arial, sans-serif', button: { textTransform: 'none', fontWeight: 700 } },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: { defaultProps: { disableElevation: true }, styleOverrides: { root: { borderRadius: 10, padding: '10px 18px' } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 20 } } },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><ThemeProvider theme={theme}><CssBaseline /><RentalProvider><App /></RentalProvider></ThemeProvider></React.StrictMode>
);
