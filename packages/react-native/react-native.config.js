/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

// React Native shouldn't be exporting itself like this, the Community Template should be be directly
// depending on and injecting:
// - @react-native-community/cli-platform-android
// - @react-native-community/cli-platform-ios
// - @react-native/community-cli-plugin (via the @react-native/core-cli-utils package)
// - codegen command should be inhoused into @react-native-community/cli
//
// This is a temporary workaround.

const verbose = process.env.DEBUG && process.env.DEBUG.includes('react-native');

let android;
try {
  android = require('@react-native-community/cli-platform-android');
} catch {
  if (verbose) {
    console.warn(
      '@react-native-community/cli-platform-android not found, the react-native.config.js may be unusable.',
    );
  }
}

let ios;
try {
  ios = require('@react-native-community/cli-platform-ios');
} catch {
  if (verbose) {
    console.warn(
      '@react-native-community/cli-platform-ios not found, the react-native.config.js may be unusable.',
    );
  }
}

const macosCommands = require('./local-cli/runMacOS/runMacOS'); // [macOS]
const {getDependencyConfig, getProjectConfig} = require('@react-native-community/cli-platform-apple'); // [macOS]
const {
  bundleCommand,
  startCommand,
} = require('@react-native/community-cli-plugin');

const codegenCommand = {
  name: 'codegen',
  options: [
    {
      name: '--path <path>',
      description: 'Path to the React Native project root.',
      default: process.cwd(),
    },
    {
      name: '--platform <string>',
      description:
        'Target platform. Supported values: "android", "ios", "all".',
      default: 'all',
    },
    {
      name: '--outputPath <path>',
      description: 'Path where generated artifacts will be output to.',
    },
  ],
  func: (argv, config, args) =>
    require('./scripts/codegen/generate-artifacts-executor').execute(
      args.path,
      args.platform,
      args.outputPath,
    ),
};

const config = {
  commands: [bundleCommand, startCommand, codegenCommand],
  platforms: {},
};

if (ios != null) {
  config.commands.push(...ios.commands);
  config.platforms.ios = {
    projectConfig: ios.projectConfig,
    dependencyConfig: ios.dependencyConfig,
  };
}

if (android != null) {
  config.commands.push(...android.commands);
  config.platforms.android = {
    projectConfig: android.projectConfig,
    dependencyConfig: android.dependencyConfig,
  };
}

// [macOS
config.commands.push(...macosCommands);
config.platforms.macos = {
  linkConfig: () => {
    return {
      isInstalled: (
        _projectConfig /*ProjectConfig*/,
        _package /*string*/,
        _dependencyConfig /*DependencyConfig*/,
      ) => false /*boolean*/,
      register: (
        _package /*string*/,
        _dependencyConfig /*DependencyConfig*/,
        _obj /*Object*/,
        _projectConfig /*ProjectConfig*/,
      ) => {},
      unregister: (
        _package /*string*/,
        _dependencyConfig /*DependencyConfig*/,
        _projectConfig /*ProjectConfig*/,
        _dependencyConfigs /*Array<DependencyConfig>*/,
      ) => {},
      copyAssets: (
        _assets /*string[]*/,
        _projectConfig /*ProjectConfig*/,
      ) => {},
      unlinkAssets: (
        _assets /*string[]*/,
        _projectConfig /*ProjectConfig*/,
      ) => {},
    };
  },
  projectConfig: getProjectConfig({platformName: 'macos'}),
  dependencyConfig: getDependencyConfig({platformName: 'macos'}),
  npmPackageName: 'react-native-macos',
};
// macOS]

module.exports = config;
