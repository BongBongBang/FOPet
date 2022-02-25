//分享小程序卡片时的标题
const shareDetail = {
  title: '逼疯的铲屎官 - 砍价商品详情'
};

//底部弹窗配置
const floatLayout = {
  delivery: {
    title: '发货说明'
  },
  requestSubscribeMessage: {
    title: '温馨提示',
    content: '订阅后,砍价成功会及时通知到您! 点击\'进行订阅\',进行订阅哦~',
    status: {
      accept: 'accept',
      reject: 'reject'
    }
  }
};

/**
 * 顶部tab配置
 * @type {({title: string}|{title: string})[]}
 */
const tabsConfig = [{
  title: '详情'
}, {
  title: '评价'
}];

/**
 * 服务说明
 * @type {string[]}
 */
const rulesConfig = [{
  text: '发起砍价',
  icon: 'petPlanet-cutSale'
}, {
  text: '邀请好友',
  icon: 'petPlanet-friends'
}, {
  text: '助力省钱',
  icon: 'petPlanet-saveMoney',
  isSaveMoney: true,
  className: 'bargainDetail-goods-service-content-item-icon-noBorder'
}, {
  text: '支付余额',
  icon: 'petPlanet-rmb'
}];

//校验语
const verify = {
  isEmpty: [
    'warning:您要购买的砍价商品已售罄,请静待上架或者另择优品'
  ]
};

//提示语配置
const modal = {
  isCutSaleSuccess: {
    FOUNDER: {
      title: '发起砍价成功,为自己砍掉',
      confirmText: '邀请好友助力砍价',
      cancelText: '下次吧'
    },
    HELPER: {
      title: '助力砍价成功,为好友砍掉',
      confirmText: '邀请好友继续砍价',
      cancelText: '下次吧'
    }
  }
};

//发货说明
const shipConfig = [{
  title: '7天无理由退货',
  content: '满足相应条件时，消费者可申请7天无理由退货。'
}, {
  title: '假一赔十',
  content: '若收到商品假冒品牌，可获得10倍现金券赔偿。'
}, {
  title: '全国联保',
  content: '品牌方售后电话保修，直达品牌售后。'
}];

/**
 * 砍价按钮文案
 * @type {{HELPER: string, FOUNDER: string}}
 */
const caseStateID = {
  FOUNDER: '发起砍价',
  HELPER: '助力砍价'
};

/**
 * 砍价后按钮文案
 * @type {{HELPER: string, FOUNDER: string}}
 */
const caseStatedID = {
  FOUNDER: '邀请砍价',
  HELPER: '已助力砍价'
};

/**
 * 砍价后按钮文案
 * @type {{HELPER: string, FOUNDER: string}}
 */
const caseStateMethod = {
  FOUNDER: '分享',
  HELPER: '我也要玩'
};

/**
 * 需要订阅的消息模板的id的集合，一次调用最多可订阅3条消息
 * @type {*[]}
 */
const tmplIds = [
  'wzydwA-6l4ILMEO8ZNwW_pS8mUIc9jNR8xAFuUVcWO4'
];

/**
 * 订阅砍价的消息模板的id的集合，一次调用最多可订阅3条消息
 * @type {string[]}
 */
const bargainTmplIds = [
  '-j2OQ4Wun3ZtakbfPM8Rvop9soHbovQnV2W66CgnRfE'
];

/**
 * 订阅砍价的消息模板的id的集合，一次调用最多可订阅3条消息
 * @type {{response: string}}
 */
const bargainServiceTmplIds = {
  response: '-j2OQ4Wun3ZtakbfPM8Rvop9soHbovQnV2W66CgnRfE'
};

/**
 * 需要订阅的消息模板的id的集合，一次调用最多可订阅3条消息
 * @type {{response: string}}
 */
const medicalAdviceTmplIds = {
  response: 'wzydwA-6l4ILMEO8ZNwW_pS8mUIc9jNR8xAFuUVcWO4'
};


export {
  verify,
  tabsConfig,
  shareDetail,
  floatLayout,
  shipConfig,
  rulesConfig,
  modal,
  caseStateID,
  caseStatedID,
  caseStateMethod,
  tmplIds,
  medicalAdviceTmplIds,
  bargainTmplIds,
  bargainServiceTmplIds
}
