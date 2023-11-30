import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLoaderStatus, setMasterBoxItems, setBoxesData } from '../../actions/action'
import { convertStringNonUndefinedToNumber, getUniqueId, getRandomTestDate } from '../../utils/helpers'
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import moment from 'moment';
import SpinnerComp from './../common/SpinnerComp';

import 'react-data-grid/lib/styles.css';
import './../../styles/variables.scss';

const AddNewItemModal = (props) => {
  
  const [barcode, setBarcode] = useState('');
  const [brand, setBrand] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [weight, setWeight] = useState({oz: '', lbs: '', g: '' });
  const [price, setPrice] = useState('');
  const [categoryError, setCategoryError] = useState(false);
  const [weightError, setWeightError] = useState(false);
  const [priceError, setPriceError] = useState(false);
  const [validated, setValidated] = useState(false);

  const dispatch = useDispatch()
  const spinner = useSelector(state => state.loading);

  useEffect(() => {
    setCategoryError(validated && category === '');
  }, [category, validated]);
  
  const handleBarcodeChange = (e) => {
    setBarcode(e.target.value)
  }

  const handleBrandChange = (e) => {
    setBrand(e.target.value)
  }

  const handleContentChange = (e) => {
    setContent(e.target.value)
  }

  const handleSelectForCategoryChange = (event) => {
    const value = event.target.value;
    setCategory(value);
  };


  const handleWeightChange = (type) => (event) => {
    const val = event.target.value;
    setWeightError(isNaN(val))
    // setWeight({...weight, [type]: event.target.value});
    
    // console.log('type: ', type, ' | event: ', event.target.value)
    let tempWeight = {...weight }

    switch(type){
      case 'oz':
        tempWeight.oz = val
        tempWeight.lbs = (Number(val) * 0.0625).toFixed(2).toString()
        tempWeight.g = (Number(val) * 28.3495).toFixed(2).toString()
        break;
      case 'lbs':
        tempWeight.oz = (Number(val) * 16).toFixed(2).toString();
        tempWeight.lbs = val;
        tempWeight.g =  (Number(val) * 453.592).toFixed(2).toString();
        break;
      case 'g':
        tempWeight.oz = (Number(val) * 0.035274).toFixed(2).toString()
        tempWeight.lbs = (Number(val) * 0.0022).toFixed(2).toString()
        tempWeight.g = val;
      break;
    }
    setWeight(tempWeight)
  };

  const handlePriceChange = (event) => {
    const value = event.target.value;
    setPriceError(isNaN(value))
    setPrice(value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;

    // let tempDate1 = moment().format('MM/DD/YYYY, h:mm A')
    // let tempDate2 = moment().toISOString() 
    // let tempDate3 = new Date().toISOString()
    // console.log('tempDate1(moment): ', tempDate1)
    // console.log('tempDate2(ISO): ', tempDate2)
    // console.log('tempDate3(newDate.iso): ', tempDate3)

    if (!weight.oz && !weight.lbs && !weight.g) {
      event.stopPropagation();
    } else if (form.checkValidity() === false) {
      event.stopPropagation();
    } else if(category === '') {
      setCategoryError(true);
      event.stopPropagation();
    } else {
      // form 제출 로직
      // dispatch(setLoaderStatus(true));

      const payloadObj = {
        item_id: `master-item-${getUniqueId()}`,
        item_barcode: barcode,
        item_brand: brand,
        item_content: content,
        item_weight_oz: weight.oz,
        item_weight_lbs: weight.lbs,
        item_weight_g: weight.g,
        item_price: price,
        item_category: category, //category.replace(/ /g, ''), // remove spaces ... ??
        is_reviewed: true,
        updated_at: moment().toISOString(),
        // updated_at: new Date().toISOString(), // ???
        // updated_at: moment().format('MM/DD/YYYY, h:mm A') // ???
      }
      console.log('payloadObj: ', payloadObj)

      //# send api call to firestore
      //...
      
      dispatch(setLoaderStatus(false));
      setCategoryError(false);
    }
    setValidated(true);
  };

  const handleClose = () => { 
    props.setShowModal(false);  
  }

  // https://react-bootstrap.netlify.app/docs/forms/validation
  return (<> 
    <Modal size="lg" centered show={props.showModal} onHide={handleClose}>
      <Form noValidate validated={validated} onSubmit={handleSubmit} style={{ marginLeft: 20, marginRight: 20}}>
        <Modal.Header closeButton>
            <Modal.Title>Add a New Master Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="formForBarcode">
            <Form.Label style={{ fontWeight: '700'}}>BARCODE</Form.Label>
            <Form.Control required type="text" placeholder="Enter a barcode" value={barcode} onChange={handleBarcodeChange} />
            <Form.Control.Feedback type="invalid">Barcode should have non-empty strings</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formForBrand">
            <Form.Label style={{ fontWeight: '700'}}>BRAND</Form.Label>
            <Form.Control required type="text" placeholder="Enter a brand" value={brand} onChange={handleBrandChange}/>
            <Form.Control.Feedback type="invalid">Brand should have non-empty strings</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formForContent">
            <Form.Label style={{ fontWeight: '700'}}>CONTENT</Form.Label>
            <Form.Control required type="text" placeholder="Enter a content" value={content} onChange={handleContentChange}/>
            <Form.Control.Feedback type="invalid">Content should have non-empty strings</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formForCategory">
          <Form.Label style={{ fontWeight: '700'}}>CATEGORY</Form.Label>
          <Form.Control as="select" required aria-label="Category select" value={category} onChange={handleSelectForCategoryChange} 
            isInvalid={categoryError} className={categoryError ? 'is-invalid' : ''} >
                <option value="">Please select a category</option>
                <option value="Cans / Glasses">Cans / Glasses (Ex: 캔 음식, 보존 음식류, ...)</option>
                <option value="Clothing / Shoes">Clothing / Shoes (Ex: 의류, 천, 신발류, ...)</option>
                <option value="Diaper / Pads / Etc">Diaper / Pads / Etc (Ex: 기저귀, 패드, 환자용 깔개, ...)</option>
                <option value="Flours">Flours (Ex: 가루로 된 것, 밀가루, 옥수수가루, 녹말가루, ...)</option>
                <option value="Furniture">Furniture (Ex: 의자, 데스크, ...)</option>
                <option value="Grains / Cereals">Grains / Cereals (Ex: 쌀, 콩, 잡곡, 시리얼, ...)</option>
                <option value="Medical Supplies">Medical Supplies (Ex: 의약품, 의료용품, 의료기구, ...)</option>
                <option value="Necessities / Coffee">Necessities / Coffee (Ex: 설탕, 소금, 소스, 양념, 숩, 커피, ...)</option>
                <option value="Others">Others (Ex: 기타용품, 장난감, 우산, ...)</option>
                <option value="Pastas/Noodles">Pastas / Noodles (Ex: 파스타, 스파게티, 라면, 국수, ...)</option>
                <option value="Snacks / Juice">Snacks / Juice (Ex: 쿠키, 초콜렛, 캔디, 쥬스, 음료, ...)</option>
            </Form.Control>
            { categoryError && <div className="invalid-feedback">Please choose a category.</div> }
          </Form.Group>

          <Form.Group className="mb-3" controlId="formForWeight">
            <Form.Label style={{ fontWeight: '700'}}>WEIGHT</Form.Label>
            <Form.Control type="text" placeholder="Enter a weight (oz)" required isInvalid={weightError} 
              value={weight.oz} onChange={handleWeightChange('oz')}/>
            <Form.Control type="text" placeholder="Enter a weight (lbs)" isInvalid={weightError} 
              value={weight.lbs} onChange={handleWeightChange('lbs')}/>
            <Form.Control type="text" placeholder="Enter a weight (g)" isInvalid={weightError} 
              value={weight.g} onChange={handleWeightChange('g')}/>
            { weightError && <div className="invalid-feedback">Weight should be a valid number</div> }
            { validated && weight.oz === '' && <div className="invalid-feedback">Weight should have a non-empty number</div> }
          </Form.Group>
          
          <Form.Group className="mb-3" controlId="formForPrice">
            <Form.Label style={{ fontWeight: '700'}}>PRICE (optional)</Form.Label>
            <Form.Control type="text" placeholder="Enter a price ($)" isInvalid={priceError} 
              value={price} onChange={handlePriceChange}/>
            { priceError && <div className="invalid-feedback">Price should be a valid number</div> }
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" style={{ marginLeft: '10px' }} onClick={(e) => {}}>Clear</Button>
          <Button variant="primary" style={{ marginLeft: '10px' }} type="submit">Submit</Button>
        </Modal.Footer>
      </Form>
    </Modal>
    {spinner && <div style={{ position: 'absolute', top: '40%', left: '50%', zIndex: 2500 }}>
        <SpinnerComp/>
    </div>}
  </>)
}

export default AddNewItemModal;