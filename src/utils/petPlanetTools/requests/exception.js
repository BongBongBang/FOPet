import Taro from "@tarojs/taro";

/**
 * 异常处理方法函数
 * @尹文楷
 */
function exception({errMsg, data: {statusCode}, request, params}) {
  switch (statusCode) {
    case 401:
      this.loginSession(request, params);
      return false;
    case 500:
      Taro.showModal({
        title: `${statusCode}`,
        content: errMsg,
        showCancel: false,
        confirmColor: "#5c89e4",
        success: () => {

        }
      });
      return false;
  }
  return true;
}

export default exception;
