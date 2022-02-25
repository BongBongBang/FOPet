import Taro, {Component} from '@tarojs/taro';
import {
  Block,
  View,
  Text,
  Image
} from '@tarojs/components';
import dayjs from 'dayjs';
import {
  AtButton,
  AtCard,
  AtRate,
  AtTextarea
} from 'taro-ui';
import cns from 'classnames';

import {orderTypeConfig} from '../../../../constants';
import * as evaluationApi from './evaluation_service';
import * as constants from './constants';

import 'taro-ui/dist/style/components/flex.scss';
import 'taro-ui/dist/style/components/button.scss';
import 'taro-ui/dist/style/components/card.scss';
import 'taro-ui/dist/style/components/icon.scss';
import 'taro-ui/dist/style/components/rate.scss';

import './index.less';

class Evaluation extends Component {

  config = {
    navigationBarTitleText: '用户点评'
  };

  static options = {
    addGlobalClass: true
  };

  constructor(props) {
    super(props);
  }

  state = {
    //订单信息
    order: {},
    //评分
    score: 5,
    //评价
    mark: ''
  };

  componentWillMount() {
    const {params: {order = ''}} = this.$router;
    const orderItem = JSON.parse(decodeURIComponent(order));
    this.setState({
      order: orderItem
    });
  }

  /**
   * 更改form表单评分输入组件内容
   */
  onRateHandler = (type = '', value = '') => {
    const {[type]: formValue = ''} = this.state;
    value = value.target ? value.target.value : value;
    if ((formValue + .5) === value) {
      value += .5;
    }
    if (formValue !== value) {
      value -= .5;
    }
    this.setState({
      [type]: value
    });
  };

  /**
   * 更改输入组件内容
   */
  onChangeHandler = (type = '', value = '') => {
    this.setState({
      [type]: value
    });
  };

  /**
   * 创建评价
   */
  onEvaluationSubmitHandler = (e = {}) => {
    const {order = {}} = this.state;
    const {orderType = '1'} = order;
    orderTypeConfig[orderType]['getOrderEvaluation'].call(this, ({common = []}) => {
      const {attributes: {optionGroup = [], spuAttributes = []}} = common[0];
      const goodsId = spuAttributes[0]['goodsId'];
      const skuId = optionGroup[0]['skuId'];
      evaluationApi.evaluationAdd.call(this, goodsId, skuId);
    });
    //取消冒泡事件
    e.stopPropagation();
  }


  render() {
    const {
      onEvaluationSubmitHandler = () => {
      }
    } = this;
    const {
      order = {},
      score = 0,
      mark = ''
    } = this.state;
    const {
      onRateHandler = () => {
      },
      onChangeHandler = () => {
      }
    } = this;
    const foster = order['foster'] || {},
      commons = order['common'] || [],
      startTime = foster[0] && foster[0]['startTime'],
      orderType = order['orderType'] || '1',
      endTime = foster[0] && foster[0]['endTime'],
      startTimeMSeconds = new Date(startTime).getTime(),
      endTimeMSeconds = new Date(endTime).getTime(),
      durationTime = Math.round(dayjs(endTimeMSeconds).diff(dayjs(startTimeMSeconds), 'day', true)),
      payment = order['payment'] || '',
      paymentPoint = payment.indexOf('.'),
      paymentInt = payment.slice(0, paymentPoint === -1 ? payment.length : paymentPoint),
      paymentFloat = paymentPoint !== -1 ? payment.slice(paymentPoint) : '.00';
    return (
      <View className='pet-evaluation'>
        <AtCard
          title={orderTypeConfig[orderType]['name']}
          extra={order['orderStatus']}
        >
          <View className='pet-evaluation-goodsDetail'>
            {/*普通商品部分*/}
            {
              orderTypeConfig[orderType]['isCommons'] &&
              commons && commons.length > 0 && commons.map(common => {
                const discPrice = parseFloat(common.price).toFixed(2),
                  discPricePoint = discPrice.indexOf('.'),
                  discIntPrice = discPrice.slice(0, discPricePoint === -1 ? discPrice.length : discPricePoint),
                  discFloatPrice = discPricePoint !== -1 ? discPrice.slice(discPricePoint) : '.00';
                return (
                  <Block>
                    <Image className='pet-evaluation-goodsDetail-avatar'
                           src={common['pic']}
                           mode='aspectFill'
                    />
                    <View className={cns(
                      'pet-evaluation-goodsDetail-content'
                    )}>
                      <View className='pet-evaluation-goodsDetail-content-title'
                            selectable
                      >
                        {common['name']}
                      </View>
                      <View className='pet-evaluation-goodsDetail-content-desc'
                            selectable
                      >
                        {common.attributes['optionGroup'][0]['optionName']}
                      </View>
                    </View>
                    <View className='pet-evaluation-goodsDetail-priceNum'>
                      <View className='pet-evaluation-goodsDetail-priceNum-discPrice'>
                        <Text
                          className='pet-evaluation-goodsDetail-priceNum-discPrice-symbol'>
                          &#165;
                        </Text>
                        {discIntPrice}
                        <Text className='pet-evaluation-goodsDetail-priceNum-discPrice-float'>
                          {discFloatPrice}
                        </Text>
                      </View>
                      <View className='pet-evaluation-goodsDetail-priceNum-num'>
                        x{common.num}
                      </View>
                    </View>
                  </Block>
                )
              })
            }
            {/*普通商品医疗咨询部分*/}
            {
              orderTypeConfig[orderType]['isMedical'] &&
              commons && commons.length > 0 && commons.map(common => {
                return (
                  <Block>
                    <Image className='pet-evaluation-goodsDetail-avatar'
                           src={common['pic']}
                           mode='aspectFill'
                    />
                    <View className={cns(
                      'pet-evaluation-goodsDetail-content',
                      'pet-evaluation-goodsDetail-content-medical'
                    )}>
                      <View className='pet-evaluation-goodsDetail-content-title'
                            selectable
                      >
                        {common['name']}
                      </View>
                      <View className={cns(
                        'pet-evaluation-goodsDetail-content-desc'
                      )}
                            selectable
                      >
                        {common.attributes['optionGroup'][0]['optionName']}
                      </View>
                    </View>
                  </Block>
                )
              })
            }
            {/*寄养家庭部分*/}
            {
              orderTypeConfig[orderType]['isFoster'] &&
              foster && foster.length > 0 && foster.map(fosterItem => {
                return (
                  <Block>
                    <Image className='pet-evaluation-goodsDetail-avatar'
                           src={fosterItem['merchantPic']}
                           mode='aspectFill'
                    />
                    <View className={cns(
                      'pet-evaluation-goodsDetail-content',
                      'pet-evaluation-goodsDetail-content-foster'
                    )}>
                      <View className='pet-evaluation-goodsDetail-content-title'
                            selectable
                      >
                        {fosterItem['merchantName']}
                      </View>
                      <View className='pet-evaluation-goodsDetail-content-desc'
                            selectable
                      >
                        {fosterItem['merchantAddress']}
                      </View>
                    </View>
                  </Block>
                )
              })
            }
          </View>
          {/*寄养家庭的寄养期限*/}
          {
            orderTypeConfig[orderType]['isFoster'] &&
            <View className='pet-evaluation-goodsDetail-time'>
              <Text className='pet-evaluation-goodsDetail-time-duration'>
                {startTime} 至 {endTime}
              </Text>
              <Text>
                {durationTime}天
              </Text>
            </View>
          }
          <View className={cns(
            'pet-evaluation-goodsDetail-total'
          )}>
            <View className='pet-evaluation-goodsDetail-total-container'>
              合计: <Text className='pet-evaluation-goodsDetail-total-symbol'>
              ¥
            </Text>{paymentInt}<Text className='pet-evaluation-goodsDetail-total-float'>
              {paymentFloat}
            </Text>
            </View>
          </View>
        </AtCard>
        <View className='pet-evaluation-rate'>
          <View className={cns(
            'at-row',
            'pet-evaluation-rate-detail'
          )}>
            <View className={cns(
              'at-col',
              'at-col-2'
            )}>
              {
                orderTypeConfig[orderType]['isCommons'] ? '商品评分' : '服务评分'
              }
            </View>
            <View className={cns(
              'at-col',
              'at-col-9',
              'pet-evaluation-rate-detail-score'
            )}>
              <AtRate
                value={score}
                size={22}
                max={5}
                margin={12}
                onChange={(value = '') => onRateHandler('score', value)}
              />
              <Text className='pet-evaluation-rate-detail-score-detail'>
                {score}星
              </Text>
            </View>
          </View>
        </View>
        <View className='pet-evaluation-mark'>
          <AtTextarea
            value={mark}
            count={false}
            textOverflowForbidden={false}
            height={184}
            className='pet-evaluation-mark-detail'
            placeholder={constants.publish.placeholder.desc}
            onChange={(value = '') => onChangeHandler('mark', value)}
          />
        </View>
        <View className='pet-evaluation-submit'>
          <AtButton
            type='primary'
            lang='zh_CN'
            onClick={onEvaluationSubmitHandler}
          >
            提交自评
          </AtButton>
        </View>
      </View>
    )
  }
}

export default Evaluation;
