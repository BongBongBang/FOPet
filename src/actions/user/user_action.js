import {userConstants} from "../../constants";

export function setAttrValue(payload) {
  return {
    type: userConstants["SET_USER_ATTR_VALUE"],
    payload
  }
}
