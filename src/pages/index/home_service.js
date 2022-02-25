import Taro from "@tarojs/taro";
import Tools from "../../utils/petPlanetTools";
import {petPlanetPrefix, staticData, petPlanet_version} from "../../utils/static";
import {getPetList, changeLoadStatus, setAttrValue} from './home_action';
import {setPublishAttrValue} from "../publish/publish_action";
import {setDetailAttrValue} from "../detail/detail_action";
import constants from "../../constants/collection";

/**
 * 调用接口获取登录凭证（code）。通过凭证进而换取用户登录态信息，包括用户的唯一标识（openid）及本次登录的会话密钥（session_key）等。用户数据的加解密通讯需要依赖会话密钥完成
 * @尹文楷
 */
function getLoginSession() {
  return async (dispatch) => {
    return await Tools.login({
      timeout: 5000,
      success: async (code) => {
        return code;
      },
      fail: async (res) => {

      },
      complete: async (res) => {

      }
    });
  };
}

/**
 * 获取用户OpenId
 * @尹文楷
 */
function getUserOpenId(gio_result) {
  return async (dispatch) => {
    return await Tools.request({
      url: `${petPlanetPrefix}/users/openid`,
      method: "get",
      header: {
        "content-type": "application/json",
        "cookie": Taro.getStorageSync("petPlanet")
      },
      success: async (data, header) => {
        await gio_result.call(this, data, header);
      },
      complete(res) {

      }
    });
  };
}

/**
 * 登录,将微信与后台服务器绑定,建立会话
 * @尹文楷
 */
function getLoginCookie(code) {
  return async (dispatch) => {
    return await Tools.request({
      url: `${petPlanetPrefix}/tinySession/login`,
      method: "GET",
      header: {
        "content-type": "application/json"
      },
      data: {
        code
      },
      success: async (data, header) => {
        await Taro.setStorageSync("petPlanet", header["Set-Cookie"]);
        await dispatch(getUserOpenId.call(this, function (data, header) {

        }));
        await dispatch(setAttrValue({
          loginSessionStatus: false
        }));
      },
      fail: async (res) => {

      },
      complete: async (res) => {

      }
    });
  };
}

/**
 * 获取卖家想要交易售卖的宠物列表
 * @returns {function(*): (never|Promise<Taro.request.Promised<any>>|Promise<TaroH5.request.Promised>|*)}
 */
function homeInfoRequest() {
  return async (dispatch) => {
    const {homeStore} = this.props;
    const {current: commType} = this.state;
    const {pageSize, pageNum, petList} = homeStore;
    const params = {
      pageSize,
      pageNum,
      commType
    };
    return await Tools.request({
      url: `${petPlanetPrefix}/tinyHome/homeInfo`,
      method: "GET",
      header: {
        "content-type": "application/x-www-form-urlencoded",
        "cookie": Taro.getStorageSync("petPlanet")
      },
      data: params,
      success: async (data, header) => {
        let _petList = pageNum === 1 ? [] : petList;
        let petList_new = [..._petList, ...data.items];
        await dispatch(getPetList({
          petList: petList_new,
          currentPetList: data.items
        }));
        await dispatch(changeLoadStatus({
          loadStatus: (data.items.length > 0 && data.items.length === staticData["pageSize"]) ?
            staticData["loadStatusConfig"]["more"] : staticData["loadStatusConfig"]["noMore"]
        }));
      },
      complete: async (res) => {
        this.setState({
          loading: false
        });
      }
    });
  };
}

/**
 * formId收集
 * @尹文楷
 * @param formId
 */
function getFormIdRequest(formId) {
  return async (dispatch) => {
    return await Tools.request({
      url: `${petPlanetPrefix}/tinyHome/formId`,
      method: "POST",
      header: {
        "content-type": "application/json",
        "cookie": Taro.getStorageSync("petPlanet")
      },
      data: {
        formId
      },
      success: async (data, header) => {
        dispatch(setPublishAttrValue({
          content: null,
          files: [],
          uploadFilterFiles: [],
          images: [],
          isLocationAuthorize: false,
          area: "添加地点",
          title: null,
          cost: null,
          formId: formId,
          contactInfo: null
        }));
      },
      complete: async (data) => {
      }
    });
  }
}

/**
 * 获取宠物发布之后的内容详情
 * @returns {function(*): (never|Promise<Taro.request.Promised<any>>|Promise<TaroH5.request.Promised>|*)}
 */
function getPetDetailRequest(id, avatarUrl, nickName) {
  return async (dispatch) => {
    return await Tools.request({
      url: `${petPlanetPrefix}/tinyComms/${id}`,
      method: "GET",
      header: {
        "content-type": "application/json",
        "cookie": Taro.getStorageSync("petPlanet")
      },
      success: async (data, header) => {
        const {title, cost, content, area, contactInfo, includeVideo, wantCount, imgList, collected, tags} = data;
        await dispatch(setDetailAttrValue({
          id,
          avatarUrl,
          nickName,
          title,
          cost,
          content,
          area,
          contactInfo,
          images: imgList,
          includeVideo,
          collected,
          collection: collected ? constants.collected.text : constants.noCollected.text,
          collectionType: collected ? constants.collected.type : constants.noCollected.type,
          wantCount,
          tags
        }));
      },
      complete: async (res) => {

      }
    });
  };
}

/**
 * 检查小程序版本更新的情况
 * @尹文楷
 */
function checkVersionRequest() {
  return Tools.request({
    url: `${petPlanetPrefix}/tinySystem/checkVersion`,
    method: "get",
    header: {
      "content-type": "application/x-www-form-urlencoded",
      "cookie": Taro.getStorageSync("petPlanet")
    },
    data: {
      version: petPlanet_version
    },
    success: (data, header) => {
      if (data) {
        let forceUpdate = data.forceUpdate;
        Tools.updateManagerConfig(forceUpdate);
      }
    },
    fail: (res) => {

    },
    complete: (res) => {

    }
  });
}

/**
 * 获取TabBar隐含消息tab信息
 */
function getTabBarInfoRequest() {
  return Tools.request({
    url: `${petPlanetPrefix}/tinyHome/tabBarInfo`,
    method: 'get',
    header: {
      'content-type': 'application/json',
      'cookie': Taro.getStorageSync("petPlanet")
    },
    data: {},
    success(data, header) {
    },
    fail(res) {

    },
    complete(res) {

    }
  });
}

/**
 * 获取底部TabBar的配置
 */
function getTabBarConfigRequest() {
  return Tools.request({
    url: `${petPlanetPrefix}/tinyHome/tabBarConfig`,
    method: 'get',
    header: {
      'content-type': 'application/json',
      'cookie': Taro.getStorageSync("petPlanet")
    },
    data: {
      version: petPlanet_version
    },
    success(data, header) {

    },
    fail(res) {

    },
    complete(res) {

    }
  });
}

const homeAPI = {
  homeInfoRequest,
  getFormIdRequest,
  getLoginSession,
  getLoginCookie,
  getPetDetailRequest,
  getUserOpenId,
  checkVersionRequest,
  getTabBarInfoRequest,
  getTabBarConfigRequest
};

export default homeAPI;
