import Taro from '@tarojs/taro';
import Tools from '../../../utils/petPlanetTools';
import {pageCurrentList} from '../../../constants';

/**
 * 拉取宠物医生列表
 */
function homeInfo() {
  const that = this;
  return Tools.request({
    url: 'cnslt/doctors',
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
    url: 'cnslt/consult',
    method: 'post',
    data: payload,
    success: (data, header) => {
      if (data) {
        //清除应用内所有的页面,然后跳转到结果页
        Taro.reLaunch({
          url: pageCurrentList[14]
        });
      }
    },
    fail: res => {

    },
    complete: res => {
    }
  });
}

const medicalDoctorAPI = {
  homeInfo,
  consult
};

export default medicalDoctorAPI;
