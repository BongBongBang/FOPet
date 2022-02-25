import Taro from "@tarojs/taro";
import qs from '../../node_modules/querystring';
import Tools from "../utils/petPlanetTools";
import {petPlanetPrefix, staticData} from "../utils/static";
import {setAttendanceAttrValue} from "../actions/attendance";

/**
 * 向用户发起用户信息权限申请
 * @param scope
 * @returns {Function}
 */
const getSettingRequest = (scope) => {
  return async (dispatch) => {
    return Tools.getSettingConfig({
      success(authSetting) {
        return authSetting;
      },
      fail(res) {

      },
      complete(res) {

      }
    });
  };
};

/**
 * 获取个人页随机的头像和昵称
 * @尹文楷
 * @returns {Function}
 */
function userTinyHomeInfoRequest() {
  return async (dispatch) => {
    return await Tools.request({
      url: `${petPlanetPrefix}/users/tinyHomeInfo`,
      method: "get",
      header: {
        "content-type": "application/x-www-form-urlencoded",
        "cookie": Taro.getStorageSync("petPlanet")
      },
      data: qs.stringify({}),
      success: async (data, header) => {
        await dispatch(setAttendanceAttrValue({
          nickName: data["nickName"],
          avatar: data["avatarUrl"]
        }));
      },
      complete: async (response) => {

      }
    });
  }
}

/**
 * 同步微信用户授权后的用户信息
 * @尹文楷
 */
function syncUserInfoRequest(params) {
  return (dispatch) => {
    return Tools.request({
      url: `${petPlanetPrefix}/users/syncUserInfo`,
      method: "post",
      header: {
        "content-type": "application/x-www-form-urlencoded",
        "cookie": Taro.getStorageSync("petPlanet")
      },
      data: qs.stringify(params),
      success: async (data, header) => {
        dispatch(userTinyHomeInfoRequest.apply(this));
      },
      fail: async (res) => {

      },
      complete: async (res) => {

      }
    });
  };
}

/**
 * 在页面入口处同步微信用户授权后的用户信息
 * @尹文楷
 */
function syncUserInfoPassRequest(params) {
  return (dispatch) => {
    return Tools.request({
      url: `${petPlanetPrefix}/users/syncUserInfo`,
      method: "post",
      header: {
        "content-type": "application/x-www-form-urlencoded",
        "cookie": Taro.getStorageSync("petPlanet")
      },
      data: qs.stringify(params),
      success: async (data, header) => {
      },
      fail: async (res) => {
      },
      complete: async (res) => {
      }
    });
  };
}

/**
 * 在用户授权之后获取用户个人信息
 * @returns {function(*)}
 */
function getUserInfoConfigRequest() {
  return (dispatch) => {
    return Tools.getUserInfoConfig({
      withCredentials: true,
      lang: "zh_CN",
      success: async (userInfo) => {
        return userInfo;
      },
      fail: async (res) => {
      },
      complete: async (res) => {
      }
    });
  }
}

/**
 * 进行签到
 * @param params
 * @returns {Promise<void>}
 */
function communitySignRequest() {
  return (dispatch) => {
    let that = this;
    let {attendanceStore: {openGid}} = this.props;
    return Tools.request({
      url: `${petPlanetPrefix}/community/sign`,
      method: "post",
      data: JSON.stringify({
        opengid: openGid
      }),
      header: {
        "Content-Type": "application/json",
        "cookie": Taro.getStorageSync("petPlanet")
      },
      success: async (data, header) => {
        const {success, remarks} = data;
        if (success) {
          //多层处理函数
          await dispatch(setAttendanceAttrValue({
            signObject: null,
            signList: [],
            signObjectType: [],
            isSignedClick: false
          }));
          //获取用户签到信息
          let {data: {signed}} = await dispatch(communityHomeInfoRequest.apply(that));
          //获取群动态列表
          await dispatch(communityGroupLogsRequest.apply(that, [{
            pageNum: 1,
            pageSize: staticData["pageSize"]
          }]));
          if (signed) {
            that.scaleAnimate.normal(that);
            clearInterval(that.animateTimer);
          }
        } else {
          dispatch(setAttendanceAttrValue({
            isSignedClick: false,
            modal: {
              sign: {
                isSigned: true,
                data: {
                  remarks
                }
              }
            }
          }));
        }
      },
      fail: async (res) => {

      },
      complete: async (res) => {

      }
    });
  };
}

/**
 * 按照时间分组获取群签到动态信息
 * @param params
 * @returns {Promise<AxiosResponse<any> | *>}
 */
function communityGroupLogsRequest(params) {
  return (dispatch) => {
    let {attendanceStore: {openGid, signObject, signList, signObjectType}} = this.props;
    return Tools.request({
      url: `${petPlanetPrefix}/community/searchNewGroupLogs`,
      method: "post",
      data: JSON.stringify({
        ...params,
        opengid: openGid
      }),
      header: {
        "Content-Type": "application/json",
        "cookie": Taro.getStorageSync("petPlanet")
      },
      success: async (data, header) => {
        let {pageNum} = params;
        let _sign = data.data,
          _signList = [],
          total = data.total,
          _signObject = signObject ? signObject : {};
        /**
         * 分两组处理业务,第一组signObject用于按照时间分组排序显示群签到动态信息
         * 第二组signList用于分页加载群签到动态列表信息
         */
        let signSort = Object.entries(_sign);
        signSort.sort((a, b) => {
          return (+new Date(b[0])) - (+new Date(a[0]));
        });
        for (let [sign_key, sign_value] of signSort) {
          let isSignEmpty = Tools.isEmpty(_signObject);
          if (_signObject[sign_key]) {
            _signObject[sign_key] = [..._signObject[sign_key], ...sign_value];
          } else {
            _signObject[sign_key] = [..._sign[sign_key]];
            signObjectType.push((pageNum === 1 && isSignEmpty) ? "signing" : "signed");
          }
          _signList = [..._signList, ...sign_value];
        }
        dispatch(setAttendanceAttrValue({
          signObject: _signObject,
          signObjectType,
          pageNum,
          total,
          throttle: true,
          signList: [...signList, ..._signList]
        }));
      },
      fail: async (res) => {

      },
      complete: async (res) => {
        dispatch(setAttendanceAttrValue({
          isLoading: false
        }));
      }
    });
  };
}

/**
 * 获取用户签到信息
 * @param params
 * @returns {function(*)}
 */
function communityHomeInfoRequest() {
  const {attendanceStore: {openGid}} = this.props;
  return (dispatch) => {
    return Tools.request({
      url: `${petPlanetPrefix}/community/homeInfo`,
      method: "post",
      data: JSON.stringify({
        opengid: openGid
      }),
      header: {
        "Content-Type": "application/json",
        "cookie": Taro.getStorageSync("petPlanet")
      },
      success: async (data, header) => {
        let {signed} = data;
        await dispatch(setAttendanceAttrValue({
          accordion: {
            ...data
          }
        }));
        return signed;
      },
      fail: async (res) => {

      },
      complete: async (res) => {

      }
    });
  };
}

export default {
  getSettingRequest,
  getUserInfoConfigRequest,
  syncUserInfoRequest,
  syncUserInfoPassRequest,
  userTinyHomeInfoRequest,
  communitySignRequest,
  communityGroupLogsRequest,
  communityHomeInfoRequest
};
