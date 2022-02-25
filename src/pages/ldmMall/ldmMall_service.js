import Tools from '../../utils/petPlanetTools';

/**
 * 获取商品分类导航
 * @param categoryId
 */
function getCategorySub(categoryId = 0) {
  return Tools.request({
    url: 'eshop/category/sub',
    data: Object.assign({}, categoryId ? {categoryId} : {}),
    success: (data = [], header = {}) => {
      const mallList = data.map((item = {}) => {
        return {
          title: item.categoryName,
          ...item
        }
      });
      this.setState({
        mallList
      });
      if (mallList[0]['hasChild']) {
        getCategoryChildrenSub.call(this, mallList[0]['categoryId']);
      }
    },
    fail: (res = {}) => {
    },
    complete: (res = {}) => {
    }
  });
}

/**
 * 获取商品分类子级导航
 * @param categoryId
 */
function getCategoryChildrenSub(categoryId = 0) {
  return Tools.request({
    url: 'eshop/category/sub',
    data: {categoryId},
    success: (data = [], header = {}) => {
      this.setState({
        categoryList: data
      });
    },
    fail: (res = {}) => {
    },
    complete: (res = {}) => {
    }
  });
}

export {
  getCategorySub,
  getCategoryChildrenSub
};
