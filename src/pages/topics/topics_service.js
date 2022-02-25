import Taro from "@tarojs/taro";
import {staticData, petPlanetPrefix} from "../../utils/static";
import Tools from "../../utils/petPlanetTools";
import qs from "../../../node_modules/querystring";
import * as constants from "../flowPublish/constants";

/**
 * 拉取话题列表
 * @returns {*}
 */
function getFlowTopics() {
  let {pageNum, topicList} = this.state;
  return (fn) => {
    return Tools.request({
      url: `${petPlanetPrefix}/flow/topics`,
      method: 'get',
      header: {
        'content-type': 'application/json',
        'cookie': Taro.getStorageSync('petPlanet')
      },
      data: {
        pageNum: pageNum++,
        pageSize: staticData.pageSize
      },
      success: data => {
        const {data: _data = [], total = 0} = data || {};
        const {topic, id = 0} = _data[0] || {};
        this.setState({
          pageNum,
          topicList: [...topicList, ..._data],
          total
        }, () => {
          this.hasTopicNext = false;
          fn(_data);
        });
      },
      fail(res) {
        return res;
      },
      complete(res) {
        return res;
      }
    });
  }
}

/**
 * 拉取内容流
 * @returns {*}
 */
function getFlowPosts() {
  const {setTopicsAttrValueHandler, topicsStore} = this.props;
  const {flowPostList = []} = topicsStore;
  let {topic, postPageNum} = this.state;
  return (fn) => {
    return Tools.request({
      url: `${petPlanetPrefix}/flow/posts`,
      method: 'get',
      header: {
        'content-type': 'application/json',
        'cookie': Taro.getStorageSync('petPlanet')
      },
      data: Object.assign({}, {
        pageNum: postPageNum++,
        pageSize: staticData.pageSize
      }, topic ? {
        topic
      } : {}),
      success: async data => {
        const {data: _data = [], total = 0} = data || {};
        let _flowPostList = this.state.postPageNum === 1 ? _data : [...flowPostList, ..._data];
        setTopicsAttrValueHandler({
          flowPostList: _flowPostList
        });
        this.setState({
          postTotal: total,
          postPageNum
        }, () => {
          this.hasNext = false;
          this.setState({
            loading: false
          });
        });
      },
      fail: (res) => {
        this.setState({
          loading: false
        });
        return res;
      },
      complete: (res) => {
      }
    });
  };
}

/**
 * 拉取话题内容流
 * @returns {*}
 */
function getFlowPostsByTopics() {
  let {topic, postPageNum} = this.state;
  const {setFindTopicsAttrValueHandler, findTopicsStore} = this.props;
  const {flowPostList = []} = findTopicsStore;
  return (fn) => {
    return Tools.request({
      url: `${petPlanetPrefix}/flow/posts`,
      method: 'get',
      header: {
        'content-type': 'application/json',
        'cookie': Taro.getStorageSync('petPlanet')
      },
      data: Object.assign({}, {
        pageNum: postPageNum++,
        pageSize: staticData.pageSize
      }, topic ? {
        topic
      } : {}),
      success: async data => {
        const {data: _data = [], total = 0} = data || {};
        let _flowPostList = this.state.postPageNum === 1 ? _data : [...flowPostList, ..._data];
        setFindTopicsAttrValueHandler({
          flowPostList: _flowPostList
        });
        this.setState({
          postTotal: total,
          postPageNum
        }, () => {
          this.hasNext = false;
          this.setState({
            loading: false
          });
        });
      },
      fail: (res) => {
        this.setState({
          loading: false
        });
        return res;
      },
      complete: (res) => {
      }
    });
  };
}

/**
 * 获取某条post的详情页接口
 * @returns {*}
 */
function getFlowPostsDetail() {
  const {id} = this.state;
  return Tools.request({
    url: `${petPlanetPrefix}/flow/postDetails/${id}`,
    method: 'get',
    header: {
      'content-type': 'application/json',
      'cookie': Taro.getStorageSync('petPlanet')
    },
    success: data => {
      const {comments = [], commentTotal = 0} = data || {};
      this.setState({
        topicDetail: data,
        commentsList: comments,
        commentsTotal: commentTotal,
        isNext: false
      }, () => {
        const {params: {scrollTop}} = this.$router;
        const {navBarPaddingTop} = Tools.adaptationNavBar();
        if (scrollTop) {
          Taro.createSelectorQuery().select('#pet-topic-detail-content').fields({
            size: true
          }, res => {
            const {height} = res;
            this.setState({
              scrollTop: {
                height: height - navBarPaddingTop
              }
            });
          }).exec();
        }
      });
    },
    fail: (res) => {
      return res;
    },
    complete: (res) => {
      return res;
    }
  });
}

/**
 * 拉取某条Post的回复列表
 * @returns {*}
 */
function getFlowPostsDetailComments() {
  let {
    id,
    pageNum,
    pageSize
  } = this.state;
  return Tools.request({
    url: `${petPlanetPrefix}/flow/posts/${id}/comments?pageNum=${++pageNum}&pageSize=${pageSize}`,
    method: 'get',
    data: {},
    header: {
      'content-type': 'application/json',
      'cookie': Taro.getStorageSync('petPlanet')
    },
    success: data => {
      const {data: _data} = data || {};
      const {commentsList} = this.state;
      this.setState({
        pageNum,
        commentsList: [...commentsList, ..._data]
      }, () => {
        this.isNext = false;
      });
    },
    fail: (res) => {

    },
    complete: (res) => {

    }
  });
}

/**
 * 获取用户的昵称和头像
 * @returns {*}
 */
function getTinyHomeInfo() {
  return Tools.request({
    url: `${petPlanetPrefix}/users/tinyHomeInfo`,
    method: 'get',
    header: {
      'content-type': 'application/json',
      'cookie': Taro.getStorageSync('petPlanet')
    },
    data: {},
    success: data => {
      const {nickName, avatarUrl} = data;
      this.setState({
        avatarUrl,
        nickName
      });
    },
    fail: res => {
      console.log(res);
    },
    complete: res => {
      console.log(res);
    }
  });
}

/**
 * 同步微信用户授权后的用户信息
 * @returns {*}
 */
function syncUserInfo(params) {
  const {pages} = this.state;
  return Tools.request({
    url: `${petPlanetPrefix}/users/syncUserInfo`,
    method: 'post',
    header: {
      'content-type': 'application/x-www-form-urlencoded',
      'cookie': Taro.getStorageSync('petPlanet')
    },
    data: qs.stringify(params),
    success: data => {
      Taro.navigateBack({
        delte: 1
      });
    },
    fail: (res) => {

    },
    complete: (res) => {

    }
  });
}

/**
 * 进行评论
 */
function flowPostCommentRequest() {
  const {id, commentValue, parentCommentId} = this.state;
  return Tools.request({
    url: `${petPlanetPrefix}/flow/posts/${id}/comments`,
    method: 'post',
    header: {
      'content-type': 'application/json',
      'cookie': Taro.getStorageSync('petPlanet')
    },
    data: Object.assign({}, {
      comment: commentValue ? commentValue : ''
    }, parentCommentId ? {parentCommentId} : {}),
    success: data => {
      this.setState(Object.assign({}, {
        pageNum: 1,
        commentValue: '',
        isFocus: false,
        inputDistanceBoard: 0,
        parentCommentId: 0
      }, parentCommentId ? {} : {scrollTop: 0}), () => {
        getFlowPostsDetail.call(this);
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
 * (不)喜欢某条Post
 */
function flowPostsTopicsLike(id) {
  const {
    topicsStore: {flowPostList: topicsFlowPostList},
    findTopicsStore: {flowPostList = []},
    setTopicsAttrValueHandler = () => {

    },
    setFindTopicsAttrValueHandler = () => {

    }
  } = this.props;
  return Tools.request({
    url: `${petPlanetPrefix}/flow/posts/${id}/like`,
    method: 'post',
    header: {
      'content-type': 'application/json',
      'cookie': Taro.getStorageSync('petPlanet')
    },
    data: {
      id
    },
    success: data => {
      const {liked, likeCount} = data;
      const currentItem = flowPostList.find(item => item['id'] === id);
      const topicsCurrentItem = topicsFlowPostList.find(item => item['id'] === id);
      if (currentItem) {
        currentItem['goodCount'] = likeCount;
        currentItem['liked'] = liked;
      }
      if (topicsCurrentItem) {
        topicsCurrentItem['goodCount'] = likeCount;
        topicsCurrentItem['liked'] = liked;
      }
      setTopicsAttrValueHandler({
        flowPostList: topicsFlowPostList
      });
      setFindTopicsAttrValueHandler({
        flowPostList
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
 * 在详情页(不)喜欢某条Post
 */
function flowPostsTopicsDetailLike() {
  const {id} = this.state;
  const {
    topicsStore: {flowPostList: topicsFlowPostList},
    findTopicsStore: {flowPostList = []},
    setTopicsAttrValueHandler = () => {

    },
    setFindTopicsAttrValueHandler = () => {

    }
  } = this.props;
  return Tools.request({
    url: `${petPlanetPrefix}/flow/posts/${id}/like`,
    method: 'post',
    header: {
      'content-type': 'application/json',
      'cookie': Taro.getStorageSync('petPlanet')
    },
    data: {
      id
    },
    success: data => {
      const {liked, likeCount} = data;
      const currentItem = flowPostList.find(item => item['id'] === Number(id));
      const topicsCurrentItem = topicsFlowPostList.find(item => item['id'] === Number(id));
      if (currentItem) {
        currentItem['goodCount'] = likeCount;
        currentItem['liked'] = liked;
      }
      if (topicsCurrentItem) {
        topicsCurrentItem['goodCount'] = likeCount;
        topicsCurrentItem['liked'] = liked;
      }
      setTopicsAttrValueHandler({
        flowPostList: topicsFlowPostList
      });
      setFindTopicsAttrValueHandler({
        flowPostList
      });
      this.setState({
        liked,
        like: likeCount
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
function getFormId(formId) {
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
    success: (data, header) => {
    },
    fail: res => {
    },
    complete: res => {
    }
  });
}

/**
 * 发布上传图片
 * @尹文楷
 */
function publishImageUpload({value, key, total}) {
  const {count} = this;
  let {files = [], images = []} = this.state;
  return Tools.uploadFile({
    url: `${petPlanetPrefix}/tinyStatics/uploadImg/v2`,
    filePath: value.url,
    name: "file",
    formData: {
      type: constants.uploadPrefix
    },
    success: (data, statusCode) => {
      if (statusCode === 200) {
        images.push(data);
        files.push(value);
        const {length} = images;
        this.setState({
          moveCount: count - length
        });
        if (length >= count) {
          this.setState({
            showAddBtn: false
          });
        }
        //将上传图片loading消除
        if (key >= (total - 1)) {
          this.setState({
            uploadLoading: false
          });
        }
        this.setState({
          files,
          images
        });
      } else {
        this.setState({
          uploadLoading: false
        });
      }
    },
    complete: async (res) => {

    }
  });
}

/**
 * 发布一条Posts
 */
function flowPostsPublish() {
  const {images, content} = this.state;
  const {flowTopicStore: {topic}, setFlowTopicAttrValueHandler} = this.props;
  const {topic: topics = null} = topic || {};
  return Tools.request({
    url: `${petPlanetPrefix}/flow/posts`,
    method: 'post',
    header: {
      "content-type": "application/json",
      "cookie": Taro.getStorageSync("petPlanet")
    },
    data: Object.assign({}, {
      imgs: images,
      content
    }, topics ? {
      topic: topics
    } : {}),
    success: data => {
      this.setState({
        images: [],
        files: [],
        content: null
      });
      setFlowTopicAttrValueHandler({
        topic: null
      });
      this.setState({
        reviewModal: true
      });
    },
    fail: res => {
      return res;
    },
    complete: res => {
      return res;
    }
  });
}

const topicsApi = {
  getFormId,
  getFlowTopics,
  getFlowPosts,
  getFlowPostsByTopics,
  getFlowPostsDetail,
  getFlowPostsDetailComments,
  getTinyHomeInfo,
  syncUserInfo,
  flowPostCommentRequest,
  flowPostsTopicsLike,
  flowPostsTopicsDetailLike,
  publishImageUpload,
  flowPostsPublish
};

export default topicsApi;
