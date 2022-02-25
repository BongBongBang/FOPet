import Taro, {Component} from '@tarojs/taro';
import {connect} from "@tarojs/redux";
import {View} from "@tarojs/components";
import {
  AtTabBar,
  AtForm,
  AtButton,
  AtIcon
} from 'taro-ui';
import mta from "mta-wechat-analysis";
import {CardView, PreparationView} from "../../components/bussiness-components";
import {changeCurrent, changePageNum, changeLoadStatus, setAttrValue} from "../../actions/home";
import {homeAPI} from "../../services";
import {tabBarTabList, pageCurrentList, staticData, preparationNav} from "../../utils/static";
import LoadingView from "../../components/bussiness-components/LoadingView";
import prompt from "../../constants/prompt";

import "../iconfont/iconfont.less";
import "./index.less";
import "./card-view.less";
import "./loading-view.less";
import "./preparation-view.less";


@connect((state) => {
  return {
    homeStore: state.homeStore,
    detailStore: state.detailStore
  }
}, (dispatch) => {
  return {
    /**
     * 通过onClick事件来更新current值变化
     * @param value
     */
    async changeCurrentHandler(value) {
      await dispatch(changeCurrent({current: value}));
      await Taro.redirectTo({
        url: pageCurrentList[`${value}`]
      });
    },
    /**
     * 初始化页面时更新current值的变化
     */
    changeCurrentInit() {
      dispatch(changeCurrent({current: 0}));
    },
    /**
     * 获取小程序首页信息
     * @尹文楷
     */
    async homeInfoHandler(pageNum) {
      await dispatch(changePageNum({
        pageNum
      }));
      await dispatch(homeAPI.homeInfoRequest.apply(this));
    },

    /**
     * formId收集
     * @尹文楷
     * @params formId
     * @returns {Promise<void>}
     */
    async getFormIdHandler(formId) {
      await dispatch(homeAPI.getFormIdRequest.apply(this, [formId]));
    },

    /**
     * 改变滚动加载的AtLoadMore的状态
     * @尹文楷
     */
    async changeLoadStatusHandler(loadStatus) {
      await dispatch(changeLoadStatus({
        loadStatus
      }));
    },

    /**
     * 改变redux store里面的数据状态
     * @尹文楷
     */
    async setAttrValueHandler(payload) {
      await dispatch(setAttrValue(payload));
    }
  }
})
class Index extends Component {

  static options = {
    addGlobalClass: true
  };

  config = {
    navigationBarTitleText: "主子"
  };

  state = {
    tabBarInfo: {
      communication: {
        dot: false
      }
    },
    //是否显示正在加载loading页面......
    loading: true,
    //筛选头部导航下标
    current: preparationNav[0]["key"]
  };

  async componentWillMount() {
    await mta.Page.init();
  }

  componentDidMount() {
    const {homeInfoHandler, changeLoadStatusHandler, changeCurrentInit} = this.props;
    homeInfoHandler.apply(this, [1]);
    changeLoadStatusHandler("more");
    changeCurrentInit();
  }

  componentWillReceiveProps(nextProps, nextContext) {
    const {homeInfoHandler, changeLoadStatusHandler} = this.props;
    const {homeStore: {petList}} = nextProps || {};
    if(petList.length <= 0) {
      homeInfoHandler.apply(this, [1]);
      changeLoadStatusHandler("more");
    }
  }

  componentWillUnmount() {
    this.setState({
      current: preparationNav[0]["key"]
    })
  }

  componentDidShow() {
    const newTabBarInfo = JSON.parse(Taro.getStorageSync('petPlanetTabBarInfo'));
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
   * 当滚动条滚到底部的时候进行上拉加载动作
   * @尹文楷
   */
  async onScrollToLower() {
    const {homeStore, homeInfoHandler, changeLoadStatusHandler} = this.props;
    let {pageNum, currentPetList, loadStatus} = homeStore;
    if (currentPetList.length === staticData["pageSize"] && loadStatus === staticData["loadStatusConfig"]["more"]) {
      await changeLoadStatusHandler(staticData["loadStatusConfig"]["loading"]);
      await homeInfoHandler.apply(this, [++pageNum]);
      mta.Event.stat("index_scrolltolower", {});
    }
  }

  /**
   * 点击发起宠物交易的Submit事件
   * @尹文楷
   */
  async onSubmitHandler(event) {
    const {getFormIdHandler} = this.props;
    await Taro.navigateTo({
      url: pageCurrentList[6]
    });
    await getFormIdHandler.apply(this, [event.target.formId]);
  }

  /**
   * 获取详情页内容
   * @尹文楷
   **/
  async getPetDetailHandler(id) {
    await Taro.navigateTo({
      url: `${pageCurrentList[4]}?id=${id}&page=index`
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
        if (item.id === span) {
          item.dot = true;
        }
      });
    }
  };

  /**
   * 筛选头部导航改变时,触发的动作,改变下标,并发起筛选请求
   * @尹文楷
   */
  onPreparationChangeHandler = (current = 0, e = {}) => {
    const {homeInfoHandler, changeLoadStatusHandler} = this.props;
    this.setState({
      current
    }, () => {
      homeInfoHandler.apply(this, [1]);
    });
    changeLoadStatusHandler("more");
    //取消冒泡
    e.stopPropagation && e.stopPropagation();
  };

  render() {
    const {onScrollToLower, getPetDetailHandler, onSubmitHandler, filterDotTabBarList, onPreparationChangeHandler} = this;
    const {homeStore, changeCurrentHandler} = this.props;
    const {tabBarInfo, current: _current, loading} = this.state;
    const {current, petList, loadStatus} = homeStore;
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
        <PreparationView
          strategy={preparationNav}
          current={_current}
          onChange={onPreparationChangeHandler}
        />
        {/*首页宠物交易列表区域*/}
        <CardView
          list={petList}
          onScrollToLower={onScrollToLower.bind(this)}
          onClick={getPetDetailHandler.bind(this)}
          loadStatus={loadStatus}
        />
        {
          petList && petList.length <= 0 && <View className='pet-business-empty'>
            <AtIcon
              className='pet-business-empty-icon'
              prefixClass='iconfont'
              value='petPlanet-cat-ao'
              color='#000'
              size={48}
            />
            <View className='pet-business-empty-description'>
              啊哦~喵星搜索不到喵星人~~
            </View>
          </View>
        }
        {/*按钮发布区域: 使用formId进行发起一次有formId的模板消息请求*/}
        <AtForm
          reportSubmit={true}
          style='border:none'
          onSubmit={onSubmitHandler.bind(this)}
          className='pet-business-deal'
        >
          <AtButton
            size='small'
            type='primary'
            className='pet-business-deal-add'
            formType='submit'
          >
            <AtIcon
              value='add'
              className='pet-business-deal-add-icon'
              size={22}
              color='#fff'
            />
          </AtButton>
        </AtForm>
        {/*导航区域: 分首页、咨询、会话和我四个部分*/}
        <AtTabBar
          className='pet-tabBar'
          fixed
          current={current}
          tabList={tabBarTabList}
          onClick={changeCurrentHandler}
          color='#000'
          iconSize={24}
          selectedColor='#000'
        />
      </View>
    )
  }
}

export default Index;
