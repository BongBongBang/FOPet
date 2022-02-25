import React, {Component} from 'react';
import Taro, {Current} from '@tarojs/taro';
import {
  View,
  Button,
  Image
} from '@tarojs/components';
import {
  AtAvatar,
  AtIcon
} from 'taro-ui';
import {
  LdmUserInfo,
  LdmTabBar
} from 'ldm-taro-frc';
import {connect} from 'react-redux';
import mta from 'mta-wechat-analysis';
import cns from 'classnames';

import {changeCurrent} from '../index/home_action';
import {setCollectionAttrValue} from './collection/collection_action';
import {setPublishMineAttrValue} from './publishMine/publishMine_action';
import * as constants from './constants';
import {pageCurrentList, tabBarTabList} from '../../constants';
import homeAPI from '../index/home_service';
import userAPI from './user_service';

import '../commons/iconfont/iconfont.scss';
import './index.scss';

@connect((state) => {
  return {
    homeStore: state.homeStore,
    userStore: state.userStore,
    collectionStore: state.collectionStore,
    publishMineStore: state.publishMineStore
  }
}, (dispatch) => {
  return {
    /**
     * 通过onClick事件来更新current值变化
     * @param value
     */
    changeCurrentHandler(value) {
      const {currentList} = this.state;
      dispatch(changeCurrent({current: value}));
      Taro.redirectTo({
        url: currentList[`${value}`]
      });
    },
    /**
     * 初始化页面时更新current值的变化
     */
    changeCurrentInit() {
      const {path} = Current.router;
      const {currentList} = this.state;
      dispatch(changeCurrent({current: currentList.findIndex(item => item === path) || 0}));
    },
    /**
     * 获取个人页随机的头像和昵称
     * @尹文楷
     */
    userTinyHomeInfoHandler() {
      dispatch(userAPI.userTinyHomeInfoRequest.apply(this));
    },

    /**
     * 获取用户授权的个人信息(昵称跟头像),并进行保存
     * @尹文楷
     */
    getUserInfoSettingHandler(params) {
      dispatch(userAPI.syncUserInfoRequest.apply(this, [params]));
    },

    /**
     * 拉取收藏列表
     * @param pageNum
     * @尹文楷
     */
    async usersCollectionHandler(pageNum) {
      if (pageNum === 1) {
        await dispatch(setCollectionAttrValue({
          petCollectionList: []
        }));
      }
      await dispatch(setCollectionAttrValue({
        pageNum
      }));
      await Taro.navigateTo({
        url: pageCurrentList[8]
      });
    },

    /**
     * 拉取发布列表
     * @param pageNum
     * @尹文楷
     */
    async usersPublishMineHandler(pageNum) {
      if (pageNum === 1) {
        await dispatch(setPublishMineAttrValue({
          petPublishMineList: []
        }));
      }
      await dispatch(setPublishMineAttrValue({
        pageNum
      }));
      await Taro.navigateTo({
        url: pageCurrentList[9]
      });
    }
  }
})
class User extends Component {
  constructor(props) {
    super(props);
  }

  state = {
    tabBarInfo: {
      communication: {
        dot: false
      }
    },
    //筛选之后的TabBar标签页路由路径
    currentList: [],
    //获取底部TabBar配置
    tabBarTabList: [],
    //底部隐藏的TabBar配置
    tabBarTabNoSbList: [],
  };

  async componentWillMount() {
    const {changeCurrentInit} = this.props;
    let {data: tabBarConfig} = await homeAPI.getTabBarConfigRequest();
    let filterTabBarList = [],
      tabBarTabNoSbList,
      filterTabBarNoSbList = [],
      list = Object.assign([], pageCurrentList),
      filterTabBarKeyList = [];
    for (let val of tabBarConfig) {
      let filterTabBarConfig = tabBarTabList.filter(tabBarItem => (tabBarItem['id'] === val['code']) && val['sb']),
        filterTabBarNoSbConfig = tabBarTabList.filter(tabBarItem => (tabBarItem['id'] === val['code']) && !val['sb']);
      if (filterTabBarConfig && filterTabBarConfig.length > 0) {
        filterTabBarList = [...filterTabBarList, ...filterTabBarConfig];
      }
      if (filterTabBarNoSbConfig && filterTabBarNoSbConfig.length > 0) {
        filterTabBarNoSbList = [...filterTabBarNoSbList, val];
      }
    }
    for (let [key, val] of list.entries()) {
      tabBarTabNoSbList = filterTabBarNoSbList.filter(sbItem => sbItem['path'] === val);
      tabBarTabNoSbList && tabBarTabNoSbList.length > 0 && (filterTabBarKeyList = [...filterTabBarKeyList, key]);
    }
    for (let val of filterTabBarKeyList) {
      list.splice(val, 1, undefined);
    }
    list = list.filter(listItem => listItem !== undefined);
    this.setState({
      tabBarTabList: filterTabBarList,
      currentList: list
    }, () => {
      changeCurrentInit.call(this);
    });
    mta.Page.init();
  }

  componentDidMount() {
  }

  async componentDidShow() {
    const {userTinyHomeInfoHandler} = this.props;
    const {tabBarInfo} = this.state;
    const {filterDotTabBarList} = this;
    let {data: newTabBarInfo} = await homeAPI.getTabBarInfoRequest();
    this.setState(Object.assign({}, {
      tabBarInfo
    }, {
      tabBarInfo: newTabBarInfo
    }), () => {
      filterDotTabBarList(this.state.tabBarInfo);
    });
    userTinyHomeInfoHandler.apply(this);
    await Taro.showShareMenu({
      withShareTicket: false
    });
  }

  /**
   * 监听用户点击页面内转发按钮或右上角菜单“转发”按钮的行为，并自定义转发内容。
   * @param from
   * @param target
   * @param webViewUrl
   */
  onShareAppMessage({from, target, webViewUrl}) {
  }

  componentWillReceiveProps(nextProps) {
  }

  /**
   * 获取用户授权的个人信息(昵称跟头像),并进行保存
   * @尹文楷
   */
  getUserInfo = (res = {}) => {
    const {getUserInfoSettingHandler} = this.props;
    const {detail = {}} = res;
    let userInfo = detail && detail.userInfo,
      encryptedData = detail && detail.encryptedData,
      rawData = detail && detail.rawData,
      signature = detail && detail.signature,
      iv = detail && detail.iv;
    if (userInfo) {
      userInfo = {
        ...userInfo,
        encryptedData,
        rawData,
        signature,
        iv
      };
      getUserInfoSettingHandler.apply(this, [userInfo]);
      mta.Event.stat('user_authorization', {});
    }
  };

  /**
   * 筛选出dot为true的底部边栏结构
   * @尹文楷
   */
  filterDotTabBarList = (tabBarInfo) => {
    if (!tabBarInfo) {
      return false;
    }
    const {tabBarTabList} = this.state;
    let tabBarInfoList = Object.entries(tabBarInfo),
      tabBarInfoDotList = tabBarInfoList.filter((item, index) => {
        return !!(item[1] && item[1].dot);
      });
    let newFilterTabBarInfoDotList = tabBarInfoDotList.map((dotItem, dotIndex) => {
      return (dotItem && dotItem[0]);
    });
    tabBarTabList.forEach((item, index) => {
      item.dot = false;
    });
    while (newFilterTabBarInfoDotList.length > 0) {
      let span = newFilterTabBarInfoDotList.shift();
      tabBarTabList.forEach((item, index) => {
        if (item.name === span) {
          item.dot = true;
        }
      });
    }
    this.setState({
      tabBarTabList
    });
  };

  render() {
    const {homeStore, userStore, changeCurrentHandler} = this.props;
    const {
      getUserInfo = () => {
      }
    } = this;
    const {tabBarTabList} = this.state;
    const {current} = homeStore;
    const {nickName = '', avatar = '', hasMessage = false, opList = []} = userStore;
    const contact = opList[0];
    const funcs = opList.slice(1);
    return (
      <View className='pet-me'>
        <View className={cns(
          'pet-me-information'
        )}>
          <LdmUserInfo
            visible={true}
            text=''
            callBack={getUserInfo}
            done={(res) => {
            }}
            renderButtonDetail={
              <Button
                className={cns('at-row',
                  'pet-me-information-getPermission-button'
                )}
                lang='zh_CN'
                openType='getUserInfo'
                onGetUserInfo={getUserInfo}
              >
                <AtAvatar
                  className='pet-me-information-avatar'
                  size='large'
                  circle
                  image={avatar}
                />
                <View className={cns('at-col-7',
                  'pet-me-information-nickname'
                )}>
                  {nickName}
                </View>
                <View className={cns('at-col-2',
                  'pet-me-information-detail'
                )}>
                  <AtIcon
                    className='pet-me-information-detail-button'
                    prefixClass='iconfont'
                    value='petPlanet-right'
                    color='#DFDFDF'
                    size={18}
                  />
                </View>
              </Button>
            }
          />
        </View>
        <View className={cns('at-col',
          'pet-me-information',
          'pet-me-information-margin',
          'pet-me-information-nowrap'
        )}>
          {
            constants.meInfoConfig && constants.meInfoConfig.length > 0 && constants.meInfoConfig.map((item, index) => {
              return (
                <View
                  key={item.id}
                  className={cns('at-row',
                    'pet-me-information-info',
                    'at-row__align--center'
                  )}
                  onClick={(e) => {
                    item.onClick.apply(this, [e]);
                  }}
                >
                  <View className={cns('at-col',
                    'at-col-1',
                    'at-col--auto',
                    'pet-me-item-icon-wrap'
                  )}>
                    <Image
                      mode='aspectFit'
                      className='pet-me-item-icon'
                      src={item.imgs || funcs[index]['picUrl']}
                    />
                  </View>
                  <View className='at-col'>
                    {item.name}
                    {
                      item.message && hasMessage && <View className='at-badge__dot'/>
                    }
                  </View>
                  <View className={cns('at-col-2',
                    'pet-me-information-info-detail'
                  )}>
                    <AtIcon
                      className='pet-me-information-info-detail-button'
                      prefixClass='iconfont'
                      value='petPlanet-right'
                      color='#DFDFDF'
                      size={18}
                    />
                  </View>
                </View>
              )
            })
          }
        </View>
        <View className={cns('at-col',
          'pet-me-information',
          'pet-me-information-nowrap'
        )}>
          <Button
            openType='contact'
            className='pet-me-information-contact at-row'
            full
          >
            <View className={cns('at-col',
              'at-col-1',
              'at-col--auto',
              'pet-me-item-icon-wrap'
            )}>
              <Image
                mode='aspectFit'
                className='pet-me-item-icon'
                src={contact['picUrl']}
              />
            </View>
            <View className={cns('at-col',
              'pet-me-information-contact-txt'
            )}>
              联系客服
            </View>
          </Button>
        </View>
        <LdmTabBar
          className={cns(
            'pet-tabBar'
          )}
          fixed
          current={current}
          tabList={tabBarTabList}
          onChange={changeCurrentHandler.bind(this)}
          color='#979797'
          iconSize={24}
          selectedColor='#000'
        />
      </View>
    )
  }
}

export default User;
