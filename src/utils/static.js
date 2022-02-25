/**
 * 默认的一些静态数据
 * @type {{}}
 */
const staticData  = {
  pageSize: 10,
  loadStatusConfig: {
    more: "more",
    loading: "loading",
    noMore: "noMore"
  }
};
/**
 * 可配置的协议域名和端口号
 * @type {string}
 */
const petPlanetPrefix = "http://47.104.74.127:8291";
/**
 * TabBar标签页路由标题、图标以及角标配置
 * @尹文楷
 * @type {*[]}
 */
const tabBarTabList = [{
  title: "首页",
  iconPrefixClass: "iconfont",
  iconType: "petPlanet-planet"
}, {
  title: "我",
  iconPrefixClass: "iconfont",
  iconType: "petPlanet-me"
}];

/**
 * TabBar标签页路由路径
 * @尹文楷
 * @type {string[]}
 */
const pageCurrentList = [
  "/pages/index/index",
  "/pages/user/index"
];

const staticConfig = {
  petPlanetPrefix,
  tabBarTabList,
  pageCurrentList,
  staticData
};

module.exports = staticConfig;
