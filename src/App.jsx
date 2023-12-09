import store from './store/store';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from 'react-redux';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import Home from './components/Home'
import LoginSignupModal from './components/modals/LoginSignupModal'
// import UploadBasic from './components/removeLater/UploadBasic'
// import About from './components/removeLater/About'
// import FileDetail from './components/details/FileDetail'

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/App.css'

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Provider store={store}>
        <Router>
          <Navbar bg="dark" variant="dark" className="navbar-top">
            <Container>
              <Navbar.Brand>KKot NJ Project</Navbar.Brand>
              <div style={{ position: 'absolute', top: 5, right: '8px', zIndex: 2000, widt: '250px' }}>
                <LoginSignupModal/>
              </div>
            </Container>
          </Navbar>

          <Routes>
            <Route path="/" element={<Home />} />
            {/* <Route path="/upload" element={<UploadBasic/>} />
            <Route path="/about" element={<About/>} />
            <Route path="/detail" element={<FileDetail/>} /> */}
          </Routes>
        </Router>
      </Provider>
    </LocalizationProvider>
  );
}

export default App
