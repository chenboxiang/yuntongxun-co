/**
 * Author: chenboxiang
 * Date: 14-7-3
 * Time: 下午3:43
 */
"use strict";

var Yuntongxun = require("../index")
var expect = require("expect.js")

var accountSid = process.env.ACCOUNT_SID
var authToken = process.env.AUTH_TOKEN
var appId = process.env.APP_ID
var to = process.env.TO

describe("Yuntongxun", function() {
    before(function() {
        this.yuntongxun = new Yuntongxun({
            accountSid: accountSid,
            authToken: authToken,
            baseUrl: "https://sandboxapp.cloopen.com:8883/2013-12-26",
            appId: appId
        })
    })

    describe("#voiceVerify(data)", function() {
        it("should send voice verify successfully", function(done) {
            this.yuntongxun.voiceVerify({
                verifyCode: "123456",
                to: to,
                playTimes: "2"

            })(function(err, data, res) {
                expect(err).to.be(null)
                done()
            })
        })
    })
})