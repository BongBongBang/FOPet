import Taro from "@tarojs/taro";
import Tools from "../utils/petPlanetTools";
import {staticData, petPlanetPrefix} from "../utils/static";
import {setCollectionAttrValue} from "../actions/collection";

/**
 * 拉取收藏列表
 * @尹文楷
 * @returns {Function}
 */
function usersCollectionRequest() {
  return async (dispatch) => {
    const {collectionStore} = this.props;
    const {pageNum, pageSize, petCollectionList} = collectionStore;
    return Tools.request({
      url: `${petPlanetPrefix}/users/collection`,
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
        let petCollectionList_new = [...petCollectionList, ...data];
        dispatch(setCollectionAttrValue({
          petCollectionList: petCollectionList_new,
          currentPetCollectionList: data
        }));
        dispatch(setCollectionAttrValue({
          loadStatus: (data.length > 0 && data.length === staticData["pageSize"]) ?
            staticData["loadStatusConfig"]["more"] : staticData["loadStatusConfig"]["noMore"]
        }));
      },
      complete(res) {

      }
    });
  }
}

const collectionAPI = {
  usersCollectionRequest
};

export default collectionAPI;

