import {communicationsConstants} from "../../constants";

export function setCommunicationsAttrValue(payload) {
  return {
    type: communicationsConstants["SET_COMMUNICATIONS_ATTR_VALUE"],
    payload
  };
}
