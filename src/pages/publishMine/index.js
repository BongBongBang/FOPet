import Taro, {Component} from "@tarojs/taro";
import {connect} from "@tarojs/redux";
import {View} from "@tarojs/components";
import mta from "mta-wechat-analysis";
import {setPublishMineAttrValue} from "../../actions/publishMine";
import {CardView} from "../../components/bussiness-components";
import {staticData, pageCurrentList} from "../../utils/static";
import {publishMineAPI} from "../../services";
import "../iconfont/iconfont.less";
import "./index.less";
import "./card-view.less";


@connect((state) => {
  return {
    homeStore: state.homeStore,
    publishMineStore: state.publishMineStore
  }
}, (dispatch) => {
  return {
    /**
     * 改变redux store里面的数据状态
     * @尹文楷
     */
    setAttrValueHandler(payload) {
      dispatch(setPublishMineAttrValue(payload));
    },

    /**
     * 拉取发布列表
     * @param pageNum
     * @尹文楷
     */
    async usersPublishMineHandler(pageNum) {
      await dispatch(setPublishMineAttrValue({
        pageNum
      }));
      await dispatch(publishMineAPI.usersPublishMineRequest.apply(this));
    }
  }
})
class publishMine extends Component {
  static options = {
    addGlobalClass: true
  };

  config = {
    navigationBarTitleText: "发布列表"
  };

  async componentWillMount() {
    await mta.Page.init();
  }

  /**
   * 当滚动条滚到底部的时候进行上拉加载动作
   * @尹文楷
   */
  async onScrollToLower() {
    const {publishMineStore, usersPublishMineHandler, setAttrValueHandler} = this.props;
    let {pageNum, loadStatus, currentPetPublishMineList} = publishMineStore;
    if (currentPetPublishMineList.length === staticData["pageSize"] && loadStatus === staticData["loadStatusConfig"]["more"]) {
      await setAttrValueHandler({
        loadStatus: staticData["loadStatusConfig"]["loading"]
      });
      await usersPublishMineHandler.apply(this, [++pageNum]);
      mta.Event.stat("publishmine_scrolltolower", {});
    }
  }

  /**
   * 获取详情页内容
   * @param id
   * @尹文楷
   **/
  async getPetPublishMineDetailHandler(id) {
    await Taro.navigateTo({
      url: `${pageCurrentList[2]}?id=${id}&page=publishMine`
    });
  }

  render() {
    const {publishMineStore} = this.props;
    const {petPublishMineList, loadStatus} = publishMineStore;
    return (
      <View className='pet'>
        {/*宠物收藏列表区域*/}
        <CardView
          list={petPublishMineList}
          onScrollToLower={this.onScrollToLower}
          onClick={this.getPetPublishMineDetailHandler}
          loadStatus={loadStatus}
        />
      </View>
    )
  }
}

export default publishMine;
