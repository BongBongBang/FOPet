import Tools from '../../../../utils/petPlanetTools';

/**
 * 获取寄养家庭详情
 */
function getFosterDetail() {
  const {goodsId = 0} = this.state;
  return Tools.request({
    url: `eshop/goods/foster/detail/v2/${goodsId}`,
    success: data => {
      const {
        goodsImages = [],
        fosterService = [],
        otherService = [],
        coverPic = '',
        spuAttributes = [],
        startDate = 0,
        endDate = 0
      } = data || {};
      this.setState({
        coverPic,
        spuAttributes,
        startDate,
        endDate,
        swiperList: goodsImages,
        fosterService,
        otherService
      });
    },
    fail: (res) => {

    },
    complete: (res) => {

    }
  });
}

/**
 * 判断当前用户是否需要更新信息
 */
function getNeedUpdateUserInfo() {
  return Tools.request({
    url: 'users/needUpdateUserInfo',
    method: 'post',
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    success: (data = {}, header = {}) => {
      return data;
    },
    fail: (res) => {
    },
    complete: (res) => {
    }
  });
}

const fosterDetailAPI = {
  getFosterDetail,
  getNeedUpdateUserInfo
};

export default fosterDetailAPI;
