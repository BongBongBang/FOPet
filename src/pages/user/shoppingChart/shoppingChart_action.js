import * as constants from './constants';

/**
 * 获取购物车商品列表
 * @param payload
 * @returns {{payload, type: {GET_SHOPPING_CHART_LIST: string}}}
 */
export function getShoppingChartListAction(payload) {
	const {
		shoppingChartConstants = {}
	} = constants;
	return {
		type: shoppingChartConstants['GET_SHOPPING_CHART_LIST'],
		payload
	};
}

/**
 * 记录离开购物车页面时,购物车商品列表距离顶部的高度
 * @param payload
 * @returns {{payload, type: {GET_SHOPPING_CHART_LIST: string}}}
 */
export function changeScrollTopLeave(payload) {
	const {
		shoppingChartConstants = {}
	} = constants;
	return {
		type: shoppingChartConstants['CHANGE_SCROLL_TOP_LEAVE'],
		payload
	};
}

/**
 * 点击多选时进行的选中或者取消操作
 * @param payload
 * @returns {{payload, type: {GET_SHOPPING_CHART_LIST: string}}}
 */
export function changeChartListChecked(payload) {
	const {
		shoppingChartConstants = {}
	} = constants;
	return {
		type: shoppingChartConstants['CHANGE_CHART_LIST_CHECKED'],
		payload
	};
}

/**
 * 初始化购物车页面
 * @returns {{payload, type}}
 */
export function initShoppingChart() {
	const {
		shoppingChartConstants = {}
	} = constants;
	return {
		type: shoppingChartConstants['INIT_SHOPPING_CHART_LIST']
	};
}

/**
 * 处理购物车商品列表里面的一些总体全局数据
 * @returns {{payload, type}}
 */
export function changeShoppingChartListAnyThing(payload) {
	const {
		shoppingChartConstants = {}
	} = constants;
	return {
		type: shoppingChartConstants['CHANGE_SHOPPING_CHART_LIST_ANY_THING'],
		payload
	};
}