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
        contactInfo: "联系方式",
        adoption: "标签#"
      },
      content: {
        adoption: "领养"
      }
    }
  },
  modal: {
    index_page: {
      update: {
        title: "铲屎官 - 更新提示",
        content: "铲屎官新的版本已经下载好,是否重启应用?",
      }
    },
    publish_page: {
      publish: {
        title: "温馨提示",
        content: "检测到您没打开定位权限，是否去设置打开？"
      }
    },
    attendance_page: {
      noShareTicket: {
        title: "温馨提示",
        content: "检测到您没通过转发入口进入签到页面,请重试!"
      },
      isSigned: {
        title: "温馨提示",
        confirmText: "确定"
      }
    }
  },
  emptyList: {
    attendance_page: {
      content: "暂无动态~"
    }
  },
  swiperAction: {
    message_page: {
      content: "删除"
    }
  },
  collection: {
    collected: {
      text: "已收藏",
      toast: "收藏成功",
      type: "primary"
    },
    noCollected: {
      text: "收藏",
      toast: "取消收藏",
      type: "secondary"
    }
  },
  detail: {
    loading: {
      text: "铲屎官玩儿命加载中..."
    }
  },
  attendance: {
    permission: {
      alert: "您暂未获取微信授权,将无法正常使用群内的功能~如需正常使用,请点击\"授权登录\"按钮,打开头像、昵称等信息的授权。"
    },
    loading: {
      text: "喵星人玩儿命加载中..."
    }
  }
};

export default prompt;
