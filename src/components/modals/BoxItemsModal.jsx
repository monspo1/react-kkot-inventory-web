import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLoaderStatus, setBoxItemData, setMasterBoxItems } from '../../actions/action'
import { itemCategoryArr, itemWeightUnitArr, getUniqueId, isWithinOneYear, areArraysEqual } from '../../utils/helpers'
import { MaterialReactTable, useMaterialReactTable,} from 'material-react-table';
// import { columnsForBoxItemsTable } from '../../constants/tableColumns';
import { Box, Button, IconButton, Tooltip, } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Save as SaveIcon, Cancel as CancelIcon } from '@mui/icons-material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import CustomAlert from '../common/CustomAlert'
import moment from 'moment';
import { collection, getDocs, writeBatch, doc, query, where } from "firebase/firestore";
import { getAuth } from 'firebase/auth';
import { db } from '../../utils/firebase'; 
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import TextField from '@material-ui/core/TextField';

import dayjs from 'dayjs';
// import Button from '@mui/material/Button';
// import SpinnerComp from './../common/SpinnerComp';
// import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import dayjs from 'dayjs';
// import 'react-data-grid/lib/styles.css';
import './../../styles/variables.scss';


const BoxItemsModal = (props) => {
  const [boxInitial, setBoxInitial] = useState('')
  const [boxItemsLocal, setBoxItemsLocal] = useState([])
  const [barcodeToLookup, setBarcodeToLookup] = useState('');
  const [boxInitialError, setBoxInitialError] = useState(false);
  const [dateValidationError, setDateValidationError] = useState(false);
  const [infoMessage, setInfoMessage] = useState('')
  const [errMessage, setErrMessage] = useState('')
  const [editingRowDateData, setEditingRowDateData] = useState({});

  const warnMessage = 'The SUBMIT button will be enabled once all required fields are filled out. Plz save your changes. Unsaved data will be lost.'
  // const dispatch = useDispatch()
  const boxItemsData = useSelector(state => state.boxItemsData);
  const auth = getAuth();
  // const spinner = useSelector(state => state.loading);
  
  useEffect(() => {
    // console.log('props', props);
    setBoxInitial(props.boxInitial);
  }, [props])

  // useEffect(() => {
  //   console.log('props.boxInitial: ', props.boxInitial, ' | props.curBox: ', props.curBox)
  //   setBoxInitial(props.boxInitial);
  // }, [props.boxInitial, props.curBox])

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

  useEffect(() => {
    // console.log('dateValidationError: ', dateValidationError)
  }, [dateValidationError])

  useEffect(() => {
    // console.log('boxItemsData: ', boxItemsData)
    const copiedBoxItems = JSON.parse(JSON.stringify(boxItemsData))
    setBoxItemsLocal(copiedBoxItems)
  }, [boxItemsData])

  useEffect(() => {
    // console.log('boxItemsLocal: ', boxItemsLocal)
    // console.log('boxItemsData: ', boxItemsData)
    // console.log('are Equal??: ', areArraysEqual(boxItemsData, boxItemsLocal))
  }, [boxItemsLocal, boxItemsData])

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
    // console.log('row: ', row)
    // console.log('handleSaveRow', values, " | table: ", table)

    // const editedDate = editingRowDateData[row.id]?.item_expiration;

    let tempBoxItems = [...boxItemsLocal];
    tempBoxItems[row.index] = values;
    setBoxItemsLocal(tempBoxItems)
    table.setEditingRow(null);
  }

  const onDeleteRow = (row) => {
    // console.log('onDeleteRow: ', row)
    // console.log('handleSaveRow', values, " | table: ", table)
    let tempBoxItems = [...boxItemsLocal];
    tempBoxItems.splice(row.index, 1);
    setBoxItemsLocal(tempBoxItems)
  }

  const onCopyRow = (row) => {
    // console.log('onCopyRow: ', row)
    let tempBoxItems = [...boxItemsLocal];
    const targetRow = tempBoxItems[row.index];
    tempBoxItems.splice(row.index+1, 0, { ...targetRow, 
      id: `item-${getUniqueId()}`,
      item_id: `item-${getUniqueId()}`,
      item_count: '',
    })
    setBoxItemsLocal(tempBoxItems)
  }

  const newItemBtnClickHandler = () => {
    const newItemObj = {
      barcode: barcodeToLookup, brand: '', content: '', category: '', item_count: '',
      // item_price: '', item_weight_g: '', item_weight_lbs: '', item_weight_oz: '',
      item_price: '', item_weight: '', weight_unit: 'oz', 
      item_expiration: moment().format('MM/DD/YYYY') // item_expiration: dayjs().format('MM/DD/YYYY'), // item_expiration: ''
    }
    const boxItems = [...boxItemsLocal]
    boxItems.push(newItemObj)
    setBoxItemsLocal(boxItems)
    setBarcodeToLookup('');
  }

  const lookupItemByBarcode = async () => { // 71012050505
    const masterItems = collection(db, "master-items");
    const q = query(masterItems, where("barcode", "==", barcodeToLookup));
    const querySnapshot = await getDocs(q);
    let foundItem;
    querySnapshot.forEach((doc) => {
      foundItem = { ...doc.data(), id: doc.id };
    });
    // console.log("received: ", foundItem);

    let newItemObj = null;
    if(foundItem) {
      let weightConverted = 0;
      let weightUnit = '';

      if(foundItem.item_weight_oz) {
        weightConverted = foundItem.item_weight_oz;
        weightUnit = 'oz'
      } else if(foundItem.item_weight_lbs) {
        weightConverted = foundItem.item_weight_lbs
        weightUnit = 'lbs';
      } else if(foundItem.item_weight_g) {
        weightConverted = foundItem.item_weight_g;
        weightUnit = 'g'
      }

      newItemObj = {
        barcode: foundItem.barcode, 
        brand: foundItem.brand, 
        content: foundItem.content, 
        category: foundItem.category, 
        item_count: '', 
        item_price: foundItem.item_price, 
        item_weight: weightConverted,
        weight_unit: weightUnit,
        item_weight_g: foundItem.item_weight_g, 
        item_weight_lbs: foundItem.item_weight_lbs, 
        item_weight_oz: foundItem.item_weight_oz, 
        item_expiration: moment().format('MM/DD/YYYY') 
      }
      setInfoMessage('The item with the barcode exists')
      setErrMessage('')

    } else {
      newItemObj = {
        barcode: barcodeToLookup, brand: '', content: '', category: '', item_count: '',
        item_price: '', item_weight: '', weight_unit: 'oz',
        //item_weight_g: '', item_weight_lbs: '', item_weight_oz: '',
        item_expiration: moment().format('MM/DD/YYYY')
      }
      setInfoMessage('The item with the barcode does NOT exist. Please contact 수녀님 to add a new item to the cloud')
      setErrMessage('')
    }

    const boxItems = [...boxItemsLocal]
    boxItems.push(newItemObj)
    setBoxItemsLocal(boxItems)
    setBarcodeToLookup('');
  }

  const handleClose = () => { 
    setInfoMessage('')
    setErrMessage('')
    setBoxInitial('')
    setBoxInitialError(false);
    setDateValidationError(false);
    setBoxItemsLocal([])
    props.setShowModal(false);
  }

  const handleSubmit = async () => {
    const curBoxId = props.curBox?.box_id ? props.curBox.box_id : `box-${getUniqueId()}`;
    let totalPrice = 0;
    let totalWeightLbs = 0;
    let totalCount = 0;
    
    const newBoxItemsData = boxItemsLocal.map((elem) => {
      totalPrice += !isNaN(elem.item_price) ? Number(elem.item_price) : 0;
      let curWeightLbs = (elem.weight_unit === 'lbs') ? Number(elem.item_weight)
          : (elem.weight_unit === 'oz') ? Number(elem.item_weight) * 0.0625
          : (elem.weight_unit === 'g') ? Number(elem.item_weight) * 0.00220462 : 0;
      totalWeightLbs += curWeightLbs;
      totalCount += Number(elem.item_count);
      return {...elem, 
        box_id: curBoxId,
        item_id: elem.item_id ? elem.item_id : `item-${getUniqueId()}`,
        item_expiration: new Date(elem.item_expiration).toISOString(),
        item_weight_lbs: Number(curWeightLbs).toFixed(2).toString(),
        item_weight_oz: (Number(curWeightLbs) / 0.0625).toFixed(2).toString(),
        item_weight_g: (Number(curWeightLbs) / 0.00220462).toFixed(2).toString(),
      };
    });

    const curUserObj = {
      uid: auth.currentUser.uid,
      email: auth.currentUser.email,
      displayName: auth.currentUser.displayName,
      providerId: auth.currentUser.providerId,
    }

    const boxPayload = {
      box_id: curBoxId,
      box_initial: boxInitial,
      box_creator: curUserObj,
      updated: new Date(),
      items_count: totalCount.toString(),
      items_price: totalPrice.toString(),
      items_weight: Number(totalWeightLbs).toFixed(2).toString(),
    };
    // console.log('boxPayload: ', boxPayload)
    
    // /* 
    const batch = writeBatch(db);
    const boxRef = doc(db, "boxes", boxPayload.box_id); // Create a document reference with box_id

    // Add boxPayload to boxes collection
    batch.set(boxRef, boxPayload);

    // First, delete all existing box items for this box
    const boxItemsCollection = collection(boxRef, "box_items");
    const boxItemsSnapshot = await getDocs(boxItemsCollection);
    boxItemsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // For each item in curBoxItems, add it to box_items collection
    for (let item of newBoxItemsData) {
      const itemRef = doc(collection(boxRef, "box_items"), item.item_id); // Create a document reference with item_id in box_items collection
      batch.set(itemRef, item); // Add item to box_items collection
    }

    // Commit the batch
    try {
      await batch.commit();
      console.log(`Successfully added box ${boxPayload.box_id} and its items to Firestore`);
      setBoxItemsLocal([])
    } catch (err) {
      console.error(`Failed to add box ${boxPayload.box_id} and its items to Firestore: `, err);
    }
    handleClose();
    props.fetchBoxData(); // re-enable!
    //*/
  }
  
  const shouldDisableSubmitBtn = () => {
    const isBoxInvalid = box => {
      const momentDate = moment(box.item_expiration)
      const validLastDate = moment('12/31/2099');
      const tomorrow = moment().add(1, 'days')

      return (box.barcode === '' || box.brand === '' || box.category === '' || box.content === '' || box.item_count === '' 
        || box.item_weight === '' //|| isWithinOneYear(box.item_expiration) //(box.item_expiration !== '' && isWithinOneYear(box.item_expiration))
        || !dayjs(box.item_expiration).isValid() || !momentDate.isBefore(validLastDate) || momentDate.isBefore(tomorrow)
        || isNaN(box.item_count) || isNaN(box.item_weight) || isNaN(box.item_price)
      )
    };
    // return boxInitial === '' || areArraysEqual(boxItemsData, boxItemsLocal) || boxItemsLocal.some(isBoxInvalid);
    const areEqual = areArraysEqual(boxItemsData, boxItemsLocal) 
    const valError = boxItemsLocal.some(isBoxInvalid);
    // console.log('areEqual: ', areEqual, ' | valError: ', valError) //, ' | dateValidationError: ', dateValidationError)
    return boxInitial === '' || areEqual || valError || dateValidationError;
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
    <Form.Group className="mb-3" controlId="formForBarcode" 
      style={{ display: 'flex', width: '100%', alignItems: 'flex-end', marginTop: 20 }}>
      <Form.Label style={{ fontWeight: '700', width: '200px' }}>Barcode: </Form.Label>
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
  const errAlertElem = errMessage && <CustomAlert type="danger" message={errMessage} style={{ marginLeft: 20, marginRight: 20 }}/>;

  errMessage
  const additionalTooltipElem = (
    <div className="additional-tooltip-elem-boxitems-modal">
      <div>
        (1) The columns with<span className="red-asterik-span">*</span> are the required fields.
        (2) Only items with an expiration date more than 1 year from today are accepted. 
        (3) The unit price column is optional
      </div>
      <div>
        (4) The datepicker component accepts the date between 01/01/1900 and 12/31/2099. 
        (5) If any date value is invalid or not after today, the submit button is disabled.
      </div>
    </div>
  );

  const columnsForBoxItemsTable = [
    {
        accessorKey: 'barcode', 
        header: 'Barcode',
        Header: ({column}) => <div>{column.columnDef.header}<span className="red-asterik-span">*</span></div>,
        size: 100,
    },
    {
        accessorKey: 'brand',
        header: 'Brand',
        Header: ({column}) => <div>{column.columnDef.header}<span className="red-asterik-span">*</span></div>,
        size: 100,
    },
    {
        accessorKey: 'content',
        header: 'Content',
        Header: ({column}) => <div>{column.columnDef.header}<span className="red-asterik-span">*</span></div>,
        size: 200,
    },
    {
      accessorKey: 'item_weight',
      header: 'Weight',
      Header: ({column}) => <div>{column.columnDef.header}<span className="red-asterik-span">*</span></div>,
      size: 80,
    },
    {
        accessorKey: 'weight_unit',
        header: 'Weight Unit',
        editVariant: 'select',
        editSelectOptions: itemWeightUnitArr,
        Cell: ({ cell }) =>  cell.getValue(),
        muiEditTextFieldProps: {
          select: true,
        },
        size: 150,
    },
    {
        accessorKey: 'item_price',
        header: 'Unit ($)',
        size: 80,
    },
    {
        accessorKey: 'category',
        header: 'Category',
        editVariant: 'select',
        editSelectOptions: itemCategoryArr,
        Header: ({column}) => <div>{column.columnDef.header}<span className="red-asterik-span">*</span></div>,
        Cell: ({ cell }) =>  cell.getValue(),
        muiEditTextFieldProps: {
          select: true,
        },
        size: 150,
    },
    {
      accessorKey: 'item_expiration',
      header: 'Expiration Date',
      enableEditing: false,
      Cell: ({ cell, row }) => {
          /* Base working
          // const dateValue = dayjs(cell.getValue());
          // return <DatePicker label="" defaultValue={dateValue} slotProps={{ textField: { size: 'small' } }} />
          // */
          const dateValue = dayjs(cell.getValue());
          
          const handleDateChange = (selectedDate) => {
            const momentDate = moment(selectedDate.$d)
            const validLastDate = moment('12/31/2099');
            // console.log('momentDate: ', momentDate.format('MM/DD/YYYY'), ' | validLastDate: ', validLastDate.format('MM/DD/YYYY'))

            if (dayjs(selectedDate).isValid() && momentDate.isBefore(validLastDate) && momentDate.isAfter(moment().format('MM/DD/YYYY'))) {
              // console.log('row.id: ', row.id, ' | date: ', selectedDate.toISOString())
              // setEditingRowDateData({
              //   ...editingRowDateData,
              //   [row.id]: {
              //     ...editingRowDateData[row.id],
              //     item_expiration: selectedDate.toISOString(),
              //   },
              // });
              let tempBoxItems = [...boxItemsLocal];
              let foundIndex = tempBoxItems.findIndex(i => i.id === row.id)
              let foundRow = tempBoxItems[foundIndex];
              foundRow.item_expiration = selectedDate.toISOString();
              tempBoxItems[foundIndex] = foundRow;
              setBoxItemsLocal(tempBoxItems)
              setDateValidationError(false);
            } else {
              setDateValidationError(true)
            }
          };
          return (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label=""
                value={dateValue}
                onChange={handleDateChange}
                slotProps={{ textField: { size: 'small' } }}
              />
            </LocalizationProvider>
          );
      },
    },
    {
        accessorKey: 'item_count',
        header: 'Count',
        Header: ({column}) => <div>{column.columnDef.header}<span className="red-asterik-span">*</span></div>,
        size: 80,
    },
  ];


  const mtable = useMaterialReactTable({ 
    // data: boxItemsData, 
    data: boxItemsLocal, 
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
      pagination: { pageSize: 15, },
    },
    muiTableHeadCellProps: { // globally applicable (individual style should be in the column config)
      sx: {
          // background: '#0dcaf077',
          background: '#eee',
          borderRight: '1px solid rgba(224,224,224,1)',
          color: 'black'
      }
    },
    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: 'flex', gap: '0px' }}>
        <Tooltip title="Edit">
          <IconButton style={{ paddingLeft: 3, paddingRight: 3 }} onClick={() => table.setEditingRow(row)} >
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
    <Modal centered show={props.showModal} onHide={handleClose} id="new-box-modal"
      //dialogClassName="modal-90w" 
      //fullscreen={false} 
      >
      <Modal.Header closeButton>
        <h4>Box Items Table</h4>
      </Modal.Header>
      <Modal.Body>
        { infoAlertElem }
        { errAlertElem }
        { boxInitialFormGroup }
        { buttonSetElem }
        { mainBoxElem }
        { additionalTooltipElem }
      </Modal.Body>
      { warnAlertElem }
      <Modal.Footer>
        <Button variant="danger" style={{ marginLeft: '10px' }} onClick={handleClose}>Cancel</Button>
        <Button variant="primary" type="submit" disabled={shouldDisableSubmitBtn()} 
          style={{ marginLeft: '10px', color: shouldDisableSubmitBtn() ? '#b8b8b8' : 'white',
            backgroundColor: shouldDisableSubmitBtn() ? '#e2e2e2' : '#3e9cfe',
          }} 
          onClick={handleSubmit}>Submit</Button>
      </Modal.Footer> 
    </Modal>
  </>);
}

export default BoxItemsModal;