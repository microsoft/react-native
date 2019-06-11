#include <string>


#include <folly/Conv.h>
#include <folly/dynamic.h>
#include <folly/Memory.h>
#include "AndroidJSCFactory.h"
#include "JReactMarker.h"

// using namespace facebook::jni;

namespace facebook {
namespace react {

namespace detail {
void injectJSExecutorAndroidPlatform() {
  // Inject some behavior into react/
  JReactMarker::setLogPerfMarkerIfNeeded();
 //TODO (VSO:2298684) : AndroidJSCFactory.cpp is doing a lot of things in this api, 
 // we will fill that in aforementioned VSO task.
}
}

std::unique_ptr<JSExecutorFactory> makeAndroidJSCExecutorFactory(
    const folly::dynamic& /* jscConfig*/) {
  detail::injectJSExecutorAndroidPlatform();
  return nullptr;
}

}}