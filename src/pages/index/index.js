import Taro, {Component} from '@tarojs/taro';
import {View, Image, ScrollView} from "@tarojs/components";
import {
  AtTabBar,
  AtForm,
  AtButton,
  AtIcon,
  AtCard,
  AtLoadMore,
  AtFloatLayout,
  AtTextarea,
  AtImagePicker,
  AtList,
  AtListItem,
  AtInput,
  AtModal,
  AtMessage
} from 'taro-ui';
import {connect} from "@tarojs/redux";
import {changeCurrent, changePageNum, changeLoadStatus, setAttrValue} from "../../actions/home";
import {homeAPI} from "../../services";
import {tabBarTabList, pageCurrentList, staticData} from "../../utils/static";
import Tools from "../../utils/petPlanetTools";
import "./iconfont/iconfont.less";
import "./index.less";


@connect((state) => {
  return {
    ...state,
    homeStore: state.homeStore
  }
}, (dispatch) => {
  return {
    /**
     * 调用接口获取登录凭证（code）。通过凭证进而换取用户登录态信息，包括用户的唯一标识（openid）及本次登录的会话密钥（session_key）等。用户数据的加解密通讯需要依赖会话密钥完成
     * @尹文楷
     * @returns {Promise<void>}
     */
    async getLoginSessionHandler(homeInfoHandler) {
      await dispatch(homeAPI.getLoginSession.apply(this, [homeInfoHandler]));
    },
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
     * 获取小程序首页信息
     * @尹文楷
     */
    async homeInfoHandler(pageNum) {
      if (pageNum === 1) {
        await dispatch(changePageNum({
          petList: []
        }));
      }
      await dispatch(changePageNum({
        pageNum
      }));
      await dispatch(homeAPI.homeInfoRequest.apply(this));
    },

    /**
     * 改变图片选择器的内容并上传图片
     * @尹文楷
     * @returns {Promise<void>}
     */
    async publishImageUploadHandler() {
      await dispatch(homeAPI.publishImageUploadRequest.apply(this));
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
     * 获取用户授权设置
     * @尹文楷
     * @returns {Promise<void>}
     */
    async getSettingHandler() {
      await dispatch(homeAPI.getSettingRequest.apply(this));
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
     * 向用户发起授权请求
     * @尹文楷
     * @returns {Promise<void>}
     */
    async authorizeHandler(scope) {
      await dispatch(homeAPI.authorizeRequest.apply(this, [scope]));
    },

    /**
     * 调起客户端小程序设置界面，返回用户设置的操作结果
     * @尹文楷
     * @returns {Promise<void>}
     */
    async openSettingHandler() {
      await dispatch(homeAPI.openSettingRequest.apply(this));
    },

    /**
     * 发布宠物交易
     * @returns {Promise<void>}
     */
    async publishItemHandler() {
      await dispatch(homeAPI.publishItemRequest.apply(this));
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
    navigationBarTitleText: '首页'
  };

  async componentDidMount() {
    const {homeInfoHandler, changeLoadStatusHandler, getLoginSessionHandler} = this.props;
    await getLoginSessionHandler.apply(this, [homeInfoHandler]);
    await changeLoadStatusHandler("more");
  }

  componentWillReceiveProps(nextProps) {

  }

  componentWillUnmount() {
  }

  componentDidShow() {
  }

  componentDidHide() {
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
    }
    if (currentPetList.length < staticData["pageSize"] && loadStatus === staticData["loadStatusConfig"]["more"]) {
      await changeLoadStatusHandler(staticData["loadStatusConfig"]["noMore"]);
    }
  }

  /**
   * 点击发布的取消按钮,关闭发布页面
   * @returns {Promise<void>}
   */
  async onPublishClose() {
    const {setAttrValueHandler, homeStore} = this.props;
    const {dialogShowOrHidden} = homeStore;
    const {isPublishOpened} = dialogShowOrHidden;
    if (isPublishOpened) {
      await setAttrValueHandler({
        dialogShowOrHidden: {
          isPublishOpened: false
        },
        dialogData: {
          publishData: {
            content: null,
            files: [],
            uploadFilterFiles: [],
            images: [],
            title: null,
            cost: null,
            formId: null
          }
        }
      });
    }
    await Taro.setNavigationBarTitle({
      title: "首页"
    });
  }

  /**
   * 点击发起宠物交易的Submit事件
   * @尹文楷
   */
  async onSubmitHandler(event) {
    const {setAttrValueHandler, getFormIdHandler} = this.props;
    await setAttrValueHandler({
      dialogShowOrHidden: {
        isPublishOpened: true
      }
    });
    await Taro.setNavigationBarTitle({
      title: ""
    });
    await getFormIdHandler.apply(this, [event.target.formId]);
  }

  /**
   * 调起客户端小程序设置界面，返回用户设置的操作结果
   * @尹文楷
   * @returns {Promise<void>}
   */
  async getOpenSettingHandler() {
    const {openSettingHandler} = this.props;
    await openSettingHandler.apply(this);
  }

  /**
   * 调起客户端小程序设置界面，返回用户设置的操作结果，点击取消触发的动作
   * @returns {Promise<void>}
   */
  async getModalCancelHandler() {
    const {setAttrValueHandler} = this.props;
    await setAttrValueHandler({
      dialogData: {
        publishData: {
          isRefusedModal: false
        }
      }
    });
  }

  /**
   * 改变输入框的内容
   * @尹文楷
   * @returns {Promise<void>}
   */
  async onTextChangeHandler(key, event) {
    const {setAttrValueHandler} = this.props;
    let value;
    value = Object.prototype.toString.call(event) === "[object Object]" ? event.target.value : event;
    await setAttrValueHandler({
      dialogData: {
        publishData: {
          [key]: value
        }
      }
    });
  }

  /**
   * 改变图片选择器的内容并上传图片
   * @尹文楷
   * @returns {Promise<void>}
   */
  async onImageChangeHandler(files, operationType, index) {
    const {setAttrValueHandler, publishImageUploadHandler, homeStore} = this.props;
    const {dialogData} = homeStore;
    const {publishData} = dialogData;
    const {files: fileList, images} = publishData;
    let uploadFilterFiles = [];
    switch (operationType) {
      case "add":
        for (let [key, value] of files.entries()) {
          let flag = false;
          for (let [_key, _value] of fileList.entries()) {
            if (value["url"] === _value["url"]) {
              flag = true;
            }
          }
          if (!flag) {
            uploadFilterFiles = [...uploadFilterFiles, value];
          }
        }
        await setAttrValueHandler({
          dialogData: {
            publishData: {
              uploadFilterFiles
            }
          }
        });
        await publishImageUploadHandler.apply(this);
        break;
      case "remove":
        await images.splice(index, 1);
        await setAttrValueHandler({
          dialogData: {
            publishData: {
              files,
              images
            }
          }
        });
        break;
      default:
        break;
    }
  }

  /**
   * 向用户发起授权请求
   * @尹文楷
   **/
  async getAuthorizeHandler(e) {
    const {getSettingHandler, authorizeHandler} = this.props;
    await getSettingHandler();
    await authorizeHandler.apply(this, ["scope.userLocation"]);
    //取消冒泡事件
    e.stopPropagation();
  }

  /**
   * 用于表单校验的规则函数
   * @尹文楷
   * @returns {Promise<void>}
   */
  verify() {
    const {homeStore} = this.props;
    const {dialogData} = homeStore;
    const {publishData} = dialogData;
    const {content, images, isLocationAuthorize, title, cost, formId} = publishData;
    return Tools.addRules(content, [{
      rule: "isEmpty",
      errMsg: "warning:宠物描述不能为空"
    }]).addRules(images, [{
      rule: "isEmpty",
      errMsg: "warning:图片组不能为空"
    }]).addRules(isLocationAuthorize, [{
      rule: "isEmpty",
      errMsg: "warning:必须获取定位"
    }]).addRules(title, [{
      rule: "isEmpty",
      errMsg: "warning:标题不能为空"
    }]).addRules(cost, [{
      rule: "isEmpty",
      errMsg: "warning:价格不能为空"
    }]).addRules(formId, [{
      rule: "isEmpty",
      errMsg: "warning:模板消息id不能为空"
    }]).execute();
  }

  /**
   * 发布宠物交易
   * @尹文楷
   **/
  async onPublishHandler() {
    const {publishItemHandler} = this.props;
    const {verify} = this;
    if (verify.apply(this)) {
      await publishItemHandler.apply(this);
    }
  }

  render() {
    const {homeStore, changeCurrentHandler} = this.props;
    const {current, petList, loadStatus, dialogShowOrHidden, dialogData} = homeStore;
    const {isPublishOpened} = dialogShowOrHidden;
    const {publishData} = dialogData;
    const {content, files, area, title, cost, isRefusedModal} = publishData;
    return (
      <ScrollView
        scrollY
        className='pet-business'
        scrollTop={0}
        lowerThreshold={86}
        onScrollToLower={this.onScrollToLower}
      >
        <AtMessage />
        {/*首页列表区域:卖家想要交易售卖的宠物列表*/}
        <View className='at-row at-row--wrap pet-business-container'>
          {
            petList && petList.length > 0 && petList.map((petItem) => {
              let id = petItem["id"];
              return <View key={id} className='at-col at-col-6 at-col--wrap'>
                <AtCard title={null} extra={null} className='pet-business-list'>
                  <Image mode='aspectFill'
                         src={petItem['cover']}
                         className='pet-business-list-image'
                  />
                  <View className='pet-business-list-title'>{petItem['title']}</View>
                  <View className='pet-business-list-price'>
                    <text class='pet-business-list-price-symbol'>
                      &#165;
                    </text>
                    {petItem['cost']}
                    <text class='pet-business-list-price-like'>
                      {petItem['wantCount']}人想要
                    </text>
                  </View>
                  <View className='pet-business-list-username'>
                    {petItem['userId']}
                  </View>
                  <View className='pet-business-list-address'>
                    <AtIcon prefixClass='iconfont'
                            value='petPlanet-gps'
                            className='pet-business-list-address-icon'
                            size={12} color='#ec544c'
                    />
                    {petItem['area']}
                  </View>
                </AtCard>
              </View>
            })
          }
        </View>
        {/*上拉加载更多区域*/}
        <AtLoadMore
          status={loadStatus}
          moreText=''
          className='pet-business-load-more'
        />
        {/*宠物交易发布区域*/}
        <AtFloatLayout
          title='发布'
          isOpened={isPublishOpened}
          onClose={this.onPublishClose}
          className='pet-business-publish'
        >
          <View className='pet-business-publish-content'>
            <View className='pet-business-publish-content-top'>
              <AtTextarea
                count={false}
                textOverflowForbidden={false}
                height={240}
                value={content}
                onChange={this.onTextChangeHandler.bind(this, "content")}
                placeholder='描述一下宝贝转手的原因、入手渠道和使用感受'
                className='pet-business-publish-content-description'
              />
              <AtImagePicker
                mode='aspectFill'
                length={4}
                multiple
                className='pet-business-publish-content-images'
                files={files}
                showAddBtn
                onChange={this.onImageChangeHandler}
              />
              <AtList className='pet-business-publish-content-position'
                      hasBorder={false}
              >
                <AtListItem iconInfo={{prefixClass: 'iconfont', value: 'petPlanet-gps', size: 20, color: '#000'}}
                            hasBorder={false}
                            title={area}
                            onClick={this.getAuthorizeHandler}
                />
              </AtList>
            </View>
            <View className='pet-business-publish-content-bottom'>
              <AtInput
                name='title'
                type='text'
                title='标题'
                placeholder='请输入标题'
                value={title}
                className='pet-business-publish-content-input pet-business-publish-content-title'
                onChange={this.onTextChangeHandler.bind(this, "title")}
              />
              <AtInput
                name='cost'
                type='number'
                title='一口价'
                placeholder='请输入交易宠物的价格'
                value={cost}
                className='pet-business-publish-content-input pet-business-publish-content-price'
                onChange={this.onTextChangeHandler.bind(this, "cost")}
              />
            </View>
            <View className='pet-business-publish-content-button'>
              <AtButton type='primary' onClick={this.onPublishHandler}>
                确定发布
              </AtButton>
            </View>
            <AtModal
              isOpened={isRefusedModal}
              title='温馨提示'
              cancelText='取消'
              confirmText='确定'
              content='检测到您没打定位权限，是否去设置打开？'
              onConfirm={this.getOpenSettingHandler}
              onCancel={this.getModalCancelHandler}
            />
          </View>
        </AtFloatLayout>
        {/*按钮发布区域: 使用formId进行发起一次有formId的模板消息请求*/}
        <AtForm reportSubmit={true}
                style='border:none'
                onSubmit={this.onSubmitHandler}
                className='pet-business-deal'
        >
          <AtButton size='small' type='primary' className='pet-business-deal-add' formType='submit'>
            <AtIcon
              value='add'
              className='pet-business-deal-add-icon'
              size={26}
              color='#fff'
            />
          </AtButton>
        </AtForm>
        {/*导航区域: 分首页和我两个部分*/}
        <AtTabBar
          fixed
          current={current}
          tabList={tabBarTabList}
          onClick={changeCurrentHandler}
        />
      </ScrollView>
    )
  }
}

export default Index;
