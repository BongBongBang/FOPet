import Taro, {Component} from '@tarojs/taro';
import PropTypes from 'prop-types';
import {
  View
} from '@tarojs/components';
import {
  AtButton,
  AtIcon
} from 'taro-ui';
import cns from 'classnames';

import PetPlanetTools from '../../../utils/petPlanetTools';

import 'taro-ui/dist/style/components/icon.scss';
import 'taro-ui/dist/style/components/button.scss';
import 'taro-ui/dist/style/components/loading.scss';

import '../../../pages/commons/iconfont/iconfont.less';
import './index.less';

class EmptyView extends Component {
  constructor(props) {
    super(props);
  }

  static options = {
    addGlobalClass: true
  };

  static propTypes = {
    //空页面标题
    title: PropTypes.string,
    //空页面描述
    description: PropTypes.string,
    //空页面按钮内容
    button: PropTypes.string,
    //空页面按钮触发的事件
    onClick: PropTypes.func,
    //外部传入样式表
    className: PropTypes.string,
    //传入的icon图标
    icon: PropTypes.string.isRequired,
    //传入的icon图标的颜色
    color: PropTypes.string,
    //传入的icon图标的大小
    size: PropTypes.number,
    //icon图标的前缀
    prefix: PropTypes.string.isRequired
  };

  state = {};

  render() {
    const {
      title = '',
      description = '',
      button = '',
      prefix = '',
      icon = '',
      color = '',
      size = 0,
      className = '',
      onClick = () => {
      }
    } = this.props;
    const {isX = false} = PetPlanetTools.adaptationNavBar();
    return <View className={cns(
      'empty',
      {
        'empty-adaption': !!isX
      },
      className
    )}>
      <AtIcon
        className='empty-icon'
        prefixClass={prefix}
        value={icon}
        color={color}
        size={size}
      />
      {
        title && <View className='empty-title'>
          {title}
        </View>
      }
      {
        description && <View className='empty-description'>
          {description}
        </View>
      }
      {
        button && <AtButton
          className='empty-button'
          size='small'
          onClick={onClick}
        >
          {button}
        </AtButton>
      }
    </View>
  }
}

export default EmptyView;
