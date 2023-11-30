import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:8080/api', })

// ### Master file #######
export const getMasterBoxItems = () => api.get(`/get-master-box-items`)
export const insertMasterBoxItems = (data) => api.post(`/insert-master-box-items`, data)
export const deleteAllMasterBoxItems = () => api.delete(`/delete-all-master-box-items`)

// ### BOXES #######
export const getAllBoxes = () => api.get(`/get-all-boxes`)
export const insertBox = (data) => api.post(`/insert-box`, data)
export const updateBox = (data) => api.put(`/update-box`, data)


const apis = {
    getMasterBoxItems,
    insertMasterBoxItems,
    deleteAllMasterBoxItems,
    getAllBoxes,
    insertBox,
    updateBox,
}


export default apis