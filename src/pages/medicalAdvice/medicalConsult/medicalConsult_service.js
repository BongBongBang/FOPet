import Tools from '../../../utils/petPlanetTools';
import {setMedicalConsultAttrValue} from './medicalConsult_action';

/**
 * 获取咨询的问题领域列表
 * @returns {function(*)}
 */
function homeInfo() {
  return async (dispatch) => {
    return await Tools.request({
      url: 'cnslt/cnsltAreas',
      success: async (data, header) => {
        if (data) {
          data.forEach((area, index) => {
            area.checked = index === 0;
          });
        }
        await dispatch(setMedicalConsultAttrValue({areaList: data}));
      },
      fail: res => {
        console.log(res);
      },
      complete: res => {
        console.log(res);
      }
    });
  }
}

/**
 * 判断当前用户是否需要更新信息
 */
function getNeedUpdateUserInfo() {
  return Tools.request({
    url: 'users/needUpdateUserInfo',
    method: 'post',
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    success: (data = {}, header = {}) => {
      return data;
    },
    fail: (res) => {
    },
    complete: (res) => {
    }
  });
}

const medicalConsultAPI = {
  homeInfo,
  getNeedUpdateUserInfo
};

export default medicalConsultAPI;
