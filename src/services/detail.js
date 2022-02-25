import Taro from "@tarojs/taro";
import Tools from "../utils/petPlanetTools";
import {petPlanetPrefix} from "../utils/static";
import prompt from "../constants/prompt";
import {setDetailAttrValue} from "../actions/detail";

/**
 * 对此宠物交易进行收藏
 * @returns {Promise<void>}
 */
function setCollectionRequest() {
  return async (dispatch) => {
    const {detailStore} = this.props;
    const {id} = detailStore;
    return await Tools.request({
      url: `${petPlanetPrefix}/tinyComms/${id}/collect`,
      method: "POST",
      header: {
        "content-type": "application/json",
        "cookie": Taro.getStorageSync("petPlanet")
      },
      data: {},
      success: async (data, header) => {
        await dispatch(setDetailAttrValue({
          collection: prompt["collection"]["collected"]["text"],
          collectionType: prompt["collection"]["collected"]["type"],
          collected: true
        }));
      },
      complete(res) {

      }
    })
  };
}

/**
 * 对此宠物交易进行取消收藏
 * @returns {Promise<void>}
 */
function setNoCollectionRequest() {
  return async (dispatch) => {
    const {detailStore} = this.props;
    const {id} = detailStore;
    return await Tools.request({
      url: `${petPlanetPrefix}/tinyComms/${id}/dispel`,
      method: "DELETE",
      header: {
        "content-type": "application/json",
        "cookie": Taro.getStorageSync("petPlanet")
      },
      data: {},
      success: async (data, header) => {
        await dispatch(setDetailAttrValue({
          collection: prompt["collection"]["noCollected"]["text"],
          collectionType: prompt["collection"]["noCollected"]["type"],
          collected: false
        }));
      },
      complete(res) {

      }
    })
  };
}

const detailAPI = {
  setCollectionRequest,
  setNoCollectionRequest
};

export default detailAPI;
