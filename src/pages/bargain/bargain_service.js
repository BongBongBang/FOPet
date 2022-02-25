import Tools from '../../utils/petPlanetTools';
import {staticData} from '../../constants';

/**
 * 获取活动砍价列表
 * @param pageNum
 * @returns {*}
 */
function getCutSaleList(pageNum) {
  const {bargainList = []} = this.state;
  return Tools.request({
    url: 'eshop/campaign/searchCutSale',
    method: 'post',
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    data: {
      pageNum,
      pageSize: staticData.pageSize
    },
    success: (data = {}, header = {}) => {
      let _bargainList = bargainList,
        _bargainLength = 0;
      const {
        data: _data = [],
        total = 0
      } = data;
      _bargainList = [..._bargainList, ..._data];
      _bargainLength = _bargainList.length;
      this.isNext = true;
      this.setState({
        pageNum,
        bargainList: _bargainList,
        total,
        loading: false,
        isShowLoad: _bargainLength >= total,
        loadStatus: _bargainLength < total ? staticData.loadStatusConfig.loading : staticData.loadStatusConfig.noMore
      });
    },
    fail: (res = {}) => {
      this.isNext = true;
      this.setState({
        loading: false
      });
    },
    complete: (error = {}) => {
    }
  });
}

export {
  getCutSaleList
};
