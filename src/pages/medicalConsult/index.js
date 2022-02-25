import Taro, {Component} from '@tarojs/taro';
import {connect} from '@tarojs/redux';
import {
  View,
  RadioGroup,
  Radio,
  Label
} from '@tarojs/components';
import {
  AtButton,
  AtIcon,
  AtTextarea
} from 'taro-ui';
import cns from "classnames";
import {pageCurrentList} from '../../utils/static';
import action, {setMedicalConsultAttrValue} from '../../actions/medicalConsult';
import medicalConsultApi from '../../services/medicalConsult';
import {BlockTitleView} from "../../components/bussiness-components/";

import './index.less';

@connect(state => {
  return {
    medicalConsultStore: state.medicalConsultStore
  };
}, dispatch => {
  return {
    /**
     * 用于处理多层对象的赋值
     * @param payload
     */
    setAttrValue: payload => {
      dispatch(action.setMedicalConsultAttrValue(payload));
    },
    /**
     * 用于切换选择问题的类型
     */
    updateAreaList: areaList => {
      return new Promise((resolve, reject) => {
        dispatch(action.updateAreaList(areaList));
        resolve();
      });
    },
    /**
     * 输入框值改变时触发的事件
     */
    updateConsultContent: consultContent => {
      return new Promise((resolve, reject) => {
        dispatch(action.updateConsultContent(consultContent));
        resolve();
      });
    },
    /**
     * 获取咨询的问题领域列表
     */
    homeInfo: () => {
      dispatch(medicalConsultApi.homeInfo.call(this));
    }
  };
})
class MedicalConsult extends Component {
  static options = {
    addGlobalClass: true
  };

  config = {
    navigationBarTitleText: '宠物咨询'
  };

  constructor(props) {
    super(props);
    this.state = {
      isNextStepDisabled: true
    };
  }

  componentWillMount() {
    const {setAttrValue} = this.props;
    setAttrValue({
      areaList: [],
      consultContent: ""
    });
  }

  componentDidMount() {
    const {homeInfo} = this.props;
    homeInfo();
  }

  componentWillUnmount() {
  }

  /**
   * 输入框值改变时触发的事件
   */
  handleTextAreaChange(val) {
    const {isNextStepDisabledChange} = this;
    const {updateConsultContent} = this.props;
    val = val.target ? val.target.value : val;
    updateConsultContent({
      consultContent: val
    }).then(() => {
      isNextStepDisabledChange();
    });
  }

  /**
   * 是否可以跳转"下一步"页面
   */
  isNextStepDisabledChange = () => {
    const {medicalConsultStore: {areaList, consultContent}} = this.props;
    let isRadioEmit = areaList.find((item) => item.checked);
    this.setState({
      isNextStepDisabled: !(isRadioEmit && Object.prototype.toString.call(consultContent) === "[object String]" && (consultContent.length > 0))
    });
  };

  /**
   * 切换选择问题的类型触发的事件
   */
  onRadioChange(e) {
    const {isNextStepDisabledChange} = this;
    const idx = e.detail.value;
    const {updateAreaList} = this.props;
    let {areaList} = this.state;
    areaList.forEach(area => {
      area.checked = false;
    });
    areaList[idx].checked = true;
    updateAreaList({
      areaList
    }).then(() => {
      isNextStepDisabledChange();
    });
  }

  navigateToDoctorPage() {
    Taro.navigateTo({
      url: pageCurrentList[12]
    });
  }

  render() {
    const {onRadioChange, handleTextAreaChange, navigateToDoctorPage} = this;
    const {isNextStepDisabled} = this.state;
    let {medicalConsultStore: {areaList, consultContent}} = this.props;
    return (
      <View className='pet-consult'>
        {/* 问题领域 */}
        <View className='pet-consult-area'>
          <BlockTitleView
            className='panel_title'
          >
            选择问题类型
          </BlockTitleView>
          <View className='pet-consult-area'>
            <View>
              <RadioGroup
                className='at-row at-row--wrap'
                onChange={onRadioChange.bind(this)}
              >
                {
                  areaList.map((area, i) => {
                    return <Label for={i} key={i} className='at-col at-col-6 at-row__justify--center radio-item'>
                      <View
                        className={cns(
                          "at-col",
                          "at-col-12",
                          "at-row__justify--center",
                          "radio-item-content",
                          {
                            "checked": area.checked
                          }
                        )}
                      >
                        <View className='at-row radio-title-container'>
                          <View className='at-col at-col-1 at-col--auto radio-title-icon'>
                            <AtIcon
                              value='clock'
                              color='#FFC701'
                            />
                          </View>
                          <View className='at-col at-col-9 radio-title'>
                            {area.remark}
                          </View>
                        </View>
                        <View className='radio-sub-title'>
                          {area["subTitle"]}
                        </View>
                      </View>
                      <Radio
                        hidden
                        id={i}
                        value={i}
                      />
                    </Label>
                  })
                }
              </RadioGroup>
            </View>
          </View>
        </View>

        {/* 问题描述 */}
        <View className='pet-consult-description'>
          <BlockTitleView className='panel_title'>输入问题描述</BlockTitleView>
          <View className='pet-consult-content'>
            <AtTextarea
              value={consultContent}
              onChange={handleTextAreaChange.bind(this)}
              maxLength={150}
              height={250}
              placeholder='请简要描述您的问题，限10-150字之间'
            />
          </View>
        </View>
        <AtButton
          full
          type='primary'
          className='next-step'
          disabled={isNextStepDisabled}
          onClick={navigateToDoctorPage.bind(this)}
        >
          下一步
        </AtButton>
      </View>
    );
  }
}

export default MedicalConsult;
