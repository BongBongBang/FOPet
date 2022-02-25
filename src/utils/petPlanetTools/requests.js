/**
 * 用于普通请求(GET|POST|PUT|DELETE等)
 * @param url
 * @param method
 * @param header
 * @param data
 * @param success
 * @param fail
 * @param complete
 * @returns {*|never|Promise<Taro.request.Promised<any>>|Promise<TaroH5.request.Promised>}
 */
function requests({url, method, header, data, success, fail, complete}) {
  return this.request({
    url,
    method,
    header,
    data,
    success({data: responseData, statusCode, header: responseHeader}) {
      success(responseData, statusCode, responseHeader);
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


