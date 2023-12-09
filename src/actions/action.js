// export const SET_CURRENT_LOGGEDIN_USER = 'SET_CURRENT_LOGGEDIN_USER';
export const INCREMENT_PROJECTS_COUNT = 'INCREMENT_PROJECTS_COUNT'
export const SET_LOADER_STATUS = 'SET_LOADER_STATUS'
export const SET_MASTER_BOX_ITEMS = 'SET_MASTER_BOX_ITEMS'
export const SET_BOXES_DATA = 'SET_BOXES_DATA'
export const SET_BOX_LABEL_DATA = 'SET_BOX_LABEL_DATA'
export const SET_MEMBERS_DATA = 'SET_MEMBERS_DATA'
export const SET_ERROR_OBJECT = 'SET_ERROR_OBJECT'
export const SET_INFO_MESSAGE = 'SET_INFO_MESSAGE'

// export function setCurLoggedInUser (payload) {
//     return  { type: SET_CURRENT_LOGGEDIN_USER, payload };
// }

export function setLoaderStatus (payload) {
    return  { type: SET_LOADER_STATUS, payload };
};

export function setMasterBoxItems (payload) {
    return  { type: SET_MASTER_BOX_ITEMS, payload };
};

export function setBoxesData (payload) {
    return  { type: SET_BOXES_DATA, payload };
};

export function setBoxLabelData (payload) {
    return  { type: SET_BOX_LABEL_DATA, payload };
};

export function setMembersData (payload) {
    return  { type: SET_MEMBERS_DATA, payload };
};

export function setErrorObject (payload) {
    return  { type: SET_ERROR_OBJECT, payload };
};

export function setInfoMessage (payload) {
    return  { type: SET_INFO_MESSAGE, payload };
};


