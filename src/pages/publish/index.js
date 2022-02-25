import Taro, {Component} from "@tarojs/taro";
import {View, ScrollView} from "@tarojs/components";
import {
  AtTextarea,
  AtImagePicker,
  AtList,
  AtListItem,
  AtInput,
  AtButton,
  AtModal,
  AtMessage
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
    async publishImageUploadHandler() {
      await dispatch(publishAPI.publishImageUploadRequest.apply(this));
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
    async getSettingHandler() {
      await dispatch(publishAPI.getSettingRequest.apply(this));
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
    async publishItemHandler() {
      await dispatch(publishAPI.publishItemRequest.apply(this));
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
   * 在显示此发布路由页面时进行的操作
   * @returns {Promise<void>}
   */
  async componentDidShow() {

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
      [key]: value
    });
  }

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

  render() {
    const {publishStore} = this.props;
    const {
      isRefusedModal,
      content,
      files,
      area,
      title,
      cost,
      contactInfo
    } = publishStore;
    return (
      <ScrollView
        className='pet-business'
        scrollY={true}
        scrollTop={0}
      >
        <AtMessage />
        <View className='pet-business-publish'>
          <View className='pet-business-publish-content'>
            <View className='pet-business-publish-content-top'>
              <AtTextarea
                count={false}
                textOverflowForbidden={false}
                height={240}
                value={content}
                onChange={this.onTextChangeHandler.bind(this, "content")}
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
                onChange={this.onImageChangeHandler}
              />
              <AtList
                className='pet-business-publish-content-position'
                hasBorder={false}
              >
                <AtListItem
                  iconInfo={{prefixClass: 'iconfont', value: 'petPlanet-gps', size: 20, color: '#000'}}
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
                title={prompt["publish"]["publish_page"]["label"]["title"]}
                placeholder={prompt["publish"]["publish_page"]["placeholder"]["title"]}
                value={title}
                className='pet-business-publish-content-input pet-business-publish-content-title'
                onChange={this.onTextChangeHandler.bind(this, "title")}
              />
              <AtInput
                name='cost'
                type='number'
                title={prompt["publish"]["publish_page"]["label"]["cost"]}
                placeholder={prompt["publish"]["publish_page"]["placeholder"]["cost"]}
                value={cost}
                className='pet-business-publish-content-input pet-business-publish-content-price'
                onChange={this.onTextChangeHandler.bind(this, "cost")}
              />
              <AtInput
                name='contactInfo'
                type='text'
                title={prompt["publish"]["publish_page"]["label"]["contactInfo"]}
                placeholder={prompt["publish"]["publish_page"]["placeholder"]["contactInfo"]}
                value={contactInfo}
                maxlength={50}
                className='pet-business-publish-content-input pet-business-publish-content-contactInfo'
                onChange={this.onTextChangeHandler.bind(this, "contactInfo")}
              />
            </View>
            <View className='pet-business-publish-content-button'>
              <AtButton type='primary' onClick={this.onPublishHandler}>
                确定发布
              </AtButton>
            </View>
            <AtModal
              isOpened={isRefusedModal}
              title={prompt["modal"]["publish_page"]["publish"]["title"]}
              cancelText='取消'
              confirmText='确定'
              content={prompt["modal"]["publish_page"]["publish"]["content"]}
              onConfirm={this.getOpenSettingHandler}
              onCancel={this.getModalCancelHandler}
            />
          </View>
        </View>
      </ScrollView>
    )
  }
}

export default Publish;
