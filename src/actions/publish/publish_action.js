import publishConstants from "../../constants/publish";

export function setAttrValue(payload) {
  return {
    type: publishConstants["SET_PUBLISH_ATTR_VALUE"],
    payload
  }
}
