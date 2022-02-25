import Taro, {Component} from "@tarojs/taro";
import {connect} from "@tarojs/redux";
import {View} from "@tarojs/components";
import mta from "mta-wechat-analysis";
import {setPublishMineAttrValue} from "../../actions/publishMine";
import {CardView} from "../../components/bussiness-components";
import {staticData, pageCurrentList} from "../../utils/static";
import {publishMineAPI} from "../../services";
import LoadingView from "../../components/bussiness-components/LoadingView";
import prompt from "../../constants/prompt";

import "../iconfont/iconfont.less";
import "./card-view.less";
import "./index.less";
import "./loading-view.less";
import {AtIcon} from "taro-ui";


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

  state = {
    //是否显示正在加载loading页面......
    loading: true
  };

  async componentWillMount() {
    await mta.Page.init();
  }

  /**
   * 挂载时，请求拉取发布列表
   * @尹文楷
   */
  componentDidMount() {
  }

  /**
   * 页面显示时，请求拉取发布列表
   */
  componentDidShow() {
    const {usersPublishMineHandler} = this.props;
    usersPublishMineHandler.call(this, 1);
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
      url: `${pageCurrentList[4]}?id=${id}&page=publishMine`
    });
  }

  render() {
    const {onScrollToLower, getPetPublishMineDetailHandler} = this;
    const {publishMineStore} = this.props;
    const {petPublishMineList, loadStatus} = publishMineStore;
    const {loading} = this.state;
    return (
      <View className='pet'>
        {
          loading && <LoadingView
            size={56}
            color='#fb2a5d'
            className='pet-business-loading'
            content={prompt["detail"]["loading"]["text"]}
          />
        }
        {
          petPublishMineList && petPublishMineList.length <= 0 && <View className='pet-publishMine-empty'>
            <AtIcon
              className='pet-publishMine-empty-icon'
              prefixClass='iconfont'
              value='petPlanet-cat-ao'
              color='#000'
              size={48}
            />
            <View className='pet-publishMine-empty-description'>
              啊哦~喵星搜索不到喵星人~~
            </View>
          </View>
        }
        {/*宠物收藏列表区域*/}
        <CardView
          list={petPublishMineList}
          onScrollToLower={onScrollToLower.bind(this)}
          onClick={getPetPublishMineDetailHandler.bind(this)}
          loadStatus={loadStatus}
        />
      </View>
    )
  }
}

export default publishMine;
