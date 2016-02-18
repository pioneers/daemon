import React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import PeripheralList from './PeripheralList';
import FinalCompPeripheralList from './FinalCompPeripheralList';
import Peripheral from './Peripheral';
import Gamepads from './Gamepads';
import RobotActions from '../actions/RobotActions';
import Editor from './Editor';
import FieldControl from './FieldControl'
import Timer from './Timer';

export default React.createClass({
  displayName: 'Dashboard',
  render() {
    return (
      <Grid fluid>
        <Row>
          <Col smPush={8} sm={4}>
            <FinalCompPeripheralList
              connectionStatus={this.props.connectionStatus}/>
            <Gamepads />
          </Col>
          <Col smPull={4} sm={8}>
            <Editor
              consoleData={this.props.consoleData}
              connectionStatus={this.props.connectionStatus}
              isRunningCode={this.props.isRunningCode}/>
          </Col>
        </Row>
      </Grid>
    );
  }
});
