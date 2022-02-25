import Taro from "@tarojs/taro";
import Tools from "../utils/petPlanetTools";
import {petPlanetPrefix} from "../utils/static";

function medicalAdviceHomeInfo() {
  const that = this;
  return Tools.request({
    url: `${petPlanetPrefix}/cnslt/homeInfo`,
    method: "get",
    header: {
      "Content-Type": "application/json",
      cookie: Taro.getStorageSync("petPlanet")
    },
    data: {},
    success: (data, header) => {
      const {cnsltBanners, dynamicList} = data;
      const {length} = dynamicList;
      length % 2 !== 0 && dynamicList.push(dynamicList[0]);
      that.setState({
        bannerList: cnsltBanners,
        consultingNewsList: dynamicList
      });
    },
    fail: (res) => {

    },
    complete: (res) => {

    }
  });
}

const medicalAdviceAPI = {
  medicalAdviceHomeInfo
};

export default medicalAdviceAPI;
