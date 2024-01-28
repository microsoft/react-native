/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTLinkingManager.h>
#import <ReactCommon/RCTSampleTurboModule.h>
#import <ReactCommon/SampleTurboCxxModule.h>

#import <React/RCTPushNotificationManager.h>

#if RCT_NEW_ARCH_ENABLED
#import <NativeCxxModuleExample/NativeCxxModuleExample.h>
#import <RNTMyNativeViewComponentView.h>
#endif

#if BUNDLE_PATH
NSString *kBundlePath = @"xplat/js/RKJSModules/EntryPoints/RNTesterTestBundle.js";
#else
#if !TARGET_OS_OSX // [macOS]
NSString *kBundlePath = @"js/RNTesterApp.ios";
#else // [macOS
NSString *kBundlePath = @"js/RNTesterApp.macos";
#endif // macOS]
#endif

@implementation AppDelegate

#if !TARGET_OS_OSX // [macOS]
- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
#else // [macOS
- (void)applicationDidFinishLaunching:(NSNotification *)notification
#endif // macOS]
{
  self.moduleName = @"RNTesterApp";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = [self prepareInitialProps];

#if !TARGET_OS_OSX // [macOS]
  return [super application:application didFinishLaunchingWithOptions:launchOptions];
#else // [macOS
  [super applicationDidFinishLaunching:notification];
#endif // macOS]
}

- (NSDictionary *)prepareInitialProps
{
  NSMutableDictionary *initProps = [NSMutableDictionary new];

  NSString *_routeUri = [[NSUserDefaults standardUserDefaults] stringForKey:@"route"];
  if (_routeUri) {
    initProps[@"exampleFromAppetizeParams"] = [NSString stringWithFormat:@"rntester://example/%@Example", _routeUri];
  }

  return initProps;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if !TARGET_OS_OSX // [macOS]
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"js/RNTesterApp.ios"];
#else // [macOS
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"js/RNTesterApp.macos"];
#endif
}

#if !TARGET_OS_OSX // [macOS]
- (BOOL)application:(UIApplication *)app
            openURL:(NSURL *)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey, id> *)options
{
  return [RCTLinkingManager application:app openURL:url options:options];
}
#endif // [macOS]

- (void)loadSourceForBridge:(RCTBridge *)bridge
                 onProgress:(RCTSourceLoadProgressBlock)onProgress
                 onComplete:(RCTSourceLoadBlock)loadCallback
{
  [RCTJavaScriptLoader loadBundleAtURL:[self sourceURLForBridge:bridge] onProgress:onProgress onComplete:loadCallback];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:(const std::string &)name
                                                      jsInvoker:(std::shared_ptr<facebook::react::CallInvoker>)jsInvoker
{
  if (name == std::string([@"SampleTurboCxxModule" UTF8String])) {
    return std::make_shared<facebook::react::SampleTurboCxxModule>(jsInvoker);
  }
#ifdef RCT_NEW_ARCH_ENABLED
  if (name == facebook::react::NativeCxxModuleExample::kModuleName) {
    return std::make_shared<facebook::react::NativeCxxModuleExample>(jsInvoker);
  }
#endif
  return nullptr;
}

// Required for the remoteNotificationsRegistered event.
- (void)application:(__unused RCTUIApplication *)application
    didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
  [RCTPushNotificationManager didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}

// Required for the remoteNotificationRegistrationError event.
- (void)application:(__unused RCTUIApplication *)application
    didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
  [RCTPushNotificationManager didFailToRegisterForRemoteNotificationsWithError:error];
}

// Required for the remoteNotificationReceived event.
- (void)application:(__unused RCTUIApplication *)application didReceiveRemoteNotification:(NSDictionary *)notification
{
  [RCTPushNotificationManager didReceiveRemoteNotification:notification];
}

#if TARGET_OS_IOS // [macOS] [visionOS]
// Required for the localNotificationReceived event.
- (void)application:(__unused UIApplication *)application
    didReceiveLocalNotification:(UILocalNotification *)notification
{
  [RCTPushNotificationManager didReceiveLocalNotification:notification];
}
#endif // [macOS] [visionOS]
#if TARGET_OS_OSX // [macOS
- (void)userNotificationCenter:(NSUserNotificationCenter *)center
        didDeliverNotification:(NSUserNotification *)notification
{
}

- (void)userNotificationCenter:(NSUserNotificationCenter *)center
       didActivateNotification:(NSUserNotification *)notification
{
  [RCTPushNotificationManager didReceiveUserNotification:notification];
}

- (BOOL)userNotificationCenter:(NSUserNotificationCenter *)center
     shouldPresentNotification:(NSUserNotification *)notification
{
  return YES;
}
#endif // macOS]

#pragma mark - RCTComponentViewFactoryComponentProvider

#if RCT_NEW_ARCH_ENABLED
- (nonnull NSDictionary<NSString *, Class<RCTComponentViewProtocol>> *)thirdPartyFabricComponents
{
  return @{@"RNTMyNativeView" : RNTMyNativeViewComponentView.class};
}

- (NSURL *)getBundleURL
{
#if !TARGET_OS_OSX // [macOS]
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"js/RNTesterApp.ios"];
#else // [macOS
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"js/RNTesterApp.macos"];
#endif // macOS]
}
#endif

@end
