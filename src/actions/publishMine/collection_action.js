import {publishMineConstants} from "../../constants";

export function setAttrValue(payload) {
  return {
    type: publishMineConstants["SET_PUBLISH_MINE_ATTR_VALUE"],
    payload
  };
}
