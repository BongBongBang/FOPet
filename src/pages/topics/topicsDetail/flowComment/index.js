import React, {Component} from 'react';
import Taro, {Current} from '@tarojs/taro';
import {connect} from 'react-redux';
import {
  ScrollView,
  Text,
  View
} from '@tarojs/components';
import {
  AtAvatar
} from 'taro-ui';
import cns from 'classnames';
import dayjs from 'dayjs';
import {
  LdmInputPanel
} from 'ldm-taro-frc';

import {LoadingView} from '../../../../components/bussiness-components';
import flowCommentAPI from './flowComment_service';
import Tools from '../../../../utils/petPlanetTools';
import * as constants from './constants';
import {loadingStatus} from '../../../../constants';

import './index.scss';

@connect((state, ownProps) => {
  return {};
}, (dispatch, ownProps) => {
  return {};
})
class FlowComment extends Component {
  state = {
    //添加loading......加载中
    loading: false,
    //评论的id
    commId: null,
    //某条post的id
    postId: null,
    //评论记录列表当前所在页数
    pageNum: 1,
    //评论记录列表每页显示的条数
    pageSize: 10,
    //评论记录列表总共条数
    total: 0,
    //是否输入评论框聚焦
    isFocus: false,
    //是否存在弹出面板浮层
    isPanel: false,
    //面板浮层高度
    panelHeight: 0,
    //输入框当前值
    flowCommentsValue: null,
    //评论记录列表
    subCommentList: [],
    //滚动条滚动顶部的距离
    scrollTop: 0,
  };

  constructor(props) {
    super(props);
    //是否继续请求下一页的数据
    this.isPageNext = true
  }

  componentDidMount() {
    const {params: {id, postId}} = Current.router;
    this.setState({
      commId: id,
      postId
    }, () => {
      const that = this;
      Tools.run(function* () {
        yield flowCommentAPI.getComments.call(that);
      });
    });
  }

  componentWillUnmount() {
    this.setState({
      flowCommentsValue: null,
      commId: null,
      subCommentList: [],
      pageNum: 1,
      pageSize: 10,
      total: 0
    });
  }

  /**
   * 输入框值改变时触发的事件
   * @param val
   */
  onChangeValueHandler = (val) => {
    val = val.target ? val.target.value : val;
    this.setState({
      flowCommentsValue: val
    });
  };

  /**
   * 校验评论的内容
   */
  verifyPostMessage = () => {
    const {flowCommentsValue} = this.state;
    return Tools.addRules([
      flowCommentsValue
    ], [{
      rule: 'isEmpty',
      errMsg: constants.verify.isEmpty
    }]).execute();
  };

  /**
   * 输入框聚焦时触发
   * @尹文楷
   */
  onFocusHandler = (value) => {
    this.setState({
      isFocus: true,
      isPanel: false
    });
  };

  /**
   * 输入框失焦时触发
   * @尹文楷
   */
  onBlurHandler = (event) => {
    const {isPanel} = this.state;
    let new_state = Object.assign({}, {isFocus: false}, isPanel ? {} : {inputDistanceBoard: 0});
    this.setState(new_state);
  };

  /**
   * 发送评论
   * @param event
   */
  onPostMessageHandler = (event) => {
    const {verifyPostMessage} = this;
    if (verifyPostMessage()) {
      this.setState({
        loading: true
      });
      flowCommentAPI.flowPostCommentRequest.call(this);
    }
  };

  /**
   * 监听键盘高度发生变化的时候触发此事件
   */
  onKeyboardChangeHandler = (height = 0) => {
    this.setState({
      inputDistanceBoard: height
    });
  };

  /**
   * 当scrollview区域滚动至底部还剩5%时,触发分页
   */
  onFlowCommentScrollHandler = ({detail: {scrollTop = 0, scrollHeight = 0}}) => {
    const {isPageNext} = this;
    const {total, subCommentList: {length}} = this.state;
    Taro.createSelectorQuery().select('#pet-flowComments-scrollView').fields({
      size: true
    }, res => {
      const {height} = res;
      const that = this;
      if (((scrollHeight - scrollTop - height) / scrollHeight < .02) && isPageNext && (length < total)) {
        this.isPageNext = false;
        Tools.run(function* () {
          yield flowCommentAPI.getComments.call(that);
        });
      }
    }).exec();
  };

  render() {
    const {
      flowCommentsValue,
      isFocus,
      subCommentList,
      avatarFrom,
      content,
      createTime,
      nickNameFrom,
      inputDistanceBoard,
      scrollTop,
      loading
    } = this.state;
    const {
      onChangeValueHandler,
      onFlowCommentScrollHandler,
      onFocusHandler,
      onBlurHandler,
      onKeyboardChangeHandler,
      onPostMessageHandler
    } = this;
    return (
      <View className='pet-flowComments'>
        {
          loading && <LoadingView
            size={56}
            color='#fb2a5d'
            className='pet-flowComments-loading'
            content={loadingStatus.progress.text}
          />
        }
        <ScrollView className='pet-flowComments-scrollView'
                    id='pet-flowComments-scrollView'
                    onScroll={onFlowCommentScrollHandler}
                    scrollTop={scrollTop}
                    scrollY
        >
          <View id='pet-flowComments-oq'>
            <View className='pet-flowComments-container'>
              <View className='pet-flowComments-os'>
                <AtAvatar
                  className='pet-flowComments-os-avatar'
                  circle
                  size='large'
                  image={avatarFrom}
                />
                <View
                  className='pet-flowComments-os-content'
                >
                  <View
                    className='pet-flowComments-os-content-username'
                  >
                    <Text
                      decode
                    >
                      {nickNameFrom}
                    </Text>
                  </View>
                  <Text
                    className='pet-flowComments-os-content-time'
                  >
                    {createTime ? dayjs(createTime, 'YYYY-MM-DDTHH:mm:ss.000ZZ').fromNow() : ''}
                  </Text>
                </View>
              </View>
              <View
                className='pet-flowComments-qs'
              >
                <Text className='pet-flowComments-qs-content'>
                  {content}
                </Text>
              </View>
            </View>
            <View
              className='pet-flowComments-qsContainer'
            >
              {
                subCommentList.length > 0 && subCommentList.map((flowCommentItem, flowCommentIndex) => {
                  return (
                    <View
                      key={`${flowCommentItem['id']}`}
                      className='pet-flowComments-item'
                    >
                      <AtAvatar
                        className='pet-flowComments-item-avatar'
                        circle
                        size='normal'
                        image={flowCommentItem['avatarFrom']}
                      />
                      <View
                        className='pet-flowComments-item-content'
                      >
                        <View
                          className='pet-flowComments-item-content-username'
                        >
                          <Text
                            decode
                          >
                            {flowCommentItem['nicknameFrom']}
                          </Text>
                        </View>
                        <View
                          className='pet-flowComments-item-content-time'
                        >
                          <Text
                            decode
                          >
                            {flowCommentItem['createTime'] ? dayjs(flowCommentItem['createTime'], 'YYYY-MM-DDTHH:mm:ss.000ZZ').fromNow() : ''}
                          </Text>
                        </View>
                        <View
                          className={cns(
                            'pet-flowComments-item-content-txt',
                            {'grey': flowCommentItem['owner']}
                          )}
                        >
                          <Text>
                            {flowCommentItem['content']}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })
              }
            </View>
          </View>
        </ScrollView>
        <View className='pet-flowComments-flowCommentsBar'>
          <LdmInputPanel
            hasPanel={false}
            placeholder='输入进行评论'
            inputDistanceBoard={inputDistanceBoard}
            isPanel={false}
            isFocus={isFocus}
            value={flowCommentsValue}
            onChange={onChangeValueHandler}
            onConfirm={onPostMessageHandler}
            onFocus={onFocusHandler}
            onBlur={onBlurHandler}
            onKeyboardChange={onKeyboardChangeHandler}
          />
        </View>
      </View>
    );
  }
}

export default FlowComment;
