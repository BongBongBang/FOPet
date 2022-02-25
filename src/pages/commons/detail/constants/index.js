//分享小程序卡片时的标题
const shareDetail = {
  title: '逼疯的铲屎官 - 商品详情'
};

//底部弹窗配置
const floatLayout = {
  delivery: {
    title: '发货说明'
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
const rulesConfig = [
  '优质宠品',
  '极速发货',
  '7天退换'
];

//校验语
const verify = {
  isEmpty: [
    'warning:请选择有效的商品数量',
    'warning:您要购买的商品已售罄,请静待上架或者另择优品'
  ]
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

export {
  verify,
  tabsConfig,
  shareDetail,
  floatLayout,
  shipConfig,
  rulesConfig
}
