/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

import type {TurboModule} from '../TurboModule/RCTExport';
import * as TurboModuleRegistry from '../TurboModule/TurboModuleRegistry';
import type {DefaultInputsArray} from './AlertMacOS'; // TODO(macOS GH#774)

export type Args = {|
  title?: string,
  message?: string,
  buttons?: Array<Object>, // TODO(T67565166): have a better type
  type?: string,
  defaultValue?: string,
  cancelButtonKey?: string,
  destructiveButtonKey?: string,
  keyboardType?: string,
  // [TODO(macOS GH#774)
  defaultInputs?: DefaultInputsArray,
  modal?: ?boolean,
  critical?: ?boolean,
  // ]TODO(macOS GH#774)
|};

export interface Spec extends TurboModule {
  +alertWithArgs: (
    // eslint-disable-next-line @react-native/codegen/react-native-modules
    args: Args,
    callback: (id: number, value: string) => void,
  ) => void;
}

export default (TurboModuleRegistry.get<Spec>('AlertManager'): ?Spec);
