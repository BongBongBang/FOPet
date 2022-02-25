import Taro, {Component} from '@tarojs/taro';
import {connect} from '@tarojs/redux';
import {
  Block,
  Text,
  ScrollView,
  View
} from '@tarojs/components';
import {
  AtAvatar,
  AtButton,
  AtIcon
} from 'taro-ui';
import mta from 'mta-wechat-analysis';
import cns from 'classnames';
import {
  LdmOutLogin,
  LdmTabBar
} from 'ldm-taro-frc';
import {changeCurrent, setAttrValue} from '../index/home_action';
import {setTopicsAttrValue} from './topics_action';
import {setFindTopicsAttrValue} from './findTopics/findTopics_action';
import homeAPI from '../index/home_service';
import topicsAPI from './topics_service';
import {
  pageCurrentList,
  tabBarTabList,
  loadingStatus,
  petPlanetPrefix
} from '../../constants';
import * as constants from './constants';
import {
  DiscoveryView,
  LoadingView
} from '../../components/bussiness-components';
import Tools from '../../utils/petPlanetTools';

import 'taro-ui/dist/style/components/avatar.scss';
import 'taro-ui/dist/style/components/button.scss';
import 'taro-ui/dist/style/components/activity-indicator.scss';
import 'taro-ui/dist/style/components/loading.scss';
import 'taro-ui/dist/style/components/icon.scss';
import 'taro-ui/dist/style/components/tab-bar.scss';

import '../commons/iconfont/iconfont.less';
import './index.less';
import './discovery-view.less';
import './loading-view.less';


@connect((state) => {
  return {
    homeStore: state.homeStore,
    topicsStore: state.topicsStore,
    findTopicsStore: state.findTopicsStore
  }
}, (dispatch) => {
  return {
    /**
     * 通过onClick事件来更新current值变化
     * @param value
     */
    async changeCurrentHandler(value) {
      const {currentList} = this.state;
      await dispatch(changeCurrent({current: value}));
      await Taro.redirectTo({
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
    },
    /**
     * 改变redux store里面的数据状态
     */
    setTopicsAttrValueHandler(payload) {
      return dispatch(setTopicsAttrValue(payload));
    },
    /**
     * 改变redux store里面的数据状态
     */
    setAttrValueHandler(payload) {
      return dispatch(setAttrValue(payload));
    },
    /**
     * 改变redux store里面的数据状态
     */
    setFindTopicsAttrValueHandler(payload) {
      return dispatch(setFindTopicsAttrValue(payload));
    }
  }
})
class Topic extends Component {

  constructor(props) {
    super(props);
    //为了对请求话题分页接口进行截流
    this.hasTopicNext = false;
    //为了对请求分页接口进行截流
    this.hasNext = false;
  }

  static options = {
    addGlobalClass: true
  };

  config = {
    navigationBarTitleText: '发现'
  };

  state = {
    //是否显示主要内容
    isShow: false,
    tabBarInfo: {
      communication: {
        dot: false
      }
    },
    //话题列表页码
    pageNum: 1,
    //flow内容流页码
    postPageNum: 1,
    //话题列表
    topicList: [],
    //话题的总条数
    total: 0,
    //flow内容流的总条数
    postTotal: 0,
    //是否显示正在加载loading页面......
    loading: true,
    //筛选之后的TabBar标签页路由路径
    currentList: [],
    //获取底部TabBar配置
    tabBarTabList: [],
    //底部隐藏的TabBar配置
    tabBarTabNoSbList: [],
    //内容流所在话题的文案
    topic: null
  };

  /**
   * 筛选底部TabBar配置
   * @returns {Promise<void>}
   */
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

  async componentDidMount() {
    const {
      homeStore: {cookie = ''},
      setAttrValueHandler = () => {
      }
    } = this.props;
    await LdmOutLogin({
      url: `${petPlanetPrefix}/tinySession/login`,
      header: {
        cookie
      },
      callBack: async (data, header) => {
        await Taro.setStorageSync('petPlanet', header['Set-Cookie']);
        await setAttrValueHandler({
          loginSessionStatus: false,
          cookie: header['Set-Cookie']
        });
        await homeAPI.checkVersionRequest.call(this);
        Tools.run(function* () {
          let topicData = yield topicsAPI.getFlowTopics.call(this);
          yield topicsAPI.getFlowPosts.call(this);
        }.bind(this));
      },
      done: (res) => {
      }
    });
  }

  componentWillReceiveProps(nextProps, nextContext) {
  }

  componentWillUnmount() {
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

  componentDidHide() {
  }

  /**
   * 下滑分页,滑动至距离底部还有20%的距离时,请求下一页
   */
  scrollToNextPage = (event) => {
    const {topicsStore} = this.props;
    const {detail = {}} = event;
    const {flowPostList: {length}} = topicsStore;
    const {postTotal} = this.state;
    const {scrollTop = 0, scrollHeight = 0} = detail;
    const {hasNext} = this;
    Taro.createSelectorQuery().select('#pet-topic-flowList').fields({
      size: true
    }, res => {
      const {height} = res;
      const that = this;
      if (((scrollHeight - height - scrollTop) / scrollHeight < 0.1) && (length < postTotal) && !hasNext) {
        this.hasNext = true;
        Tools.run(function* () {
          yield topicsAPI.getFlowPosts.call(that);
        });
      }
    }).exec();
  };

  /**
   * 左右滑话题分页,滑动至距离最右边还有20%的距离时,请求下一页话题
   */
  scrollToNextTopic = (event) => {
    const {detail = {}} = event;
    const {hasTopicNext} = this;
    const {total, topicList: {length}} = this.state;
    const {scrollLeft = 0, scrollWidth = 0} = detail;
    Taro.createSelectorQuery().select('#pet-topic').fields({
      size: true
    }, res => {
      const width = res.width;
      if (((scrollWidth - width - scrollLeft) / scrollWidth < 0.2) && (length < total) && !hasTopicNext) {
        this.hasTopicNext = true;
        Tools.run(function* () {
          yield topicsAPI.getFlowTopics.call(this);
        }.bind(this));
      }
    }).exec();
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
   * 通过话题查询内容社区列表
   * e
   */
  getFlowTopicsToPostsList = (e) => {
    const {currentTarget = {}} = e || {};
    const {dataset: {item}} = currentTarget;
    const {topic, img} = JSON.parse(item);
    Taro.navigateTo({
      url: `${pageCurrentList[24]}?topic=${topic}&img=${img}`
    });
    //取消冒泡事件
    e.stopPropagation();
  };

  /**
   * 点击跳转到内容社区详情页
   * e
   */
  redirectToDetail = (e) => {
    //取消冒泡事件
    e.stopPropagation();
    const {currentTarget = {}} = e || {};
    const {dataset: {item}} = currentTarget;
    const {id, goodCount, commentCount, liked, topic} = JSON.parse(item) || {};
    Taro.navigateTo({
      url: Tools.modelStrCutNull`${pageCurrentList[20]}?id=${id}&topic=${topic}&like=${goodCount}&comment=${commentCount}&liked=${liked}`
    });
  };

  /**
   * 点击跳转到内容社区详情页
   * e
   */
  redirectToDetailComment = (e) => {
    //取消冒泡事件
    e.stopPropagation();
    const {currentTarget = {}} = e || {};
    const {dataset: {item}} = currentTarget;
    const {id, goodCount, commentCount, liked, topic} = JSON.parse(item) || {};
    Taro.navigateTo({
      url: Tools.modelStrCutNull`${pageCurrentList[20]}?id=${id}&topic=${topic}&like=${goodCount}&comment=${commentCount}&liked=${liked}&scrollTop=${true}`
    });
  };

  /**
   * 点击(不)喜欢某条Post
   */
  onTopicLikeHandler = (e) => {
    //取消冒泡事件
    e.stopPropagation();
    const {currentTarget} = e || {};
    const {dataset: {id}} = currentTarget || {};
    topicsAPI.flowPostsTopicsLike.call(this, id);
  };

  /**
   * 监听用户点击页面内转发按钮或右上角菜单“转发”按钮的行为，并自定义转发内容。
   * @param res
   */
  onShareAppMessage(res = {}) {
    const params = res;
    const {from} = params;
    switch (from) {
      case 'button':
        let {target: {dataset: {item}}} = params;
        const {id, goodCount, commentCount, imgs, content, liked, topic} = JSON.parse(item) || {};
        return {
          title: content,
          path: Tools.modelStrCutNull`${pageCurrentList[20]}?id=${id}&topic=${topic}&like=${goodCount}&comment=${commentCount}&liked=${liked}`,
          imageUrl: imgs[0]
        };
      case 'menu':
        return {
          title: '逼疯的铲屎官 - 发现'
        };
      default:
        break;
    }
  };

  render() {
    const {
      filterDotTabBarList,
      getFlowTopicsToPostsList,
      scrollToNextPage,
      scrollToNextTopic,
      redirectToDetail,
      redirectToDetailComment,
      onTopicLikeHandler
    } = this;
    const {
      homeStore,
      topicsStore,
      changeCurrentHandler = () => {
      }
    } = this.props;
    const {
      tabBarInfo,
      loading,
      tabBarTabList,
      topicList,
      isShow = false
    } = this.state;
    const {flowPostList = []} = topicsStore;
    const {current} = homeStore;
    const {length} = topicList || [];
    const {isX} = Tools.adaptationNavBar();
    filterDotTabBarList(tabBarInfo);
    return (
      <View className='pet'>
        {
          loading && <LoadingView
            size={56}
            color='#fb2a5d'
            className='pet-business-loading'
            content={loadingStatus.progress.text}
          />
        }
        {
          isShow ? <Block>
            <View className={cns(
              'pet-find',
              {'pet-find-adaption': !!isX}
            )}>
              <ScrollView
                id='pet-topic-flowList'
                className='pet-topic-flowList'
                scrollY
                onScroll={scrollToNextPage}
              >
                <ScrollView id='pet-topic'
                            className='pet-topic'
                            scrollX
                            onScroll={scrollToNextTopic}
                >
                  <View className='pet-topic-container'>
                    {
                      topicList && length && topicList.map((topicItem, topicIndex) => {
                        return (
                          <View
                            className={cns(
                              'pet-topic-item'
                            )}
                            key={String(topicItem['id'])}
                            data-item={JSON.stringify(topicItem)}
                            style={topicIndex === (length - 1) ? {marginRight: '16PX'} : {}}
                            onClick={getFlowTopicsToPostsList}
                          >
                            <AtAvatar
                              className='pet-topic-item-logo'
                              image={topicItem['img']}
                              circle
                              size='large'
                            />
                            <Text className='pet-topic-item-content'>
                              {topicItem['topic']}
                            </Text>
                          </View>
                        )
                      })
                    }
                  </View>
                </ScrollView>
                <DiscoveryView
                  list={flowPostList}
                  onClick={redirectToDetail}
                  onLiked={onTopicLikeHandler}
                  onComment={redirectToDetailComment}
                />
              </ScrollView>
            </View>
            {/*按钮发布区域: 使用formId进行发起一次有formId的模板消息请求*/}
            <View
              className={cns(
                'pet-topic-deal',
                {
                  'pet-topic-deal-adaption': !!isX
                }
              )}
            >
              <AtButton
                size='small'
                type='primary'
                className='pet-topic-deal-add'
                onClick={(event) => {
                  Taro.navigateTo({
                    url: pageCurrentList[23]
                  });
                  event.stopPropagation();
                }}
              >
                <AtIcon
                  value='add'
                  className='pet-topic-deal-add-icon'
                  size={22}
                  color='#fff'
                />
              </AtButton>
            </View>
          </Block> : <View className={cns(
            'pet-topic-empty',
            {'pet-topic-empty-adaption': !!isX}
          )}>
            <AtIcon
              className='pet-topic-icon'
              prefixClass='iconfont'
              value='petPlanet-cat-ao'
              color='#000'
              size={48}
            />
            <View className='pet-topic-empty-title'>
              啊哦~~~
            </View>
            <View className='pet-topic-empty-description'>
              发现社区敬请期待
            </View>
          </View>
        }
        {/*导航区域: 分首页、咨询、商城、会话和我四个部分*/}
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

export default Topic;
