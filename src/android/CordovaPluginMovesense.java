package com.prevayl.CordovaPluginMovesense;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;
import android.support.annotation.NonNull;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import java.util.HashMap;
import java.util.Map;
import android.content.Context;
import android.content.Intent;
import android.Manifest;
import android.app.Activity;
import com.movesense.mds.Logger;
import com.movesense.mds.Mds;
import com.movesense.mds.MdsConnectionListener;
import com.movesense.mds.MdsException;
import com.movesense.mds.MdsNotificationListener;
import com.movesense.mds.MdsResponseListener;
import com.movesense.mds.MdsSubscription;
import org.apache.cordova.*;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaArgs;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.LOG;
import org.apache.cordova.PermissionHelper;
import org.apache.cordova.PluginResult;
/**
 * This class echoes a string called from JavaScript.
 */
public class CordovaPluginMovesense extends CordovaPlugin {
    private CallbackContext PUBLIC_CALLBACKS = null;
    private Mds mds;
    private Map < String, MdsSubscription > subscriptionMap;
    private Context appContext;

    public CordovaPluginMovesense() {

        //     subscriptionMap = new HashMap < > ();
    }

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {

        Activity activity = cordova.getActivity();
        if (action.equals("connect")) {
            final String address = args.getJSONObject(0).getString("address");
            if (address != null && address.length() > 0) {
                this.connect(address, callbackContext);
            } else {
                callbackContext.error("No address arg supplied");
            }

            return true;
        }
        else if (action.equals("subscribe")) {
            final String uri = args.getJSONObject(0).getString("uri");
            final String contract = args.getJSONObject(0).getString("contract");
            final String key = args.getJSONObject(0).getString("key");
            if (uri != null && uri.length() > 0) {
                this.subscribe(uri, contract, key, callbackContext);
            } else {
                callbackContext.error("No uri arg supplied");
            }

            return true;
        }
        return false;
    }

    private void connect(String address, CallbackContext callbackContext) {
        appContext = this.cordova.getContext();
        mds = Mds.builder().build(appContext);
        mds.connect(address, new MdsConnectionListener() {
            @Override
            public void onConnect(String s) {
                callbackContext.success(address);
            }
            @Override
            public void onConnectionComplete(String s, String s1) {
                callbackContext.success(address);
            }
            @Override
            public void onError(MdsException e) {
                callbackContext.error(e.toString());
            }
            @Override
            public void onDisconnect(String s) {

            }
        });
    }

    public void subscribe(@NonNull String uri, String contract, final String key, CallbackContext callbackContext) {
        MdsSubscription subscription = mds.subscribe(uri, contract, new MdsNotificationListener() {
            @Override
            public void onNotification(String s) {
                PluginResult subscribeNotification = new PluginResult(PluginResult.Status.OK, s);
                subscribeNotification.setKeepCallback(true);
                callbackContext.sendPluginResult(subscribeNotification);
            }

            @Override
            public void onError(MdsException e) {
                // sendNotificationErrorEvent(key, e.getMessage());
            }
        });
        // subscriptionMap.put(key, subscription);
    }
}