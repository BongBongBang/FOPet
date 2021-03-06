import Taro from '@tarojs/taro';
import Tools from '../../utils/petPlanetTools';
import {staticData, petPlanet_version} from '../../constants';
import {getPetList, changeLoadStatus} from './home_action';
import {setDetailAttrValue} from './detail/detail_action';
import * as constants from '../user/collection/constants';

/**
 * 获取用户OpenId
 * @尹文楷
 */
function getUserOpenId(gio_result) {
  return async (dispatch) => {
    return await Tools.request({
      url: 'users/openid',
      success: async (data, header) => {
        await gio_result.call(this, data, header);
      },
      complete(res) {

      }
    });
  };
}

/**
 * 获取卖家想要交易售卖的宠物列表
 * @returns {function(*): (never|Promise<Taro.request.Promised<any>>|Promise<TaroH5.request.Promised>|*)}
 */
function homeInfoRequest() {
  return async (dispatch) => {
    const {homeStore} = this.props;
    const {current: commType} = this.state;
    const {pageSize, pageNum, petList} = homeStore;
    const params = {
      pageSize,
      pageNum,
      commType
    };
    return await Tools.request({
      url: 'tinyHome/homeInfo',
      data: params,
      success: async (data, header) => {
        let _petList = pageNum === 1 ? [] : petList;
        let petList_new = [..._petList, ...data.items];
        this.setState({
          swiperList: data.banners
        });
        await dispatch(getPetList({
          petList: petList_new,
          currentPetList: data.items
        }));
        await dispatch(changeLoadStatus({
          loadStatus: (data.items.length > 0 && data.items.length === staticData['pageSize']) ?
            staticData['loadStatusConfig']['more'] : staticData['loadStatusConfig']['noMore']
        }));
        this.setState({
          loading: false
        });
      },
      complete: async (res) => {

      }
    });
  };
}

/**
 * 获取宠物发布之后的内容详情
 * @returns {function(*): (never|Promise<Taro.request.Promised<any>>|Promise<TaroH5.request.Promised>|*)}
 */
function getPetDetailRequest(id, avatarUrl, nickName) {
  return async (dispatch) => {
    return await Tools.request({
      url: `tinyComms/${id}`,
      success: async (data, header) => {
        const {title, cost, content, area, contactInfo, includeVideo, wantCount, imgList, collected, tags} = data;
        await dispatch(setDetailAttrValue({
          id,
          avatarUrl,
          nickName,
          title,
          cost,
          content,
          area,
          contactInfo,
          images: imgList,
          includeVideo,
          collected,
          collection: collected ? constants.collectionAction.collected.text : constants.collectionAction.noCollected.text,
          collectionType: collected ? constants.collectionAction.collected.type : constants.collectionAction.noCollected.type,
          wantCount,
          tags
        }));
      },
      complete: async (res) => {

      }
    });
  };
}

/**
 * 检查小程序版本更新的情况
 * @尹文楷
 */
function checkVersionRequest() {
  return Tools.request({
    url: 'tinySystem/checkVersion',
    data: {
      version: petPlanet_version
    },
    success: (data, header) => {
      if (data) {
        let forceUpdate = data.forceUpdate;
        Tools.updateManagerConfig(forceUpdate);
      }
    },
    fail: (res) => {

    },
    complete: (res) => {

    }
  });
}

/**
 * 获取TabBar隐含消息tab信息
 */
function getTabBarInfoRequest() {
  return Tools.request({
    url: 'tinyHome/tabBarInfo',
    success(data, header) {
    },
    fail(res) {

    },
    complete(res) {

    }
  });
}

/**
 * 获取底部TabBar的配置
 */
function getTabBarConfigRequest() {
  return Tools.request({
    url: 'tinyHome/tabBarConfig',
    data: {
      version: petPlanet_version
    },
    success(data, header) {

    },
    fail(res) {

    },
    complete(res) {

    }
  });
}

const homeAPI = {
  homeInfoRequest,
  getPetDetailRequest,
  getUserOpenId,
  checkVersionRequest,
  getTabBarInfoRequest,
  getTabBarConfigRequest
};

export default homeAPI;
