import publishConstants from "../../constants/publish";

export function setPublishAttrValue(payload) {
  return {
    type: publishConstants["SET_PUBLISH_ATTR_VALUE"],
    payload
  }
}
