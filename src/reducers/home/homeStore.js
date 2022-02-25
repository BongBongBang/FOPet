import {homeConstants} from "../../constants";
import {staticData} from "../../utils/static";
import Tools from "../../utils/petPlanetTools";
import _ from "lodash";


const defaultState = {
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
  loadStatus: 'more',
  //用于统一处理弹框是否显示
  //@尹文楷
  dialogShowOrHidden: {
    isPublishOpened: false
  },
  //用于登录,将微信与后台服务器绑定,建立会话
  //@尹文楷
  cookie: null,
  //用于统一处理弹框中的数据
  //@尹文楷
  dialogData: {
    publishData: {
      //用来校验用户是否拒绝了获取定位授权请求
      isRefusedModal: false,
      //用来校验用户是否授权获取定位
      isLocationAuthorize: false,
      //用于对于宠物的描述
      content: null,
      //用于上传宠物的图片
      files: [],
      //用于上传的图片
      uploadFilterFiles: [],
      //用于发布接口的图片
      images: [],
      //发布时用于提供定位
      area: "点击定位",
      //用于对于宠物的标题
      title: null,
      //用于对于宠物的价格
      cost: null,
      //是否含有视频
      includeVideo: false,
      //用于对于发起模板消息的formId
      formId: null
    }
  }
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
      })(_.cloneDeep(state), payload);
    default:
      break;
  }
  return state;
}
