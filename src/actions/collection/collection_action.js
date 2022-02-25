import {collectionConstants} from "../../constants";

export function setAttrValue(payload) {
  return {
    type: collectionConstants["SET_COLLECTION_ATTR_VALUE"],
    payload
  };
}
