import Taro, {Component} from '@tarojs/taro';
import {
	Block,
	View,
	Button,
	Image
} from '@tarojs/components';
import {
	AtAvatar,
	AtIcon
} from 'taro-ui';
import {
	LdmUserInfo,
	LdmTabBar
} from 'ldm-taro-frc';
import {
	EmptyView,
	LoadingView
} from '../../components/bussiness-components';
import {connect} from '@tarojs/redux';
import mta from 'mta-wechat-analysis';
import cns from 'classnames';

import {changeCurrent} from '../index/home_action';
import {setCollectionAttrValue} from './collection/collection_action';
import {setPublishMineAttrValue} from './publishMine/publishMine_action';
import * as constants from './constants';
import {loadingStatus, pageCurrentList, tabBarTabList, needUserInfoDesc} from '../../constants';
import homeAPI from '../index/home_service';
import userAPI from './user_service';

import 'taro-ui/dist/style/components/avatar.scss';
import 'taro-ui/dist/style/components/flex.scss';
import 'taro-ui/dist/style/components/tab-bar.scss';
import 'taro-ui/dist/style/components/activity-indicator.scss';
import 'taro-ui/dist/style/components/loading.scss';
import 'taro-ui/dist/style/components/icon.scss';

import './loading-view.less';
import '../commons/iconfont/iconfont.less';
import './index.less';

@connect((state) => {
	return {
		homeStore: state.homeStore,
		userStore: state.userStore,
		collectionStore: state.collectionStore,
		publishMineStore: state.publishMineStore
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
		},
		/**
		 * 获取个人页随机的头像和昵称
		 * @尹文楷
		 */
		userTinyHomeInfoHandler() {
			dispatch(userAPI.userTinyHomeInfoRequest.apply(this));
		},

		/**
		 * 获取用户授权的个人信息(昵称跟头像),并进行保存
		 * @尹文楷
		 */
		getUserInfoSettingHandler(params) {
			dispatch(userAPI.syncUserInfoRequest.apply(this, [params]));
		},

		/**
		 * 拉取收藏列表
		 * @param pageNum
		 * @尹文楷
		 */
		async usersCollectionHandler(pageNum) {
			if (pageNum === 1) {
				await dispatch(setCollectionAttrValue({
					petCollectionList: []
				}));
			}
			await dispatch(setCollectionAttrValue({
				pageNum
			}));
			await Taro.navigateTo({
				url: pageCurrentList[8]
			});
		},

		/**
		 * 拉取发布列表
		 * @param pageNum
		 * @尹文楷
		 */
		async usersPublishMineHandler(pageNum) {
			if (pageNum === 1) {
				await dispatch(setPublishMineAttrValue({
					petPublishMineList: []
				}));
			}
			await dispatch(setPublishMineAttrValue({
				pageNum
			}));
			await Taro.navigateTo({
				url: pageCurrentList[9]
			});
		}
	}
})
class User extends Component {
	constructor(props) {
		super(props);
	}

	static options = {
		addGlobalClass: true
	};

	config = {
		navigationBarTitleText: '我'
	};

	state = {
		//是否显示正在加载loading页面......
		loading: true,
		//是否显示主要内容
		isShow: true,
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
	}

	async componentDidShow() {
		const {userTinyHomeInfoHandler} = this.props;
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
		userTinyHomeInfoHandler.apply(this);
		await Taro.showShareMenu({
			withShareTicket: false
		});
	}

	/**
	 * 监听用户点击页面内转发按钮或右上角菜单“转发”按钮的行为，并自定义转发内容。
	 * @param from
	 * @param target
	 * @param webViewUrl
	 */
	onShareAppMessage({from, target, webViewUrl}) {
	}

	componentWillReceiveProps(nextProps) {
	}

	/**
	 * 获取用户授权的个人信息(昵称跟头像),并进行保存
	 * @尹文楷
	 */
	getUserInfo = (res = {}) => {
		const {
			getUserInfoHub = () => {
			}
		} = this;
		Taro.getUserProfile({
			lang: 'zh_CN',
			desc: needUserInfoDesc,
			success: (res = {}) => {
				getUserInfoHub({detail: {...res}});
			},
			fail: (res = {}) => {
				getUserInfoHub(res);
			},
			complete: (res = {}) => {
			}
		});
	};

	/**
	 * 获取用户授权的个人信息(昵称跟头像),并进行保存集中处理部分
	 * @尹文楷
	 */
	getUserInfoHub = (res = {}) => {
		const {getUserInfoSettingHandler} = this.props;
		const {detail = {}} = res;
		let userInfo = detail && detail.userInfo,
			encryptedData = detail && detail.encryptedData,
			rawData = detail && detail.rawData,
			signature = detail && detail.signature,
			iv = detail && detail.iv;
		if (userInfo) {
			userInfo = {
				...userInfo,
				encryptedData,
				rawData,
				signature,
				iv
			};
			getUserInfoSettingHandler.apply(this, [userInfo]);
			mta.Event.stat('user_authorization', {});
		}
	};

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

	render() {
		const {
			homeStore,
			userStore,
			changeCurrentHandler
		} = this.props;
		const {
			getUserInfo = () => {
			},
			getNeedUpdate = () => {
			}
		} = this;
		const {
			tabBarTabList = [],
			isShow = true,
			loading = true
		} = this.state;
		const {current} = homeStore;
		const {nickName = '', avatar = '', hasMessage = false, opList = []} = userStore;
		const contact = opList[0];
		const funcs = opList.slice(1);
		return (
			<Block>
				{
					loading && <LoadingView
						size={56}
						color='#fb2a5d'
						className='pet-me-loading'
						content={loadingStatus.progress.text}
					/>
				}
				{
					isShow ? <View className='pet-me'>
						<View className={cns(
							'pet-me-information'
						)}>
							<LdmUserInfo
								type='userInfo'
								visible={true}
								text=''
								callBack={(res = {}) => {
								}}
								done={(res) => {
								}}
								renderButtonDetail={
									<Button
										className={cns('at-row',
											'pet-me-information-getPermission-button'
										)}
										lang='zh_CN'
										onClick={async (e = {}) => {
											const {data: isNeedUpdate = true} = await userAPI.getNeedUpdateUserInfo();
											if (isNeedUpdate) {
												getUserInfo();
											}
											//取消冒泡事件
											e.stopPropagation();
										}}
									>
										<AtAvatar
											className='pet-me-information-avatar'
											size='large'
											circle
											image={avatar}
										/>
										<View className={cns('at-col-7',
											'pet-me-information-nickname'
										)}>
											{nickName}
										</View>
										<View className={cns('at-col-2',
											'pet-me-information-detail'
										)}>
											<AtIcon
												className='pet-me-information-detail-button'
												prefixClass='iconfont'
												value='petPlanet-right'
												color='#DFDFDF'
												size={18}
											/>
										</View>
									</Button>
								}
							/>
						</View>
						<View className={cns('at-col',
							'pet-me-information',
							'pet-me-information-margin',
							'pet-me-information-nowrap'
						)}>
							{
								constants.meInfoConfig && constants.meInfoConfig.length > 0 && constants.meInfoConfig.map((item, index) => {
									return (
										<View
											key={item.id}
											className={cns('at-row',
												'pet-me-information-info',
												'at-row__align--center'
											)}
											onClick={(e) => {
												item.onClick.apply(this, [e]);
											}}
										>
											<View className={cns('at-col',
												'at-col-1',
												'at-col--auto',
												'pet-me-item-icon-wrap'
											)}>
												<Image
													mode='aspectFit'
													className={cns(
														'pet-me-item-icon',
														{
															'pet-me-item-icon-shoppingChart': !!item.shoppingChart
														}
													)}
													src={item.imgs || funcs[index]['picUrl']}
												/>
											</View>
											<View className='at-col'>
												{item.name}
												{
													item.message && hasMessage && <View className='at-badge__dot'/>
												}
											</View>
											<View className={cns('at-col-2',
												'pet-me-information-info-detail'
											)}>
												<AtIcon
													className='pet-me-information-info-detail-button'
													prefixClass='iconfont'
													value='petPlanet-right'
													color='#DFDFDF'
													size={18}
												/>
											</View>
										</View>
									)
								})
							}
						</View>
						<View className={cns('at-col',
							'pet-me-information',
							'pet-me-information-nowrap'
						)}>
							<Button
								openType='contact'
								className='pet-me-information-contact at-row'
								full
							>
								<View className={cns('at-col',
									'at-col-1',
									'at-col--auto',
									'pet-me-item-icon-wrap'
								)}>
									<Image
										mode='aspectFit'
										className='pet-me-item-icon'
										src={contact['picUrl']}
									/>
								</View>
								<View className={cns('at-col',
									'pet-me-information-contact-txt'
								)}>
									联系客服
								</View>
							</Button>
						</View>
					</View> : <EmptyView
						title='啊哦~~~'
						description='关于我的信息敬请期待'
						size={48}
						color='#000'
						icon='petPlanet-cat-ao'
						prefix='iconfont'
					/>
				}
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

export default User;
