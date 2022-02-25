import Taro, {Component} from "@tarojs/taro";
import {View} from "@tarojs/components";
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
import {publishAPI} from "../../services";
import Tools from "../../utils/petPlanetTools";
import prompt from "../../constants/prompt";

import "../iconfont/iconfont.less";
import "./index.less";


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
    publishImageUploadHandler() {
      dispatch(publishAPI.publishImageUploadRequest.apply(this));
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
  onTextChangeHandler(key, event) {
    const {setAttrValueHandler} = this.props;
    let value;
    value = Object.prototype.toString.call(event) === "[object Object]" ? event.target.value : event;
    setAttrValueHandler({
      [key]: value
    });
  }

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
      run(function* () {
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
   * 生成器异步任务执行
   */
  run = (generator) => {
    let task = generator();
    let val = task.next();

    function step() {
      let done = val.done,
        value = val.value;
      if (!done) {
        if (typeof value === "function") {
          value(function (data, header) {
            val = task.next(data);
            step();
          });
        } else {
          val = task.next(value);
          step();
        }
      } else {
        console.log("迭代器异步任务执行完毕!");
      }
    }

    step();
  };

  /**
   * 改变图片选择器的内容并上传图片
   * @尹文楷
   * @returns {Promise<void>}
   */
  async onImageChangeHandler(files, operationType, index) {
    const {setAttrValueHandler, publishImageUploadHandler, publishStore} = this.props;
    const {files: fileList, images} = publishStore;
    let uploadFilterFiles = [];
    switch (operationType) {
      case "add":
        for (let [key, value] of files.entries()) {
          const {file: {size}} = value;
          //图片的限制大小
          const format = 3 * 1024 * 1024;
          let flag = false;
          for (let [_key, _value] of fileList.entries()) {
            if (value["url"] === _value["url"]) {
              flag = true;
            }
          }
          if(size > format) {
            Taro.atMessage({
              type: 'warning',
              message: '上传的图片过大,不可超过3M!'
            });
            return null;
          }
          if (!flag) {
            uploadFilterFiles = [...uploadFilterFiles, value];
          }
        }
        await setAttrValueHandler({
          uploadFilterFiles
        });
        await publishImageUploadHandler.apply(this);
        break;
      case "remove":
        await images.splice(index, 1);
        await setAttrValueHandler({
          files,
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
  adoptionChangeHandler(code, {name, active}) {
    const {setAttrValueHandler, publishStore} = this.props;
    const {tagCodes} = publishStore;
    setAttrValueHandler({
      isAdoption: !active,
      tagCodes
    });
  }

  render() {
    const {publishStore} = this.props;
    const {
      onGetUserInfoHandler,
      adoptionChangeHandler,
      onTextChangeHandler,
      onImageChangeHandler,
      getAuthorizeHandler,
      getOpenSettingHandler,
      getModalCancelHandler
    } = this;
    const {
      isRefusedModal,
      content,
      files,
      area,
      title,
      cost,
      contactInfo,
      isAdoption
    } = publishStore;
    return (
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
                onChange={onTextChangeHandler.bind(this, "content")}
                placeholder={prompt["publish"]["publish_page"]["placeholder"]["content"]}
                className='pet-business-publish-content-description'
              />
              <AtImagePicker
                mode='aspectFill'
                length={4}
                multiple
                className='pet-business-publish-content-images'
                files={files}
                showAddBtn
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
                onChange={onTextChangeHandler.bind(this, "title")}
              />
              <AtInput
                name='cost'
                type='number'
                title={prompt["publish"]["publish_page"]["label"]["cost"]}
                placeholder={prompt["publish"]["publish_page"]["placeholder"]["cost"]}
                value={cost}
                className='pet-business-publish-content-input pet-business-publish-content-price'
                onChange={onTextChangeHandler.bind(this, "cost")}
              />
              <AtInput
                name='contactInfo'
                type='text'
                title={prompt["publish"]["publish_page"]["label"]["contactInfo"]}
                placeholder={prompt["publish"]["publish_page"]["placeholder"]["contactInfo"]}
                value={contactInfo}
                maxlength={50}
                className='pet-business-publish-content-input pet-business-publish-content-contactInfo'
                onChange={onTextChangeHandler.bind(this, "contactInfo")}
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
                    onClick={adoptionChangeHandler.bind(this, "0001")}
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
          </View>
        </View>
      </View>
    )
  }
}

export default Publish;
