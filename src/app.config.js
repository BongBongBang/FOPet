export default {
    pages: [
        'pages/topics/index',
        'pages/index/index',
        'pages/ldmMall/index',
        'pages/medicalAdvice/index',
        'pages/user/index',
        'pages/user/message/index',
        'pages/index/publish/index',
        'pages/index/detail/index',
        'pages/user/collection/index',
        'pages/user/publishMine/index',
        'pages/attendance/index',
        'pages/user/message/communications/index',
        'pages/medicalAdvice/medicalConsult/index',
        'pages/medicalAdvice/medicalDoctor/index',
        'pages/commons/resultPage/index',
        'pages/medicalAdvice/selfObd/index',
        'pages/medicalAdvice/selfObd/disease/index',
        'pages/medicalAdvice/selfObd/disease/diseaseDetail/index',
        'pages/topics/flowPublish/flowTopics/index',
        'pages/topics/topicsDetail/index',
        'pages/commons/scope/index',
        'pages/topics/topicsDetail/flowComment/index',
        'pages/topics/flowPublish/index',
        'pages/topics/findTopics/index',
        'pages/user/foster/index',
        'pages/user/foster/fosterDetail/index',
        'pages/user/foster/fosterDetail/placeOrder/index',
        'pages/user/foster/fosterDetail/agreement/index',
        'pages/user/foster/fosterDetail/placeOrderDetail/index',
        'pages/user/orderList/index',
        'pages/commons/redPacket/index',
        'pages/commons/detail/index',
        'pages/user/message/communications/communicationsGoodsList/index',
        'pages/commons/detail/order/index',
        'pages/commons/detail/orderDetail/index',
        'pages/commons/detail/address/index',
        'pages/commons/detail/evaluation/index',
        'pages/ldmMall/goodsList/index',
        'pages/bargain/index',
        'pages/bargain/detail/index',
        'pages/user/shoppingChart/index'
    ],
    window: {
        backgroundTextStyle: 'light',
        navigationBarBackgroundColor: '#fff',
        navigationBarTitleText: 'WeChat',
        navigationBarTextStyle: 'black',
        navigationStyle: 'default'
    },
    permission: {
        'scope.userLocation': {
            desc: '你的位置信息将用于小程序位置接口的效果展示'
        }
    }
}