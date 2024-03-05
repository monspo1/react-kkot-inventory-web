import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLoaderStatus } from '../../actions/action'
import { getUniqueId } from '../../utils/helpers'
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import moment from 'moment';
import SpinnerComp from '../common/SpinnerComp';
import CustomAlert from '../common/CustomAlert';
import { addDoc, collection } from 'firebase/firestore'; 
import { db } from '../../utils/firebase'; 
import './../../styles/variables.scss';
// import 'react-data-grid/lib/styles.css';

const MasterItemModal = (props) => {
  // console.log('curModalItem', props.curModalItem);

  const [barcode, setBarcode] = useState('');
  const [brand, setBrand] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [weight, setWeight] = useState({oz: '', lbs: '', g: '' });
  const [price, setPrice] = useState('');
  const [alertMsg, setAlertMsg] = useState('')
  const [categoryError, setCategoryError] = useState(false);
  const [weightError, setWeightError] = useState(false);
  const [priceError, setPriceError] = useState(false);
  const [validated, setValidated] = useState(false);
  const dispatch = useDispatch()
  const spinner = useSelector(state => state.loading);

  useEffect(() => {
    if (Object.keys(props.curModalItem).length > 0){
      // console.log('props.curModalItem: ', props.curModalItem)
      setBarcode(props.curModalItem.barcode)
      setBrand(props.curModalItem.brand)
      setContent(props.curModalItem.content)
      setCategory(props.curModalItem.category)
      setWeight({
        oz: props.curModalItem.item_weight_oz,
        lbs: props.curModalItem.item_weight_lbs,
        g: props.curModalItem.item_weight_g,
      });
      setPrice(props.curModalItem.item_price)
      setAlertMsg(props.curModalItem.review_reason)
    }
  }, [props.curModalItem]);

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

  const handleSubmit = async (event) => {
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
    } else { // form 제출 로직
      dispatch(setLoaderStatus(true));

      const payloadObj = {
        barcode: barcode,
        brand: brand,
        category: category, //category.replace(/ /g, ''), // remove spaces ... ??
        content: content,
        is_reviewed: true,
        item_price: price,
        item_weight_g: weight.g,
        item_weight_lbs: weight.lbs,
        item_weight_oz: weight.oz,
        master_item_id: `master-item-${getUniqueId()}`,
        review_reason: "",
        updated_at: moment().toISOString(),
        // updated_at: new Date().toISOString(), // ???
        // updated_at: moment().format('MM/DD/YYYY, h:mm A') // ???
      }
      // console.log('payloadObj: ', payloadObj)

      const masterItemsCollection = collection(db, 'master-items');
      const sameBarcodeQuery = query(masterItemsCollection, where("barcode", "==", barcode));
      const querySnapshot = await getDocs(sameBarcodeQuery);

      let batch = writeBatch(db);
      querySnapshot.forEach((doc) => {
        // if found, delete the document
        const docRef = doc(masterItemsCollection, doc.id);
        batch = deleteDoc(batch, docRef);
      });

      //
      const docRef = doc(masterItemsCollection);
      batch = setDoc(batch, docRef, payloadObj);

      await batch.commit()
        .then(() => {
          console.log("Batch commit succeeded.");
        })
        .catch((error) => {
          console.error("Error adding document: ", error);
        });

      /** 원래의 addDoc() 코드와 제안한 setDoc() 코드의 근본적인 차이점은 다음과 같습니다:
        1. 작업의 원자성: addDoc()는 단일 문서를 추가하는 작업만 수행합니다. 
        반면에 setDoc()는 배치 쓰기의 일부로 사용되며, 이는 여러 개의 Firestore 작업을 한 번의 원자적인 작업으로 그룹화합니다. 
        이런 방식은 모든 작업이 성공하거나 모든 작업이 실패하는 것을 보장하므로, 데이터의 일관성을 유지하는 데 도움이 됩니다.
        2. 문서 ID의 생성: addDoc()는 새로운 문서를 추가할 때 자동으로 고유한 문서 ID를 생성합니다. 
        반면에 setDoc()는 문서 참조(docRef)를 명시적으로 제공해야 하며, 이 참조는 문서의 ID를 포함합니다. 
        이 경우, 문서 ID는 doc() 함수를 호출할 때 자동으로 생성됩니다.
        따라서, 동일한 바코드를 가진 기존 문서를 삭제하고 새 문서를 추가하는 경우에는 setDoc()를 사용하는 것이 더 적합합니다.
       */
      //# (OLD - working) adding a doc to firestore
      // addDoc(collection(db, 'master-items'), payloadObj)
      //   .then((docRef) => {
      //     console.log("Document written with ID: ", docRef.id);
      //   })
      //   .catch((error) => {
      //     console.error("Error adding document: ", error);
      //   });
      
      dispatch(setLoaderStatus(false));
      setCategoryError(false);
    }
    setValidated(true);
    handleClose()
  };

  const handleClose = () => { 
    props.setShowModal(false);  
    setBarcode('');
    setBrand('');
    setContent('');
    setCategory('');
    setWeight({oz: '', lbs: '', g: '' });
    setPrice('');
    setAlertMsg('')
    setCategoryError(false);
    setWeightError(false);
    setPriceError(false);
    setValidated(false);
  }

  const alertElem = alertMsg !== '' && <CustomAlert type="danger" message={alertMsg} />;
    

  // https://react-bootstrap.netlify.app/docs/forms/validation
  return (<> 
    <Modal size="lg" centered show={props.showModal} onHide={handleClose}>
      <Form noValidate validated={validated} onSubmit={handleSubmit} style={{ marginLeft: 20, marginRight: 20}}>
        <Modal.Header closeButton>
            <Modal.Title>Add a New Master Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          { alertElem }
          <Form.Group className="mb-3" controlId="formForBarcode">
            <Form.Label style={{ fontWeight: '700'}}>BARCODE</Form.Label>
            <Form.Control required type="text" placeholder="Enter a barcode" value={barcode} onChange={handleBarcodeChange}/>
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
                <option value="Cans/Glasses">Cans / Glasses (Ex: 캔 음식, 보존 음식류, ...)</option>
                <option value="Clothing/Shoes">Clothing / Shoes (Ex: 의류, 천, 신발류, ...)</option>
                <option value="Diaper/Pads/Etc">Diaper / Pads / Etc (Ex: 기저귀, 패드, 환자용 깔개, ...)</option>
                <option value="Flours">Flours (Ex: 가루로 된 것, 밀가루, 옥수수가루, 녹말가루, ...)</option>
                <option value="Furniture">Furniture (Ex: 의자, 데스크, ...)</option>
                <option value="Grains/Cereals">Grains / Cereals (Ex: 쌀, 콩, 잡곡, 시리얼, ...)</option>
                <option value="Medical-Supplies">Medical Supplies (Ex: 의약품, 의료용품, 의료기구, ...)</option>
                <option value="Necessities/Coffee">Necessities / Coffee (Ex: 설탕, 소금, 소스, 양념, 숩, 커피, ...)</option>
                <option value="Others">Others (Ex: 기타용품, 장난감, 우산, ...)</option>
                <option value="Pastas/Noodles">Pastas / Noodles (Ex: 파스타, 스파게티, 라면, 국수, ...)</option>
                <option value="Snacks/Juice">Snacks / Juice (Ex: 쿠키, 초콜렛, 캔디, 쥬스, 음료, ...)</option>
            </Form.Control>
            { categoryError && <div className="invalid-feedback">Please choose a category.</div> }
          </Form.Group>

          <Form.Group className="mb-3" controlId="formForWeight">
            <Form.Label style={{ fontWeight: '700'}}>WEIGHT</Form.Label>
            <InputGroup>
              <InputGroup.Text style={{ height: '38px', width: '50px'}}>oz</InputGroup.Text>
              <Form.Control type="text" placeholder="Enter a weight (oz)" required isInvalid={weightError} 
                value={weight.oz} onChange={handleWeightChange('oz')} style={{ marginBottom: '5px' }}/>
            </InputGroup>
            <InputGroup>
              <InputGroup.Text style={{ height: '38px', width: '50px'}}>lbs</InputGroup.Text>
              <Form.Control type="text" placeholder="Enter a weight (lbs)" isInvalid={weightError} 
                value={weight.lbs} onChange={handleWeightChange('lbs')} style={{ marginBottom: '5px' }}/>
            </InputGroup>
            <InputGroup>
              <InputGroup.Text style={{ height: '38px', width: '50px'}}>g</InputGroup.Text>
              <Form.Control type="text" placeholder="Enter a weight (g)" isInvalid={weightError} 
              value={weight.g} onChange={handleWeightChange('g')} style={{ marginBottom: '5px' }}/>
            </InputGroup>
            { weightError && <div className="invalid-feedback">Weight should be a valid number</div> }
            { validated && weight.oz === '' && <div className="invalid-feedback">Weight should have a non-empty number</div> }
          </Form.Group>
          
          <Form.Group className="mb-3" controlId="formForPrice">
            <Form.Label style={{ fontWeight: '700'}}>PRICE (optional)</Form.Label>
            <InputGroup>
              <InputGroup.Text style={{ height: '38px', width: '50px'}}>$</InputGroup.Text>
              <Form.Control type="text" placeholder="Enter a price ($)" isInvalid={priceError} 
              value={price} onChange={handlePriceChange}/>
            </InputGroup>
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

export default MasterItemModal;