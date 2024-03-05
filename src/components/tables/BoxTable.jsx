import React, { useState, useMemo, useEffect, useCallback, useContext, createContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialReactTable, useMaterialReactTable,} from 'material-react-table';
import { columnsForBoxTable } from '../../constants/tableColumns';
// import * as firebase from 'firebase/app';
import 'firebase/firestore';
import { collection, getDocs, Timestamp, writeBatch, doc, query, where, orderBy, limit } from 'firebase/firestore'; 
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { db } from '../../utils/firebase'; 
import { setLoaderStatus, setBoxesData, setBoxItemData, setBoxLabelData, setCurUserRole } from '../../actions/action'
import Button from '@mui/material/Button';
import PrintIcon from '@mui/icons-material/Print';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SpinnerComp from '../common/SpinnerComp';
// import MasterItemModal from '../modals/MasterItemModal'
import BoxItemsModal from '../modals/BoxItemsModal';
import moment from 'moment';
import './../../styles/variables.scss'

const BoxTable = () => {
  const [showBoxItemModal, setShowBoxItemModal] = useState(false);
  const [localBoxInitial, setLocalBoxInitial] = useState('')
  const [currentBoxSelected, setCurrentBoxSelected] = useState(null);
  // const curLoggedinUser = useSelector(state => state.curLoggedinUser);
  const spinner = useSelector(state => state.loading);
  const boxesData = useSelector(state => state.boxesData);
  const boxLabelData = useSelector(state => state.boxLabelData);
  const masterBoxItems = useSelector(state => state.masterBoxItems);
  const curUserRole = useSelector(state => state.curUserRole);
  
  const auth = getAuth();
  let columns = useMemo(() => columnsForBoxTable, []);
  const dispatch = useDispatch()

  useEffect(() => {
    // console.log('curUserRole: ', curUserRole)
  }, [curUserRole]);
  
  /*
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
  //*/
  
  /* # Working well - But, not good becuase it returns all admin info
  const fetchAllAdminsData = useCallback(async () => {
    const adminGroupCollection = collection(db, 'admin-group');
    const adminGroupSnapshot = await getDocs(adminGroupCollection); // Fetch all documents from 'admin-group' collection
  
    const allAdminsData = adminGroupSnapshot.docs.map(doc => {
      const data = doc.data();
      for (let field in data) {
        if (data[field] instanceof Timestamp) {
          data[field] = data[field].toDate().toISOString();
        }
      }
      return { ...data, id: doc.id };
    });
    
    console.log('allAdminsData: ', allAdminsData)
    console.log('curUserRole: ', curUserRole)
    const foundAdmin = allAdminsData.find(a => a.uid === auth.currentUser?.uid)
    const roleLocal = (foundAdmin) ? 'admin' : 'normal'
    dispatch(setCurUserRole(roleLocal));
    
    return allAdminsData;
  }, [auth.currentUser, curUserRole, dispatch])
  //*/

  const checkCurUserAdmin = async (userId) => {
    const adminGroupCollection = collection(db, 'admin-group');
    const q = query(adminGroupCollection, where("uid", "==", userId));
    const querySnapshot = await getDocs(q);
    
    const roleLocal = !querySnapshot.empty ? 'admin' : 'normal'; // Return true if found admin, otherwise false    
    // console.log('roleLocal: ', roleLocal)
    dispatch(setCurUserRole(roleLocal));
    return;
  } 

  const fetchAllBoxesAndItemsData = useCallback(async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const boxCollection = collection(db, 'boxes');
    // const boxQuery = query(boxCollection, where("updated", ">=", today));
    // const boxSnapshot = await getDocs(boxQuery);
    const boxSnapshot = await getDocs(boxCollection);  // no query
        
    const allBoxesData = await Promise.all(
        boxSnapshot.docs.map(async (doc) => {
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
        }
      )
    );
    // console.log('allBoxesData: ', allBoxesData)
    dispatch(setBoxesData(allBoxesData))
    return allBoxesData;
  }, [dispatch]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // fetchBoxesData();
        // fetchAllAdminsData();
        fetchAllBoxesAndItemsData()
          .then(() => {
            // console.log('Fetched box -> auth', auth)
            if(auth.currentUser) {
              // console.log('auth.currentUser: ', auth.currentUser)
              checkCurUserAdmin(auth.currentUser.uid)
            }
        });
      }
    });    
    return () => unsubscribe(); // Clean up subscription on unmount
  }, [auth, fetchAllBoxesAndItemsData]);
  

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
        // console.log('Upload finished');
        dispatch(setLoaderStatus(false))
      }
    }, 1000);
  }
  
  const printBtnHandler = (e) => {
    // console.log('printBtnHandler clicked')
    dispatch(setLoaderStatus(true))
    // console.log('boxesData', boxesData)
    fetchAllDataForPrint()
  }

  const newBoxBtnHandler = () => {
    // console.log('new box')
    setCurrentBoxSelected(null)
    setLocalBoxInitial('')
    setShowBoxItemModal(true)
  }

  const addAsAdminBtnHandler = async () => {
    // console.log('curUser: ', auth.currentUser)
    const curUserObj = {
      uid: auth.currentUser.uid,
      email: auth.currentUser.email,
      displayName: auth.currentUser.displayName,
      providerId: auth.currentUser.providerId,
    }

    const batch = writeBatch(db);
    const adminGroupRef = doc(db, "admin-group", curUserObj.uid); // Create a document reference with current user's uid

    // Add curUser to admin-group collection
    batch.set(adminGroupRef, curUserObj);

    // Commit the batch
    try {
      await batch.commit();
      console.log(`Successfully added admin user to Firestore`);
    } catch (err) {
      console.error(`Failed to add admin user to Firestore: `, err);
    }
  }

  const fetchAllDataForPrint = async () => {
    const allBoxesData = await fetchAllBoxesAndItemsData();
    // const today = new Date();
    // today.setHours(0, 0, 0, 0);
    
    // const boxCollection = collection(db, 'boxes');
    // const boxQuery = query(boxCollection, where("updated", ">=", today));
    // const boxSnapshot = await getDocs(boxQuery);
    
    // const allBoxesData = await Promise.all(boxSnapshot.docs.map(async (doc) => {
    //   const data = doc.data();
    //   for (let field in data) {
    //     if (data[field] instanceof Timestamp) {
    //       data[field] = data[field].toDate().toISOString();
    //     }
    //   }
      
    //   const boxItemsCollection = collection(db, 'boxes', doc.id, 'box_items');
    //   const boxItemsSnapshot = await getDocs(boxItemsCollection);
      
    //   const boxItemsData = boxItemsSnapshot.docs.map((doc) => {
    //     const data = doc.data();
    //     for (let field in data) {
    //       if (data[field] instanceof Timestamp) {
    //         data[field] = data[field].toDate().toISOString();
    //       }
    //     }
    //     return { ...data, id: doc.id };
    //   });
      
    //   return { ...data, id: doc.id, box_items: boxItemsData };
    // }));
    
    // console.log('allBoxesData: ', allBoxesData); 
    dispatch(setBoxLabelData(allBoxesData));

    let str = 'LABEL, CONTENTS, , LABEL, CONTENTS\n';
    allBoxesData.forEach((box, idx) => {
      // console.log('box: ', box)
      let localstr = ''; //box.box_initial
      box.box_items.forEach((item, index) => {
        localstr += ((index === 0) ? box.box_initial : '') + ',' 
          +`${item.content} ${item.item_weight_oz}oz /x${item.item_count} ${moment(item.item_expiration).format('MM/DD/YYYY')},,`
          + ((index === 0) ? box.box_initial : '') + ',' 
          +`${item.content} ${item.item_weight_oz}oz /x${item.item_count} ${moment(item.item_expiration).format('MM/DD/YYYY')}\n`;
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

  // console.log('auth.currentUser in BoxTable: ', auth.currentUser);
  const shouldDisableButtonSet = !auth.currentUser || curUserRole !== 'admin'
  const buttonSetElem = (
    <div className="div-for-master-box-items-buttons">
        <Button variant="outlined" size="small" startIcon={<PrintIcon />} 
            disabled={!auth.currentUser} onClick={printBtnHandler}>EXPORT LABEL</Button>
        <Button variant="outlined" size="small" startIcon={<AddCircleOutlineIcon />}
            disabled={!auth.currentUser} onClick={newBoxBtnHandler}>NEW BOX</Button>
        <Button variant="outlined" size="small"  startIcon={<AdminPanelSettingsIcon />} 
            disabled={shouldDisableButtonSet} onClick={addAsAdminBtnHandler}>Add cur User as Admin</Button>
    </div>
  );

  const boxItemsModalElem = (
    <BoxItemsModal
      showModal={showBoxItemModal}
      fetchBoxData={fetchAllBoxesAndItemsData}
      boxInitial={localBoxInitial}
      setShowModal={setShowBoxItemModal}
      curBox={currentBoxSelected}
    />
  );

  const infoDivElem = (
    <div className="info-div-elem" >
      * Email to <span className="info-div-elem-email">monspo1@gmail.com</span> if you&apos;re interested in participating in the development (or improvement) of the NJ KKot Inventory Project (UI/UX, Web / Mobile) or other projects,
        .
    </div>
  )
  const mtable = useMaterialReactTable({ 
    data: boxesData, columns,
    muiTableBodyRowProps: ({ row }) => ({
      onClick: (event) => {
        // console.info('clicked row: ', row);
        if(auth.currentUser.uid === row.original.box_creator.uid) {
          setLocalBoxInitial(row.original.box_initial)
          dispatch(setBoxItemData(row.original.box_items))
          setShowBoxItemModal(true)
          setCurrentBoxSelected(row.original);
        }
      },
      sx: { cursor: 'pointer', },
    }),
    initialState: { 
      density: 'compact',
      pagination: { pageSize: 15,},
      // columnVisibility: { box_creator: false }  // <= for hiding the column
    },
    muiTableHeadCellProps: { // globally applicable (individual style should be in the column config)
      sx: {
          // background: '#0dcaf077',
          background: '#eee',
          borderRight: '1px solid rgba(224,224,224,1)',
          color: 'black'
      }
    }
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
        { infoDivElem }
        { spinner && <SpinnerComp/> }
    </>
  );
}

export default BoxTable;