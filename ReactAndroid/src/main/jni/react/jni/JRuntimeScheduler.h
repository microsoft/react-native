/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#pragma once

#include <fbjni/fbjni.h>
#include <react/renderer/runtimescheduler/RuntimeScheduler.h>

namespace facebook {
namespace react {

#ifndef RN_EXPORT
#define RN_EXPORT __attribute__((visibility("default")))
#endif

class JRuntimeScheduler : public jni::HybridClass<JRuntimeScheduler> {
 public:
  static auto constexpr kJavaDescriptor =
      "Lcom/facebook/react/bridge/RuntimeScheduler;";

  RN_EXPORT std::weak_ptr<RuntimeScheduler> get();

 private:
  friend HybridBase;
  JRuntimeScheduler(std::weak_ptr<RuntimeScheduler> runtimeScheduler);
  std::weak_ptr<RuntimeScheduler> runtimeScheduler_;
};

} // namespace react
} // namespace facebook
