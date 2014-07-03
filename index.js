/**
 * Author: chenboxiang
 * Date: 14-7-3
 * Time: 下午2:04
 */
"use strict";

var urllib = require("urllib")
var moment = require("moment")
var crypto = require("crypto")
var Buffer = require("buffer").Buffer
var _ = require("lodash")

var SUCCESS_CODE = "000000"

var defaultConfig = {
    // 10 seconds
    timeout: 10000
}

/**
 * @param config
 * @constructor
 */
function Yuntongxun(config) {
    this.config = _.extend({}, defaultConfig, config)

    if (!this.config.accountSid) throw new Error("[config.accountSid] is required")
    if (!this.config.authToken) throw new Error("[config.authToken] is required")
    if (!this.config.baseUrl) throw new Error("[config.baseUrl] is required")
}

// ------------- private methods
/**
 * 发送请求给服务器
 * @param {String} url relative url
 * @param {String} method http method
 * @param {Object} data
 * @private
 */
Yuntongxun.prototype._doRequest = function(url, method, data) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

    url  = this.config.baseUrl + url;
    // ------- 加上sig query string
    var timestamp = _currTimestamp()
    var sig = _md5(this.config.accountSid + this.config.authToken + timestamp)
    url += "?sig=" + sig

    // ------- Authorization Header
    var auth = new Buffer(this.config.accountSid + ":" + timestamp).toString("base64")

    var options = {
        method: method,
        timeout: this.config.timeout,
        dataType: "json",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json;charset=utf-8",
            "Authorization": auth
        },
        content: JSON.stringify(data),
        rejectUnauthorized: false
    }

    function _wrapCallback(callback) {
        return function(err, data, res) {
            // 非200-300的code也算作error
            if (null == err) {
                if (!(res.statusCode >= 200 && res.statusCode < 300)) {
                    err = new Error("The server response error, status code is [" + res.statusCode + "]")
                    err.code = res.statusCode

                } else if (data.statusCode !== SUCCESS_CODE) {
                    err = new Error("The server response error, error code is [" + data.statusCode + "]")
                    err.code = data.statusCode
                }
            }

            callback(err, data, res)
        }
    }

    return function(callback) {
        urllib.request(url, options, _wrapCallback(callback))
    }
}


// ------------- public methods

Yuntongxun.prototype.voiceVerify = function(data) {
    if (!data.appId) data.appId = this.config.appId
    if (!data.appId) throw new Error("[appId] is required")
    if (!data.verifyCode) throw new Error("[verifyCode] is required")
    if (!data.to) throw new Error("[to] is required")

    var url = "/Accounts/" + this.config.accountSid + "/Calls/VoiceVerify"

    return this._doRequest(url, "post", data)
}

// ------------- helpers
/**
 * 生成当前时间戳
 * @returns {String}
 * @private
 */
function _currTimestamp() {
    return moment().format("YYYYMMDDHHmmss")
}

/**
 * @param s
 * @returns {string}
 * @private
 */
function _md5(s) {
    return crypto.createHash("md5").update(s).digest("hex").toUpperCase();
}


module.exports = Yuntongxun