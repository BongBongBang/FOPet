import Taro, {Component} from "@tarojs/taro";
import {connect} from "@tarojs/redux";
import {View} from "@tarojs/components";
import mta from "mta-wechat-analysis";
import {setCollectionAttrValue} from "../../actions/collection";
import {CardView} from "../../components/bussiness-components";
import {staticData, pageCurrentList} from "../../utils/static";
import {collectionAPI} from "../../services";
import "../iconfont/iconfont.less";
import "./index.less";
import "./card-view.less";


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

  async componentWillMount() {
    await mta.Page.init();
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
   * @尹文楷
   **/
  async getPetCollectionDetailHandler(id) {
    await Taro.navigateTo({
      url: `${pageCurrentList[2]}?id=${id}&page=collection`
    });
  }

  render() {
    const {collectionStore} = this.props;
    const {petCollectionList, loadStatus} = collectionStore;
    return (
      <View className='pet'>
        {/*宠物收藏列表区域*/}
        <CardView
          list={petCollectionList}
          onScrollToLower={this.onScrollToLower}
          onClick={this.getPetCollectionDetailHandler}
          loadStatus={loadStatus}
        />
      </View>
    )
  }
}

export default Collection;
