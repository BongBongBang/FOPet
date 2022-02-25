import '@tarojs/async-await';
import Taro, {Component} from '@tarojs/taro';
import {Provider} from '@tarojs/redux';
import Tools from "./utils/petPlanetTools";
import Index from './pages/index';
import MedicalAdvice from './pages/medicalAdvice';
import Message from "./pages/message";
import User from './pages/user';
import Publish from './pages/publish';
import Detail from './pages/detail';
import ShareDetail from "./pages/shareDetail";
import Collection from './pages/collection';
import PublishMine from './pages/publishMine';
import Attendance from "./pages/attendance";
import Communications from "./pages/communications";
import MedicalConsult from './pages/medicalConsult';
import MedicalDoctor from './pages/medicalDoctor';
import ResultPage from './pages/resultPage';
import SelfObd from './pages/selfObd';
import Disease from './pages/disease';
import DiseaseDetail from "./pages/diseaseDetail";
import store from './store';
import {setAttrValue} from "./actions/home";
import {homeAPI} from "./services";
import 'taro-ui/dist/weapp/css/index.css';
import './stylesheets/index.less';


class App extends Component {

  config = {
    pages: [
      'pages/index/index',
      'pages/medicalAdvice/index',
      'pages/message/index',
      'pages/user/index',
      'pages/publish/index',
      'pages/detail/index',
      'pages/shareDetail/index',
      'pages/collection/index',
      'pages/publishMine/index',
      'pages/attendance/index',
      'pages/communications/index',
      "pages/medicalConsult/index",
      "pages/medicalDoctor/index",
      "pages/resultPage/index",
      "pages/selfObd/index",
      "pages/disease/index",
      "pages/diseaseDetail/index"
    ],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: 'WeChat',
      navigationBarTextStyle: 'black',
      navigationStyle: 'default'
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
    Tools.mtaAppInit.apply(this);
    //调用接口获取登录凭证（code）。通过凭证进而换取用户登录态信息，包括用户的唯一标识（openid）及本次登录的会话密钥（session_key）等。用户数据的加解密通讯需要依赖会话密钥完成
    await store.dispatch(homeAPI.getLoginSession.apply(this));
  }

  async componentDidShow() {
    let {homeStore} = store.getState();
    let {loginSessionStatus} = homeStore;
    const {query: {scene: opengid}} = this.$router.params;
    if (!loginSessionStatus) {
      await store.dispatch(homeAPI.getUserOpenId.call(this, function (data, header) {
        Tools.mtaAppInit.apply(this);
      }));
    }
    homeAPI.checkVersionRequest();
    let {data: tabBarInfo} = await homeAPI.getTabBarInfoRequest();
    Taro.setStorageSync("petPlanetParams", String(opengid));
    Taro.setStorageSync('petPlanetTabBarInfo', JSON.stringify(tabBarInfo));
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
        <MedicalAdvice />
        <Message />
        <User />
        <Publish />
        <Detail />
        <ShareDetail />
        <Collection />
        <PublishMine />
        <Attendance />
        <Communications />
        <MedicalConsult />
        <MedicalDoctor />
        <ResultPage />
        <SelfObd />
        <Disease />
        <DiseaseDetail />
      </Provider>
    )
  }
}

Taro.render(<App />, document.querySelector("#app"));
