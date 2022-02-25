import Taro from '@tarojs/taro';
import Tools from '../../../utils/petPlanetTools';
import * as constants from '../constants';
import {staticData} from '../../../constants';

/**
 * 获得通用商品列表
 */
function getGoodList() {
  const {
    id = 0,
    searchType = 1,
    para = '',
    goodsList = []
  } = this.state;
  let {
    pageNum = 1
  } = this.state;
  return Tools.request({
    url: 'eshop/goods/common/v2/list',
    method: 'post',
    data: {
      categoryId: id,
      searchType,
      pageNum,
      pageSize: constants.staticData.pageSize,
      para
    },
    success: (data = {}, header = {}) => {
      const {data: _data = [], total = 0} = data;
      const _goodsList = [...goodsList, ..._data],
        length = _goodsList.length;
      this.setState({
        goodsList: _goodsList,
        total,
        pageNum: ++pageNum,
        loading: false,
        isShowLoad: length >= total,
        loadStatus: length < total ? staticData.loadStatusConfig.loading : staticData.loadStatusConfig.noMore
      }, () => {
        this.isNext = true;
      });
    },
    fail: (res = {}) => {
      this.setState({
        loading: false
      });
    },
    complete: (res = {}) => {
    }
  });
}

export {
  getGoodList
};
