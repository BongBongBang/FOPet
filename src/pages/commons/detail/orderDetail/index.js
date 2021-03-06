import Taro, {Component} from '@tarojs/taro';
import {
	Image,
	View,
	Text,
	Block
} from '@tarojs/components';
import {
	AtButton,
	AtIcon
} from 'taro-ui';
import {connect} from '@tarojs/redux';
import cns from 'classnames';

import {
	LoadingView
} from '../../../../components/bussiness-components';
import * as constants from './constants';
import {pageCurrentList, status, loadingStatus} from '../../../../constants';
import commonOrderDetailAPI from './order_detail_service';
import commonOrderAPI from '../order/order_service';
import Tools from '../../../../utils/petPlanetTools';
import {imgs} from "../../../../assets";

import 'taro-ui/dist/style/components/icon.scss';
import 'taro-ui/dist/style/components/button.scss';
import 'taro-ui/dist/style/components/activity-indicator.scss';
import 'taro-ui/dist/style/components/loading.scss';

import '../../iconfont/iconfont.less';
import './index.less';
import './loading-view.less';

@connect((state = {}, ownProps) => {
	return {
		topicsStore: state.topicsStore
	}
})
class CommonOrderDetail extends Component {
	config = {
		navigationBarTitleText: '订单详情'
	};

	static options = {
		addGlobalClass: true
	};

	constructor(props) {
		super(props);
	}

	state = {
		//订单号
		orderNo: '',
		//订单id
		orderId: 0,
		//支付类型
		channel: 'WECHAT',
		//订单详情地址
		address: {},
		//快递信息
		express: {},
		//商品信息
		item: [],
		//总价
		payment: '',
		//订单信息
		info: {},
		//订单状态
		orderStatus: '',
		//订单类型
		orderType: '2',
		//支付结束时间
		durationToEndTime: '',
		//是否显示正在加载loading页面......
		loading: true,
		//loading加载标语
		loadingText: loadingStatus.progress.text,
		//咨询的医生id
		docId: 0,
		//咨询类型
		consultType: 'SYSTEM',
		//咨询内容
		consultContent: '',
		//咨询的图片
		uploadConsultImages: [],
		//订单对象
		order: {},
		//是否拒绝过获取地址权限
		isScopeAddressRefused: false
	};

	componentWillMount() {
		let {
			params: {
				order = '',
				orderNo = '',
				orderId = 0,
				docId = 0,
				consultType = 'SYSTEM',
				uploadConsultImages = '',
				consultContent = '',
				orderType = '2'
			}
		} = this.$router;
		uploadConsultImages = uploadConsultImages ? JSON.parse(uploadConsultImages) : [];
		const _order = order ? JSON.parse(decodeURIComponent(order)) : {};
		this.setState({
			order: _order,
			orderNo,
			orderId,
			docId,
			consultType,
			uploadConsultImages,
			consultContent,
			orderType
		});
	}

	componentDidShow() {
		commonOrderDetailAPI.getOrderDetail.call(this);
		Taro.hideShareMenu();
	}

	/**
	 * 跳转到普通商品详情页
	 */
	onRedirectToDetail = (e = {}) => {
		const {currentTarget: {dataset: {item = ''}}} = e;
		const _item = JSON.parse(item) || {};
		Taro.redirectTo({
			url: `${pageCurrentList[31]}?id=${_item.goodsId}`
		});
	};

	/**
	 * 校验提交的订单
	 */
	verify = () => {
		const {
			payment = '',
			address = {}
		} = this.state;
		return Tools.addRules([
			address,
			!!parseFloat(payment)
		], [{
			rule: 'isEmpty',
			errMsg: constants.verify.isEmpty
		}]).execute();
	};

	/**
	 * 点击'付款'按钮,进行付款
	 * @param e
	 */
	paymentPayHandler = e => {
		const {
			verify = () => {
			}
		} = this;
		const {
			orderStatus = '',
			orderType = '2'
		} = this.state;
		this.setState({
			loading: true,
			loadingText: loadingStatus.pay.text
		}, () => {
			if (orderType === '4' && orderStatus === status.pendingPayment) {
				if (verify()) {
					commonOrderDetailAPI.paymentPayOrder.call(this);
				}
			} else {
				commonOrderDetailAPI.paymentPayOrder.call(this);
			}
		});
		//取消冒泡事件
		e.stopPropagation();
	};

	/**
	 * 点击'确认收到'按钮,进行确认
	 * @param e
	 */
	completeHandler = e => {
		this.setState({
			loading: true,
			loadingText: loadingStatus.fostered.text
		}, () => {
			commonOrderDetailAPI.completeOrder.call(this);
		});
		//取消冒泡事件
		e.stopPropagation();
	};

	/**
	 * 点击'点评'按钮,进行评价
	 */
	evaluationHandler = (e = {}) => {
		const {order = {}} = this.state;
		const params = encodeURIComponent(JSON.stringify(order).replace(/%/g, '%25')) || '{}';
		this.setState({
			loading: true,
			loadingText: loadingStatus.fostered.text
		}, () => {
			Taro.navigateTo({
				url: `${pageCurrentList[36]}?order=${params}`
			});
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

	/**
	 * 点击新增地址或者已有地址,进行跳转至地址列表页
	 */
	onRedirectToAddressPage = (e) => {
		// const {addressList = []} = this.state;
		// Taro.navigateTo({
		//   url: `${pageCurrentList[35]}?addressList=${JSON.stringify(addressList)}`
		// });
		const {isScopeAddressRefused = false} = this.state;
		if (isScopeAddressRefused) {
			Tools.openSettingConfig({
				success: (authSetting) => {
					if (authSetting[constants.scope.address]) {
						this.setState({
							isScopeAddressRefused: false
						});
					}
				},
				fail: (res) => {

				},
				complete: (res) => {

				}
			});
		} else {
			Tools.chooseAddressConfig({
				success: ({
										userName = '',
										telNumber = '',
										provinceName = '',
										cityName = '',
										countyName = '',
										detailInfo = '',
										postalCode = ''
									}) => {
					const address = {
						consignee: userName,
						mobile: telNumber,
						postcode: postalCode,
						province: provinceName,
						city: cityName,
						district: countyName,
						street: detailInfo
					};
					commonOrderAPI.saveAddress.call(this, address);
					commonOrderDetailAPI.updateOrderAddress.call(this, address);
				},
				fail: (res) => {
				},
				complete: (res) => {

				}
			});
		}
	}

	render() {
		const {
			address = {},
			item: items = [],
			express = {},
			payment = '',
			info = {},
			orderStatus = '',
			orderType = '2',
			durationToEndTime = '',
			loading = true,
			loadingText = loadingStatus.progress.text
		} = this.state;
		const {
			isX = false
		} = Tools.adaptationNavBar();
		const {
			onRedirectToDetail = () => {
			},
			paymentPayHandler = () => {
			},
			completeHandler = () => {
			},
			evaluationHandler = () => {
			},
			onRedirectToAddressPage = () => {
			}
		} = this;
		const orderInfo = constants.orderType[orderType]['isCommons'] ? constants.orderInfo : constants.orderMedicalInfo;
		const paymentPoint = payment.indexOf('.'),
			paymentInt = payment.slice(0, paymentPoint === -1 ? payment.length : paymentPoint),
			paymentFloat = paymentPoint !== -1 ? payment.slice(paymentPoint) : '.00';
		return (
			<View className='orderDetail'>
				{
					loading && <LoadingView
						size={56}
						color='#fb2a5d'
						className='orderDetail-loading'
						content={loadingText}
					/>
				}
				<View className={cns(
					'orderDetail-status',
					{
						'orderDetail-statusPendingPayment': orderStatus === status.pendingPayment
					}
				)}>
					<View className={cns(
						'orderDetail-status-order'
					)}>
						<View className='orderDetail-status-order-detail'>
							<Text className='orderDetail-status-order-desc'>订单状态: </Text>
							<Text>{orderStatus}</Text>
						</View>
					</View>
					{
						orderStatus === status.pendingPayment &&
						<Text className='orderDetail-status-durationToEndTime'>
							{durationToEndTime}
						</Text>
					}
				</View>
				{
					constants.orderType[orderType]['isCommons'] && <Block>
						<View className={cns(
							'orderDetail-service',
							'orderDetail-express'
						)}>
							<AtIcon
								prefixClass='iconfont'
								value='petPlanet-express'
								color='#FFA000'
								size={32}
							/>
							<View className='orderDetail-express-info'>
								{(express && express.info) ? <Block>
									{express.info}
									<View className='orderDetail-express-companyNumberDetail'>
										{express.company} 运单号: <Text selectable>{express.express}</Text>
									</View>
									<View className='orderDetail-express-time'>
										{express.deliveryTime}
									</View>
								</Block> : '尚未发货'}
							</View>
						</View>
						<View
							className={cns(
								'orderDetail-service',
								'orderDetail-address'
							)}
							onClick={(e = {}) => {
								if (orderType === '4' && orderStatus === status.pendingPayment) {
									onRedirectToAddressPage(e);
								}
								//取消冒泡事件
								e.stopPropagation();
							}}
						>
							<AtIcon
								clsssName='orderDetail-address-icon'
								size={28}
								color='#F93B5F'
								prefixClass='iconfont'
								value='petPlanet-orderAddress'
							/>

							<View
								className='orderDetail-address-content'
							>
								{
									(!address || Tools.isEmpty(address)) ? constants.emptyAddressList.text :
										<Block>
											<View className='orderDetail-address-userInfo'>
												<Text className='orderDetail-address-userInfo-name'>
													{address.consignee}
												</Text>
												<Text className='orderDetail-address-userInfo-mobile'>
													{address.mobile}
												</Text>
											</View>
											<View className='orderDetail-address-addressInfo'>
												{`${address.province} ${address.city} ${address.district} ${address.street}`}
											</View>
										</Block>
								}
							</View>
							{
								orderType === '4' && orderStatus === status.pendingPayment &&
								<Image
									className='orderDetail-address-redirectTo'
									src={imgs.back}
									mode='widthFix'
								/>
							}
						</View>
					</Block>
				}
				{
					items && items.length > 0 && items.map(_item => {
						const discPrice = parseFloat(_item.discPrice).toFixed(2),
							optionGroup = _item.attributes['optionGroup'],
							discPricePoint = discPrice.indexOf('.'),
							discIntPrice = discPrice.slice(0, discPricePoint === -1 ? discPrice.length : discPricePoint),
							discFloatPrice = discPricePoint !== -1 ? discPrice.slice(discPricePoint) : '.00';
						return (
							<Block
								key={_item.goodsId}
							>
								<View className={cns(
									'orderDetail-service',
									'orderDetail-detail'
								)}
											data-item={JSON.stringify(_item)}
											onClick={onRedirectToDetail}
								>
									<Image
										src={_item.goodsPic}
										mode='aspectFill'
										className='orderDetail-detail-avatar'
									/>
									<View className='orderDetail-detail-content'>
										<View className='orderDetail-detail-content-title'>
											{_item.goodsName}
										</View>
										<View className='orderDetail-detail-content-desc'>
											{
												optionGroup && optionGroup.length > 0 &&
												optionGroup.map((optionItem, optionIndex) => {
													return optionItem['optionName'] ? <Text
														key={optionIndex}
														className='orderDetail-detail-content-desc-item'
													>
														{optionItem['optionName']}
													</Text> : ''
												})
											}
										</View>
									</View>
									<View className='orderDetail-detail-priceNum'>
										<View className='orderDetail-detail-priceNum-discPrice'>
											<Text
												className='orderDetail-detail-priceNum-discPrice-symbol'>
												&#165;
											</Text>
											{discIntPrice}
											<Text className='orderDetail-detail-priceNum-discPrice-float'>
												{discFloatPrice}
											</Text>
										</View>
										<View className='orderDetail-detail-priceNum-num'>
											x{_item.goodsNum}
										</View>
									</View>
								</View>
								<View className={cns(
									'orderDetail-service',
									'orderDetail-detail-share'
								)}>
									分享到
									<AtButton
										openType='share'
										className='orderDetail-detail-share-button'
									>
										<Image src='https://prod-pet.oss.1jtec.com/icon/wechat.png'
													 mode='aspectFill'
										>

										</Image>
									</AtButton>
								</View>
							</Block>
						)
					})
				}
				<View className={cns(
					'orderDetail-service',
					'orderDetail-total'
				)}>
					合计:
					<View className='orderDetail-total-price'>
						<Text className='orderDetail-total-price-symbol'
									decode
						>
							&#165;
						</Text>
						<Text className='orderDetail-total-price-int'>
							{paymentInt}
						</Text>
						<Text className='orderDetail-total-price-float'>
							{paymentFloat}
						</Text>
					</View>
				</View>
				<View className={cns(
					'orderDetail-service',
					'orderDetail-info',
					{
						'orderDetail-info-medicalAdvice': !!constants.orderType[orderType]['isMedical']
					}
				)}>
					<View className='orderDetail-info-title'>
						订单信息
					</View>
					{
						orderInfo && orderInfo.length > 0 && orderInfo.map(item => {
							//针对于那些可能不会出现在订单信息里面的数据,给予隐藏
							return (!info[item.id] && !!item.isNone) ? null : (
								<View className='orderDetail-info-item'
											key={item.id}
								>
									<Text className='orderDetail-info-item-title'>{item.name}:</Text>
									{info[item.id] || item.value}
								</View>
							)
						})
					}
				</View>
				<View className={cns(
					'orderDetail-serviceOrder',
					{
						'orderDetail-serviceOrderX': !!isX
					}
				)}>
					<AtButton className={
						cns(
							'orderDetail-serviceOrder-button',
							'orderDetail-serviceOrder-contact',
							{
								'orderDetail-serviceOrder-isFull': (
									orderStatus !== status.pendingPayment &&
									orderStatus !== status.isConfirm &&
									orderStatus !== status.isEvaluation
								)
							}
						)
					}
										full
										type='primary'
										openType='contact'
					>
						联系客服
					</AtButton>
					{
						orderStatus === status.pendingPayment &&
						<AtButton className={cns(
							'orderDetail-serviceOrder-button',
							'orderDetail-serviceOrder-pendingPayment'
						)}
											full
											type='primary'
											onClick={paymentPayHandler}
						>
							付款
						</AtButton>
					}
					{
						orderStatus === status.isConfirm &&
						<AtButton className={cns(
							'orderDetail-serviceOrder-button',
							'orderDetail-serviceOrder-confirm'
						)}
											full
											type='primary'
											onClick={completeHandler}
						>
							确认收到
						</AtButton>
					}
					{
						orderStatus === status.isEvaluation &&
						<AtButton className={cns(
							'orderDetail-serviceOrder-button',
							'orderDetail-serviceOrder-evaluation'
						)}
											full
											type='primary'
											onClick={evaluationHandler}
						>
							点评
						</AtButton>
					}
				</View>
			</View>
		)
	}
}

export default CommonOrderDetail;
