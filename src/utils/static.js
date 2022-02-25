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
const petPlanetPrefix = "https://api.csg.1jtec.club";
// const petPlanetPrefix = "http://localhost:8291";

/**
 * 铲屎官小程序版本号
 * @type {string}
 */
const petPlanet_version = "2.2.1";
/**
 * TabBar标签页路由标题、图标以及角标配置
 * @尹文楷
 * @type {*[]}
 */
const tabBarTabList = [{
  id: "HOME",
  name: "home",
  dot: false,
  title: "主子",
  iconPrefixClass: "iconfont",
  iconType: "petPlanet-planet",
  selectedIconType: "petPlanet-planet-selected"
}, {
  id: "CONSULT",
  name: "consult",
  dot: false,
  title: "问诊",
  iconPrefixClass: "iconfont",
  iconType: "petPlanet-medicalAdvice",
  selectedIconType: "petPlanet-medicalAdvice-selected"
}, {
  id: "TOPIC",
  name: "topics",
  dot: false,
  title: "发现",
  iconPrefixClass: "iconfont",
  iconType: "petPlanet-topic",
  selectedIconType: "petPlanet-topic-selected"
}, {
  id: "COMMUNICATION",
  name: "communication",
  dot: false,
  title: "会话",
  iconPrefixClass: "iconfont",
  iconType: "petPlanet-message",
  selectedIconType: "petPlanet-message-selected"
}, {
  id: "ME",
  name: "me",
  dot: false,
  title: "我",
  iconPrefixClass: "iconfont",
  iconType: "petPlanet-me",
  selectedIconType: "petPlanet-me-selected"
}];

/**
 * 咨询会话列表问题状态
 * @type {{}}
 */
const cnsltState = {
  DISPATCHED: {
    txt: "已分配",
    className: "pet-message-consultationsItem-info-tag-dispatched"
  },
  RESPONSED: {
    txt: "已回应",
    className: "pet-message-consultationsItem-info-tag-responsed"
  }
};

/**
 * TabBar标签页路由路径
 * @尹文楷
 * @type {string[]}
 */
const pageCurrentList = [
  // "/pages/topics/index",
  "/pages/index/index",
  "/pages/medicalAdvice/index",
  "/pages/message/index",
  "/pages/user/index",
  "/pages/detail/index",
  "/pages/shareDetail/index",
  "/pages/publish/index",
  "/pages/collection/index",
  "/pages/publishMine/index",
  "/pages/attendance/index",
  "/pages/communications/index",
  "/pages/medicalConsult/index",
  "/pages/medicalDoctor/index",
  "/pages/resultPage/index",
  "/pages/selfObd/index",
  "/pages/disease/index",
  "/pages/diseaseDetail/index"
];

/**
 * 筛选条件配置
 * @尹文楷
 * @type {*[]}
 */
const preparationNav = [{
  key: "RECOMMEND",
  value: "推荐"
}, {
  key: "AROUND",
  value: "附近"
}, {
  key: "ADOPTED",
  value: "领养"
}];

const staticConfig = {
  petPlanetPrefix,
  tabBarTabList,
  pageCurrentList,
  staticData,
  petPlanet_version,
  cnsltState,
  preparationNav
};

module.exports = staticConfig;
