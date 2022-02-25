import Taro, {Component} from "@tarojs/taro";
import {connect} from "@tarojs/redux";
import {flowTopicAPI} from "../../services";
import "./index.less";

@connect(state => {
  return {};
}, dispatch => {
  return {};
})
class FlowTopic extends Component {

  state = {
    pageNum: 1, 
    pageSize: 10,
    topics: [],
    total: 0,
    pages: 0
  }

  componentDidMount() {
    flowTopicAPI.getTopics.call(this);
  }

  render() {
    const {topics} = this.state;
    return (
      <View className='topic-container'>
        {
          topics && topics.length > 0 && topics.map(topic => {
            return (
              <View
                key={topic.id}
                className='topic-item at-row'>
                <View
                  className='topic-item-avatar-container'
                >
                  <Image
                    className='topic-item-avatar'
                    src={topic.img}
                    lazyLoad={true}
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

export default FlowTopic;