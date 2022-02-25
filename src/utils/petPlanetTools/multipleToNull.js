//定义多层处理对象属性值为null的函数
//在设置为父级底下多层属性值为null的情况下使用
function multipleToNull(state) {
  if (Object.prototype.toString.call(state) === "[object Object]") {
    for (let [key, value] of Object.entries(state)) {
      state[key] = multipleToNull(state[key]);
    }
  } else {
    state = null;
  }
  return state;
}

export default multipleToNull;
