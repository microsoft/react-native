/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 */

'use strict';

const AlertMacOS = require('AlertMacOS'); // TODO(macOS ISS#2323203)
const NativeModules = require('NativeModules');
const AlertWindows = NativeModules.AlertWindows;
const RCTAlertManager = NativeModules.AlertManager;
const Platform = require('Platform');

export type Buttons = Array<{
  text?: string,
  onPress?: ?Function,
  style?: AlertButtonStyle,
}>;

type Options = {
  cancelable?: ?boolean,
  onDismiss?: ?Function,
};

export type AlertType = $Enum<{
  default: string,
  'plain-text': string,
  'secure-text': string,
  'login-password': string,
}>;

export type AlertButtonStyle = $Enum<{
  default: string,
  cancel: string,
  destructive: string,
}>;

/**
 * Launches an alert dialog with the specified title and message.
 *
 * See http://facebook.github.io/react-native/docs/alert.html
 */
class Alert {
  static alert(
    title: ?string,
    message?: ?string,
    buttons?: Buttons,
    options?: Options,
  ): void {
    if (Platform.OS === 'ios') {
      AlertIOS.alert(title, message, buttons);
    } else if (Platform.OS === 'macos' /* TODO[(macOS ISS#2323203) */) {
      AlertMacOS.alert(title, message, buttons); // TODO](macOS ISS#2323203)
    } else if (Platform.OS === 'android') {
      AlertAndroid.alert(title, message, buttons, options);
    } else if (Platform.OS === 'windows') {
      AlertWindowsOS.alert(title, message, buttons);
    }
  }

  static prompt(
    title: ?string,
    message?: ?string,
    callbackOrButtons?: ?(((text: string) => void) | Buttons),
    type?: ?AlertType = 'plain-text',
    defaultValue?: string,
    keyboardType?: string,
  ): void {
    if (Platform.OS === 'ios') {
      AlertIOS.prompt(
        title,
        message,
        callbackOrButtons,
        type,
        defaultValue,
        keyboardType,
      );
    }
  }
}

/**
 * Wrapper around the iOS native module.
 */
class AlertIOS {
  static alert(
    title: ?string,
    message?: ?string,
    callbackOrButtons?: ?((() => void) | Buttons),
  ): void {
    this.prompt(title, message, callbackOrButtons, 'default');
  }

  static prompt(
    title: ?string,
    message?: ?string,
    callbackOrButtons?: ?(((text: string) => void) | Buttons),
    type?: ?AlertType = 'plain-text',
    defaultValue?: string,
    keyboardType?: string,
  ): void {
    if (typeof type === 'function') {
      console.warn(
        'You passed a callback function as the "type" argument to Alert.prompt(). React Native is ' +
          'assuming  you want to use the deprecated Alert.prompt(title, defaultValue, buttons, callback) ' +
          'signature. The current signature is Alert.prompt(title, message, callbackOrButtons, type, defaultValue, ' +
          'keyboardType) and the old syntax will be removed in a future version.',
      );

      const callback = type;
      RCTAlertManager.alertWithArgs(
        {
          title: title || '',
          type: 'plain-text',
          defaultValue: message,
        },
        (id, value) => {
          callback(value);
        },
      );
      return;
    }

    let callbacks = [];
    const buttons = [];
    let cancelButtonKey;
    let destructiveButtonKey;
    if (typeof callbackOrButtons === 'function') {
      callbacks = [callbackOrButtons];
    } else if (Array.isArray(callbackOrButtons)) {
      callbackOrButtons.forEach((btn, index) => {
        callbacks[index] = btn.onPress;
        if (btn.style === 'cancel') {
          cancelButtonKey = String(index);
        } else if (btn.style === 'destructive') {
          destructiveButtonKey = String(index);
        }
        if (btn.text || index < (callbackOrButtons || []).length - 1) {
          const btnDef = {};
          btnDef[index] = btn.text || '';
          buttons.push(btnDef);
        }
      });
    }

    RCTAlertManager.alertWithArgs(
      {
        title: title || '',
        message: message || undefined,
        buttons,
        type: type || undefined,
        defaultValue,
        cancelButtonKey,
        destructiveButtonKey,
        keyboardType,
      },
      (id, value) => {
        const cb = callbacks[id];
        cb && cb(value);
      },
    );
  }
}

/**
 * Wrapper around the Android native module.
 */
class AlertAndroid {
  static alert(
    title: ?string,
    message?: ?string,
    buttons?: Buttons,
    options?: Options,
  ): void {
    let config = {
      title: title || '',
      message: message || '',
    };

    if (options) {
      config = {...config, cancelable: options.cancelable};
    }
    // At most three buttons (neutral, negative, positive). Ignore rest.
    // The text 'OK' should be probably localized. iOS Alert does that in native.
    const validButtons: Buttons = buttons
      ? buttons.slice(0, 3)
      : [{text: 'OK'}];
    const buttonPositive = validButtons.pop();
    const buttonNegative = validButtons.pop();
    const buttonNeutral = validButtons.pop();
    if (buttonNeutral) {
      config = {...config, buttonNeutral: buttonNeutral.text || ''};
    }
    if (buttonNegative) {
      config = {...config, buttonNegative: buttonNegative.text || ''};
    }
    if (buttonPositive) {
      config = {...config, buttonPositive: buttonPositive.text || ''};
    }
    NativeModules.DialogManagerAndroid.showAlert(
      config,
      errorMessage => console.warn(errorMessage),
      (action, buttonKey) => {
        if (action === NativeModules.DialogManagerAndroid.buttonClicked) {
          if (buttonKey === NativeModules.DialogManagerAndroid.buttonNeutral) {
            buttonNeutral.onPress && buttonNeutral.onPress();
          } else if (
            buttonKey === NativeModules.DialogManagerAndroid.buttonNegative
          ) {
            buttonNegative.onPress && buttonNegative.onPress();
          } else if (
            buttonKey === NativeModules.DialogManagerAndroid.buttonPositive
          ) {
            buttonPositive.onPress && buttonPositive.onPress();
          }
        } else if (action === NativeModules.DialogManagerAndroid.dismissed) {
          options && options.onDismiss && options.onDismiss();
        }
      },
    );
  }
}

/**
 * Wrapper around the Windows native module.
 */
class AlertWindowsOS {
  static alert(
    title: ?string,
    message?: ?string,
    buttons?: Buttons,
    options?: Options,
  ): void {
    const validButtons: Buttons = buttons
      ? buttons.slice(0, 3)
      : [{text: 'OK'}];
    const buttonPositive = validButtons.pop();
    const buttonNegative = validButtons.pop();
    const buttonNeutral = validButtons.pop();

    let args = {
      title: title || '',
      message: message || '',
      buttonNeutral: buttonNeutral ? buttonNeutral.text : '',
      buttonNegative: buttonNegative ? buttonNegative.text : '',
      buttonPositive: buttonPositive ? buttonPositive.text : '',
    };

    AlertWindows.showAlert(args, actionResult => {
      if (actionResult === 'neutral') {
        buttonNeutral && buttonNeutral.onPress && buttonNeutral.onPress();
      } else if (actionResult === 'negative') {
        buttonNegative && buttonNegative.onPress && buttonNegative.onPress();
      } else if (actionResult === 'positive') {
        buttonPositive && buttonPositive.onPress && buttonPositive.onPress();
      }
    });
  }
}

module.exports = Alert;
