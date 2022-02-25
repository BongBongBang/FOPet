import Taro, {Component} from "@tarojs/taro";
import {connect} from "@tarojs/redux";
import {
  Image,
  ScrollView,
  Text,
  View
} from "@tarojs/components";
import {
  AtAvatar,
  AtButton,
  AtForm,
  AtImagePicker,
  AtInput,
  AtMessage
} from "taro-ui";
import cns from "classnames";
import moment from "moment";

import {communicationsAPI} from "../../services";
import Tools from "../../utils/petPlanetTools";
import {
  LoadingView
} from "../../components/bussiness-components";
import * as constants from "./constants";

import "./index.less";
import "./loading-view.less";

Tools.getMomentConfig(moment);

@connect((state, ownProps) => {
  return {
    communicationsStore: state.communicationsStore
  };
}, (dispatch, ownProps) => {
  return {};
})
class Communications extends Component {
  static options = {
    addGlobalClass: true
  };

  config = {
    navigationBarTitleText: "对话记录"
  };

  constructor(props) {
    super(props);
    //是否继续请求下一页的数据
    this.isPageNext = true
  }


  state = {
    //对话记录列表当前所在页数
    pageNum: 1,
    //对话记录列表每页显示的条数
    pageSize: 30,
    //对话记录列表总共条数
    total: 0,
    //输入框当前值
    communicationsValue: "",
    //是否输入咨询框聚焦
    isFocus: false,
    //获取手机键盘的高度转变为输入框底部的距离
    inputDistanceBoard: 0,
    //对话记录列表
    communicationsList: [],
    //对话记录针对的问题
    communicationsOS: {},
    //滚动条滚动顶部的距离
    scrollTop: 0,
    //是否显示正在加载loading页面......
    loading: false
  };

  componentDidMount() {
    communicationsAPI.getCommunicationsList.call(this);
  }

  componentWillUnmount() {
    this.setState({
      communicationsValue: "",
      communicationsList: [],
      pageNum: 1,
      pageSize: 10,
    });
  }

  /**
   * 输入框值改变时触发的事件
   * @param val
   */
  onChangeValueHandler = (val) => {
    val = val.target ? val.target.value : val;
    this.setState({
      communicationsValue: val
    });
  };

  /**
   * 输入框聚焦时触发
   * @尹文楷
   */
  onFocusHandler = (value, event) => {
    const {currentTarget: {height = 0}} = event || {};
    this.setState({
      isFocus: true,
      inputDistanceBoard: height
    });
  };

  /**
   * 输入框失焦时触发
   * @尹文楷
   */
  onBlurHandler = (event) => {
    this.setState({
      isFocus: false,
      inputDistanceBoard: 0
    });
  };

  /**
   * 校验咨询的内容
   */
  verifyPostMessage = () => {
    const {communicationsValue} = this.state;
    return Tools.addRules([
      communicationsValue
    ], [{
      rule: 'isEmpty',
      errMsg: constants.verify.isEmpty
    }]).execute();
  };

  /**
   * 输入进行咨询
   * @尹文楷
   */
  onPostMessageHandler = () => {
    const {verifyPostMessage} = this;
    if (verifyPostMessage()) {
      this.setState({
        loading: true
      });
      communicationsAPI.postConsultMessage.call(this);
    }
  };

  onSubmitHandler = (event) => {
    const {onPostMessageHandler} = this;
    communicationsAPI.getFormIdRequest(event.target.formId);
    onPostMessageHandler();
  };

  /**
   * 点击图片放大查看
   */
  onImagePreviewHandler = index => {
    const {communicationsOS} = this.state;
    const {imgs = []} = communicationsOS;
    Tools.previewImageConfig({
      current: imgs[index],
      urls: imgs,
      success: (res) => {
        console.log(res);
      },
      fail: (res) => {
        console.log(res);
      },
      complete: (res) => {
        console.log(res);
      }
    });
  };

  /**
   * 当scrollview区域滚动至底部还剩5%时,触发分页
   */
  onCommunicationScrollHandler = ({detail: {scrollTop = 0, scrollHeight = 0}}) => {
    const {isPageNext} = this;
    const that = this;
    Taro.createSelectorQuery().select('#pet-communications-scrollView').fields({
      size: true
    }, res => {
      const {height} = res;
      if (((scrollHeight - scrollTop - height) / scrollHeight < .05) && isPageNext) {
        this.isPageNext = false;
        Tools.run(function* () {
          yield communicationsAPI.getCommunicationsPaginationList.call(that);
        });
      }
    }).exec();
  };


  render() {
    const {
      communicationsValue,
      isFocus,
      communicationsList,
      communicationsOS,
      inputDistanceBoard,
      scrollTop,
      loading
    } = this.state;
    const {
      onChangeValueHandler,
      onFocusHandler,
      onBlurHandler,
      onPostMessageHandler,
      onSubmitHandler,
      onImagePreviewHandler,
      onCommunicationScrollHandler
    } = this;
    let showImgs = [];
    const {imgs} = communicationsOS;
    if (imgs) {
      showImgs = imgs.map(item => {
        return {
          url: item
        };
      });
    }
    return (
      <View className='pet-communications'>
        <AtMessage />
        {
          loading && <LoadingView
            size={56}
            color='#fb2a5d'
            className='pet-communications-loading'
            content={constants.loading.text}
          />
        }
        <ScrollView className='pet-communications-scrollView'
                    id='pet-communications-scrollView'
                    onScroll={onCommunicationScrollHandler}
                    scrollTop={scrollTop}
                    scrollY
        >
          <View id='pet-communications-oq'>
            <View className='pet-communications-container'>
              <View className='pet-communications-os'>
                <AtAvatar
                  className='pet-communications-os-avatar'
                  circle
                  size='large'
                  image={communicationsOS['cnsltAvatarUrl']}
                />
                <View
                  className='pet-communications-os-content'
                >
                  <View
                    className='pet-communications-os-content-username'
                  >
                    <Text
                      decode
                    >
                      {communicationsOS["cnsltUsername"]}
                    </Text>
                  </View>
                  <Text
                    className='pet-communications-os-content-time'
                  >
                    {moment(communicationsOS["createTime"]).fromNow()}
                  </Text>
                  <Text
                    className='pet-communications-os-content-master'
                  >
                    咨询提问
                  </Text>
                </View>
              </View>
              <View
                className='pet-communications-qs'
              >
                <Text className='pet-communications-qs-content'>
                  {communicationsOS["problemContent"]}
                </Text>
                <View className='pet-communications-qs-imgArea'>
                  {
                    imgs && imgs.length > 0 ? (imgs.length > 1 ? <AtImagePicker
                      className='pet-communications-qs-imgArea-multiple'
                      length={3}
                      showAddBtn={false}
                      onImageClick={onImagePreviewHandler}
                      files={showImgs}
                    /> : <Image className='pet-communications-qs-imgArea-single'
                                mode='aspectFill'
                                src={imgs[0]}
                    />) : null
                  }
                </View>
              </View>
            </View>
            <View
              className='pet-communications-qsContainer'
            >
              {
                communicationsList.length > 0 && communicationsList.map((communicationItem, communicationIndex) => {
                  return (
                    <View
                      key={`${communicationItem['id']}`}
                      className='pet-communications-item'
                    >
                      <AtAvatar
                        className='pet-communications-item-avatar'
                        circle
                        size='normal'
                        image={communicationItem['avatarFrom']}
                      />
                      <View
                        className='pet-communications-item-content'
                      >
                        <View
                          className='pet-communications-item-content-username'
                        >
                          <Text
                            decode
                          >
                            {communicationItem['nicknameFrom']}
                          </Text>
                        </View>
                        <View
                          className='pet-communications-item-content-time'
                        >
                          <Text
                            decode
                          >
                            {moment(communicationItem["createTime"]).fromNow()}
                          </Text>
                        </View>
                        <View
                          className={`pet-communications-item-content-txt ${communicationItem["owner"] ? "grey" : null}`}
                        >
                          <Text>
                            {communicationItem["content"]}
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
          className='at-row at-row--no-wrap pet-communications-communicationsBar'
          style={{bottom: `${inputDistanceBoard}px`}}
        >
          <View className='at-col-10 pet-communications-communicationsBar-input'>
            <AtInput
              type='text'
              maxLength={100}
              className={cns(
                'pet-communications-communicationsBar-communicationsValue',
                {'pet-communications-communicationsBar-communicationsValue-focus': !!isFocus}
              )}
              placeholder={constants.communicationsBar.input.placeholder}
              adjustPosition={false}
              value={communicationsValue}
              onChange={onChangeValueHandler}
              onFocus={onFocusHandler}
              onBlur={onBlurHandler}
              onConfirm={onPostMessageHandler}
            />
          </View>
          <View className='at-col-2 pet-communications-communicationsBar-post'>
            {/*按钮发布区域: 使用formId进行发起一次有formId的模板消息请求*/}
            <AtForm
              reportSubmit={true}
              style='border:none'
              className='next-btn'
              onSubmit={onSubmitHandler}
            >
              <AtButton
                size='small'
                className='pet-communications-communicationsBar-post-button'
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

export default Communications;
