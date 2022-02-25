import cloneDeep from "lodash.clonedeep";
import {communicationsConstants} from "../../constants";
import Tools from "../../utils/petPlanetTools";

const defaultState = {
  //咨询记录id
  cnsltId: null,
  //回复的目标人openid
  openidTo: null,
  //楼层Id,如果在楼层内进行回复就为楼层的id,如果在楼层外进行回复就为-1
  parentId: -1,
  //医生类型SYSTEM系统分配医生 SPECIFIC指定医生
  cnsltType: null,
  //分配的医生ID
  docId: null,
  //咨询列表
  consultationsList: []
};

export default function communicationsStore(state = defaultState, {type, payload}) {
  switch (type) {
    case communicationsConstants["SET_COMMUNICATIONS_ATTR_VALUE"]:
      return (function multiple(oldState, newState) {
        let stateChange = oldState;
        //用于在不按照state模板的情况下,payload添加属性和属性值的情况下使用
        stateChange = Tools.compare(stateChange, newState);
        for (let [key, value] of Object.entries(stateChange)) {
          //这里严格判断value是否是对象{},不能使用typeof,原因自己查
          if (Object.prototype.toString.call(value) === "[object Object]" && newState[key] !== undefined && newState[key] !== null) {
            stateChange[key] = multiple(value, newState[key]);
          } else {
            if (newState[key] !== undefined && newState[key] !== null) {
              stateChange[key] = newState[key];
            }
            if (newState[key] === null) {
              stateChange[key] = null;
            }
          }
        }
        return stateChange;
      })(cloneDeep(state), payload);
  }
  return state;
}
