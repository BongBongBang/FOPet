import {userConstants} from "../../constants";

export function setUserAttrValue(payload) {
  return {
    type: userConstants["SET_USER_ATTR_VALUE"],
    payload
  }
}
