import Taro, {Component} from '@tarojs/taro';
import {connect} from "@tarojs/redux";
import {View} from "@tarojs/components";
import {
  AtTabBar
} from 'taro-ui';
import mta from "mta-wechat-analysis";
import {changeCurrent} from "../../actions/home";
import {homeAPI, topicsApi} from "../../services";
import {pageCurrentList, preparationNav, tabBarTabList} from "../../utils/static";
import LoadingView from "../../components/bussiness-components/LoadingView";
import prompt from "../../constants/prompt";
import {imgs} from "../../assets";
import Tools from "../../utils/petPlanetTools";

import "../iconfont/iconfont.less";
import "./index.less";
import "./loading-view.less";


@connect((state) => {
  return {
    homeStore: state.homeStore
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
    }
  }
})
class Topic extends Component {

  static options = {
    addGlobalClass: true
  };

  config = {
    navigationBarTitleText: "发现"
  };

  state = {
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
    //flow内容流列表
    flowPostList: [],
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
    topic: null,
    //筛选头部导航下标
    current: preparationNav[0]["key"]
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
      filterTabBarKeyList = [],
      spliceIndex = 0;
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
    spliceIndex = list.indexOf(undefined);
    while (spliceIndex !== -1) {
      list.splice(spliceIndex, 1);
      spliceIndex = list.indexOf(undefined);
    }
    this.setState({
      tabBarTabList: filterTabBarList,
      currentList: list
    }, () => {
      changeCurrentInit.call(this);
    });
    mta.Page.init();
  }

  componentDidMount() {
    Tools.run(function* () {
      let topicData = yield topicsApi.getFlowTopics.call(this);
      yield topicsApi.getFlowPosts.call(this);
    }.bind(this));
  }

  componentWillReceiveProps(nextProps, nextContext) {
  }

  componentWillUnmount() {
    this.setState({
      current: preparationNav[0]["key"]
    })
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
   * 监听用户点击页面内转发按钮或右上角菜单“转发”按钮的行为，并自定义转发内容。
   * @param from
   * @param target
   * @param webViewUrl
   */
  onShareAppMessage({from, target, webViewUrl}) {

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

  render() {
    const {filterDotTabBarList} = this;
    const {homeStore, changeCurrentHandler} = this.props;
    const {tabBarInfo, loading, tabBarTabList, topicList, flowPostList} = this.state;
    const {current} = homeStore;
    const {length} = topicList || [];
    filterDotTabBarList(tabBarInfo);
    return (
      <View className='pet'>
        {
          loading && <LoadingView
            size={56}
            color='#fb2a5d'
            className='pet-business-loading'
            content={prompt["detail"]["loading"]["text"]}
          />
        }
        <View className='pet-find'>
          <View className='pet-topic'>
            {
              topicList && length && topicList.map((topicItem, topicIndex) => {
                return (
                  <View className='pet-topic-item'
                        key={String(topicItem['id'])}
                        style={topicIndex === (length - 1) ? {marginRight: '16PX'} : {}}
                  >
                    <image
                      className='pet-topic-item-logo'
                      src={imgs.petPlanetLogo}
                      mode='widthFix'
                    />
                    {topicItem['topic']}
                  </View>
                )
              })
            }
            <View className='pet-topic-empty'>
              '
            </View>
          </View>
          <View className='pet-topic-flowList'>
            {
              flowPostList && flowPostList.length && flowPostList.map((flowItem, flowIndex) => {
                return (
                  <View
                    className='pet-topic-flowList-item'
                    key={Number(flowItem['userId'])}
                  >
                    <View className='pet-topic-flowList-item-header'>
                      <View className='pet-topic-flowList-item-avatar'>
                        <image
                          mode='widthFix'
                          src={flowItem['userAvatarUrl']}/>
                      </View>
                      <View className='pet-topic-flowList-item-user'>
                        {flowItem['userNickName']}
                        <View className='pet-topic-flowList-item-user-symbol'>
                          认证用户
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })
            }
          </View>
        </View>
        {/*导航区域: 分首页、咨询、会话和我四个部分*/}
        <AtTabBar
          className='pet-tabBar'
          fixed
          current={current}
          tabList={tabBarTabList}
          onClick={changeCurrentHandler.bind(this)}
          color='#000'
          iconSize={24}
          selectedColor='#000'
        />
      </View>
    )
  }
}

export default Topic;
