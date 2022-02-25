/**
 * 订单信息配置
 * @type {({})[]}
 */
const orderInfo = [{
  id: 'remark',
  name: '买家留言',
  isNone: true
}, {
  id: 'orderNo',
  name: '订单编号'
}, {
  id: 'channel',
  name: '支付方式',
  value: '微信支付'
}, {
  id: 'orderTime',
  name: '下单时间'
}, {
  id: 'deliveryTime',
  name: '发货时间',
  value: '尚未发货'
}, {
  id: 'paymentTime',
  name: '支付时间',
  value: '尚未支付'
}, {
  id: 'expressCompany',
  name: '物流公司',
  value: '尚未发货'
}, {
  id: 'express',
  name: '快递单号',
  value: '尚未发货'
}];

export {
  orderInfo
}
