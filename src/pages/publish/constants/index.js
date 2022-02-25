const loading = {
  content: '图片上传中'
};

const verify = {
  isEmpty: [
    "warning:宠物描述不能为空",
    "warning:图片组不能为空",
    "warning:必须获取定位",
    "warning:标题不能为空",
    "warning:价格不能为空",
    "warning:联系方式不能为空"
  ]
};

const publish = {
  title: "发布",
  placeholder: {
    content: "描述一下宝贝转手的原因、入手渠道和使用感受",
    title: "请输入标题",
    cost: "请输入交易宠物的价格",
    contactInfo: "请输入您的联系方式"
  },
  label: {
    cost: "价格",
    contactInfo: "联系方式",
    adoption: "标签选择"
  },
  content: {
    adoption: "领养"
  }
};

const modal = {
  refuse: {
    title: "温馨提示",
    content: "检测到您没打开定位权限，是否去设置打开？",
    cancelText: "取消",
    confirmText: "确定"
  },
  review: {
    title: "正在审核中...",
    confirmText: "我知道了",
    content: "您发布的内容,审核通过后会自动发布~"
  }
};

/**
 * 上传图片的类型
 * @type {string}
 */
const uploadPrefix = 'NORMAL';

export {
  loading,
  verify,
  publish,
  modal,
  uploadPrefix
};
