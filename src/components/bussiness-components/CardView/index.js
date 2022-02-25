import Taro, {Component} from "@tarojs/taro";
import PropTypes from "prop-types";
import cn from "classnames";
import {
  Image,
  ScrollView,
  View
} from "@tarojs/components";
import {
  AtAvatar,
  AtCard,
  AtIcon,
  AtLoadMore,
  AtTag
} from "taro-ui";
import prompt from "../../../constants/prompt";
import LoadingView from "../LoadingView";

/**
 * 抽象业务组件卡片数组
 * @尹文楷
 */
class CardView extends Component {
  static options = {
    addGlobalClass: true
  };

  static propTypes = {
    //卡片列表(必须为数组)
    list: PropTypes.array.isRequired,
    //点击卡片的函数方法(必须为函数)
    onClick: PropTypes.func.isRequired,
    //卡片组件包含的样式名称
    wrapperClassName: PropTypes.string,
    //上拉加载更多
    loadStatus: PropTypes.string,
    //当滚动条滚到底部的时候进行上拉加载动作
    onScrollToLower: PropTypes.func.isRequired
  };

  state = {
    //瀑布流数据结构
    line: []
  };

  /**
   * 渲染首页瀑布流列表的函数
   */
  listRender(nextList) {
    let _line = [],
      _lineAno = [];
    for (let [key, value] of nextList.entries()) {
      if (key % 2 === 0) {
        _line = [..._line, value];
      } else {
        _lineAno = [..._lineAno, value];
      }
    }
    if (_line.length > 0 || _lineAno.length > 0) {
      this.setState({
        line: [_line, _lineAno]
      }, () => {
        this.forceUpdate();
      });
    }
  }

  componentDidShow() {
    const {list} = this.props;
    this.listRender(list);
  }

  componentWillReceiveProps(nextProps, nextContext) {
    const {list} = this.props;
    const {list: nextList} = nextProps;
    let {length} = list,
        {length: nextLength} = nextList;
    if (nextList && nextLength > 0) {
      this.listRender(nextList);
    }
  }

  render() {
    const {list, wrapperClassName, loadStatus} = this.props;
    const {line} = this.state;
    return list && list.length > 0 && (
      <ScrollView
        scrollY
        className={
          cn('pet-business', wrapperClassName)
        }
        scrollTop={0}
        lowerThreshold={86}
        onScrollToLower={this.props.onScrollToLower}
      >
        {/*列表区域*/}
        <View className='at-row at-row--wrap pet-business-container'>
          {
            line && line.length > 0 && line.map((lineItem, lineIndex) => {
              return (
                <View
                  className='at-col at-col-6 pet-business-line'
                  key={lineIndex}
                >
                  {
                    lineItem && lineItem.length > 0 && lineItem.map((petItem) => {
                      let id = petItem["id"],
                        avatarUrl = petItem["avatarUrl"],
                        nickName = petItem["nickName"],
                        tags = petItem["tags"] || [];
                      return (
                        <View key={id} className='pet-business-item'>
                          <AtCard
                            title={null}
                            extra={null}
                            className='pet-business-list'
                            onClick={this.props.onClick.bind(this, id, avatarUrl, nickName)}
                          >
                            <Image
                              mode='widthFix'
                              src={petItem['cover']}
                              className='pet-business-list-image'
                              lazyLoad={true}
                            />
                            <View className='pet-business-list-title'>{petItem['title']}</View>
                            <View className='pet-business-list-price'>
                              <text class='pet-business-list-price-symbol'>
                                &#165;
                              </text>
                              {petItem['cost']}
                              {
                                tags.length > 0 && tags.map((tagItem, tagIndex) => {
                                  return <AtTag
                                    key={tagIndex}
                                    size='small'
                                    type='primary'
                                    className='pet-business-list-tags-tagItem'
                                  >
                                    {tagItem["title"]}
                                  </AtTag>
                                })
                              }
                              <text class='pet-business-list-price-like'>
                                {petItem['wantCount']}人想要
                              </text>
                            </View>
                            <View className='pet-business-list-user'>
                              <AtAvatar
                                size='small'
                                circle
                                image={petItem['avatarUrl']}
                                className='pet-business-list-avatar'
                              />
                              {petItem['nickName']}
                            </View>
                            <View className='pet-business-list-address'>
                              <AtIcon
                                prefixClass='iconfont'
                                value='petPlanet-gps'
                                className='pet-business-list-address-icon'
                                size={13} color='#ec544c'
                              />
                              {petItem['area']}
                            </View>
                          </AtCard>
                        </View>
                      )
                    })
                  }
                </View>
              );
            })
          }
        </View>
        {/*上拉加载更多区域*/}
        {
          line && line.length > 0 && <AtLoadMore
            status={loadStatus}
            moreText=''
            className='pet-business-load-more'
          />
        }
      </ScrollView>
    )
  }
}

export default CardView;
