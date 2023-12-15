import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLoaderStatus, setBoxItemData, setMasterBoxItems } from '../../actions/action'
import { itemCategoryArr, getUniqueId, getRandomTestDate } from '../../utils/helpers'
import { MaterialReactTable, useMaterialReactTable,} from 'material-react-table';
import { columnsForBoxItemsTable } from '../../constants/tableColumns';
// import { MenuItem } from '@mui/material';
import { Box, Button, CircularProgress, IconButton, Tooltip, Typography, } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import CustomAlert from '../common/CustomAlert'
import moment from 'moment';
import { collection, getDocs, writeBatch, doc, query, where } from "firebase/firestore";
import { db } from '../../utils/firebase'; 
// import Button from '@mui/material/Button';
// import SpinnerComp from './../common/SpinnerComp';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import dayjs from 'dayjs';
// import 'react-data-grid/lib/styles.css';
import './../../styles/variables.scss';


const BoxItemsModal = (props) => {
  const [boxInitial, setBoxInitial] = useState('')
  const [barcodeToLookup, setBarcodeToLookup] = useState('');
  const [boxInitialError, setBoxInitialError] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [infoMessage, setInfoMessage] = useState('')
  const [errMessage, setErrMessage] = useState('')
  const warnMessage = 'The SUBMIT button will be enabled once all required fields are filled out. Plz save your changes. Unsaved data will be lost.'
  const boxItemsData = useSelector(state => state.boxItemsData);
  const dispatch = useDispatch()
  const spinner = useSelector(state => state.loading);
  
  // const additionalTooltipMessage = ' required columns. '

  // useEffect(() => {
  //   console.log('columnsForBoxItemsTable: ', columnsForBoxItemsTable)
  //   columnsForBoxItemsTable[0].muiEditTextFieldProps = {
  //     error: !validationErrors.barcode,
  //     helperText: validationErrors.barcode,
  //     required: true,
  //     type: 'string',
  //     onChange: (event) => {
  //       const value = event.target.value;
  //       if(!value) {
  //         setValidationErrors((prev) => ({ ...prev, barcode: 'Barcode is required' }));
  //       } else {
  //         delete validationErrors.barcode;
  //         setValidationErrors({ ...validationErrors });
  //       }
  //     }
  //   }
  // }, [])

  // useEffect(() => {
  //   console.log('validationErrors: ', validationErrors)
  // }, [validationErrors])

  useEffect(() => {
    console.log('validationErrors: ', validationErrors)
  }, [validationErrors])

  useEffect(() => {
    console.log('boxItemsData: ', boxItemsData)
  }, [boxItemsData])

  const boxInitialRegex = /^[A-Za-z]{2,3}-[0-9]{1,2}$/;
  const handleBoxInitial = (e) => {
    const receivedTxt = e.target.value
    const upperCaseText = receivedTxt.toUpperCase().replace(/[^A-Z0-9]/g, "");

    // 영문자 2~3개와 숫자 1~2개를 구분합니다.
    const match = upperCaseText.match(/^([A-Z]{2,3})(\d{0,2})$/);

    if (match) {
      // 구분된 부분을 '-'로 연결합니다.
      const newText = `${match[1]}-${match[2]}`;
      setBoxInitial(newText);
      setBoxInitialError(!boxInitialRegex.test(newText));
    } else {
      setBoxInitial(upperCaseText);
      setBoxInitialError(true);
    }
    // setBoxInitial();
    // setBoxInitialError(boxInitial === '')
  }

  const handleBarcodeLookUp = (e) => {
    const barcodeText = e.target.value;
    setBarcodeToLookup(barcodeText)
  }

  // https://www.material-react-table.com/docs/guides/editing
  const handleSaveRow = ({ values, table, row }) => {
    console.log('row: ', row)
    console.log('handleSaveRow', values, " | table: ", table)
    let tempBoxItems = [...boxItemsData];
    tempBoxItems[row.index] = values;
    dispatch(setBoxItemData(tempBoxItems)) // setTableData([...tableData]);
    table.setEditingRow(null);
  }

  const onDeleteRow = (row) => {
    console.log('onDeleteRow: ', row)
    // console.log('handleSaveRow', values, " | table: ", table)
    // openDeleteConfirmModal(row)
    let tempBoxItems = [...boxItemsData];
    tempBoxItems.splice(row.index, 1);
    dispatch(setBoxItemData(tempBoxItems))
  }

  const onCopyRow = (row) => {
    console.log('onCopyRow: ', row)
    let tempBoxItems = [...boxItemsData];
    const targetRow = tempBoxItems[row.index];
    tempBoxItems.splice(row.index+1, 0, targetRow)
    dispatch(setBoxItemData(tempBoxItems))
    // console.log('')
  }

  // const openDeleteConfirmModal = (row) => {
  //   if (window.confirm('Are you sure you want to delete item?')) {
  //     console.log('handleRowDelete', props)
  //     //deleteUser(row.original.id);
  //   }
  // };
  
  const newItemBtnClickHandler = () => {
    const newItemObj = {
      barcode: '', brand: '', content: '', category: '', item_count: '',
      item_price: '', item_weight_g: '', item_weight_lbs: '', item_weight_oz: '',
      expiration: moment().format('MM/DD/YYYY') // expiration: dayjs().format('MM/DD/YYYY'), // expiration: ''
    }
    const boxItems = [...boxItemsData]
    boxItems.push(newItemObj)
    dispatch(setBoxItemData(boxItems))
  }

  const lookupItemByBarcode = async () => { // 71012050505
    const masterItems = collection(db, "master-items");
    const q = query(masterItems, where("barcode", "==", barcodeToLookup));
    const querySnapshot = await getDocs(q);
    let foundItem;
    querySnapshot.forEach((doc) => {
      foundItem = { ...doc.data(), id: doc.id };
    });
    console.log("received: ", foundItem);

    let newItemObj = null;

    if(foundItem) {
      newItemObj = {
        barcode: foundItem.barcode, 
        brand: foundItem.brand, 
        content: foundItem.content, 
        category: foundItem.category, 
        item_count: '', 
        item_price: foundItem.item_price, 
        item_weight_g: foundItem.item_weight_g, 
        item_weight_lbs: foundItem.item_weight_lbs, 
        item_weight_oz: foundItem.item_weight_oz, 
        expiration: moment().format('MM/DD/YYYY') 
      }
      setInfoMessage('The item with the barcode exists')
      setErrMessage('')

    } else {
      newItemObj = {
        barcode: '', brand: '', content: '', category: '', item_count: '',
        item_price: '', item_weight_g: '', item_weight_lbs: '', item_weight_oz: '',
        expiration: moment().format('MM/DD/YYYY')
      }
      setErrMessage('The item with the barcode does NOT exist. Please contact 수녀님 to add a new item to the cloud')
      setInfoMessage('')
    }

    const boxItems = [...boxItemsData]
    boxItems.push(newItemObj)
    dispatch(setBoxItemData(boxItems))
  }

  const handleClose = () => { 
    setInfoMessage('')
    setErrMessage('')
    setBoxInitial('')
    setBoxInitialError(false);
    setValidationErrors({});
    dispatch(setBoxItemData([]));
    props.setShowModal(false);  
  }

  const handleSubmit = async () => {
    const curBoxId = `box-${getUniqueId()}`;
    const curItemId = `item-${getUniqueId()}`;
    let totalPrice = 0;
    let totalWeightLbs = 0;
    let totalCount = 0;
    
    const newBoxItemsData = boxItemsData.map((elem) => {
      totalPrice += !isNaN(elem.item_price) ? Number(elem.item_price) : 0;
      let curWeightLbs = (elem.item_weight_lbs === '' && elem.item_weight_g === '' && elem.item_weight_oz === '' ) ? 0 
        : elem.item_weight_lbs !== '' ? elem.item_weight_lbs
        : elem.item_weight_oz !== '' ? Number(elem.item_weight_oz) * 0.0625
        : elem.item_weight_g !== '' ? Number(elem.item_weight_g) * 0.00220462 : 0;
      totalWeightLbs += curWeightLbs;
      totalCount += Number(item.item_count);
      return {...elem, 
        box_id: curBoxId,
        item_id: curItemId,
        item_expiration: new Date(elem.expiration).toISOString(),
        item_weight_lbs: curWeightLbs.toFixed(2).toString(),
        item_weight_oz: (curWeightLbs / 0.0625).toFixed(2).toString(),
        item_weight_g: (curWeightLbs / 0.0022).toFixed(2).toString(),
      };
    });

    const boxPayload = {
      box_id: curBoxId,
      box_initial: boxInitial,
      updated: new Date(),
      items_count: totalCount.toString(),
      items_price: totalPrice.toString(),
      items_weight: totalWeightLbs.toFixed(2).toString(),
    };

    const batch = writeBatch(db);
    const boxRef = doc(db, "boxes", boxPayload.box_id); // Create a document reference with box_id

    // Add boxPayload to boxes collection
    batch.set(boxRef, boxPayload);

    // For each item in curBoxItems, add it to box_items collection
    for (let item of newBoxItemsData) {
      const itemRef = doc(collection(boxRef, "box_items"), item.item_id); // Create a document reference with item_id in box_items collection
      batch.set(itemRef, item); // Add item to box_items collection
    }

    // Commit the batch
    try {
      await batch.commit();
      console.log(`Successfully added box ${boxPayload.box_id} and its items to Firestore`);
      // navigation.navigate("HomeScreen");
    } catch (err) {
        console.error(`Failed to add box ${boxPayload.box_id} and its items to Firestore: `, err);
    }
    handleClose();
    props.fetchBoxData(); // re-enable!
  }
  
  const shouldDisableSubmitBtn = () => {
    let shouldDisable = boxItemsData.length === 0;
    boxItemsData.forEach(box => {
      shouldDisable = (box.barcode === '' || box.brand === '' || box.category === '' || box.content === ''
        || box.item_count === '' || (box.item_weight_g === '' && box.item_weight_lbs === '' && box.item_weight_oz === ''))
    }) 
    return boxInitial === '' || shouldDisable === true;
  }
  
  const boxInitialFormGroup = (
    <Form.Group className="mb-3" controlId="formForBarcode" 
      style={{ display: 'flex', width: '100%', alignItems: 'baseline', marginTop: 20 }}>
      <Form.Label style={{ fontWeight: '700', width: '200px' }}>Current Box Initial:
        <span style={{ color: 'rgb(176, 5, 5)', fontSize: '20px', verticalAlign: 'middle', marginLeft: '3px' }}>*</span></Form.Label>
      <Form.Control required type="text" placeholder="Enter a box initial Ex. AA-01, HT-23, ... (2 characters - 2 digits)" value={boxInitial} 
        isInvalid={boxInitialError} onChange={handleBoxInitial}/>
      {/* <Form.Control.Feedback type="invalid" style={{ width: '500px', marginLeft: '15px' }}>Box initial should not be empty</Form.Control.Feedback> */}
    </Form.Group>
  )

  const buttonSetElem = (
    // <div className="div-for-master-box-items-buttons">
    //     <Button variant="outlined" size="small" startIcon={<AddCircleOutlineIcon />} 
    //         onClick={newItemBtnClickHandler}>NEW ITEM</Button>
    // </div>
    <Form.Group className="mb-3" controlId="formForBarcode" 
      style={{ display: 'flex', width: '100%', alignItems: 'flex-end', marginTop: 20 }}>
      <Form.Label style={{ fontWeight: '700', width: '305px' }}>Barcode:</Form.Label>
      <Form.Control required type="text" placeholder="Enter a barcode" value={barcodeToLookup} 
        isInvalid={boxInitialError} onChange={handleBarcodeLookUp} style={{}} /> 
      <Button variant="outlined" size="small" startIcon={<SearchIcon />}
        style={{ height: '38px', width: '300px', marginLeft: '15px' }} onClick={lookupItemByBarcode}>LOOKUP & ADD</Button>
        <span style={{ marginLeft: '30px', marginRight: '30px' }}> OR</span>
      <Button variant="outlined" size="small" startIcon={<AddCircleOutlineIcon />} 
        style={{ height: '38px', width: '280px' }} onClick={newItemBtnClickHandler}>ADD MANUALLY</Button>
    </Form.Group>
  );

  const infoAlertElem = infoMessage && <CustomAlert type="info" message={infoMessage} style={{}} />;
  const warnAlertElem = warnMessage && <CustomAlert type="warning" message={warnMessage} style={{ marginLeft: 20, marginRight: 20 }}/>;
  const additionalTooltipElem = (
    <div className="additional-tooltip-elem-boxitems-modal">
      (1) The columns with<span className="red-asterik-span">*</span> are the required ones.
      (2) Only one weight column is required to fill out out of three units (oz, g, lbs). 
      (3) The unit price column is optional
    </div>
  );

  const mtable = useMaterialReactTable({ 
    data: boxItemsData, 
    columns: columnsForBoxItemsTable,
    enableSorting: false,
    enableFilters: false,
    getRowId: (row) => row.id,
    editDisplayMode: 'row', // editDisplayMode: 'table',
    enableRowActions: true,
    enableEditing: true, 
    onEditingRowSave: (e, row) => handleSaveRow(e, row), // for row editing    
    initialState: { 
      density: 'compact',
      pagination: { pageSize: 15 }
    },
    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: 'flex', gap: '0px' }}>
        <Tooltip title="Edit">
          <IconButton style={{ paddingLeft: 3, paddingRight: 3 }} onClick={() => table.setEditingRow(row)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Copy">
          <IconButton style={{ paddingLeft: 3, paddingRight: 3 }} onClick={() => onCopyRow(row)}>
            <ContentCopyIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton style={{ paddingLeft: 3, paddingRight: 3 }} color="error" onClick={() => onDeleteRow(row)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
  });

  const mainBoxElem = (
    <div className="div-for-material-react-box-table">
      <MaterialReactTable table={mtable} />
    </div>
  )
  
  return (<> 
    <Modal fullscreen={true}centered show={props.showModal} onHide={handleClose}>
      <Modal.Header closeButton>
        <h4>Box Items Table</h4>
      </Modal.Header>
      <Modal.Body>
        { infoAlertElem }
        { boxInitialFormGroup }
        { buttonSetElem }
        { mainBoxElem }
        { additionalTooltipElem }
      </Modal.Body>
      { warnAlertElem }
      <Modal.Footer>
        <Button variant="danger" style={{ marginLeft: '10px' }} onClick={handleClose}>Cancel</Button>
        <Button variant="primary" style={{ marginLeft: '10px' }} type="submit" 
          disabled={shouldDisableSubmitBtn()} onClick={handleSubmit}>Submit</Button>
      </Modal.Footer> 
    </Modal>
  </>);
}

export default BoxItemsModal;