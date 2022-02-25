import Taro from "@tarojs/taro";
import {staticData, petPlanetPrefix} from "../utils/static";
import Tools from "../utils/petPlanetTools";

/**
 * 拉取话题列表
 * @returns {*}
 */
function getFlowTopics() {
  const {pageNum} = this.state;
  return (fn) => {
    return Tools.request({
      url: `${petPlanetPrefix}/flow/topics`,
      method: 'get',
      header: {
        'content-type': 'application/json',
        'cookie': Taro.getStorageSync('petPlanet')
      },
      data: {
        pageNum,
        pageSize: staticData.pageSize
      },
      success: data => {
        const {data: _data = [], total = 0} = data || {};
        const {topic} = _data[0] || {};
        this.setState({
          loading: false,
          topicList: _data,
          total,
          topic
        }, () => {
          fn(_data);
        });
      },
      fail(res) {
        return res;
      },
      complete(res) {
        return res;
      }
    });
  }
}

/**
 * 拉取内容流
 * @returns {*}
 */
function getFlowPosts() {
  const {topic, postPageNum} = this.state;
  return (fn) => {
    return Tools.request({
      url: `${petPlanetPrefix}/flow/posts`,
      method: 'get',
      header: {
        'content-type': 'application/json',
        'cookie': Taro.getStorageSync('petPlanet')
      },
      data: {
        pageNum: postPageNum,
        topic,
        pageSize: staticData.pageSize
      },
      success: data => {
        const {data: _data = []} = data || {};
        const {total = 0} = _data;
        this.setState({
          flowPostList: _data,
          postTotal: total
        });
      },
      fail: (res) => {
        return res;
      },
      complete: (res) => {
        return res;
      }
    });
  };
}


const topicsApi = {
  getFlowTopics,
  getFlowPosts
};

export default topicsApi;
