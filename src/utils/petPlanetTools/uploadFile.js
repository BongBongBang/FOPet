/**
 * 用于上传文件
 * @param url
 * @param filePath
 * @param name
 * @param headers
 * @param formData
 * @param success
 * @param fail
 * @param complete
 * @returns {*|TaroH5.uploadFile.UploadTask|never}
 */
function uploadFile({url, filePath, name, headers, formData, success, fail, complete}) {
  return this.uploadFile({
    url,
    filePath,
    name,
    headers,
    formData,
    success({data, statusCode}) {
      success(data);
    },
    fail(res) {
      fail(res);
    },
    complete(res) {
      complete(res);
    }
  });
}

export default uploadFile;
