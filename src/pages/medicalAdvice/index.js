import Taro, {Component} from '@tarojs/taro';
import {connect} from '@tarojs/redux';
import {
  Block,
  Image,
  Swiper,
  SwiperItem,
  Text,
  View
} from '@tarojs/components';
import {
  AtIcon,
  AtToast
} from 'taro-ui';
import {
  LdmTabBar
} from 'ldm-taro-frc';
import dayjs from 'dayjs';
import cns from 'classnames';

import {
  BlockTitleView,
  EmptyView,
  LoadingView
} from '../../components/bussiness-components';
import {loadingStatus, pageCurrentList, tabBarTabList} from '../../constants';
import {changeCurrent} from '../index/home_action';
import homeAPI from '../index/home_service';
import medicalAdviceAPI from './medicalAdvice_service';
import mta from 'mta-wechat-analysis';
import * as constants from './constants';

import 'taro-ui/dist/style/components/tab-bar.scss';
import 'taro-ui/dist/style/components/toast.scss';
import 'taro-ui/dist/style/components/activity-indicator.scss';
import 'taro-ui/dist/style/components/loading.scss';
import 'taro-ui/dist/style/components/icon.scss';

import '../commons/iconfont/iconfont.less';
import './loading-view.less';
import './index.less';

@connect(function mapStateToProps(state, ownProps) {
  return {
    homeStore: state.homeStore
  };
}, function mapDispatchToProps(dispatch, ownProps) {
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
      const {path} = this.$router;
      const {currentList} = this.state;
      dispatch(changeCurrent({current: currentList.findIndex(item => item === path) || 0}));
    }
  };
})
class MedicalAdvice extends Component {
  static options = {
    addGlobalClass: true
  };

  config = {
    navigationBarTitleText: '问诊'
  };

  state = {
    //是否显示主要内容
    isShow: false,
    //是否显示正在加载loading页面......
    loading: true,
    //轮播器广告位列表
    bannerList: [],
    //咨询动态列表
    consultingNewsList: [],
    //底部边栏消息提示
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
    buildingToastVisible: false
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
    const tabBarSymbol = filterTabBarList.findIndex(tabBarItem => tabBarItem.name === constants.symbol);
    this.setState({
      tabBarTabList: filterTabBarList,
      currentList: list,
      isShow: tabBarSymbol !== -1
    }, () => {
      changeCurrentInit.call(this);
    });
    mta.Page.init();
  }

  componentDidMount() {
    medicalAdviceAPI.medicalAdviceHomeInfo.call(this);
  }

  async componentDidShow() {
    let {data: newTabBarInfo} = await homeAPI.getTabBarInfoRequest();
    this.setState(Object.assign({}, {
      tabBarInfo: this.state.tabBarInfo
    }, {
      tabBarInfo: newTabBarInfo
    }));
    Taro.showShareMenu({
      withShareTicket: false
    });
  }

  navigateToConsult() {
    Taro.navigateTo({
      url: pageCurrentList[12]
    });
  }

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
    while (newFilterTabBarInfoDotList.length > 0) {
      let span = newFilterTabBarInfoDotList.shift();
      tabBarTabList.forEach((item, index) => {
        if (item.name === span) {
          item.dot = true;
        }
      });
    }
  };

  /**
   * 点击宠物攻略,进入'症状自诊'页面
   * @param e
   */
  redirectToSelfObd = (e) => {
    Taro.navigateTo({
      url: pageCurrentList[15]
    });
    //取消冒泡
    e.stopPropagation();
  };

  showBuildingToast = () => {
    this.setState({
      buildingToastVisible: true
    });
  };

  hideBuildingToast = () => {
    this.setState({
      buildingToastVisible: false
    });
  };

  render() {
    const {homeStore: {current}, changeCurrentHandler} = this.props;
    const {filterDotTabBarList, redirectToSelfObd} = this;
    let {
      bannerList = [],
      consultingNewsList = [],
      tabBarInfo = {},
      tabBarTabList = [],
      isShow = false,
      loading = true
    } = this.state;
    const {length} = consultingNewsList;
    const {length: bannerLength} = bannerList;
    let consultingNewsSwiperList = Array.from(Array.apply(null, {length: length / 3}), function map(item, index) {
      return [consultingNewsList[index * 3], consultingNewsList[index * 3 + 1], consultingNewsList[index * 3 + 2]];
    });
    //筛选出dot为true的底部边栏结构
    filterDotTabBarList(tabBarInfo);
    return (
      <Block>
        {
          loading && <LoadingView
            size={56}
            color='#fb2a5d'
            className='pet-medicalAdvice-loading'
            content={loadingStatus.progress.text}
          />
        }
        {
          isShow ? <View
            className='pet-medicalAdvice'
          >
            <Swiper
              autoplay
              circular
              indicatorDots={bannerLength > 1}
              indicatorColor='#f9f9f9'
              indicatorActiveColor='#F93B5F'
              vertical={false}
              className='pet-medicalAdvice-banner'
            >
              {
                bannerLength > 0 && bannerList.map((bannerItem, bannerIndex) => {
                  return (
                    <SwiperItem
                      key={bannerIndex}
                    >
                      <Image
                        className='pet-medicalAdvice-banner-image'
                        src={bannerItem['img']}
                        mode='aspectFill'
                      />
                    </SwiperItem>
                  );
                })
              }
            </Swiper>
            <View className='pet-medicalAdvice-content'>
              <View className='pet-medicalAdvice-content-detail' onClick={this.navigateToConsult}>
                <View className='pet-medicalAdvice-content-detail-main'>
                  <AtIcon
                    prefixClass='iconfont'
                    value='petPlanet-imageText'
                    size={32}
                    color='rgb(127,199,247)'
                  />
                  <Text className='pet-medicalAdvice-content-detail-main-txt'>
                    进行咨询
                  </Text>
                </View>
                <View className='pet-medicalAdvice-content-detail-description'>
                  <Text>
                    30s极速响应、在线解答任何宠物问题
                  </Text>
                </View>
              </View>
              <View className='pet-medicalAdvice-content-attack-container'>
                <View
                  className='pet-medicalAdvice-content-attack'
                  onClick={redirectToSelfObd}
                >
                  <View className='pet-medicalAdvice-content-attack-icon'>
                    <AtIcon
                      prefixClass='iconfont'
                      value='petPlanet-disease'
                      size={30}
                      color='rgba(255,99,94, .7)'
                    />
                  </View>
                  <View
                    className='pet-medicalAdvice-content-attack-main'
                  >
                    <Text className='pet-medicalAdvice-content-attack-main-txt'>
                      症状自查
                    </Text>
                    <View>
                      <Text className='pet-medicalAdvice-content-attack-main-description'>
                        典型症状自查
                      </Text>
                    </View>
                  </View>
                </View>
                <View
                  className='pet-medicalAdvice-content-attack'
                  onClick={this.showBuildingToast}
                >
                  <View className='pet-medicalAdvice-content-attack-icon'>
                    <AtIcon
                      prefixClass='iconfont'
                      value='petPlanet-petLife'
                      size={30}
                      color='rgb(124,213,173)'
                    />
                  </View>
                  <View
                    className='pet-medicalAdvice-content-attack-main'
                  >
                    <Text className='pet-medicalAdvice-content-attack-main-txt'>
                      养护手册
                    </Text>
                    <View>
                      <Text className='pet-medicalAdvice-content-attack-main-description'>
                        新手养宠攻略
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              <View className='pet-medicalAdvice-content-consultingNews'>
                <BlockTitleView>
                  咨询动态
                </BlockTitleView>
                <Swiper
                  autoplay
                  circular
                  className='pet-medicalAdvice-content-consultingNews-list'
                  vertical
                  style={{height: '308px'}}
                >
                  {
                    consultingNewsSwiperList.length > 0 && consultingNewsSwiperList.map((swiperItem, swiperIndex) => {
                      return <SwiperItem
                        key={swiperIndex}
                      >
                        {
                          swiperItem.length > 0 && swiperItem.map((item, index) => {
                            return (
                              <View
                                key={index}
                                className='pet-medicalAdvice-content-consultingNews-list-item'
                              >
                                <View className='pet-medicalAdvice-content-consultingNews-list-item-title'>
                                  <View className={cns('at-row',
                                    'pet-medicalAdvice-content-consultingNews-list-item-container'
                                  )}>
                                    <View className='at-col-10'>
                                      <AtIcon
                                        prefixClass='iconfont'
                                        value='petPlanet-point'
                                        size={19}
                                        color='rgb(57, 142, 226)'
                                      />
                                      <Text className={cns('at-row',
                                        'pet-medicalAdvice-content-consultingNews-list-item-txt'
                                      )}>
                                        {item['phone']}咨询
                                        <Text
                                          decode
                                          className='pet-medicalAdvice-content-consultingNews-list-item-title-cnsltArea'
                                        >&nbsp;{item['cnsltArea']}&nbsp;
                                        </Text>的问题:
                                      </Text>
                                    </View>
                                    <View className='at-col-2'>
                                      <Text
                                        className='pet-medicalAdvice-content-consultingNews-list-item-title-time'
                                      >
                                        {item['createTime'] ? dayjs(item['createTime'], 'YYYY-MM-DDTHH:mm:ss.000ZZ').fromNow() : ''}
                                      </Text>
                                    </View>
                                  </View>
                                </View>
                                <View
                                  className='pet-medicalAdvice-content-consultingNews-list-item-information'
                                >
                                  {item['cnsltContent']}
                                </View>
                              </View>
                            );
                          })
                        }
                      </SwiperItem>;
                    })
                  }
                </Swiper>
                <View className='pet-medicalAdvice-content-consultingNews-shadow'>
                </View>
              </View>
            </View>
            <AtToast
              isOpened={this.state.buildingToastVisible}
              text='建设中...'
              duration='1500'
              onClose={this.hideBuildingToast}
              icon='alert-circle'>
            </AtToast>
          </View> : <EmptyView
            icon='petPlanet-cat-ao'
            prefix='iconfont'
            color='#000'
            size={48}
            title='啊哦~~~'
            description='医疗咨询敬请期待'
          />
        }
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
      </Block>
    );
  };
}

export default MedicalAdvice;
