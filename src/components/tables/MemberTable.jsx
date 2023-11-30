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
import SpinnerComp from '../common/SpinnerComp';

const MemberTable = () => {
  const spinner = useSelector(state => state.loading);
  const membersData = useSelector(state => state.membersData);
  
  return (
    <div>MEMBER</div>
  )
}

export default MemberTable;