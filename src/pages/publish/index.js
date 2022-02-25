import Taro, {Component} from "@tarojs/taro";
import {
  Block,
  View
} from "@tarojs/components";
import {
  AtTextarea,
  AtImagePicker,
  AtList,
  AtListItem,
  AtInput,
  AtButton,
  AtModal,
  AtMessage,
  AtTag
} from "taro-ui";
import {connect} from "@tarojs/redux";
import mta from "mta-wechat-analysis";
import {setPublishAttrValue} from "../../actions/publish";
import {LoadingView} from "../../components/bussiness-components";
import {publishAPI} from "../../services";
import Tools from "../../utils/petPlanetTools";
import prompt from "../../constants/prompt";

import "../iconfont/iconfont.less";
import "./index.less";
import "./loading-view.less";


@connect((state) => {
  return {
    homeStore: state.homeStore,
    publishStore: state.publishStore
  };
}, (dispatch) => {
  return {
    /**
     * 改变图片选择器的内容并上传图片
     * @尹文楷
     * @returns {Promise<void>}
     */
    publishImageUploadHandler(...params) {
      dispatch(publishAPI.publishImageUploadRequest.apply(this, params));
    },

    /**
     * 改变redux store里面的数据状态
     * @尹文楷
     */
    async setAttrValueHandler(payload) {
      await dispatch(setPublishAttrValue(payload));
    },

    /**
     * 获取用户授权设置
     * @尹文楷
     * @returns {Promise<void>}
     */
    async getSettingHandler(scope) {
      await dispatch(publishAPI.getSettingRequest.apply(this, [scope]));
    },

    /**
     * 向用户发起授权请求
     * @尹文楷
     * @returns {Promise<void>}
     */
    async authorizeHandler(scope) {
      await dispatch(publishAPI.authorizeRequest.apply(this, [scope]));
    },

    /**
     * 调起客户端小程序设置界面，返回用户设置的操作结果
     * @尹文楷
     * @returns {Promise<void>}
     */
    async openSettingHandler() {
      await dispatch(publishAPI.openSettingRequest.apply(this));
    },

    /**
     * 发布宠物交易
     * @尹文楷
     * @returns {Promise<void>}
     */
    publishItemHandler() {
      return dispatch(publishAPI.publishItemRequest.apply(this));
    },
    /**
     * 同步微信用户授权后的用户信息
     * @尹文楷
     */
    syncUserInfoHandler() {
      return publishAPI.syncUserInfoRequest.apply(this, [...arguments]);
    }
  };
})

class Publish extends Component {
  static options = {
    addGlobalClass: true
  };

  config = {
    navigationBarTitleText: "发布"
  };

  constructor(props) {
    super(props);
    //能够上传图片数量的最大值
    this.count = 9;
  }

  state = {
    //是否显示添加图片按钮
    showAddBtn: true,
    //动态的可添加的图片的数量
    moveCount: 9,
    //上传图片是否存在loading
    uploadLoading: false
  };

  async componentWillMount() {
    await mta.Page.init();
  }

  /**
   * 组件在挂载时,要执行的任务
   */
  componentDidMount() {

  }

  /**
   * 在显示此发布路由页面时进行的操作
   * @returns {Promise<void>}
   */
  async componentDidShow() {

  }

  componentWillUnmount() {
    const {setAttrValueHandler} = this.props;
    setAttrValueHandler({
      isAdoption: false,
      tagCodes: []
    });
  }

  /**
   * 改变输入框的内容
   * @尹文楷
   * @returns {Promise<void>}
   */
  onTextChangeHandler = (key, event) => {
    const {setAttrValueHandler} = this.props;
    let value;
    value = Object.prototype.toString.call(event) === "[object Object]" ? event.target.value : event;
    setAttrValueHandler({
      [key]: value
    });
  };

  /**
   * 获取用户信息并发布宠物交易
   */
  onGetUserInfoHandler = (res) => {
    const {syncUserInfoHandler, publishItemHandler} = this.props;
    const {verify, run} = this;
    let userInfo = res && res.target && res.target.userInfo,
      encryptedData = res && res.target && res.target.encryptedData,
      rawData = res && res.target && res.target.rawData,
      signature = res && res.target && res.target.signature,
      iv = res && res.iv && res.target.iv;
    if (userInfo) {
      userInfo["encryptedData"] = encryptedData;
      userInfo["rawData"] = rawData;
      userInfo["signature"] = signature;
      userInfo["iv"] = iv;
      Tools.run(function* () {
        let data = yield syncUserInfoHandler(userInfo);
        mta.Event.stat("user_authorization", {});
        if (verify.apply(this)) {
          let publishData = yield publishItemHandler.apply(this);
          mta.Event.stat("publish_onPublish", {});
        }
      }.bind(this));
    }
  };

  /**
   * 改变图片选择器的内容并上传图片
   * @尹文楷
   * @returns {Promise<void>}
   */
  async onImageChangeHandler(files, operationType, index) {
    const {setAttrValueHandler, publishImageUploadHandler, publishStore} = this.props;
    const {count} = this;
    let {files: fileList = [], images = []} = publishStore;
    switch (operationType) {
      case "add":
        this.setState({
          uploadLoading: true
        });
        setAttrValueHandler({
          files: [],
          images: []
        });
        const {length} = files;
        for (let [key, value] of files.entries()) {
          const {file: {size}} = value;
          //图片的限制大小
          const format = 3 * 1024 * 1024;
          if (size > format) {
            Taro.atMessage({
              type: 'warning',
              message: '上传的图片过大,不可超过3M!'
            });
            return null;
          }
          publishImageUploadHandler.apply(this, [{value, key, total: length}]);
        }
        break;
      case "remove":
        fileList.splice(index, 1);
        images.splice(index, 1);
        const {length: _length} = images;
        this.setState({
          moveCount: count - _length
        });
        if (_length < count) {
          this.setState({
            showAddBtn: true
          });
        }
        setAttrValueHandler({
          files: fileList,
          images
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
    await getSettingHandler("scope.userLocation");
    await authorizeHandler.apply(this, ["scope.userLocation"]);
    await mta.Event.stat("publish_gps", {});
    //取消冒泡事件
    e.stopPropagation();
  }

  /**
   * 用于表单校验的规则函数
   * @尹文楷
   * @returns {Promise<void>}
   */
  verify() {
    const {publishStore} = this.props;
    const {content, images, isLocationAuthorize, title, cost, formId, contactInfo} = publishStore;
    return Tools.addRules([
      content,
      images,
      isLocationAuthorize,
      title,
      cost,
      formId,
      contactInfo
    ], [{
      rule: "isEmpty",
      errMsg: prompt["verify"]["publish_page"]["isEmpty"]
    }]).execute();
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
      isRefusedModal: false
    });
  }

  /**
   * 点击是否领养按钮，引起领养状态改变的事件
   * @returns {Promise<void>}
   */
  adoptionChangeHandler = (code, {name, active}) => {
    const {setAttrValueHandler, publishStore} = this.props;
    const {tagCodes} = publishStore;
    setAttrValueHandler({
      isAdoption: !active,
      tagCodes
    });
  };

  /**
   * 跳转到主子页面
   * @尹文楷
   */
  redirectToPreviousPage = () => {
    const {setAttrValueHandler} = this.props;
    Taro.navigateBack({
      delta: Taro.getCurrentPages().length
    });
    setAttrValueHandler({
      reviewModal: false
    });
  };

  /**
   * 点击图片放大查看
   */
  onImagePreviewHandler = index => {
    const {publishStore} = this.props;
    const {files: fileList = []} = publishStore;
    const previewImageFileList = fileList.map(item => {
      return item['url'];
    });
    Tools.previewImageConfig({
      current: previewImageFileList[index],
      urls: previewImageFileList,
      success: (res) => {
        console.log(res);
      },
      fail: (res) => {
        console.log(res);
      },
      complete: (res) => {
        console.log(res);
      }
    });
  };

  render() {
    const {publishStore} = this.props;
    const {
      onGetUserInfoHandler,
      adoptionChangeHandler,
      onTextChangeHandler,
      onImageChangeHandler,
      getAuthorizeHandler,
      getOpenSettingHandler,
      getModalCancelHandler,
      redirectToPreviousPage,
      onImagePreviewHandler
    } = this;
    const {showAddBtn, moveCount, uploadLoading} = this.state;
    const {
      isRefusedModal,
      reviewModal,
      content,
      files,
      area,
      title,
      cost,
      contactInfo,
      isAdoption
    } = publishStore;
    return (
      <Block>
        {
          uploadLoading && <LoadingView
            size={56}
            color='#fb2a5d'
            className='pet-business-loading'
            content='图片上传中'
          />
        }
        <View
          className='pet-business'
        >
          <AtMessage/>
          <View className='pet-business-publish'>
            <View className='pet-business-publish-content'>
              <View className='pet-business-publish-content-top'>
                <AtTextarea
                  count={false}
                  textOverflowForbidden={false}
                  height={240}
                  value={content ? content : ""}
                  onChange={(e) => {
                    onTextChangeHandler("content", e);
                  }}
                  placeholder={prompt["publish"]["publish_page"]["placeholder"]["content"]}
                  className='pet-business-publish-content-description'
                />
                <AtImagePicker
                  mode='aspectFill'
                  length={4}
                  multiple
                  className='pet-business-publish-content-images'
                  files={files}
                  count={moveCount}
                  showAddBtn={showAddBtn}
                  onImageClick={onImagePreviewHandler}
                  onChange={onImageChangeHandler.bind(this)}
                />
                <AtList
                  className='pet-business-publish-content-position'
                  hasBorder={false}
                >
                  <AtListItem
                    iconInfo={{prefixClass: 'iconfont', value: 'petPlanet-gps', size: 20, color: '#000'}}
                    hasBorder={false}
                    title={area}
                    onClick={getAuthorizeHandler.bind(this)}
                  />
                </AtList>
              </View>
              <View className='pet-business-publish-content-bottom'>
                <AtInput
                  name='title'
                  type='text'
                  title={prompt["publish"]["publish_page"]["label"]["title"]}
                  placeholder={prompt["publish"]["publish_page"]["placeholder"]["title"]}
                  value={title}
                  className='pet-business-publish-content-input pet-business-publish-content-title'
                  onChange={(e) => {
                    onTextChangeHandler("title", e);
                  }}
                />
                <AtInput
                  name='cost'
                  type='number'
                  title={prompt["publish"]["publish_page"]["label"]["cost"]}
                  placeholder={prompt["publish"]["publish_page"]["placeholder"]["cost"]}
                  value={cost}
                  className='pet-business-publish-content-input pet-business-publish-content-price'
                  onChange={(e) => {
                    onTextChangeHandler("cost", e);
                  }}
                />
                <AtInput
                  name='contactInfo'
                  type='text'
                  title={prompt["publish"]["publish_page"]["label"]["contactInfo"]}
                  placeholder={prompt["publish"]["publish_page"]["placeholder"]["contactInfo"]}
                  value={contactInfo}
                  maxlength={50}
                  className='pet-business-publish-content-input pet-business-publish-content-contactInfo'
                  onChange={(e) => {
                    onTextChangeHandler("contactInfo", e);
                  }}
                />
                <View
                  className='at-row at-row--no-wrap pet-business-publish-content-tag'
                >
                  <View className='at-col at-col-2 pet-business-publish-content-tag-adoption-title'>
                    {prompt["publish"]["publish_page"]["label"]["adoption"]}
                  </View>
                  <View className='at-col at-col-9'>
                    <AtTag
                      className='pet-business-publish-content-tag-adoption-tagAdoption'
                      name='isAdoption'
                      size='normal'
                      type='primary'
                      active={isAdoption}
                      onClick={(e) => {
                        adoptionChangeHandler("0001", e);
                      }}
                    >
                      {prompt["publish"]["publish_page"]["content"]["adoption"]}
                    </AtTag>
                  </View>
                </View>
              </View>
              <View className='pet-business-publish-content-button'>
                <AtButton
                  type='primary'
                  openType='getUserInfo'
                  onGetUserInfo={onGetUserInfoHandler}
                >
                  确定发布
                </AtButton>
              </View>
              <AtModal
                isOpened={isRefusedModal}
                title={prompt["modal"]["publish_page"]["publish"]["title"]}
                cancelText='取消'
                confirmText='确定'
                content={prompt["modal"]["publish_page"]["publish"]["content"]}
                onConfirm={getOpenSettingHandler.bind(this)}
                onCancel={getModalCancelHandler.bind(this)}
              />
              <AtModal
                isOpened={reviewModal}
                title='正在审核中...'
                confirmText='我知道了'
                content='您发布的内容,审核通过后会自动发布~'
                onConfirm={redirectToPreviousPage}
              />
            </View>
          </View>
        </View>
      </Block>
    )
  }
}

export default Publish;
