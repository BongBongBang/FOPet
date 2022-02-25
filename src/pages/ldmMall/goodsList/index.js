import Taro, {Component} from '@tarojs/taro';
import {
  Block,
  View,
  Text,
  Image
} from '@tarojs/components';
import {
  LdmNavBar
} from 'ldm-taro-frc';
import {
  AtLoadMore
} from 'taro-ui';

import {
  EmptyView,
  LoadingView,
  ListItemView
} from '../../../components/bussiness-components';
import * as goodsListApi from './goodList_service'
import {imgs} from '../../../assets';
import {loadingStatus, staticData, pageCurrentList} from '../../../constants';

import 'taro-ui/dist/style/components/load-more.scss';
import 'taro-ui/dist/style/components/activity-indicator.scss';
import 'taro-ui/dist/style/components/button.scss';
import '../../commons/iconfont/iconfont.less';
import '../loading-view.less';
import './index.less';
import page from "@tarojs/cli/src/create/page";

/**
 * 商品列表
 */
class GoodsList extends Component {
  constructor(props) {
    super(props);
    this.height = 0;
    this.isNext = true;
  }

  config = {
    navigationBarTitleText: '商品列表',
    navigationStyle: 'custom'
  };

  state = {
    //商品总数
    total: 0,
    //是否显示正在加载loading页面......
    loading: true,
    //是否显示状态组件
    isShowLoad: false,
    //加载状态
    loadStatus: staticData.loadStatusConfig.loading,
    //商品列表
    goodsList: [],
    //页码
    pageNum: 1,
    //分类名称
    name: '',
    //子级分类id
    id: 0,
    //查询类型
    searchType: ''
  };

  componentWillMount() {
    const {params: {name = '', id = 0, searchType = '', para = ''}} = this.$router;
    this.setState({
      name,
      id,
      searchType,
      para
    });
  }

  componentDidMount() {
    goodsListApi.getGoodList.call(this);
  }

  /**
   * 返回上一个页面
   */
  redirectToBackPage = (e) => {
    Taro.navigateBack({
      delta: 1
    });
    //取消冒泡
    e.stopPropagation();
  };

  /**
   * 上拉加载订单数据
   */
  onReachBottom() {
    const {goodsList: {length = 0}, total} = this.state;
    const {isNext} = this;
    if (length < total && isNext) {
      this.isNext = false;
      this.setState({
        isShowLoad: true
      }, () => {
        goodsListApi.getGoodList.call(this);
      });
    }
  }

  /**
   * 跳转至商品详情
   */
  redirectToGoodsDetail = (e = {}) => {
    const {currentTarget: {dataset: {item = ''}}} = e;
    const _item = JSON.parse(item);
    Taro.navigateTo({
      url: `${pageCurrentList[32]}?id=${_item.goodsId}`
    });
    //取消冒泡事件
    e.stopPropagation();
  };

  render() {
    const {
      name = '',
      goodsList = [],
      total = 0,
      isShowLoad = false,
      loading = true,
      loadStatus = staticData.loadStatusConfig.loading
    } = this.state;
    const {
      redirectToBackPage = () => {
      },
      redirectToGoodsDetail = () => {
      }
    } = this;
    return <Block>
      {
        loading && <LoadingView
          size={56}
          color='#fb2a5d'
          className='pet-goodsList-loading'
          content={loadingStatus.progress.text}
        />
      }
      <LdmNavBar
        refs={({height = 0}) => this.height = height}
        color='#000'
        title={name}
        imgs={imgs.back}
        onClickLeftIcon={redirectToBackPage}
        className='pet-goodsList-navBar'
      />
      <View
        className='pet-goodsList'
        style={{height: `calc(100% - ${this.height + 4}px)`}}
      >
        {
          goodsList && goodsList.length > 0 ? goodsList.map(goodItem => {
            return <ListItemView
              dataItem={JSON.stringify(goodItem)}
              className='pet-goodsList-item'
              onClick={redirectToGoodsDetail}
              key={Number(goodItem['id'])}
              title={goodItem['goodsName']}
              renderHeadFigure={
                <Image
                  src={goodItem['coverPic']}
                  mode='aspectFill'
                  className='pet-goodsList-item-cover'
                />
              }
              renderDesc={<View className='pet-goodsList-item-content'>
                <View className='pet-goodsList-item-content-desc'>
                  {goodItem['goodsDesc']}
                </View>
                <View className='pet-goodsList-item-content-price'>
                  <View className='pet-goodsList-item-content-price-disc'>
                    <Text className='pet-goodsList-item-content-price-disc-symbol'>
                      &#165;
                    </Text>
                    {goodItem['floorDiscPrice']}
                  </View>
                  <View className='pet-goodsList-item-content-price-real'>
                    <Text className='pet-goodsList-item-content-price-real-symbol'>
                      &#165;
                    </Text>
                    {goodItem['floorPrice']}
                  </View>
                </View>
                <View className='pet-goodsList-item-content-sale'>
                  共销{goodItem['sales']}单
                </View>
              </View>}
            />
          }) : <EmptyView
            className='pet-goodsList-empty'
            title='啊哦~~~'
            description='铲屎官没有发现任何商品'
            size={48}
            color='#000'
            icon='petPlanet-cat-ao'
            prefix='iconfont'
          />
        }
        {
          (isShowLoad && total !== 0) ? <AtLoadMore
            className='pet-goodsList-loadMore'
            status={loadStatus}
          >
          </AtLoadMore> : <View className='pet-goodsList-block'>
          </View>
        }
      </View>
    </Block>
  }
}

export default GoodsList;
