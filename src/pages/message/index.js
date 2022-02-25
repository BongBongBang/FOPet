import Taro, {Component} from "@tarojs/taro";
import {
  Text,
  View
} from "@tarojs/components";
import {
  AtIcon,
  AtAvatar,
  AtBadge,
  AtButton,
  AtTabBar,
  AtTag
} from "taro-ui";
import {connect} from "@tarojs/redux";
import moment from "moment";
import cns from "classnames";
import mta from "mta-wechat-analysis";

import {LoadingView} from "../../components/bussiness-components";
import prompt from "../../constants/prompt";
import {homeAPI, messageAPI} from "../../services";
import {changeCurrent} from "../../actions/home";
import {setCommunicationsAttrValue} from "../../actions/communications";
import {pageCurrentList, cnsltState, tabBarTabList} from "../../utils/static";

import "../iconfont/iconfont.less";
import "./index.less";
import "./loading-view.less";

//moment里面的字符可以根据自己的需要进行调整
moment.locale('zh-cn', {
  months: '一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月'.split('_'),
  monthsShort: '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
  weekdays: '星期日_星期一_星期二_星期三_星期四_星期五_星期六'.split('_'),
  weekdaysShort: '周日_周一_周二_周三_周四_周五_周六'.split('_'),
  weekdaysMin: '日_一_二_三_四_五_六'.split('_'),
  longDateFormat: {
    LT: 'HH:mm',
    LTS: 'HH:mm:ss',
    L: 'YYYY-MM-DD',
    LL: 'YYYY年MM月DD日',
    LLL: 'YYYY年MM月DD日Ah点mm分',
    LLLL: 'YYYY年MM月DD日ddddAh点mm分',
    l: 'YYYY-M-D',
    ll: 'YYYY年M月D日',
    lll: 'YYYY年M月D日 HH:mm',
    llll: 'YYYY年M月D日dddd HH:mm'
  },
  meridiemParse: /凌晨|早上|上午|中午|下午|晚上/,
  meridiemHour: function (hour, meridiem) {
    if (hour === 12) {
      hour = 0;
    }
    if (meridiem === '凌晨' || meridiem === '早上' ||
      meridiem === '上午') {
      return hour;
    } else if (meridiem === '下午' || meridiem === '晚上') {
      return hour + 12;
    } else {
      // '中午'
      return hour >= 11 ? hour : hour + 12;
    }
  },
  meridiem: function (hour, minute, isLower) {
    const hm = hour * 100 + minute;
    if (hm < 600) {
      return '凌晨';
    } else if (hm < 900) {
      return '早上';
    } else if (hm < 1130) {
      return '上午';
    } else if (hm < 1230) {
      return '中午';
    } else if (hm < 1800) {
      return '下午';
    } else {
      return '晚上';
    }
  },
  calendar: {
    sameDay: '[今天]LT',
    nextDay: '[明天]LT',
    nextWeek: '[下]ddddLT',
    lastDay: '[昨天]LT',
    lastWeek: '[上]ddddLT',
    sameElse: 'L'
  },
  dayOfMonthOrdinalParse: /\d{1,2}(日|月|周)/,
  ordinal: function (number, period) {
    switch (period) {
      case 'd':
      case 'D':
      case 'DDD':
        return number + '日';
      case 'M':
        return number + '月';
      case 'w':
      case 'W':
        return number + '周';
      default:
        return number;
    }
  },
  relativeTime: {
    future: '%s内',
    past: '%s前',
    s: '几秒',
    ss: '%d秒',
    m: '1分钟',
    mm: '%d分钟',
    h: '1小时',
    hh: '%d小时',
    d: '1天',
    dd: '%d天',
    M: '1个月',
    MM: '%d个月',
    y: '1年',
    yy: '%d年'
  },
  week: {
    // GB/T 7408-1994《数据元和交换格式·信息交换·日期和时间表示法》与ISO 8601:1988等效
    dow: 1, // Monday is the first day of the week.
    doy: 4  // The week that contains Jan 4th is the first week of the year.
  }
});

@connect((state, ownProps) => {
  return {
    homeStore: state.homeStore,
    messageStore: state.messageStore,
    communicationsStore: state.communicationsStore
  };
}, (dispatch, ownProps) => {
  return {
    /**
     * 通过onClick事件来更新current值变化
     * @尹文楷
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
     * @尹文楷
     */
    changeCurrentInit() {
      const {path} = this.$router;
      const {currentList} = this.state;
      dispatch(changeCurrent({current: currentList.findIndex(item => item === path) || 0}));
    },
    /**
     * 前往对话记录页面
     * @尹文楷
     */
    onCommunicationsPage({id, cnsltType, docUserId}, e) {
      const {consultationsList} = this.state;
      dispatch(setCommunicationsAttrValue({
        consultationsList,
        cnsltId: id,
        cnsltType,
        docId: docUserId
      }));
      Taro.navigateTo({
        url: pageCurrentList[10]
      });
      //清除冒泡事件
      e.stopPropagation();
    }
  };
})
class Message extends Component {
  static options = {
    addGlobalClass: true
  };

  config = {
    navigationBarTitleText: "会话"
  };

  state = {
    //咨询列表
    consultationsList: [],
    //是否是在接口请求响应加载中
    isLoading: true,
    //筛选之后的TabBar标签页路由路径
    currentList: [],
    //获取底部TabBar配置
    tabBarTabList: [],
    //底部隐藏的TabBar配置
    tabBarTabNoSbList: [],
    //底部边栏消息提示
    tabBarInfo: {
      communication: {
        dot: false
      }
    }
  };

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
    for(let val of filterTabBarKeyList) {
      list.splice(val, 1, undefined);
    }
    spliceIndex = list.indexOf(undefined);
    while(spliceIndex !== -1) {
      list.splice(spliceIndex, 1);
      spliceIndex = list.indexOf(undefined);
    }
    this.setState({
      tabBarTabList: filterTabBarList,
      currentList: list
    }, ()=>{
      changeCurrentInit.call(this);
    });
    mta.Page.init();
  }

  componentDidMount() {
    messageAPI.cnsltConsultations.call(this);
  }

  componentDidShow() {
    (async () => {
      let {data: tabBarInfo} = await homeAPI.getTabBarInfoRequest();
      this.setState({
        tabBarInfo
      });
    })();
    messageAPI.cnsltConsultations.call(this);
  }

  componentDidHide() {
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
    if (newFilterTabBarInfoDotList.length <= 0) {
      tabBarTabList.forEach((item, index) => {
        item.dot = false;
      });
      return false;
    }
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
   *
   * @param e
   */
  onDirectToMedicalAdvicePage = (e) => {
    Taro.redirectTo({
      url: pageCurrentList[1]
    });
    //取消冒泡
    e.stopPropagation();
  };

  render() {
    const {homeStore: {current}, changeCurrentHandler, onCommunicationsPage} = this.props;
    const {filterDotTabBarList, onDirectToMedicalAdvicePage} = this;
    let {consultationsList, isLoading, tabBarInfo, tabBarTabList} = this.state;
    //筛选出dot为true的底部边栏结构
    filterDotTabBarList(tabBarInfo);
    return (
      <View
        className='pet-message'
      >
        {
          isLoading && <LoadingView
            size={56}
            color='#fb2a5d'
            className='pet-message-activity-indicator'
            content={prompt["detail"]["loading"]["text"]}
          />
        }
        {
          consultationsList.length > 0 ? consultationsList.map(consultationItem => {
            return (
              <View
                key={`${consultationItem["id"]}`}
                className='pet-message-consultationsItem'
                onClick={onCommunicationsPage.bind(this, consultationItem)}
              >
                <AtBadge
                  dot={consultationItem["hasMessage"]}
                >
                  <AtAvatar
                    className='pet-message-consultationsItem-avatar'
                    size='large'
                    image={consultationItem["avatarUrl"]}
                  />
                </AtBadge>
                <View
                  className='pet-message-consultationsItem-info'
                >
                  <View
                    className='at-row pet-message-consultationsItem-info-top'
                  >
                    <Text
                      className='at-col-6 pet-message-consultationsItem-info-top-title'
                    >
                      {
                        consultationItem["problemContent"]
                      }
                    </Text>
                    <Text
                      className='at-col-6 pet-message-consultationsItem-info-top-time'
                    >
                      {
                        moment(consultationItem["createTime"]).format("YYYY-MM-DD HH:mm")
                      }
                    </Text>
                  </View>
                  <View
                    className='at-row pet-message-consultationsItem-info-bottom at-row__justify--end'
                  >
                    <View className='at-col-3'>
                      <AtTag
                        size='small'
                        className={cns(
                          'pet-message-consultationsItem-info-tag',
                          cnsltState[consultationItem["cnsltState"]]["className"]
                        )}
                      >
                        {cnsltState[consultationItem["cnsltState"]]["txt"]}
                      </AtTag>
                    </View>

                  </View>
                </View>
              </View>
            );
          }) : <View className='pet-message-empty'>
            <AtIcon
              className='pet-message-empty-icon'
              prefixClass='iconfont'
              value='petPlanet-cat-ao'
              color='#000'
              size={48}
            />
            <View className='pet-message-empty-title'>
              宠物问题，专业咨询
            </View>
            <View className='pet-message-empty-description'>
              啊哦~您还没有任何宠物问题的咨询
            </View>
            <AtButton
              className='pet-message-empty-button'
              size='small'
              onClick={onDirectToMedicalAdvicePage}
            >
              点击进行问诊咨询
            </AtButton>
          </View>
        }
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
    );
  };
}

{/*<AtSwipeAction*/
}
{/*  key={consultationIndex}*/
}
{/*  isOpened={false}*/
}
{/*  autoClose*/
}
{/*  options={[{*/
}
{/*    text: prompt["swiperAction"]["message_page"]["content"],*/
}
{/*    style: {*/
}
{/*      backgroundColor: '#d94a45',*/
}
{/*      color: '#fff'*/
}
{/*    }*/
}
{/*  }]}*/
}
{/*  onClick={(e) => {*/
}

{/*  }}*/
}
{/*>*/
}
{/*</AtSwipeAction>*/
}

export default Message;


