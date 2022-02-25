/**
 * 筛选条件配置
 * @尹文楷
 * @type {*[]}
 */
const preparationNav = [{
  key: 0,
  value: '全部'
}, {
  key: 2,
  value: '待送出'
}, {
  key: 3,
  value: '待确认'
}, {
  key: 5,
  value: '待评价'
}, {
  key: 7,
  value: '已完成'
}];

/**
 * 订单状态
 * @type {{}}
 */
const orderStatus = {
  confirm: 3,
  complete: 7
};

/**
 * 加载状态
 * @type {{noMore: string, loading: string}}
 */
const loadStatus = {
  noMore: 'noMore',
  loading: 'loading'
};

export {
  loadStatus,
  orderStatus,
  preparationNav
};
