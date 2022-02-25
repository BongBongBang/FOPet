import Taro from "@tarojs/taro";
import Tools from "../../utils/petPlanetTools";
import {petPlanetPrefix} from "../../utils/static";
import qs from "../../../node_modules/querystring";

function getComments() {
  let {commId, pageNum, pageSize} = this.state;
  const qsObj = {
    commentId: commId,
    pageNum: pageNum++,
    pageSize
  };
  const qsStr = qs.stringify(qsObj);
  return (fn) => {
    return Tools.request({
      url: `${petPlanetPrefix}/flow/comments/${commId}/subComments?${qsStr}`,
      method: 'get',
      success: data => {
        const {subCommentList = []} = this.state;
        let {subComments = []} = data;
        subComments = subComments ? subComments : [];
        const length = subComments.length;
        this.isPageNext = true;
        this.setState({
          ...data,
          pageNum: length > 0 ? pageNum : --pageNum,
          pageSize,
          subCommentList: [...subCommentList, ...subComments]
        }, () => {
          fn(data);
        });
      },
      fail: res => {
      },
      complete: rec => {
      }
    });
  };
}

/**
 * 进行评论
 */
function flowPostCommentRequest() {
  let {postId, flowCommentsValue, commId} = this.state;
  const that = this;
  return Tools.request({
    url: `${petPlanetPrefix}/flow/posts/${postId}/comments`,
    method: 'post',
    header: {
      'content-type': 'application/json',
      'cookie': Taro.getStorageSync('petPlanet')
    },
    data: {
      comment: flowCommentsValue,
      parentCommentId: Number(commId)
    },
    success: data => {
      this.setState({
        subCommentList: [],
        flowCommentsValue: "",
        pageNum: 1,
        scrollTop: 0,
        loading: false
      }, () => {
        Tools.run(function* () {
          yield getComments.call(that);
        });
      });
    },
    fail: (res) => {
      console.log(res);
    },
    complete: (res) => {
      console.log(res);
    }
  });
}

/**
 * formId收集
 * @尹文楷
 * @param formId
 */
function getFormIdRequest(formId) {
  return Tools.request({
    url: `${petPlanetPrefix}/tinyHome/formId`,
    method: "POST",
    header: {
      "content-type": "application/json",
      "cookie": Taro.getStorageSync("petPlanet")
    },
    data: {
      formId
    },
    success: async (data, header) => {

    },
    complete: async (data) => {

    }
  });
}

const flowCommentAPI = {
  getComments,
  flowPostCommentRequest,
  getFormIdRequest
};

export default flowCommentAPI;
