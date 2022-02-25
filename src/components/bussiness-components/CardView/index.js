import Taro, {Component} from "@tarojs/taro";
import PropTypes from "prop-types";
import cn from "classnames";
import {
  Image,
  ScrollView,
  View
} from "@tarojs/components";
import {
  AtActivityIndicator,
  AtAvatar,
  AtCard,
  AtIcon,
  AtLoadMore,
  AtTag
} from "taro-ui";
import prompt from "../../../constants/prompt";

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

  render() {
    const {list, wrapperClassName, loadStatus} = this.props;
    return (
      <ScrollView
        scrollY
        className={
          cn('pet-business', wrapperClassName)
        }
        scrollTop={0}
        lowerThreshold={86}
        onScrollToLower={this.props.onScrollToLower}
      >
        {
          !(list && list.length > 0) &&
          <AtActivityIndicator
            size={56}
            color='#fb2a5d'
            className='pet-business-loading'
            content={prompt["detail"]["loading"]["text"]}
          />
        }
        {/*列表区域*/}
        <View className='at-row at-row--wrap pet-business-container'>
          {
            list && list.length > 0 && list.map((petItem) => {
              let id = petItem["id"];
              return (
                <View key={id} className='at-col at-col-6 at-col--wrap'>
                  <AtCard
                    title={null}
                    extra={null}
                    className='pet-business-list'
                    onClick={this.props.onClick.bind(this, id)}
                  >
                    <Image
                      mode='aspectFill'
                      src={petItem['cover']}
                      className='pet-business-list-image'
                    />
                    <View className='pet-business-list-title'>{petItem['title']}</View>
                    <View className='pet-business-list-price'>
                      <text class='pet-business-list-price-symbol'>
                        &#165;
                      </text>
                      {petItem['cost']}
                      {
                        petItem["tags"] && petItem["tags"].length > 0 && petItem["tags"].map((tagItem, tagIndex) => {
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
        {/*上拉加载更多区域*/}
        <AtLoadMore
          status={loadStatus}
          moreText=''
          className='pet-business-load-more'
        />
      </ScrollView>
    )
  }
}

export default CardView;
