import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLoaderStatus, setMasterBoxItems, setBoxesData } from '../../actions/action'
import { convertStringNonUndefinedToNumber, getUniqueId, snakeCaseWord, itemCategoryArr } from '../../utils/helpers'
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
// import moment from 'moment';
import SpinnerComp from './../common/SpinnerComp';
import { MaterialReactTable, useMaterialReactTable,
    // MRT_GlobalFilterTextField, MRT_ToggleFiltersButton, 
} from 'material-react-table';
import { columnsForMasterTable } from './../../constants/tableColumns'
import * as XLSX from 'xlsx';  // working. We can use XLSX.read()
// import api from '../../api/api'
import 'react-data-grid/lib/styles.css';
import './../../styles/variables.scss';

const UploadFileModal = (props) => {

    const [fileName, setFileName] = useState(null);
    // const [tableForNewBoxItems, setTableForNewBoxItems] = useState({})
    const [dataForMaterialReactTable, setDataForMaterialReactTable] = useState([]);
    const [dataForMasterBoxItemsLocal, setDataForMasterBoxItemsLocal] = useState([]);
    const dispatch = useDispatch()
    const spinner = useSelector(state => state.loading);
    const boxItemsMasterModel = useSelector(state => state.boxItemsMasterModel);
    // const materialReactTableData = useMaterialReactTable(tableForNewBoxItems);
    
    const columnsForMaterialTable = useMemo(() => columnsForMasterTable, []);

    useEffect(() => {
        console.log('Updated boxItemsMasterModel: ', boxItemsMasterModel);
    }, [boxItemsMasterModel]);

    useEffect(() => {
        // console.log('spinner: ', spinner);
        // console.log('dataForMaterialReactTable: ', dataForMaterialReactTable)
    }, [spinner, dataForMaterialReactTable]);

    const handleFile = async (e) => {
        // dispatch(setLoaderStatus(true));
        const file = e.target.files[0];
        const data = await file.arrayBuffer();
        setFileName(file.name)

        const workbook = XLSX.read(data);
        // console.log("1. workbook: ", workbook);

        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        // console.log("2. worksheet[0]: ", worksheet);
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { // set the first row
            header: 1, defval: ""
        });
        // const jsonDataForCol = jsonData[0];
        let arrOfObjectsForRow = XLSX.utils.sheet_to_json(worksheet, { headers: 1 });
        const arrlen = arrOfObjectsForRow.length;
        const uploadStart = 16000;
        const uploadEnd = arrlen;
        let barcodeMap = new Map();
        let categoryMap = new Map();
        arrOfObjectsForRow = arrOfObjectsForRow.slice(uploadStart, uploadEnd).map((r, idx) => { 
            const tempBarcodeArr = barcodeMap.get(r.barcode) || [];
            tempBarcodeArr.push(r)
            r.barcode = r.barcode.toString();
            barcodeMap.set(r.barcode, tempBarcodeArr);

            categoryMap.set(r.category, (categoryMap.get(r.category) || 0) + 1);
            r.master_item_id = `master-item-${getUniqueId()}`;

            if(r['unit_oz'] === undefined){
                r['unit_oz'] = (r['unit_lbs'] !== undefined) ? r['unit_lbs'] * 16 : (r['unit_g'] !== undefined) ? r['unit_g'] * 0.035274 : r['unit_g'];
            }
            // console.log('oz: ', r['unit (oz)'], " | lbs: ", r['unit (lbs)'], " | g: ", r['unit (g)']);
            r.item_weight_oz = (r['unit_oz'] === undefined) ? "" : r['unit_oz']; 
            r.item_weight_g = convertStringNonUndefinedToNumber(r, 'unit_g');
            r.item_weight_lbs = convertStringNonUndefinedToNumber(r, 'unit_lbs');
            r.item_price = (r['unit_price'] === undefined) ? "" : r['unit_price'];
            // r.updated_at = getRandomTestDate();
            r.updated_at = new Date().toISOString(),
            r.is_reviewed = true;
            r.review_reason = "";
            delete r['unit_oz'];
            delete r['unit_g'];
            delete r['unit_lbs'];
            delete r['unit_price'];
            return r;
        });
        // console.log("3. jsonDataForCol: ", jsonDataForCol);
        // console.log("4. arrOfObjectsForRow: ", arrOfObjectsForRow);
        // arrOfObjectsForRow.forEach(r => {
        //     r.missingWeight = (r.unitOz === undefined && r.unitLbs === undefined && r.unitG === undefined);
        //     r.isDuplicate = barcodeMap.get(r.barcode) > 1;
        // });
        
        // console.log('barcodeMap: ', barcodeMap)
        barcodeMap.forEach((objArr, barcode) => {
            if(objArr.length > 1) { 
                // console.log('barcode: ', barcode, '=> ', objArr)
                objArr.forEach(obj => { 
                    obj.is_reviewed = false;
                    obj.review_reason = 'duplicated barcode';
                    return obj;
                })
            }
        });

        categoryMap.forEach((count, category) => {
            const index = itemCategoryArr.findIndex(i => i.value === category) 
            console.log('category: ', category, ' | Correct? ', (index === -1) ? "No" : "Yes", ' | Count: ', count)
        })
        // arrOfObjectsForRow.filter(elem => elem.is_reviewed === false)
        // let duplicates = arrOfObjectsForRow.filter(r => r.isDuplicate);
        // console.log(duplicates);

        // arrOfObjectsForRow.forEach(r => {
        //     if(r.isDuplicate === true || r.missingWeight === true){
        //         console.log('oz: ', r)
        //     }
        // })
        
        // setDataForMasterBoxItemsLocal(arrOfObjectsForRow);

        // Temp for storing the correct category
        const tempArrCorrectCategory = [];
        arrOfObjectsForRow.forEach(elem => { 
            //console.log(elem.category) //camelCaseWord
            if(!elem.category) return;
            let category = elem.category;
            if(category.indexOf('/') > -1) {
                category = category.split('/');
                category = category.map(word => snakeCaseWord(word.trim()));
                category = category.join('/');
            } 
            // else if(category.indexOf('-') > -1){
            //     category = category.replace(/[-\s]/g, ' ').split(' ')
            //     category = category.map(word => snakeCaseWord(word.trim()));
            //     category = category.join('')
            // }
            elem.category = category;
            // console.log(category)
            const index = itemCategoryArr.findIndex(i => i.value === category) 
            if(index > -1){
                tempArrCorrectCategory.push(elem)
            } else {
                elem.is_reviewed = false;
                elem.review_reason = "incorrect category";
                tempArrCorrectCategory.push(elem)
            }
        })
        // console.log('tempArrCorrectCategory: ', tempArrCorrectCategory)
        // tempArrCorrectCategory.forEach(i => console.log(i.category))
        setDataForMaterialReactTable(arrOfObjectsForRow.slice(0, 5));
        dispatch(setLoaderStatus(false));
        tempArrCorrectCategory.forEach(i => console.log(i.barcode,  " | ", i.review_reason))
        // setDataForMasterBoxItemsLocal(arrOfObjectsForRow);
        setDataForMasterBoxItemsLocal(tempArrCorrectCategory);
        // TEMP
        // dispatch(setBoxesData(arrOfObjectsForRow))
    }

    
    const handleClose = () => { 
        props.setShowModal(false);
        document.getElementsByClassName("file-upload-input")[0].value = '';
        setFileName(null);
        setDataForMaterialReactTable([]);
        setDataForMasterBoxItemsLocal([]);
    }

    const clearFile = () => {
        setFileName(null);
        document.getElementsByClassName("file-upload-input")[0].value = '';
        setDataForMaterialReactTable([]);
        setDataForMasterBoxItemsLocal([]);
    }
    
    const handleSubmit = async () => { // submit to MongoDB Atlas
        setFileName(null);
        dispatch(setLoaderStatus(false));
        props.setShowModal(false);
        // setDataForMaterialReactTable([]);
        // setDataForMasterBoxItemsLocal([]);
        dispatch(setMasterBoxItems( dataForMasterBoxItemsLocal ));
        handleClose()

        //# Not working (upload is done by clicking Upload to cloud button)
        // await api.insertMasterBoxItems(dataForMasterBoxItemsLocal)
        //     .then(res => {
        //         console.log('uploaded res: ', res)
        //         dispatch(setLoaderStatus(false));
        //     }).catch((error) => { console.log('Error: ', error); })
    }

    const mtable = useMaterialReactTable({
        columns: columnsForMaterialTable,
        data: dataForMaterialReactTable,
    });
    
    return (<>
       <Modal size="xl" centered show={props.showModal} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Master Box Items File Upload</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form.Group controlId="formFile" className="file-upload-form-group">
                <Form.Control type="file" className="file-upload-input" accept=".xls, .xlsx, .xlsb, .csv"
                    onChange={(e) => { dispatch(setLoaderStatus(true)); handleFile(e)} }/>
                </Form.Group>

                <div className="preview-material-react-table-container">
                    <h6>File Preview</h6>
                    {/* <MaterialReactTable columns={columnsForMaterialTable} data={[]} state={{ expanded: true, isLoading: true }}/> */}
                    <MaterialReactTable table={mtable}/>
                </div>  

                <div className="uploaded-content-preview">
                    <div>* Preview of the file content (displaying 5 rows) </div>
                    <div>* Empty columns will be removed in the detailed contents page </div>
                </div>            

            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" style={{ marginLeft: '10px' }} onClick={(e) => clearFile(e)}>Clear</Button>
                <Button variant={dataForMaterialReactTable?.length > 0 ? "primary" : "secondary"} 
                    onClick={handleSubmit} disabled={dataForMaterialReactTable?.length === 0}>
                    Submit
                </Button>
            </Modal.Footer>
        </Modal>
        {spinner && <div style={{ position: 'absolute', top: '40%', left: '50%', zIndex: 2500 }}>
            <SpinnerComp/>
        </div>}
    </>);
}

export default UploadFileModal;