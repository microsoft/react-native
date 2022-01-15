/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#pragma once

#include <fbjni/fbjni.h>
#include <string>

namespace facebook {
namespace react {

class JReactSoftExceptionLogger
    : public jni::JavaClass<JReactSoftExceptionLogger> {
 public:
  static constexpr const char *kJavaDescriptor =
      "Lcom/facebook/react/bridge/ReactSoftExceptionLogger;";

  static void logNoThrowSoftExceptionWithMessage(
      std::string tag,
      std::string message);
};

} // namespace react
} // namespace facebook
