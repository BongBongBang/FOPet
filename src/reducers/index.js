import {combineReducers} from "redux";
import homeStore from "./home/homeStore";
import userStore from "./user/userStore";
import publishStore from "./publish/publishStore";
import detailStore from "./detail/detailStore";
import collectionStore from "./collection/collectionStore";
import publishMineStore from "./publishMine/publishMineStore";
import attendanceStore from "./attendance/attendanceStore";

const rootReducer = combineReducers({
  homeStore,
  userStore,
  publishStore,
  detailStore,
  collectionStore,
  publishMineStore,
  attendanceStore
});

export default rootReducer;
