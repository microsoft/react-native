/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 */

'use strict'; // TODO(OSS Candidate ISS#2710739)

const React = require('react');
const ReactNative = require('react-native');
import {Platform} from 'react-native';
const {Button, PlatformColor, StyleSheet, Text, View } = ReactNative;

import { KeyEvent } from 'react-native/Libraries/Types/CoreEventTypes';

type State = {
  eventStream: string,
};

class KeyEventExample extends React.Component<{}, State> {
  state: State = {
    eventStream: '',
    characters: '',
  };

  onKeyDownEvent: (e: KeyEvent) => void = (e: KeyEvent) => {
    console.log('received view key down event\n', e.nativeEvent['characters']);
    this.setState({characters: e.nativeEvent.characters})
    this.setState(prevState => ({
      eventStream: prevState.eventStream + prevState.characters + '\nKey Down: '
    }));
  };
  
  onKeyUpEvent: (e: KeyEvent) => void = (e: KeyEvent) => {
    console.log('received key up event\n', e.nativeEvent['characters']);
    this.setState({characters: e.nativeEvent.characters})
    this.setState(prevState => ({
      eventStream: prevState.eventStream + prevState.characters + '\nKey Up: '
    }));
  };

  render() {
    return (
      <View>
        <Text>
          Key events are called when a component detects a key press.
        </Text>
        <View>
          {
          Platform.OS === 'macos' ? (
            <View
              acceptsKeyboardFocus={true}
              enableFocusRing={true}
              validKeysDown={["a", "b", "c"]}
              onKeyDown={this.onKeyDownEvent}
              validKeysDown={["d", "e", "f"]}
              onKeyUp={this.onKeyUpEvent}
              >
              <Button 
                title={'Test button'}
                validKeysDown={["g", "h", "i"]}
                onKeyDown={this.onKeyDownEvent}
                validKeysDown={["j", "k", "l"]}
                onKeyUp={this.onKeyUpEvent}
              >
              </Button>
            </View>
          ) : null}
          <Text>{'Events: ' + this.state.eventStream + JSON.stringify(this.state.characters) + '\n\n'}</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  textInput: {
    ...Platform.select({
      macos: {
        color: PlatformColor('textColor'),
        backgroundColor: PlatformColor('textBackgroundColor'),
        borderColor: PlatformColor('gridColor'),
      },
      default: {
        borderColor: '#0f0f0f',
      },
    }),
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    fontSize: 13,
    padding: 4,
  },
});

exports.title = 'Key Events';
exports.description = 'Examples that show how Key events can be used.';
exports.examples = [
  {
    title: 'KeyEventExample',
    render: function(): React.Element<any> {
      return <KeyEventExample />;
    },
  },
];
