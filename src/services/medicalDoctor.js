import Taro from "@tarojs/taro";
import Tools from "../utils/petPlanetTools";
import {petPlanetPrefix, pageCurrentList} from "../utils/static";
import {setMedicalConsultAttrValue} from "../actions/medicalConsult";
import {setPublishAttrValue} from "../actions/publish";

/**
 * 拉取宠物医生列表
 */
function homeInfo() {
  const that = this;
  return Tools.request({
    url: `${petPlanetPrefix}/cnslt/doctors`,
    success: (data, header) => {
      if (data) {
        data.forEach(doctor => {
          doctor.checked = false;
        });
        that.setState({
          doctors: data
        });
      }
    },
    fail: res => {

    },
    complete: res => {
    }
  });
}

/**
 * 进行咨询～
 * @param payload
 */
function consult(payload) {
  return Tools.request({
    url: `${petPlanetPrefix}/cnslt/consult`,
    method: 'post',
    data: payload,
    header: {
      "content-type": "application/json",
      "cookie": Taro.getStorageSync("petPlanet")
    },
    success: (data, header) => {
      if (data) {
        //清除应用内所有的页面,然后跳转到结果页
        Taro.reLaunch({
          url: pageCurrentList[13]
        });
      }
    },
    fail: res => {

    },
    complete: res => {
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

const medicalDoctorApi = {
  homeInfo,
  consult,
  getFormIdRequest
};

export default medicalDoctorApi;
