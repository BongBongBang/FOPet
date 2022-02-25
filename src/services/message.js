import Taro from "@tarojs/taro";
import Tools from "../utils/petPlanetTools";
import {petPlanetPrefix, staticData} from "../utils/static";

/**
 * 获取会话页面咨询列表
 * @尹文楷
 */
function cnsltConsultations () {
  return Tools.request({
    url: `${petPlanetPrefix}/cnslt/consultations/v2`,
    method: "get",
    header: {
      "content-type": "application/json",
      "cookie": Taro.getStorageSync("petPlanet")
    },
    data: {},
    success: (data, header) => {
      const {data: _data, total} = data;
      this.setState({
        consultationsList: _data,
        isLoading: false,
        total
      });
    },
    fail: (res) => {

    },
    complete: (res) => {

    }
  });
}

/**
 * 获取会话页面咨询列表,进行分页
 * @尹文楷
 */
function cnsltConsultationsPagination (pageNum) {
  return (fn) => {
    return Tools.request({
      url: `${petPlanetPrefix}/cnslt/consultations/v2`,
      method: "get",
      header: {
        "content-type": "application/json",
        "cookie": Taro.getStorageSync("petPlanet")
      },
      data: {
        pageNum,
        pageSize: staticData.pageSize
      },
      success: (data, header) => {
        fn(data, header);
      },
      fail: (res) => {

      },
      complete: (res) => {

      }
    });
  }
}

const messageAPI = {
  cnsltConsultations,
  cnsltConsultationsPagination
};

export default messageAPI;
