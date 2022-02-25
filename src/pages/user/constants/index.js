import Taro from '@tarojs/taro';
import {imgs} from '../../../assets';
import {pageCurrentList} from '../../../constants';

//action type协定
const userConstants = {
  SET_USER_ATTR_VALUE: 'SET_USER_ATTR_VALUE'
};

//对于'我'的页面,各种功能项的配置
const meInfoConfig = [{
  id: 'collection',
  name: '我的收藏',
  onClick(e) {
    const {usersCollectionHandler} = this.props;
    usersCollectionHandler.apply(this, [1]);
    //取消冒泡
    e.stopPropagation();
  }
}, {
  id: 'publishMine',
  name: '我的发布',
  onClick(e) {
    const {usersPublishMineHandler} = this.props;
    usersPublishMineHandler.apply(this, [1]);
    //取消冒泡
    e.stopPropagation();
  }
}, {
  id: 'message',
  name: '我的消息',
  imgs: imgs.message,
  message: true,
  onClick(e) {
    Taro.navigateTo({
      url: pageCurrentList[5]
    });
    //取消冒泡
    e.stopPropagation();
  }
}, {
  id: 'placeOrder',
  name: '我的订单',
  imgs: imgs.placeOrder,
  onClick(e) {
    Taro.navigateTo({
      url: pageCurrentList[29]
    });
    //取消冒泡
    e.stopPropagation();
  }
}];

/**
 * 底部tabBar标识
 * @type {string}
 */
const symbol = 'me';

export {
  userConstants,
  meInfoConfig,
  symbol
};
