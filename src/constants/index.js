import Taro from '@tarojs/taro';
import {imgs} from '../assets';

//loading加载标语
const loading = {
	progress: {
		text: '铲屎官玩儿命加载中...'
	},
	pay: {
		text: '铲屎官正在支付中......'
	},
	fostered: {
		text: '铲屎官正在处理中......'
	},
	upload: {
		text: '铲屎官图片上传中......'
	},
	redPacket: {
		text: '铲屎官拆封红包中......'
	},
	sign: {
		text: '铲屎官打卡中......'
	}
};

/**
 * 文档类型
 * @type {{xWWWUrlEncoded: string}}
 */
const contentType = {
	xWWWUrlEncoded: 'x-www-form-urlencoded'
};

/**
 * 默认的一些静态数据
 * @type {{}}
 */
const staticData = {
	pageSize: 10,
	loadStatusConfig: {
		more: 'more',
		loading: 'loading',
		noMore: 'noMore'
	}
};

/**
 * 可配置的协议域名和端口号
 * @type {string}
 */
// const petPlanetPrefix = 'https://api.csg.1jtec.club';
const petPlanetPrefix = 'https://pet.api.1jtec.com';
// const petPlanetPrefix = 'http://localhost:8291';

/**
 * 铲屎官小程序版本号
 * @type {string}
 */
const petPlanet_version = '4.3';

/**
 * TabBar标签页路由标题、图标以及角标配置
 * @尹文楷
 * @type {*[]}
 */
const tabBarTabList = [{
	id: 'TOPIC',
	name: 'topics',
	dot: false,
	title: '发现',
	image: imgs.topic,
	selectedImage: imgs.topic_select
}, {
	id: 'HOME',
	name: 'home',
	dot: false,
	title: '主子',
	image: imgs.master,
	selectedImage: imgs.master_select
}, {
	id: 'MALL',
	name: 'mall',
	dot: false,
	title: '好物',
	image: imgs.mall,
	selectedImage: imgs.mall_select
}, {
	id: 'CONSULT',
	name: 'consult',
	dot: false,
	title: '问诊',
	image: imgs.medicalAdvice,
	selectedImage: imgs.medicalAdvice_select
}, {
	id: 'ME',
	name: 'me',
	dot: false,
	title: '我',
	image: imgs.me,
	selectedImage: imgs.me_select
}];

/**
 * 各种状态
 * @type {{isSendOut: string, isConfirm: string}}
 */
const status = {
	//是否是待付款状态
	pendingPayment: '待付款',
	//是否是待送出状态
	isSendOut: '待送出',
	//是否是待确认状态
	isConfirm: '待确认',
	//是否是待评价状态
	isEvaluation: '待评价',
	//是否是已关闭状态
	isClose: '已关闭',
	//待付款状态,支付时间,尚未付款
	noPayment: '尚未付款',
	//待付款状态的提示语
	pendingPaymentDesc: '订单即将关闭，建议尽快付款'
};

/**
 * TabBar标签页路由路径
 * @尹文楷
 * @type {string[]}
 */
const pageCurrentList = [
	'/pages/topics/index', //社区发现列表
	'/pages/index/index', //主子领养列表
	'/pages/ldmMall/index', //商城页面
	'/pages/medicalAdvice/index', //医疗咨询主页
	'/pages/user/index', //我
	'/pages/user/message/index', //我 -> 会话记录列表
	'/pages/index/detail/index', //主子领养 -> 主子领养列表项详情
	'/pages/index/publish/index', //主子领养 -> 主子领养发布
	'/pages/user/collection/index', //我 -> 我的收藏
	'/pages/user/publishMine/index', //我 -> 我的发布
	'/pages/attendance/index', //签到打卡
	'/pages/user/message/communications/index', //我 -> 会话记录列表 -> 对话记录
	'/pages/medicalAdvice/medicalConsult/index', //医疗咨询 -> 图文发布医疗咨询
	'/pages/medicalAdvice/medicalDoctor/index', //医疗咨询 -> 图文发布医疗咨询 -> 选择宠物医生
	'/pages/commons/resultPage/index', //医疗咨询 -> 图文发布医疗咨询 -> 选择宠物医生 -> 医疗咨询选择结果
	'/pages/medicalAdvice/selfObd/index', //医疗咨询 -> 器官症状
	'/pages/medicalAdvice/selfObd/disease/index', //医疗咨询 -> 器官症状 -> 具体病症
	'/pages/medicalAdvice/selfObd/disease/diseaseDetail/index', //医疗咨询 -> 器官症状 -> 具体病症 -> 病症详情、症状和建议
	'/pages/topics/flowPublish/flowTopics/index', //社区发现 -> 动态发布 -> 选择主题
	'/pages/topics/topicsDetail/index', //社区发现 -> 社区发现列表项详情
	'/pages/commons/scope/index', //公共 -> 微信登录授权
	'/pages/topics/topicsDetail/flowComment/index', //社区发现 -> 社区发现列表项详情 -> 回复列表
	'/pages/topics/flowPublish/index', //社区发现 -> 动态发布
	'/pages/topics/findTopics/index', //社区发现 -> 主题社区发现列表
	'/pages/user/foster/index', //我 -> 家庭寄养
	'/pages/user/foster/fosterDetail/index', //我 -> 家庭寄养 -> 家庭寄养详情
	'/pages/user/foster/fosterDetail/placeOrder/index', //我 -> 家庭寄养 -> 家庭寄养详情 -> 家庭寄养下单
	'/pages/user/foster/fosterDetail/agreement/index', //我 -> 家庭寄养 -> 家庭寄养详情 -> 家庭寄养下单 -> 家庭寄养协议
	'/pages/user/foster/fosterDetail/placeOrderDetail/index', //我 -> 家庭寄养 -> 家庭寄养详情 -> 家庭寄养下单 -> 家庭寄养订单详情
	'/pages/user/orderList/index', //我 -> 订单列表
	'/pages/commons/redPacket/index', //公共 -> 红包页
	'/pages/commons/detail/index', //公共 -> 普通商品
	'/pages/user/message/communications/communicationsGoodsList/index', //我 -> 会话记录列表 -> 对话记录 -> 选择普通商品列表
	'/pages/commons/detail/order/index', //公共 -> 普通商品 -> 普通商品下单页
	'/pages/commons/detail/orderDetail/index', //公共 -> 普通商品 -> 普通商品下单页 -> 普通商品订单详情
	'/pages/commons/detail/address/index', //公共 -> 普通商品 -> 收货地址列表
	'/pages/commons/detail/evaluation/index', //公共 -> 普通商品 -> 评价
	'/pages/ldmMall/goodsList/index', //商城 -> 商城列表
	'/pages/bargain/index',           //商城 -> 砍价 -> 砍价列表
	'/pages/bargain/detail/index',    //商城 -> 砍价 -> 砍价列表 -> 砍价详情
	'/pages/user/shoppingChart/index'
];

/**
 * 广告位通过后台配置,进行跳转的策略执行方法
 */
const linkTypeHandler = {
	'H5': (link) => {

	},
	'TINY': (link) => {
		Taro.navigateTo({
			url: link
		});
	}
};

/**
 * 订单类型
 * @type {{'1': string, '2': string}}
 */
const orderTypeConfig = {
	1: {
		name: '家庭寄养',
		isFoster: true,
		url: (fn = () => {
		}) => {
			return fn(28);
		}
	},
	2: {
		name: '普通商品',
		isCommons: true,
		url: (fn = () => {
		}) => {
			return fn(34);
		},
		getOrderEvaluation(fn = ({common = []}) => {
		}) {
			const {order: {common = []}} = this.state;
			return fn({common});
		}
	},
	3: {
		name: '医疗咨询',
		isMedical: true,
		url: (fn = () => {
		}) => {
			return fn(34);
		},
		getOrderEvaluation(fn = ({common = {}}) => {
		}) {
			const {order: {common = []}} = this.state;
			return fn({common});
		}
	},
	4: {
		name: '砍价商品',
		isCommons: true,
		url: (fn = () => {
		}) => {
			return fn(34);
		},
		getOrderEvaluation(fn = ({common = []}) => {
		}) {
			const {order: {common = []}} = this.state;
			return fn({common});
		}
	}
};

/**
 * 咨询结果页配置
 * @type {{}}
 */
const consultConfig = {
	content: '点击直接跳转会话页',
	title: '咨询结果',
	name: '会话页',
	url: pageCurrentList[5]
};

/**
 * 点评结果页
 * @type {{}}
 */
const evaluationResultConfig = {
	content: '点击直接跳转商品详情页',
	title: '自评结果',
	name: '商品详情页',
	url: pageCurrentList[31]
};

/**
 * 描述获取用户个人信息的目的
 * @type {string}
 */
const needUserInfoDesc = '信息用于提供基础服务并完全保密';

const staticConfig = {
	loadingStatus: loading,
	contentType,
	status,
	petPlanetPrefix,
	tabBarTabList,
	pageCurrentList,
	staticData,
	petPlanet_version,
	linkTypeHandler,
	orderTypeConfig,
	consultConfig,
	evaluationResultConfig,
	needUserInfoDesc
};

module.exports = staticConfig;
