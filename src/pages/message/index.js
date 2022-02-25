import Taro, {Component} from "@tarojs/taro";
import {
  Block,
  ScrollView,
  Text,
  View
} from "@tarojs/components";
import {
  AtIcon,
  AtAvatar,
  AtBadge,
  AtButton,
  AtTag
} from "taro-ui";
import {connect} from "@tarojs/redux";
import moment from "moment";
import cns from "classnames";

import {LoadingView} from "../../components/bussiness-components";
import * as constants from "./constants";
import messageAPI from "./message_service";
import {setCommunicationsAttrValue} from "../communications/communications_action";
import Tools from "../../utils/petPlanetTools";
import {pageCurrentList, cnsltState} from "../../utils/static";

import "../iconfont/iconfont.less";
import "./index.less";
import "./loading-view.less";

Tools.getMomentConfig(moment);

@connect((state, ownProps) => {
  return {
    homeStore: state.homeStore,
    messageStore: state.messageStore,
    communicationsStore: state.communicationsStore
  };
}, (dispatch, ownProps) => {
  return {
    /**
     * 前往对话记录页面
     * @尹文楷
     */
    onCommunicationsPage({id, cnsltType, docUserId}, e) {
      const {consultationsList} = this.state;
      const consultationsItem = consultationsList.filter(item => item['id'] === id);
      consultationsItem.length > 0 && consultationsItem[0].hasMessage && (consultationsItem[0].hasMessage = false);
      this.setState({
        consultationsList
      });
      dispatch(setCommunicationsAttrValue({
        consultationsList,
        cnsltId: id,
        cnsltType,
        docId: docUserId
      }));
      Taro.navigateTo({
        url: pageCurrentList[11]
      });
      //清除冒泡事件
      e.stopPropagation();
    }
  };
})
class Message extends Component {
  static options = {
    addGlobalClass: true
  };

  config = {
    navigationBarTitleText: "会话",
    onReachBottomDistance: 188
  };

  state = {
    //咨询列表
    consultationsList: [],
    //是否是在接口请求响应加载中
    isLoading: true,
    //是否可以请求下一页
    isNext: false,
    //会话列表的页码
    pageNum: 1,
    //会话列表总共有多少条
    total: 0
  };

  componentDidMount() {
    messageAPI.cnsltConsultations.call(this);
  }

  componentDidShow() {
  }

  componentDidHide() {
  }

  /**
   * 点击会话列表项进入具体的交流会话页面
   * @param e
   */
  onDirectToMedicalAdvicePage = (e) => {
    Taro.redirectTo({
      url: pageCurrentList[2]
    });
    //取消冒泡
    e.stopPropagation();
  };

  /**
   * 当用户上拉触底时,获取会话页面咨询列表下一页的数据
   */
  messageScrollListener = (event) => {
    const {detail: {scrollHeight, scrollTop}} = event || {};
    const {total, consultationsList, isNext} = this.state;
    let domHeight = null;
    Taro.createSelectorQuery().select('#pet-message').fields({
      size: true
    }, res => {
      domHeight = res.height;
      const {length} = consultationsList;
      let {pageNum} = this.state;
      if ((((scrollHeight - domHeight - scrollTop) / scrollHeight) <= 0.2) && (length < total) && !isNext) {
        Tools.run(function* () {
          yield this.setState({
            isNext: true
          });
          const data = yield messageAPI.cnsltConsultationsPagination.call(this, ++pageNum);
          const {data: _data, total} = data;
          let consultationsEndList = [];
          consultationsEndList = [...consultationsList, ..._data];
          this.setState({
            consultationsList: consultationsEndList,
            isLoading: false,
            total,
            pageNum,
            isNext: false
          });
        }.bind(this));
      }
    }).exec();
  };

  render() {
    const {onCommunicationsPage} = this.props;
    const {onDirectToMedicalAdvicePage, messageScrollListener} = this;
    let {consultationsList, isLoading} = this.state;
    return (
      <Block>
        <ScrollView
          id='pet-message'
          scrollY
          className='pet-message'
          onScroll={messageScrollListener}
        >
          {
            isLoading && <LoadingView
              size={56}
              color='#fb2a5d'
              className='pet-message-activity-indicator'
              content={constants["loading"]["text"]}
            />
          }
          {
            consultationsList.length > 0 ? consultationsList.map(consultationItem => {
              return (
                <View
                  key={`${consultationItem["id"]}`}
                  className='pet-message-consultationsItem'
                  onClick={onCommunicationsPage.bind(this, consultationItem)}
                >
                  <AtBadge
                    dot={consultationItem["hasMessage"]}
                  >
                    <AtAvatar
                      className='pet-message-consultationsItem-avatar'
                      size='large'
                      image={consultationItem["avatarUrl"]}
                    />
                  </AtBadge>
                  <View
                    className='pet-message-consultationsItem-info'
                  >
                    <View
                      className='at-row pet-message-consultationsItem-info-top'
                    >
                      <Text
                        className='at-col-6 pet-message-consultationsItem-info-top-title'
                      >
                        {
                          consultationItem["problemContent"]
                        }
                      </Text>
                      <Text
                        className='at-col-6 pet-message-consultationsItem-info-top-time'
                      >
                        {
                          moment(consultationItem["createTime"]).format("YYYY-MM-DD HH:mm")
                        }
                      </Text>
                    </View>
                    <View
                      className='at-row pet-message-consultationsItem-info-bottom at-row__justify--end'
                    >
                      <View className='at-col-3'>
                        <AtTag
                          size='small'
                          className={cns(
                            'pet-message-consultationsItem-info-tag',
                            cnsltState[consultationItem["cnsltState"]]["className"]
                          )}
                        >
                          {cnsltState[consultationItem["cnsltState"]]["txt"]}
                        </AtTag>
                      </View>

                    </View>
                  </View>
                </View>
              );
            }) : <View className='pet-message-empty'>
              <AtIcon
                className='pet-message-empty-icon'
                prefixClass='iconfont'
                value='petPlanet-cat-ao'
                color='#000'
                size={48}
              />
              <View className='pet-message-empty-title'>
                宠物问题，专业咨询
              </View>
              <View className='pet-message-empty-description'>
                啊哦~您还没有任何宠物问题的咨询
              </View>
              <AtButton
                className='pet-message-empty-button'
                size='small'
                onClick={onDirectToMedicalAdvicePage}
              >
                点击进行问诊咨询
              </AtButton>
            </View>
          }
        </ScrollView>
      </Block>
    );
  };
}

{/*<AtSwipeAction*/
}
{/*  key={consultationIndex}*/
}
{/*  isOpened={false}*/
}
{/*  autoClose*/
}
{/*  options={[{*/
}
{/*    text: prompt["swiperAction"]["message_page"]["content"],*/
}
{/*    style: {*/
}
{/*      backgroundColor: '#d94a45',*/
}
{/*      color: '#fff'*/
}
{/*    }*/
}
{/*  }]}*/
}
{/*  onClick={(e) => {*/
}

{/*  }}*/
}
{/*>*/
}
{/*</AtSwipeAction>*/
}

export default Message;


