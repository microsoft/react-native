/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "AppDelegate.h"

#import <UserNotifications/UserNotifications.h>

#import <React/RCTBundleURLProvider.h>
#import <React/RCTDefines.h>
#import <React/RCTLinkingManager.h>
#import <ReactCommon/RCTSampleTurboModule.h>
#import <ReactCommon/SampleTurboCxxModule.h>

#import <React/RCTPushNotificationManager.h>

#import <NativeCxxModuleExample/NativeCxxModuleExample.h>
#ifndef RN_DISABLE_OSS_PLUGIN_HEADER
#import <RNTMyNativeViewComponentView.h>
#endif

#if !TARGET_OS_OSX // [macOS]
static NSString *kBundlePath = @"js/RNTesterApp.ios";
#else // [macOS
static NSString *kBundlePath = @"js/RNTesterApp.macos";
#endif // macOS]

@interface AppDelegate () <UNUserNotificationCenterDelegate>
@end

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

  [[UNUserNotificationCenter currentNotificationCenter] setDelegate:self];

#if !TARGET_OS_OSX // [macOS]
  return [super application:application didFinishLaunchingWithOptions:launchOptions];
#else // [macOS
  [super applicationDidFinishLaunching:notification];
#endif // macOS]
}

#if !TARGET_OS_OSX // [macOS]
- (void)applicationDidEnterBackground:(UIApplication *)application
{
  [super applicationDidEnterBackground:application];
}
#endif // [macOS]

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
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:kBundlePath];
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
  if (name == facebook::react::NativeCxxModuleExample::kModuleName) {
    return std::make_shared<facebook::react::NativeCxxModuleExample>(jsInvoker);
  }
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

#pragma mark - UNUserNotificationCenterDelegate

// Required for the remoteNotificationReceived and localNotificationReceived events
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
       willPresentNotification:(UNNotification *)notification
         withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler
{
  [RCTPushNotificationManager didReceiveNotification:notification];
  completionHandler(UNNotificationPresentationOptionNone);
}

// Required for the remoteNotificationReceived and localNotificationReceived events
// Called when a notification is tapped from background. (Foreground notification will not be shown per
// the presentation option selected above).
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
    didReceiveNotificationResponse:(UNNotificationResponse *)response
             withCompletionHandler:(void (^)(void))completionHandler
{
  UNNotification *notification = response.notification;

  // This condition will be true if tapping the notification launched the app.
  if ([response.actionIdentifier isEqualToString:UNNotificationDefaultActionIdentifier]) {
    // This can be retrieved with getInitialNotification.
    [RCTPushNotificationManager setInitialNotification:notification];
  }

  [RCTPushNotificationManager didReceiveNotification:notification];
  completionHandler();
}
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

#pragma mark - New Arch Enabled settings

- (BOOL)bridgelessEnabled
{
  return [super bridgelessEnabled];
}

#pragma mark - RCTComponentViewFactoryComponentProvider

#ifndef RN_DISABLE_OSS_PLUGIN_HEADER
- (nonnull NSDictionary<NSString *, Class<RCTComponentViewProtocol>> *)thirdPartyFabricComponents
{
  return @{@"RNTMyNativeView" : RNTMyNativeViewComponentView.class};
}
#endif

- (NSURL *)bundleURL
{
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:kBundlePath];
}

@end
