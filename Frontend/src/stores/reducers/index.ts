import { combineReducers } from "redux";

import loginReducer from './loginReducer';
import menuReducer from "./menuReducer";
import translateReducer from './translateReducer';
import { RESET_APP } from "./types/loginTypes";

export const appReducer = combineReducers({
    loginReducer,
    translateReducer,
    menuReducer
})

export const rootReducer = (state:any, action: any) =>{
    if(action.type === RESET_APP){
        state = undefined;
    }
    return appReducer(state, action)
}