import {detailConstants} from "../../constants/index";

/**
 * 改变redux store里面的数据状态
 * @尹文楷
 * @param payload
 */
export function setDetailAttrValue(payload) {
  return {
    type: detailConstants["SET_DETAIL_ATTR_VALUE"],
    payload
  }
}
