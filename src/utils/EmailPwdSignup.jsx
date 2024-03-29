import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { //setCurLoggedInUser, 
  setLoaderStatus } from './../actions/action'
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import SpinnerComp from './../components/common/SpinnerComp';
import CustomAlert from '../components/common/CustomAlert'

function EmailPwdSignup (props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [errMessage, setErrMessage] = useState('');

  const dispatch = useDispatch()
  const spinner = useSelector(state => state.loading);
  const auth = getAuth();
  const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;

  useEffect(() => {
    setEmail('')
    setPassword('')
    setErrMessage('')
  }, []);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError(!emailRegex.test(e.target.value));
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError(e.target.value.length < 6);
  };

  const shouldDisableSignupBtn = () => {
    return !(email !== "" && password !== "" && emailError === false && passwordError === false)
  }

  const handleSignUp = () => {
    if(!emailError && !passwordError){
      dispatch(setLoaderStatus(true));
      createUserWithEmailAndPassword(auth, email, password)
        .then((result) => {
          console.log('result: ', result)
          // dispatch(setCurLoggedInUser(result.user));
          dispatch(setLoaderStatus(false));
          props.onClose(true);
        })
        .catch((error) => {
          console.log('error: ', error)
          setErrMessage(error.message)
          dispatch(setLoaderStatus(false));
        });
    }
  };

  const warnAlertElem = errMessage && 
    <CustomAlert type="danger" message={errMessage} style={{ paddingBottom: 20 }}/>;
  

  return (
    <div>
      {warnAlertElem}
      <TextField id="textfield-for-signup-email" name="signup-email" 
        type="email" label="Email" fullWidth variant="outlined" style={{ marginBottom: '10px'}}
        value={email} onChange={handleEmailChange} autoComplete="off"
        error={emailError} helperText={emailError ? "Invalid email address." : ""}
      />

      <TextField id="textfield-for-signup-pwd" name="signup-password"
        type="password" label="Password" fullWidth variant="outlined" autoComplete="new-password"
        value={password} onChange={handlePasswordChange} 
        error={passwordError} helperText={passwordError ? "Password should be at least 6 characters." : ""}
      />
      <div style={{ marginTop: '25px' }}>
        <Button variant="contained" fullWidth
          disabled={shouldDisableSignupBtn()} onClick={handleSignUp}>Sign Up</Button>
      </div>
      {spinner && <div style={{ position: 'absolute', top: '45%', left: '50%' }}>
        <SpinnerComp/>
      </div>}
    </div>
  );
}

export default EmailPwdSignup;