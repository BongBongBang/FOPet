import '@tarojs/async-await';
import Taro, {Component} from '@tarojs/taro';
import {Provider} from '@tarojs/redux';
import Tools from './utils/petPlanetTools';
import Topic from './pages/topics';
import Index from './pages/index';
import MedicalAdvice from './pages/medicalAdvice';
import Message from './pages/message';
import User from './pages/user';
import Publish from './pages/publish';
import Detail from './pages/detail';
import ShareDetail from './pages/shareDetail';
import Collection from './pages/collection';
import PublishMine from './pages/publishMine';
import Attendance from './pages/attendance';
import Communications from './pages/communications';
import MedicalConsult from './pages/medicalConsult';
import MedicalDoctor from './pages/medicalDoctor';
import ResultPage from './pages/resultPage';
import SelfObd from './pages/selfObd';
import Disease from './pages/disease';
import DiseaseDetail from './pages/diseaseDetail';
import FlowTopics from './pages/flowTopics';
import FlowComment from './pages/flowComment';
import FlowPublish from "./pages/flowPublish";
import TopicsDetail from "./pages/topicsDetail";
import Scope from "./pages/scope";
import FindTopics from "./pages/findTopics";
import store from './store';
import {setAttrValue} from "./pages/index/home_action";
import homeAPI from "./pages/index/home_service";

import 'taro-ui/dist/weapp/css/index.css';
import './stylesheets/index.less';


class App extends Component {

  config = {
    pages: [
      'pages/topics/index',
      'pages/index/index',
      'pages/medicalAdvice/index',
      'pages/user/index',
      'pages/message/index',
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
      "pages/diseaseDetail/index",
      "pages/flowTopics/index",
      "pages/topicsDetail/index",
      "pages/scope/index",
      "pages/flowComment/index",
      "pages/flowPublish/index",
      "pages/findTopics/index"
    ],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: 'WeChat',
      navigationBarTextStyle: 'black',
      navigationStyle: 'default'
    },
    permission: {
      'scope.userLocation': {
        desc: '你的位置信息将用于小程序位置接口的效果展示'
      }
    }
  };

  constructor(props) {
    super(props);
  }

  async componentDidMount() {
    await store.dispatch(setAttrValue({
      loginSessionStatus: true
    }));
    Tools.mtaAppInit.apply(this);
  }

  async componentDidShow() {
    let {homeStore} = store.getState();
    let {loginSessionStatus} = homeStore;
    //调用接口获取登录凭证（code）。通过凭证进而换取用户登录态信息，包括用户的唯一标识（openid）及本次登录的会话密钥（session_key）等。用户数据的加解密通讯需要依赖会话密钥完成
    const {code} = await store.dispatch(homeAPI.getLoginSession.apply(this));
    /**
     * 登录,将微信与后台服务器绑定,建立会话
     */
    await store.dispatch(homeAPI.getLoginCookie.call(this, code));
    if (!loginSessionStatus) {
      await store.dispatch(homeAPI.getUserOpenId.call(this, function (data, header) {
        Tools.mtaAppInit.apply(this);
      }));
    }
    homeAPI.checkVersionRequest();
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
        <Topic />
        <Index/>
        <MedicalAdvice/>
        <Message/>
        <User/>
        <Publish/>
        <Detail/>
        <ShareDetail/>
        <Collection/>
        <PublishMine/>
        <Attendance/>
        <Communications/>
        <MedicalConsult/>
        <MedicalDoctor/>
        <ResultPage/>
        <SelfObd/>
        <Disease/>
        <DiseaseDetail/>
        <FlowTopics/>
        <TopicsDetail />
        <FlowComment/>
        <Scope />
        <FlowPublish />
        <FindTopics />
      </Provider>
    )
  }
}

Taro.render(<App/>, document.querySelector('#app'));
