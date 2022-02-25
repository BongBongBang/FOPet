import Taro from "@tarojs/taro";
import mta from "mta-wechat-analysis";
import multipleToNull from "./multipleToNull";
import compareAdd from "./compareAdd";
import requests from "./requests";
import uploadFile from "./uploadFile";
import {getSetting, chooseLocation, authorize, openSetting} from "./getSetting";
import loginCode from "./loginCode";
import {petPlanetPrefix} from "../static";

const PetPlanetTools = (function () {
  //用于表单保存校验的规则
  //@尹文楷
  let verifyList = new WeakMap();
  //用于表单校验的规则函数
  //@尹文楷
  let rulesList = {
    /**
     * 判断输入的、选择的、图片组或者弹浮动窗值是否为空值
     * @尹文楷
     * @param value
     * @param type
     * @param errMsg
     * @returns {boolean}
     */
    isEmpty(value, type, errMsg) {
      if (value === "" || value === false || value === undefined || value === null || value.length === 0) {
        Taro.atMessage({
          type,
          message: errMsg
        });
        return false;
      }
    }
  };

  class PetPlanetTools {
    constructor() {
      this.wx = Taro;
      verifyList.set(this, []);
    }

    /**
     * 用于添加校验规则
     * @param val
     * @param rules
     * @尹文楷
     */
    addRules(val, rules) {
      let list = verifyList.get(this);
      let valList = [];
      if (Object.prototype.toString.call(val) === "[object Array]") {
        valList = [...val];
      } else {
        valList = [val];
      }
      for (let [val_key, val_item] of valList.entries()) {
        rules.forEach((ruleItem, ruleIndex) => {
          list = [...list, (() => {
            let rule = ruleItem["rule"],
              errMsg = ruleItem["errMsg"],
              errMsg_arr = [];
            if (Object.prototype.toString.call(errMsg) === "[object Array]") {
              errMsg_arr = [...errMsg];
            } else {
              errMsg_arr = [errMsg];
            }
            return () => {
              let params = rule.split(":");
              let _rule = params.shift();
              let typeErrMsg = [];
              let type = "";
              params.unshift(val_item);
              typeErrMsg = errMsg_arr[val_key].split(":");
              type = typeErrMsg.shift();
              params = [...params, type, ...typeErrMsg];
              return rulesList[_rule].apply(this, params);
            };
          })()];
        });
      }
      verifyList.set(this, list);
      return this;
    }

    /**
     * 执行校验规则
     * @尹文楷
     */
    execute() {
      let list = verifyList.get(this);
      let _execute;
      for (let [key, value] of list.entries()) {
        _execute = value.apply(this);
        if (_execute === false) {
          this.clear();
          return _execute;
        }
      }
      this.clear();
      return true;
    }

    /**
     * 清空校验规则
     * @尹文楷
     */
    clear() {
      verifyList.set(this, []);
    }

    /**
     * 定义多层处理对象属性值为null的函数
     * 在设置为父级底下多层属性值为null的情况下使用
     * @param state
     */
    toNullAll(state) {
      return multipleToNull(state);
    }

    /**
     * 定义多层处理对象属性值在不按照state模板的情况下,payload添加属性和属性值的情况下使用
     * 概括起来就是用于添加state属性使用
     * @param state
     * @param payload
     * @returns {*}
     */
    compare(state, payload) {
      return compareAdd(state, payload);
    }

    /**
     * wx请求方法封装
     */
    request(params) {
      return requests.apply(this.wx, [params, this]);
    }

    /**
     * wx上传文件方法封装
     * @param params
     */
    uploadFile(params) {
      return uploadFile.apply(this.wx, [params]);
    }

    /**
     * 调用接口获取登录凭证（code）。通过凭证进而换取用户登录态信息，包括用户的唯一标识（openid）及本次登录的会话密钥（session_key）等。用户数据的加解密通讯需要依赖会话密钥完成
     * @尹文楷
     * @param params
     */
    login(params) {
      return loginCode.apply(this.wx, [params]);
    }

    /**
     * 登录,将微信与后台服务器绑定,建立会话
     * @尹文楷
     */
    loginSession(request, params) {
      this.login({
        timeout: 5000,
        success: async (code) => {
          // 登录,将微信与后台服务器绑定,建立会话
          // @尹文楷
          await this.request({
            url: `${petPlanetPrefix}/tinySession/login`,
            method: "GET",
            header: {
              "content-type": "application/json"
            },
            data: {
              code
            },
            success: async (data, header) => {
              await Taro.setStorageSync("petPlanet", header["Set-Cookie"]);
              params["header"]["cookie"] = header["Set-Cookie"];
              await request(params);
            },
            fail: async (res) => {

            },
            complete: async (res) => {

            }
          });
        },
        fail: async (res) => {

        },
        complete: async (res) => {
        }
      });
    }

    /**
     * 获取用户当前的设置
     * @尹文楷
     * @param params
     */
    getSettingConfig(params) {
      return getSetting.apply(this.wx, [params]);
    }

    /**
     * 调起客户端小程序设置界面，返回用户设置的操作结果
     * @尹文楷
     * @param params
     */
    openSettingConfig(params) {
      return openSetting.apply(this.wx, [params]);
    }

    /**
     * 向用户发起授权请求
     * @尹文楷
     * @param params
     */
    authorizeConfig(params) {
      return authorize.apply(this.wx, [params]);
    }

    /**
     * 获取用户当前的位置信息
     * @尹文楷
     * @param params
     */
    chooseLocationConfig(params) {
      return chooseLocation.apply(this.wx, [params]);
    }

    /**
     * onLaunch统计信息初始化
     * @尹文楷
     */
    mtaAppInit() {
      mta.App.init({
        "appID": "500667188",
        "eventID": "500667199",
        "lauchOpts": this.$router.params,
        "statPullDownFresh": true,
        "statShareApp": true,
        "statReachBottom": true
      });
    }
  }

  return new PetPlanetTools();
})();

export default PetPlanetTools;
