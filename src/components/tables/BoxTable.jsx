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
import PrintIcon from '@mui/icons-material/Print';
import SpinnerComp from '../common/SpinnerComp';

const BoxTable = () => {
  const spinner = useSelector(state => state.loading);
  const boxesData = useSelector(state => state.boxesData);
  // const curLoggedinUser = useSelector(state => state.curLoggedinUser);
  const masterBoxItems = useSelector(state => state.masterBoxItems);
  const columns = useMemo(() => columnsForBoxTable, []);
  const table = useMaterialReactTable({ data: boxesData, columns });
  const dispatch = useDispatch()
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // fetchBoxesData();
      }
    });    
    return () => unsubscribe(); // Clean up subscription on unmount
  }, []);

  // useEffect(() => {
  //   if(curLoggedinUser && boxesData.length === 0) {
  //     fetchBoxesData();
  //   }
  // }, [curLoggedinUser, boxesData]);
  
  const fetchBoxesData = async () => {
    dispatch(setLoaderStatus(true))
    const boxCollection = collection(db, 'boxes'); 
    const boxSnapshot = await getDocs(boxCollection); // 문서를 가져옵니다
    const receivedData = boxSnapshot.docs.map(doc => {
      const data = doc.data();
      for (let field in data) {
        if (data[field] instanceof Timestamp) {
          data[field] = data[field].toDate().toISOString();
        }
      }
      return { ...data, id: doc.id };
    });
    console.log('boxesData: ', receivedData)
    dispatch(setBoxesData(receivedData))
  };

  const uploadJsonToCollection = () => {
    // console.log('masterBoxItems: ', masterBoxItems)
    dispatch(setLoaderStatus(true))
    let tempData = Object.assign([], masterBoxItems);
    // let tempData = Object.assign([], masterBoxItems.slice(0, 50));
    // tempData = tempData.map(item => { 
    //     delete item.__v;
    //     delete item._id;
    //     delete item.missingWeight;
    //     delete item.isDuplicate;
    //     delete item.updatedAt;
    //     return item;
    // })
    // console.log(tempData);
    // /*
    const batchSize = 400;
    let batchNumber = 0;

    const intervalId = setInterval(async() => {
      const batch = tempData.slice(batchNumber * batchSize, (batchNumber + 1) * batchSize);
      const batchWrite = writeBatch(db);

      batch.forEach((item, index) => {
        // const docRef = doc(db, 'master-items', `master-item-${Date.now()}-${batchNumber * batchSize + index}`);
        const docRef = doc(collection(db, 'master-items'));
        batchWrite.set(docRef, item);
      })

      await batchWrite.commit();

      batchNumber++;
      if (batchNumber * batchSize >= tempData.length) {
        clearInterval(intervalId);
        console.log('Upload finished');
        dispatch(setLoaderStatus(false))
      }
    }, 1000);
  }
  
  const testInsertBoxItemObj = () => {
    // const boxItemObj = {
    //   item_barcode: textForBarcode,
    //   item_name: textForItemName,
    //   item_expiration: textForExpiration,
    //   item_weight_oz: textForWeightOz,
    //   item_weight_lbs: textForWeightLbs,
    //   item_weight_g: textForWeightG,
    //   item_price: textForPrice,
    //   item_category: getItemLabelByValue(checkedRadioBtnForCategory)
    // }
  }

  const printBtnHandler = (e) => {
    console.log('printBtnHandler clicked')
  }

  const buttonSetElem = (
    <div className="div-for-master-box-items-buttons">
        <Button variant="outlined" size="small" startIcon={<PrintIcon />} 
            onClick={printBtnHandler}>PRINT</Button>
    </div>
);

  return (
    <>
        <h3>Box Table</h3>
        { buttonSetElem }
        <MaterialReactTable table={table} />
        { spinner && <SpinnerComp/> }
    </>
  );
}

export default BoxTable;