import Taro from "@tarojs/taro";
import Tools from "../utils/petPlanetTools";
import {petPlanetPrefix} from "../utils/static";

/**
 * 查看咨询页详情
 * @尹文楷
 */
function getCommunicationsList() {
  const {communicationsStore: {cnsltId, parentId}} = this.props;
  const {pageNum, pageSize, communicationsList} = this.state;
  const that = this;
  return Tools.request({
    url: `${petPlanetPrefix}/cnslt/consultations/${cnsltId}`,
    method: "get",
    header: {
      "content-type": "application/json",
      cookie: Taro.getStorageSync("petPlanet")
    },
    data: {
      cnsltId,
      parentId,
      pageNum,
      pageSize
    },
    success: (data, header) => {
      const list = data.communications.data,
        total = data.communications.total;
      that.setState(() => {
        return {
          communicationsOS: data,
          total,
          communicationsList: [...communicationsList, ...list]
        }
      });
    },
    fail: (res) => {

    },
    complete: (res) => {

    }
  });
}

/**
 * 咨询回复操作
 * @尹文楷
 */
function postConsultMessage() {
  const {communicationsValue} = this.state;
  const {communicationsStore: {cnsltId, openidTo, parentId}} = this.props;
  const that = this;
  return Tools.request({
    url: `${petPlanetPrefix}/cnslt/communications`,
    method: "post",
    header: {
      "content-type": "application/json",
      "cookie": Taro.getStorageSync("petPlanet")
    },
    data: {
      cnsltId,
      content: communicationsValue,
      openidTo,
      parentId
    },
    success: (data, header) => {
      that.setState({
        communicationsList: [],
        communicationsValue: "",
        pageNum: 1
      }, () => {
        getCommunicationsList.apply(that);
      });
    },
    fail: (res) => {

    },
    complete: (res) => {

    }
  });
}

const communicationsAPI = {
  getCommunicationsList,
  postConsultMessage
};

export default communicationsAPI;
