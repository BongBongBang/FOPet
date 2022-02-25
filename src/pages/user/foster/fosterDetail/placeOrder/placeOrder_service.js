import Taro from '@tarojs/taro';
import dayjs from 'dayjs';
import Tools from '../../../../../utils/petPlanetTools';
import * as constants from '../placeOrder/constants';
import {pageCurrentList, status} from '../../../../../constants';
import commonOrderDetailAPI from '../../../../commons/detail/orderDetail/order_detail_service';

/**
 * 创建订单
 */
function createOrder() {
  const {
    moveStartTime,
    moveEndTime,
    contact,
    contactPhone,
    emContact,
    emContactPhone,
    desc,
    totalPrice,
    orderItem
  } = this.state;
  return Tools.request({
    url: 'eshop/order/foster/create/order/v1',
    method: 'post',
    dataType: 'json',
    data: {
      startTime: dayjs(moveStartTime).format('YYYY-MM-DD'),
      endTime: dayjs(moveEndTime).format('YYYY-MM-DD'),
      contactPerson: contact,
      contactPhone,
      emContactPerson: emContact,
      emContactPhone,
      remark: desc,
      payment: parseFloat(totalPrice),
      orderItem
    },
    success: data => {
      return data;
    },
    fail: (res) => {

    },
    complete: (res) => {

    }
  });
}

/**
 * 生成支付单
 * @param orderId
 * @param orderNo
 * @returns {*}
 */
function paymentPay(orderId, orderNo) {
  const {channel, totalPrice} = this.state;
  return Tools.request({
    url: 'payment/pay',
    method: 'post',
    data: {
      orderId,
      channel,
      actualPrice: (parseFloat(totalPrice) * 100)
    },
    success: (data) => {
      const {prepayId, nonceStr, timestamp, paySign, signType} = data;
      Tools.requestPaymentConfig({
        timeStamp: timestamp,
        nonceStr,
        package: `prepay_id=${prepayId}`,
        signType,
        paySign,
        success: (res) => {
          commonOrderDetailAPI.fosterSetStatus.call(this, () => {
            Taro.redirectTo({
              url: `${pageCurrentList[29]}?orderNo=${orderNo}&orderId=${orderId}`
            });
          }, orderId);
        },
        fail: (res) => {
          Taro.redirectTo({
            url: `${pageCurrentList[30]}`
          });
        },
        complete: (res) => {
          this.setState({
            loading: false
          });
        }
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
function paymentPayPlaceOrder() {
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
          commonOrderDetailAPI.fosterSetStatus.call(this, () => {
            getPlaceOrderDetail.call(this);
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
 * 获取订单详情
 * @returns {*}
 */
function getPlaceOrderDetail() {
  const {orderNo = ''} = this.state;
  return Tools.request({
    url: `/eshop/order/foster/get/v1/${orderNo}`,
    success: (data = {}) => {
      const {
        buyerName = '',
        buyerPic = '',
        orderStatus = '',
        startTime = '',
        endTime = '',
        family = {},
        fosterService = [],
        otherService = [],
        payment = '',
        contactPerson = '',
        contactPhone = '',
        emContactPhone = '',
        emContactPerson = '',
        orderTime = '',
        paymentTime = '',
        country = '',
        province = '',
        paymentEndTime = ''
      } = data;
      let fosterPetNum = 0,
        durationToEndTime = '',
        nowTime = Date.now();
      fosterService && fosterService.forEach(foster => {
        fosterPetNum += foster['goodsNum'];
      });
      otherService && otherService.forEach(other => {
        fosterPetNum += other['goodsNum'];
      });
      const startTimeDesc = dayjs(startTime).format('YYYY年MM月DD日'),
        endTimeDesc = dayjs(endTime).format('YYYY年MM月DD日'),
        orderTimeDesc = dayjs(orderTime).format('YYYY-MM-DD HH:mm:ss'),
        durationMinutes = Math.round(dayjs(paymentEndTime).diff(dayjs(nowTime), 'minute', true)),
        durationSeconds = Math.round(dayjs(paymentEndTime).diff(dayjs(nowTime), 'second', true) - (durationMinutes * 60)),
        paymentTimeDesc = paymentTime ? dayjs(paymentTime, 'YYYY-MM-DDTHH:mm:ss.000ZZ').format('YYYY-MM-DD HH:mm:ss') : status.noPayment,
        address = `${country} ${province}`,
        info = {
          fosterPetNum,
          timeDesc: `${startTimeDesc} - ${endTimeDesc}`,
          orderNo,
          orderTimeDesc,
          paymentTimeDesc
        };
      durationToEndTime = `距离订单关闭: ${durationMinutes}分${`0${durationSeconds}`.slice(-2)}秒`;
      this.setState({
        loading: false,
        buyerName,
        buyerPic,
        orderStatus,
        family,
        fosterService,
        otherService,
        startTime,
        endTime,
        payment,
        contactPerson,
        contactPhone,
        emContactPerson,
        emContactPhone,
        durationToEndTime,
        address,
        info
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
 * 用户完成寄养订单操作
 */
function orderClose() {
  const {orderId = 0} = this.state;
  return Tools.request({
    url: `eshop/order/close/v1/${orderId}`,
    success: (data) => {
      this.setState({
        orderStatus: constants.status.fostered
      });
    },
    fail: () => {

    },
    complete: () => {

    }
  });
}

/**
 *
 * @type {{createOrder: (function(): *), paymentPay: (function(*): *), getPlaceOrderDetail: getPlaceOrderDetail}}
 */
const placeOrderAPI = {
  createOrder,
  paymentPay,
  getPlaceOrderDetail,
  paymentPayPlaceOrder,
  orderClose
};

export default placeOrderAPI;
