import {homeConstants} from "../../constants/index";
/**
 * 通过onClick事件来更新current值变化
 * @y尹文楷
 */
export function changeCurrent(payload) {
  return {
    type: homeConstants["CHANGE_CURRENT"],
    payload
  }
}

/**
 * 改变分页码
 * @尹文楷
 * @param payload
 * @returns {{payload: *, type: *}}
 */
export function changePageNum(payload) {
  return {
    type: homeConstants["CHANGE_PAGE_NUM"],
    payload
  }
}

/**
 * 获取宠物交易列表
 * @尹文楷
 * @param payload
 * @returns {{payload: *, type: *}}
 */
export function getPetList(payload) {
  return {
    type: homeConstants["GET_PET_LIST"],
    payload
  }
}

/**
 * 改变滚动加载的AtLoadMore的状态
 * @尹文楷
 * @param payload
 * @returns {{payload: *, type: *}}
 */
export function changeLoadStatus(payload) {
  return {
    type: homeConstants["CHANGE_LOAD_STATUS"],
    payload
  }
}

/**
 * 改变redux store里面的数据状态
 * @尹文楷
 * @param payload
 */
export function setAttrValue(payload) {
  return {
    type: homeConstants["SET_ATTR_VALUE"],
    payload
  }
}
