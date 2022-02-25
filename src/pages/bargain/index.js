import Taro, {Component} from '@tarojs/taro';
import {
  Block,
  Image,
  Text,
  View
} from '@tarojs/components';
import {
  AtButton,
  AtLoadMore
} from 'taro-ui';

import {imgs} from '../../assets';
import * as bargainApi from './bargain_service';
import {
  EmptyView,
  ListItemView,
  LoadingView
} from '../../components/bussiness-components';
import {loadingStatus, staticData, pageCurrentList} from '../../constants';

import 'taro-ui/dist/style/components/activity-indicator.scss';
import 'taro-ui/dist/style/components/load-more.scss';
import 'taro-ui/dist/style/components/button.scss';
import './loading-view.less';
import './index.less';

class Bargain extends Component {
  constructor(props) {
    super(props);
    this.isNext = true;
  }

  static options = {
    addGlobalClass: true
  };

  config = {
    navigationBarTitleText: '疯狂砍价'
  };

  state = {
    //当前页码
    pageNum: 1,
    //是否显示正在加载loading页面......
    loading: true,
    //砍价的商品列表
    bargainList: [],
    //砍价商品总数
    total: 0,
    //是否显示状态组件
    isShowLoad: false,
    //加载状态
    loadStatus: staticData.loadStatusConfig.loading,
  };

  componentDidMount() {
    const {pageNum = 1} = this.state;
    bargainApi.getCutSaleList.call(this, pageNum);
  }

  /**
   * 触底加载列表新的一页
   */
  onReachBottom() {
    let {pageNum = 1, bargainList = [], total = 0} = this.state;
    const {isNext = true} = this;
    let bargainListLength = bargainList.length;
    if (bargainListLength < total && isNext) {
      this.setState({
        isShowLoad: true
      }, () => {
        this.isNext = false;
        bargainApi.getCutSaleList.call(this, ++pageNum);
      });
    }
  }

  /**
   * 重定向至砍价详情页
   */
  redirectToGoodsDetail = (event = {}) => {
    const {currentTarget: {dataset: {item = ''}}} = event;
    const dataItem = JSON.parse(item) || {};
    Taro.navigateTo({
      url: `${pageCurrentList[39]}?id=${dataItem['cutSaleNo']}&goodsId=${dataItem['goodsId']}&cutSaleName=${dataItem['cutSaleName']}`
    });
    //取消冒泡事件
    event.stopPropagation();
  };

  render() {
    const {
      loading = true,
      bargainList = [],
      total = 0,
      isShowLoad = false,
      loadStatus = staticData.loadStatusConfig.loading
    } = this.state;
    const {
      redirectToGoodsDetail = () => {
      }
    } = this;
    return (
      <Block>
        {
          loading && <LoadingView
            size={56}
            color='#fb2a5d'
            className='pet-bargain-loading'
            content={loadingStatus.progress.text}
          />
        }
        <View className='pet-bargain'>
          <View className='pet-bargain-banner'>
            <Image
              src={imgs.cutSaleBg}
              mode='widthFix'
            />
          </View>
          <View className='pet-bargainList'>
            {
              bargainList && bargainList.length > 0 ? bargainList.map(bargainItem => {
                return <ListItemView
                  dataItem={JSON.stringify(bargainItem)}
                  className='pet-bargainList-item'
                  onClick={redirectToGoodsDetail}
                  key={Number(bargainItem['goodsId'])}
                  title={bargainItem['goodsName']}
                  renderHeadFigure={
                    <Image
                      src={bargainItem['goodsCoverPic']}
                      mode='aspectFill'
                      className='pet-bargainList-item-cover'
                    />
                  }
                  renderDesc={<View className='pet-bargainList-item-content'>
                    <View className='pet-bargainList-item-content-symbol'>
                      #{bargainItem['cutSaleName']}
                    </View>
                    <View className='pet-bargainList-item-content-desc'>
                      <Text className='pet-bargainList-item-content-desc-tag'>
                        {bargainItem['cutPersonTotal']}人砍
                      </Text>
                      <Text className='pet-bargainList-item-content-desc-isPost'>
                        包邮
                      </Text>
                      <Text className='pet-bargainList-item-content-desc-cutHour'>
                        限时{bargainItem['cutHourTotal']}小时
                      </Text>
                    </View>
                    <View className='pet-bargainList-item-content-price'>
                      <View className='pet-bargainList-item-content-price-disc'>
                        <Text className='pet-bargainList-item-content-price-disc-title'>底价:</Text><Text
                        className='pet-bargainList-item-content-price-disc-symbol'>
                        &#165;
                      </Text>
                        {parseFloat(bargainItem['floorPrice'] / 100)}
                      </View>
                    </View>
                    <View className='pet-bargainList-item-content-real'>
                      <Text className='pet-bargainList-item-content-real-title'>正价:</Text>
                      <Text className='pet-bargainList-item-content-real-symbol'>
                        &#165;
                      </Text>
                      {parseFloat(bargainItem['salePrice'] / 100)}
                      <Text className='pet-bargainList-item-content-real-title'>限量:</Text>
                      {bargainItem['stock']}
                    </View>
                    <AtButton
                      className='pet-bargainList-item-content-startBargain'
                      type='primary'
                    >
                      发起砍价
                    </AtButton>
                  </View>}
                />
              }) : <EmptyView
                className='pet-bargainList-empty'
                title='啊哦~~~'
                description='铲屎官没有发现任何砍价商品~'
                size={48}
                color='#000'
                icon='petPlanet-cat-ao'
                prefix='iconfont'
              />
            }
            {
              (isShowLoad && total !== 0) ? <AtLoadMore
                className='pet-bargainList-loadMore'
                status={loadStatus}
              >
              </AtLoadMore> : <View className='pet-goodsList-block'>
              </View>
            }
          </View>
        </View>
      </Block>
    );
  }
}

export default Bargain;
