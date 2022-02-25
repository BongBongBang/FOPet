import {
	fromJS,
	is
} from 'immutable';

import {
	getShoppingChartListAction
} from './shoppingChart_action';
import {
	staticData
} from '../../../constants';
import Tools from '../../../utils/petPlanetTools';

/**
 * 获取购物车内的商品列表
 * @returns {*}
 */
function getShoppingChartList() {
	const {
		shoppingChartStore = {}
	} = this.props;
	const {
		shoppingChartListSource = [],
		shoppingChartList = [],
		pageNum = 1
	} = shoppingChartStore || {};
	const {
		onCheckedTotalPrice = () => {
		}
	} = this;
	return (dispatch) => {
		return Tools.request({
			url: 'eshop/cart/v1/list',
			method: 'post',
			header: {
				'content-type': 'application/json'
			},
			data: {
				pageNum,
				pageSize: staticData.pageSize
			},
			success: (data = {}, header = {}) => {
				//购物车商品列表分页总数组
				let _data_total = [];
				const {data: _data = [], total = 0} = data || {};
				const shoppingChartListSource_transform = shoppingChartListSource.slice(0, (pageNum - 1) * staticData.pageSize);
				_data_total = [...shoppingChartListSource_transform, ..._data];
				let length = _data_total.length;
				const _shoppingChartListSource = fromJS(shoppingChartListSource),
					data_transform = fromJS(_data_total);
				if (shoppingChartListSource.length <= 0) {
					shoppingChartListOperationGuide.call(this, dispatch, _data_total, total);
				} else {
					if (!is(_shoppingChartListSource, data_transform)) {
						shoppingChartListOperationProcess.call(this, dispatch, _data_total, shoppingChartList, total);
					} else {
						onCheckedTotalPrice(shoppingChartList);
					}
				}
				this.setState({
					isShowLoad: length >= total,
					loadStatus: length < total ? staticData.loadStatusConfig.loading : staticData.loadStatusConfig.noMore,
					loading: false
				});
				this.isNext = true;
			},
			fail: (res = {}) => {
				this.setState({
					loading: false
				});
				this.isNext = true;
			},
			complete: (res = {}) => {

			}
		});
	};
}

/**
 * 对于购物车内的商品列表的操作处理
 */
function shoppingChartListOperationGuide(dispatch, data = [], total = 0) {
	const data_transform = data.map((dataItem = {}) => {
		return {
			...dataItem,
			checked: false,
			forSure: true
		};
	});
	this.setState({
		allChecked: false,
		totalPrice: 0
	});
	dispatch(getShoppingChartListAction({
		shoppingChartList: data_transform,
		shoppingChartListSource: data,
		total
	}));
}

/**
 * 删除时处理购物车内的商品列表状态不变操作
 */
function shoppingChartListOperationProcess(dispatch, data = [], shoppingChartList = [], total = 0) {
	const {
		onCheckedTotalPrice = () => {
		}
	} = this;
	for (let value of shoppingChartList) {
		for (let [dataKey, dataValue] of data.entries()) {
			if (dataValue['skuId'] === value['skuId']) {
				data[dataKey] = {
					...dataValue,
					...value
				};
			}
		}
	}
	onCheckedTotalPrice(data);
	dispatch(getShoppingChartListAction({
		shoppingChartList: data,
		shoppingChartListSource: data,
		total
	}));
}

/**
 * 添加购物车商品
 */
function addShoppingChart(shoppingChartItem = {}, num = 1, sourceNum = 1) {
	const {
		onCheckedTotalPrice = () => {
		}
	} = this;
	const {
		shoppingChartStore = {},
		changeChartListCheckedHandler = () => {
		}
	} = this.props;
	const {
		shoppingChartList = []
	} = shoppingChartStore || {};
	return Tools.request({
		url: 'eshop/cart/v1/goods/add',
		method: 'post',
		data: {
			goodsId: shoppingChartItem['goodsId'],
			skuId: shoppingChartItem['skuId'],
			num
		},
		success: (data = true, header = {}) => {
			if (!data) {
				shoppingChartItem['num'] = sourceNum;
				const _item_index = shoppingChartList.findIndex((listItem = {}) => {
					return listItem['skuId'] === shoppingChartItem['skuId'];
				});
				shoppingChartList.splice(_item_index, 1, shoppingChartItem);
				changeChartListCheckedHandler({
					shoppingChartList: [...shoppingChartList]
				});
				onCheckedTotalPrice(shoppingChartList);
			}
		},
		fail: (res) => {
		},
		complete: (res) => {
		}
	});
}

/**
 * 删除购物车商品列表里面的某一个商品项
 */
function deleteShoppingChart(shoppingChartItem = {}) {
	const {
		getShoppingChartListHandler = () => {
		}
	} = this.props;
	return Tools.request({
		url: 'eshop/cart/v1/goods/delete',
		method: 'post',
		data: {
			goodsId: shoppingChartItem['goodsId'],
			skuId: shoppingChartItem['skuId'],
			num: shoppingChartItem['num']
		},
		success: (data = true, header = {}) => {
			if (data) {
				this.setState({
					deleteShoppingChart: false,
					isDeleteShoppingChartToast: true
				});
				getShoppingChartListHandler.call(this);
			}
		},
		fail: (res) => {
		},
		complete: (res) => {
		}
	});
}

export {
	getShoppingChartList,
	addShoppingChart,
	deleteShoppingChart
};