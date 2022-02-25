import Taro from '@tarojs/taro';

import Tools from '../../../../utils/petPlanetTools';
import {evaluationResultConfig, pageCurrentList} from '../../../../constants';

/**
 * 创建评价
 */
function evaluationAdd(goodsId = 0, skuId = 0) {
  const {
    //评分
    score = 5,
    //评价
    mark = '',
    //订单信息
    order = {}
  } = this.state;
  const {orderNo = ''} = order;
  return Tools.request({
    url: 'eshop/comment/add',
    method: 'post',
    data: {
      goodsId,
      goodsSkuId: skuId,
      score,
      mark,
      orderNo
    },
    success: () => {
      Taro.showToast({
        title: '推荐成功~',
        duration: 2000,
        success: () => {
          setTimeout(() => {
            //清除应用内所有的页面,然后跳转到结果页
            Taro.reLaunch({
              url: `${pageCurrentList[15]}?content=${evaluationResultConfig.content}&title=${evaluationResultConfig.title}&url=${encodeURIComponent(`${evaluationResultConfig.url}?id=${goodsId}`)}&name=${evaluationResultConfig.name}`
            });
          }, 2000);
        },
        fail: () => {
        },
        complete: () => {
        }
      });
    },
    fail: () => {
    },
    complete: () => {
    }
  })
}

export {
  evaluationAdd
};
