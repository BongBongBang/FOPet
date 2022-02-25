import Taro, {Component} from '@tarojs/taro';
import {connect} from '@tarojs/redux';
import {
  Block,
  View,
  RadioGroup,
  Radio,
  Label
} from '@tarojs/components';
import {
  AtButton,
  AtIcon,
  AtMessage,
  AtTextarea,
  AtImagePicker
} from 'taro-ui';
import cns from "classnames";
import Tools from "../../utils/petPlanetTools";
import {pageCurrentList} from '../../utils/static';
import {setMedicalConsultAttrValue} from '../../actions/medicalConsult/medicalConsult_action';
import {medicalConsultAPI} from '../../services';
import {BlockTitleView, LoadingView} from "../../components/bussiness-components/";

import './index.less';
import './loading-view.less';

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
    setAttrValue: async payload => {
      return await dispatch(setMedicalConsultAttrValue(payload));
    },
    /**
     * 获取咨询的问题领域列表
     */
    homeInfo: () => {
      dispatch(medicalConsultAPI.homeInfo.call(this));
    },
    /**
     * 上传医疗咨询图片
     */
    uploadImg(...params) {
      dispatch(medicalConsultAPI.uploadImg.apply(this, params));
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
    //能够上传图片数量的最大值
    this.count = 9;
  }

  state = {
    isNextStepDisabled: true,
    //是否显示添加图片按钮
    showAddBtn: true,
    //动态的可添加的图片的数量
    moveCount: 9,
    //上传图片是否存在loading
    uploadLoading: false
  };

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
    const {setAttrValue} = this.props;
    val = val.target ? val.target.value : val;
    setAttrValue({
      consultContent: val
    });
  }

  /**
   * 切换选择问题的类型触发的事件
   */
  onRadioChange(e) {
    // const {isNextStepDisabledChange} = this;
    const idx = e.detail.value;
    const {setAttrValue} = this.props;
    let {areaList} = this.state;
    areaList.forEach(area => {
      area.checked = false;
    });
    areaList[idx].checked = true;
    setAttrValue({
      areaList
    }).then(() => {
      // isNextStepDisabledChange();
    });
  }

  /**
   * 检测问诊问题类型和问题描述是否都填上选中
   */
  verify() {
    let {medicalConsultStore: {areaList, consultContent}} = this.props;
    return Tools.addRules(areaList, [{
      rule: "isSelect:checked",
      errMsg: 'warning:宠物问诊问题类型要选中一种哦~'
    }]).addRules(consultContent, [{
      rule: "isEmpty",
      errMsg: 'warning:宠物问诊问题描述不能为空'
    }]).execute();
  }

  navigateToDoctorPage() {
    if (this.verify()) {
      Taro.navigateTo({
        url: pageCurrentList[12]
      });
    }
  }

  /**
   * 图片上传,files 值发生变化触发的回调函数,
   */
  onImagePickerChange = (files, opType, index) => {
    const {uploadImg, setAttrValue} = this.props;
    const {count} = this;
    let {medicalConsultStore: {consultImages = [], uploadConsultImages = []}} = this.props;
    if (opType === 'add') {
      this.setState({
        uploadLoading: true
      });
      //先将上传显示的图片列表和真正上传的图片列表置空
      setAttrValue({
        consultImages: [],
        uploadConsultImages: []
      });
      for (let [key, value] of files.entries()) {
        const {file: {size}} = value;
        //图片的限制大小
        const format = 3 * 1024 * 1024;
        if (size > format) {
          Taro.atMessage({
            type: 'warning',
            message: '上传的图片过大,不可超过3M!'
          });
          return null;
        }
        uploadImg.apply(this, [{value, key, total: files.length}]);
      }
    } else {
      consultImages.splice(index, 1);
      uploadConsultImages.splice(index, 1);
      setAttrValue({
        consultImages,
        uploadConsultImages
      });
      const {length} = consultImages;
      if (length < count) {
        this.setState({
          showAddBtn: true,
          moveCount: count - length
        });
      }
    }
  };

  /**
   * 点击图片放大查看
   */
  onImagePreviewHandler = index => {
    let {medicalConsultStore: {consultImages = []}} = this.props;
    const previewImageFileList = consultImages.map(item => {
      return item['url'];
    });
    Tools.previewImageConfig({
      current: previewImageFileList[index],
      urls: previewImageFileList,
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

  render() {
    const {
      onRadioChange,
      handleTextAreaChange,
      navigateToDoctorPage,
      onImagePickerChange,
      onImagePreviewHandler
    } = this;
    const {showAddBtn, moveCount, uploadLoading} = this.state;
    let {medicalConsultStore: {areaList, consultContent, consultImages = []}} = this.props;
    return (
      <Block>
        {
          uploadLoading && <LoadingView
            size={56}
            color='#fb2a5d'
            className='pet-consult-loading'
            content='图片上传中'
          />
        }
        <View className='pet-consult'>
          <AtMessage/>
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
                showConfirmBar
                placeholder='请简要描述您的问题，限10-150字之间'
                onConfirm={navigateToDoctorPage.bind(this)}
              />
            </View>
          </View>
          {/* 咨询图片 */}
          <View className='pet-consult-imagepicker'>
            <BlockTitleView className='panel_title'>症状实拍</BlockTitleView>
            <AtImagePicker
              multiple
              showAddBtn={showAddBtn}
              length={3}
              count={moveCount}
              files={consultImages}
              onImageClick={onImagePreviewHandler}
              onChange={onImagePickerChange}
            />
          </View>
          <AtButton
            full
            type='primary'
            className='next-step'
            onClick={navigateToDoctorPage.bind(this)}
          >
            下一步
          </AtButton>
        </View>
      </Block>
    );
  }
}

export default MedicalConsult;
