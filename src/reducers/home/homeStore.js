import {homeConstants} from "../../constants";
import {staticData} from "../../utils/static";
import Tools from "../../utils/petPlanetTools";
import cloneDeep from "lodash.clonedeep";


const defaultState = {
  //宠物交易列表每项的id
  id: 0,
  current: 0,
  pageNum: 1,
  pageSize: staticData["pageSize"],
  //宠物交易列表
  //@尹文楷
  petList: [],
  //当前页的宠物交易列表的数量
  //@尹文楷
  currentPetList: [],
  //组件状态，more 状态显示查看更多按钮，loading 状态显示加载状态，noMore 显示无更多数据
  //@尹文楷
  loadStatus: staticData["loadStatusConfig"]["more"],
  //是否是获取用户登录态信息标识符
  loginSessionStatus: false
};

/**
 * 页面公用的事件全都放在homeStore里面
 * @param state
 * @param type
 * @param payload
 * @returns {{current: null}}
 */
export default function homeStore(state = defaultState, {type, payload}) {
  switch (type) {
    //通过onClick事件来更新current值变化
    case homeConstants["CHANGE_CURRENT"]:
    //改变分页码
    case homeConstants["CHANGE_PAGE_NUM"]:
    //获取宠物交易列表
    case homeConstants["GET_PET_LIST"]:
    //改变滚动加载的AtLoadMore的状态
    case homeConstants["CHANGE_LOAD_STATUS"]:
      return Object.assign({}, state, payload);
    case homeConstants["SET_ATTR_VALUE"]:
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
    default:
      break;
  }
  return state;
}
