import {combineReducers} from "redux";
import homeStore from "./home/homeStore";

const rootReducer = combineReducers({
  homeStore
});

export default rootReducer;
