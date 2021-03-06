import Taro, {Component} from '@tarojs/taro';
import {
  Image,
  View,
  Text,
  ScrollView
} from '@tarojs/components';
import {
  AtButton,
  AtFloatLayout,
  AtIcon,
  AtAvatar
} from 'taro-ui';
import cns from 'classnames';
import {
  LdmNavBar
} from 'ldm-taro-frc';

import Tools from '../../../../utils/petPlanetTools';
import * as orderConstants from '../order/constants';
import {
  LoadingView,
  EmptyView
} from '../../../../components/bussiness-components';
import {pageCurrentList, loadingStatus} from '../../../../constants';
import commonAddressAPI from './address_service';
import {imgs} from '../../../../assets';

import 'taro-ui/dist/style/components/load-more.scss';
import 'taro-ui/dist/style/components/activity-indicator.scss';
import 'taro-ui/dist/style/components/loading.scss';
import 'taro-ui/dist/style/components/button.scss';
import 'taro-ui/dist/style/components/icon.scss';

import '../../iconfont/iconfont.less';
import './index.less';
import './loading-view.less';

class CommonAddress extends Component {
  config = {
    navigationStyle: 'custom',
    navigationBarTitleText: '我的收货地址'
  };

  static options = {
    addGlobalClass: true
  };

  constructor(props) {
    super(props);
  }

  state = {
    //我的收货地址列表
    list: [],
    //
    loading: false
  };

  componentWillMount() {
    const {params: {addressList = ''}} = this.$router;
    const list = JSON.parse(addressList) || [];
    this.setState({
      list
    });
  }

  componentDidMount() {
    Taro.hideShareMenu();
  }

  /**
   * 上拉触底获取下一页的收货地址列表数据
   */
  onReachBottom() {

  }

  /**
   * 页面跳到上一页
   */
  redirectToBackPage = () => {
    Taro.navigateBack({
      delta: 1
    });
  };

  /**
   * 点击新增收货地址
   */
  onAddressAddHandler = (e) => {

  };

  render() {
    const {
      list = [],
      loading = false
    } = this.state;
    const {
      redirectToBackPage = () => {
      },
      onAddressAddHandler = () => {
      }
    } = this;
    return (
      <View className='address'>
        <LdmNavBar
          color='#000'
          title='我的收货地址'
          imgs={imgs.back}
          className='address-navBar'
          onClickLeftIcon={redirectToBackPage}
        />
        {
          loading && <LoadingView
            size={56}
            color='#fb2a5d'
            className='address-loading'
            content={loadingStatus.progress.text}
          />
        }
        <View className='address-container'>
          {
            list && list.length > 0 ? list.map(item => {
              return (
                <View>

                </View>
              )
            }) : <EmptyView
              icon='petPlanet-cat-ao'
              prefix='iconfont'
              description='啊哦~铲屎官搜索不到您的收货地址~'
              button={orderConstants.emptyAddressList.text}
              onClick={onAddressAddHandler}
            />
          }
        </View>
      </View>
    )
  }
}

export default CommonAddress;
