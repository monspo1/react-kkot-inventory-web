import React, { useState, useMemo, useEffect, useCallback, useContext, createContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialReactTable, useMaterialReactTable,} from 'material-react-table';
import { columnsForBoxTable } from '../../constants/tableColumns';
// import * as firebase from 'firebase/app';
import 'firebase/firestore';
import { collection, getDocs, Timestamp, writeBatch, doc } from 'firebase/firestore'; 
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../../utils/firebase'; 
import { setLoaderStatus, setBoxesData } from '../../actions/action'
import Button from '@mui/material/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SpinnerComp from '../common/SpinnerComp';

const MemberTable = () => {
  // const [showRoleModal, setShowRoleModal] = useState(false);

  const spinner = useSelector(state => state.loading);
  const membersData = useSelector(state => state.membersData);
  
  // const assignRoleBtnClickHandler = (e) => {
  //   console.log('assignRoleBtn')
  // }
  
  // const buttonSetElem = (
  //   <div className="div-for-master-box-items-buttons">
  //       <Button variant="outlined" size="small" startIcon={<AddCircleOutlineIcon />} 
  //           onClick={assignRoleBtnClickHandler}>Assign ROLE</Button>
  //   </div>
  // );

  return (<>
    <div>MEMBER</div>
    {/* { buttonSetElem } */}
  </>)
}

export default MemberTable;