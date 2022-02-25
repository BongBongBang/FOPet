import Tools from '../../../utils/petPlanetTools';
import {setMedicalConsultAttrValue} from './medicalConsult_action';

/**
 * 获取咨询的问题领域列表
 * @returns {function(*)}
 */
function homeInfo() {
    return async (dispatch) => {
        return await Tools.request({
            url: 'cnslt/cnsltAreas',
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

const medicalConsultAPI = {
    homeInfo
};

export default medicalConsultAPI;
