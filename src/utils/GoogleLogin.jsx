import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useDispatch, useSelector } from 'react-redux';
// import { setCurLoggedInUser, setLoaderStatus } from './../actions/action'
import Button from '@mui/material/Button';
import GoogleIcon from '@mui/icons-material/Google';

function GoogleLogin(props) {
  const auth = getAuth();
  // const dispatch = useDispatch()

  const provider = new GoogleAuthProvider();

  const signInWithGoogle = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log('result: ', result)
        // dispatch(setCurLoggedInUser(result.user));
        props.onClose(true);
      }).catch((error) => {
        console.log('error: ', error)
      });
  };

  return (
    <div style={{ marginTop: 10}}>
      <Button variant="contained" fullWidth 
        startIcon={<GoogleIcon />} style={{ backgroundColor: '#e11a25'}}
        onClick={signInWithGoogle}
      >
          Sign in with Google
      </Button>
    </div>
  );
}

export default GoogleLogin;