import * as constants from './constants';

const defaultState = {
	//购物车商品列表源数据
	shoppingChartListSource: [],
	//购物车商品列表
	shoppingChartList: [],
	//购物车页码
	pageNum: 1,
	//购物车商品列表里面的所有商品项的总数
	total: 0,
	//购物车商品列表距离顶部的高度
	scrollTop: 0
};

export function shoppingChartStore(state = defaultState, {type, payload}) {
	const {
		shoppingChartConstants = {}
	} = constants;
	switch (type) {
		//获取购物车商品列表
		case shoppingChartConstants['GET_SHOPPING_CHART_LIST']:
			return {
				...state,
				...payload
			};
		//记录离开购物车页面时,购物车商品列表距离顶部的高度
		case shoppingChartConstants['CHANGE_SCROLL_TOP_LEAVE']:
			return {
				...state,
				...payload
			};
		//点击多选时进行的选中或者取消操作
		case shoppingChartConstants['CHANGE_CHART_LIST_CHECKED']:
			return {
				...state,
				...payload
			};
		//处理购物车商品列表里面的一些总体全局数据
		case shoppingChartConstants['CHANGE_SHOPPING_CHART_LIST_ANY_THING']:
			return {
				...state,
				...payload
			};
		//初始化购物车页面
		case shoppingChartConstants['INIT_SHOPPING_CHART_LIST']:
			return defaultState;
	}
	return state;
}