//定义多层处理对象属性值在不按照state模板的情况下,payload添加属性和属性值的情况下使用
//概括起来就是用于添加state属性使用
function compareAdd(state, newState) {
  for (let key of Object.keys(newState)) {
    state[key] = (state[key] === undefined) ? null : state[key];
  }
  return state;
}

export default compareAdd;
