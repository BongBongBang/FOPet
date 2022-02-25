import Taro, {Component} from '@tarojs/taro';
import {connect} from '@tarojs/redux';
import {
  View,
  Label,
  RadioGroup,
  Radio
} from '@tarojs/components';
import {
  AtAvatar,
  AtButton
} from 'taro-ui';
import {BlockTitleView} from "../../components/bussiness-components";
import {petPlanetPrefix} from '../../utils/static';
import medicalDoctorApi from '../../services/medicalDoctor';

import './index.less';

@connect(state => {
  let {medicalConsultStore} = state;
  return {
    medicalConsultStore
  };
})
class MedicalDoctor extends Component {
  constructor() {
    super(...arguments);
  }

  config = {
    navigationBarTitleText: '选择医师'
  };

  state = {
    consultType: 'SYSTEM',
    doctors: []
  };

  componentWillMount() {
    this.setState({
      consultType: 'SYSTEM',
      doctors: []
    });
  }

  componentDidMount() {
    medicalDoctorApi.homeInfo.call(this);
  }

  componentWillUnmount() {
  }

  /**
   * 选择宠物医师操作
   */
  onRadioChange(e) {
    const idx = e.detail.value;
    let {doctors, consultType} = this.state;
    doctors.forEach(doctor => {
      doctor.checked = false;
    });
    if (-1 != idx) {
      consultType = 'SPECIFIC';
      doctors[idx].checked = true;
    } else {
      consultType = 'SYSTEM';
    }
    this.setState({
      doctors,
      consultType
    });
  }

  /**
   * 进行咨询
   */
  onBtnClick(e) {
    const {doctors, consultType} = this.state;
    const {medicalConsultStore: {consultContent}} = this.props;
    let docId = doctors.find(doctor => {
      return doctor.checked;
    });
    medicalDoctorApi.consult.call(this, {
      docId: docId ? docId["id"] : docId,
      content: consultContent,
      cnsltType: consultType
    });
    //取消冒泡事件
    e.stopPropagation();
  }

  render() {
    const {doctors, consultType} = this.state;
    const {onRadioChange, onBtnClick} = this;
    return (
      <View>
        <RadioGroup className='radio-container' onChange={onRadioChange.bind(this)}>
          <Label for={-1}>
            <View className='radio-item at-row'>
              <View
                className={`radio-item-content at-row at-row__align--center ${consultType === 'SYSTEM' ? 'checked' : ""}`}
              >
                <AtAvatar
                  size='large'
                  className='radio-item-content-avatar'
                  circle
                  image={`${petPlanetPrefix}/tinyStatics/imgs/default-doctor-avatar.png`}
                />
                <View className='at-col at-row__align--start'>
                  <View className='title'>系统随机指派医师</View>
                  <View className='sub-title'>全国医师资源，平均6s快速响应</View>
                </View>
                <View className='number'>¥0.00</View>
              </View>
            </View>
            <Radio hidden id={-1} value={-1}/>
          </Label>

          <BlockTitleView className='panel_title at-row'>
            为您推荐优质的医师
            {/*<View className='sub-title'>秒级接待/不满意退</View>*/}
          </BlockTitleView>
          {/* 医师列表 */}
          {
            doctors.length > 0 && doctors.map((doctor, idx) => {
              return (
                <Label for={idx} key={doctor.userId}>
                  <View className='radio-item at-row'>
                    <View
                      className={`radio-item-content at-row at-row__align--center ${doctor.checked ? 'checked' : ""}`}
                    >
                      <AtAvatar
                        className='radio-item-content-avatar'
                        size='large'
                        circle
                        image={doctor.avatarUrl}
                      />
                      <View className='at-col at-row__align--start'>
                        <View className='title'>
                          {doctor.nickName}
                        </View>
                        <View className='sub-title'>擅长领域：{doctor.goodAt}</View>
                        <View className='color-light-grey sub-title'>服务人次：{doctor.serveCount}次, 好评率：100%</View>
                      </View>
                      <View className='number'>¥0.00</View>
                    </View>
                    <Radio hidden id={idx} value={idx}/>
                  </View>
                </Label>
              );
            })
          }
        </RadioGroup>
        <AtButton full type='primary' className='next-btn' onClick={onBtnClick.bind(this)}>咨询</AtButton>
      </View>
    );
  }
}

export default MedicalDoctor;