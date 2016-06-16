import AppDispatcher from '../dispatcher/AppDispatcher';
import {EventEmitter} from 'events';
import { ActionTypes } from '../constants/Constants';
import assign from 'object-assign';
import _ from 'lodash';
import Immutable from 'immutable';

let _robotInfo = {
  connectionStatus: false,
  runtimeStatus: true, // Are we receiving data from runtime?
  isRunningCode: false, // Is runtime executing code?
  batteryLevel: 0,
  runtimeVersion: null
};

let RobotInfoStore = assign({}, EventEmitter.prototype, {
  emitChange() {
    this.emit('change');
  },
  getConnectionStatus() {
    return _robotInfo.connectionStatus;
  },
  getRuntimeStatus() {
    return _robotInfo.runtimeStatus;
  },
  getIsRunningCode() {
    return _robotInfo.isRunningCode;
  },
  getBatteryLevel() {
    return _robotInfo.batteryLevel;
  },
  getRuntimeVersion() {
    return _robotInfo.runtimeVersion;
  }
});

// Here, "status" refers to whether the robot is running code.
function handleUpdateStatus(action) {
  _robotInfo.isRunningCode = (action.status.value == 1);
  RobotInfoStore.emitChange();
}

function handleUpdateBattery(action){
  _robotInfo.batteryLevel = action.battery.value;
  RobotInfoStore.emitChange();
}

/**
 * Dispatch the 'StopCheck' action every second. handleStopCheck
 * uses this to determine runtimeStatus.
 */

var previousActionType = null;
setInterval(() => {
  AppDispatcher.dispatch({
    type: 'StopCheck',
    content: {}
  });
}, 3000);

/* Determines connection status. If we receive a StopCheck action,
 * and the previous action was also a StopCheck, then we have received
 * no status updates in the past second and we are disconnected.
 */
function handleStopCheck(action) {
  var old = _robotInfo.runtimeStatus;
  if (previousActionType === 'StopCheck') {
    _robotInfo.runtimeStatus = false;
  } else {
    _robotInfo.runtimeStatus = true;
  }
  if (old !== _robotInfo.runtimeStatus) {
    RobotInfoStore.emitChange();
  }
}

function handleUpdateConnection(action) {
  _robotInfo.connectionStatus = action.payload;
  RobotInfoStore.emitChange();
}

function runtimeUpdate(action) {
  _robotInfo.runtimeVersion = {
    version: action.version,
    headhash: action.headhash,
    modified: action.modified
  };
  RobotInfoStore.emitChange();
}

RobotInfoStore.dispatchToken = AppDispatcher.register((action) => {
  switch (action.type) {
    case ActionTypes.UPDATE_STATUS:
      handleUpdateStatus(action);
      previousActionType = action.type;
      break;
    case ActionTypes.UPDATE_BATTERY:
      handleUpdateBattery(action);
      break;
    case ActionTypes.UPDATE_CONNECTION:
      handleUpdateConnection(action);
      break;
    case ActionTypes.runtime_version:
      runtimeUpdate(action);
      break;
    case 'StopCheck':
      handleStopCheck(action);
      previousActionType = action.type;
      break;
  }
});

export default RobotInfoStore;
