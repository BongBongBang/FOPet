import Taro, {Component} from '@tarojs/taro';
import {
  Block,
  Image,
  View,
  Text
} from '@tarojs/components';
import {connect} from '@tarojs/redux';
import {
  AtAccordion,
  AtAvatar,
  AtButton,
  AtFab,
  AtIcon,
  AtModal,
  AtNoticebar,
  AtTag,
  AtBadge
} from 'taro-ui';
import StateMachine from 'javascript-state-machine';
import cns from 'classnames';
import qs from '../../../node_modules/querystring';
import * as constants from "./constants";
import Tools from "../../utils/petPlanetTools";
import {setAttendanceAttrValue, clearAttendanceAttrValue} from './attendance_action';
import homeAPI from '../index/home_service';
import attendanceAPI from './attendance_service';
import {LoadingView} from '../../components/bussiness-components';
import {imgs} from '../../assets';
import {staticData, pageCurrentList} from '../../utils/static';
import '../iconfont/iconfont.less';
import './attendance.less';
import './loading-view.less';

@connect((state) => {
  return {
    attendanceStore: state.attendanceStore
  };
}, (dispatch) => {
  return {
    /**
     * 多层对象处理方法
     * @param payload
     */
    setAttrValue(payload) {
      dispatch(setAttendanceAttrValue(payload));
    },
    /**
     * 初始化打卡页面的所有信息
     */
    clearAttrValue() {
      dispatch(clearAttendanceAttrValue());
    },
    /**
     * 向用户申请用户信息权限
     * @param scope
     */
    getSettingHandler(scope) {
      return dispatch(attendanceAPI.getSettingRequest.apply(this, [scope]));
    },
    /**
     * 同步用户信息
     * @param params
     */
    syncUserInfoHandler(params) {
      return dispatch(attendanceAPI.syncUserInfoRequest.apply(this, [params]));
    },
    /**
     * 获取个人页随机的头像和昵称
     */
    userTinyHomeInfoHandler() {
      return dispatch(attendanceAPI.userTinyHomeInfoRequest.apply(this));
    },
    /**
     * 在页面入口处同步微信用户授权后的用户信息
     * @param params
     * @returns {Function}
     */
    syncUserInfoPassHandler(params) {
      return dispatch(attendanceAPI.syncUserInfoPassRequest.apply(this, [params]));
    },
    /**
     * 获取用户openid
     */
    getUserOpenIdHandler() {
      return dispatch(homeAPI.getUserOpenId.call(this, function (data, header) {
        dispatch(setAttendanceAttrValue({openid: data}));
      }));
    },
    /**
     * 在用户授权之后获取用户个人信息
     * @returns {Function}
     */
    getUserInfoConfigHandler() {
      return dispatch(attendanceAPI.getUserInfoConfigRequest.apply(this));
    },
    /**
     * 进行打卡
     * @returns {Promise<void>}
     */
    communitySignHandler() {
      return dispatch(attendanceAPI.communitySignRequest.apply(this));
    },
    /**
     * 按照时间分组获取群打卡动态信息
     * @returns {Promise<AxiosResponse<any>|*>}
     */
    communityGroupLogsHandler(params) {
      return dispatch(attendanceAPI.communityGroupLogsRequest.apply(this, [params]));
    },
    /**
     * 获取用户打卡信息
     * @returns {function(*)}
     */
    communityHomeInfoHandler() {
      return dispatch(attendanceAPI.communityHomeInfoRequest.apply(this));
    }
  };
})
class Attendance extends Component {
  static options = {
    addGlobalClass: true
  };

  config = {
    navigationBarTitleText: '打卡',
    onReachBottomDistance: 188
  };

  constructor(props) {
    super(props);
    this.state = {
      //放大缩小动画状态的样式表
      classNames: 'pet-attendance-header-button',
      //伸展收缩手风琴状态的样式表
      AccordionClassNames: 'pet-attendance-content-accordion',
      //伸展收缩手风琴头部状态的样式表
      AccordionHeaderClassNames: 'pet-attendance-content-header',
      //伸展收缩手风琴头部状态图标的样式表
      AccordionHeaderIconClassNames: 'pet-attendance-content-header-viewDetail-icon',
      //打卡按钮的文本
      scaleButtonText: '立即打卡'
    };
    //全局容器滚动监听对象
    this.attendanceScrollListener = this.attendanceContainerScrollListener.bind(this);
    //打卡按钮时间延时器
    this.animateTimer = null;
    //放大缩小动画状态
    this.scaleAnimate = new StateMachine({
      init: '缩小',
      transitions: [{
        name: 'enlarge',
        from: '缩小',
        to: '放大'
      }, {
        name: 'narrow',
        from: '放大',
        to: '缩小'
      }, {
        name: 'narrow',
        from: '普通',
        to: '缩小'
      }, {
        name: 'normal',
        from: '缩小',
        to: '普通'
      }, {
        name: 'normal',
        from: '放大',
        to: '普通'
      }],
      methods: {
        //执行放大动作
        onEnlarge(state, data) {
          data.setState({
            classNames: cns(data.classNames, 'pet-attendance-header-button pet-attendance-header-button-enlarge')
          });
        },
        //执行转变为普通静止状态
        onNormal(state, data) {
          const {attendanceStore: {accordion: {dayOfTotal}}} = data.props;
          data.setState({
            classNames: cns(data.classNames, 'pet-attendance-header-button pet-attendance-header-button-normal'),
            scaleButtonText: dayOfTotal
          });
        },
        //执行缩小动作
        onNarrow(state, data) {
          data.setState({
            classNames: 'pet-attendance-header-button'
          });
        }
      }
    });
    //伸展收缩手风琴状态
    this.activeAccordion = new StateMachine({
      init: '收缩',
      transitions: [{
        name: 'stretch',
        from: '收缩',
        to: '伸展'
      }, {
        name: 'shrink',
        from: '伸展',
        to: '收缩'
      }],
      methods: {
        //执行伸展动作
        onStretch(state, data) {
          data.setState({
            AccordionClassNames: cns(
              'pet-attendance-content-accordion',
              'pet-attendance-content-accordionNoRadius'
            ),
            AccordionHeaderClassNames: cns(
              'pet-attendance-content-header',
              'pet-attendance-content-headerNoRadius'
            ),
            AccordionHeaderIconClassNames: cns(
              'pet-attendance-content-header-viewDetail-icon',
              'pet-attendance-content-header-viewDetail-icon-active'
            )
          });
        },
        //执行收缩动作
        onShrink(state, data) {
          data.setState({
            AccordionClassNames: 'pet-attendance-content-accordion',
            AccordionHeaderClassNames: 'pet-attendance-content-header',
            AccordionHeaderIconClassNames: 'pet-attendance-content-header-viewDetail-icon'
          });
        }
      }
    });
  }

  /**
   * 小程序页面在加载完毕的时候触发
   * @尹文楷
   */
  async componentDidMount() {
  }

  /**
   * 小程序页面在显示的时候触发
   * @尹文楷
   */
  async componentDidShow() {
    let {scene: params} = this.$router.params || {},
      params_decode;
    const {getUserInfoConfigHandler, syncUserInfoPassHandler, getUserOpenIdHandler, communityGroupLogsHandler, communityHomeInfoHandler} = this.props;
    if (decodeURIComponent(params) === 'undefined') {
      return false;
    }
    params_decode = qs.decode(decodeURIComponent(params));
    const {getSettingHandler, setAttrValue} = this.props;
    // 获取群唯一id openGid
    // 获取转发详细信息
    let isPermission = await getSettingHandler.apply(this, ['scope.userInfo']);
    let {authSetting: {['scope.userInfo']: userInfo}} = isPermission;
    await setAttrValue({
      openGid: params_decode['opengid']
    });
    if (userInfo) {
      setAttrValue({isPermission: true});

      //获取openid用户唯一id、nickName昵称和avatarUrl头像
      let openidInfo = await getUserOpenIdHandler.apply(this),
        data = await getUserInfoConfigHandler.apply(this);
      let openid = openidInfo.data;
      syncUserInfoPassHandler.apply(this, [{openid, ...data.userInfo}]);
      //头部放大缩小动画状态进行切换
      this.animateTimer = setInterval(() => {
        if (this.scaleAnimate.is('缩小')) {
          this.scaleAnimate.enlarge(this);
        } else {
          this.scaleAnimate.narrow(this);
        }
      }, 600);
      //获取群动态列表
      await communityGroupLogsHandler.apply(this, [{
        pageNum: 1,
        pageSize: staticData['pageSize']
      }]);
      //获取用户打卡信息
      let {data: {signed}} = await communityHomeInfoHandler.apply(this);
      if (signed) {
        this.scaleAnimate.normal(this);
        clearInterval(this.animateTimer);
        this.animateTimer = null;
      }
    } else {
      setAttrValue({
        isPermission: false,
        isLoading: false
      });
    }
  }

  /**
   * 小程序页面在隐藏的时候触发
   * @尹文楷
   */
  componentDidHide() {
    const {clearAttrValue} = this.props;
    // 初始化打卡页面的所有信息
    clearAttrValue();
    this.setState({
      //打卡按钮的文本
      scaleButtonText: '立即打卡'
    });
    this.scaleAnimate.narrow(this);
    clearInterval(this.animateTimer);
    this.animateTimer = null;
  }

  /**
   * 添加监听全局容器滚动事件
   */
  async attendanceContainerScrollListener() {
    let {attendanceStore: {pageNum, total, signList, throttle}, setAttrValue, communityGroupLogsHandler} = this.props;
    const {length} = signList;
    //当用户上拉触底时请求下一页数据
    //@尹文楷
    if ((length < total) && throttle) {
      await setAttrValue({
        throttle: false
      });
      await communityGroupLogsHandler.apply(this, [{pageNum: ++pageNum}]);
    }
  }

  /**
   * 获取用户信息
   * @尹文楷
   */
  async getUserInfoHandler({target: {userInfo}}) {
    const {setAttrValue, syncUserInfoHandler, getUserOpenIdHandler, communityGroupLogsHandler, communityHomeInfoHandler} = this.props;
    if (userInfo) {
      setAttrValue({isPermission: true, isLoading: true});
      //获取openid用户唯一id、nickName昵称和avatarUrl头像
      let openidInfo = await getUserOpenIdHandler.apply(this);
      syncUserInfoHandler.apply(this, [{openid: openidInfo.data, ...userInfo}]);
      //头部放大缩小动画状态进行切换
      this.animateTimer = setInterval(() => {
        if (this.scaleAnimate.is('缩小')) {
          this.scaleAnimate.enlarge(this);
        } else {
          this.scaleAnimate.narrow(this);
        }
      }, 600);
      //获取群动态列表
      await communityGroupLogsHandler.apply(this, [{
        pageNum: 1,
        pageSize: staticData['pageSize']
      }]);
      //获取用户打卡信息
      let {data: {signed}} = await communityHomeInfoHandler.apply(this);
      if (signed) {
        this.scaleAnimate.normal(this);
        clearInterval(this.animateTimer);
        this.animateTimer = null;
      }
    } else {
      setAttrValue({
        isPermission: false
      });
    }
  }

  /**
   * 进行打卡
   */
  async communitySignOperator() {
    const {communitySignHandler} = this.props;
    await communitySignHandler.call(this);
  }

  /**
   * 监听用户上拉触底事件
   */
  onReachBottom() {
    const {attendanceScrollListener} = this;
    attendanceScrollListener();
  }

  /**
   * 点击宠物医疗按钮跳转到问诊页面
   */
  navigateToMedicalAdvice(e) {
    Taro.redirectTo({
      url: pageCurrentList[2]
    });
    //取消冒泡事件
    e.stopPropagation();
  }

  render() {
    const {classNames, AccordionClassNames, AccordionHeaderClassNames, AccordionHeaderIconClassNames, scaleButtonText} = this.state;
    const {attendanceStore: {isPermission, isLoading, accordion: {activeKey, hasMessage, dayOfMonth, coin, score, groupName, rank, dayOfContinuity, coinToday, scoreToday, signTime, signed}, isSignedClick, signObject, signObjectType, modal: {sign: {isSigned, data: {remarks}}}}, setAttrValue} = this.props;
    const {
      getUserInfoHandler,
      communitySignOperator,
      navigateToMedicalAdvice
    } = this;
    //先将群动态对象转为二维数组
    let signArr = signObject && Object.entries(signObject);
    return (
      <View
        className='pet-attendance'
      >
        {
          isLoading && <LoadingView
            size={56}
            color='#fb2a5d'
            content={constants.loading.text}
            className='pet-attendance-activity-indicator'
          />
        }
        {
          !isPermission && <View className='pet-attendance-alert'>
            <AtAvatar
              size='large'
              circle
              image={imgs['petPlanetLogo']}
              className='pet-attendance-alert-avatar'
            />
            <View className='pet-attendance-alert-content'>
              {constants.permission.alert}
            </View>
            <AtButton
              className='pet-attendance-alert-button'
              size='normal'
              type='primary'
              openType='getUserInfo'
              onGetUserInfo={getUserInfoHandler.bind(this)}
            >
              授权登录
            </AtButton>
          </View>
        }
        {
          isPermission && <View
            className='pet-attendance-container'
          >
            {/*打卡通告栏部分*/}
            <AtNoticebar
              single
              marquee={false}
              className='pet-attendance-noticeBar'
            >
              打卡升级手动模式啦，点击头部'打卡按钮'即可打卡成功~~
            </AtNoticebar>
            {/*打卡主体头部 —— 背景 + 打卡按钮*/}
            <View className='pet-attendance-header'>
              <Image
                className='pet-attendance-header-bg'
                mode='widthFix'
                src='https://api.csg.1jtec.club/tinyStatics/imgs/bg_attendance.png'
                alt='打卡 - 背景图'
              />
              <AtButton
                type='primary'
                size='large'
                disabled={isSignedClick}
                className={classNames}
                onClick={async () => {
                  await setAttrValue({isSignedClick: true});
                  await communitySignOperator.apply(this);
                  //取消冒泡
                  return false;
                }}
              >
                {signed ? (
                  <Block>
                    <Text>
                      总打卡
                    </Text>
                    <Text className='pet-attendance-header-button-dayOfTotal'>
                      {`${scaleButtonText}天`}
                    </Text>
                  </Block>
                ) : scaleButtonText}
              </AtButton>
            </View>
            {/*打卡内容部分 —— 打卡信息 + 打卡查看详情*/}
            <View
              className='pet-attendance-content'
            >
              <View
                className={AccordionHeaderClassNames}
                onClick={(event) => {
                  let that = this;
                  Tools.throttle(() => {
                    if (that.activeAccordion.is('收缩')) {
                      that.activeAccordion.stretch(that);
                    } else {
                      that.activeAccordion.shrink(that);
                    }
                    setAttrValue({
                      accordion: {
                        activeKey: !activeKey
                      }
                    });
                  }, 400);
                  //取消冒泡事件
                  event.stopPropagation();
                }}
              >
                <View className='pet-attendance-content-header-groupName'>
                  {groupName}
                </View>
                <View>
                  <Image
                    className='pet-attendance-content-header-icon'
                    src={imgs['sign_attendance']}
                    alt='月打卡天数图标'
                    mode='widthFix'
                  />
                  月打卡 <Text className='pet-attendance-content-header-item' decode>
                  {dayOfMonth ? dayOfMonth : 0}&nbsp;天
                </Text>
                </View>
                <View>
                  <Image
                    className='pet-attendance-content-header-icon'
                    src={imgs['coin_attendance']}
                    alt='金币图标'
                    mode='widthFix'
                  />
                  金币 <Text className='pet-attendance-content-header-item' decode>{coin ? coin : 0}&nbsp;枚</Text>
                  <AtTag
                    type='normal'
                    className='pet-attendance-content-header-tag'
                  >
                    <Text decode>总积&nbsp;{score}&nbsp;分</Text>
                  </AtTag>
                </View>
                <View className='pet-attendance-content-header-viewDetail'>
                  查看详情
                  <AtIcon
                    className={AccordionHeaderIconClassNames}
                    value='chevron-down'
                    size={16}
                    color='#888'
                  />
                </View>
              </View>
              <AtAccordion
                open={activeKey}
                hasBorder={false}
                className={AccordionClassNames}
              >
                <View
                  className='pet-attendance-content-accordion-detail'
                >
                  {
                    signed ? <Block>
                      <Text
                        className='pet-attendance-content-accordion-detail-todaySign'
                      >
                        今日打卡
                      </Text>
                      <View className='at-row at-row--no-wrap'>
                        <View
                          className='pet-attendance-content-accordion-detail-row'
                        >
                          <Text decode>
                            排第&nbsp;{rank ? rank : 0}&nbsp;名
                          </Text>
                        </View>
                        <View
                          className='pet-attendance-content-accordion-detail-row'
                        >
                          <Text decode>
                            积&nbsp;{scoreToday ? scoreToday : 0}&nbsp;分
                          </Text>
                        </View>
                        <View
                          className='pet-attendance-content-accordion-detail-row'
                        >
                          <Text decode>
                            金币&nbsp;{coinToday ? coinToday : 0}&nbsp;枚
                          </Text>
                        </View>
                      </View>
                      <View className='at-col'>
                        <View className='pet-attendance-content-accordion-detail-row'>
                          <Text decode>
                            连续打卡&nbsp;{dayOfContinuity ? dayOfContinuity : 0}&nbsp;天
                          </Text>
                        </View>
                        <View className='pet-attendance-content-accordion-detail-row'>打卡时间: {signTime}</View>
                      </View>
                    </Block> : <View className='pet-attendance-content-accordion-detail-empty'>
                      <AtIcon
                        prefixClass='iconfont'
                        value='petPlanet-time'
                        color='#000'
                        size={24}
                      />
                      今日还未打卡,立即去打卡吧~~
                    </View>
                  }
                </View>
              </AtAccordion>
            </View>
            <View className='pet-attendance-list'>
              <Text className='pet-attendance-list-title'>
                群动态列表
              </Text>
              {
                (signArr && signArr.length > 0) ?
                  <View
                    className='pet-attendance-list-component'
                  >
                    {
                      signArr.map((signItem, signIndex) => {
                        return (
                          <View
                            key={signIndex}
                            className='pet-attendance-list-component-container'
                          >
                            <View
                              className='pet-attendance-list-component-container-header'
                            >
                              {signObjectType[signIndex] === 'signed' ?
                                <AtIcon
                                  prefixClass='iconfont'
                                  value='petPlanet-success'
                                  size={22}
                                  color='rgb(57, 142, 226)'
                                /> : <AtIcon
                                  prefixClass='iconfont'
                                  value='petPlanet-signPosition'
                                  size={20}
                                  color='rgb(57, 142, 226)'
                                />
                              }
                              <Text
                                className='pet-attendance-list-component-container-header-title'
                              >
                                {signItem[0]}
                              </Text>
                            </View>
                            <View
                              className='pet-attendance-list-component-container-content'
                            >
                              <View
                                className={signObjectType[signIndex] === 'signed' ?
                                  'pet-attendance-list-component-container-content-tail pet-attendance-list-component-container-content-tail-signed' :
                                  'pet-attendance-list-component-container-content-tail'
                                }
                              >
                              </View>
                              {
                                signItem[1].map((infoItem, infoIndex) => {
                                  let infoArr = infoItem["info"].split("，"),
                                    infoObj = {},
                                    infoObjArr = [],
                                    infoRank = null,
                                    infoSignTime = null,
                                    infoRankArr = [],
                                    infoSignTimeArr = [];
                                  infoArr.shift();
                                  infoSignTime = infoArr.pop();
                                  infoRank = infoArr.shift();
                                  infoRankArr = infoRank.split("：");
                                  infoSignTimeArr = infoSignTime.split("：");
                                  infoArr.forEach((item, index) => {
                                    let _item = item.split("：");
                                    infoObj[_item[0]] = _item[1];
                                  });
                                  infoObjArr = Object.entries(infoObj);
                                  return (
                                    <View
                                      key={infoIndex}
                                      className='pet-attendance-list-component-container-content-row'
                                    >
                                      <View className='pet-attendance-list-component-container-content-row-aside'>
                                        <Image
                                          className='pet-attendance-list-component-container-content-row-aside-avatar'
                                          src={infoItem['avatarUrl']}
                                          alt={`${infoItem['nickName']}头像`}
                                          lazyLoad={true}
                                        />
                                        <Text>{infoItem['nickName']}</Text>
                                        <Text
                                          decode
                                          className='pet-attendance-list-component-container-content-row-aside-rank'
                                        >
                                          当日
                                          <Text
                                            decode
                                            className='pet-attendance-list-component-container-content-row-aside-rank-val'
                                          >
                                            {infoItem['rank']}
                                          </Text>
                                        </Text>
                                      </View>
                                      <View className='pet-attendance-list-component-container-content-row-message'>
                                        <Text
                                          className='pet-attendance-list-component-container-content-row-message-item'
                                          decode
                                        >
                                          获得&nbsp;
                                          <Text
                                            decode
                                            className='pet-attendance-list-component-container-content-row-message-item-val'
                                          >
                                            {infoItem['coin']}金币
                                          </Text>
                                        </Text>
                                        <Text
                                          className='pet-attendance-list-component-container-content-row-message-item'
                                          decode
                                        >
                                          <Text
                                            decode
                                            className='pet-attendance-list-component-container-content-row-message-item-val'
                                          >
                                            {infoItem['score']}积分\n
                                          </Text>
                                        </Text>
                                        <Text
                                          className='pet-attendance-list-component-container-content-row-message-item'
                                          decode
                                        >
                                          连续&nbsp;
                                          <Text
                                            decode
                                            className='pet-attendance-list-component-container-content-row-message-item-val'
                                          >
                                            {infoItem['continueDay']}
                                          </Text> 天
                                        </Text>
                                        <Text
                                          className='pet-attendance-list-component-container-content-row-message-item'
                                          decode
                                        >
                                          总计&nbsp;
                                          <Text
                                            decode
                                            className='pet-attendance-list-component-container-content-row-message-item-val'
                                          >
                                            {infoItem['totalDay']}
                                          </Text> 天
                                        </Text>
                                        <View className='pet-attendance-list-component-container-content-row-signTime'>
                                          <Text
                                            decode
                                          >
                                            打卡时间
                                          </Text>
                                          <Text
                                            decode
                                          >
                                            {`&nbsp;${infoItem['signTime']}`}
                                          </Text>
                                        </View>
                                      </View>
                                    </View>
                                  );
                                })
                              }
                            </View>
                          </View>
                        );
                      })
                    }
                  </View> : //在群动态列表为空时,渲染为空状态时的UI
                  <View className='pet-attendance-list-noSignList'>
                    <AtIcon
                      prefixClass='iconfont'
                      value='petPlanet-empty'
                      color='rgba(0, 0, 0, .25)'
                      size={48}
                    />
                    {constants.emptyList.content}
                  </View>
              }
            </View>
            <AtModal
              className='pet-attendance-modal'
              isOpened={isSigned}
              closeOnClickOverlay={false}
              title={constants.modal.isSigned.title}
              confirmText={constants.modal.isSigned.confirmText}
              content={remarks}
              onConfirm={() => {
                setAttrValue({
                  modal: {
                    sign: {
                      isSigned: false
                    }
                  }
                });
              }}
            />
            <View
              className='pet-attendance-fab'
            >
              {/*<AtFab*/}
              {/*  className='pet-attendance-fab-hypermarket'*/}
              {/*  name='hypermarket'*/}
              {/*>*/}
              {/*  <Text*/}
              {/*    className='pet-attendance-fab-inner pet-attendance-fab-inner-hypermarket-text'*/}
              {/*  >*/}
              {/*    <Text className='at-fab__icon iconfont iconfont-petPlanet-hypermarket'>*/}

              {/*    </Text>*/}
              {/*    <Text className='pet-attendance-fab-text-content'>*/}
              {/*      拉旦木商城*/}
              {/*    </Text>*/}
              {/*  </Text>*/}
              {/*</AtFab>*/}
              <AtBadge
                dot={hasMessage}
              >
                <AtFab
                  className='pet-attendance-fab-medicalAdvice'
                  onClick={navigateToMedicalAdvice}
                >
                  <View
                    className='pet-attendance-fab-inner pet-attendance-fab-inner-medicalAdvice-text'
                  >
                    <Image className='pet-attendance-fab-inner-icon'
                           src={imgs.medicalAdvice_white}
                           mode='widthFix'
                    >

                    </Image>
                    <Text className='pet-attendance-fab-text-content'>
                      宠医问诊
                    </Text>
                  </View>
                </AtFab>
              </AtBadge>
            </View>
          </View>
        }
      </View>
    );
  }
}

export default Attendance;
