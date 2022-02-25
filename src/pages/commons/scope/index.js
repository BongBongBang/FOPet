import Taro, {Component} from '@tarojs/taro';
import {
  View
} from '@tarojs/components';
import {
  AtAvatar
} from 'taro-ui';
import {
  LdmUserInfo
} from 'ldm-taro-frc';
import topicsAPI from '../../topics/topics_service';

import 'taro-ui/dist/style/components/avatar.scss';

import './index.less';

class Scope extends Component {
  static options = {
    addGlobalClass: true
  };

  config = {
    navigationBarTitleText: '授权'
  };

  state = {
    //从哪一个页面跳转过来的标识符
    pages: null
  };

  componentWillMount() {
    const {params} = this.$router;
    this.setState({
      ...params
    });
  }

  /**
   * 获取用户信息
   * @尹文楷
   */
  getUserInfoHandler = (res = {}) => {
    const {detail = {}} = res;
    const {userInfo, iv, signature, rawData, encryptedData} = detail;
    if (userInfo) {
      const targetUserInfo = {
        ...userInfo,
        iv,
        signature,
        rawData,
        encryptedData
      };
      topicsAPI.syncUserInfo.call(this, targetUserInfo);
    }
  };

  render() {
    const {
      getUserInfoHandler = () => {
      }
    } = this;
    return (
      <View
        className='pet-scope'
      >
        <View className='pet-scope-container'>
          <AtAvatar
            size='large'
            circle
            image='https://prod-pet.oss.1jtec.com/icon/logo.png'
            className='pet-scope-avatar'
          />
          <View className='pet-scope-content'>
            给主子想要的
          </View>
        </View>
        <LdmUserInfo
          className='pet-scope-button'
          callBack={getUserInfoHandler}
          text='微信登录'
        />
      </View>
    )
  }
}

export default Scope;
