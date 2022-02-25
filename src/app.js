import React, {Component} from 'react';
import Taro from '@tarojs/taro';
import {Provider} from 'react-redux';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import 'dayjs/locale/zh-cn';
import Tools from './utils/petPlanetTools';

import store from './store';
import {setAttrValue} from './pages/index/home_action';

import './stylesheets/index.scss';

dayjs.locale('zh-cn');
dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);


class App extends Component {
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
        {this.props.children}
      </Provider>
    )
  }
}

export default App;
