import '@tarojs/async-await';
import Taro, {Component} from '@tarojs/taro';
import {Provider} from '@tarojs/redux';

import Index from './pages/index';
import User from './pages/user';

import store from './store';

import 'taro-ui/dist/weapp/css/index.css';

import './stylesheets/index.less';


class App extends Component {

  config = {
    pages: [
      'pages/index/index',
      'pages/user/index'
    ],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: 'WeChat',
      navigationBarTextStyle: 'black'
    }
  };

  componentDidMount() {
  }

  componentDidShow() {
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
      </Provider>
    )
  }
}

Taro.render(<App />, document.querySelector("#app"));
