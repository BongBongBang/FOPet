import Taro, {Component} from "@tarojs/taro";
import {View} from "@tarojs/components";
import {AtTabBar, AtAvatar, AtIcon} from "taro-ui";
import {connect} from "@tarojs/redux";
import mta from "mta-wechat-analysis";
import {changeCurrent} from "../../actions/home";
import {setCollectionAttrValue} from "../../actions/collection";
import {setPublishMineAttrValue} from "../../actions/publishMine";
import {tabBarTabList, pageCurrentList} from "../../utils/static";
import {collectionAPI, publishMineAPI} from "../../services";

import "../iconfont/iconfont.less";
import "./user.less";

@connect((state) => {
  return {
    homeStore: state.homeStore,
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
        url: pageCurrentList[4]
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
        url: pageCurrentList[5]
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

  componentDidMount() {

  }

  componentDidShow() {
    Taro.showShareMenu({
      withShareTicket: true
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

  render() {
    const {homeStore, changeCurrentHandler} = this.props;
    const {current} = homeStore;
    return (
      <View className='pet-me'>
        <View className='at-row pet-me-information'>
          <AtAvatar
            className='pet-me-information-avatar'
            size='large'
            circle
            openData={{type: 'userAvatarUrl'}}
          />
          <open-data type='userNickName' class='at-col-7 pet-me-information-nickname'>

          </open-data>
          <View className='at-col-2 pet-me-information-detail'>
            <AtIcon
              className='pet-me-information-detail-button'
              prefixClass='iconfont'
              value='petPlanet-right'
              color='#c8c8c8'
              size={18}
            />
          </View>
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
