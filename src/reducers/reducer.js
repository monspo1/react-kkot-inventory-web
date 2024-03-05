/* eslint-disable no-case-declarations */
import { //SET_CURRENT_LOGGEDIN_USER
    SET_LOADER_STATUS, SET_MASTER_BOX_ITEMS, SET_BOXES_DATA, SET_BOX_LABEL_DATA, // SET_BOX_INITIAL,
    SET_MEMBERS_DATA, SET_ERROR_OBJECT, SET_INFO_MESSAGE, SET_BOX_ITEMS_DATA, SET_CUR_USER_ROLE,
} from '../constants/action-types';
// import moment from 'moment';

const initialState = { 
    // curLoggedinUser: null,
    loading: false,
    masterBoxItems: [],
    boxesData: [],
    boxItemsData: [],
    boxLabelData: [],
    boxInitial: '',
    membersData: [],
    errorObject: null,
    infoMessage: "",
    curUserRole: null,
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
            const boxesLocal = action.payload.map(b => {
                let item_sum_count = 0;
                b.box_items.forEach(i => {
                    item_sum_count += Number(i.item_count);
                });
                b.items_count = item_sum_count;
                // console.log(b);
                return b;
            })
            return Object.assign({}, { ...state, 
                boxesData: boxesLocal, //action.payload,
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
            
        case SET_BOX_ITEMS_DATA:
            return Object.assign({}, { ...state, 
                boxItemsData: action.payload,
                loading: false,
            });

        case SET_CUR_USER_ROLE: 
            return Object.assign({}, { ...state, 
                curUserRole: action.payload,
                loading: false,
            });

        // case SET_BOX_INITIAL: 
        //     return Object.assign({}, { ...state, 
        //         boxItemsData: action.payload,
        //         loading: false,
        //     });

        default: 
            return state;
    }
}

export default rootReducer;