import Taro from '@tarojs/taro';
import Tools from '../../../utils/petPlanetTools';
import * as constants from './constants';
import {staticData} from '../../../constants';

/**
 * 获取普通商品详情
 * @returns {*}
 */
function getCommonDetail() {
	const {id = 0} = this.state;
	return Tools.request({
		url: `eshop/goods/common/detail/${id}`,
		success: (data = {}, header = {}) => {
			const {
				images = [],
				skuOptionGroups = [],
				sales = 0,
				goodsName = '',
				goodsDesc = '',
				detailImages = [],
				coverPic = ''
			} = data || {};
			const salePrice = skuOptionGroups[0] ? skuOptionGroups[0]['salePrice'] : {};
			const discPrice = skuOptionGroups[0] ? skuOptionGroups[0]['discPrice'] : {};
			skuOptionGroups.forEach(skuItem => {
				skuItem.checked = false;
			});
			skuOptionGroups[0]['checked'] = true;
			this.setState({
				images,
				salePrice,
				discPrice,
				coverPic,
				sales,
				goodsName,
				goodsDesc,
				detailImages,
				skus: skuOptionGroups,
				skuPrice: skuOptionGroups[0]['discPrice'],
				skuId: skuOptionGroups[0]['skudId'],
				skuStock: skuOptionGroups[0]['stock']
			});
		},
		fail: (res) => {
			this.setState({
				loading: false
			});
		},
		complete: (res) => {

		}
	});
}

/**
 * 获取普通商品的评价列表
 */
function getCommonCommentList() {
	const {id = 0, pageSize = 20} = this.state;
	let {pageNum = 1} = this.state;
	return Tools.request({
		url: 'eshop/comment/list',
		method: 'post',
		data: {
			goodsId: id,
			pageNum,
			pageSize
		},
		success: (data = {}, header = {}) => {
			const {
				data: _data = [],
				total = 0
			} = data;
			this.setState({
				commentsList: [..._data],
				comments: [..._data],
				total,
				pageNum: ++pageNum,
				loading: false
			});
		},
		fail: (res) => {
			this.setState({
				loading: false
			});
		},
		complete: (res) => {
		}
	});
}

/**
 * 获取普通商品评价区域列表
 */
function getCommentList() {
	const {
		id = 0,
		pageSize = 20
	} = this.state;
	let {
		comments = [],
		pageNum = 1
	} = this.state;
	let length = 0;
	return Tools.request({
		url: 'eshop/comment/list',
		method: 'post',
		data: {
			goodsId: id,
			pageNum,
			pageSize
		},
		success: (data = {}, header = {}) => {
			const {
				data: _data = [],
				total = 0
			} = data;
			comments = [...comments, ..._data];
			length = comments.length;
			this.setState({
				comments,
				total,
				pageNum: ++pageNum,
				isShowLoad: length >= total,
				loadStatus: length < total ? staticData.loadStatusConfig.loading : staticData.loadStatusConfig.noMore,
				loading: false
			});
			this.isNext = true;
		},
		fail: (res) => {
			this.setState({
				loading: false
			});
		},
		complete: (res) => {
		}
	});
}

/**
 * 添加购物车
 */
function addShoppingChart() {
	const {
		id = 0,
		skus = [],
		choosedIdx = 0,
		skuCount = 0
	} = this.state;
	const {
		initShoppingChartHandler = () => {
		}
	} = this.props;
	const {
		onDialogChange = () => {
		}
	} = this;
	const sku = skus[choosedIdx];
	return Tools.request({
		url: 'eshop/cart/v1/goods/add',
		method: 'post',
		data: {
			goodsId: Number(id),
			skuId: sku['skuId'],
			num: skuCount
		},
		success: (data = true, header = {}) => {
			if (data) {
				onDialogChange('skuDialog');
				this.setState({
					isToastShow: true
				});
				initShoppingChartHandler();
			}
		},
		fail: (res) => {
		},
		complete: (res) => {
		}
	});
}

/**
 * 判断当前用户是否需要更新信息
 */
function getNeedUpdateUserInfo() {
	return Tools.request({
		url: 'users/needUpdateUserInfo',
		method: 'post',
		header: {
			'content-type': 'application/x-www-form-urlencoded'
		},
		success: (data = {}, header = {}) => {
			return data;
		},
		fail: (res) => {
		},
		complete: (res) => {
		}
	});
}

const commonDetailAPI = {
	getCommonDetail,
	getCommonCommentList,
	getCommentList,
	getNeedUpdateUserInfo,
	addShoppingChart
};

export default commonDetailAPI
