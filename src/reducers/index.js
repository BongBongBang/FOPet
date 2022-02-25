import {combineReducers} from "redux";
import homeStore from "./home/homeStore";
import medicalAdviceStore from "./medicalAdvice/medicalAdviceStore";
import messageStore from "./message/messageStore";
import userStore from "./user/userStore";
import publishStore from "./publish/publishStore";
import detailStore from "./detail/detailStore";
import collectionStore from "./collection/collectionStore";
import publishMineStore from "./publishMine/publishMineStore";
import attendanceStore from "./attendance/attendanceStore";
import medicalConsultStore from "./medicalConsult/medicalConsultStore";
import communicationsStore from "./communications/communicationsStore";
import diseaseStore from "./disease/diseaseStore";
import flowTopicStore from "./flowTopic/flowTopicStore";
import topicsStore from "./topics/topicsStore";
import findTopicsStore from "./findTopics/findTopicsStore";

const rootReducer = combineReducers({
  homeStore,
  medicalAdviceStore,
  messageStore,
  userStore,
  publishStore,
  detailStore,
  collectionStore,
  publishMineStore,
  attendanceStore,
  communicationsStore,
  medicalConsultStore,
  diseaseStore,
  flowTopicStore,
  topicsStore,
  findTopicsStore
});

export default rootReducer;
