import Taro from "@tarojs/taro";
import Tools from "../utils/petPlanetTools";
import {petPlanetPrefix} from "../utils/static";

/**
 * 查看咨询页详情
 * @尹文楷
 */
function getCommunicationsList() {
  const {communicationsStore: {cnsltId, parentId}} = this.props;
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
      parentId
    },
    success: data => {
      const list = data.communications.data,
        total = data.communications.total;
      that.setState(() => {
        return {
          communicationsOS: data,
          total,
          communicationsList: list
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
 * 查看咨询页分页详情
 * @尹文楷
 */
function getCommunicationsPaginationList() {
  const {communicationsStore: {cnsltId, parentId}} = this.props;
  let{pageNum, pageSize, communicationsList} = this.state;
  return Tools.request({
    url: `${petPlanetPrefix}/cnslt/communications`,
    method: "get",
    header: {
      "content-type": "application/json",
      cookie: Taro.getStorageSync("petPlanet")
    },
    data: {
      cnsltId,
      parentId,
      pageNum: ++pageNum,
      pageSize
    },
    success: data => {
      const list = data.data,
        total = data.total;
      this.setState({
        total,
        pageNum: (!list || list.length === 0) ? --pageNum : pageNum,
        communicationsList: [...communicationsList, ...list]
      }, () => {
        this.isPageNext = true;
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

/**
 * formId收集
 * @尹文楷
 * @param formId
 */
function getFormIdRequest(formId) {
  return Tools.request({
    url: `${petPlanetPrefix}/tinyHome/formId`,
    method: "POST",
    header: {
      "content-type": "application/json",
      "cookie": Taro.getStorageSync("petPlanet")
    },
    data: {
      formId
    },
    success: async (data, header) => {

    },
    complete: async (data) => {

    }
  });
}

const communicationsAPI = {
  getCommunicationsList,
  getCommunicationsPaginationList,
  postConsultMessage,
  getFormIdRequest
};

export default communicationsAPI;
