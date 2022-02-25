import Taro from "@tarojs/taro";
import qs from "../../../node_modules/querystring";
import Tools from "../../utils/petPlanetTools";
import {petPlanetPrefix} from "../../utils/static";
import {setUserAttrValue} from "./user_action";

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
      data: {},
      success: async (data, header) => {
        const {nickName = '', hasMessage = false, avatarUrl = null} = data || {};
        await dispatch(setUserAttrValue({
          nickName: nickName,
          hasMessage: hasMessage,
          avatar: avatarUrl
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
        await dispatch(userTinyHomeInfoRequest.apply(this));
      },
      fail: async (res) => {

      },
      complete: async (res) => {

      }
    });
  };
}

const userAPI = {
  userTinyHomeInfoRequest,
  syncUserInfoRequest
};

export default userAPI;
