import Taro, {Component} from '@tarojs/taro';
import {connect} from '@tarojs/redux';
import {
  Text,
  View
} from '@tarojs/components';
import {
  AtAvatar,
  AtButton
} from 'taro-ui';
import {
  LdmNavBar
} from 'ldm-taro-frc';

import {imgs} from '../../../assets';

import './index.less';
import 'taro-ui/dist/style/components/avatar.scss';
import 'taro-ui/dist/style/components/button.scss';

@connect(state => {
  return {}
}, dispatch => {
  return {};
})
class ResultPage extends Component {

  constructor() {
    super(...arguments);
    this.intervalMachine = null;
  }

  static options = {
    addGlobalClass: true
  };

  config = {
    navigationBarTitleText: '结果页',
    navigationStyle: 'custom'
  };

  state = {
    //结果页的标题
    resultTitle: '',
    //结果页的内容
    resultContent: '',
    //结果页即将自动跳转页面的名称
    resultName: '',
    interval: 5,
    //要跳转到的页面
    url: ''
  };

  componentWillMount() {
    const {params: {title = '', content = '', name = '', url = ''}} = this.$router;
    console.log(title, content, name, url);
    this.setState({
      resultTitle: title,
      resultContent: content,
      resultName: name,
      url
    });
  }

  componentDidMount() {
    let {interval = 5, url = ''} = this.state;
    this.intervalMachine = setInterval(() => {
      if (this.state.interval === 0) {
        clearInterval(this.intervalMachine);
        this.intervalMachine = null;
        Taro.redirectTo({
          url
        });
      } else {
        this.setState({
          interval: --interval
        });
      }
    }, 1000);
  }

  componentWillUnmount() {
    this.setState({
      interval: 5
    });
  }

  /**
   * 跳转到会话页面
   * @param e
   */
  onDirectToMessagePage = (e) => {
    const {url = ''} = this.state;
    clearInterval(this.intervalMachine);
    this.intervalMachine = null;
    Taro.redirectTo({
      url
    });
    //取消冒泡
    e.stopPropagation();
  };

  render() {
    const {
      interval = 5,
      resultContent = '',
      resultName = '',
      resultTitle = ''
    } = this.state;
    const {
      onDirectToMessagePage = () => {
      }
    } = this;
    return (
      <View>
        <LdmNavBar
          color='#000'
          title={resultTitle}
          imgs=''
          className='result-page-navBar'
        />
        <View className='icon-container'>
          <AtAvatar
            className='icon'
            circle size='large'
            image={imgs.success}
          />
          <View className='title'>成功</View>
          <Text className='redirect'>
            {interval}s后跳转到{resultName}
          </Text>
          <AtButton
            size='small'
            className='redirect-page-button'
            onClick={onDirectToMessagePage}
          >
            {resultContent}
          </AtButton>
        </View>
      </View>
    );
  }
}

export default ResultPage;
