import React, {Component} from 'react';
import Taro, {Current} from '@tarojs/taro';
import {
  Block,
  Image,
  View
} from '@tarojs/components';
import {
  AtIcon,
  AtTextarea,
  AtButton,
  AtMessage
} from 'taro-ui';
import {connect} from 'react-redux';
import mta from 'mta-wechat-analysis';
import cns from 'classnames';
import {
  LdmImagePicker
} from 'ldm-taro-frc';

import {pageCurrentList, loadingStatus, petPlanetPrefix} from '../../../constants';
import {
  LoadingView,
  ModalView
} from '../../../components/bussiness-components';
import Tools from '../../../utils/petPlanetTools';
import topicsAPI from '../topics_service';
import * as constants from './constants';
import {maxFileSize} from '../../../utils/petPlanetTools/constants';
import {setFlowTopicAttrValue} from './flowTopics/flowTopics_action';

import '../../commons/iconfont/iconfont.scss';
import './index.scss';

@connect((state) => {
  return {
    flowTopicStore: state.flowTopicStore
  };
}, (dispatch) => {
  return {
    /**
     * 保存选中的话题对象
     * @param payload
     */
    setFlowTopicAttrValueHandler: payload => {
      dispatch(setFlowTopicAttrValue(payload));
    }
  };
})

class FlowPublish extends Component {
  constructor(props) {
    super(props);
    //能够上传图片数量的最大值
    this.count = 9;
  }

  state = {
    //是否显示添加图片按钮
    showAddBtn: true,
    //动态的可添加的图片的数量
    moveCount: 9,
    //上传图片是否存在loading
    uploadLoading: false,
    //用来提示用户需要审核才能发布
    reviewModal: false,
    //用于对于发现动态的描述
    content: null,
    //用于上传动态的图片
    files: [],
    //用于上传的图片
    images: []
  };

  componentWillMount() {
    const {params: {topic, img}} = Current.router;
    const {setFlowTopicAttrValueHandler} = this.props;
    topic && setFlowTopicAttrValueHandler({
      topic: {
        topic,
        img
      }
    });
    mta.Page.init();
  }

  /**
   * 组件在挂载时,要执行的任务
   */
  componentDidMount() {
  }

  /**
   * 在显示此发布路由页面时进行的操作
   * @returns {Promise<void>}
   */
  componentDidShow() {

  }

  componentWillUnmount() {
    const {setFlowTopicAttrValueHandler} = this.props;
    setFlowTopicAttrValueHandler({
      topic: null
    });
  }

  /**
   * 改变输入框的内容
   * @尹文楷
   * @returns {Promise<void>}
   */
  onTextChangeHandler = (key, event) => {
    let value;
    value = Object.prototype.toString.call(event) === '[object Object]' ? event.target.value : event;
    this.setState({
      [key]: value
    });
  };

  /**
   * 获取用户信息并发布宠物交易
   */
  onGetUserInfoHandler = async (event) => {
    const {verify} = this;
    let {authSetting} = await Tools.getSettingConfig({
      success: (authSetting) => {
        return authSetting;
      },
      fail: (res) => {
        return res;
      },
      complete: (res) => {
        return res;
      }
    });
    if (!authSetting['scope.userInfo']) {
      Taro.navigateTo({
        url: `${pageCurrentList[20]}?pages=flowPublish`
      });
    } else {
      Tools.run(function* () {
        mta.Event.stat('user_authorization', {});
        if (verify()) {
          let publishData = yield topicsAPI.flowPostsPublish.apply(this);
          mta.Event.stat('publish_onPublish', {});
        }
      }.bind(this));
    }
    event.stopPropagation();
  };

  /**
   * 添加图片前执行的动作
   */
  onImageAddBeforeHandler = () => {
    this.setState({
      uploadLoading: true
    });
    this.setState({
      files: [],
      images: []
    });
  };

  /**
   * 添加图片上传前执行的动作
   */
  onImageAddUploadBeforeHandler = (file) => {
    const {file: {size}} = file;
    //图片的限制大小
    if (size > maxFileSize) {
      this.setState({
        uploadLoading: false
      });
    }
  };

  /**
   * 添加并上传图片
   * @param data
   * @param statusCode
   */
  onImageAddHandler = (data, statusCode, {
    value = '',
    key = 0,
    total = 0
  }) => {
    const {count} = this;
    let {files = [], images = []} = this.state;
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
  };

  /**
   * 移除图片选择器的内容
   * @param files
   * @param index
   */
  onImageRemoveHandler = (files, index) => {
    let {files: fileList = [], images = []} = this.state;
    const {count} = this;
    fileList.splice(index, 1);
    images.splice(index, 1);
    const {length: _length} = images;
    this.setState({
      moveCount: count - _length
    });
    if (_length < count) {
      this.setState({
        showAddBtn: true
      });
    }
    this.setState({
      files: fileList,
      images
    });
  };

  /**
   * 用于表单校验的规则函数
   * @尹文楷
   * @returns {Promise<void>}
   */
  verify = () => {
    const {content, images} = this.state;
    return Tools.addRules([
      content,
      images
    ], [{
      rule: 'isEmpty',
      errMsg: constants['verify']['isEmpty']
    }]).execute();
  };

  /**
   * 跳转到发现页面
   * @尹文楷
   */
  redirectToPreviousPage = () => {
    this.setState({
      reviewModal: false
    }, () => {
      Taro.reLaunch({
        url: pageCurrentList[0]
      });
    });
  };

  /**
   * 点击图片放大查看
   */
  onImagePreviewHandler = index => {
    const {files: fileList = []} = this.state;
    const previewImageFileList = fileList.map(item => {
      return item['url'];
    });
    Tools.previewImageConfig({
      current: previewImageFileList[index],
      urls: previewImageFileList,
      success: (res) => {
        console.log(res);
      },
      fail: (res) => {
        console.log(res);
      },
      complete: (res) => {
        console.log(res);
      }
    });
  };

  /**
   * 跳转到发现页面
   * @尹文楷
   */
  redirectToFlowTopicPage = (e) => {
    //取消冒泡
    e.stopPropagation();
    Taro.navigateTo({
      url: pageCurrentList[18]
    });
  };

  render() {
    const {
      onGetUserInfoHandler = () => {
      },
      onTextChangeHandler = () => {
      },
      onImageAddHandler = () => {
      },
      onImageAddBeforeHandler = () => {
      },
      onImageAddUploadBeforeHandler = () => {
      },
      onImageRemoveHandler = () => {
      },
      redirectToPreviousPage = () => {
      },
      redirectToFlowTopicPage = () => {
      },
      onImagePreviewHandler = () => {
      }
    } = this;
    const {
      showAddBtn,
      moveCount,
      uploadLoading,
      files,
      content,
      reviewModal
    } = this.state;
    const {flowTopicStore: {topic = {}}} = this.props;
    return (
      <Block>
        {
          uploadLoading && <LoadingView
            size={56}
            color='#fb2a5d'
            className='pet-flowPublish-loading'
            content={loadingStatus.upload.text}
          />
        }
        <View
          className='pet-flowPublish'
        >
          <AtMessage/>
          <View className='pet-flowPublish-publish'>
            <View className='pet-flowPublish-publish-content'>
              <View className='pet-flowPublish-publish-content-top'>
                <AtTextarea
                  count={false}
                  textOverflowForbidden={false}
                  height={520}
                  value={content || ''}
                  placeholderStyle='font-size:17PX;font-weight:400;color:#999;'
                  onChange={(e) => {
                    onTextChangeHandler('content', e);
                  }}
                  placeholder={constants.publish.placeholder.content}
                  className='pet-flowPublish-publish-content-description'
                />
                <LdmImagePicker
                  action={`${petPlanetPrefix}/tinyStatics/uploadImg/v2`}
                  name='file'
                  data={{
                    type: constants.uploadPrefix
                  }}
                  mode='aspectFill'
                  length={4}
                  multiple
                  className='pet-flowPublish-publish-content-images'
                  files={files}
                  count={moveCount}
                  showAddBtn={showAddBtn}
                  onImageClick={onImagePreviewHandler}
                  onAdd={onImageAddHandler}
                  onAddBefore={onImageAddBeforeHandler}
                  onAddUploadBefore={onImageAddUploadBeforeHandler}
                  onRemove={onImageRemoveHandler}
                  onRemoveBefore={() => {
                  }}
                />
              </View>
              <View className='pet-flowPublish-publish-content-bottom'>
                <View
                  className={cns('at-row',
                    'at-row--no-wrap',
                    'pet-flowPublish-publish-content-topic'
                  )}
                >
                  <View className={cns('at-col',
                    'at-col-2',
                    'pet-flowPublish-publish-content-topic-title'
                  )}>
                    {constants.publish.label.adoption}
                  </View>
                  <View className={cns('at-col',
                    'at-col-9',
                    'pet-flowPublish-publish-content-topic-content'
                  )}
                        onClick={redirectToFlowTopicPage}
                  >
                    {
                      Tools.isEmpty(topic) ? <Block>
                        #点击选择
                      </Block> : <View className='pet-flowPublish-publish-content-topic-info'>
                        <Image
                          src={topic.img}
                          mode='widthFix'
                        />
                        {topic['topic']}
                      </View>
                    }
                    <View className='pet-flowPublish-publish-content-topic-all'>
                      全部
                      <AtIcon
                        size={16}
                        color='rgb(223,223,223)'
                        className='pet-flowPublish-publish-content-topic-content-icon'
                        prefixClass='iconfont'
                        value='petPlanet-right'
                      />
                    </View>
                  </View>
                </View>
              </View>
              <View className='pet-flowPublish-publish-content-button'>
                <AtButton
                  type='primary'
                  lang='zh-CN'
                  onClick={onGetUserInfoHandler}
                >
                  发布
                </AtButton>
              </View>
              <ModalView
                isOpened={reviewModal}
                title={constants.modal.review.title}
                confirmText={constants.modal.review.confirmText}
                content={constants.modal.review.content}
                onConfirm={redirectToPreviousPage}
                closeOnClickOverlay={false}
              />
            </View>
          </View>
        </View>
      </Block>
    )
  }
}

export default FlowPublish;
