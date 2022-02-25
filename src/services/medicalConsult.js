import Taro from "@tarojs/taro";
import Tools from "../utils/petPlanetTools";
import {petPlanetPrefix} from "../utils/static";
import {setMedicalConsultAttrValue} from "../actions/medicalConsult/medicalConsult_action";

/**
 * 获取咨询的问题领域列表
 * @returns {function(*)}
 */
function homeInfo() {
  return async (dispatch) => {
    return await Tools.request({
      url: `${petPlanetPrefix}/cnslt/cnsltAreas`,
      method: 'get',
      header: {
        "Content-Type": "application/json",
        "cookie": Taro.getStorageSync("petPlanet")
      },
      success: async (data, header) => {
        if (data) {
          data.forEach((area, index) => {
            area.checked = index === 0;
          });
        }
        await dispatch(setMedicalConsultAttrValue({areaList: data}));
      },
      fail: res => {
        console.log(res);
      },
      complete: res => {
        console.log(res);
      }
    });
  }
}

/**
 * 医疗咨询上传图片
 */
function uploadImg({value, key, total}) {
  const {count} = this;
  let {medicalConsultStore: {consultImages, uploadConsultImages}} = this.props;
  return (dispatch) => {
    return Tools.uploadFile({
      url: `${petPlanetPrefix}/tinyStatics/uploadImg`,
      filePath: value.url,
      name: 'file',
      header: {
        'content-type': 'application/json',
        'cookie': Taro.getStorageSync('petPlanet')
      },
      success: data => {
        consultImages.push(value);
        uploadConsultImages.push(data);
        const {length} = consultImages;
        //最大上传列表数量随着上传图片的增加而减少
        this.setState({
          moveCount: count - length
        });
        //当上传显示的图片列表等于最大上传图片列表树立那个,则将添加按钮变消失
        if (length >= count) {
          this.setState({
            showAddBtn: false
          });
        }
        //延时800ms将上传图片loading消除
        if (key >= total - 1) {
          this.setState({
            uploadLoading: false
          });
        }
        dispatch(setMedicalConsultAttrValue({
          consultImages,
          uploadConsultImages
        }));
      },
      fail: (res) => {
        this.setState({
          uploadLoading: false
        });
        console.log(res);
      },
      complete: (res) => {
        console.log(res);
      }
    });
  }
}

const medicalConsultApi = {
  homeInfo,
  uploadImg
};

export default medicalConsultApi;
