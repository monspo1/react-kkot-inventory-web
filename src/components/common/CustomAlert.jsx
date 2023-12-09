import React, { useState, useEffect } from 'react';
import { FaBeer, FaExclamationCircle } from 'react-icons/fa';

import Alert from 'react-bootstrap/Alert';
// import './../../styles/EsCustomStyle.scss'

const CustomAlert = ({ message, type, style, size, duration, icon }) => {
  const [show, setShow] = useState(true);
  const curSize = size ? size : 'medium';
  
  const className = `es-custom-alert es-custom-alert-${curSize} ${type}`
  const iconSize = {
    'large': 'icon-h1',
    'medium': 'icon-h3',
    'small': 'icon-h5',
  }

  const iconReceived = (icon)
    ? React.cloneElement(icon, { className: `${iconSize[type]}`})
    : <FaExclamationCircle style={{ marginRight: '10px' }} />
    // : {
    //   'primary': <FaExclamationCircle style={{ marginRight: '10px' }} />,
    //   'success': <FaExclamationCircle style={{ marginRight: '10px' }} />,
    //   'warning': <FaExclamationCircle style={{ marginRight: '10px' }} />,
    //   'info': <FaExclamationCircle style={{ marginRight: '10px' }} />,
    //   'error': <FaExclamationCircle style={{ marginRight: '10px' }} />,
    // }[type];

  const testAlertElem = [
    'primary',
    'secondary',
    'success',
    'danger',
    'warning',
    'info',
    'light',
    'dark',
  ].map((variant, idx) => (
    <Alert key={`div-${variant}-${idx}`} variant={variant} style={{ padding: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        { iconReceived }
        { message }
      </div>
    </Alert>
  ))

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        setShow(false);
      }, duration);

      // cleanup function을 반환하여, 컴포넌트 unmount 시 timer가 clear 되도록 합니다.
      return () => clearTimeout(timer);
    }
  }, [duration]);

  return (<>
    {/* { testAlertElem } */}
    { show && <div>
      <Alert key={`div-${type}`} onClose={() => setShow(false)} dismissible
        variant={type} style={{...style, padding: 10 }}>
        <Alert.Heading></Alert.Heading>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          { iconReceived }
          { message }
        </div>
      </Alert>
    </div>
    }
  </>)
}

export default CustomAlert;