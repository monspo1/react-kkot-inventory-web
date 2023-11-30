import Spinner from 'react-bootstrap/Spinner';
import './../../styles/variables.scss';

const SpinnerComp = () => {
  return (
    <div className="spinner-wrapper">
      <Spinner className="spinner-border" animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  )
}

export default SpinnerComp;