import Taro, {Component} from '@tarojs/taro';
import {
	Block,
	Image,
	View,
	Swiper,
	SwiperItem,
	Text
} from '@tarojs/components';
import {
	connect
} from '@tarojs/redux';
import {
	AtAvatar,
	AtButton
} from 'taro-ui';
import {
	LdmNavBar
} from 'ldm-taro-frc';
import cns from 'classnames';

import Tools from '../../../../utils/petPlanetTools';

import {imgs} from '../../../../assets';
import fosterDetailAPI from './fosterDetail_service';
import {pageCurrentList} from '../../../../constants';

import 'taro-ui/dist/style/components/avatar.scss';
import 'taro-ui/dist/style/components/button.scss';
import 'taro-ui/dist/style/components/icon.scss';

import './index.less';

@connect((state, ownProps) => {
	return {};
}, (dispatch, ownProps) => {
	return {};
})
class FosterDetail extends Component {
	constructor(props) {
		super(props);
	}

	static options = {
		addGlobalClass: true
	};

	config = {
		navigationStyle: 'custom',
		navigationBarTitleText: '寄养详情'
	};

	state = {
		//家庭寄养头部轮播图列表
		swiperList: [],
		//家庭寄养项商品id
		goodsId: 0,
		//家庭寄养商品名
		goodsName: null,
		//商家封面图
		coverPic: '',
		//spu属性
		spuAttributes: [],
		//开始时间戳
		startDate: 0,
		//结束时间戳
		endDate: 0,
		//家庭寄养寄养服务
		fosterService: [],
		//家庭寄养其他服务
		otherService: [],
		//判断当前用户是否需要更新信息
		isNeedUpdate: true,
	};

	componentWillMount() {
		const {params = {}} = this.$router;
		const {goodsId = 0, goodsName = null} = params;
		this.setState({
			goodsId,
			goodsName
		});
	}

	componentDidMount() {
		fosterDetailAPI.getFosterDetail.call(this);
	}

	/**
	 * 返回上一个页面
	 */
	redirectToBackPage = (e) => {
		Taro.navigateBack({
			delta: 1
		});
		//取消冒泡
		e.stopPropagation();
	};

	/**
	 * 获取用户信息并进行发起宠物寄养下单
	 */
	onPlaceHolderHandler = async (event) => {
		const {
			goodsName = '',
			fosterService = [],
			otherService = [],
			startDate = 0,
			endDate = 0
		} = this.state;
		fosterService.forEach(fosterItem => {
			fosterItem['checked'] = false;
			fosterItem['goodsNum'] = 0;
		});
		otherService.forEach(otherItem => {
			otherItem['checked'] = false;
			otherItem['goodsNum'] = 0;
		});
		let {data: isNeedUpdate = true} = await fosterDetailAPI.getNeedUpdateUserInfo();
		//保存判断用户是否需要更新信息的状态
		this.setState({
			isNeedUpdate
		});
		if (isNeedUpdate) {
			Taro.navigateTo({
				url: `${pageCurrentList[20]}?pages=fosterDetail`
			});
		} else {
			Taro.navigateTo({
				url: `${pageCurrentList[26]}?goodsName=${goodsName}&fosterService=${JSON.stringify(fosterService)}&otherService=${JSON.stringify(otherService)}&startDate=${startDate * 1000}&endDate=${endDate * 1000}`
			});
		}
		event.stopPropagation();
	};

	/**
	 * 在新页面中全屏预览图片。预览的过程中用户可以进行保存图片、发送给朋友等操作。
	 * @param value
	 */
	onPreviewImage = (value) => {
		const {swiperList = []} = this.state;
		Tools.previewImageConfig({
			urls: swiperList,
			current: value,
			success: (res) => {
				console.log(res);
			},
			complete: (res) => {
				console.log(res);
			}
		});
	};

	render() {
		const {
			swiperList = [],
			goodsName = '',
			fosterService = [],
			otherService = [],
			coverPic = null,
			spuAttributes = [],
			goodsDesc = ''
		} = this.state;
		const {
			redirectToBackPage = () => {
			},
			onPlaceHolderHandler = () => {
			},
			onPreviewImage = () => {
			},
		} = this;
		const spuHeaderAttributes = spuAttributes.slice(0, 1);
		const {length = 0} = swiperList;
		const {isX = false} = Tools.adaptationNavBar();
		spuAttributes.shift();
		return (
			<View className='pet-fosterDetail'>
				<LdmNavBar
					color='#000'
					title={goodsName}
					imgs={imgs.back}
					className='pet-fosterDetail-navBar'
					onClickLeftIcon={redirectToBackPage}
				/>
				<View className='pet-fosterDetail-container'>
					<Swiper className='pet-fosterDetail-swiper'
									autoplay
									indicatorDots={length > 1}
									indicatorColor='#f9f9f9'
									indicatorActiveColor='#F93B5F'
					>
						{
							swiperList && length > 0 && swiperList.map(item => {
								return (
									<SwiperItem key={item}>
										<Image src={item}
													 mode='aspectFill'
													 className='pet-fosterDetail-swiper-image'
													 onClick={() => onPreviewImage(item)}
										>

										</Image>
									</SwiperItem>
								)
							})
						}
					</Swiper>
					<View className='pet-fosterDetail-situation'>
						<View className='pet-fosterDetail-situation-info'>
							<AtAvatar
								image={coverPic}
								size='large'
								circle
								className='pet-fosterDetail-situation-avatar'
							>

							</AtAvatar>
							<View className='pet-fosterDetail-situation-content'>
								<Text className='pet-fosterDetail-situation-content-title'
											selectable
								>
									{goodsName}
								</Text>
								{
									spuHeaderAttributes.map(attrItem => {
										return (
											<View key={String(attrItem['goodsId'])}
														className='pet-fosterDetail-situation-content-detail'
											>
												<Text className='pet-fosterDetail-situation-content-attrName'
															selectable
												>
													{attrItem['attrName']}
												</Text>
												<Text className='pet-fosterDetail-situation-content-spuAttributeValue'
															selectable
												>
													{attrItem['spuAttributeValue']}
												</Text>
											</View>
										)
									})
								}
								<Text className='pet-fosterDetail-situation-content-desc'
											selectable
								>
									{goodsDesc}
								</Text>
							</View>
						</View>
					</View>
					<View className='pet-fosterDetail-service'>
						<View className='pet-fosterDetail-service-main'>
							<View className='pet-fosterDetail-service-main-title'>
								寄养服务
							</View>
							<View className='pet-fosterDetail-service-main-list'>
								{
									fosterService && fosterService.length > 0 && fosterService.map(serviceItem => {
										const optionGroups = serviceItem.optionGroup;
										return (
											<View className='pet-fosterDetail-service-main-list-item'
														key={String(serviceItem.goodsId)}
											>
												{
													optionGroups && optionGroups.length > 0 && optionGroups.map(optItem => {
														const discPrice = parseFloat(serviceItem.discPrice).toFixed(2),
															discPricePoint = discPrice.indexOf('.'),
															discIntPrice = discPrice.slice(0, discPricePoint === -1 ? discPrice.length : discPricePoint),
															discFloatPrice = discPricePoint !== -1 ? discPrice.slice(discPricePoint) : '.00';
														return (
															<Block key={String(optItem.skuId)}>
																<View
																	className='pet-fosterDetail-service-main-list-item-title'>
																	{optItem.optionName}
																</View>
																<View
																	className='pet-fosterDetail-service-main-list-item-info-skuOptions'>
																	<Text
																		className='pet-fosterDetail-service-main-list-item-info-skuOptions-symbol'>
																		¥
																	</Text>
																	{discIntPrice}
																	<Text
																		className='pet-fosterDetail-service-main-list-item-info-skuOptions-float'>
																		{discFloatPrice}
																	</Text>/天
																</View>
															</Block>
														)
													})
												}
											</View>
										)
									})
								}
							</View>
						</View>
						<View className='pet-fosterDetail-service-other'>
							<View className='pet-fosterDetail-service-main-title'>
								其他服务
								<View className='pet-fosterDetail-service-main-title-desc'>
									按次统计 一次一只
								</View>
							</View>
							<View className='pet-fosterDetail-service-main-list'>
								{
									otherService && otherService.length > 0 && otherService.map(serviceItem => {
										const optionGroups = serviceItem.optionGroup;
										return (
											<View className='pet-fosterDetail-service-main-list-item'
														key={String(serviceItem.goodsId)}
											>
												{
													optionGroups && optionGroups.length > 0 && optionGroups.map(optItem => {
														const discPrice = parseFloat(serviceItem.discPrice).toFixed(2),
															discPricePoint = discPrice.indexOf('.'),
															discIntPrice = discPrice.slice(0, discPricePoint === -1 ? discPrice.length : discPricePoint),
															discFloatPrice = discPricePoint !== -1 ? discPrice.slice(discPricePoint) : '.00';
														return (
															<Block key={String(optItem.skuId)}>
																<View
																	className='pet-fosterDetail-service-main-list-item-title'>
																	{optItem.optionName}
																</View>
																<View
																	className='pet-fosterDetail-service-main-list-item-info-skuOptions'>
																	<Text
																		className='pet-fosterDetail-service-main-list-item-info-skuOptions-symbol'>
																		¥
																	</Text>
																	{discIntPrice}
																	<Text
																		className='pet-fosterDetail-service-main-list-item-info-skuOptions-float'>
																		{discFloatPrice}
																	</Text>/天
																</View>
															</Block>
														)
													})
												}
											</View>
										)
									})
								}
							</View>
						</View>
					</View>
					{
						spuAttributes && spuAttributes.length > 0 && spuAttributes.map(attrItem => {
							const transformAttributeValue = attrItem['spuAttributeValue'].replace(/\\n/g, '\n\n');
							return (
								<View
									key={String(attrItem['sort'])}
									className='pet-fosterDetail-information'
								>
									<View className='pet-fosterDetail-information-title'>
										{attrItem['attrName']}
									</View>
									<Text className='pet-fosterDetail-information-attrValue'
												decode
												selectable
									>
										{transformAttributeValue}
									</Text>
								</View>
							)
						})
					}
					<View className={cns(
						'pet-fosterDetail-placeOrderArea',
						{
							'pet-fosterDetail-placeOrderAreaX': !!isX
						}
					)}>
						<AtButton
							type='primary'
							full
							className='pet-fosterDetail-placeOrder'
							onClick={onPlaceHolderHandler}
						>
							立即下单
						</AtButton>
					</View>
				</View>
			</View>
		);
	}
}

export default FosterDetail;
