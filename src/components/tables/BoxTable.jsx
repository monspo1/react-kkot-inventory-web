import React, { useState, useMemo, useEffect, useCallback, useContext, createContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialReactTable, useMaterialReactTable,} from 'material-react-table';
import { columnsForBoxTable } from '../../constants/tableColumns';
// import * as firebase from 'firebase/app';
import 'firebase/firestore';
import { collection, getDocs, Timestamp, writeBatch, doc, query, where, orderBy, limit } from 'firebase/firestore'; 
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../../utils/firebase'; 
import { setLoaderStatus, setBoxesData, setBoxLabelData } from '../../actions/action'
import Button from '@mui/material/Button';
import PrintIcon from '@mui/icons-material/Print';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DownloadIcon from '@mui/icons-material/Download';
import SpinnerComp from '../common/SpinnerComp';
import AddNewItemModal from '../modals/AddNewItemModal'
import BoxItemsModal from '../modals/BoxItemsModal';
import moment from 'moment';

const BoxTable = () => {
  const [showAddNewItemModal, setShowAddNewItemModal] = useState(false);
  const [showBoxItemModal, setShowBoxItemModal] = useState(false);
  

  // const curLoggedinUser = useSelector(state => state.curLoggedinUser);
  const spinner = useSelector(state => state.loading);
  const boxesData = useSelector(state => state.boxesData);
  const boxLabelData = useSelector(state => state.boxLabelData);
  const masterBoxItems = useSelector(state => state.masterBoxItems);
  
  const columns = useMemo(() => columnsForBoxTable, []);
  const dispatch = useDispatch()
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchBoxesData();
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
  
  const printBtnHandler = (e) => {
    console.log('printBtnHandler clicked')
    dispatch(setLoaderStatus(true))
    // console.log('boxesData', boxesData)
    fetchAllDataForPrint()
  }

  const newBoxBtnHandler = () => {
    console.log('new box')
    setShowBoxItemModal(true)
  }


  const fetchAllDataForPrint = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const boxCollection = collection(db, 'boxes');
    const boxQuery = query(boxCollection, where("updated", ">=", today));
    const boxSnapshot = await getDocs(boxQuery);
    
    const allBoxesData = await Promise.all(boxSnapshot.docs.map(async (doc) => {
      const data = doc.data();
      for (let field in data) {
        if (data[field] instanceof Timestamp) {
          data[field] = data[field].toDate().toISOString();
        }
      }
      
      const boxItemsCollection = collection(db, 'boxes', doc.id, 'box_items');
      const boxItemsSnapshot = await getDocs(boxItemsCollection);
      
      const boxItemsData = boxItemsSnapshot.docs.map((doc) => {
        const data = doc.data();
        for (let field in data) {
          if (data[field] instanceof Timestamp) {
            data[field] = data[field].toDate().toISOString();
          }
        }
        return { ...data, id: doc.id };
      });
      
      return { ...data, id: doc.id, box_items: boxItemsData };
    }));
    
    // console.log('allBoxesData: ', allBoxesData); 
    dispatch(setBoxLabelData(allBoxesData));

    let str = 'LABEL, CONTENTS, , LABEL, CONTENTS\n';
    allBoxesData.forEach((box, idx) => {
      // console.log('box: ', box)
      let localstr = ''; //box.box_initial
      box.box_items.forEach((item, index) => {
        localstr += ((index === 0) ? box.box_initial : '') + ',' 
          +`${item.item_content} ${item.item_weight_oz}oz /x${item.item_count} ${moment(item.item_expiration).format('MM/DD/YYYY')},,`
          + ((index === 0) ? box.box_initial : '') + ',' 
          +`${item.item_content} ${item.item_weight_oz}oz /x${item.item_count} ${moment(item.item_expiration).format('MM/DD/YYYY')}\n`;
      });
      str += localstr;
      str += '\n\n'
    });
    // console.log(str)

    dispatch(setLoaderStatus(false))
    let blob = new Blob([str], { type: 'text/csv;charset=utf-8;' });
    let url = URL.createObjectURL(blob);
    let link = document.createElement("a");
    if (link.download !== undefined) {
        link.setAttribute("href", url);
        link.setAttribute("download", `kkot_box_labels${moment().format('MM-DD-YYYY')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };

  const exportFileToJSON = () => {
    dispatch(setLoaderStatus(true))
    // let copiedArrForExport = Object.assign([], boxLabelData);
    // const resarr = []
    // let str = 'LABEL, CONTENTS, , LABEL, CONTENTS';
    // boxLabelData.forEach((box, idx) => {
    //     console.log('box: ', box)
    //   let localstr = ''; box.box_initial;
    //   box.box_items.forEach((item, index) => {
    //     localstr += (index === 0) ? box.box_initial : ''; //moment(props.row.createdAt).format('MMM/DD/YYYY, HH:MM:SS')
    //     localstr += `${item.content} ${item.item_weight_oz} /x${item.item_count} ${moment(item.item_expiration).format('MM/DD/YYYY')}`
    //     localstr += '\n';
    //   });
    //   str += localstr;
    //   str += '\n\n'
      
    // });
    // console.log(str)

    // const blob = new Blob([JSON.stringify(copiedArrForExport)], { type: 'application/json' });
    // const url = URL.createObjectURL(blob);
    // const link = document.createElement('a');
    // link.href = url;
    // link.download = 'output.json';
    // link.click();
    dispatch(setLoaderStatus(false))
  }

  const buttonSetElem = (
    <div className="div-for-master-box-items-buttons">
        <Button variant="outlined" size="small" startIcon={<PrintIcon />} 
            onClick={printBtnHandler}>EXPORT LABEL</Button>
        <Button variant="outlined" size="small" startIcon={<AddCircleOutlineIcon />} 
            onClick={newBoxBtnHandler}>NEW BOX</Button>
        {/* <Button variant="outlined" size="small"  startIcon={<DownloadIcon />} 
            onClick={exportFileToJSON}>Export</Button> */}
    </div>
  );

  const addNewItemModalElem = (
    <AddNewItemModal 
        showModal={showAddNewItemModal}
        setShowModal={setShowAddNewItemModal}
    />
  )

  const boxItemsModalElem = (
    <BoxItemsModal
      showModal={showBoxItemModal}
      fetchBoxData={fetchBoxesData}
      setShowModal={setShowBoxItemModal}
    />
  )
  const mtable = useMaterialReactTable({ 
    data: boxesData, columns,
    initialState: { columnVisibility: { box_creator: false } },
   });

  const mainBoxElem = (
    <div className="div-for-material-react-box-table">
      <MaterialReactTable table={mtable} />
    </div>
  )

  return (
    <>
        <h3>Box Table</h3>
        { buttonSetElem }
        { boxItemsModalElem }
        { mainBoxElem }
        { spinner && <SpinnerComp/> }
    </>
  );
}

export default BoxTable;