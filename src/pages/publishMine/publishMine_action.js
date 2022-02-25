import {publishMineConstants} from "../../constants";

export function setPublishMineAttrValue(payload) {
  return {
    type: publishMineConstants["SET_PUBLISH_MINE_ATTR_VALUE"],
    payload
  };
}
