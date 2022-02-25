//action type协定
const shoppingChartConstants = {
	//获取购物车列表
	GET_SHOPPING_CHART_LIST: 'GET_SHOPPING_CHART_LIST',
	//记录离开购物车页面时,购物车商品列表距离顶部的高度
	CHANGE_SCROLL_TOP_LEAVE: 'CHANGE_SCROLL_TOP_LEAVE',
	//点击多选时进行的选中或者取消操作
	CHANGE_CHART_LIST_CHECKED: 'CHANGE_CHART_LIST_CHECKED',
	//初始化购物车页面
	INIT_SHOPPING_CHART_LIST: 'INIT_SHOPPING_CHART_LIST',
	//处理购物车商品列表里面的一些总体全局数据
	CHANGE_SHOPPING_CHART_LIST_ANY_THING: 'CHANGE_SHOPPING_CHART_LIST_ANY_THING'
};

//模态框标题、内容以及按钮文案
const modal = {
	refuse: {
		title: '温馨提示',
		content: '确认将这1个好物删除？',
		cancelText: '我再想想',
		confirmText: '确定'
	}
};

/**
 * 提示的内容
 * @type {{}}
 */
const toast = {
	deleteShoppingChart: {
		success: '已从购物车中删除此好物~'
	}
};

export {
	shoppingChartConstants,
	modal,
	toast
};