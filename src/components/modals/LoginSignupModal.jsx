import React, { useState, useEffect } from 'react';
import { setBoxesData } from './../../actions/action'
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { useDispatch, useSelector } from 'react-redux';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import EmailPwdLogin from './../../utils/EmailPwdLogin';
import EmailPwdSignup from './../../utils/EmailPwdSignup';
import GoogleLogin from '../../utils/GoogleLogin';
// import SpinnerComp from './../common/SpinnerComp';
// import { auth } from '../../utils/firebase'; 

const localModalBoxStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 3,
  boxShadow: 24,
  p: 4,
};

const LoginSignupModal = () => {
  const [currentUser, setCurrentUser] = React.useState(null); // firebase auth 상태 추적용
  const [selectedTabValue, setSelectedTabValue] = React.useState('1');
  const [openLoginSignupModal, setOpenLoginSignupModal] = React.useState(false)
  // const spinner = useSelector(state => state.loading);
  const dispatch = useDispatch()
  // const curLoggedinUser = useSelector(state => state.curLoggedinUser);
  const auth = getAuth();
  const handleModalOpen = () => setOpenLoginSignupModal(true);
  const handleModalClose = () => setOpenLoginSignupModal(false);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      console.log('auth.currentUser: ', user);
    });

    // cleanup function
    return () => unsubscribe();
  }, [auth]);


  const handleTabChange = (event, newValue) => {
    setSelectedTabValue(newValue);
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log('User signed out');
        // dispatch(setCurLoggedInUser(null));
        dispatch(setBoxesData([]));
      }).catch((error) => {
        console.log('error: ', error)
      });
  }

  // console.log('auth.currentUser: ', auth?.currentUser)
  return (<>
      { currentUser 
        ? <span style={{ zIndex: 100 }}>{currentUser.email} <Button onClick={handleLogout}>LOG OUT</Button></span>
        : <Button onClick={handleModalOpen}>LOGIN</Button>
      }
      <Modal
        open={openLoginSignupModal}
        onClose={handleModalClose}
        aria-labelledby="login-signup-modal-title"
        aria-describedby="login-signup-modal-description"
      >
        <Box sx={localModalBoxStyle}>
            <TabContext value={selectedTabValue}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <TabList onChange={handleTabChange} aria-label="lab API tabs example">
                  <Tab label="Login Form" value="1" />
                  <Tab label="Signup Form" value="2" />
                </TabList>
              </Box>
              <TabPanel value="1">
                <EmailPwdLogin onClose={handleModalClose} />
                <GoogleLogin onClose={handleModalClose}/>
              </TabPanel>
              <TabPanel value="2"><EmailPwdSignup onClose={handleModalClose}/></TabPanel>
            </TabContext>
        </Box>
        
      </Modal>
  </>);
}

export default LoginSignupModal;