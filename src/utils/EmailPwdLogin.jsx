import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { // setCurLoggedInUser, 
  setLoaderStatus } from './../actions/action'
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import SpinnerComp from './../components/common/SpinnerComp';
import CustomAlert from '../components/common/CustomAlert'

function EmailPwdLogin (props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [errMessage, setErrMessage] = useState('');

  const spinner = useSelector(state => state.loading);

  const dispatch = useDispatch()
  const auth = getAuth();
  const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError(!emailRegex.test(e.target.value));
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleLogin = () => {
    if(!emailError && !passwordError){
      dispatch(setLoaderStatus(true));
      signInWithEmailAndPassword(auth, email, password)
        .then((result) => {
          console.log('result: ', result)
          // dispatch(setCurLoggedInUser(result.user));
          props.onClose(true);
        }).catch((error) => {
          console.log('error: ', error)
          setErrMessage(error.message)
          dispatch(setLoaderStatus(false));
        });
    }
  }
  
  const shouldDisableLoginBtn = () => {
    return !(email !== "" && password !== "" && emailError === false && passwordError === false)
  }

  const warnAlertElem = errMessage && 
    <CustomAlert type="danger" message={errMessage} style={{ paddingBottom: 15 }}/>;
  
  return (
    <div>
      { warnAlertElem }
      <TextField id="textfield-for-login-email" name="login-email" 
        type="email" label="Email" fullWidth variant="outlined" 
        value={email} onChange={handleEmailChange} style={{ marginBottom: '10px'}}
        error={emailError} helperText={emailError ? "Invalid email address." : ""}
      />

      <TextField id="textfield-for-login-pwd" name="login-password"
        type="password" label="Password" fullWidth  variant="outlined" 
        value={password} onChange={handlePasswordChange} 
        error={passwordError} helperText={passwordError ? "Password should be at least 6 characters." : ""}
      />
      <div style={{ marginTop: '25px' }}>
        <Button variant="contained" fullWidth 
          disabled={shouldDisableLoginBtn()} onClick={handleLogin}>Log in</Button>
      </div>
      {spinner && <div style={{ position: 'absolute', top: '40%', left: '50%' }}>
        <SpinnerComp/>
      </div>}
    </div>
  )
}

export default EmailPwdLogin;