cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        _isCapturing:false,
    },

    // use this for initialization
    onLoad: function() {
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },

    init:function() {
		this.ANDROID_API = 'com/' + cc.vv.company + '/' + cc.vv.appname + '/WXAPI';
        this.IOS_API = "AppController";
    },
	
    login:function(){
        if (cc.sys.os == cc.sys.OS_ANDROID) {

            jsb.reflection.callStaticMethod(this.ANDROID_API, "Login", "()V");
        }
        else if(cc.sys.os == cc.sys.OS_IOS){
            jsb.reflection.callStaticMethod(this.IOS_API, "login");
        }
        else{
            console.log("platform:" + cc.sys.os + " dosn't implement share.");
        }
    },

    share: function(title, desc, timeline) {

        if (cc.sys.os == cc.sys.OS_ANDROID) {

            jsb.reflection.callStaticMethod(this.ANDROID_API,
                                            "Share",
                                            "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Z)V",
                                            cc.vv.SI.appweb,
                                            title,
                                            desc,
                                            timeline ? true : false);
        }
        else if(cc.sys.os == cc.sys.OS_IOS){
            jsb.reflection.callStaticMethod(this.IOS_API, "share:shareTitle:shareDesc:",cc.vv.SI.appweb,title,desc);
        }
        else{
            console.log("platform:" + cc.sys.os + " dosn't implement share.");
        }
    },
    
    shareResult:function(timeline) {
        if(this._isCapturing){
            return;
        }

        this._isCapturing = true;
        var size = cc.director.getWinSize();
        var currentDate = new Date();
        var fileName = "result_share.jpg";
        var fullPath = jsb.fileUtils.getWritablePath() + fileName;
        if(jsb.fileUtils.isFileExist(fullPath)){
            jsb.fileUtils.removeFile(fullPath);
        }
        var texture = new cc.RenderTexture(Math.floor(size.width), Math.floor(size.height));
        texture.setPosition(cc.p(size.width/2, size.height/2));
        texture.begin();
        cc.director.getRunningScene().visit();
        texture.end();
        texture.saveToFile(fileName, cc.IMAGE_FORMAT_JPG);
        
        var self = this;
        var tryTimes = 0;
        var fn = function(){
            if(jsb.fileUtils.isFileExist(fullPath)){
                var height = 100;
                var scale = height/size.height;
			    var width = Math.floor(size.width * scale);
                
                if(cc.sys.os == cc.sys.OS_ANDROID){
					//cc.eventManager.removeCustomListeners(cc.game.EVENT_HIDE);

                    jsb.reflection.callStaticMethod(self.ANDROID_API, "ShareIMG", "(Ljava/lang/String;IIZ)V",fullPath,width,height, timeline ? true : false);
                }
                else if(cc.sys.os == cc.sys.OS_IOS){
                    jsb.reflection.callStaticMethod(self.IOS_API, "shareIMG:width:height:",fullPath,width,height);
                }
                else{
                    console.log("platform:" + cc.sys.os + " dosn't implement share.");
                }
                self._isCapturing = false;
            }
            else{
                tryTimes++;
                if(tryTimes > 10){
                    console.log("time out...");
                    return;
                }
                setTimeout(fn,50); 
            }
        }
        setTimeout(fn,50);
    },

	initIAP: function(identifiers) {
		if (!identifiers || identifiers.length == 0) {
			return false;
		}

		var args = identifiers.join(',');

		jsb.reflection.callStaticMethod(this.IOS_API, "initProducts", args);
		return true;
    },

	buyIAP: function(identifier) {
		if (cc.sys.os != cc.sys.OS_IOS) {
			return false;
		}

		jsb.reflection.callStaticMethod(this.IOS_API, "buyProduct", identifier);
		return true;
	},

	onBuyIAPResp: function(ret) {
		console.log('onBuyIAPResp');

		
	},

    onLoginResp: function(code) {
    	console.log('onLoginResp');
        var fn = function(ret) {
            if (ret.errcode == 0) {
                cc.sys.localStorage.setItem("wx_account",ret.account);
                cc.sys.localStorage.setItem("wx_sign",ret.token);
            }

            cc.vv.userMgr.onAuth(ret);
        }

		if (code != null) {
	        cc.vv.http.sendRequest("/wechat_auth", {code:code,os:cc.sys.os}, fn);
		} else {
			cc.vv.wc.hide();
		}

    },

	onShareResp: function() {
		console.log('onShareResp');

		
    },

    setPortrait: function() {
		var view = cc.view;
		if (cc.sys.isNative && cc.sys.os === cc.sys.OS_ANDROID) {
			jsb.reflection.callStaticMethod(this.ANDROID_API, "changeOrientation", "(I)V", 1);
        } else if (cc.sys.isNative && cc.sys.os === cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("IOSHelper", "changeOrientation:", 1);
        }
        else {
            view.setOrientation(cc.macro.ORIENTATION_PORTRAIT);
        }

        let width = view.getFrameSize().height > view.getFrameSize().width ? view.getFrameSize().width : view.getFrameSize().height;
        let height = view.getFrameSize().height < view.getFrameSize().width ? view.getFrameSize().width : view.getFrameSize().height;

		view.setFrameSize(width, height);
        view.setDesignResolutionSize(720, 1280, cc.ResolutionPolicy.FIXED_HEIGHT);
    },

    setLandscape: function() {
    	var view = cc.view;
        if (cc.sys.isNative && cc.sys.os === cc.sys.OS_ANDROID) {
            jsb.reflection.callStaticMethod(this.ANDROID_API, "changeOrientation", "(I)V", 0);
        } else if (cc.sys.isNative && cc.sys.os === cc.sys.OS_IOS) {
            jsb.reflection.callStaticMethod("IOSHelper", "changeOrientation:", 0);
        }
        else {
            view.setOrientation(cc.macro.ORIENTATION_LANDSCAPE);
        }

        let width = view.getFrameSize().height < view.getFrameSize().width ? view.getFrameSize().width : view.getFrameSize().height;
        let height = view.getFrameSize().height > view.getFrameSize().width ? view.getFrameSize().width : view.getFrameSize().height;

		cc.view.setFrameSize(width, height);
        cc.view.setDesignResolutionSize(1280, 720, cc.ResolutionPolicy.FIXED_WIDTH);
    },
});
