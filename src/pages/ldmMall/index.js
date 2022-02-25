import Taro, {Component} from '@tarojs/taro';
import {
	Block,
	View,
	Image
} from '@tarojs/components';
import {
	LdmTabBar
} from 'ldm-taro-frc';
import {
	AtSearchBar,
	AtTabs,
	AtTabsPane
} from 'taro-ui';
import cns from 'classnames';
import mta from 'mta-wechat-analysis';
import {connect} from '@tarojs/redux';

import Tools from '../../utils/petPlanetTools';
import {
	LoadingView,
	EmptyView
} from '../../components/bussiness-components';
import * as ldmMallApi from './ldmMall_service';
import homeAPI from '../index/home_service';
import {changeCurrent} from '../index/home_action';
import {loadingStatus, pageCurrentList, tabBarTabList} from '../../constants';
import * as constants from './constants';
import {imgs} from '../../assets';

import 'taro-ui/dist/style/components/tab-bar.scss';
import 'taro-ui/dist/style/components/tabs.scss';
import 'taro-ui/dist/style/components/search-bar.scss';
import 'taro-ui/dist/style/components/button.scss';
import 'taro-ui/dist/style/components/icon.scss';

import '../commons/iconfont/iconfont.less';
import './loading-view.less';
import './index.less'


@connect((state) => {
	return {
		homeStore: state.homeStore
	}
}, (dispatch) => {
	return {
		/**
		 * 通过onClick事件来更新current值变化
		 * @param value
		 */
		changeCurrentHandler(value) {
			const {currentList} = this.state;
			dispatch(changeCurrent({current: value}));
			Taro.redirectTo({
				url: currentList[`${value}`]
			});
		},
		/**
		 * 初始化页面时更新current值的变化
		 */
		changeCurrentInit() {
			const {path} = this.$router;
			const {currentList} = this.state;
			dispatch(changeCurrent({current: currentList.findIndex(item => item === path) || 0}));
		}
	}
})
class LdmMall extends Component {
	constructor(props) {
		super(props);
	}

	static options = {
		addGlobalClass: true
	};

	config = {
		navigationBarTitleText: '好物'
	};

	state = {
		//模糊匹配字段
		para: '',
		//查询类型
		searchType: 2,
		//最初的商城id
		mallId: 3,
		//分类列表
		mallList: [],
		//分类品牌列表
		categoryList: [],
		//当前选中的标签索引值
		current: 0,
		//是否显示正在加载loading页面......
		loading: true,
		//是否显示主要内容
		isShow: false,
		tabBarInfo: {
			communication: {
				dot: false
			}
		},
		//筛选之后的TabBar标签页路由路径
		currentList: [],
		//获取底部TabBar配置
		tabBarTabList: [],
		//底部隐藏的TabBar配置
		tabBarTabNoSbList: [],
	};

	async componentWillMount() {
		const {changeCurrentInit} = this.props;
		let {data: tabBarConfig} = await homeAPI.getTabBarConfigRequest();
		let filterTabBarList = [],
			tabBarTabNoSbList,
			filterTabBarNoSbList = [],
			list = Object.assign([], pageCurrentList),
			filterTabBarKeyList = [];
		for (let val of tabBarConfig) {
			let filterTabBarConfig = tabBarTabList.filter(tabBarItem => (tabBarItem['id'] === val['code']) && val['sb']),
				filterTabBarNoSbConfig = tabBarTabList.filter(tabBarItem => (tabBarItem['id'] === val['code']) && !val['sb']);
			if (filterTabBarConfig && filterTabBarConfig.length > 0) {
				filterTabBarList = [...filterTabBarList, ...filterTabBarConfig];
			}
			if (filterTabBarNoSbConfig && filterTabBarNoSbConfig.length > 0) {
				filterTabBarNoSbList = [...filterTabBarNoSbList, val];
			}
		}
		for (let [key, val] of list.entries()) {
			tabBarTabNoSbList = filterTabBarNoSbList.filter(sbItem => sbItem['path'] === val);
			tabBarTabNoSbList && tabBarTabNoSbList.length > 0 && (filterTabBarKeyList = [...filterTabBarKeyList, key]);
		}
		for (let val of filterTabBarKeyList) {
			list.splice(val, 1, undefined);
		}
		list = list.filter(listItem => listItem !== undefined);
		const tabBarSymbol = filterTabBarList.findIndex(tabBarItem => tabBarItem.name === constants.symbol);
		this.setState({
			tabBarTabList: filterTabBarList,
			currentList: list,
			isShow: tabBarSymbol !== -1
		}, () => {
			changeCurrentInit.call(this);
		});
		mta.Page.init();
	}

	componentDidMount() {
		const {
			mallId = 0
		} = this.state;
		ldmMallApi.getCategorySub.call(this, mallId);
	}

	async componentDidShow() {
		const {tabBarInfo} = this.state;
		const {filterDotTabBarList} = this;
		let {data: newTabBarInfo} = await homeAPI.getTabBarInfoRequest();
		this.setState(Object.assign({}, {
			tabBarInfo
		}, {
			tabBarInfo: newTabBarInfo
		}), () => {
			filterDotTabBarList(this.state.tabBarInfo);
		});
		await Taro.showShareMenu({
			withShareTicket: false
		});
	}

	/**
	 * 筛选出dot为true的底部边栏结构
	 * @尹文楷
	 */
	filterDotTabBarList = (tabBarInfo) => {
		if (!tabBarInfo) {
			return false;
		}
		const {tabBarTabList} = this.state;
		let tabBarInfoList = Object.entries(tabBarInfo),
			tabBarInfoDotList = tabBarInfoList.filter((item, index) => {
				return !!(item[1] && item[1].dot);
			});
		let newFilterTabBarInfoDotList = tabBarInfoDotList.map((dotItem, dotIndex) => {
			return (dotItem && dotItem[0]);
		});
		tabBarTabList.forEach((item, index) => {
			item.dot = false;
		});
		while (newFilterTabBarInfoDotList.length > 0) {
			let span = newFilterTabBarInfoDotList.shift();
			tabBarTabList.forEach((item, index) => {
				if (item.name === span) {
					item.dot = true;
				}
			});
		}
		this.setState({
			tabBarTabList,
			loading: false
		});
	};

	/**
	 * 更改输入组件内容
	 */
	onChangeHandler = (type = '', value = '') => {
		value = value.target ? value.target.value : value;
		this.setState({
			[type]: value
		});
	};

	/**
	 * 点击或滑动时触发事件,选中标签列表索引值
	 * @param current
	 */
	onFilterMall = (current = 0) => {
		const {
			mallList = []
		} = this.state;
		const {
			searchTabTypeConfig = {}
		} = constants;
		this.setState({
			current,
			searchType: searchTabTypeConfig[current]
		}, () => {
			if (mallList[current]['hasChild']) {
				ldmMallApi.getCategoryChildrenSub.call(this, mallList[current]['categoryId']);
			} else {
				this.setState({
					categoryList: []
				});
			}
		});
	};

	/**
	 * 重定向至商品列表页
	 */
	onDirectToGoodsList = (e = {}) => {
		const {
			current = 0
		} = this.state;
		const {currentTarget: {dataset: {item = ''}}} = e;
		const _item = JSON.parse(item);
		const {
			categoryId = 0,
			categoryName = ''
		} = _item;
		this.setState({
			searchType: constants['searchTabTypeConfig'][current]
		}, () => {
			Taro.navigateTo({
				url: `${pageCurrentList[37]}?id=${categoryId}&searchType=${constants['searchTabTypeConfig'][current]}&name=${categoryName}`
			});
		});
		//取消冒泡事件
		e.stopPropagation();
	};

	/**
	 * 搜索重定向至商品列表页
	 */
	onDirectToSearchGoodsList = (e) => {
		const {
			searchType = 2,
			para = ''
		} = this.state;
		Taro.navigateTo({
			url: `${pageCurrentList[37]}?searchType=${searchType}&para=${para}`
		});
		//取消冒泡事件
		e.stopPropagation();
	};

	/**
	 * 输入框聚焦时触发
	 */
	onFocusHandler = (event = {}) => {
		const {searchType = 3} = constants;
		this.setState({
			searchType
		});
	};

	/**
	 * 重定向至砍价列表页面
	 * @param event
	 */
	onRedirectToBargain = (event = {}) => {
		Taro.navigateTo({
			url: pageCurrentList[38]
		});
		//取消冒泡事件
		event.stopPropagation();
	};

	render() {
		const {
			homeStore,
			changeCurrentHandler
		} = this.props;
		const {
			tabBarTabList = [],
			isShow = false,
			loading = false,
			current: generalCurrent = 0,
			mallList = [],
			categoryList = [],
			para = ''
		} = this.state;
		const {isX = false} = Tools.adaptationNavBar();
		const {
			current = 0
		} = homeStore;
		const {
			onFilterMall = () => {
			},
			onDirectToGoodsList = () => {
			},
			onChangeHandler = () => {
			},
			onFocusHandler = () => {
			},
			onDirectToSearchGoodsList = () => {
			},
			onRedirectToBargain = () => {
			}
		} = this;
		return (
			<Block>
				{
					loading && <LoadingView
						size={56}
						color='#fb2a5d'
						content={loadingStatus.progress.text}
						className='pet-ldmMall-loading'
					/>
				}
				<AtSearchBar
					className='pet-ldmMall-search'
					inputType='text'
					value={para}
					placeholder='搜索一下'
					onChange={(e) => onChangeHandler('para', e)}
					onFocus={onFocusHandler}
					onActionClick={onDirectToSearchGoodsList}
					showActionButton
					actionName='搜索'
				/>
				<View
					className='pet-ldmMall-cutSale'
					onClick={onRedirectToBargain}
				>
					<Image
						src={imgs.cutSaleBg}
						mode='widthFix'
					/>
				</View>
				{
					isShow ?
						<View className={cns(
							'pet-ldmMall-container',
							{
								'pet-ldmMall-container-adaption': !!isX
							}
						)}>
							<AtTabs
								current={generalCurrent}
								tabList={mallList}
								scroll
								height='100%'
								tabDirection='vertical'
								className='pet-ldmMall-tabs'
								onClick={onFilterMall}
							>
								{
									mallList && mallList.length > 0 &&
									mallList.map((mallItem, mallIndex) => {
										return <AtTabsPane
											tabDirection='vertical'
											current={generalCurrent}
											index={mallIndex}
											key={mallIndex}
											className='pet-ldmMall-list'
										>
											{
												categoryList && categoryList.length > 0 ?
													categoryList.map((categoryItem, categoryIndex) => {
														return <View
															dataItem={JSON.stringify(categoryItem)}
															className='pet-ldmMall-list-item'
															key={categoryIndex}
															onClick={onDirectToGoodsList}
														>
															<Image
																src={categoryItem['logoImg']}
																className='pet-ldmMall-list-item-logo'
																mode='aspectFit'
															/>
															<View className='pet-ldmMall-list-item-title'>
																{categoryItem['categoryName']}
															</View>
														</View>
													}) : ''
											}
										</AtTabsPane>
									})
								}
							</AtTabs>
						</View> : <EmptyView
							className='pet-ldmMall-empty'
							title='啊哦~~~'
							description='关于铲屎官商城敬请期待~'
							size={48}
							color='#000'
							icon='petPlanet-cat-ao'
							prefix='iconfont'
						/>
				}
				{/*导航区域: 分首页、咨询、商城、会话和我四个部分*/}
				<LdmTabBar
					className={cns(
						'pet-tabBar'
					)}
					fixed
					current={current}
					tabList={tabBarTabList}
					onChange={changeCurrentHandler.bind(this)}
					color='#979797'
					iconSize={24}
					selectedColor='#000'
				/>
			</Block>
		)
	}
}

export default LdmMall;
