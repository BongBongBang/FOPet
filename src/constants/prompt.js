/**
 * 静态提示语
 * @尹文楷
 * @type {{}}
 */
const prompt = {
  //用于小程序获取位置权限时展示的接口用途说明
  scopeUserLocation: {
    desc: "你的位置信息将用于小程序位置接口的效果展示"
  },
  verify: {
    publish_page: {
      isEmpty: [
        "warning:宠物描述不能为空",
        "warning:图片组不能为空",
        "warning:必须获取定位",
        "warning:标题不能为空",
        "warning:价格不能为空",
        "warning:模板消息id不能为空",
        "warning:联系方式不能为空"
      ]
    }
  },
  navigationBarTitleText: {
    home_page: {
      initial: "主子",
      publish: ""
    },
    user_page: {
      initial: "我"
    }
  },
  publish: {
    publish_page: {
      title: "发布",
      placeholder: {
        content: "描述一下宝贝转手的原因、入手渠道和使用感受",
        title: "请输入标题",
        cost: "请输入交易宠物的价格",
        contactInfo: "请输入您的联系方式"
      },
      label: {
        title: "标题",
        cost: "一口价",
        contactInfo: "联系方式"
      }
    }
  },
  modal: {
    publish_page: {
      publish: {
        title: "温馨提示",
        content: "检测到您没打定位权限，是否去设置打开？"
      }
    }
  },
  collection: {
    collected: {
      text:"已收藏",
      type: "primary"
    },
    noCollected: {
      text: "收藏",
      type: "secondary"
    }
  }
};

export default prompt;
