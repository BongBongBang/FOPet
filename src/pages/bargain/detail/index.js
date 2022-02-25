import Taro, {Component} from '@tarojs/taro';
import {
  Block,
  Image,
  View,
  Text,
  ScrollView
} from '@tarojs/components';
import {
  AtAvatar,
  AtButton,
  AtIcon,
  AtMessage,
  AtRate,
  AtTabs,
  AtTabsPane,
  AtLoadMore,
  AtFloatLayout
} from 'taro-ui';
import cns from 'classnames';
import dayjs from 'dayjs';
import {LdmNavBar} from 'ldm-taro-frc';

import Tools from '../../../utils/petPlanetTools';
import bargainDetailAPI from './detail_service';
import {loadingStatus, pageCurrentList, staticData} from '../../../constants';
import * as constants from './constants';
import {
  DialogView,
  EmptyView,
  LoadingView,
  ModalView
} from '../../../components/bussiness-components';
import {imgs} from '../../../assets';

import 'taro-ui/dist/style/components/divider.scss';
import 'taro-ui/dist/style/components/avatar.scss';
import 'taro-ui/dist/style/components/button.scss';
import 'taro-ui/dist/style/components/flex.scss';
import 'taro-ui/dist/style/components/float-layout.scss';
import 'taro-ui/dist/style/components/message.scss';
import 'taro-ui/dist/style/components/input-number.scss';
import 'taro-ui/dist/style/components/icon.scss';
import 'taro-ui/dist/style/components/rate.scss';
import 'taro-ui/dist/style/components/tabs.scss';
import 'taro-ui/dist/style/components/loading.scss';
import 'taro-ui/dist/style/components/modal.scss';
import 'taro-ui/dist/style/components/activity-indicator.scss';

import '../../commons/iconfont/iconfont.less';
import './loading-view.less';
import './modal-view.less';
import './dialog-view.less';
import './index.less';

class BargainDetail extends Component {
  config = {
    navigationBarTitleText: '砍价商品详情',
    navigationStyle: 'custom'
  };

  static options = {
    addGlobalClass: true
  };

  constructor(props) {
    super(props);
    //是否存在下一页数据
    this.isNext = true;
  }

  state = {
    //限量库存
    stock: 0,
    //商品id
    goodsId: 0,
    //当前选中的标签索引值，从0计数，通过 onClick 事件来改变 current，从而切换 tab
    current: 0,
    //页码
    pageNum: 1,
    //获取每页的数量
    pageSize: 20,
    //评论的总数
    total: 0,
    //需要多少人砍
    cutPersonTotal: 0,
    //需要都少个小时内砍完
    cutHourTotal: 0,
    //评论列表
    commentsList: [],
    //评论区域的列表
    comments: [],
    //是否显示正在加载loading页面......
    loading: true,
    //是否显示状态组件
    isShowLoad: false,
    //加载状态
    loadStatus: staticData.loadStatusConfig.loading,
    //轮播图
    images: [],
    //售价
    salePrice: '',
    //可以看到的底价
    floorPrice: '',
    //砍价结果
    cutPrice: '',
    //当前本人砍价价格
    currentCutPrice: 0,
    //封面图
    coverPic: '',
    //商品名称
    goodsName: '',
    //砍价商品的活动编码
    cutSaleNo: '',
    //商品描述详情图片
    detailImages: [],
    //是否砍价成功
    isCutSaleSuccess: false,
    //商品详情的id
    id: 0,
    //是否出现发货说明底部弹窗
    descDialog: false,
    //当前用户的该砍价活动的砍价案例，若用户已发起且在有效期内
    cutSaleCase: {},
    //分享砍价用户的身份
    caseState: 'FOUNDER',
    //砍价案例id
    caseId: null,
    //是否是分享的卡片
    share: '',
    //是否可以砍价
    disabled: false,
    //砍价订阅弹层
    cutSaleDialog: false,
    //砍价类别名称
    cutSaleName: '',
    //用户是否触发过'总是保持以上选择，不再询问'
    isAlways: false,
    //是否通过订阅消息了解砍价已经完成
    cutSaleState: ''
  };

  componentWillMount() {
    const {params: {id = 0, goodsId = 0, caseId = null, share = '', cutSaleName = ''}} = this.$router;
    this.setState({
      id,
      goodsId,
      caseId,
      share,
      cutSaleName
    });
  }

  componentDidMount() {
    bargainDetailAPI.getBargainDetail.call(this);
    bargainDetailAPI.getCommonCommentList.call(this);
  }

  componentDidShow() {
    Taro.hideShareMenu();
  }

  /**
   * 切换tab、输入或者选择表单组件时,统一的触发事件处理
   */
  onChangeHandler = (type = '', value = '') => {
    value = value.target ? value.target.value : value;
    this.setState({
      [type]: value
    });
  };

  /**
   * 页面跳到上一页
   */
  redirectToBackPage = () => {
    Taro.navigateBack({
      delta: 1
    });
  };

  /**
   * 在新页面中全屏预览图片。预览的过程中用户可以进行保存图片、发送给朋友等操作。
   * @param value
   */
  onPreviewImage = (value) => {
    const {images = []} = this.state;
    Tools.previewImageConfig({
      urls: images,
      current: value,
      success: (res) => {
        console.log(res);
      },
      complete: (res) => {
        console.log(res);
      }
    });
  };

  /**
   * 在新页面中全屏预览图片。预览的过程中用户可以进行保存图片、发送给朋友等操作。
   * @param value
   */
  onPreviewDetailImage = (value) => {
    const {detailImages = []} = this.state;
    Tools.previewImageConfig({
      urls: detailImages,
      current: value,
      success: (res) => {
        console.log(res);
      },
      complete: (res) => {
        console.log(res);
      }
    });
  };

  /**
   * 打开或者关闭底部弹层
   */
  onDialogChange = (type) => {
    const {[type]: dialog = false} = this.state;
    this.setState({
      [type]: !dialog
    });
  };

  /**
   * 校验砍价
   */
  verify = () => {
    const {
      stock = ''
    } = this.state;
    return Tools.addRules([
        stock > 0
      ], [{
        rule: 'isEmpty',
        errMsg: constants.verify.isEmpty
      }]
    ).execute();
  };

  /**
   * 点击确定进行砍价
   * @param e
   * @returns {Promise<void>}
   */
  onEnsureBuyClick = async (e = {}) => {
    const {
      verify = () => {
      }
    } = this;
    const {
      caseState = 'FOUNDER'
    } = this.state;
    let {authSetting} = await Tools.getSettingConfig({
      success: (authSetting) => {
        return authSetting;
      },
      fail: (res) => {
        return res;
      },
      complete: (res) => {
        return res;
      }
    });
    if (!authSetting['scope.userInfo']) {
      Taro.navigateTo({
        url: `${pageCurrentList[20]}?pages=bargainDetail`
      });
    } else {
      if (verify()) {
        caseState === 'FOUNDER' ? bargainDetailAPI.startCutSale.call(this) : bargainDetailAPI.helpCutSale.call(this);
      }
    }
    //取消冒泡事件
    e.stopPropagation();
  };

  /**
   * 评价区域滚动触发事件
   */
  onCommentScrollHandler = ({detail: {scrollHeight = 0, scrollTop = 0}}) => {
    const {
      total = 0,
      comments = []
    } = this.state;
    let {
      isNext = true
    } = this;
    Taro.createSelectorQuery().select('#detail-comments').fields({
      size: true
    }, res => {
      let height = res.height,
        length = comments.length;
      if (((scrollHeight - (scrollTop + height)) / scrollHeight < 0.02) && (length < total) && isNext) {
        this.isNext = false;
        this.setState({
          isShowLoad: true,
          loadStatus: staticData.loadStatusConfig.loading
        }, () => {
          bargainDetailAPI.getCommentList.call(this);
        });
      }
    }).exec();
  }

  /**
   * 点击或者滑动引起切换动作
   */
  onChangeTabHandler = (current) => {
    const {
      onChangeHandler = () => {
      }
    } = this;
    onChangeHandler('current', current);
    if (current !== 0) {
      this.setState({
        pageNum: 1,
        //是否显示正在加载loading页面......
        loading: true,
        //是否显示状态组件
        isShowLoad: false,
        //加载状态
        loadStatus: staticData.loadStatusConfig.loading,
        //评论区域的列表
        comments: [],
        //评论的总数
        total: 0
      }, () => {
        bargainDetailAPI.getCommentList.call(this);
      });
    }
  };

  /**
   * 渲染商品详情
   */
  renderDetail = () => {
    const {
      images = [],
      floorPrice = '',
      salePrice = '',
      cutPrice = '',
      cutPersonTotal = 0,
      goodsName = '',
      detailImages = [],
      commentsList = [],
      cutHourTotal = 0,
      stock = 0,
      cutSaleCase = {},
      cutSaleName = ''
    } = this.state;
    const {
      helperQueue = []
    } = cutSaleCase || {};
    const {length = 0} = images;
    const {length: helperLength = 0} = helperQueue;
    const {rulesConfig = []} = constants;
    const toolsProgress = helperLength !== 0 ? (helperLength / cutPersonTotal).toFixed(2) : 0;
    const {
      onPreviewImage = () => {
      },
      onPreviewDetailImage = () => {
      },
      onDialogChange = () => {
      },
      onChangeHandler = () => {
      }
    } = this;
    const {
      isX = false
    } = Tools.adaptationNavBar();
    return (
      <ScrollView
        className={cns(
          'bargainDetail-scroll',
          {
            'bargainDetail-scrollX': !!isX
          }
        )}
        scrollY
      >
        <View className='bargainDetail-show'>
          <Swiper
            className='bargainDetail-swiper'
            autoplay
          >
            {
              images && length > 0 && images.map((imageItem, imageIndex) => {
                return (
                  <SwiperItem key={imageItem}
                              className='bargainDetail-swiper-item'
                              onClick={() => onPreviewImage(imageItem)}
                  >
                    <Image
                      mode='aspectFill'
                      src={imageItem}
                      className='bargainDetail-swiper-item-image'
                    />
                    <Text className='bargainDetail-swiper-item-current'>
                      {imageIndex + 1}/{length}
                    </Text>
                  </SwiperItem>
                )
              })
            }
          </Swiper>
          {
            commentsList.length > 0 && <View
              className={cns(
                'bargainDetail-comments',
                {
                  'bargainDetail-comments-single': commentsList.length <= 1
                }
              )}
            >
              <Swiper
                autoplay
                vertical
                displayMultipleItems={commentsList.length > 1 ? 2 : 1}
                circular
                className='bargainDetail-comments-swiper'
              >
                {
                  commentsList && commentsList.length > 0 && commentsList.map((comment, commentIndex) => {
                    return <SwiperItem
                      key={commentIndex}
                      className='bargainDetail-comments-swiperItem'
                      onClick={(e) => {
                        onChangeHandler('current', 1);
                        //取消冒泡事件
                        e.stopPropagation();
                      }}
                    >
                      <View className='bargainDetail-comments-item'>
                        <View className='bargainDetail-comments-item-detail'>
                          <AtAvatar
                            image={comment.avatarUrl}
                            size='small'
                            circle
                            className='bargainDetail-comments-item-avatar'
                          />
                          <View className='bargainDetail-comments-item-user'>
                            {comment.nickName}
                          </View>
                          <AtRate
                            size={12}
                            value={comment.score}
                            className='bargainDetail-comments-item-rate'
                          />
                        </View>
                        <View className='bargainDetail-comments-item-mark'>
                          {comment.mark}
                        </View>
                        <View className='bargainDetail-comments-item-time'>
                          {dayjs(comment.createTime, 'YYYY-MM-DDTHH:mm:ss.000ZZ').format('YYYY-MM-DD HH:mm:ss')}
                        </View>
                      </View>
                    </SwiperItem>
                  })
                }
              </Swiper>
            </View>
          }
        </View>
        <View className='bargainDetail-skuOptions'>
          <View className='bargainDetail-skuOptions-floorPrice'>
            <View className='bargainDetail-skuOptions-floorPrice-main'>
              <Text className='bargainDetail-skuOptions-floorPrice-title'>
                底价:
              </Text>
              <Text className='bargainDetail-skuOptions-floorPrice-symbol'>
                &#165;
              </Text>
              {parseFloat(floorPrice / 100)}
            </View>
            <View className='bargainDetail-skuOptions-salePrice'>
              <AtIcon
                prefixClass='iconfont'
                value='petPlanet-taobao'
                size={18}
                color='#ee5d2a'
              />
              <AtIcon
                prefixClass='iconfont'
                value='petPlanet-tmall'
                size={18}
                color='rgb(188,39,26)'
              />
              <View className='bargainDetail-skuOptions-salePrice-real'>
                <Text className='bargainDetail-skuOptions-salePrice-symbol'>
                  &#165;
                </Text>
                {parseFloat(salePrice / 100)}
              </View>
            </View>
          </View>
          <View className='bargainDetail-skuOptions-sales'>
            限量{stock}单
          </View>
        </View>
        <View className='bargainDetail-tips'>
          <Text className='bargainDetail-tips-tag'>
            {cutPersonTotal}人砍
          </Text>
          <Text className='bargainDetail-tips-isPost'>
            包邮
          </Text>
          <Text className='bargainDetail-tips-cutHour'>
            限时{cutHourTotal}小时
          </Text>
        </View>
        <View className='bargainDetail-progress'>
          <View className='bargainDetail-progress-container'>
            <View
              className='bargainDetail-progress-bar'
              style={{
                left: toolsProgress ? parseFloat(toolsProgress) === 1 ? 'calc(100% - 88PX)' : `${parseFloat(toolsProgress) * 100}%` : 0,
                marginLeft: toolsProgress ? parseFloat(toolsProgress) === 1 ? 0 : '-44PX' : 0
              }}
            >
              当前价: &#165;{parseFloat(cutPrice / 100)}
            </View>
            <View
              className='bargainDetail-progress-tools'
            >

            </View>
          </View>
          <View className='bargainDetail-progress-desc'>
            <Text className='bargainDetail-progress-desc-salePrice'>
              原价: &#165;{parseFloat(salePrice / 100)}
            </Text>
            <Text className='bargainDetail-progress-desc-floorPrice'>
              底价: &#165;{parseFloat(floorPrice / 100)}
            </Text>
          </View>
        </View>
        <View className='bargainDetail-goods'>
          <View className='bargainDetail-goods-goodsName'>
            {goodsName}
          </View>
          <View className='bargainDetail-goods-symbol'>
            #{cutSaleName}
          </View>
          <View className='bargainDetail-goods-service'>
            <View className='bargainDetail-goods-service-container'>
              <View className='bargainDetail-goods-service-content'>
                {
                  rulesConfig && rulesConfig.length > 0 && rulesConfig.map((ruleItem, ruleIndex) => {
                    return <View
                      key={ruleIndex}
                      className='bargainDetail-goods-service-content-item'
                    >
                      <AtIcon
                        className={cns(
                          'bargainDetail-goods-service-content-item-icon',
                          ruleItem.className
                        )}
                        prefixClass='iconfont'
                        value={ruleItem.icon}
                        size={ruleItem.isSaveMoney ? 28 : 18}
                        color='#979797'
                      />
                      {ruleItem['text']}
                    </View>
                  })
                }
              </View>
            </View>
          </View>
          <View className='bargainDetail-goods-bargainDesc'>
            <View className='bargainDetail-goods-bargainDesc-desc'
                  onClick={() => onDialogChange('descDialog')}
            >
              发货说明
              <AtIcon
                size={12}
                color='#999'
                className='pet-flowPublish-publish-content-topic-content-icon'
                prefixClass='iconfont'
                value='petPlanet-right'
              />
            </View>
          </View>
          <View className='bargainDetail-goods-goodsDetail'>
            <View className='bargainDetail-goods-goodsDetail-title'>商品详情</View>
            {
              detailImages && detailImages.length > 0 && detailImages.map(detailItem => {
                return <Image
                  key={detailItem}
                  src={detailItem}
                  className='bargainDetail-goods-goodsDetail-item'
                  mode='widthFix'
                  onClick={() => onPreviewDetailImage(detailItem)}
                >
                </Image>
              })
            }
          </View>
        </View>
      </ScrollView>
    );
  };

  /**
   * 渲染评论区域
   */
  renderComments = () => {
    const {
      comments = [],
      total = 0,
      isShowLoad = false,
      loadStatus = staticData.loadStatusConfig.loading
    } = this.state;
    const {
      onCommentScrollHandler = () => {
      }
    } = this;
    const {
      isX = false
    } = Tools.adaptationNavBar();
    return <ScrollView
      id='bargainDetail-comments'
      className={cns(
        'bargainDetail-commentsArea',
        {
          'bargainDetail-commentsAreaX': !!isX
        }
      )}
      scrollY
      onScroll={onCommentScrollHandler}
    >
      {
        comments && comments.length > 0 ? comments.map((commentItem, commentIndex) => {
          return <View
            key={commentIndex}
            className='bargainDetail-commentsArea-item'
          >
            <View className='bargainDetail-commentsArea-item-header'>
              <AtAvatar
                image={commentItem.avatarUrl}
                size='small'
                circle
                className='bargainDetail-commentsArea-item-header-avatar'
              />
              {commentItem.nickName}
              <AtRate
                value={commentItem.score}
                size={14}
                className='bargainDetail-commentsArea-item-header-rate'
              />
            </View>
            <View className='bargainDetail-commentsArea-item-mark'>
              {commentItem.mark}
            </View>
            <View className='bargainDetail-commentsArea-item-time'>
              {dayjs(commentItem.createTime, 'YYYY-MM-DDTHH:mm:ss.000ZZ').format('YYYY-MM-DD HH:mm:ss')}
            </View>
          </View>
        }) : <EmptyView
          className='bargainDetail-commentsArea-empty'
          prefix='iconfont'
          icon='petPlanet-cat-ao'
          size={48}
          color='#000'
          title='啊哦~~~'
          description='铲屎官没有发现任何评论'
        />
      }
      {
        (isShowLoad && total !== 0) ? <AtLoadMore
          className='bargainDetail-commentsArea-loadMore'
          status={loadStatus}
        >
        </AtLoadMore> : <View className='bargainDetail-commentsArea-block'>
        </View>
      }
    </ScrollView>
  }

  /**
   * 渲染砍价区域
   */
  renderBargain = () => {
    const {
      cutSaleCase = {}
    } = this.state;
    const {
      onCommentScrollHandler = () => {
      }
    } = this;
    const {helperQueue = []} = cutSaleCase || {};
    return <ScrollView
      id='bargainDetail-list'
      className='bargainDetail-helperListArea'
      scrollY
      onScroll={onCommentScrollHandler}
    >
      {
        helperQueue && helperQueue.length > 0 ? helperQueue.map((helperItem, helperIndex) => {
          return <View
            key={helperIndex}
            className='bargainDetail-helperListArea-item'
          >
            <View className='bargainDetail-helperListArea-item-header'>
              <AtAvatar
                image={helperItem.avatar}
                size='small'
                circle
                className='bargainDetail-helperListArea-item-header-avatar'
              />
              {helperItem.nickname}
            </View>
            <View className='bargainDetail-helperListArea-item-cutPrice'>
              {helperItem.nickname}帮你砍掉了
              <Text className='bargainDetail-helperListArea-item-cutPrice-detail'>
                ¥{parseFloat(helperItem.cutPrice / 100)}
              </Text>
            </View>
            <View className='bargainDetail-helperListArea-item-time'>
              {dayjs(helperItem.cutTime, 'YYYY-MM-DDTHH:mm:ss.000ZZ').format('YYYY-MM-DD HH:mm:ss')}
            </View>
          </View>
        }) : <EmptyView
          className='bargainDetail-helperListArea-empty'
          prefix='iconfont'
          icon='petPlanet-cat-ao'
          size={48}
          color='#000'
          title='啊哦~~~'
          description='铲屎官没有发现任何砍价'
        />
      }
    </ScrollView>
  };

  /**
   * 各类弹窗是否显示
   */
  onModalChangeHandler = (type = '') => {
    const {[type]: _type = false} = this.state;
    this.setState({
      [type]: !_type
    });
  };

  /**
   * 分享页面回到'好物'首页
   * @尹文楷
   */
  backToMasterHome = () => {
    Taro.redirectTo({
      url: `${pageCurrentList[2]}`
    });
  };

  /**
   * "助力者"我也要玩儿跳转到砍价列表页面
   */
  redirectToBargain = () => {
    Taro.redirectTo({
      url: `${pageCurrentList[38]}`
    });
  };

  /**
   * 监听用户点击页面内转发按钮或右上角菜单“转发”按钮的行为，并自定义转发内容。
   * @returns {*}
   */
  onShareAppMessage({from, target, webViewUrl}) {
    const {
      images = [],
      id = 0,
      goodsId = 0,
      goodsName = '',
      floorPrice = '',
      caseId = null,
      cutSaleName = ''
    } = this.state;
    return {
      title: `逼疯的铲屎官【砍价】- 最低¥${parseFloat(floorPrice / 100)}就可以购买${goodsName}`,
      path: `${pageCurrentList[39]}?id=${id}&share=bargainDetailShare&cutSaleName=${cutSaleName}&goodsId=${goodsId}${caseId ? `&caseId=${caseId}` : ''}`,
      imageUrl: images[0]
    }
  }

  /**
   * 弹起提醒进行订阅消息的浮层
   */
  onCutSaleHandler = (event) => {
    const {
      onEnsureBuyClick = () => {
      }
    } = this;
    Tools.getSettingConfig({
      withSubscriptions: true,
      success: (authSetting = {}, subscriptionsSetting = {}) => {
        const {itemSettings} = subscriptionsSetting;
        if (itemSettings && itemSettings[constants.bargainServiceTmplIds.response] === constants.floatLayout.requestSubscribeMessage.status.accept) {
          onEnsureBuyClick(event);
        } else if (itemSettings && itemSettings[constants.bargainServiceTmplIds.response] === constants.floatLayout.requestSubscribeMessage.status.reject) {
          this.setState({
            cutSaleDialog: true,
            isAlways: true,
            bargainDialog: false
          });
        } else {
          this.setState({
            cutSaleDialog: true,
            bargainDialog: false
          });
        }
      },
      fail: (res) => {
      },
      complete: (res) => {
      }
    });
    //取消冒泡事件
    event.stopPropagation();
  };

  /**
   * 点击确定,调起客户端小程序订阅消息界面，返回用户订阅消息的操作结果
   */
  onCutSaleConfirm = (e) => {
    const {
      onEnsureBuyClick = () => {
      }
    } = this;
    const {isAlways = false} = this.state;
    if (isAlways) {
      Tools.openSettingConfig({
        withSubscriptions: true,
        success: (authSetting, subscriptionsSetting) => {
          onEnsureBuyClick(e);
        },
        fail: (res) => {
        },
        complete: (res) => {
          this.setState({
            cutSaleDialog: false
          });
        }
      });
    } else {
      Tools.requestSubscribeMessageConfig({
        tmplIds: constants.bargainTmplIds,
        success: (res) => {
          onEnsureBuyClick(e);
        },
        fail: (res) => {
        },
        complete: (res) => {
          this.setState({
            cutSaleDialog: false
          });
        }
      });
    }
  };

  /**
   * 点击取消,关闭浮层弹窗
   */
  onCutSaleCancel = () => {
    this.setState({
      cutSaleDialog: false
    });
  };

  /**
   * 点击去支付,去查看砍价成功之后的商品订单列表
   */
  onDirectToOrderDetail = () => {
    Taro.navigateTo({
      url: `${pageCurrentList[29]}`
    });
  };

  render() {
    const {
      descDialog = false,
      current = 0,
      loading = true,
      bargainDialog = false,
      images = [],
      stock = '',
      salePrice = '',
      floorPrice = '',
      cutSaleCase = {},
      isCutSaleSuccess = false,
      currentCutPrice = 0,
      share = '',
      caseState = 'FOUNDER',
      disabled = false,
      cutSaleDialog = false,
      cutSaleState = ''
    } = this.state;
    const {
      isX = false,
      statusBarClassName = ''
    } = Tools.adaptationNavBar();
    const {
      onDialogChange = () => {
      },
      onChangeTabHandler = () => {
      },
      onEnsureBuyClick = () => {
      },
      onModalChangeHandler = () => {
      },
      backToMasterHome = () => {
      },
      redirectToBackPage = () => {
      },
      redirectToBargain = () => {
      },
      onCutSaleCancel = () => {
      },
      onCutSaleConfirm = () => {
      },
      onCutSaleHandler = () => {
      },
      onDirectToOrderDetail = () => {
      }
    } = this;
    const {shipConfig = [], tabsConfig = [], modal = {}} = constants || {};
    const {helperQueue = []} = cutSaleCase || {};
    const {isCutSaleSuccess: isCutSaleSuccessConstants = {}} = modal;
    helperQueue && helperQueue.length > 0 && !tabsConfig.find((tabItem) => tabItem.title === '助力榜') && tabsConfig.push({title: '助力榜'});
    return (
      <View className='bargainDetail'>
        <LdmNavBar
          color='#000'
          title='砍价商品详情'
          leftIconPrefixClass='iconfont'
          imgs={share ? '' : imgs.back}
          leftIconType={share ? 'petPlanet-home' : ''}
          className='bargainDetail-navBar'
          onClickLeftIcon={share ? backToMasterHome : redirectToBackPage}
        />
        <AtMessage
          className={statusBarClassName}
        />
        {
          loading && <LoadingView
            size={56}
            color='#fb2a5d'
            className='bargainDetail-loading'
            content={loadingStatus.progress.text}
          />
        }
        <AtTabs
          height='100%'
          className='bargainDetail-tabs'
          tabDirection='horizontal'
          current={current}
          tabList={tabsConfig}
          onClick={(current = 0) => {
            onChangeTabHandler(current);
          }}
        >
          <AtTabsPane tabDirection='horizontal' current={0} index={0}>
            {this.renderDetail()}
          </AtTabsPane>
          <AtTabsPane
            tabDirection='horizontal'
            current={1}
            index={0}
            className='bargainDetail-tabs-comments'
          >
            {this.renderComments()}
          </AtTabsPane>
          {
            helperQueue && helperQueue.length > 0 && <AtTabsPane
              tabDirection='horizontal'
              current={2}
              index={0}
              className='bargainDetail-tabs-bargain'
            >
              {this.renderBargain()}
            </AtTabsPane>
          }
        </AtTabs>
        <View className={cns(
          'bargainDetail-serviceOrder',
          {
            'bargainDetail-serviceOrderX': !!isX
          }
        )}>
          <AtButton className={
            cns(
              'bargainDetail-serviceOrder-button',
              'bargainDetail-serviceOrder-share',
              {
                'bargainDetail-serviceOrder-redirectToBargain': caseState === 'HELPER'
              },
              {
                'bargainDetail-serviceOrder-buttonX': !!isX
              }
            )
          }
                    full
                    openType={(caseState !== 'HELPER') ? cutSaleState === 'SUCCESS' ? '' : 'share' : ''}
                    type='primary'
                    onClick={caseState === 'HELPER' ? redirectToBargain :
                      cutSaleState === 'SUCCESS' ? redirectToBargain : () => {
                      }
                    }
          >
            {caseState !== 'HELPER' && cutSaleState !== 'SUCCESS' &&
            <AtIcon prefixClass='iconfont' value='petPlanet-share' size={16} color='#333'/>}
            {(caseState === 'FOUNDER' && cutSaleState === 'SUCCESS') ? '再看看' : constants.caseStateMethod[caseState]}
          </AtButton>
          <AtButton className={
            cns(
              'bargainDetail-serviceOrder-button',
              'bargainDetail-serviceOrder-placeOrder',
              {
                'bargainDetail-serviceOrder-redirectToBargain': caseState === 'HELPER'
              },
              {
                'bargainDetail-serviceOrder-buttonX': !!isX
              }
            )
          }
                    full
                    openType={(caseState === 'FOUNDER' && cutSaleState === 'SUCCESS') ? '' : disabled ? 'share' : ''}
                    type='primary'
                    onClick={() => (caseState === 'FOUNDER' && cutSaleState === 'SUCCESS') ? onDirectToOrderDetail() : caseState === 'HELPER' ? !disabled ? onEnsureBuyClick() : () => {
                    } : !disabled ? onDialogChange('bargainDialog') : () => {
                    }}
          >
            {(caseState === 'FOUNDER' && cutSaleState === 'SUCCESS') ? '去支付' : !disabled ? constants.caseStateID[caseState] : constants.caseStatedID[caseState]}
          </AtButton>
        </View>
        <DialogView isOpened={descDialog}
                    title={constants.floatLayout.delivery.title}
                    className='bargainDetail-float-layout'
                    onClose={() => onDialogChange('descDialog')}
                    renderContent={
                      <View className='bargainDetail-float-layout-content'>
                        {
                          shipConfig && shipConfig.length > 0 && shipConfig.map(shipItem => {
                            return <View className='bargainDetail-float-layout-content-item'>
                              <View className='bargainDetail-float-layout-content-item-title'>
                                {shipItem.title}
                                <View className='bargainDetail-float-layout-content-item-detail'>
                                  {shipItem.content}
                                </View>
                              </View>
                            </View>
                          })
                        }
                      </View>
                    }
        />
        <AtFloatLayout
          isOpened={bargainDialog}
          className={cns(
            'bargainDetail-sku-choose',
            {
              'bargainDetail-sku-chooseX': !!isX
            }
          )}
          onClose={() => onDialogChange('bargainDialog')}
        >
          <View
            className='bargainDetail-sku-choose-info at-row'
          >
            <Image
              className='bargainDetail-sku-choose-info-image'
              src={images[0]}
              mode='aspectFill'
            />
            <View
              className='bargainDetail-sku-choose-info-common  at-col at-col--wrap'
            >
              <View class='bargainDetail-sku-choose-info-price'>
                <Text class='bargainDetail-sku-choose-info-price-desc'>当前价:</Text> &#165;{parseFloat(salePrice / 100)}
              </View>
              <View class='bargainDetail-sku-choose-info-floorPrice'>
                <Text
                  class='bargainDetail-sku-choose-info-floorPrice-desc'>底价:</Text> &#165;{parseFloat(floorPrice / 100)}
              </View>
              <View class='bargainDetail-sku-choose-info-stock'>限量{stock}件</View>
            </View>
          </View>
          <View
            className={cns(
              'bargainDetail-sku-choose-btn',
              {
                'bargainDetail-sku-choose-btnX': !!isX
              }
            )}
            onClick={onCutSaleHandler}
          >
            确定
          </View>
        </AtFloatLayout>
        {/*砍价成功后的弹窗*/}
        <ModalView
          isOpened={isCutSaleSuccess}
          className='bargainDetail-cutSaleSuccess'
          loseOnClickOverlay={false}
          title=''
        >
          <View className='at-modal__header'>
            {isCutSaleSuccessConstants[caseState]['title']}
          </View>
          <View className='at-modal__content'>
            <View className='at-modal__content-symbol'>&#165;</View> {parseFloat(currentCutPrice / 100)}
          </View>
          <View className='at-modal__footer'>
            <View className='at-modal__action'>
              <Button onClick={(e) => {
                onModalChangeHandler('isCutSaleSuccess');
                /**
                 * 取消冒泡事件
                 */
                e.stopPropagation();
              }}>
                {isCutSaleSuccessConstants[caseState]['cancelText']}
              </Button>
              <Button
                openType='share'
                onClick={(e) => {
                  onModalChangeHandler('isCutSaleSuccess');
                  /**
                   * 取消冒泡事件
                   */
                  e.stopPropagation();
                }}
              >
                {isCutSaleSuccessConstants[caseState]['confirmText']}
              </Button>
            </View>
          </View>
        </ModalView>
        <DialogView isOpened={cutSaleDialog}
                    title={constants.floatLayout.requestSubscribeMessage.title}
                    content={constants.floatLayout.requestSubscribeMessage.content}
                    cancelText='取消'
                    onCancel={onCutSaleCancel}
                    onClose={onCutSaleCancel}
                    confirmText='进行订阅'
                    onConfirm={onCutSaleConfirm}
        />
      </View>
    )
  }
}

export default BargainDetail;
