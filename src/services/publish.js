import Taro from "@tarojs/taro";
import Tools from "../utils/petPlanetTools";
import homeAPI from "./home";
import {changePageNum} from "../actions/home";
import {setPublishAttrValue} from "../actions/publish";
import {petPlanetPrefix} from "../utils/static";

/**
 * 发布上传图片
 * @尹文楷
 */
function publishImageUploadRequest() {
  return async (dispatch) => {
    const {publishStore} = this.props;
    let {files, uploadFilterFiles, images} = publishStore;
    for (let [key, value] of uploadFilterFiles.entries()) {
      let uploadTask = await Tools.uploadFile({
        url: `${petPlanetPrefix}/tinyStatics/uploadImg`,
        filePath: value.file.path,
        name: "file",
        success: async (data) => {
          images = [...images, data];
          files = [...files, value];
          await dispatch(setPublishAttrValue({
            files,
            images
          }));
        },
        complete: async (res) => {

        }
      });
    }
  }
}

/**
 * 地理位置逆向编码
 * @尹文楷
 */
function reverseGeocoder(lat, lng) {
  return async (dispatch) => {
    return Tools.request({
      url: `${petPlanetPrefix}/tinyHome/reverseGeocoder`,
      method: "get",
      header: {
        "content-type": "application/x-www-form-urlencoded",
        "cookie": Taro.getStorageSync("petPlanet")
      },
      data: {
        lat,
        lng
      },
      success(data, header) {
        let province = data.province,
          city = data.city,
          district = data.district;
        dispatch(setPublishAttrValue({
          area: `${province} ${city} ${district}`
        }));
      },
      fail(res) {

      },
      complete(res) {

      }
    });
  };
}

/**
 * 获取用户授权设置
 * @尹文楷
 */
function getSettingRequest(scope) {
  return async (dispatch) => {
    return await Tools.getSettingConfig({
      success: async (authSetting) => {
        if (authSetting[scope]) {
          await dispatch(getLocationRequest());
          await dispatch(setPublishAttrValue({
            dialogData: {
              publishData: {
                isLocationAuthorize: true
              }
            }
          }));
        } else {
          await dispatch(setPublishAttrValue({
            isLocationAuthorize: false,
            area: "点击定位"
          }));
        }
      },
      complete: async (res) => {

      }
    });
  };
}

/**
 * 调起客户端小程序设置界面，返回用户设置的操作结果
 * @尹文楷
 */
function openSettingRequest() {
  return async (dispatch) => {
    return Tools.openSettingConfig({
      success: async (authSetting) => {
        await dispatch(setPublishAttrValue({
          isRefusedModal: false
        }));
        if (authSetting["scope.userLocation"]) {
          await dispatch(getLocationRequest());
          await dispatch(setPublishAttrValue({
            isLocationAuthorize: true
          }));
        }
      },
      fail: async (res) => {

      },
      complete: async (res) => {

      }
    });
  }
}

/**
 * 获取用户当前的位置信息
 * @尹文楷
 */
function chooseLocationRequest() {
  return async (dispatch) => {
    return await Tools.chooseLocationConfig({
      success: async (name, address) => {
        dispatch(setPublishAttrValue({
          area: address
        }));
      },
      fail: async (res) => {

      },
      complete: async (res) => {

      }
    });
  }
}

/**
 * 获取当前的地理位置、速度。当用户离开小程序后，此接口无法调用。
 * @尹文楷
 */
function getLocationRequest() {
  return async (dispatch) => {
    return await Tools.getLocationConfig({
      type: "wgs84",
      altitude: false,
      success: async (latitude, longitude) => {
        await dispatch(reverseGeocoder(latitude, longitude));
      },
      fail: async (res) => {

      },
      complete: async (res) => {

      }
    });
  };
}

/**
 * 向用户发起授权请求
 * @尹文楷
 */
function authorizeRequest(scope) {
  return async (dispatch) => {
    return await Tools.authorizeConfig({
      scope,
      success: async () => {
        await dispatch(getLocationRequest());
        await dispatch(setPublishAttrValue({
          isLocationAuthorize: true
        }));
      },
      fail: async (res) => {
        await dispatch(setPublishAttrValue({
          isRefusedModal: true
        }));
      },
      complete: async (res) => {

      }
    });
  }
}

/**
 * 发布宠物交易
 * @returns {function(*): (never|Promise<Taro.request.Promised<any>>|Promise<TaroH5.request.Promised>|*)}
 */
function publishItemRequest() {
  return async (dispatch) => {
    const {publishStore} = this.props;
    const {content, images, area, title, cost, includeVideo, formId, contactInfo, tagCodes} = publishStore;
    let cover = images[0];
    const params = {
      content,
      images,
      area,
      title,
      cost,
      includeVideo,
      formId,
      cover,
      contactInfo,
      tagCodes
    };
    return await Tools.request({
      url: `${petPlanetPrefix}/tinyHome/publishItem`,
      method: "POST",
      header: {
        "content-type": "application/json",
        "cookie": Taro.getStorageSync("petPlanet")
      },
      data: params,
      success: async (data, header) => {
        await dispatch(setPublishAttrValue({
          isLocationAuthorize: false,
          area: "点击定位",
          content: null,
          files: [],
          uploadFilterFiles: [],
          images: [],
          title: null,
          cost: null,
          formId: null,
          contactInfo: null
        }));
        await Taro.navigateBack({
          delta: Taro.getCurrentPages().length
        });
        await dispatch(changePageNum({
          petList: []
        }));
        await dispatch(changePageNum({
          pageNum: 1
        }));
        await dispatch(homeAPI.homeInfoRequest.apply(this));
      },
      complete: async (res) => {

      }
    });
  };
}

const publishAPI = {
  publishImageUploadRequest,
  getSettingRequest,
  openSettingRequest,
  authorizeRequest,
  publishItemRequest
};

export default publishAPI;
