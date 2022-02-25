import Taro, {Component} from "@tarojs/taro";
import {
  View,
  Image
} from "@tarojs/components";
import {
  AtAvatar
} from "taro-ui";
import {connect} from "@tarojs/redux";
import flowTopicAPI from "./flowTopics_service";
import {setFlowTopicAttrValue} from "./flowTopics_action";
import "./index.less";

@connect(state => {
  return {
    flowTopicStore: state.flowTopicStore
  };
}, dispatch => {
  return {
    /**
     * 保存选中的话题对象
     * @param payload
     */
    saveFlowTopic: payload => {
      dispatch(setFlowTopicAttrValue(payload));
    }
  };
})
class FlowTopics extends Component {
  constructor(props) {
    super(props);
    this.isNextPage = false;
  }

  static options = {
    addGlobalClass: true
  };

  config = {
    navigationBarTitleText: '选择话题',
    onReachBottomDistance: 80
  };

  state = {
    //话题列表页码
    pageNum: 1,
    //话题列表
    topics: [],
    //话题的总条数
    total: 0
  };

  componentDidMount() {
    flowTopicAPI.getTopics.call(this);
  }

  /**
   * 触底请求下一页话题列表
   */
  onReachBottom() {
    const {isNextPage} = this;
    if (!isNextPage) {
      this.isNextPage = true;
      flowTopicAPI.getTopics.call(this);
    }
  }

  /**
   * 将话题选择保存到store，以供页面间通讯
   * @param e
   */
  onTopicClick = e => {
    const {saveFlowTopic} = this.props;
    const {currentTarget: {dataset: {topic}}} = e || {};
    saveFlowTopic({
      topic: JSON.parse(topic) || {}
    });
    Taro.navigateBack({
      delta: 1
    });
  };

  render() {
    const {topics} = this.state;
    const {onTopicClick} = this;
    return (
      <View className='topic-container'>
        {
          topics && topics.length > 0 && topics.map(topic => {
            return (
              <View
                key={String(topic.id)}
                data-topic={JSON.stringify(topic)}
                onClick={onTopicClick}
                className='topic-item at-row'>
                <View
                  className='topic-item-container'
                >
                  <AtAvatar
                    size="large"
                    image={topic.img}
                    className='topic-item-container-avatar'
                    circle
                  />
                </View>
                <View
                  className='topic-item-topic'
                >
                  {topic.topic}
                </View>
              </View>
            );
          })
        }
      </View>
    );
  }
}

export default FlowTopics;
