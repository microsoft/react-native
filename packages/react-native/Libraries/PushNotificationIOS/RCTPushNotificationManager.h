/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import <React/RCTEventEmitter.h>
#if TARGET_OS_OSX // [macOS
#import <UserNotifications/UserNotifications.h>
#endif // macOS]

extern NSString *const RCTRemoteNotificationReceived;

@interface RCTPushNotificationManager : RCTEventEmitter

#if !TARGET_OS_OSX // [macOS]
typedef void (^RCTRemoteNotificationCallback)(UIBackgroundFetchResult result);
#endif // [macOS]

+ (void)didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken;
+ (void)didFailToRegisterForRemoteNotificationsWithError:(NSError *)error;
/**
 * Triggers remoteNotificationReceived or localNotificationReceived events.
 *
 * Call this method from UNUserNotificationCenterDelegate's
 * `userNotificationCenter:didReceiveNotificationResponse:withCompletionHandler:` in order to process a user tap on a
 * notification.
 *
 * To process notifications received while the app is in the foreground, call this method from
 * `userNotificationCenter:willPresentNotification:withCompletionHandler:`. Use the completion handler to determine if
 * the push notification should be shown; to match prior behavior which does not show foreground notifications, use
 * UNNotificationPresentationOptionNone.
 *
 * If you need to determine if the notification is remote, check that notification.request.trigger
 * is an instance of UNPushNotificationTrigger.
 */
+ (void)didReceiveNotification:(UNNotification *)notification;

 #if !TARGET_OS_OSX // [macOS]
/**
 * Call this from your app delegate's `application:didReceiveRemoteNotification:fetchCompletionHandler:`. If you
 * implement both that method and `userNotificationCenter:didReceiveNotificationResponse:withCompletionHandler:`, only
 * the latter will be called.
 */
+ (void)didReceiveRemoteNotification:(NSDictionary *)notification
              fetchCompletionHandler:(RCTRemoteNotificationCallback)completionHandler;
#if TARGET_OS_IOS // [visionOS]
/** DEPRECATED. Use didReceiveNotification instead. */
+ (void)didReceiveLocalNotification:(UILocalNotification *)notification RCT_DEPRECATED;
#endif // [visionOS]
#endif // [macOS]
#if TARGET_OS_OSX // [macOS
/** DEPRECATED. Use didReceiveNotification instead. */
+ (void)didReceiveUserNotification:(NSUserNotification *)notification RCT_DEPRECATED;
#endif // macOS]

/**
 * Call this in `userNotificationCenter:didReceiveNotificationResponse:withCompletionHandler:`
 * to get the correct value from .getInitialNotification in JS.
 */
+ (void)setInitialNotification:(UNNotification *)notification;

/** DEPRECATED. Use didReceiveNotification instead. */
+ (void)didReceiveRemoteNotification:(NSDictionary *)notification RCT_DEPRECATED;

@end
