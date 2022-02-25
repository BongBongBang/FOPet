import Taro, {Component} from "@tarojs/taro";
import {View} from "@tarojs/components";
import {AtTabBar, AtAvatar, AtIcon} from "taro-ui";
import {connect} from "@tarojs/redux";
import {changeCurrent} from "../../actions/home";
import {tabBarTabList, pageCurrentList} from "../../utils/static";

import "./iconfont/iconfont.less";
import "./user.less";

@connect((state) => {
  return {
    ...state,
    homeStore: state.homeStore
  }
}, (dispatch) => {
  return {
    changeCurrentHandler(value) {
      dispatch(changeCurrent({current: value}));
      Taro.redirectTo({
        url: pageCurrentList[`${value}`]
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
    navigationBarTitleText: "我"
  };

  componentDidMount() {

  }

  componentWillReceiveProps(nextProps) {

  }

  render() {
    const {homeStore, changeCurrentHandler} = this.props;
    const {current} = homeStore;
    return (
      <View className='pet-me'>
        <View className='at-row pet-me-information'>
          <AtAvatar className='pet-me-information-avatar' size='large' circle openData={{type: 'userAvatarUrl'}} />
          <open-data type='userNickName' class='at-col-7 pet-me-information-nickname'>

          </open-data>
          <View className='at-col-2 pet-me-information-detail'>
            <AtIcon className='pet-me-information-detail-button'
                    prefixClass='iconfont'
                    value='petPlanet-right'
                    color='#c8c8c8'
                    size={18}
            />
          </View>
        </View>
        <View className='at-row at-row--wrap pet-me-information pet-me-information-nowrap'>
          <View className='at-row pet-me-information-publish'>
            <View className='at-col-9'>
              我的收藏
            </View>
            <View className='at-col-3 pet-me-information-publish-detail'>
              <AtIcon className='pet-me-information-publish-detail-button'
                      prefixClass='iconfont'
                      value='petPlanet-right'
                      color='#c8c8c8'
                      size={18}
              />
            </View>
          </View>
          <View className='at-row pet-me-information-like'>
            <View className='at-col-9'>
              我的关注
            </View>
            <View className='at-col-3 pet-me-information-like-detail'>
              <AtIcon className='pet-me-information-like-detail-button'
                      prefixClass='iconfont'
                      value='petPlanet-right'
                      color='#c8c8c8'
                      size={18}
              />
            </View>
          </View>
        </View>
        <AtTabBar
          fixed
          current={current}
          tabList={tabBarTabList}
          onClick={changeCurrentHandler}
        />
      </View>
    )
  }
}

export default User;
