import Taro, {Component} from "@tarojs/taro";
import {connect} from "@tarojs/redux";
import {
  View,
  Text
} from "@tarojs/components";
import {setDiseaseAttrValue} from "../../actions/disease";
import {BlockTitleView, LoadingView, NavBarView} from "../../components/bussiness-components";
import {diseaseDetailAPI} from "../../services";
import prompt from "../../constants/prompt";

import "./loading-view.less";
import "./index.less";

@connect((state, ownProps) => {
  return {
    diseaseStore: state.diseaseStore
  };
}, (dispatch, ownProps) => {
  return {
    /**
     * 多层处理函数
     * @尹文楷
     */
    setAttrValue(payload) {
      dispatch(setDiseaseAttrValue(payload));
    }
  };
})
class DiseaseDetail extends Component {
  static options = {
    addGlobalClass: true
  };

  config = {
    navigationStyle: 'custom'
  };

  state = {
    //查到患病结果的id
    illnessId: 0,
    //疾病名称
    illness: null,
    //疾病症状
    symptom: null,
    //病因
    cause: null,
    //症状描述
    symptomDetail: null,
    //疾病诊断
    diagnosis: null,
    //疾病治疗
    treatment: null,
    //疾病定义
    definition: null,
    //是否显示正在加载loading页面......
    loading: true
  };

  componentWillMount() {
    const {params: {id}} = this.$router;
    this.setState({
      illnessId: id
    });
  }

  componentDidMount() {
    diseaseDetailAPI.getIllnessDetail.call(this);
  }

  /**
   * 页面跳到上一页
   */
  redirectToBackPage() {
    Taro.navigateBack({
      delta: 1
    });
  }

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
    const {illness, symptom, definition, cause, symptomDetail, diagnosis, treatment, loading} = this.state;
    const {redirectToBackPage, adaptationNavBar} = this;
    const {navBarHeight} = adaptationNavBar() || {};
    return (
      <View className='pet-diseaseDetail'>
        {
          loading && <LoadingView
            size={56}
            color='#fb2a5d'
            className='pet-diseaseDetail-loading'
            content={prompt["detail"]["loading"]["text"]}
          />
        }
        <NavBarView
          color='#000'
          title='疾病详情'
          leftIconType='chevron-left'
          onClickLeftIcon={redirectToBackPage}
          className='pet-diseaseDetail-navBar'
        />
        <View
          style={{marginTop: `${navBarHeight}rpx`}}
          className='pet-diseaseDetail-container'
        >
          <BlockTitleView
            content={illness}
            className='pet-diseaseDetail-illness'
          />
          <View className='pet-diseaseDetail-propose'>
            *治疗方案仅为建议，具体诊疗请前往医院进行
          </View>
          <View
            className='pet-diseaseDetail-operation'
            style={{marginTop: '8PX'}}
          >
            <Text className='pet-diseaseDetail-operation-title'>
              疾病症状
            </Text>
            <View className='pet-diseaseDetail-operation-content'>
              {symptom}
            </View>
          </View>
          <View className='pet-diseaseDetail-operation'>
            <Text className='pet-diseaseDetail-operation-title'>
              症状描述
            </Text>
            <View className='pet-diseaseDetail-operation-content'>
              {symptomDetail}
            </View>
          </View>
          <View className='pet-diseaseDetail-operation'>
            <Text className='pet-diseaseDetail-operation-title'>
              疾病定义
            </Text>
            <View className='pet-diseaseDetail-operation-content'>
              {definition}
            </View>
          </View>
          <View className='pet-diseaseDetail-operation'>
            <Text className='pet-diseaseDetail-operation-title'>
              病因
            </Text>
            <View className='pet-diseaseDetail-operation-content'>
              {cause}
            </View>
          </View>
          <View className='pet-diseaseDetail-operation'>
            <Text className='pet-diseaseDetail-operation-title'>
              疾病诊断
            </Text>
            <View className='pet-diseaseDetail-operation-content'>
              {diagnosis}
            </View>
          </View>
          <View className='pet-diseaseDetail-operation'>
            <Text className='pet-diseaseDetail-operation-title'>
              疾病治疗
            </Text>
            <View className='pet-diseaseDetail-operation-content'>
              {treatment}
            </View>
          </View>
        </View>
      </View>
    );
  }
}

export default DiseaseDetail;
