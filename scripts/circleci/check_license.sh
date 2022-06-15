#!/bin/bash
# Copyright (c) Meta Platforms, Inc. and affiliates.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

set -e

# Make sure we don't introduce accidental references to PATENTS.
EXPECTED='Folly/folly/experimental/DynamicParser-inl.h
Folly/folly/experimental/DynamicParser.cpp
Folly/folly/experimental/DynamicParser.h
Folly/folly/experimental/test/DynamicParserTest.cpp
scripts/circleci/check_license.sh'
ACTUAL=$(git grep -l PATENTS)

if [ "$EXPECTED" != "$ACTUAL" ]; then
  echo "PATENTS crept into some new files?"
  diff -u <(echo "$EXPECTED") <(echo "$ACTUAL") || true
  exit 1
fi
