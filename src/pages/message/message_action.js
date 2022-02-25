import {messageConstants} from "../../constants";

function setMessageAttrValue(payload) {
  return {
    type: messageConstants["SET_MESSAGE_ATTR_VALUE"],
    payload
  };
}

module.exports = {
  setMessageAttrValue
};
