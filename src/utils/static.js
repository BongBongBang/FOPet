/**
 * 默认的一些静态数据
 * @type {{}}
 */
const staticData = {
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
const petPlanetPrefix = "https://fic.1jtec.com/pet";
/**
 * 铲屎官小程序版本号
 * @type {string}
 */
const petPlanet_version = "1.2.0";
/**
 * TabBar标签页路由标题、图标以及角标配置
 * @尹文楷
 * @type {*[]}
 */
const tabBarTabList = [{
  title: "主子",
  iconPrefixClass: "iconfont",
  iconType: "petPlanet-planet",
  selectedIconType: "petPlanet-planet-selected"
}, {
  title: "我",
  iconPrefixClass: "iconfont",
  iconType: "petPlanet-me",
  selectedIconType: "petPlanet-me-selected"
}];

/**
 * TabBar标签页路由路径
 * @尹文楷
 * @type {string[]}
 */
const pageCurrentList = [
  "/pages/index/index",
  "/pages/user/index",
  "/pages/detail/index",
  "/pages/shareDetail/index",
  "/pages/publish/index",
  "/pages/collection/index",
  "/pages/publishMine/index"
];

const staticConfig = {
  petPlanetPrefix,
  tabBarTabList,
  pageCurrentList,
  staticData,
  petPlanet_version
};

module.exports = staticConfig;
