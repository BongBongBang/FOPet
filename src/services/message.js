import Taro from "@tarojs/taro";
import Tools from "../utils/petPlanetTools";
import {petPlanetPrefix} from "../utils/static";

/**
 * 获取会话页面咨询列表
 * @尹文楷
 */
function cnsltConsultations () {
  const that = this;
  return Tools.request({
    url: `${petPlanetPrefix}/cnslt/consultations`,
    method: "get",
    header: {
      "content-type": "application/json",
      "cookie": Taro.getStorageSync("petPlanet")
    },
    data: {},
    success: (data, header) => {
      that.setState({
        consultationsList: data,
        isLoading: false
      });
    },
    fail: (res) => {

    },
    complete: (res) => {

    }
  });
}

const messageAPI = {
  cnsltConsultations
};

export default messageAPI;
