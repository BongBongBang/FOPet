import Taro, {Component} from "@tarojs/taro";
import {connect} from "@tarojs/redux";
import {View} from "@tarojs/components";
import mta from "mta-wechat-analysis";
import {setCollectionAttrValue} from "./collection_action";
import {CardView} from "../../components/bussiness-components";
import {AtIcon} from "taro-ui";
import {staticData, pageCurrentList} from "../../utils/static";
import collectionAPI from "./collection_service";
import LoadingView from "../../components/bussiness-components/LoadingView";
import * as constants from "./constants";

import "../iconfont/iconfont.less";
import "./index.less";
import "./card-view.less";
import "./loading-view.less";


@connect((state) => {
  return {
    homeStore: state.homeStore,
    collectionStore: state.collectionStore
  }
}, (dispatch) => {
  return {
    /**
     * 改变redux store里面的数据状态
     * @尹文楷
     */
    setAttrValueHandler(payload) {
      dispatch(setCollectionAttrValue(payload));
    },

    /**
     * 拉取收藏列表
     * @param pageNum
     * @尹文楷
     */
    async usersCollectionHandler(pageNum) {
      await dispatch(setCollectionAttrValue({
        pageNum
      }));
      await dispatch(collectionAPI.usersCollectionRequest.apply(this));
    }
  }
})
class Collection extends Component {
  static options = {
    addGlobalClass: true
  };

  config = {
    navigationBarTitleText: "收藏列表"
  };

  state = {
    //是否显示正在加载loading页面......
    loading: true
  };

  async componentWillMount() {
    await mta.Page.init();
  }

  /**
   * 组件挂载时，请求拉取收藏列表的接口
   */
  componentDidMount() {
  }

  /**
   * 页面显示时，请求拉取收藏列表的接口
   */
  componentDidShow() {
    const {usersCollectionHandler} = this.props;
    usersCollectionHandler.call(this, 1);
  }

  /**
   * 当滚动条滚到底部的时候进行上拉加载动作
   * @尹文楷
   */
  async onScrollToLower() {
    const {collectionStore, usersCollectionHandler, setAttrValueHandler} = this.props;
    let {pageNum, loadStatus, currentPetCollectionList} = collectionStore;
    if (currentPetCollectionList.length === staticData["pageSize"] && loadStatus === staticData["loadStatusConfig"]["more"]) {
      await setAttrValueHandler({
        loadStatus: staticData["loadStatusConfig"]["loading"]
      });
      await usersCollectionHandler.apply(this, [++pageNum]);
      mta.Event.stat("collection_scrolltolower", {});
    }
  }

  /**
   * 获取详情页内容
   * @param id
   * @param avatarUrl
   * @param nickName
   * @尹文楷
   **/
  async getPetCollectionDetailHandler(id, avatarUrl, nickName) {
    await Taro.navigateTo({
      url: `${pageCurrentList[5]}?id=${id}&avatarUrl=${avatarUrl}&nickName=${nickName}&page=collection`
    });
  }

  render() {
    const {collectionStore} = this.props;
    const {petCollectionList, loadStatus} = collectionStore;
    const {onScrollToLower, getPetCollectionDetailHandler} = this;
    const {loading} = this.state;
    return (
      <View className='pet'>
        {
          loading && <LoadingView
            size={56}
            color='#fb2a5d'
            className='pet-business-loading'
            content={constants.loading.text}
          />
        }
        {
          petCollectionList && petCollectionList.length <= 0 && <View className='pet-collection-empty'>
            <AtIcon
              className='pet-collection-empty-icon'
              prefixClass='iconfont'
              value='petPlanet-cat-ao'
              color='#000'
              size={48}
            />
            <View className='pet-collection-empty-description'>
              啊哦~喵星搜索不到喵星人~~
            </View>
          </View>
        }
        {/*宠物收藏列表区域*/}
        <CardView
          multiple
          list={petCollectionList}
          onScrollToLower={onScrollToLower.bind(this)}
          onClick={getPetCollectionDetailHandler.bind(this)}
          loadStatus={loadStatus}
        />
      </View>
    )
  }
}

export default Collection;
