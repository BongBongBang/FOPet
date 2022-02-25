/**
 * 获取搜索商品列表配置
 * @type {{}}
 */
const searchType = 3;

/**
 * 获取切换tab商品列表配置
 * @type {{"0": number, "1": number, "2": number, "3": number}}
 */
const searchTabTypeConfig = {
	0: 1,
	1: 2,
	2: 1,
	3: 1
};

/**
 * 默认的一些静态数据
 * @type {{pageSize: number}}
 */
const staticData = {
	pageSize: 20
};

/**
 * 底部tabBar标识
 * @type {string}
 */
const symbol = 'mall';

export {
	searchType,
	searchTabTypeConfig,
	symbol,
	staticData
};
