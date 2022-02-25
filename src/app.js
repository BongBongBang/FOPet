import '@tarojs/async-await';
import Taro, {Component} from '@tarojs/taro';
import {Provider} from '@tarojs/redux';
import mta from "mta-wechat-analysis";
import Tools from "./utils/petPlanetTools";
import Index from './pages/index';
import User from './pages/user';
import Publish from './pages/publish';
import Detail from './pages/detail';
import Collection from './pages/collection';
import PublishMine from './pages/publishMine';
import store from './store';
import {setAttrValue} from "./actions/home";
import {homeAPI} from "./services";
import 'taro-ui/dist/weapp/css/index.css';
import './stylesheets/index.less';


class App extends Component {

  config = {
    pages: [
      'pages/index/index',
      'pages/user/index',
      'pages/publish/index',
      'pages/detail/index',
      'pages/collection/index',
      'pages/publishMine/index'
    ],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: 'WeChat',
      navigationBarTextStyle: 'black'
    },
    permission: {
      "scope.userLocation": {
        desc: "你的位置信息将用于小程序位置接口的效果展示"
      }
    }
  };

  async componentDidMount() {
    await store.dispatch(setAttrValue({
      loginSessionStatus: true
    }));
    await Tools.mtaAppInit.apply(this);
    //调用接口获取登录凭证（code）。通过凭证进而换取用户登录态信息，包括用户的唯一标识（openid）及本次登录的会话密钥（session_key）等。用户数据的加解密通讯需要依赖会话密钥完成
    await store.dispatch(homeAPI.getLoginSession.apply(this));
  }

  async componentDidShow() {
    let {homeStore} = store.getState();
    let {loginSessionStatus} = homeStore;
    if (!loginSessionStatus) {
      await store.dispatch(homeAPI.getUserOpenId.call(this, function (data, header) {
        Tools.mtaAppInit.apply(this);
      }));
    }
  }

  componentDidHide() {
  }

  componentCatchError() {
  }

  componentDidCatchError() {
  }

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render() {
    return (
      <Provider store={store}>
        <Index />
        <User />
        <Publish />
        <Detail />
        <Collection />
        <PublishMine />
      </Provider>
    )
  }
}

Taro.render(<App />, document.querySelector("#app"));
