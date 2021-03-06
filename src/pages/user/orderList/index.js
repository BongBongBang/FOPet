import Taro, {Component} from '@tarojs/taro';
import {
	Block,
	Text,
	View,
	Image
} from '@tarojs/components';
import {
	AtButton,
	AtCard,
	AtLoadMore
} from 'taro-ui';
import {connect} from '@tarojs/redux';
import dayjs from 'dayjs';
import cns from 'classnames';

import orderListAPI from './orderList_service';
import {
	EmptyView,
	LoadingView,
	PreparationView
} from '../../../components/bussiness-components';
import * as constants from './constants';
import {
	pageCurrentList,
	staticData,
	status,
	loadingStatus,
	orderTypeConfig
} from '../../../constants';

import 'taro-ui/dist/style/components/button.scss';
import 'taro-ui/dist/style/components/load-more.scss';
import 'taro-ui/dist/style/components/activity-indicator.scss';
import 'taro-ui/dist/style/components/card.scss';
import 'taro-ui/dist/style/components/loading.scss';
import 'taro-ui/dist/style/components/icon.scss';

import '../../commons/iconfont/iconfont.less';
import './loading-view.less';
import './index.less';

@connect((state) => {
	return {}
}, (dispatch) => {
	return {}
})
class OrderList extends Component {
	static options = {
		addGlobalClass: true
	};


	config = {
		navigationBarTitleText: '订单列表'
	};

	constructor(props) {
		super(props);
		//是否要加载下一页列表
		this.isNext = true;
	}

	state = {
		//是否是在接口请求响应加载中
		loading: true,
		//loading加载标语
		loadingText: loadingStatus.progress.text,
		//订单列表的总条数
		total: 0,
		//订单列表页码
		pageNum: 1,
		//筛选头部导航下标
		current: constants.preparationNav[0]['key'],
		//所有订单
		orderList: [],
		//用户昵称
		buyerName: '',
		//用户头像
		buyerPic: '',
		//用户所在地
		address: '',
		//加载状态
		loadStatus: staticData.loadStatusConfig.loading,
		//支付类型
		channel: 'WECHAT',
		//是否显示状态组件
		isShowLoad: false,
		//咨询的医生id
		docId: 0,
		//咨询类型
		consultType: 'SYSTEM',
		//咨询内容
		consultContent: '',
		//咨询的图片
		uploadConsultImages: []
	};

	componentDidMount() {
		let {params: {consultType = 'SYSTEM', consultContent = '', uploadConsultImages = '', docId = 0}} = this.$router;
		uploadConsultImages = uploadConsultImages ? JSON.parse(uploadConsultImages) : [];
		this.setState({
			consultType,
			consultContent,
			uploadConsultImages,
			docId
		});
	}

	componentDidShow() {
		orderListAPI.getOrderList.call(this);
	}

	componentDidHide() {
		this.setState({
			loading: true,
			pageNum: 1,
			orderList: [],
			loadingText: loadingStatus.progress.text,
			loadStatus: staticData['loadStatusConfig']['loading'],
			isShowLoad: false
		});
	}

	/**
	 * 上拉加载订单数据
	 */
	onReachBottom() {
		const {orderList: {length = 0}, total} = this.state;
		const {isNext} = this;
		if (length < total && isNext) {
			this.isNext = false;
			this.setState({
				isShowLoad: true
			}, () => {
				orderListAPI.getOrderList.call(this);
			});
		}
	}

	/**
	 * 筛选头部导航改变时,触发的动作,改变下标,并发起筛选请求
	 * @尹文楷
	 */
	onPNChangeHandler = (current = 0, e = {}) => {
		this.setState({
			current,
			loading: true,
			pageNum: 1,
			orderList: [],
			loadingText: loadingStatus.progress.text,
			loadStatus: staticData['loadStatusConfig']['loading'],
			isShowLoad: false
		}, () => {
			orderListAPI.getOrderList.call(this);
		});
		//取消冒泡事件
		e.stopPropagation();
	};

	/**
	 * 拨打电话
	 * @param e
	 * @param phoneNumber
	 */
	phoneCallHandler = (e, phoneNumber = '0') => {
		Taro.makePhoneCall({
			phoneNumber
		});
	};

	/**
	 * 跳转到订单详情页
	 */
	onRedirectToPlaceOrderDetail = (e, dataItem = '') => {
		const {docId = 0, consultContent = '', uploadConsultImages = [], consultType = 'SYSTEM'} = this.state;
		console.log(e);
		const {currentTarget: {dataset: {item = ''}}} = e;
		let _item = {};
		if (item) {
			_item = JSON.parse(item) || {};
		} else {
			_item = JSON.parse(dataItem) || {};
		}
		const {orderNo = '', id = 0, orderType = '1'} = _item;
		Taro.navigateTo({
			url: orderTypeConfig[orderType]['url'](function (position) {
				return `${pageCurrentList[position]}?order=${encodeURIComponent(item.replace(/%/g, '%25'))}&orderNo=${orderNo}&orderId=${id}&docId=${docId}&consultType=${consultType}&uploadConsultImages=${uploadConsultImages}&consultContent=${consultContent}&orderType=${orderType}`;
			})
		});
		//取消冒泡事件
		e.stopPropagation();
	};

	/**
	 * 点击'已寄养'按钮,表示此订单已经完成交易,进行了寄养
	 * @param e
	 * @param id
	 */
	onCloseOrder = (e = {}, id = 0) => {
		orderListAPI.orderClose.call(this, id);
		//取消冒泡
		e.stopPropagation();
	};

	/**
	 * 点击'付款'按钮,进行付款
	 * @param e
	 * @param item
	 */
	paymentPayHandler = (e = {}, item = {}) => {
		const {
			orderNo = '',
			id = 0,
			payment = '',
			orderType = ''
		} = item;
		this.setState({
			loading: true,
			loadingText: loadingStatus.pay.text
		}, () => {
			orderListAPI.paymentPayOrderList.call(this, id, orderNo, payment, orderType);
		});
	};

	/**
	 * 点击'点评'按钮,进行评价
	 */
	evaluationHandler = (e = {}, item = {}) => {
		const params = encodeURIComponent(JSON.stringify(item).replace(/%/g, '%25')) || '{}';
		Taro.navigateTo({
			url: `${pageCurrentList[36]}?order=${params}`
		});
		//取消冒泡事件
		e.stopPropagation();
	};

	/**
	 * 点击'确认收到'按钮,进行确认
	 * @param e
	 * @param item
	 */
	completeHandler = (e = {}, item = {}) => {
		const {
			id = 0
		} = item;
		this.setState({
			loading: true,
			orderList: [],
			pageNum: 1,
			loadingText: loadingStatus.fostered.text
		}, () => {
			orderListAPI.completeOrderList.call(this, id, item);
		});
		//取消冒泡事件
		e.stopPropagation();
	};

	/**
	 * 初始化loading加载页面
	 */
	initialLoading = () => {
		this.setState({
			loading: false,
			loadingText: loadingStatus.progress.text
		});
	};

	render() {
		const {
			loading = true,
			current = 0,
			total = 0,
			orderList = [],
			loadStatus = staticData.loadStatusConfig.loading,
			isShowLoad = false,
			loadingText = loadingStatus.progress.text
		} = this.state;
		const {
			onPNChangeHandler = () => {
			},
			phoneCallHandler = () => {
			},
			onRedirectToPlaceOrderDetail = () => {
			},
			completeHandler = () => {
			},
			paymentPayHandler = () => {
			},
			evaluationHandler = () => {
			}
		} = this;
		return (
			<View className='pet-orderList'>
				{
					loading && <LoadingView
						size={56}
						color='#fb2a5d'
						className='pet-orderList-loading'
						content={loadingText}
					/>
				}
				<PreparationView strategy={constants.preparationNav}
												 current={current}
												 className='pet-orderList-preparation'
												 onChange={onPNChangeHandler}/>
				<View className='pet-orderList-list'>
					{
						orderList && orderList.length > 0 ? orderList.map((orderItem, orderIndex) => {
							const foster = orderItem['foster'] || {},
								commons = orderItem['common'] || [],
								startTime = foster[0] && foster[0]['startTime'],
								orderType = orderItem['orderType'],
								endTime = foster[0] && foster[0]['endTime'],
								startTimeMSeconds = new Date(startTime).getTime(),
								endTimeMSeconds = new Date(endTime).getTime(),
								durationTime = Math.round(dayjs(endTimeMSeconds).diff(dayjs(startTimeMSeconds), 'day', true)),
								payment = orderItem['payment'],
								paymentPoint = payment.indexOf('.'),
								paymentInt = payment.slice(0, paymentPoint === -1 ? payment.length : paymentPoint),
								paymentFloat = paymentPoint !== -1 ? payment.slice(paymentPoint) : '.00';
							return (
								<View className='pet-orderList-list-item'
											key={String(orderItem['id'])}
											data-item={JSON.stringify(orderItem)}
											onClick={onRedirectToPlaceOrderDetail}
								>
									<AtCard
										title={orderTypeConfig[orderType]['name']}
										extra={orderItem['orderStatus']}
									>
										<View className='pet-orderList-detail'>
											{/*普通商品部分*/}
											{
												orderTypeConfig[orderType]['isCommons'] &&
												commons && commons.length > 0 && commons.map(common => {
													const discPrice = parseFloat(common.price).toFixed(2),
														optionGroup = common.attributes['optionGroup'],
														discPricePoint = discPrice.indexOf('.'),
														discIntPrice = discPrice.slice(0, discPricePoint === -1 ? discPrice.length : discPricePoint),
														discFloatPrice = discPricePoint !== -1 ? discPrice.slice(discPricePoint) : '.00';
													return (
														<View className={cns(
															'pet-orderList-card',
															{
																'pet-orderList-card-multiple': commons.length > 1
															}
														)}>
															<Image
																className='pet-orderList-card-avatar'
																src={common['pic']}
																mode='aspectFill'
															/>
															<View className={cns(
																'pet-orderList-card-content'
															)}>
																<View className='pet-orderList-card-content-title'
																			selectable
																>
																	{common['name']}
																</View>
																<View className='pet-orderList-card-content-desc'
																			selectable
																>
																	{
																		optionGroup && optionGroup.length > 0 &&
																		optionGroup.map((optionItem, optionIndex) => {
																			return optionItem['optionName'] ? <Text
																				key={optionIndex}
																				className='pet-orderList-card-content-desc-item'
																			>
																				{optionItem['optionName']}
																			</Text> : ''
																		})
																	}
																</View>
															</View>
															<View className='pet-orderList-card-priceNum'>
																<View className='pet-orderList-card-priceNum-discPrice'>
																	<Text
																		className='pet-orderList-card-priceNum-discPrice-symbol'>
																		&#165;
																	</Text>
																	{discIntPrice}
																	<Text
																		className='pet-orderList-card-priceNum-discPrice-float'>
																		{discFloatPrice}
																	</Text>
																</View>
																<View className='pet-orderList-card-priceNum-num'>
																	x{common.num}
																</View>
															</View>
														</View>
													)
												})
											}
											{/*普通商品医疗咨询部分*/}
											{
												orderTypeConfig[orderType]['isMedical'] &&
												commons && commons.length > 0 && commons.map(common => {
													return (
														<Block>
															<Image
																className='pet-orderList-card-avatar'
																src={common['pic']}
																mode='aspectFill'
															/>
															<View className={cns(
																'pet-orderList-card-content',
																'pet-orderList-card-content-medical'
															)}>
																<View className='pet-orderList-card-content-title'
																			selectable
																>
																	{common['name']}
																</View>
																<View className={cns(
																	'pet-orderList-card-content-desc'
																)}
																			selectable
																>
																	{common.attributes['optionGroup'][0]['optionName']}
																</View>
															</View>
														</Block>
													)
												})
											}
											{/*寄养家庭部分*/}
											{
												orderTypeConfig[orderType]['isFoster'] &&
												foster && foster.length > 0 && foster.map(fosterItem => {
													return (
														<Block>
															<Image
																className='pet-orderList-card-avatar'
																image={fosterItem['merchantPic']}
																mode='aspectFill'
															/>
															<View className={cns(
																'pet-orderList-card-content',
																'pet-orderList-card-content-foster'
															)}>
																<View className='pet-orderList-card-content-title'
																			selectable
																>
																	{fosterItem['merchantName']}
																</View>
																<View className='pet-orderList-card-content-desc'
																			selectable
																>
																	{fosterItem['merchantAddress']}
																</View>
															</View>
														</Block>
													)
												})
											}
										</View>
										{/*寄养家庭的寄养期限*/}
										{
											orderTypeConfig[orderType]['isFoster'] &&
											<View className='pet-orderList-other-time'>
												<Text className='pet-orderList-other-time-duration'>
													{startTime} 至 {endTime}
												</Text>
												<Text>
													{durationTime}天
												</Text>
											</View>
										}
										<View className={cns(
											'pet-orderList-other-total'
										)}>
											<View className='pet-orderList-other-total-container'>
												合计: <Text className='pet-orderList-other-total-symbol'>
												¥
											</Text>
												<Text className='pet-orderList-other-total-int'>{paymentInt}</Text>
												<Text
													className='pet-orderList-other-total-float'>
													{paymentFloat}
												</Text>
											</View>
										</View>
										<View className='pet-orderList-other-serviceOrder'>
											<View onClick={(e) => {
												e.stopPropagation();
											}}>
												{/*寄养家庭的拨打电话*/}
												{
													orderTypeConfig[orderType]['isFoster'] &&
													<AtButton className={cns(
														'pet-orderList-other-serviceOrder-button',
														'pet-orderList-other-serviceOrder-phone'
													)}
																		type='primary'
																		onClick={(e) => phoneCallHandler(e, orderItem['foster']['merchantPhone'])}
													>
														拨打电话
													</AtButton>
												}
												{/*寄养家庭的拨打电话*/}
												{
													(orderTypeConfig[orderType]['isCommons'] || orderTypeConfig[orderType]['isMedical']) &&
													<AtButton className={cns(
														'pet-orderList-other-serviceOrder-button',
														'pet-orderList-other-serviceOrder-contact'
													)}
																		type='primary'
																		openType='contact'
													>
														联系客服
													</AtButton>
												}
											</View>
											{/*{*/}
											{/*  orderItem['orderStatus'] === constants.status.isFostering ?*/}
											{/*    <View onClick={(e) => {*/}
											{/*      e.stopPropagation();*/}
											{/*    }}>*/}
											{/*      <AtButton*/}
											{/*        className={cns(*/}
											{/*          'pet-orderList-card-serviceOrder-button',*/}
											{/*          'pet-orderList-card-serviceOrder-fostering'*/}
											{/*        )}*/}
											{/*        type='primary'*/}
											{/*        onClick={(e) => onCloseOrder(e, orderItem['id'])}*/}
											{/*      >*/}
											{/*        已寄养*/}
											{/*      </AtButton>*/}
											{/*    </View> : null*/}
											{/*}*/}
											{
												orderItem['orderStatus'] === status.pendingPayment && orderItem['orderType'] !== 4 &&
												<View onClick={(e) => {
													e.stopPropagation();
												}}>
													<AtButton
														className={cns(
															'pet-orderList-other-serviceOrder-button',
															'pet-orderList-other-serviceOrder-pendingPayment'
														)}
														type='primary'
														onClick={(e) => paymentPayHandler(e, orderItem)}
													>
														付款
													</AtButton>
												</View>
											}
											{
												orderItem['orderStatus'] === status.pendingPayment && orderItem['orderType'] === 4 &&
												<View onClick={(e) => {
													e.stopPropagation();
												}}>
													<AtButton
														className={cns(
															'pet-orderList-other-serviceOrder-button',
															'pet-orderList-other-serviceOrder-pendingPayment'
														)}
														type='primary'
														onClick={(e) => onRedirectToPlaceOrderDetail(e, JSON.stringify(orderItem))}
													>
														去支付
													</AtButton>
												</View>
											}
											{
												orderItem['orderStatus'] === status.isConfirm && <View onClick={(e) => {
													e.stopPropagation();
												}}>
													<AtButton
														className={cns(
															'pet-orderList-other-serviceOrder-button',
															'pet-orderList-other-serviceOrder-confirm'
														)}
														type='primary'
														onClick={(e) => completeHandler(e, orderItem)}
													>
														确认收到
													</AtButton>
												</View>
											}
											{
												(orderItem['orderStatus'] === status.isEvaluation && !orderTypeConfig[orderType]['isFoster']) &&
												<View onClick={(e) => {
													e.stopPropagation();
												}}>
													<AtButton
														className={cns(
															'pet-orderList-other-serviceOrder-button',
															'pet-orderList-other-serviceOrder-confirm'
														)}
														type='primary'
														onClick={(e) => evaluationHandler(e, orderItem)}
													>
														点评
													</AtButton>
												</View>
											}
										</View>
									</AtCard>
								</View>
							)
						}) : <EmptyView
							title='啊哦~~~'
							description='铲屎官没有发现任何此类订单~'
							prefix='iconfont'
							icon='petPlanet-cat-ao'
							size={48}
							color='#000'
						/>
					}
					{
						(isShowLoad && total !== 0) ? <AtLoadMore
							className='pet-orderList-list-loadMore'
							status={loadStatus}
						>
						</AtLoadMore> : <View className='pet-orderList-list-block'>
						</View>
					}
				</View>
			</View>
		)
	}
}

export default OrderList;
