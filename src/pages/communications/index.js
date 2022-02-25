import Taro, {Component} from "@tarojs/taro";
import {connect} from "@tarojs/redux";
import {
  Text,
  View
} from "@tarojs/components";
import {
  AtAvatar,
  AtButton,
  AtForm,
  AtInput,
  AtMessage
} from "taro-ui";
import cns from "classnames";
import moment from "moment";

import {communicationsAPI, homeAPI} from "../../services";
import Tools from "../../utils/petPlanetTools";

import "./index.less";

moment.locale("zh-cn", {
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
    communicationsStore: state.communicationsStore
  };
}, (dispatch, ownProps) => {
  return {};
})
class Communications extends Component {
  static options = {
    addGlobalClass: true
  };

  config = {
    navigationBarTitleText: "对话记录"
  };

  state = {
    //对话记录列表当前所在页数
    pageNum: 1,
    //对话记录列表每页显示的条数
    pageSize: 10,
    //对话记录列表总共条数
    total: 0,
    //输入框当前值
    communicationsValue: "",
    //是否输入咨询框聚焦
    isFocus: false,
    //获取手机键盘的高度转变为输入框底部的距离
    inputDistanceBoard: 0,
    //对话记录列表
    communicationsList: [],
    //对话记录针对的问题
    communicationsOS: {}
  };

  componentDidMount() {
    communicationsAPI.getCommunicationsList.call(this);
  }

  componentWillUnmount() {
    this.setState({
      communicationsValue: "",
      communicationsList: [],
      pageNum: 1,
      pageSize: 10,
    });
  }

  /**
   * 输入框值改变时触发的事件
   * @param val
   */
  onChangeValueHandler = (val) => {
    val = val.target ? val.target.value : val;
    this.setState({
      communicationsValue: val
    });
  };

  /**
   * 输入框聚焦时触发
   * @尹文楷
   */
  onFocusHandler = (value, event) => {
    const {currentTarget: {height = 0}} = event || {};
    this.setState({
      isFocus: true,
      inputDistanceBoard: height
    });
  };

  /**
   * 输入框失焦时触发
   * @尹文楷
   */
  onBlurHandler = (event) => {
    this.setState({
      isFocus: false,
      inputDistanceBoard: 0
    });
  };

  /**
   * 校验咨询的内容
   */
  verifyPostMessage = () => {
    const {communicationsValue} = this.state;
    return Tools.addRules([
      communicationsValue
    ], [{
      rule: 'isEmpty',
      errMsg: 'warning:咨询的内容不可为空'
    }]).execute();
  };

  /**
   * 输入进行咨询
   * @尹文楷
   */
  onPostMessageHandler = () => {
    const {verifyPostMessage} = this;
    if (verifyPostMessage()) {
      communicationsAPI.postConsultMessage.call(this);
    }
  };

  /**
   * 监听用户上拉触底事件
   * @尹文楷
   */
  onReachBottom() {
    const {total, communicationsList: {length}} = this.state;
    let {pageNum} = this.state;
    if (length < total) {
      this.setState({
        pageNum: ++pageNum
      }, () => {
        communicationsAPI.getCommunicationsList.call(this);
      });
    }
  }

  onSubmitHandler= (event) => {
    console.log('be quick');
    const {onPostMessageHandler} = this;
    communicationsAPI.getFormIdRequest(event.target.formId);

    onPostMessageHandler();
  };

  render() {
    const {
      communicationsValue,
      isFocus,
      communicationsList,
      communicationsOS,
      inputDistanceBoard
    } = this.state;
    const {
      onChangeValueHandler,
      onFocusHandler,
      onBlurHandler,
      onPostMessageHandler,
      onSubmitHandler
    } = this;
    return (
      <View className='pet-communications'>
        <AtMessage/>
        <View className='pet-communications-container'>
          <View className='pet-communications-os'>
            <AtAvatar
              className='pet-communications-os-avatar'
              circle
              size='large'
              image={communicationsOS['cnsltAvatarUrl']}
            />
            <View
              className='pet-communications-os-content'
            >
              <View
                className='pet-communications-os-content-username'
              >
                <Text
                  decode
                >
                  {communicationsOS["cnsltUsername"]}
                </Text>
              </View>
              <Text
                className='pet-communications-os-content-time'
              >
                {moment(communicationsOS["createTime"]).fromNow()}
              </Text>
              <Text
                className='pet-communications-os-content-master'
              >
                咨询提问
              </Text>
            </View>
          </View>
          <View
            className='pet-communications-qs'
          >
            <Text className='pet-communications-qs-content'>
              {communicationsOS["problemContent"]}
            </Text>
          </View>
        </View>
        <View
          className='pet-communications-qsContainer'
        >
          {
            communicationsList.length > 0 && communicationsList.map((communicationItem, communicationIndex) => {
              return (
                <View
                  key={`${communicationItem['id']}`}
                  className='pet-communications-item'
                >
                  <AtAvatar
                    className='pet-communications-item-avatar'
                    circle
                    size='normal'
                    image={communicationItem['avatarFrom']}
                  />
                  <View
                    className='pet-communications-item-content'
                  >
                    <View
                      className='pet-communications-item-content-username'
                    >
                      <Text
                        decode
                      >
                        {communicationItem['nicknameFrom']}
                      </Text>
                    </View>
                    <View
                      className='pet-communications-item-content-time'
                    >
                      <Text
                        decode
                      >
                        {moment(communicationItem["createTime"]).fromNow()}
                      </Text>
                    </View>
                    <View
                      className={`pet-communications-item-content-txt ${communicationItem["owner"] ? "grey" : null}`}
                    >
                      <Text>
                        {communicationItem["content"]}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          }
        </View>
        <View
          className='at-row at-row--no-wrap pet-communications-communicationsBar'
          style={{bottom: `${inputDistanceBoard}px`}}
        >
          <View className='at-col-10 pet-communications-communicationsBar-input'>
            <AtInput
              type='text'
              maxLength={100}
              className={cns(
                'pet-communications-communicationsBar-communicationsValue',
                {'pet-communications-communicationsBar-communicationsValue-focus': !!isFocus}
              )}
              confirmType='发送'
              placeholder='输入进行咨询'
              adjustPosition={false}
              value={communicationsValue}
              onChange={onChangeValueHandler}
              onFocus={onFocusHandler}
              onBlur={onBlurHandler}
              onConfirm={onPostMessageHandler}
            />
          </View>
          <View className='at-col-2 pet-communications-communicationsBar-post'>
            {/*按钮发布区域: 使用formId进行发起一次有formId的模板消息请求*/}
            <AtForm
              reportSubmit={true}
              style='border:none'
              className='next-btn'
              onSubmit={onSubmitHandler}
            >
              <AtButton
                size='small'
                className='pet-communications-communicationsBar-post-button'
                formType='submit'
              >
                发送
              </AtButton>
            </AtForm>
          </View>
        </View>
      </View>
    );
  }
}

export default Communications;
