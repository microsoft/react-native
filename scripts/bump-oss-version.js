#!/usr/bin/env node
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

/**
 * This script bumps a new version for open source releases.
 * It updates the version in json/gradle files and makes sure they are consistent between each other
 * After changing the files it makes a commit and tags it.
 * All you have to do is push changes to remote and CI will make a new build.
 */
const fs = require('fs');
const {cat, echo, exec, exit, sed} = require('shelljs');
const yargs = require('yargs');
const {parseVersion} = require('./version-utils');

let argv = yargs
  .option('r', {
    alias: 'remote',
    default: 'origin',
  })
  .option('ci', {
    type: 'boolean',
    default: false,
  })
  .option('p', { // [MacOS: Used during RNM's publish pipelines
    alias: 'rnmpublish',
    type: 'boolean',
    default: false,
  })
  .option('n', {
    alias: 'nightly',
    type: 'boolean',
    default: false,
  })
  .option('v', {
    alias: 'to-version',
    type: 'string',
  })
  .option('l', {
    alias: 'latest',
    type: 'boolean',
    default: false,
  }).argv;

const nightlyBuild = argv.nightly;
const ci = argv.ci;
const rnmpublish = argv.rnmpublish;

let version, branch;
if (nightlyBuild) {
  const currentCommit = exec('git rev-parse HEAD', {
    silent: true,
  }).stdout.trim();
  version = `0.0.0-${currentCommit.slice(0, 9)}`;
} else {
  if (!ci && process.env.BUILD_SOURCEBRANCH) {
    console.log(`BUILD_SOURCEBRANCH: ${process.env.BUILD_SOURCEBRANCH}`)
    branch = process.env.BUILD_SOURCEBRANCH.match(/refs\/heads\/(.*)/)[1];
    console.log(`Identified branch: ${branch}`)
  } else {
    branch = exec('git symbolic-ref --short HEAD', {
      silent: true,
    }).stdout.trim();
  }

  if (!ci && branch.indexOf('-stable') === -1) {
    echo('You must be in 0.XX-stable branch to bump a version');
    exit(1);
  }

  // e.g. 0.33
  let versionMajor = branch.slice(0, branch.indexOf('-stable'));

  // - check that argument version matches branch
  // e.g. 0.33.1 or 0.33.0-rc4
  version = argv._[0];
  if (!version || version.indexOf(versionMajor) !== 0) {
    echo(
      `You must pass a tag like 0.${versionMajor}.[X]-rc[Y] to bump a version`,
    );
    exit(1);
  }
}

let major,
  minor,
  patch,
  prerelease = -1;
try {
  ({major, minor, patch, prerelease} = parseVersion(version));
} catch (e) {
  echo(e.message);
  exit(1);
}

fs.writeFileSync(
  'ReactAndroid/src/main/java/com/facebook/react/modules/systeminfo/ReactNativeVersion.java',
  cat('scripts/versiontemplates/ReactNativeVersion.java.template')
    .replace('${major}', major)
    .replace('${minor}', minor)
    .replace('${patch}', patch)
    .replace(
      '${prerelease}',
      prerelease !== undefined ? `"${prerelease}"` : 'null',
    ),
  'utf-8',
);

fs.writeFileSync(
  'React/Base/RCTVersion.m',
  cat('scripts/versiontemplates/RCTVersion.m.template')
    .replace('${major}', `@(${major})`)
    .replace('${minor}', `@(${minor})`)
    .replace('${patch}', `@(${patch})`)
    .replace(
      '${prerelease}',
      prerelease !== undefined ? `@"${prerelease}"` : '[NSNull null]',
    ),
  'utf-8',
);

fs.writeFileSync(
  'ReactCommon/cxxreact/ReactNativeVersion.h',
  cat('scripts/versiontemplates/ReactNativeVersion.h.template')
    .replace('${major}', major)
    .replace('${minor}', minor)
    .replace('${patch}', patch)
    .replace(
      '${prerelease}',
      prerelease !== undefined ? `"${prerelease}"` : '""',
    ),
  'utf-8',
);

fs.writeFileSync(
  'Libraries/Core/ReactNativeVersion.js',
  cat('scripts/versiontemplates/ReactNativeVersion.js.template')
    .replace('${major}', major)
    .replace('${minor}', minor)
    .replace('${patch}', patch)
    .replace(
      '${prerelease}',
      prerelease !== undefined ? `'${prerelease}'` : 'null',
    ),
  'utf-8',
);

let packageJson = JSON.parse(cat('package.json'));
packageJson.version = version;
if (!rnmpublish) {
  delete packageJson.workspaces;
  delete packageJson.private;
}
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2), 'utf-8');

// Change ReactAndroid/gradle.properties
if (
  sed(
    '-i',
    /^VERSION_NAME=.*/,
    `VERSION_NAME=${version}`,
    'ReactAndroid/gradle.properties',
  ).code
) {
  echo("Couldn't update version for Gradle");
  exit(1);
}

// Change react-native version in the template's package.json
exec(`node scripts/set-rn-template-version.js ${version}`);

// Verify that files changed, we just do a git diff and check how many times version is added across files
let numberOfChangedLinesWithNewVersion = exec(
  `git diff -U0 | grep '^[+]' | grep -c ${version} `,
  {silent: true},
).stdout.trim();

// Release builds should commit the version bumps, and create tags.
// Nightly builds do not need to do that.
if (!nightlyBuild && !rnmpublish) {
  if (+numberOfChangedLinesWithNewVersion !== 3) {
    echo(
      'Failed to update all the files. package.json and gradle.properties must have versions in them',
    );
    echo('Fix the issue, revert and try again');
    exec('git diff');
    exit(1);
  }

  // Make commit [0.21.0-rc] Bump version numbers
  if (exec(`git commit -a -m "[${version}] Bump version numbers"`).code) {
    echo('failed to commit');
    exit(1);
  }

  // Add tag v0.21.0-rc
  if (exec(`git tag v${version}`).code) {
    echo(
      `failed to tag the commit with v${version}, are you sure this release wasn't made earlier?`,
    );
    echo('You may want to rollback the last commit');
    echo('git reset --hard HEAD~1');
    exit(1);
  }

  // Push newly created tag
  let remote = argv.remote;
  exec(`git push ${remote} v${version}`);

  // Tag latest if doing stable release.
  // This will also tag npm release as `latest`
  if (prerelease == null && argv.latest) {
    exec('git tag -d latest');
    exec(`git push ${remote} :latest`);
    exec('git tag latest');
    exec(`git push ${remote} latest`);
  }

  exec(`git push ${remote} ${branch} --follow-tags`);
}

exit(0);
