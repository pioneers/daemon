/**
 * A component representing a particular peripheral.
 * A thin, discerning wrapper around the different periphal components.
 */

import React from 'react';
import DashboardConstants from '../constants/DashboardConstants';
import GenericPeripheral from './peripherals/GenericPeripheral';
import Motor from './peripherals/Motor';
import BooleanSensor from './peripherals/BooleanSensor';
var PeripheralTypes = DashboardConstants.PeripheralTypes;

// Mapping between peripheral types and components
var typesToComponents = {};
typesToComponents[PeripheralTypes.MOTOR_SCALAR] = Motor;
typesToComponents[PeripheralTypes.SENSOR_BOOLEAN] = BooleanSensor;


var Peripheral = React.createClass({
  propTypes: {
    peripheralType: React.PropTypes.string.isRequired
  },
  /**
   * Determines the specific type of peripheral that this object represents.
   */
  determinePeripheralComponent() {
    return typesToComponents[this.props.peripheralType];
  },
  render() {
    var SpecificPeripheralComponent = this.determinePeripheralComponent() || GenericPeripheral;
    return (
      <SpecificPeripheralComponent {...this.props}/>
      );
  }
});

export default Peripheral;