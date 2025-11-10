import AppRoutes from './js/routes/AppRoutes';
import { useEffect } from 'react';
import { ToastContainer, Bounce } from '../src/js/ImportComponents/Imports';
import { BrowserRouter as Router } from "react-router-dom";
import { socket } from '../src/js/Ultils/Socket/Socket';

function App() {
  useEffect(() => {

  })

  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect()
    };
  }, []);
  return (
    <>
      <Router>
        <div className='app-container'>
          <AppRoutes />
        </div>

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

      </Router>
    </>
  );
}

export default App;
