import {combineReducers} from "redux";
import homeStore from "./home/homeStore";
import publishStore from "./publish/publishStore";
import detailStore from "./detail/detailStore";
import collectionStore from "./collection/collectionStore";
import publishMineStore from "./publishMine/publishMineStore";

const rootReducer = combineReducers({
  homeStore,
  publishStore,
  detailStore,
  collectionStore,
  publishMineStore
});

export default rootReducer;
