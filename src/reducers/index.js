import {combineReducers} from "redux";
import homeStore from "./home/homeStore";
import userStore from "./user/userStore";
import publishStore from "./publish/publishStore";
import detailStore from "./detail/detailStore";
import collectionStore from "./collection/collectionStore";
import publishMineStore from "./publishMine/publishMineStore";

const rootReducer = combineReducers({
  homeStore,
  userStore,
  publishStore,
  detailStore,
  collectionStore,
  publishMineStore
});

export default rootReducer;
