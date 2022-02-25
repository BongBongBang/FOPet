import React, {Component} from 'react';
import Taro, {Current} from '@tarojs/taro';
import {connect} from 'react-redux';
import {
  Text,
  View
} from '@tarojs/components';
import {
  LdmNavBar
} from 'ldm-taro-frc';
import {imgs} from '../../../../../assets';

import './index.scss';

/**
 * 协议
 */
@connect((state) => {
  return {
    agreementStore: state.agreementStore
  };
}, (dispatch) => {
  return {};
})
class Agreement extends Component {
  constructor(props) {
    super(props);
  }

  state = {
    //头部标题栏标题
    title: null
  };

  componentWillMount() {
    const {params = {}} = Current.router;
    const {title = null} = params;
    this.setState({
      title: title || ''
    });
  }

  /**
   * 返回上一个页面
   */
  redirectToBackPage = (e) => {
    Taro.navigateBack({
      delta: 1
    });
    //取消冒泡
    e.stopPropagation();
  };

  render() {
    const {agreementStore} = this.props;
    const {title} = this.state;
    const {redirectToBackPage} = this;
    return (
      <View className='pet-agreement'>
        <LdmNavBar
          color='#000'
          title={title}
          imgs={imgs.back}
          className='pet-agreement-navBar'
          onClickLeftIcon={redirectToBackPage}
        />
        <View className='pet-agreement-container'>
          <Text decode
                className='pet-agreement-content'
          >
            {agreementStore.article}
          </Text>
        </View>
      </View>
    )
  }
}

export default Agreement;
