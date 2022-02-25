import {communicationsConstants} from "../../constants";

export function setAttrValue(payload) {
  return {
    type: communicationsConstants["SET_COMMUNICATIONS_ATTR_VALUE"],
    payload
  };
}
