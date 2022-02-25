/**
 * 在新页面中全屏预览图片。预览的过程中用户可以进行保存图片、发送给朋友等操作。
 * @尹文楷
 */
function previewImage ({urls, current, success, fail, complete}) {
  return this.previewImage({
    urls,
    current,
    success: (res) => {
      success(res);
    },
    fail: (res) => {
      fail(res);
    },
    complete: (res) => {
      complete(res);
    }
  });
}

export {
  previewImage
};
