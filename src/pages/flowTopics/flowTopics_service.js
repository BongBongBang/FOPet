import Taro from "@tarojs/taro";
import Tools from "../../utils/petPlanetTools";
import {petPlanetPrefix, staticData} from "../../utils/static";

/**
 * 拉取话题列表
 */
function getTopics() {
  let {pageNum} = this.state;
  return Tools.request({
    url: `${petPlanetPrefix}/flow/topics?pageNum=${pageNum}&pageSize=${staticData.pageSize}`,
    method: 'get',
    header: {
      "content-type": "application/json",
      "cookie": Taro.getStorageSync("petPlanet")
    },
    data: {},
    success: data => {
      const {topics = []} = this.state;
      const {data: _data = [], total = 0} = data || {};
      let newTopics = [...topics, ..._data];
      this.setState({
        topics: newTopics,
        pageNum: _data.length > 0 ? ++pageNum : pageNum,
        total: total
      }, () => {
        this.isNextPage = false;
      });
    },
    fail: res => {

    },
    complete: res => {
    }
  });
}

const flowTopicAPI = {
  getTopics
};

export default flowTopicAPI;
