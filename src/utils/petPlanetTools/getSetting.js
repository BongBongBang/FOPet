/**
 * 用于获取用户授权设置
 * @param success
 * @param fail
 * @param complete
 * @returns {Promise<Taro.getSetting.Promised> | * | never}
 */
function getSetting({success, fail, complete}) {
  return this.getSetting({
    success({authSetting}) {
      success(authSetting);
    },
    fail(res) {
      fail(res);
    },
    complete(res) {
      complete(res);
    }
  });
}

/**
 * 调起客户端小程序设置界面，返回用户设置的操作结果
 * @param success
 * @param fail
 * @param complete
 * @returns {Promise<Taro.getSetting.Promised> | * | never}
 */
function openSetting({success, fail, complete}) {
  return this.openSetting({
    success({authSetting}) {
      success(authSetting);
    },
    fail(res) {
      fail(res);
    },
    complete(res) {
      complete(res);
    }
  });
}

/**
 * 用于向用户发起授权请求
 * @param scope
 * @param success
 * @param fail
 * @param complete
 */
function authorize({scope, success, fail, complete}) {
  return this.authorize({
    scope,
    success() {
      success();
    },
    fail(res) {
      fail(res);
    },
    complete(res) {
      complete(res);
    }
  });
}

/**
 * 用于获取用户位置信息
 * @param success
 * @param fail
 * @param complete
 * @returns {Promise<TaroH5.chooseLocation.Promised> | * | never}
 */
function chooseLocation({success, fail, complete}) {
  return this.chooseLocation({
    success({name, address}) {
      success(name, address);
    },
    fail(res) {
      fail(res);
    },
    complete(res) {
      complete(res);
    }
  });
}

module.exports = {
  getSetting,
  openSetting,
  authorize,
  chooseLocation
};
