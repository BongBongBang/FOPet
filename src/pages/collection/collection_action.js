import {collectionConstants} from "../../constants";

export function setCollectionAttrValue(payload) {
  return {
    type: collectionConstants["SET_COLLECTION_ATTR_VALUE"],
    payload
  };
}
