import Taro, {Component} from "@tarojs/taro";
import {View, Button} from "@tarojs/components";
import {AtTabBar, AtAvatar, AtIcon} from "taro-ui";
import {connect} from "@tarojs/redux";
import mta from "mta-wechat-analysis";
import {changeCurrent} from "../../actions/home";
import {setCollectionAttrValue} from "../../actions/collection";
import {setPublishMineAttrValue} from "../../actions/publishMine";
import {tabBarTabList, pageCurrentList} from "../../utils/static";
import {userAPI, collectionAPI, publishMineAPI} from "../../services";

import "../iconfont/iconfont.less";
import "./user.less";

@connect((state) => {
  return {
    homeStore: state.homeStore,
    userStore: state.userStore,
    collectionStore: state.collectionStore,
    publishMineStore: state.publishMineStore
  }
}, (dispatch) => {
  return {
    /**
     * 通过onClick事件来更新current值变化
     * @param value
     */
    changeCurrentHandler(value) {
      dispatch(changeCurrent({current: value}));
      Taro.redirectTo({
        url: pageCurrentList[`${value}`]
      });
    },

    /**
     * 获取个人页随机的头像和昵称
     * @尹文楷
     */
    userTinyHomeInfoHandler() {
      dispatch(userAPI.userTinyHomeInfoRequest.apply(this));
    },

    /**
     * 获取用户授权的个人信息(昵称跟头像),并进行保存
     * @尹文楷
     */
    getUserInfoSettingHandler(params) {
      dispatch(userAPI.syncUserInfoRequest.apply(this, [params]));
    },

    /**
     * 拉取收藏列表
     * @param pageNum
     * @尹文楷
     */
    async usersCollectionHandler(pageNum) {
      if (pageNum === 1) {
        await dispatch(setCollectionAttrValue({
          petCollectionList: []
        }));
      }
      await dispatch(setCollectionAttrValue({
        pageNum
      }));
      await Taro.navigateTo({
        url: pageCurrentList[5]
      });
      await dispatch(collectionAPI.usersCollectionRequest.apply(this));
    },

    /**
     * 拉取发布列表
     * @param pageNum
     * @尹文楷
     */
    async usersPublishMineHandler(pageNum) {
      if (pageNum === 1) {
        await dispatch(setPublishMineAttrValue({
          petPublishMineList: []
        }));
      }
      await dispatch(setPublishMineAttrValue({
        pageNum
      }));
      await Taro.navigateTo({
        url: pageCurrentList[6]
      });
      await dispatch(publishMineAPI.usersPublishMineRequest.apply(this));
    }
  }
})
class User extends Component {
  constructor(props) {
    super(props);
  }

  static options = {
    addGlobalClass: true
  };

  config = {
    navigationBarTitleText: "我"
  };

  async componentWillMount() {
    await mta.Page.init();
  }

  async componentDidMount() {
    const {userTinyHomeInfoHandler} = this.props;
    await userTinyHomeInfoHandler.apply(this);
  }

  async componentDidShow() {
    await Taro.showShareMenu({
      withShareTicket: false
    });
  }

  /**
   * 监听用户点击页面内转发按钮或右上角菜单“转发”按钮的行为，并自定义转发内容。
   * @param from
   * @param target
   * @param webViewUrl
   */
  onShareAppMessage({from, target, webViewUrl}) {
  }

  componentWillReceiveProps(nextProps) {
  }

  /**
   * 拉取收藏列表
   * @尹文楷
   */
  usersCollection() {
    const {usersCollectionHandler} = this.props;
    usersCollectionHandler.apply(this, [1]);
  }

  /**
   * 拉取发布列表
   * @尹文楷
   */
  usersPublishMine() {
    const {usersPublishMineHandler} = this.props;
    usersPublishMineHandler.apply(this, [1]);
  }

  /**
   * 获取用户授权的个人信息(昵称跟头像),并进行保存
   * @尹文楷
   */
  getUserInfo(res) {
    const {getUserInfoSettingHandler} = this.props;
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
      getUserInfoSettingHandler.apply(this, [userInfo]);
      mta.Event.stat("user_authorization", {});
    }
  }

  render() {
    const {homeStore, userStore, changeCurrentHandler} = this.props;
    const {current} = homeStore;
    const {nickName, avatar} = userStore;
    return (
      <View className='pet-me'>
        <View className='at-row pet-me-information'>
          <Button
            className='at-row pet-me-information-getPermission-button'
            openType='getUserInfo'
            onGetUserInfo={this.getUserInfo}
          >
            <AtAvatar
              className='pet-me-information-avatar'
              size='large'
              circle
              image={avatar}
            />
            <View className='at-col-7 pet-me-information-nickname'>
              {nickName}
            </View>
            <View className='at-col-2 pet-me-information-detail'>
              <AtIcon
                className='pet-me-information-detail-button'
                prefixClass='iconfont'
                value='petPlanet-right'
                color='#c8c8c8'
                size={18}
              />
            </View>
          </Button>
        </View>
        <View className='at-row at-row--wrap pet-me-information pet-me-information-nowrap'>
          <View
            className='at-row pet-me-information-collection'
            onClick={this.usersCollection}
          >
            <View className='at-col-9'>
              我的收藏
            </View>
            <View className='at-col-3 pet-me-information-collection-detail'>
              <AtIcon
                className='pet-me-information-collection-detail-button'
                prefixClass='iconfont'
                value='petPlanet-right'
                color='#c8c8c8'
                size={18}
              />
            </View>
          </View>
          <View
            className='at-row pet-me-information-publish'
            onClick={this.usersPublishMine}
          >
            <View className='at-col-9'>
              我的发布
            </View>
            <View className='at-col-3 pet-me-information-publish-detail'>
              <AtIcon
                className='pet-me-information-publish-detail-button'
                prefixClass='iconfont'
                value='petPlanet-right'
                color='#c8c8c8'
                size={18}
              />
            </View>
          </View>
        </View>
        <AtTabBar
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

export default User;
