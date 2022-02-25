import Taro, {Component} from "@tarojs/taro";
import PropTypes from "prop-types";
import {
  View
} from "@tarojs/components";
import {
  AtIcon
} from "taro-ui";
import cns from "classnames";
import "./index.less";

/**
 * 抽象分享页面业务组件
 * @尹文楷
 */
class NavBarView extends Component {
  static options = {
    addGlobalClass: true
  };

  static propTypes = {
    //顶部导航栏的标题
    title: PropTypes.string.isRequired,
    //顶部导航栏的样式
    className: PropTypes.string,
    //链接文字跟图标颜色，不包括标题
    color: PropTypes.string,
    //className 前缀，用于第三方字体图标库
    leftIconPrefixClass: PropTypes.string,
    //左边图标类型
    leftIconType: PropTypes.string,
    //左边第一个图标类型点击事件
    onClickLeftIcon: PropTypes.func
  };

  /**
   * 适配各类手机,自定义导航栏高度
   */
  adaptationNavBar() {
    const res = Taro.getSystemInfoSync();
    const {model, system} = res;
    let navBarAdaptation = {};
    if (system.indexOf("iOS") !== -1) {
      if (model === "iPhone X") {
        navBarAdaptation["navBarHeight"] = 172;
        navBarAdaptation["statusBarClassName"] = "pet-detail-iPhoneX-navBar";
      } else if (model.indexOf("iPhone") !== -1) {
        navBarAdaptation["navBarHeight"] = 128;
        navBarAdaptation["statusBarClassName"] = "pet-detail-iPhone-navBar";
      }
    } else if (system.indexOf("Android") !== -1) {
      navBarAdaptation["navBarHeight"] = 136;
      navBarAdaptation["statusBarClassName"] = "pet-detail-Android-navBar";
    }
    return navBarAdaptation;
  }

  render() {
    const {title, className = '', color, leftIconPrefixClass, leftIconType, onClickLeftIcon} = this.props;
    const {adaptationNavBar} = this;
    const {statusBarClassName} = adaptationNavBar() || {};
    return (
      <View
        className={cns(
          `pet-detail-navBar`,
          statusBarClassName,
          className
        )}
      >
        <View class='at-row at-row--no-wrap nav-bar'>
          <View
            className='at-col at-col-3 nav-bar-leftIcon'
            onClick={onClickLeftIcon}
          >
            <AtIcon
              prefixClass={leftIconPrefixClass ? leftIconPrefixClass : 'at-icon'}
              value={leftIconType}
              color={color}
              size={20}
            />
          </View>
          <View className='at-col at-col-6 nav-bar-title'>{title}</View>
          <View className='at-col at-col-3'> </View>
        </View>
      </View>
    )
  }
}

export default NavBarView;
