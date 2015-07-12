/**
 *	移动端浏览器查看log
 */
// get the mobile device
(function(){
	var userAgent = navigator.userAgent.toLowerCase();
	window.device = {};
	device.isMobile     = _find("iphone") || _find("android");

	function _find(deviceNameInLowerCase){
		return userAgent.indexOf(deviceNameInLowerCase) !== -1;
	}
})();

// store all the consolelogs
var mLogger = "";
if(window.device.isMobile) {
	window.console.log = function(_log){
		var _now = new Date();
		mLogger = mLogger + "[" + _now.getSeconds()+","+_now.getMilliseconds() + "]" + _log.toString() + "<br /><br />";
	}
}

// print the consolelogs to the element
function fShowConsole() {
	if($("#logBlock")[0]) {
		return;
	}
	var logBlock = '<div id="logBlock" style="overflow: auto;position: absolute;z-index: 999999;left: 0;right: 0;top: 0;bottom: 0;box-sizing: border-box;padding: 20px;background: rgba(0,0,0,.9);color: #fff;"></div>'
	$('body').append(logBlock);
	$('#logBlock').html(mLogger);
	$('#logBlock').click(function() {
		$(this).remove();
	});
}

// show the element that mentioned above
$("body").on( "taphold", function() {
	fShowConsole();
});



/**
 *	global function
 */
// set module height
function fSetHeight(targetId) {
	var height = $(window).height() > $(document).outerHeight() ? $(window).height() : $(document).outerHeight();
	$(targetId).height(height);
}

// setProportion
function fSetProportion() {

	// boy's head
	var winWidth = $(window).width(), widHeight = $(window).height();
	var headWidth = 0.74;
    var headHeight = (winWidth * headWidth * 660) / (widHeight * 800); // 头部的原始宽高为800x660
    var headLeft = (1 - headWidth) / 2;
    var headTop = 0.22;
    $('#js_boyHead').css({
    	'width': headWidth.num2Percent(0),
    	'height': headHeight.num2Percent(0),
    	'left': headLeft.num2Percent(0),
    	'top': headTop.num2Percent(0)
    });

    // boy's body
    var bodyWidth = 0.48;
    var bodyHeight = (winWidth * bodyWidth * 653) / (widHeight * 522); // 身体的原始宽高为522x653
    var bodyLeft = (1 - bodyWidth) / 2 - 0.02;
    var bodyTop = headTop + headHeight - 0.03;
    $('#js_boyBody').css({
		'width': bodyWidth.num2Percent(0),
    	'height': bodyHeight.num2Percent(0),
    	'left': bodyLeft.num2Percent(0),
    	'top': bodyTop.num2Percent(0)
    });

}

// number to percent
Number.prototype.num2Percent = function(n) {
	n = n || 0;
	return ( Math.round( this * Math.pow( 10, n + 2 ) ) / Math.pow( 10, n ) ).toFixed( n ) + '%';
}

// 分享浮层
$('#js_guide2Share').bind('tap', function(e) {
	$(this).hide();
	return false;
});

// 跳转到结果页
function fGo2Fin(_score) {
	$('#js_beatIndex').hide();
	$('#js_beatResult').show();
	$('#js_resultScore').text(_score);
}
function fGo2OwnerFin(_ownerScore, _wxuid, _nickname, _imgUrl, _info) {
	fGo2Fin(_ownerScore);
	if(_ownerScore == mTotalScore && mAwardCode) {
		$('#js_resultTips').html('你已完成任务！<br />请牢记抽奖号码：<span style="font-size: 20px;">' + mAwardCode + '</span>，<br />赶快登陆闰土参加活动吧！');
		$('#js_resultBtn').html('立即下载闰土').bind('tap', function() {
			location.href = 'http://h5.iorcas.com/h5/download?from=hd_beattheboy';
		});
		$('#js_resultLink').css('display', 'none');
		fShareGameEnd();
	}
	else {
		$('#js_resultTips').html('分数未够，快找好友帮你完成任务吧！');
		$('#js_resultBtn').html('找好友接力').bind('tap', function() {
			$('#js_guide2Share').show();
			return false;
		});
		$('#js_resultLink').html('不服重打（好友接力分数不会清零的哟）').bind('tap', function() {
			// 刷新页面不行，不会改变code，server端会报错
			// 发起者重打，带retry
			location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx5ab2bd8ff19f4788&redirect_uri=http%3A%2F%2Fh5.iorcas.com%2Fhd%2Fbeattheboy%2Frelease%2Fhtml%2Fbeat.html%3Fretry=true&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect';
		});
		fShareGameFin(_ownerScore, _wxuid, _nickname, _imgUrl);
	}
	$('#js_resultLink').after('<div style="width: 86%;margin: 5% auto 0;color: #999;">' + _info + '</div>');
	fSetHeight('#js_beatResult');
}
function fGo2RelayFin(_wxuid, _ownerScore, _relayScore) {
	fGo2Fin(_relayScore);
	if(!_ownerScore) {
		_ownerScore = 0;
	}
	var remindPoint = mTotalScore - _ownerScore - _relayScore;
	if(remindPoint > 0) {
		$('#js_resultTips').html('抱歉，你还差' + remindPoint + '分，未能为好友完成任务');
		$('#js_resultBtn').html('我要再试试').bind('tap', function() {
			// 刷新页面不行，不会改变code，server端会报错
			// 接力者重打，带wxuid、发起者分享得分、retry
			location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx5ab2bd8ff19f4788&redirect_uri=http%3A%2F%2Fh5.iorcas.com%2Fhd%2Fbeattheboy%2Frelease%2Fhtml%2Fbeat.html%3Fwxuid=' + _wxuid + '%26shareScore=' + _ownerScore + '%26retry=true&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect';
		});
		$('#js_resultLink').html('发起自己狂p熊孩子活动').bind('tap', function() {
			// 刷新页面不行，不会改变code，server端会报错
			// 接力者自己发起
			location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx5ab2bd8ff19f4788&redirect_uri=http%3A%2F%2Fh5.iorcas.com%2Fhd%2Fbeattheboy%2Frelease%2Fhtml%2Fbeat.html&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect';
		});
		fShareGameEnd();
	}
	else {
		$('#js_resultTips').html('恭喜！<br />你已为好友完成任务');
		$('#js_resultBtn').html('发起自己的狂P熊孩子活动').bind('tap', function() {
			// 刷新页面不行，不会改变code，server端会报错
			// 接力者自己发起
			location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx5ab2bd8ff19f4788&redirect_uri=http%3A%2F%2Fh5.iorcas.com%2Fhd%2Fbeattheboy%2Frelease%2Fhtml%2Fbeat.html&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect';
		});
		$('#js_resultLink').css('display', 'none');
		fShareGameEnd();
	}
	fSetHeight('#js_beatResult');
}

// 游戏结束
var fGameOverData = function(_gameScore) {
	var func = function() {
		setTimeout(function() {
			fGo2OwnerFin(_gameScore, mWXUid, mWXNickname, mWXHeadImgUrl, ' ');
		}, 2000);
	}
	fGameSetRecord(_gameScore, func);
};
var fGameOver =	function() {
	console.log('游戏结束');
	$('#js_beatEnd').show();
	setTimeout(function() {
		$('#js_beatEnd').addClass('qui_mask_BeatEnd_Show');
	}, 0);
	$('#js_beatGradeTime .grade').addClass('ani_grade');

	var gameScore = $('#js_beatGetPoint').text();
	fGameOverData(gameScore);
}

// 游戏主体
function fGameBeat() {

	fShareGameEnd();

	/**
	 *	默认开始的动画
	 */
	fSetProportion();
	$('#js_boyHead').addClass('ani_headProvoke');
	setTimeout(function() {
		$('#js_beatHandLeft').addClass('ani_leftHand');
		$('#js_beatHandRight').addClass('ani_rightHand');
	}, 0);


	/**
	 *	游戏开始倒计时
	 * 	游戏过程倒计时
	 *	游戏结束
	 */
	var mBeginTime = 3;				// 开始倒计时 
	var mGameTime = 10;				// 游戏倒计时
	var mEndInterval;				// 游戏结束Timer
	var mBeatBackFlag = true;		// 还击flag
	var mSingleScore = 7;				// 单击得分
	var mDoubleScore = 14;			// 连击得分
	var mReduceScore = 7;			// 还击减分

	$("#begin_start").bind('tap', function() {
		$("#js_beatRuleHead").hide();
		$("#js_beatRuleCnt").hide();
		fCountDownBeginTime(mBeginTime);
	});

	// 游戏开始倒计时
	function fCountDownBeginTime(time) {
		$("#js_introCnt").text(time);
		var beginInterval = setInterval(function() {
			time--;
			if (time <= 0) {
				clearInterval(beginInterval);
				$("#js_introCnt").text("开始!");
				setTimeout(function() {
					$("#js_beatIntro").hide();
					$("#js_beatGradeTime").show();
					fCountDownGameTime(mGameTime);
				}, 1000);
				return false;
			}
			$("#js_introCnt").text(time);
		}, 1000);
	}

	// 游戏过程倒计时
	function fCountDownGameTime(time) {
		$("#js_remainTime").text(time);
		mEndInterval = setInterval(function() {
			mBeatBackFlag = true;
			time--;
			$("#js_remainTime").text(time);
			if (time <= 0) { //游戏结束
				clearInterval(mEndInterval);
				setTimeout(function() {
					fGameOver();	
				}, 1000);
				return false;
			} else if (time <= 3) { //开始连击		
				$('#js_beatHit').hide();
				$('#js_beatDbHit').show();
			}
		}, 1000);
	}


	/**
	 *	出拳
	 */
	var mBeatCount = 0;
	var mFlag = 0; // 表示出左拳
	var mTimeoutLeft, mTimeoutRight;
	var mTimeLeft = new Date().getTime();
	var mTimeRight = new Date().getTime();

	function fLeftHandBeat() {
		// console.log('出左拳');
		mFlag = 1;
		clearTimeout(mTimeoutRight);
		$('#js_beatHandRight').removeClass('beat_hand_Right_Hit');
		$("#js_beatHandLeft").addClass('beat_hand_Left_Hit');
		$('#js_boyHead img').css({
			"top": "-100%"
		});
		mTimeoutLeft = setTimeout(function() {
			if (mFlag == 1) {
				fSwitchFace(mBeatCount);
			}
			// console.log("距下一拳间隔大于500ms，收拳");
		}, 500);
	}

	function fRightHandBeat() {
		// console.log('出右拳');
		mFlag = 0;
		clearTimeout(mTimeoutLeft);
		$('#js_beatHandLeft').removeClass('beat_hand_Left_Hit');
		$("#js_beatHandRight").addClass('beat_hand_Right_Hit');
		$('#js_boyHead img').css({
			"top": "-200%"
		});
		mTimeoutRight = setTimeout(function() {
			if (mFlag == 0) {
				fSwitchFace(mBeatCount);
			}
			// console.log("距下一拳间隔大于500ms，收拳");
		}, 500);
	}

	// 单击出拳
	$("#js_beatHit").bind('tap', function() {
		$('#js_beatVoice').get(0).currentTime = 0;
		$('#js_beatVoice').get(0).play();
		
		$('#js_boyHead').removeClass('ani_headProvoke ani_headDizzy ani_headCry');
		if (mFlag == 0) {
			fLeftHandBeat();
			mTimeLeft = new Date().getTime();
		} else if (mFlag == 1) {
			fRightHandBeat();
			mTimeRight = new Date().getTime();
		}
		fBeatBack();
		var timeInterval = Math.abs(mTimeLeft - mTimeRight);
		if (timeInterval >= 500) {
			mBeatCount += mSingleScore;
		} else if (timeInterval < 500) {
			mBeatCount += mSingleScore;
		}
		// console.log('距上一拳的间隔：' + timeInterval + 'ms');
		$("#js_beatGetPoint").text(mBeatCount);
	});
	
	// 连击出拳，最后三秒触发连击效果
	$('#js_beatDbHit').bind('tap', function() {
		$('#js_beatVoice').get(0).currentTime = 0;
		$('#js_beatVoice').get(0).play();
		
		if (mFlag == 0) {
			fLeftHandBeat();
			$('#js_beatHandBtmLeft').css({
				top: "57%"
			});
			$('#js_beatHandBtmRight').css({
				top: "65%"
			});
		} else if (mFlag == 1) {
			fRightHandBeat();
			$('#js_beatHandBtmLeft').css({
				top: "65%"
			});
			$('#js_beatHandBtmRight').css({
				top: "57%"
			});
		}
		mBeatCount += mDoubleScore;
		$("#js_beatGetPoint").text(mBeatCount);
	});

	// 小孩还手
	function fBeatBack() {
		var temp = fGetRandom(1,10);
		if (temp == 2 && mBeatCount > 0 && mBeatBackFlag == true) { //二十分之一的几率
			// console.log('还击');
			var lefttime = $('#js_remainTime').text();
			clearInterval(mEndInterval);
			mBeatBackFlag=false;
			$('#js_boyHead img').css({
				'top': '-300%'
			});
			$("#js_beatBack").addClass('beat_beatBack_Show');
			clearTimeout(mTimeoutLeft);
			clearTimeout(mTimeoutRight);	
			$('body').addClass('ani_beatBack');
			mBeatCount -= mReduceScore;
			$("#js_beatReduce").html('<h1>' + '-' + mReduceScore + '</h1>');
			// debugger;
			setTimeout(function() {
				fSwitchFace(mBeatCount);
				$("#js_beatBack").removeClass('beat_beatBack_Show');
				$('body').removeClass('ani_beatBack');
				$("#js_beatReduce").html('');
			}, 1000);
			setTimeout(function(){
				fCountDownGameTime(lefttime);
			},500);
		}
	}

	// 产生m-n的随机数两端均包含
	function fGetRandom(m, n) {
		return Math.ceil(Math.random() * (n - m) + m);
	}

	// 脸变化 长时间不点击放下手
	function fSwitchFace(count) {
		$("#js_beatHandLeft").removeClass('beat_hand_Left_Hit');
		$('#js_beatHandRight').removeClass('beat_hand_Right_Hit');
		$('#js_beatHandBtmLeft').css({
			'top': "100%"
		});
		$('#js_beatHandBtmRight').css({
			'top': "100%"
		});
		if (count > 55) {
			$('#js_boyHead img').css({
				'top': "-600%"
			});
			$('#js_boyHead').addClass('ani_headCry');
		} else if (count > 40) {
			$('#js_boyHead img').css({
				'top': "-500%"
			});
			$('#js_boyHead').addClass('ani_headDizzy');
		} else if (count > 20) {
			$('#js_boyHead img').css({
				'top': "-400%"
			});
			$('#js_boyHead').addClass('ani_headDizzy');
		} else {
			$('#js_boyHead img').css({
				'top': "0%"
			});
			$('#js_boyHead').addClass('ani_headProvoke');
		}
	}

}



/**
 *	微信分享相关
 */
// 通过config接口注入权限验证配置
function fWXConfig() {
	var signUriParams = location.pathname + (location.search && "" != location.search ? location.search : "");
	var signUrl = 'http://h5.iorcas.com/h5/jsapi?type=wx&uri=' + encodeURIComponent(signUriParams);
	$("head").append("<script src='" + signUrl + "'></script>");
}

function fWXShareContent(sDesc, sUrl, sImgUrl) {
	var sDesc = sDesc, sUrl = sUrl, sImgUrl = sImgUrl;
	wx.ready(function() {

		wx.checkJsApi({
	      jsApiList: [
	        'onMenuShareAppMessage',
	        'onMenuShareTimeline'
	      ],
	      success: function (res) {
	        console.log(JSON.stringify(res));
	      }
	    });

		var shareData = {
			title: '接力狂P熊孩子，话费等着你！',
			desc: sDesc,
			link: sUrl,
			imgUrl: sImgUrl,
			success: function() {
				$('#js_guide2Share').hide();
			},
			cancel: function () {
		      	$('#js_guide2Share').hide();
		    }

		};
		// console.log('title: ' + shareData.title + '<br />desc: ' + shareData.desc + '<br />link: ' + shareData.link);
		wx.onMenuShareAppMessage(shareData);
		wx.onMenuShareTimeline(shareData);
	});

	wx.error(function(res) {
	  console.log('游戏结束，分享errMsg: ' + res.errMsg);
	});
}
// 游戏结束但分数未够
function fShareGameFin(_singleSore, _wxuid, _nickname, _imgUrl) {
	var shareDesc = _nickname + '还差' + (mTotalScore - _singleSore) + '分就有机会赢得话费啦！快帮帮他吧！';
	var shareUrl = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx5ab2bd8ff19f4788&redirect_uri=http%3A%2F%2Fh5.iorcas.com%2Fhd%2Fbeattheboy%2Frelease%2Fhtml%2Fbeat.html%3Fwxuid=' + _wxuid + '%26shareScore=' + _singleSore + '&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect';
	var shareImgUrl = _imgUrl;
	fWXShareContent(shareDesc, shareUrl, shareImgUrl);
}
// 游戏结束且分数已够 || 游戏没结束
function fShareGameEnd() {
	var shareDesc = '接力狂P熊孩子，话费等着你！';
	var shareUrl = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx5ab2bd8ff19f4788&redirect_uri=http%3A%2F%2Fh5.iorcas.com%2Fhd%2Fbeattheboy%2Frelease%2Fhtml%2Fbeat.html&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect';
	var shareImgUrl = 'http://static.iorcas.com/tuiguang/20150707_beatboy/images/fist.png';
	fWXShareContent(shareDesc, shareUrl, shareImgUrl);
}



/**
 *	与服务器交互
 */
// 获取url有效信息
function fGetUrlQueryString(qstring) {
	var splitUrl = qstring.split("?");
	var strUrl = (splitUrl.length > 1) ? decodeURIComponent(splitUrl[1]).split("&") : [];
	var str = "";
	var obj = {};
	for (var i = 0, l = strUrl.length; i < l; i++) {
		str = strUrl[i].split("=");
		obj[str[0]] = str[1];
	}
	return Array.prototype.sort.call(obj);
}
var mUrlParams = fGetUrlQueryString(window.location.search);
var mWXCode = mUrlParams.code;	// required
console.log('WXCode: ' + mWXCode);
var mError = false;
// if(!mWXCode) {
// 	console.log('required parameter ["code"]');
// 	mError = true;
// }
// if(mError) {
// 	throw 'illegal parameters, common.';
// }
var mGetUrlWXUid;
if(mUrlParams.wxuid) {
	mGetUrlWXUid = mUrlParams.wxuid;
	console.log('GetUrlWXUid: ' + mGetUrlWXUid);
}
// 分享url中带发起者当前的得分，与服务器存储的得分无关
var mGetUrlShareScore;
if(mUrlParams.shareScore) {
	mGetUrlShareScore = mUrlParams.shareScore;
	console.log('GetUrlShareScore: ' + mGetUrlShareScore);
}
// 重打url标识
var mGetUrlRetry;
if(mUrlParams.retry) {
	mGetUrlRetry = mUrlParams.retry;
	console.log('GetUrlRetry: ' + mGetUrlRetry);
}

// 请求、返回
var mTotalScore = 999;
var mGameID = 1;
var mWXUid;                   // 微信授权uid
var mWXNickname;              // 微信授权昵称
var mWXHeadImgUrl;            // 微信授权头像
var mWXToken;                 // 微信授权token
var mOwnerScore;              // 发起者分数
var mRelayScore;              // 接力者分数
var mAwardCode;               // 完成获奖码

// 初始参与（url中无wxuid）
function fGameInit() {
	var postData = {
		"var": {
			"gameId": mGameID,		// 小游戏编号，由1开始，前端开发同事自己往上编即可
			"code": mWXCode			// from weixin oauth
		}
	}
	console.log('GameInit import: ' + JSON.stringify(postData));
	$.ajax({
		type: "POST",
		url: "http://h5.iorcas.com/h5/jsapi/wx?func=game:init",
		data: JSON.stringify(postData),
		dataType: "json",
		contentType: "application/json",
		success: function(jData, sState, oRequest) {
			if (sState) {
				console.log('GameInit success sState: ' + sState);
				console.log('GameInit export: ' + JSON.stringify(jData));
			}
			if (jData.code === "S_OK") {
				mWXUid = jData.var.wxUser.wxUid;
				mWXNickname = jData.var.wxUser.nickname;
				mWXHeadImgUrl = jData.var.wxUser.headimgurl;
				mWXToken = jData.var.token;

				fGetRecordAndRelayRecordsAndAward();
			}
			else {
				console.log('GameInit jData.code: ' + jData.code);
			}
		},
		error: function() {
			console.log('ajax error');
		}
	});
}

// 接力参与（url中有wxuid）
function fGameRelay() {
	var postData = {
		"var": {
			"targetWxUid": mGetUrlWXUid,
			"gameId": mGameID,
			"code": mWXCode
		}
	}
	console.log('GameRelay import: ' + JSON.stringify(postData));
	$.ajax({
		type: "POST",
		url: "http://h5.iorcas.com/h5/jsapi/wx?func=game:relay",
		data: JSON.stringify(postData),
		dataType: "json",
		contentType: "application/json",
		success: function(jData, sState, oRequest) {
			if (sState) {
				console.log('GameRelay success sState: ' + sState);
				console.log('GameRelay export: ' + JSON.stringify(jData));
			}
			if (jData.code === "S_OK") {

				mWXUid = jData.var.wxUser.wxUid;
				mWXNickname = jData.var.wxUser.nickname;
				mWXHeadImgUrl = jData.var.wxUser.headimgurl;
				mWXToken = jData.var.token;

				// 如果曾接力该发起者，获取接力最高分和发起者信息
				if(jData.var.relayRecord) {
					mRelayScore = jData.var.relayRecord.highScore;
					console.log('jData relayRecord highScore: ' + mRelayScore);
				}
				else {
					console.log('jData relayRecord null');
				}

				fGetRecordAndRelayRecordsAndAward();
				
			}
			else {
				console.log('GameRelay jData.code: ' + jData.code);
			}
		},
		error: function() {
			console.log('ajax error');
		}
	});
}

// 读取发起者的游戏分数记录
function fGetRecordAndRelayRecordsAndAward() {
	var postData = {
		"var": {
			"wxUid": mWXUid,
			"token": mWXToken,
			"gameId": mGameID
		}
	}
	console.log('GetRecordAndRelayRecordsAndAward import: ' + JSON.stringify(postData));
	$.ajax({
		type: "POST",
		url: "http://h5.iorcas.com/h5/jsapi/wx?func=game:getRecordAndRelayRecordsAndAward",
		data: JSON.stringify(postData),
		dataType: "json",
		contentType: "application/json",
		success: function(jData, sState, oRequest) {
			if (sState) {
				console.log('GetRecordAndRelayRecordsAndAward success sState: ' + sState);
				console.log('GetRecordAndRelayRecordsAndAward export: ' + JSON.stringify(jData));
			}
			if (jData.code === "S_OK") {

				// 发起者打开（url无uid || url的uid等于发起者的uid）
				if(!mGetUrlWXUid || mWXUid == mGetUrlWXUid) {
					var relayResultInfo;
					var getOwnerScoreAndInfo = function(_jData) {
						if(_jData.var.record) {
							mOwnerScore = _jData.var.record.highScore;
							var sLastScore = _jData.var.record.lastScore;
							relayResultInfo = '<div style="width: 100%;"><span style="display: inline-block;width: 70%;text-align: right;">你刚刚的分数为：</span><span style="display: inline-block;width: 30%;">' + sLastScore + '</span></div>' + '<div style="width: 100%;"><span style="display: inline-block;width: 70%;text-align: right;">你最高的分数为：</span><span style="display: inline-block;width: 30%;">' + mOwnerScore + '</span></div>';

							// 有接力者时，获取所有接力者的最高分
							if(_jData.var.relayRecordArray) {
								var arrRelayRecord = _jData.var.relayRecordArray;
								var arrRelayRecordLen = arrRelayRecord.length;
								if(arrRelayRecordLen > 0) {
									console.log('_jData relayRecordArray length: ' + arrRelayRecordLen);
									for(var i = 0; i < arrRelayRecordLen; i++) {
										relayResultInfo += '<div style="width: 100%;"><span style="display: inline-block;width: 70%;text-align: right;">好友<span style="margin: 0 3px;color: #1aa55f;">' + arrRelayRecord[i].targetWxUser.nickname + '</span>接力的分数为：</span><span style="display: inline-block;width: 30%;">' + arrRelayRecord[i].highScore + '</span></div>';
										mOwnerScore += arrRelayRecord[i].highScore;
										if(mOwnerScore >= mTotalScore) {
											mOwnerScore = mTotalScore;
											mAwardCode = _jData.var.award.code;
											break;
										}
									}
								}
								else {
									console.log('_jData relayRecordArray null');
								}
							}
							else {
								console.log('_jData relayRecordArray undefined');
							}
						}
					}

					// 发起者重玩
					if(mGetUrlRetry) {
						fGameOverData = function(_gameScore) {
							var func = function() {
								var retryPostData = {
									"var": {
										"wxUid": mWXUid,
										"token": mWXToken,
										"gameId": mGameID
									}
								}
								console.log('retry import: ' + JSON.stringify(retryPostData));
								$.ajax({
									type: "POST",
									url: "http://h5.iorcas.com/h5/jsapi/wx?func=game:getRecordAndRelayRecordsAndAward",
									data: JSON.stringify(retryPostData),
									dataType: "json",
									contentType: "application/json",
									success: function(jData, sState, oRequest) {
										if (sState) {
											console.log('retry export sState: ' + sState);
											console.log('retry export: ' + JSON.stringify(jData));
										}
										if (jData.code === "S_OK") {
											getOwnerScoreAndInfo(jData);
											setTimeout(function() {
												fGo2OwnerFin(mOwnerScore, mWXUid, mWXNickname, mWXHeadImgUrl, relayResultInfo);
											}, 2000);
										}
										else {
											console.log('retry jData.code: ' + jData.code);
										}
									},
									error: function() {
										console.log('ajax error');
									}
								});
							}

							fGameSetRecord(_gameScore, func);
						}
						$('#js_beatIndex').show();
						fGameBeat();
					}

					// 发起者非重玩
					else {
						// 发起者有分数时，获取最高分
						if(jData.var.record) {
							getOwnerScoreAndInfo(jData);
							fGo2OwnerFin(mOwnerScore, mWXUid, mWXNickname, mWXHeadImgUrl, relayResultInfo);
						}
						// 发起者没有分数时，开始游戏 
						else {
							$('#js_beatIndex').show();
							fGameBeat();
						}
					}

				}

				// 接力者打开
				else if(mWXUid != mGetUrlWXUid) {

					var relayGameBeat = function() {
						fGameOverData = function(_gameScore) {
							var func = function() {
								setTimeout(function() {
									fGo2RelayFin(mGetUrlWXUid, mGetUrlShareScore, _gameScore);
								}, 2000);
							}
							fGameSetRelayRecord(_gameScore, func);
						};
						$('#js_beatIndex').show();
						fGameBeat();
					}

					// 接力者重玩
					if(mGetUrlRetry) {
						relayGameBeat();
					}

					// 接力者非重玩
					else {
						// 已玩完有分数时，跳到结果页
						if(mRelayScore) {
							fGo2RelayFin(mGetUrlWXUid, mGetUrlShareScore, mRelayScore);
						}
						// 否则跳到游戏页
						else {
							relayGameBeat();
						}
					}
				}
				
			}
			else {
				console.log('GetRecordAndRelayRecordsAndAward jData.code: ' + jData.code);
			}
		},
		error: function() {
			console.log('ajax error');
		}
	});
}

// 游戏完毕记分
function fGameSetRecord(sScore, fFuncName) {
	var postData = {
		"var": {
			"wxUid": mWXUid,				// 用户的wxUid
			"token": mWXToken,				// 用户的token
			"gameId": mGameID,				// 小游戏编号，由1开始，前端开发同事自己往上编即可
			"score": parseInt(sScore)       // 分数
		}
	}
	$.ajax({
		type: "POST",
		url: "http://h5.iorcas.com/h5/jsapi/wx?func=game:setRecord",
		data: JSON.stringify(postData),
		dataType: "json",
		contentType: "application/json",
		success: function(jData, sState, oRequest) {
			if (sState) {
				console.log('GameSetRecord success sState: ' + sState);
				fFuncName();
			}
			if (jData.code === "S_OK") {
				console.log('GameSetRecord jData.code: ' + jData.code);
			}
			else {
				console.log('GameSetRecord jData.code: ' + jData.code);
			}
		},
		error: function() {
			console.log('ajax error');
		}
	});
}

// 游戏完毕记分（接力）
function fGameSetRelayRecord(sScore, fFuncName) {
	var postData = {
		"var": {
			"wxUid": mWXUid,
			"token": mWXToken,
			"targetWxUid" : mGetUrlWXUid,
			"gameId": mGameID,
			"score": parseInt(sScore)
		}
	}
	$.ajax({
		type: "POST",
		url: "http://h5.iorcas.com/h5/jsapi/wx?func=game:setRelayRecord",
		data: JSON.stringify(postData),
		dataType: "json",
		contentType: "application/json",
		success: function(jData, sState, oRequest) {
			if (sState) {
				console.log('GameSetRelayRecord success sState: ' + sState);
				fFuncName();
			}
			if (jData.code === "S_OK") {
				console.log('GameSetRelayRecord jData.code: ' + jData.code);
			}
			else {
				console.log('GameSetRelayRecord jData.code: ' + jData.code);
			}
		},
		error: function() {
			console.log('ajax error');
		}
	});
}




/**
 *	document ready
 */
$(function() {


	fWXConfig();
	if(mGetUrlWXUid && !mGetUrlRetry) {
		fGameRelay();
	}
	else {
		fGameInit();
	}


	/**
	 *	禁止游戏页的滚动：保持一屏显示完全
	 *
	 *	点击载入音频：为保证移动流量不必要的流失，绝大多数移动浏览器默认
	 *  不支持预加载和自动播放，只能用户手动触发。但手动触发会存在音频加
	 *	载造成的播放延迟的问题，所以这里在第一次点击游戏窗口的同时就手动
	 *	触发音频加载，这样在之后的游戏过程就能顺利运用到音频。
	 */
	$('#js_beatIndex').bind('touchmove', function(e) {
		e.preventDefault();
	}).one('tap', function() {
		$('#js_beatVoice').get(0).play();
		$('#js_beatVoice').get(0).pause();
	});


	/**
	 *	游戏页规则页相互切换
	 */
	// 到规则页
	$('#js_index2Rule').bind('tap', function() {
		$('#js_beatIndex').hide();
		$('#js_beatRule').show();
		fSetHeight('#js_beatRule');
	});
	// 到游戏页
	$('#js_rule2Index').bind('tap', function() {
		$('#js_beatRule').hide();
		$('#js_beatIndex').show();
	});

});



/**
 *	window load
 */
$(window).bind('load', function() {
	fSetHeight('#js_beatIndex');
});



/**
 *	window resize
 */
$(window).bind('resize', function() {
	fSetHeight('#js_beatIndex');
	fSetHeight('#js_selfNoFin');
    fSetProportion();
});
