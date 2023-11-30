import { 
    SET_LOADER_STATUS, SET_MASTER_BOX_ITEMS, SET_BOXES_DATA, SET_MEMBERS_DATA, //SET_CURRENT_LOGGEDIN_USER
} from '../constants/action-types';
// import moment from 'moment';

const initialState = { 
    loading: false,
    masterBoxItems: [],
    boxesData: [],
    membersData: [],
    // curLoggedinUser: null,
}

const rootReducer = (state = initialState, action) => {

    switch (action.type) {
        
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

        case SET_MEMBERS_DATA: 
            return Object.assign({}, { ...state, 
                boxesData: action.payload,
                loading: false,
            });
            
        // case SET_CURRENT_LOGGEDIN_USER: 
        //     return Object.assign({}, { ...state, 
        //         curLoggedinUser: action.payload,
        //         loading: false,
        //     });

        default: 
            return state;
    }
}

export default rootReducer;