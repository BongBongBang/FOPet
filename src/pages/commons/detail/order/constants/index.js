/**
 * 我的收货地址列表空配置
 * @type {{text: string}}
 */
const emptyAddressList = {
  text: '点击新增地址'
};

/**
 * 校验提交的订单
 * @type {{isEmpty: [string]}}
 */
const verify = {
  isEmpty: [
    'warning:请选择收获地址',
    'warning:请添加商品',
    'warning:商品列表中存在境外商品,需要在备注处填写身份证号码'
  ]
};

/**
 * 微信权限标识
 * @type {{}}
 */
const scope = {
  address: 'scope.address'
};

//下单页输入以及标签提示语
const order = {
  placeholder: {
    remark: '选填,请先和商家协商一致',
    IDCardRemark: '必填,此商品必须填写身份证号'
  }
};

//身份证号的属性Id
//todo
const IDCardId = 11;

export {
  emptyAddressList,
  scope,
  order,
  verify,
  IDCardId
}
