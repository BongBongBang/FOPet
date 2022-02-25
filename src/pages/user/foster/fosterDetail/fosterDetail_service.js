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

const fosterDetailAPI = {
  getFosterDetail
};

export default fosterDetailAPI;
