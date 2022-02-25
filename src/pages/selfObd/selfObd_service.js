import Taro from "@tarojs/taro";
import Tools from "../../utils/petPlanetTools";
import {petPlanetPrefix} from "../../utils/static";

/**
 * 请求症状自我诊断接口
 */
function getSymptomOptions() {
  return Tools.request({
    url: `${petPlanetPrefix}/cnslt/symptomOptions`,
    method: 'get',
    header: {
      "content-type": "application/json",
      "cookie": Taro.getStorageSync("petPlanet")
    },
    data: {},
    success: (data, header) => {
      this.setState({
        obdList: data
      });
    },
    fail(res) {

    },
    complete(res) {

    }
  });
}

const selfObdAPI = {
  getSymptomOptions
};

export default selfObdAPI;
