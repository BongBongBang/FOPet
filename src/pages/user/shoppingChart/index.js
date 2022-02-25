import Taro, {Component} from '@tarojs/taro';
import {
	connect
} from '@tarojs/redux';
import {
	Block,
	Image,
	ScrollView,
	Text,
	View
} from '@tarojs/components';
import {
	AtButton,
	AtCard,
	AtIcon,
	AtInputNumber,
	AtLoadMore,
	AtToast
} from 'taro-ui';
import cns from 'classnames';

import * as shoppingChartApi from './shoppingChart_service';
import {
	changeScrollTopLeave,
	changeChartListChecked,
	changeShoppingChartListAnyThing
} from './shoppingChart_action';
import {
	loadingStatus,
	pageCurrentList,
	staticData
} from '../../../constants';
import {
	EmptyView,
	LoadingView,
	ModalView
} from '../../../components/bussiness-components';
import * as constants from "./constants";

import 'taro-ui/dist/style/components/icon.scss';
import 'taro-ui/dist/style/components/loading.scss';
import 'taro-ui/dist/style/components/activity-indicator.scss';
import 'taro-ui/dist/style/components/card.scss';
import 'taro-ui/dist/style/components/input-number.scss';
import 'taro-ui/dist/style/components/modal.scss';
import 'taro-ui/dist/style/components/toast.scss';
import 'taro-ui/dist/style/components/load-more.scss';
import 'taro-ui/dist/style/components/button.scss';

import './loading-view.less';
import './modal-view.less';
import '../../commons/iconfont/iconfont.less';
import './index.less';

/**
 * 购物车页面
 */
@connect((state, ownProps) => {
	return {
		shoppingChartStore: state.shoppingChartStore
	};
}, (dispatch, ownProps) => {
	return {
		//获取购物车商品列表
		getShoppingChartListHandler() {
			dispatch(shoppingChartApi.getShoppingChartList.call(this));
		},
		//记录离开购物车页面时,购物车商品列表距离顶部的高度
		changeScrollTopLeaveHandler(payload) {
			dispatch(changeScrollTopLeave(payload));
		},
		//点击多选时进行的选中或者取消操作
		changeChartListCheckedHandler(payload) {
			dispatch(changeChartListChecked(payload));
		},
		//处理购物车商品列表里面的一些总体全局数据
		changeShoppingChartListAnyThingHandler(payload) {
			dispatch(changeShoppingChartListAnyThing(payload));
		}
	};
})
class ShoppingChart extends Component {
	static options = {
		addGlobalClass: true
	};

	config = {
		navigationBarTitleText: '购物车',
		navigationBarBackgroundColor: '#fff',
		// navigationStyle: 'custom'
	};

	constructor(props) {
		super(props);
		//防抖计时器
		this.timer = null;
		//是否存在下一页数据
		this.isNext = true;
	}

	state = {
		//是否显示状态组件
		isShowLoad: false,
		//加载状态
		loadStatus: staticData.loadStatusConfig.loading,
		//是否是在接口请求响应加载中
		loading: true,
		//loading加载标语
		loadingText: loadingStatus.progress.text,
		//购物车商品列表距离顶部的高度
		scrollTop: this.props.shoppingChartStore.scrollTop,
		//购物车商品列表是否全部选中
		allChecked: false,
		//离开时购物车商品列表距离顶部的高度
		scrollTopLeave: 0,
		//购物车选中所有商品的总价值
		totalPrice: 0,
		//是否展示删除购物车商品列表里面的某一个商品项弹框
		deleteShoppingChart: false,
		//确认删除购物车商品列表里面的某一个商品项
		deleteShoppingChartItem: {},
		//是否显示删除购物车成功轻提示弹层
		isDeleteShoppingChartToast: false
	};

	componentDidMount() {
		const {
			getShoppingChartListHandler = () => {
			}
		} = this.props;
		getShoppingChartListHandler.call(this);
	}

	/**
	 * 选择将购物车某一个宠物商品添加上还是取消,并进行计算合计金额
	 * @param event
	 */
	onCheckedHandler = (event = {}) => {
		const {
			currentTarget: {
				dataset: {
					item = ''
				}
			}
		} = event;
		const {
			shoppingChartStore = {}
		} = this.props;
		const {
			shoppingChartList = []
		} = shoppingChartStore || {};
		const {
			onChangeOperation = () => {
			},
			onCheckedTotalPrice = () => {
			}
		} = this;
		const _item = JSON.parse(item);
		onChangeOperation(_item, 'checked', () => {
			onCheckedTotalPrice(shoppingChartList);
		});
	};

	/**
	 * 进行计算合计金额
	 * @param shoppingChartList
	 */
	onCheckedTotalPrice = (shoppingChartList = []) => {
		//购物车商品里面的全部选中部分的金额
		let totalPrice = 0;
		const allChecked = shoppingChartList.findIndex((chartItem = {}) => {
			return !chartItem['checked']
		}) === -1;
		const checkedShoppingChart = shoppingChartList.filter((chartItem = {}) => {
			return chartItem['checked'];
		});
		checkedShoppingChart.forEach((shoppingChartItem = {}) => {
			const {
				num = 1,
				discPrice: price = 0
			} = shoppingChartItem || {};
			const priceFinal = parseFloat(price / 100);
			totalPrice += priceFinal * num;
		});
		this.setState({
			allChecked,
			totalPrice
		});
	};

	/**
	 * 购物车商品列表滚动时触发
	 */
	onShoppingChartScrollHandler = (event = {}) => {
		const {
			onPositionShoppingChartScrollTop = () => {
			},
			onAllNumChangeEndHandler = () => {
			},
			onScrollPageHandler = () => {
			}
		} = this;
		const {
			detail: {
				scrollTop = 0
			}
		} = event;
		//防抖记录购物车商品列表距离顶部的高度
		onPositionShoppingChartScrollTop(scrollTop);
		//滚动时,购物车全部商品列表项更改修改数量变为确定数量
		onAllNumChangeEndHandler();
		//滚动分页配置
		onScrollPageHandler(event);
	};

	/**
	 * 滚动分页配置
	 */
	onScrollPageHandler = (event = {}) => {
		const {
			detail: {
				scrollTop = 0,
				scrollHeight = 0
			}
		} = event;
		const {
			shoppingChartStore = {},
			changeShoppingChartListAnyThingHandler = () => {
			},
			getShoppingChartListHandler = () => {
			}
		} = this.props;
		let {
			pageNum = 1,
			total = 0,
			shoppingChartList = []
		} = shoppingChartStore || {};
		const {
			isNext = true
		} = this;
		Taro.createSelectorQuery()
			.select('#pet-shoppingChart-list')
			.fields({
				size: true
			}, async (res) => {
				const {
					height = 0
				} = res;
				const {length = 0} = shoppingChartList;
				const bottomDistance = scrollHeight - (scrollTop + height);
				if ((bottomDistance / scrollHeight < 0.2) && length < total && isNext) {
					this.isNext = false;
					await changeShoppingChartListAnyThingHandler({
						pageNum: ++pageNum
					});
					this.setState({
						isShowLoad: true
					}, () => {
						getShoppingChartListHandler.call(this);
					});
				}
			}).exec();
	};

	/**
	 * 点击全选按钮
	 */
	onAllCheckedHandler = (event = {}) => {
		const {
			onAllCheckedOperation = () => {
			}
		} = this;
		//点击全选按钮,将当前购物车商品页的所有商品全部选中
		onAllCheckedOperation();
		//取消冒泡事件
		event.stopPropagation();
	};

	/**
	 * 点击全选按钮,将当前购物车商品页的所有商品全部选中
	 */
	onAllCheckedOperation = () => {
		const {
			shoppingChartStore = {},
			changeChartListCheckedHandler = () => {
			}
		} = this.props;
		const {
			shoppingChartList = []
		} = shoppingChartStore || {};
		const {
			allChecked = false
		} = this.state;
		//购物车商品里面的全部选中部分的金额
		let totalPrice = 0;
		//将购物车商品里面的所有多选全部选中
		const _shoppingChartList = shoppingChartList.map((shoppingChartItem = {}) => {
			return {
				...shoppingChartItem,
				checked: !allChecked
			};
		});
		shoppingChartList.forEach((shoppingChartItem = {}) => {
			const {
				num = 1,
				discPrice: price = 0
			} = shoppingChartItem || {};
			const priceFinal = parseFloat(price / 100);
			totalPrice += priceFinal * num;
		});
		this.setState({
			allChecked: !allChecked,
			totalPrice: !allChecked ? totalPrice : 0
		});
		changeChartListCheckedHandler({
			shoppingChartList: _shoppingChartList
		});
	};

	/**
	 * 防抖记录购物车商品列表距离顶部的高度
	 */
	onPositionShoppingChartScrollTop = (scrollTop = 0) => {
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = null;
		}
		this.timer = setTimeout(() => {
			this.setState({
				scrollTopLeave: scrollTop
			});
		}, 600);
	};

	/**
	 * 点击购物车商品列表项更改修改数量或者确定数量
	 */
	onCountChangeHandler = (e = {}) => {
		const {
			currentTarget: {
				dataset: {
					item = ''
				}
			}
		} = e;
		const {
			onChangeOperation = () => {
			}
		} = this;
		const _item = JSON.parse(item);
		onChangeOperation(_item, 'forSure');
		//消除冒泡事件
		e.stopPropagation();
	};

	/**
	 * 对于公共的购物车商品列表里面的商品项属性开关操作的统一处理
	 */
	onChangeOperation = (_item = {}, type = '', callBack = () => {
	}) => {
		const {
			shoppingChartStore = {},
			changeChartListCheckedHandler = () => {
			}
		} = this.props;
		const {
			shoppingChartList = []
		} = shoppingChartStore || {};
		_item[type] = !_item[type];
		const _item_index = shoppingChartList.findIndex((listItem = {}) => {
			return listItem['skuId'] === _item['skuId'];
		});
		shoppingChartList.splice(_item_index, 1, _item);
		changeChartListCheckedHandler({
			shoppingChartList: [...shoppingChartList]
		});
		callBack();
	};

	/**
	 * 购物车里面商品列表商品项数量内容变化时所发生的操作
	 * @param value
	 * @param item
	 * @param e
	 */
	onNumChange = (value = '', item = {}, e = {}) => {
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
		const _item = Object.assign({}, item);
		const sourceNum = _item['num'];
		const qDiff = value - _item['num'];
		_item['num'] = value;
		const _item_index = shoppingChartList.findIndex((listItem = {}) => {
			return listItem['skuId'] === _item['skuId'];
		});
		shoppingChartList.splice(_item_index, 1, _item);
		shoppingChartApi.addShoppingChart.call(this, _item, qDiff, sourceNum);
		changeChartListCheckedHandler({
			shoppingChartList: [...shoppingChartList]
		});
		onCheckedTotalPrice(shoppingChartList);
		//取消冒泡事件
		e.stopPropagation();
	};

	/**
	 * 滚动时,购物车全部商品列表项更改修改数量变为确定数量
	 */
	onAllNumChangeEndHandler = () => {
		const {
			shoppingChartStore = {},
			changeChartListCheckedHandler = () => {
			}
		} = this.props;
		const {
			shoppingChartList = []
		} = shoppingChartStore || {};
		const forSureIndex = shoppingChartList.findIndex((chartItem = {}) => {
			return !chartItem['forSure'];
		});
		if (forSureIndex !== -1) {
			const _shoppingChartList = shoppingChartList.map((chartItem = {}) => {
				return {
					...chartItem,
					forSure: true
				};
			});
			changeChartListCheckedHandler({
				shoppingChartList: [..._shoppingChartList]
			});
		}
	};

	/**
	 * 作为处理弹框或者一些开关组件的控制器
	 */
	onChangeModalHandler = (type = '') => {
		const {[type]: _type} = this.state;
		this.setState({
			[type]: !_type
		});
	};

	/**
	 * 确认删除购物车商品列表里面的某一个商品项
	 */
	onDeleteShoppingChartHandler = () => {
		const {
			deleteShoppingChartItem = {}
		} = this.state;
		shoppingChartApi.deleteShoppingChart.call(this, deleteShoppingChartItem);
	};

	/**
	 * 跳转至下单页面
	 */
	onRedirectToOrderDetail = (e = {}) => {
		const {
			shoppingChartStore = {},
		} = this.props;
		const {
			shoppingChartList = []
		} = shoppingChartStore || {};
		const checkedShoppingChartList = shoppingChartList.filter((chartItem = {}) => {
			return chartItem['checked'];
		});
		if (checkedShoppingChartList.length > 0) {
			const navParam = checkedShoppingChartList.map((chartItem = {}) => {
				const skuAttributes = chartItem['skuAttributes'];
				return {
					coverPic: chartItem['coverPic'],
					goodsName: chartItem['goodsName'],
					orderItem: {
						goodsId: chartItem['goodsId'],
						goodsNum: chartItem['num'],
						skuId: chartItem['skuId'],
						discPrice: chartItem['discPrice'] / 100,
						optionGroup: skuAttributes
					}
				};
			});
			Taro.navigateTo({
				url: `${pageCurrentList[33]}?item=${encodeURIComponent(JSON.stringify(navParam).replace(/%/g, '%25'))}`
			});
		}
		//取消冒泡事件
		e.stopPropagation();
	};

	componentWillUnmount() {
		const {
			scrollTopLeave = 0
		} = this.state;
		const {
			changeScrollTopLeaveHandler = () => {
			}
		} = this.props;
		//记录离开购物车页面时,购物车商品列表距离顶部的高度
		changeScrollTopLeaveHandler({
			scrollTop: scrollTopLeave
		});
	}

	render() {
		const {
			loading = true,
			loadingText = loadingStatus.progress.text,
			scrollTop = 0,
			allChecked = false,
			totalPrice = 0,
			deleteShoppingChart = false,
			isDeleteShoppingChartToast = false,
			isShowLoad = false,
			loadStatus = staticData.loadStatusConfig.loading
		} = this.state;
		const {
			shoppingChartStore = {}
		} = this.props;
		const {
			shoppingChartList = [],
			total = 0
		} = shoppingChartStore || {};
		const {
			onShoppingChartScrollHandler = () => {
			},
			onCheckedHandler = () => {
			},
			onAllCheckedHandler = () => {
			},
			onCountChangeHandler = () => {
			},
			onNumChange = () => {
			},
			onChangeModalHandler = () => {
			},
			onDeleteShoppingChartHandler = () => {
			},
			onRedirectToOrderDetail = () => {
			}
		} = this;
		const totalPayment = parseFloat(totalPrice).toFixed(2),
			totalPaymentPoint = totalPayment.indexOf('.'),
			totalPaymentInt = totalPayment.slice(0, totalPaymentPoint === -1 ? totalPayment.length : totalPaymentPoint),
			totalPaymentFloat = totalPaymentPoint !== -1 ? totalPayment.slice(totalPaymentPoint) : '.00';
		return (
			<Block>
				<View className='pet-shoppingChart'>
					{
						loading && <LoadingView
							size={56}
							color='#fb2a5d'
							className='pet-shoppingChart-loading'
							content={loadingText}
						/>
					}
					{
						shoppingChartList && shoppingChartList.length > 0 ? <ScrollView
							className='pet-shoppingChart-list'
							id='pet-shoppingChart-list'
							scrollY
							onScroll={onShoppingChartScrollHandler}
							scrollTop={scrollTop}
						>
							{
								shoppingChartList.map((chartListItem, chartIndex) => {
									const {
										checked = false,
										skuAttributes = [],
										num = 1,
										discPrice: price = 0,
										forSure = true
									} = chartListItem;
									const priceFinal = price / 100,
										discPrice = parseFloat(priceFinal).toFixed(2),
										discPricePoint = discPrice.indexOf('.'),
										discIntPrice = discPrice.slice(0, discPricePoint === -1 ? discPrice.length : discPricePoint),
										discFloatPrice = discPricePoint !== -1 ? discPrice.slice(discPricePoint) : '.00',
										payment = parseFloat(priceFinal * num).toFixed(2),
										paymentPoint = payment.indexOf('.'),
										paymentInt = payment.slice(0, paymentPoint === -1 ? payment.length : paymentPoint),
										paymentFloat = paymentPoint !== -1 ? payment.slice(paymentPoint) : '.00';
									return (
										<View className='pet-shoppingChart-list-item'
													key={chartIndex}
													data-item={JSON.stringify(chartListItem)}
										>
											<AtCard>
												<View className='pet-shoppingChart-card-header'>
													<View
														className='pet-shoppingChart-card-header-checked'
														data-item={JSON.stringify(chartListItem)}
														onClick={onCheckedHandler}
													>
														{
															checked ? <AtIcon
																prefixClass='iconfont'
																value='petPlanet-checked'
																size={20.5}
																color='#F93B5F'
																className='pet-shoppingChart-card-header-checked-icon'
															/> : <View className='pet-shoppingChart-card-header-checked-empty'>
															</View>
														}
														<Text className='pet-shoppingChart-card-header-title'>
															好物
														</Text>
													</View>
													<AtIcon
														prefixClass='iconfont'
														value='petPlanet-delete'
														size={14}
														color='#999'
														className='pet-shoppingChart-card-header-delete'
														onClick={() => {
															onChangeModalHandler('deleteShoppingChart');
															this.setState({
																deleteShoppingChartItem: chartListItem
															});
														}}
													/>
												</View>
												<View className='pet-shoppingChart-card'>
													<Block>
														<Image
															className='pet-shoppingChart-card-avatar'
															src={chartListItem['coverPic']}
															mode='aspectFill'
														/>
														<View className={cns(
															'pet-shoppingChart-card-content'
														)}>
															<View className='pet-shoppingChart-card-content-title'
																		selectable
															>
																{chartListItem['goodsName']}
															</View>
															<View className='pet-shoppingChart-card-content-desc'
																		selectable
															>
																{
																	skuAttributes && skuAttributes.length > 0 &&
																	skuAttributes.map((optionItem, optionIndex) => {
																		return optionItem ? <Text
																			key={optionIndex}
																			className='pet-shoppingChart-card-content-desc-item'
																		>
																			{optionItem['optionName']}
																		</Text> : ''
																	})
																}
															</View>
														</View>
														<View className='pet-shoppingChart-card-priceNum'>
															<View className='pet-shoppingChart-card-priceNum-discPrice'>
																<Text
																	className='pet-shoppingChart-card-priceNum-discPrice-symbol'>
																	&#165;
																</Text>
																{discIntPrice}
																<Text
																	className='pet-shoppingChart-card-priceNum-discPrice-float'>
																	{discFloatPrice}
																</Text>
															</View>
															<View
																className='pet-shoppingChart-card-priceNum-num'
																data-item={JSON.stringify(chartListItem)}
															>
																{
																	forSure ? <Text
																		className='pet-shoppingChart-card-priceNum-num-forSure'
																		data-item={JSON.stringify(chartListItem)}
																		onClick={onCountChangeHandler}
																	>
																		x{num}
																	</Text> : <AtInputNumber
																		min={1}
																		max={100}
																		step={1}
																		width={64}
																		value={num}
																		onChange={(value = 1, e = {}) => onNumChange(value, chartListItem, e)}
																		onBlur={onCountChangeHandler}
																		className='pet-shoppingChart-card-priceNum-num-inputNumber'
																	/>
																}
															</View>
														</View>
													</Block>
												</View>
												<View className={cns(
													'pet-shoppingChart-other-total'
												)}>
													<View className='pet-shoppingChart-other-total-container'>
														合计: <Text className='pet-shoppingChart-other-total-symbol'>
														¥
													</Text>
														<Text className='pet-shoppingChart-other-total-int'>{paymentInt}</Text>
														<Text
															className='pet-shoppingChart-other-total-float'>
															{paymentFloat}
														</Text>
													</View>
												</View>
											</AtCard>
										</View>
									);
								})
							}
							{/*是否显示状态组件*/}
							{
								(isShowLoad && total !== 0) ? <AtLoadMore
									status={loadStatus}
									className='pet-shoppingChart-loadMore'
								/> : <View className='pet-shoppingChart-block'>
								</View>
							}
						</ScrollView> : <EmptyView
							className='pet-shoppingChart-empty'
							title='啊哦~~~'
							description='铲屎官没有发现购物车中存在好物~'
							prefix='iconfont'
							icon='petPlanet-cat-ao'
							size={48}
							color='#000'
						/>
					}
				</View>
				<View className='pet-shoppingChart-totalPrice'>
					<View
						className='pet-shoppingChart-totalPrice-allChecked'
						onClick={onAllCheckedHandler}
					>
						{
							allChecked ? <AtIcon
								prefixClass='iconfont'
								value='petPlanet-checked'
								size={20.5}
								color='#F93B5F'
								className='pet-shoppingChart-totalPrice-allChecked-icon'
							/> : <View className='pet-shoppingChart-totalPrice-allChecked-empty'>
							</View>
						}
						<Text className='pet-shoppingChart-totalPrice-allChecked-desc'>
							全选
						</Text>
					</View>
					<View className='pet-shoppingChart-totalPrice-container'>
						<View className='pet-shoppingChart-totalPrice-total'>
							合计: <Text className='pet-shoppingChart-totalPrice-total-symbol'>
							¥
						</Text>
							<Text className='pet-shoppingChart-totalPrice-total-int'>{totalPaymentInt}</Text>
							<Text
								className='pet-shoppingChart-totalPrice-total-float'>
								{totalPaymentFloat}
							</Text>
						</View>
						<AtButton
							size='small'
							type='primary'
							className='pet-shoppingChart-totalPrice-total-button'
							onClick={onRedirectToOrderDetail}
						>
							结算
						</AtButton>
					</View>
				</View>
				{/*删除购物车商品列表里面的某一个商品项*/}
				<ModalView
					className='pet-shoppingChart-modal'
					isOpened={deleteShoppingChart}
					title={constants.modal.refuse.title}
					cancelText={constants.modal.refuse.cancelText}
					confirmText={constants.modal.refuse.confirmText}
					content={constants.modal.refuse.content}
					onConfirm={onDeleteShoppingChartHandler}
					onCancel={() => onChangeModalHandler('deleteShoppingChart')}
					onClose={() => onChangeModalHandler('deleteShoppingChart')}
				/>
				<AtToast
					isOpened={isDeleteShoppingChartToast}
					text={constants.toast.deleteShoppingChart.success}
					status='success'
					duration={1000}
					onClose={() => {
						this.setState({
							isDeleteShoppingChartToast: false
						});
					}}
				/>
			</Block>
		)
	}
}

export default ShoppingChart;