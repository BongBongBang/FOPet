import exception from "./exception";

/**
 * 用于普通请求(GET|POST|PUT|DELETE等)
 * @param url
 * @param method
 * @param header
 * @param data
 * @param success
 * @param fail
 * @param complete
 * @param Tools
 * @returns {*|never|Promise<Taro.request.Promised<any>>|Promise<TaroH5.request.Promised>}
 */
function requests({url, method, header, data, success, fail, complete}, Tools) {
  return this.request({
    url,
    method,
    header,
    data,
    success: ({data: responseData, statusCode, header: responseHeader}) => {
      if (exception.apply(Tools, [{
        errMsg: responseData["errmsg"],
        data: {responseData, statusCode, responseHeader},
        request: Tools.request.bind(Tools),
        params: {url, method, header, data, success, fail, complete}
      }])) {
        success(responseData, responseHeader);
      }
    },
    fail(res) {
      fail(res);
    },
    complete(res) {
      complete(res);
    }
  });
}

export default requests;


