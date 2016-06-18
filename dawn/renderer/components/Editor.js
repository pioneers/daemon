import React from 'react';
import { connect } from 'react-redux';
import {
  createNewFile,
  changeTheme,
  editorUpdate,
  increaseFontsize,
  decreaseFontsize
} from '../actions/EditorActions.js';
import {
  showConsole,
  hideConsole,
  clearConsole
} from '../actions/ConsoleActions';
import { addAsyncAlert } from '../actions/AlertActions';
import EditorToolbar from './EditorToolbar';
import ConsoleOutput from './ConsoleOutput';
import Ansible from '../utils/Ansible';
import { Panel } from 'react-bootstrap';
import { EditorButton } from './EditorClasses';
import brace from 'brace';
import ace from 'brace';
import AceEditor from 'react-ace';
import _ from 'lodash';

// React-ace extensions and modes
import 'brace/ext/language_tools';
import 'brace/ext/searchbox';
import 'brace/mode/python';
// React-ace themes
import 'brace/theme/monokai';
import 'brace/theme/github';
import 'brace/theme/tomorrow';
import 'brace/theme/kuroir';
import 'brace/theme/twilight';
import 'brace/theme/xcode';
import 'brace/theme/textmate';
import 'brace/theme/solarized_dark';
import 'brace/theme/solarized_light';
import 'brace/theme/terminal';
let langtools = ace.acequire('ace/ext/language_tools');

let Editor = React.createClass({
  componentDidMount() {
    this.refs.CodeEditor.editor.setOption('enableBasicAutocompletion', true);
  },
  correctText(text) {
    // Removes non-ASCII characters from text.
    return text.replace(/[^\x00-\x7F]/g, "");
  },
  onEditorPaste(pasteData) {
    // Must correct non-ASCII characters, which would crash Runtime.
    let correctedText = pasteData.text;
    // Normalizing will allow us (in some cases) to preserve ASCII equivalents.
    correctedText = correctedText.normalize("NFD");
    // Special case to replace fancy quotes.
    correctedText = correctedText.replace(/[”“]/g,'"');
    correctedText = correctedText.replace(/[‘’]/g,"'");
    correctedText = this.correctText(correctedText);
    // TODO: Create some notification that an attempt was made at correcting non-ASCII chars.
    pasteData.text = correctedText;
  },
  toggleConsole() {
    if (this.props.showConsole) {
      this.props.onHideConsole();
    } else {
      this.props.onShowConsole();
    }
    // must call resize method after changing height of ace editor
    setTimeout(()=>this.refs.CodeEditor.editor.resize(), 0.1);
  },
  sendCode(command) {
    let correctedText = this.correctText(this.props.editorCode);
    if (correctedText !== this.props.editorCode) {
      this.props.onAlertAdd(
	'Invalid characters detected',
	'Your code has non-ASCII characters, which won\'t work on the robot. ' +
	'Please remove them and try again.'
      );
      return false;
    } else {
      Ansible.sendMessage(command, {
	code: this.props.editorCode
      });
      return true;
    }
  },
  upload() { this.sendCode('upload'); },
  startRobot() {
    let sent = this.sendCode('execute');
    if (sent) {
      this.props.onClearConsole();
    };
  },
  stopRobot() {
    Ansible.sendMessage('stop', {});
  },
  openAPI() {
    window.open("https://pie-api.readthedocs.org/")
  },
  generateButtons() {
    // The buttons which will be in the button toolbar
    return [
      {
        groupId: 'code-execution-buttons',
        buttons: [
          new EditorButton('run', 'Run', this.startRobot, 'play', (this.props.isRunningCode || !this.props.runtimeStatus)),
          new EditorButton('stop', 'Stop', this.stopRobot, 'stop', !(this.props.isRunningCode && this.props.runtimeStatus)),
          new EditorButton('toggle-console', 'Toggle Console', this.toggleConsole, 'console'),
          new EditorButton('clear-console', 'Clear Console', this.props.onClearConsole, 'remove'),
          new EditorButton('upload', 'Upload', this.upload, 'upload', (this.props.isRunningCode || !this.props.runtimeStatus)),
        ]
      }, {
        groupId: 'misc-buttons',
        buttons: [
          new EditorButton('api', 'API Documentation', this.openAPI, 'book'),
          new EditorButton('zoomin', 'Increase fontsize', this.props.onIncreaseFontsize, 'zoom-in'),
          new EditorButton('zoomout', 'Decrease fontsize', this.props.onDecreaseFontsize, 'zoom-out')
        ]
      }
    ];
  },
  pathToName(filepath) {
    if (filepath !== null) {
      if (process.platform === 'win32') {
        return filepath.split('\\').pop();
      } else {
        return filepath.split('/').pop();
      }
    } else {
      return '[ New File ]';
    }
  },
  hasUnsavedChanges() {
    return (this.props.latestSaveCode !== this.props.editorCode);
  },
  themes: [
    'monokai',
    'github',
    'tomorrow',
    'kuroir',
    'twilight',
    'xcode',
    'textmate',
    'solarized_dark',
    'solarized_light',
    'terminal'
  ],
  render() {
    let consoleHeight = 250;
    let editorHeight = window.innerHeight * 0.66;
    return (
      <Panel
        header={'Editing: ' + this.pathToName(this.props.filepath) +
          (this.hasUnsavedChanges() ? '*' : '')}
        bsStyle="primary">
        <EditorToolbar
          buttons={ this.generateButtons() }
          unsavedChanges={ this.hasUnsavedChanges() }
          changeTheme={ this.props.onChangeTheme }
          editorTheme={ this.props.editorTheme }
          themes={ this.themes }
          runtimeStatus={ this.props.runtimeStatus }
        />
        <AceEditor
          mode="python"
          theme={ this.props.editorTheme }
          width="100%"
          fontSize={this.props.fontSize}
          ref="CodeEditor"
          name="CodeEditor"
          height={String(
            editorHeight - this.props.showConsole * (consoleHeight + 30)) + 'px'}
          value = { this.props.editorCode }
          onChange={ this.props.onEditorUpdate }
	  onPaste={ this.onEditorPaste }
          editorProps={{$blockScrolling: Infinity}}
        />
        <ConsoleOutput
          toggleConsole={this.toggleConsole}
          show={this.props.showConsole}
          height={consoleHeight}
          output={this.props.consoleData}/>
      </Panel>
    );
  }
});

const mapStateToProps = (state) => {
  return {
    editorCode: state.editor.editorCode,
    editorTheme: state.editor.editorTheme,
    filepath: state.editor.filepath,
    fontSize: state.editor.fontSize,
    latestSaveCode: state.editor.latestSaveCode,
    showConsole: state.studentConsole.showConsole,
    consoleData: state.studentConsole.consoleData
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onAlertAdd: (heading, message) => {
      dispatch(addAsyncAlert(heading, message));
    },
    onEditorUpdate: (newVal) => {
      dispatch(editorUpdate(newVal));
    },
    onChangeTheme: (theme) => {
      dispatch(changeTheme(theme));
    },
    onIncreaseFontsize: () => {
      dispatch(increaseFontsize());
    },
    onDecreaseFontsize: () => {
      dispatch(decreaseFontsize());
    },
    onShowConsole: () => {
      dispatch(showConsole());
    },
    onHideConsole: () => {
      dispatch(hideConsole());
    },
    onClearConsole: () => {
      dispatch(clearConsole());
    }
  };
};

Editor = connect(mapStateToProps, mapDispatchToProps)(Editor);
export default Editor;
