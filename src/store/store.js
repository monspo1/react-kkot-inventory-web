import { configureStore, compose } from '@reduxjs/toolkit';
import rootReducer from '../reducers/reducer'
import { mainMiddleware } from '../middleware/middleware.js'
import thunk from "redux-thunk";

/* storeEnhancers는 Redux DevTools를 사용하기 위한 설정입니다. Redux 개발자 도구는 
   Redux 애플리케이션의 상태 변화를 모니터링하고 디버깅하는 데 도움을 주는 도구입니다 
   window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose는 Redux 개발자 도구를 활성화하기 위해 사용됩니다. 
*/
const storeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
  
/* 
- applyMiddleware는 mainMiddleware와 thunk 미들웨어를 적용하기 위해 사용됩니다. 
  mainMiddleware는 커스텀 미들웨어이며, thunk는 비동기 작업을 처리하기 위한 Redux 미들웨어입니다.
*/
const store = configureStore({
    reducer: rootReducer,
    middleware: [thunk, mainMiddleware],
    enhancers: [storeEnhancers] 
});
  
export default store;