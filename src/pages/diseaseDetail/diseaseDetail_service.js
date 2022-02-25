import Taro from "@tarojs/taro";
import Tools from "../../utils/petPlanetTools";
import {petPlanetPrefix} from "../../utils/static";

/**
 * 加载疾病详情
 */
function getIllnessDetail() {
  const {illnessId} = this.state;
  return Tools.request({
    url: `${petPlanetPrefix}/cnslt/illnesses/${illnessId}`,
    method: "get",
    header: {
      "content-type": "application/json",
      "cookie": Taro.getStorageSync("petPlanet")
    },
    data: {},
    success: (data, header) => {
      this.setState({
        ...data
      });
    },
    fail: (res) => {

    },
    complete: (res) => {
      this.setState({
        loading: false
      });
    }
  });
}

const diseaseDetailAPI = {
  getIllnessDetail
};

export default diseaseDetailAPI;
