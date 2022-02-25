import {attendanceConstants} from "../../constants";

/**
 * 多层处理函数
 * @param payload
 * @returns {{payload: *, type: string}}
 */
const setAttrValue = function (payload) {
  return {
    type: attendanceConstants["SET_ATTENDANCE_ATTR_VALUE"],
    payload
  };
};

/**
 * 初始化签到页面的所有信息
 * @returns {{type: string}}
 */
const clearAttrValue = function () {
  return {
    type: attendanceConstants["CLEAR_ATTENDANCE_ATTR_VALUE"]
  };
};

module.exports = {
  setAttrValue,
  clearAttrValue
};
