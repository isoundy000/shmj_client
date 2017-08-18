package com.rentai.island.wxapi;


import org.cocos2dx.lib.Cocos2dxJavascriptJavaBridge;
import org.cocos2dx.lib.Cocos2dxHelper;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;

import com.tencent.mm.sdk.openapi.BaseReq;
import com.tencent.mm.sdk.openapi.BaseResp;
import com.tencent.mm.sdk.openapi.IWXAPI;
import com.tencent.mm.sdk.openapi.IWXAPIEventHandler;
import com.tencent.mm.sdk.openapi.SendAuth;
import com.tencent.mm.sdk.openapi.WXAPIFactory;
import com.rentai.island.Constants;
import com.rentai.island.WXAPI;

public class WXEntryActivity extends Activity implements IWXAPIEventHandler{
	
	// IWXAPI 是第三方app和微信通信的openapi接口
    private IWXAPI _api;
	
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        //setContentView(R.layout.plugin_entry);
    	_api = WXAPIFactory.createWXAPI(this, Constants.APP_ID, false);
        _api.handleIntent(getIntent(), this);
		Log.d("cocos", "onCreate WXEntryActivity");
    }

	@Override
	protected void onNewIntent(Intent intent) {
		super.onNewIntent(intent);
		
		setIntent(intent);
        _api.handleIntent(intent, this);
	}

	// 微信发送请求到第三方应用时，会回调到该方法
	@Override
	public void onReq(BaseReq req) {
		/*
		switch (req.getType()) {
		case ConstantsAPI.COMMAND_GETMESSAGE_FROM_WX:
			//goToGetMsg();		
			break;
		case ConstantsAPI.COMMAND_SHOWMESSAGE_FROM_WX:
			//goToShowMsg((ShowMessageFromWX.Req) req);
			break;
		default:
			break;
		}
		*/
	}

	// 第三方应用发送到微信的请求处理后的响应结果，会回调到该方法
	@Override
	public void onResp(BaseResp resp) {
		int result = 0;
		Log.d("cocos", "onResp");
		switch (resp.errCode) {
		case BaseResp.ErrCode.ERR_OK:
			if(WXAPI.isLogin){
				final SendAuth.Resp authResp = (SendAuth.Resp)resp;
				if(authResp != null && authResp.token != null){
					Cocos2dxHelper.runOnGLThread(new Runnable() {
						@Override
						public void run() {
							Cocos2dxJavascriptJavaBridge.evalString("cc.vv.anysdkMgr.onLoginResp('"+ authResp.token +"')");
						}
					});
				} else {
					Cocos2dxHelper.runOnGLThread(new Runnable() {
						@Override
						public void run() {
							Cocos2dxJavascriptJavaBridge.evalString("cc.vv.anysdkMgr.onLoginResp()");
						}
					});
				}
			} else {
				Cocos2dxHelper.runOnGLThread(new Runnable() {
					@Override
					public void run() {
						Cocos2dxJavascriptJavaBridge.evalString("cc.vv.anysdkMgr.onShareResp()");
					}
				});
			}

			break;
		case BaseResp.ErrCode.ERR_USER_CANCEL:
			result = 2;//R.string.errcode_cancel;
			//break;
		case BaseResp.ErrCode.ERR_AUTH_DENIED:
			result = 3;//R.string.errcode_deny;
			//break;
		default:
			result = 4;//R.string.errcode_unknown;
			//break;
			if (WXAPI.isLogin) {
				Cocos2dxHelper.runOnGLThread(new Runnable() {
					@Override
					public void run() {
						Cocos2dxJavascriptJavaBridge.evalString("cc.vv.anysdkMgr.onLoginResp()");
					}
				});
			} else {
				Cocos2dxHelper.runOnGLThread(new Runnable() {
					@Override
					public void run() {
						Cocos2dxJavascriptJavaBridge.evalString("cc.vv.anysdkMgr.onShareResp()");
					}
				});
			}
		}

		this.finish();
		
		//Toast.makeText(this, result, Toast.LENGTH_LONG).show();
	}
}