import Tools from '../../../utils/petPlanetTools';
import {staticData} from '../../../constants';

/**
 * 获取砍价商品详情
 * @returns {*}
 */
function getBargainDetail() {
    const {
        id = 0,
        caseId = null
    } = this.state;
    return Tools.request({
        url: 'eshop/campaign/loadCutSaleDetail',
        data: Object.assign({},
            {
                cutSaleNo: id
            }, caseId ? {
                caseId
            } : {}),
        success: (data = {}, header = {}) => {
            const {
                images = [],
                goodsName = '',
                detailImages = [],
                goodsCoverPic = '',
                salePrice = 0,
                floorPrice = 0,
                stock = 0,
                cutPersonTotal = 0,
                cutHourTotal = 0,
                cutSaleNo = '',
                cutSaleCase = {},
                disabled = false
            } = data || {};
            const {caseState = 'FOUNDER', remainPrice = 0, caseId = '', cutSaleState = ''} = cutSaleCase || {};
            this.setState({
                images,
                salePrice,
                floorPrice,
                cutPrice: cutSaleCase ? remainPrice : salePrice,
                coverPic: goodsCoverPic,
                caseId,
                goodsName,
                detailImages,
                stock,
                cutPersonTotal,
                cutHourTotal,
                cutSaleCase,
                cutSaleNo,
                caseState,
                cutSaleState,
                disabled
            });
        },
        fail: (res) => {
            this.setState({
                loading: false
            });
        },
        complete: (res) => {

        }
    });
}

/**
 * 获取普通商品的评价列表
 */
function getCommonCommentList() {
    const {goodsId = 0, pageSize = 20} = this.state;
    let {pageNum = 1} = this.state;
    return Tools.request({
        url: 'eshop/comment/list',
        method: 'post',
        data: {
            goodsId,
            pageNum,
            pageSize
        },
        success: (data = {}, header = {}) => {
            const {
                data: _data = [],
                total = 0
            } = data;
            this.setState({
                commentsList: [..._data],
                comments: [..._data],
                total,
                pageNum: ++pageNum,
                loading: false
            });
        },
        fail: (res) => {
            this.setState({
                loading: false
            });
        },
        complete: (res) => {
        }
    });
}

/**
 * 获取普通商品评价区域列表
 */
function getCommentList() {
    const {
        goodsId = 0,
        pageSize = 20
    } = this.state;
    let {
        comments = [],
        pageNum = 1
    } = this.state;
    let length = 0;
    return Tools.request({
        url: 'eshop/comment/list',
        method: 'post',
        data: {
            goodsId,
            pageNum,
            pageSize
        },
        success: (data = {}, header = {}) => {
            const {
                data: _data = [],
                total = 0
            } = data;
            comments = [...comments, ..._data];
            length = comments.length;
            this.setState({
                comments,
                total,
                pageNum: ++pageNum,
                isShowLoad: length >= total,
                loadStatus: length < total ? staticData.loadStatusConfig.loading : staticData.loadStatusConfig.noMore,
                loading: false
            });
            this.isNext = true;
        },
        fail: (res) => {
            this.setState({
                loading: false
            });
        },
        complete: (res) => {
        }
    });
}

/**
 * 发起砍价
 */
function startCutSale() {
    const {cutSaleNo = ''} = this.state;
    return Tools.request({
        url: 'eshop/campaign/startCutSale',
        method: 'POST',
        data: {
            cutSaleNo
        },
        success: (data = {}, header = {}) => {
            const {cutPrice = 0, caseId = 0} = data;
            this.setState({
                currentCutPrice: cutPrice,
                bargainDialog: false,
                isCutSaleSuccess: true,
                caseId
            }, () => {
                getBargainDetail.call(this);
            });
        },
        fail: (res = {}) => {
        },
        complete: (res = {}) => {
        }
    });
}

/**
 * 助力砍价
 */
function helpCutSale() {
    const {caseId = null} = this.state;
    return Tools.request({
        url: 'eshop/campaign/helpCutSale',
        method: 'POST',
        data: {
            caseId
        },
        success: (data = {}, header = {}) => {
            const {cutPrice = 0} = data;
            this.setState({
                currentCutPrice: cutPrice,
                bargainDialog: false,
                isCutSaleSuccess: true
            }, () => {
                getBargainDetail.call(this);
            });
        },
        fail: (res = {}) => {
        },
        complete: (res = {}) => {
        }
    });
}

const commonDetailAPI = {
    getBargainDetail,
    getCommonCommentList,
    getCommentList,
    startCutSale,
    helpCutSale
};

export default commonDetailAPI
