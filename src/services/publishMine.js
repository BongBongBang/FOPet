import Taro from "@tarojs/taro";
import Tools from "../utils/petPlanetTools";
import {staticData, petPlanetPrefix} from "../utils/static";
import {setPublishMineAttrValue} from "../actions/publishMine";

/**
 * 拉取发布列表
 * @尹文楷
 * @returns {Function}
 */
function usersPublishMineRequest() {
  return async (dispatch) => {
    const {publishMineStore} = this.props;
    const {pageNum, pageSize, petPublishMineList} = publishMineStore;
    return Tools.request({
      url: `${petPlanetPrefix}/users/publication`,
      method: "GET",
      header: {
        "content-type": "application/json",
        "cookie": Taro.getStorageSync("petPlanet")
      },
      data: {
        pageNum,
        pageSize
      },
      success(data, header) {
        let petPublishMineList_new = [...petPublishMineList, ...data];
        dispatch(setPublishMineAttrValue({
          petPublishMineList: petPublishMineList_new,
          currentPetPublishMineList: data
        }));
        dispatch(setPublishMineAttrValue({
          loadStatus: (data.length > 0 && data.length === staticData["pageSize"]) ?
            staticData["loadStatusConfig"]["more"] : staticData["loadStatusConfig"]["noMore"]
        }));
      },
      complete(res) {

      }
    });
  }
}

const publishMineAPI = {
  usersPublishMineRequest
};

export default publishMineAPI;
