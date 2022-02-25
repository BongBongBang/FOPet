import Tools from "../utils/petPlanetTools";
import Taro from "@tarojs/taro";
import {petPlanetPrefix} from "../utils/static";

function getTopics() {
    const {pageNum ,pageSize} = this.state;
    return Tools.request({
        url: `${petPlanetPrefix}/flow/topics?pageNum=${pageNum}&pageSize=${pageSize}`,
        method: 'get',
        header: {
            "content-type": "application/json",
            "cookie": Taro.getStorageSync("petPlanet")
        },
        data: {},
        success: data => {
            this.setState({
                topics: data.data,
                pageNum: data.pageNum,
                pageSize: data.pageSize,
                pages: data.pages,
                total: data.total
            });
        },
        fail: res => {

        },
        complete: res => {
        }
    });
}

const flowTopicAPI = {
    getTopics
};

export default flowTopicAPI;