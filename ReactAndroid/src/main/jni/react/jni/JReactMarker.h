/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#pragma once

#include <fbjni/fbjni.h>
#include <string>

#include <cxxreact/ReactMarker.h>

namespace facebook {
namespace react {

#ifndef RN_EXPORT
#define RN_EXPORT __attribute__((visibility("default")))
#endif

class JReactMarker : public facebook::jni::JavaClass<JReactMarker> {
 public:
  static constexpr auto kJavaDescriptor =
      "Lcom/facebook/react/bridge/ReactMarker;";
  RN_EXPORT static void setLogPerfMarkerIfNeeded();

 private:
  static void logMarker(const std::string &marker);
  static void logMarker(const std::string &marker, const std::string &tag);
  static void logMarker(
      const std::string &marker,
      const std::string &tag,
      const int instanceKey);
  static void logPerfMarker(
      const ReactMarker::ReactMarkerId markerId,
      const char *tag);
  static void logPerfMarkerBridgeless(
      const ReactMarker::ReactMarkerId markerId,
      const char *tag);
  static void logPerfMarkerWithInstanceKey(
      const ReactMarker::ReactMarkerId markerId,
      const char *tag,
      const int instanceKey);
};

} // namespace react
} // namespace facebook
