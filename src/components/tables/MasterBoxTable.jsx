// https://www.material-react-table.dev/?path=/story/prop-playground--default
import React, { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialReactTable, useMaterialReactTable,} from 'material-react-table';
import { columnsForMasterTable }  from '../../constants/tableColumns';
import { setInfoMessage, setLoaderStatus, setMasterBoxItems } from '../../actions/action'
import { collection, getDocs, Timestamp, writeBatch, doc, query, where, orderBy, limit } from 'firebase/firestore'; 
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../../utils/firebase'; 
import UploadFileModal from '../modals/UploadFileModal'
import MasterItemModal from '../modals/MasterItemModal'
import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import UploadIcon from '@mui/icons-material/Upload';
import AddIcon from '@mui/icons-material/AddCircle';
import DownloadIcon from '@mui/icons-material/Download';
import SpinnerComp from './../common/SpinnerComp';
import CustomAlert from './../common/CustomAlert';
import './../../styles/variables.scss';
// import moment from 'moment';
// import 'react-data-grid/lib/styles.css';
// import set from 'date-fns/fp/set';



const MasterBoxTable = () => {
    const [dataForMaterialReactTable, setDataForMaterialReactTable] = useState([]);
    const [showUploadFileModal, setShowUploadFileModal] = useState(false);
    const [showMasterItemModal, setShowMasterItemModal] = useState(false);
    const [page, setPage] = useState(0);
    const [curModalItem, setCurModalItem] = useState({});
    // const [error, setError] = useState(null)
    const [totalItems, setTotalItems] = useState(0);
    const dispatch = useDispatch()
    const spinner = useSelector(state => state.loading);
    const masterBoxItems = useSelector(state => state.masterBoxItems);
    const columnsForMaterialTable = useMemo(() => columnsForMasterTable, []);
    const errorObject = useSelector(state => state.errorObject);
    const infoMessage = useSelector(state => state.infoMessage);
    
    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            // fetchMasterItemsData(); // masterBoxItems from firestore
          }
        });    
        return () => unsubscribe(); // Clean up subscription on unmount
      }, [auth]);


    // Local masterBoxItems (Not from DB)
    useEffect(() => {
        // console.log('downloaded masterBoxItems: ', masterBoxItems);
        setDataForMaterialReactTable(masterBoxItems)
    }, [masterBoxItems]);
    
    const fetchMasterItemsData = async () => {
        dispatch(setLoaderStatus(true))

        /*  Firestore는 문서의 개수를 직접 가져오는 기능을 제공하지 않습니다. Firestore에서는 문서의 개수를 가져오려면 
            해당 컬렉션의 모든 문서를 읽어야 합니다. 이는 Firestore의 쿼리 모델과 관련이 있는데, Firestore는 실시간으로
            데이터를 가져오는 것이 가능하도록 설계되었기 때문에, 문서의 개수를 가져오는 것이 별도의 연산으로 제공되지 않습니다. */
        // const totalItemsSnapshot = await getDocs(collection(db, 'master-items'));
        // setTotalItems(totalItemsSnapshot.size);

        const masterItemsCollection = collection(db, 'master-items'); 
        
        //# Get ALL data (Not recommended due to the daily limit)
        // const masterItemsSnapshot = await getDocs(masterItemsCollection); // 문서를 가져옵니다

        //# Get only 10 documents from firestore
        // const firstQuery = query(masterItemsCollection, orderBy('barcode'), limit(10));
        // const firstSnapshot = await getDocs(firstQuery);

        // get not_reviewed from firestore
        const queryForNotReviewed = query(masterItemsCollection, where("is_reviewed", "==", false), limit(2));
        const querySnapshotForNR = await getDocs(queryForNotReviewed);

        //# Convert date data to ISO format
        // const receivedData = firstSnapshot.docs.map(doc => {
        const receivedData = querySnapshotForNR.docs.map(doc => {
          const data = doc.data();
          for (let field in data) { //   
            if (data[field] instanceof Timestamp) {
              data[field] = data[field].toDate().toISOString();
            }
          }
          return { ...data, id: doc.id };
        });
        console.log('masterBoxItems: ', receivedData)
        dispatch(setInfoMessage("Received the masterBoxItems from Cloud"))
        setDataForMaterialReactTable(receivedData)
    };

    const fetchNextPage = async () => {
        const masterItemsCollection = collection(db, 'master-items'); 
        const nextPageQuery = query(masterItemsCollection, orderBy('barcode'), startAfter(lastVisible), limit(10));
        const nextPageSnapshot = await getDocs(nextPageQuery);
        lastVisible = nextPageSnapshot.docs[nextPageSnapshot.docs.length - 1];

        const nextPageData = nextPageSnapshot.docs.map(doc => {
            const data = doc.data();
            for (let field in data) {
                if (data[field] instanceof Timestamp) {
                    data[field] = data[field].toDate().toISOString();
                }
            }
            return { ...data, id: doc.id };
        });

        console.log('nextPageItems: ', nextPageData)
        setDataForMaterialReactTable(nextPageData)
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
        fetchNextPage(newPage);
    };

    // useEffect(() => { // fetch data from MongoDB Atlas
    //     const fetchBoxItemsMasterData = async () => { 
    //         if (masterBoxItems.length === 0) {
    //             dispatch(setLoaderStatus(true));
    //             api.getMasterBoxItems().then(res => {
    //                 dispatch(setMasterBoxItems(res.data.response));
    //                 setDataForMaterialReactTable(res.data.response)
    //             }).catch(error => {
    //                 dispatch(setLoaderStatus(false));
    //                 console.log(error); 
    //             });
    //         }
    //     }
    //     fetchBoxItemsMasterData();
    // }, [masterBoxItems]);
    
    // const deleteMasterBoxItems = (e) => {  // Delete items in MongoDB Atlas
    //     // console.log("clicked deleteMasterBoxItems", e);
    //     dispatch(setLoaderStatus(false));
    //     try {
    //         api.deleteAllMasterBoxItems().then(res => {
    //             console.log("Removed all box items: ", res);
    //             dispatch(setMasterBoxItems([]));
    //         });
    //     } catch(error) { 
    //         console.log(error); 
    //     } 
    // }
    
    const exportFileToJSON = () => {
        dispatch(setLoaderStatus(true))
        let copiedArrForExport = Object.assign([], masterBoxItems);
        copiedArrForExport = copiedArrForExport.slice(0,5).map(item => { 
            delete item.__v;
            delete item._id;
            delete item.missingWeight;
            delete item.isDuplicate;
            delete item.updatedAt;
            return item;
        })
        console.log(copiedArr.slice(0,5));
        const blob = new Blob([JSON.stringify(copiedArrForExport)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'output.json';
        link.click();
        dispatch(setLoaderStatus(false))
    }

    
    const uploadJsonToCollection = () => {
        // console.log('masterBoxItems: ', masterBoxItems)
        dispatch(setLoaderStatus(true))
        let tempData = Object.assign([], masterBoxItems);
        // let tempData = Object.assign([], masterBoxItems.slice(0, 50));
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
        //*/
    }
    
    const masterItemClickHandler = (e) => {
        setCurModalItem({})
        setShowMasterItemModal(true)
    }

    const fetchReviewItems = () => {
        console.log('fetch unreviewed items')
        fetchMasterItemsData();
    }
    
    const mtable = useMaterialReactTable({
        columns: columnsForMaterialTable,
        data: dataForMaterialReactTable,
        // count: totalItems,
        page: page,
        onChangePage: handlePageChange,
        muiTableBodyRowProps: ({ row }) => ({
            onClick: (event) => {
                console.info('clicked row: ', row);
                setCurModalItem(row.original)
                setShowMasterItemModal(true)
                // setLocalBoxInitial(row.original.box_initial)
                // dispatch(setBoxItemData(row.original.box_items))
                // setShowBoxItemModal(true)
            },
            sx: { cursor: 'pointer', },
        }),
        initialState: {
            density: 'compact',
            pagination: { pageSize: 15,},
            showColumnFilters: false,
            sorting: [
                {
                    id: 'updated_at',
                    desc: true
                }
            ],
        },
        filterFns: {
            // https://www.material-react-table.com/docs/guides/column-filtering
            // https://www.material-react-table.dev/?path=/story/features-filtering-examples--filtering-enabled-default
            customYesNoFilterFn: (row, id, filterValue) => {
                // console.log('filterValue: ', filterValue, ' | row: ', row)   
                let enteredValue = ""; 
                if(filterValue.toLowerCase() === "yes") enteredValue = true;
                else if(filterValue.toLowerCase() === "no") enteredValue = false;
                return row.getValue(id) === enteredValue;
            },
            stringStartsWithFilterFn: (row, id, filterValue) => { 
                if(!row.getValue(id)) return false;
                return String(row.getValue(id)).startsWith(filterValue);
            },
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

    const uploadModalElem = (
        <UploadFileModal 
            showModal={showUploadFileModal}
            setShowModal={setShowUploadFileModal}
        />
    )

    const masterItemModalElem = (
        <MasterItemModal 
            showModal={showMasterItemModal}
            setShowModal={setShowMasterItemModal}
            curModalItem={curModalItem}
        />
    )

    // https://mui.com/material-ui/material-icons/
    const buttonSetElem = (
        <div className="div-for-master-box-items-buttons">
            {/* <Button variant="outlined" size="small"  startIcon={<DownloadIcon />} 
                onClick={exportFileToJSON}>Export (JSON)</Button> */}
            {/* <Button variant="outlined" size="small" color="error" onClick={(e) => deleteMasterBoxItems(e)}>Remove all box items</Button> */}
            <Button variant="outlined" size="small" startIcon={<AddIcon />} 
                onClick={fetchReviewItems}>Review Items</Button>
            <Button variant="outlined" size="small" startIcon={<AddIcon />} 
                onClick={masterItemClickHandler}>Add New Item</Button>
            <Button variant="outlined" size="small" startIcon={<UploadIcon />} disabled
                onClick={setShowUploadFileModal}>Upload New File</Button>
            <Button variant="outlined" size="small" startIcon={<CloudUploadIcon />} disabled
                onClick={uploadJsonToCollection}>Upload to Cloud</Button>
        </div>
    );

    const spinnerElem = spinner && <div style={{ position: 'absolute', top: '45%', left: '50%'}}>
        <SpinnerComp/></div>;

    const errorElem = errorObject && <CustomAlert type="danger" message={errorObject.message} style={{}} duration={5000} />;
    const infoElem = infoMessage && <CustomAlert type="info" message={infoMessage} style={{}} duration={5000} />;

    // const linksElem = (
    //     <div className="link-elem-container" >
    //         <a href="https://pictogrammers.com/library/mdi/">@Mui/Icons</a>{` | `}
    //         {/* <a href="https://github.com/mbrn/material-table">Material-react-table GIT</a>{` | `} */}
    //         <a href="https://www.material-react-table.com/docs/examples/basic">Material-react-table</a>{` | `}
    //         <a href="https://www.material-react-table.dev/?path=/story/prop-playground--default">Material-react-table Storybook</a>{`  `}
    //     </div>
    // )

    const mainBoxElem = (
        <div className="div-for-material-react-box-table">
            <MaterialReactTable table={mtable} />
        </div>
    )
        
    return (<>
        <h3>Master Items Table</h3>
        { uploadModalElem }
        { masterItemModalElem }
        { errorElem }
        { infoElem }
        { buttonSetElem }
        { mainBoxElem }
        {/* { spinnerElem } */}
        {/* { linksElem } */}
        
    </>)
};

export default MasterBoxTable;