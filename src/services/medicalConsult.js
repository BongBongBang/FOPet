import Taro from "@tarojs/taro";
import Tools from "../utils/petPlanetTools";
import {petPlanetPrefix} from "../utils/static";
import {updateAreaList} from "../actions/medicalConsult";

/**
 * 获取咨询的问题领域列表
 * @returns {function(*)}
 */
function homeInfo() {
  return async (dispatch) => {
    return await Tools.request({
      url: `${petPlanetPrefix}/cnslt/cnsltAreas`,
      method: 'get',
      header: {
        "Content-Type": "application/json",
        "cookie": Taro.getStorageSync("petPlanet")
      },
      success: async (data, header) => {
        if (data) {
          data.forEach(area => {
            area.checked = false;
          });
        }
        await dispatch(updateAreaList({areaList: data}));
      },
      fail: res => {
        console.log(res);
      },
      complete: res => {
        console.log(res);
      }
    });
  }
}

const medicalConsultApi = {
  homeInfo
};

export default medicalConsultApi;
