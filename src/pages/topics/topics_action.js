import {topicsConstants} from "../../constants/index";
/**
 * 改变redux store里面的数据状态
 * @尹文楷
 * @param payload
 */
export function setTopicsAttrValue(payload) {
  return {
    type: topicsConstants["SET_FLOW_TOPICS_ATTR_VALUE"],
    payload
  }
}
