import moment from 'moment';
import Tools from '../../../../utils/petPlanetTools';


Tools.getMomentConfig(moment);

/**
 * 获取普通商品订单查询
 */
function getOrderDetail() {
  const {orderNo = '', orderId = 0} = this.state;
  return Tools.request({
    url: `eshop/order/common/get/v1/${orderNo}`,
    success: (data = {}, statusCode = 200) => {
      let {
        address = {},
        item = [],
        expressInfo = {},
        paymentEndTime,
        payment = '',
        orderNo = '',
        orderTime = '',
        paymentTime = '',
        orderStatus = '',
        remark = ''
      } = data;
      let durationToEndTime = '',
        nowTime = Date.now(),
        durationMinutes = moment(paymentEndTime).diff(moment(nowTime), 'minutes'),
        durationSeconds = moment(paymentEndTime).diff(moment(nowTime), 'seconds') - (durationMinutes * 60);
      expressInfo = expressInfo || {};
      durationToEndTime = `距离订单关闭: ${durationMinutes}分${`0${durationSeconds}`.slice(-2)}秒`;

      const info = {
        orderNo,
        orderTime: moment(orderTime).format('YYYY-MM-DD HH:mm:ss'),
        deliveryTime: expressInfo.deliveryTime ? moment(expressInfo.deliveryTime).format('YYYY-MM-DD HH:mm:ss') : '',
        paymentTime: paymentTime ? moment(paymentTime).format('YYYY-MM-DD HH:mm:ss') : '',
        expressCompany: expressInfo.company || '',
        express: expressInfo.express || '',
        remark
      };
      this.setState({
        loading: false,
        orderStatus,
        address,
        item,
        express: expressInfo,
        payment,
        info,
        durationToEndTime
      });
    },
    fail: (res) => {
      this.setState({
        loading: false
      });
    },
    complete: (res) => {

    }
  });
}

/**
 * 在订单列表页生成支付单
 * @returns {*}
 */
function paymentPayOrder() {
  const {channel, payment, orderId} = this.state;
  return Tools.request({
    url: 'payment/pay',
    method: 'post',
    data: {
      orderId,
      channel,
      actualPrice: (parseFloat(payment) * 100)
    },
    success: (data) => {
      const {prepayId, nonceStr, timestamp, paySign, signType} = data;
      Tools.requestPaymentConfig({
        timeStamp: timestamp,
        nonceStr,
        package: `prepay_id=${prepayId}`,
        signType,
        paySign,
        success: () => {
          fosterSetStatus.call(this, () => {
            getOrderDetail.call(this);
          });
        },
        fail: (res) => {
        },
        complete: (res) => {
          this.initialLoading();
        }
      });
    },
    fail: (res) => {
      this.initialLoading();
    },
    complete: (res) => {

    }
  });
}

/**
 * 订单状态回调
 */
function fosterSetStatus(fn = () => {
}, _orderId = 0) {
  const {orderId = 0} = this.state;
  return Tools.request({
    url: `eshop/order/foster/set/v1/${_orderId ? _orderId : orderId}`,
    method: 'post',
    success: () => {
      fn();
    },
    fail: (res) => {

    },
    complete: (res) => {

    }
  });
}

const commonOrderDetailAPI = {
  getOrderDetail,
  paymentPayOrder,
  fosterSetStatus
};

export default commonOrderDetailAPI
