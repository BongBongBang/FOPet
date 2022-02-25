import {messageConstants} from "../../constants";

function setAttrValue(payload) {
  return {
    type: messageConstants["SET_MESSAGE_ATTR_VALUE"],
    payload
  };
}

module.exports = {
  setAttrValue
};
