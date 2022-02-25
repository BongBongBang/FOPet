import Taro, {Component} from "@tarojs/taro";
import {View, Text, ScrollView, Image} from "@tarojs/components";
import {
  AtIcon,
  AtButton,
  AtActivityIndicator,
  AtTag
} from "taro-ui";
import {connect} from "@tarojs/redux";
import mta from "mta-wechat-analysis";
import Tools from "../../utils/petPlanetTools";
import {homeAPI, detailAPI, collectionAPI} from "../../services/index";
import {setDetailAttrValue} from "../../actions/detail";
import {setCollectionAttrValue} from "../../actions/collection";
import {pageCurrentList, staticData} from "../../utils/static";
import prompt from "../../constants/prompt";
import "../iconfont/iconfont.less";
import "./index.less";

@connect((state) => {
  return {
    homeStore: state.homeStore,
    detailStore: state.detailStore,
    collectionStore: state.collectionStore
  };
}, (dispatch) => {
  return {
    /**
     * 多层处理函数
     * @尹文楷
     * @param payload
     */
    setAttrValueHandler(payload) {
      dispatch(setDetailAttrValue(payload));
    },
    /**
     * 获取宠物发布之后的内容详情
     * @尹文楷
     * @param id
     * @returns {Promise<void>}
     */
    async getPetDetailInfoHandler(id) {
      await dispatch(homeAPI.getPetDetailRequest.apply(this, [id]));
    },
    /**
     * 对此宠物交易进行收藏
     * @returns {Promise<void>}
     */
    async setCollectionHandler() {
      await dispatch(detailAPI.setCollectionRequest.apply(this));
    },
    /**
     * 对此宠物交易进行取消收藏
     * @returns {Promise<void>}
     */
    async setNoCollectionHandler() {
      await dispatch(detailAPI.setNoCollectionRequest.apply(this));
    },
    /**
     * 拉取收藏列表
     * @尹文楷
     */
    async usersCollectionHandler() {
      await dispatch(setCollectionAttrValue({
        pageNum: 1,
        petCollectionList: [],
        currentPetCollectionList: [],
        loadStatus: staticData["loadStatusConfig"]["more"]
      }));
      await dispatch(collectionAPI.usersCollectionRequest.apply(this));
    }
  };
})
class Detail extends Component {
  static options = {
    addGlobalClass: true
  };
  config = {
    navigationBarTitleText: "内容详情"
  };

  async componentWillMount() {
    await mta.Page.init();
  }

  async componentDidMount() {
    const {getPetDetailInfoHandler} = this.props;
    const {id, page} = this.$router.params;
    await getPetDetailInfoHandler.apply(this, [id]);
    switch (page) {
      case "index":
        mta.Event.stat("index_cardview", {"indexcardviewid": id});
        break;
      case "collection":
        mta.Event.stat("collection_cardview", {"collectioncardviewid": id});
        break;
      case "publishMine":
        mta.Event.stat("publishmine_cardview", {"publishcardviewid": id});
        break;
    }
  }

  componentWillReceiveProps(nextProps) {

  }

  /**
   * 小程序页面在显示的时候触发
   * @尹文楷
   */
  componentDidShow() {
    Taro.showShareMenu({
      withShareTicket: true
    });
  }

  /**
   * 小程序页面在被注销退出的时候触发
   * @尹文楷
   */
  componentWillUnmount() {
    const {setAttrValueHandler} = this.props;
    setAttrValueHandler.apply(this, [{
      isLoading: true
    }]);
  }

  /**
   * 监听用户点击页面内转发按钮或右上角菜单“转发”按钮的行为，并自定义转发内容。
   * @returns {*}
   */
  onShareAppMessage({from, target, webViewUrl}) {
    const {detailStore} = this.props;
    const {title, images} = detailStore;
    const {id, page} = this.$router.params;
    return {
      title: `萌宠星球-${title}`,
      path: `${pageCurrentList[3]}?id=${id}&page=${page}`,
      imageUrl: images[0]
    }
  }

  /**
   * 对此宠物交易进行收藏
   * @尹文楷
   */
  async setCollection() {
    const {setCollectionHandler} = this.props;
    await setCollectionHandler.apply(this);
    mta.Event.stat("detail_collect", {});
  }

  /**
   * 对此宠物交易进行取消收藏
   * @尹文楷
   */
  async setNoCollection() {
    const {setNoCollectionHandler} = this.props;
    await setNoCollectionHandler.apply(this);
    mta.Event.stat("detail_nocollect", {});
  }

  /**
   * 判断此宠物交易是否进行收藏或者取消收藏的配置函数
   * @returns {Promise<void>}
   */
  async setCollectionConfig() {
    const {setCollection, setNoCollection} = this;
    const {detailStore, usersCollectionHandler} = this.props;
    const {collected} = detailStore;
    await collected ? setNoCollection.apply(this) : setCollection.apply(this);
    let currentPages = Taro.getCurrentPages(),
      length = currentPages.length;
    if (pageCurrentList[5].indexOf(currentPages[length - 2]["route"]) !== -1) {
      await usersCollectionHandler.apply(this);
    }
  }

  /**
   * 在新页面中全屏预览图片。预览的过程中用户可以进行保存图片、发送给朋友等操作。
   * @param value
   */
  onPreviewImage(value) {
    const {detailStore} = this.props;
    const {images} = detailStore;
    Tools.previewImageConfig({
      urls: images,
      current: value,
      success: (res) => {
        console.log(res);
      },
      complete: (res) => {
        console.log(res);
      }
    });
  }

  /**
   * 当第一张照片加载完毕时，直接将loading加载等待元素关闭
   */
  onImageLoad() {
    const {setAttrValueHandler} = this.props;
    setAttrValueHandler({
      isLoading: false
    });
  }

  render() {
    const {detailStore} = this.props;
    const {onPreviewImage} = this;
    const {title, isLoading, cost, content, collected, images, area, collection, collectionType, contactInfo, tags} = detailStore;
    return (
      <ScrollView
        className='pet-detail'
        scrollY={true}
        scrollTop={0}
      >
        {
          isLoading && <AtActivityIndicator
            size={56}
            color='#fb2a5d'
            className='pet-detail-activity-indicator'
            content={prompt["detail"]["loading"]["text"]}
          />
        }
        <View className='at-row at-row--no-wrap pet-detail-header'>
          <View className='at-col at-col-7 at-col__offset-1 at-col--wrap pet-detail-header-container'>
            <AtIcon
              prefixClass='iconfont'
              value='petPlanet-jinghao'
              size={14}
              className='pet-detail-header-title-icon'
              color='#fb2a5d'
            />
            <Text className='pet-detail-header-title'>
              {title}
            </Text>
          </View>
          <View className='at-col at-col-1'>

          </View>
          <View className='at-col at-col-3 pet-detail-header-collection'>
            <AtButton
              type={collectionType}
              size='small'
              className={`pet-detail-header-collection-button ${collected ? 'pet-detail-header-collection-button-collected' : ''}`}
              onClick={this.setCollectionConfig}
            >
              {collection}
            </AtButton>
          </View>
        </View>
        <View className='pet-detail-content'>
          <View className='pet-detail-content-price'>
            <Text className='pet-detail-content-price-symbol'>
              &#165;
            </Text>
            {cost}
            {
              tags && tags.length > 0 && tags.map((tagItem, tagIndex) => {
                return (
                  <AtTag
                    key={tagIndex}
                    size='small'
                    circle
                    type='primary'
                    className='pet-detail-content-tags'
                  >
                    {tagItem["title"]}
                  </AtTag>
                );
              })
            }
          </View>
          <View className='at-row at-row--wrap pet-detail-content-info'>
            {content}
          </View>
          <View className='at-row at-row--wrap pet-detail-content-contactInfo'>
            <View className='at-col at-col--wrap at-col-1'>
              <AtIcon
                prefixClass='iconfont'
                value='petPlanet-contactInfo'
                color='#5c89e4'
                size={18}
              />
            </View>
            <View className='at-col at-col--wrap at-col-11'>
              {contactInfo}
            </View>
          </View>
        </View>
        <View className='pet-detail-images'>
          {
            images && images.length && images.map((imageItem, imageIndex) => {
              return <Image
                className='pet-detail-image-item'
                key={imageIndex}
                mode='aspectFill'
                src={imageItem}
                onClick={onPreviewImage.bind(this, imageItem)}
                onLoad={this.onImageLoad}
              />
            })
          }
        </View>
        <View className='at-row at-row--no-wrap pet-detail-position'>
          <View className='at-col at-col-8 pet-detail-position-area'>
            <AtIcon
              prefixClass='iconfont'
              value='petPlanet-gps'
              className='pet-detail-position-area-icon'
              size={14}
              color='#ec544c'
            />
            {area}
          </View>
          <View className='at-col at-col-2'>

          </View>
          <View className='at-col at-col-2 pet-detail-position-share'>
            <AtButton
              openType='share'
              size='small'
              type='secondary'
              className='pet-detail-position-share-button'
            >
              <AtIcon prefixClass='iconfont' value='petPlanet-share' size={20} color='#5c89e4'/>
            </AtButton>
          </View>
        </View>
      </ScrollView>
    )
  }
}

export default Detail;
