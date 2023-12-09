import { //SET_CURRENT_LOGGEDIN_USER
    SET_LOADER_STATUS, SET_MASTER_BOX_ITEMS, SET_BOXES_DATA, SET_BOX_LABEL_DATA,
    SET_MEMBERS_DATA, SET_ERROR_OBJECT, SET_INFO_MESSAGE,
} from '../constants/action-types';
// import moment from 'moment';

const initialState = { 
    // curLoggedinUser: null,
    loading: false,
    masterBoxItems: [],
    boxesData: [],
    boxLabelData: [],
    membersData: [],
    errorObject: null,
    infoMessage: "",
}

const rootReducer = (state = initialState, action) => {

    switch (action.type) {
        // case SET_CURRENT_LOGGEDIN_USER: 
        //     return Object.assign({}, { ...state, 
        //         curLoggedinUser: action.payload,
        //         loading: false,
        //     });

        case SET_LOADER_STATUS:
            return Object.assign({}, { ...state, loading: action.payload });

        case SET_MASTER_BOX_ITEMS:
            // console.log('SET_MASTER_BOX_ITEMS: ', action.payload);
            return Object.assign({}, { ...state, 
                masterBoxItems: action.payload,
                loading: false,
            });

        case SET_BOXES_DATA: 
            return Object.assign({}, { ...state, 
                boxesData: action.payload,
                loading: false,
            });

        case SET_BOX_LABEL_DATA:
            return Object.assign({}, { ...state, 
                boxLabelData: action.payload,
                loading: false,
            });

        case SET_MEMBERS_DATA: 
            return Object.assign({}, { ...state, 
                boxesData: action.payload,
                loading: false,
            });
            
        case SET_ERROR_OBJECT: 
            return Object.assign({}, { ...state, 
                errorObject: action.payload,
                loading: false,
            });

        case SET_INFO_MESSAGE: 
            return Object.assign({}, { ...state, 
                infoMessage: action.payload,
                loading: false,
            });

        default: 
            return state;
    }
}

export default rootReducer;