import {findTopicsConstants} from "../../constants/index";
/**
 * 改变redux store里面的数据状态
 * @尹文楷
 * @param payload
 */
export function setFindTopicsAttrValue(payload) {
  return {
    type: findTopicsConstants["SET_FLOW_FIND_TOPICS_ATTR_VALUE"],
    payload
  }
}
