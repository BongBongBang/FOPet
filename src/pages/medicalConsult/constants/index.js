const verify = {
  isEmpty: {
    type: "isEmpty",
    errMsg: "warning:宠物问诊问题描述不能为空"
  },
  isSelect: {
    type: "isSelect:checked",
    errMsg: [
      "warning:宠物问诊问题类型要选中一种哦~"
    ]
  }
};

/**
 * 上传图片的类型
 * @type {string}
 */
const uploadPrefix = 'MEDICAL_CONSULT';

const loading = {
  content: "图片上传中..."
};

const consult = {
  textarea: {
    placeholder: "请简要描述您的问题，限10-150字之间"
  }
};

const staticState = {
  moveCount: 9
};

export {
  verify,
  loading,
  consult,
  staticState,
  uploadPrefix
};
