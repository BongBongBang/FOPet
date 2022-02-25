import Tools from '../../utils/petPlanetTools';
import {setUserAttrValue} from './user_action';

/**
 * 获取个人页随机的头像和昵称
 * @尹文楷
 * @returns {Function}
 */
function userTinyHomeInfoRequest() {
  return async (dispatch) => {
    return await Tools.request({
      url: 'users/tinyHomeInfo',
      success: async (data, header) => {
        const {nickName = '', hasMessage = false, avatarUrl = null, opList = []} = data || {};
        await dispatch(setUserAttrValue({
          nickName: nickName,
          hasMessage: hasMessage,
          avatar: avatarUrl,
          opList
        }));
      },
      complete: async (response) => {

      }
    });
  }
}

/**
 * 同步微信用户授权后的用户信息
 * @尹文楷
 */
function syncUserInfoRequest(params) {
  return (dispatch) => {
    return Tools.request({
      url: 'users/syncUserInfo',
      method: 'post',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: params,
      success: async (data, header) => {
        await dispatch(userTinyHomeInfoRequest.apply(this));
      },
      fail: async (res) => {

      },
      complete: async (res) => {

      }
    });
  };
}

/**
 * 判断当前用户是否需要更新信息
 */
function getNeedUpdateUserInfo() {
  return Tools.request({
    url: 'users/needUpdateUserInfo',
    method: 'post',
    headers: {
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

const userAPI = {
  userTinyHomeInfoRequest,
  syncUserInfoRequest,
  getNeedUpdateUserInfo
};

export default userAPI;
