var exec = require('cordova/exec');

class Movesense {
    constructor() {
        this.URI_PREFIX = "suunto://"
        this.errorLogs = []
        this.onDeviceConnected = function () {}
        this.onDeviceDisconnected = function () {}
        this.subscribedToConnectedDevices = false
        this.connectedDevicesSubscription = function () {}
        this.subsKey = 0;
        this.subsKeys = [];
        this.subsSuccessCbs = [];
        this.subsErrorCbs = [];
        this.onNewScannedDevice = function () {}
    }

    getIdxFromKey(key) {
        var idx = -1;
        for (var i = 0; i < this.subsKeys.length; i++) {
            if (this.subsKeys[i] == key) {
                idx = i;
                break;
            }
        }
        return idx;
    }

    initialize(success, failure = defaultErrorCallback) {

    }

    setHandlers(connectionHandler, disconnectionHandler, onSuccess, onError) {
        this.onDeviceConnected = connectionHandler;
        this.onDeviceDisconnected = disconnectionHandler;
        if (!subscribedToConnectedDevices) {
            this.subscribedToConnectedDevices = true
            this.subscribeToConnectedDevices()
        }
        exec(onSuccess, onError, 'CordovaPluginMovesense', 'setHandlers', [connectionHandler, disconnectionHandler])
    }

    handleNewScannedDevice(e) {
        this.onNewScannedDevice(e.name, e.address);
    }

    handleNewNotification(e) {
        this.subsSuccessCbs[getIdxFromKey(e.key)](e.notification);
    }

    handleNewNotificationError(e) {
        this.subsErrorCbs[getIdxFromKey(e.key)](e.notification);
    }


    subscribeToConnectedDevices() {
        this.subscribedToConnectedDevices = true;
        connectedDevicesSubscription = this.subscribe("", "MDS/ConnectedDevices", {},
            (notification) => {
                var data = JSON.parse(notification);
                if (data["Method"] == "POST") {
                    if (data.hasOwnProperty("Body")) {
                        if (data["Body"].hasOwnProperty("DeviceInfo")) {
                            if (data["Body"]["DeviceInfo"].hasOwnProperty("Serial")) {
                                this.onDeviceConnected(data["Body"]["DeviceInfo"]["Serial"])
                            }
                        } else if (data["Body"].hasOwnProperty("Serial")) {
                            this.onDeviceConnected(data["Body"]["Serial"])
                        }
                    }
                } else if (data["Method"] == "DEL") {
                    if (data["Body"].hasOwnProperty("Serial")) {
                        this.onDeviceDisonnected(data["Body"]["Serial"])
                    }
                }
            },
            (error) => {
                console.log("MDS subscribe error")
                this.unsubscribe(connectedDevicesSubscription);
                subscribedToConnectedDevices = false;
            });

    }

    startScan(success, failure = defaultErrorCallback) {

    }

    stopScan(success, failure = defaultErrorCallback) {

    }

    connect(address, onSuccess, onError) {
        exec(onSuccess, onError, 'CordovaPluginMovesense', 'connect', [address]);
    }
    subscribe(uri, serial, contract, onResponse, onError) {
        if (serial == undefined ||
            uri == undefined ||
            contract == undefined ||
            onResponse == undefined ||
            onError == undefined) {
            console.log("MDS subscribe() missing argument(s).")
            return -1;
        }

        this.subsKey++;
        var subsKeyStr = this.subsKey.toString();
        this.subsKeys.push(this.subsKey);
        this.subsSuccessCbs.push(onResponse);
        this.subsErrorCbs.push(onError);
        if (device.platform === 'Android') {
            contract["Uri"] = serial + uri;
            exec(onResponse, onError, 'CordovaPluginMovesense', 'subscribe', [{
                uri: "suunto://MDS/EventListener",
                contract: JSON.stringify(contract),
                key: subsKeyStr
            }])

        } else {
            exec(onResponse, onError, 'CordovaPluginMovesense', 'subscribe', [this.URI_PREFIX + serial + uri, JSON.stringify(contract), subsKeyStr])

        }

        return this.subsKey;
    }



    defaultErrorCallback(error, action) {
        this.errorLogs.push(`Error in Movesense library ${new Date()} - Action: ${action} - No error callback defined defaulting to logging`);
        this.errorLogs.push(error);
        console.error(`Error in Movesense library ${new Date()} - Action: ${action} - No error callback defined defaulting to logging`);
        console.error(error);
    }

}
exports.Movesense = new Movesense();