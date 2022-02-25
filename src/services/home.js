import Taro from "@tarojs/taro";
import Tools from "../utils/petPlanetTools";
import {petPlanetPrefix, staticData} from "../utils/static";
import {getPetList, changeLoadStatus, setAttrValue, changePageNum} from "../actions/home";

/**
 * 调用接口获取登录凭证（code）。通过凭证进而换取用户登录态信息，包括用户的唯一标识（openid）及本次登录的会话密钥（session_key）等。用户数据的加解密通讯需要依赖会话密钥完成
 * @尹文楷
 */
function getLoginSession(homeInfoHandler) {
  return async (dispatch) => {
    return await Tools.login({
      timeout: 5000,
      success: async (code) => {
        await dispatch(getLoginCookie.apply(this, [code, homeInfoHandler]));
      },
      fail: async (res) => {

      },
      complete: async (res) => {

      }
    });
  };
}

/**
 * 登录,将微信与后台服务器绑定,建立会话
 * @尹文楷
 */
function getLoginCookie(code, homeInfoHandler) {
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
      success: async (data, statusCode, header) => {
        await dispatch(setAttrValue({
          cookie: header["Set-Cookie"]
        }));
        await homeInfoHandler.apply(this, [1]);
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
    const {pageSize, pageNum, petList, cookie} = homeStore;
    const params = {
      pageSize,
      pageNum
    };
    return await Tools.request({
      url: `${petPlanetPrefix}/tinyHome/homeInfo`,
      method: "GET",
      header: {
        "content-type": "application/x-www-form-urlencoded",
        "cookie": cookie
      },
      data: params,
      success: async (data, statusCode, header) => {
        let petList_new = [...petList, ...data.items];
        await dispatch(getPetList({
          petList: petList_new,
          currentPetList: data.items
        }));
        await dispatch(changeLoadStatus({
          loadStatus: data.items.length > 0 ? staticData["loadStatusConfig"]["more"] : staticData["loadStatusConfig"]["noMore"]
        }));
      },
      complete: async (res) => {

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
    const {homeStore} = this.props;
    const {cookie} = homeStore;
    return await Tools.request({
      url: `${petPlanetPrefix}/tinyHome/formId`,
      method: "POST",
      header: {
        "content-type": "application/json",
        "cookie": cookie
      },
      data: {
        formId
      },
      success: async (data, statusCode, header) => {
        await dispatch(setAttrValue({
          dialogData: {
            publishData: {
              formId
            }
          }
        }));
      },
      complete: async (data) => {

      }
    });
  }
}

/**
 * 发布上传图片
 * @尹文楷
 */
function publishImageUploadRequest() {
  return async (dispatch) => {
    const {homeStore} = this.props;
    const {dialogData} = homeStore;
    const {publishData} = dialogData;
    let {files, uploadFilterFiles, images} = publishData;
    for (let [key, value] of uploadFilterFiles.entries()) {
      let uploadTask = await Tools.uploadFile({
        url: `${petPlanetPrefix}/tinyStatics/uploadImg`,
        filePath: value.file.path,
        name: "file",
        success: async (data) => {
          images = [...images, data];
          files = [...files, value];
          await dispatch(setAttrValue({
            dialogData: {
              publishData: {
                files,
                images
              }
            }
          }));
        },
        complete: async (res) => {

        }
      });
    }
  }
}

/**
 * 获取用户授权设置
 * @尹文楷
 */
function getSettingRequest() {
  return async (dispatch) => {
    return await Tools.getSettingConfig({
      success: async (authSetting) => {
        if (authSetting["scope.userLocation"]) {
          await dispatch(chooseLocationRequest());
          await dispatch(setAttrValue({
            dialogData: {
              publishData: {
                isLocationAuthorize: true
              }
            }
          }));
        } else {
          await dispatch(setAttrValue({
            dialogData: {
              publishData: {
                isLocationAuthorize: false,
                area: "点击定位"
              }
            }
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
        await dispatch(setAttrValue({
          dialogData: {
            publishData: {
              isRefusedModal: false
            }
          }
        }));
        if (authSetting["scope.userLocation"]) {
          await dispatch(chooseLocationRequest());
          await dispatch(setAttrValue({
            dialogData: {
              publishData: {
                isLocationAuthorize: true
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
        dispatch(setAttrValue({
          dialogData: {
            publishData: {
              area: address
            }
          }
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
 * 向用户发起授权请求
 * @尹文楷
 */
function authorizeRequest(scope) {
  return async (dispatch) => {
    return await Tools.authorizeConfig({
      scope,
      success: async () => {
        await dispatch(chooseLocationRequest());
        await dispatch(setAttrValue({
          dialogData: {
            publishData: {
              isLocationAuthorize: true
            }
          }
        }));
      },
      fail: async (res) => {
        await dispatch(setAttrValue({
          dialogData: {
            publishData: {
              isRefusedModal: true
            }
          }
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
    const {homeStore} = this.props;
    const {dialogData, cookie} = homeStore;
    const {publishData} = dialogData;
    const {content, images, area, title, cost, includeVideo, formId} = publishData;
    let cover = images[0];
    const params = {
      content,
      images,
      area,
      title,
      cost,
      includeVideo,
      formId,
      cover
    };
    return await Tools.request({
      url: `${petPlanetPrefix}/tinyHome/publishItem`,
      method: "POST",
      header: {
        "content-type": "application/json",
        "cookie": cookie
      },
      data: params,
      success: async (data, statusCode, header) => {
        await dispatch(setAttrValue({
          dialogShowOrHidden: {
            isPublishOpened: false
          },
          dialogData: {
            publishData: {
              content: null,
              files: [],
              uploadFilterFiles: [],
              images: [],
              title: null,
              cost: null,
              formId: null
            }
          }
        }));
        await dispatch(changePageNum({
          petList: []
        }));
        await dispatch(changePageNum({
          pageNum: 1
        }));
        await dispatch(homeInfoRequest.apply(this));
      },
      complete: async (res) => {

      }
    });
  };
}

const homeAPI = {
  homeInfoRequest,
  publishImageUploadRequest,
  getFormIdRequest,
  getSettingRequest,
  authorizeRequest,
  openSettingRequest,
  chooseLocationRequest,
  publishItemRequest,
  getLoginSession,
  getLoginCookie
};

export default homeAPI;
