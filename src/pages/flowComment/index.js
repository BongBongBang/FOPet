import Taro, {Component} from "@tarojs/taro";
import {connect} from "@tarojs/redux";
import {
  ScrollView,
  Text,
  View
} from "@tarojs/components";
import {
  AtAvatar,
  AtButton,
  AtForm,
  AtInput
} from "taro-ui";
import cns from "classnames";
import moment from "moment";

import {LoadingView} from "../../components/bussiness-components";
import flowCommentAPI from "./flowComment_service";
import Tools from "../../utils/petPlanetTools";
import * as constants from "./constants";

import "./loading-view.less";
import "./index.less";

Tools.getMomentConfig(moment);

@connect((state, ownProps) => {
  return {};
}, (dispatch, ownProps) => {
  return {};
})
class FlowComment extends Component {
  static options = {
    addGlobalClass: true
  };

  config = {
    navigationBarTitleText: "评论"
  };

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
    const {params: {id, postId}} = this.$router;
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

  onSubmitHandler = (event) => {
    const {verifyPostMessage} = this;
    if (verifyPostMessage()) {
      this.setState({
        loading: true
      });
      flowCommentAPI.getFormIdRequest(event.target.formId);
      flowCommentAPI.flowPostCommentRequest.call(this);
    }
  };

  /**
   * 当scrollview区域滚动至底部还剩5%时,触发分页
   */
  onFlowCommentScrollHandler = ({detail: {scrollTop = 0, scrollHeight = 0}}) => {
    const {isPageNext} = this;
    const that = this;
    const {total, subCommentList: {length}} = this.state;
    Taro.createSelectorQuery().select('#pet-flowComments-scrollView').fields({
      size: true
    }, res => {
      const {height} = res;
      if (((scrollHeight - scrollTop - height) / scrollHeight < .02) && isPageNext && (length < total)) {
        console.log('华东');
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
      onPostMessageHandler,
      onSubmitHandler
    } = this;
    return (
      <View className='pet-flowComments'>
        {
          loading && <LoadingView
            size={56}
            color='#fb2a5d'
            className='pet-flowComments-loading'
            content={constants.loading.text}
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
                    {moment(createTime).fromNow()}
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
                            {moment(flowCommentItem["createTime"]).fromNow()}
                          </Text>
                        </View>
                        <View
                          className={`pet-flowComments-item-content-txt ${flowCommentItem["owner"] ? "grey" : null}`}
                        >
                          <Text>
                            {flowCommentItem["content"]}
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
        <View
          className='at-row at-row--no-wrap pet-flowComments-flowCommentsBar'
          style={{bottom: `${inputDistanceBoard}px`}}
        >
          <View className='at-col-10 pet-flowComments-flowCommentsBar-input'>
            <AtInput
              type='text'
              maxLength={100}
              className={cns(
                'pet-flowComments-flowCommentsBar-flowCommentsValue',
                {'pet-flowComments-flowCommentsBar-flowCommentsValue-focus': !!isFocus}
              )}
              confirmType='发送'
              placeholder='输入进行咨询'
              adjustPosition={false}
              value={flowCommentsValue}
              onChange={onChangeValueHandler}
              onFocus={onFocusHandler}
              onBlur={onBlurHandler}
              onConfirm={onPostMessageHandler}
            />
          </View>
          <View className='at-col-2 pet-flowComments-flowCommentsBar-post'>
            {/*按钮发布区域: 使用formId进行发起一次有formId的模板消息请求*/}
            <AtForm
              reportSubmit={true}
              style='border:none'
              className='next-btn'
              onSubmit={onSubmitHandler}
            >
              <AtButton
                size='small'
                className='pet-flowComments-flowCommentsBar-post-button'
                formType='submit'
              >
                发送
              </AtButton>
            </AtForm>
          </View>
        </View>
      </View>
    );
  }
}

export default FlowComment;
