/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import <React/RCTPushNotificationManager.h>

#import <UserNotifications/UserNotifications.h>

#import <FBReactNativeSpec/FBReactNativeSpec.h>
#import <React/RCTBridge.h>
#import <React/RCTConvert.h>
#import <React/RCTUtils.h>

#import "RCTPushNotificationPlugins.h"

NSString *const RCTRemoteNotificationReceived = @"RemoteNotificationReceived";

static NSString *const kLocalNotificationReceived = @"LocalNotificationReceived";
static NSString *const kRemoteNotificationsRegistered = @"RemoteNotificationsRegistered";
static NSString *const kRemoteNotificationRegistrationFailed = @"RemoteNotificationRegistrationFailed";

static NSString *const kErrorUnableToRequestPermissions = @"E_UNABLE_TO_REQUEST_PERMISSIONS";

#if !TARGET_OS_UIKITFORMAC

@interface RCTPushNotificationManager () <NativePushNotificationManagerIOSSpec>
@property (nonatomic, strong) NSMutableDictionary *remoteNotificationCallbacks;
@end

@implementation RCTConvert (UNNotificationContent)

+ (UNNotificationContent *)UNNotificationContent:(id)json
{
  NSDictionary<NSString *, id> *details = [self NSDictionary:json];
  BOOL isSilent = [RCTConvert BOOL:details[@"isSilent"]];
  UNMutableNotificationContent *content = [UNMutableNotificationContent new];
  content.title = [RCTConvert NSString:details[@"alertTitle"]];
  content.body = [RCTConvert NSString:details[@"alertBody"]];
  content.userInfo = [RCTConvert NSDictionary:details[@"userInfo"]];
  content.categoryIdentifier = [RCTConvert NSString:details[@"category"]];
  if (details[@"applicationIconBadgeNumber"]) {
    content.badge = [RCTConvert NSNumber:details[@"applicationIconBadgeNumber"]];
  }
  if (!isSilent) {
    NSString *soundName = [RCTConvert NSString:details[@"soundName"]];
    content.sound =
        soundName ? [UNNotificationSound soundNamed:details[@"soundName"]] : [UNNotificationSound defaultSound];
  }

  return content;
}

+ (NSDictionary<NSString *, id> *)NSDictionaryForNotification:
    (JS::NativePushNotificationManagerIOS::Notification &)notification
{
  // Note: alertAction is not set, as it is no longer relevant with UNNotification
  NSMutableDictionary *notificationDict = [NSMutableDictionary new];
  notificationDict[@"alertTitle"] = notification.alertTitle();
  notificationDict[@"alertBody"] = notification.alertBody();
  notificationDict[@"userInfo"] = notification.userInfo();
  notificationDict[@"category"] = notification.category();
  if (notification.fireIntervalSeconds()) {
    notificationDict[@"fireIntervalSeconds"] = @(*notification.fireIntervalSeconds());
  }
  if (notification.fireDate()) {
    notificationDict[@"fireDate"] = @(*notification.fireDate());
  }
  if (notification.applicationIconBadgeNumber()) {
    notificationDict[@"applicationIconBadgeNumber"] = @(*notification.applicationIconBadgeNumber());
  }
  if (notification.isSilent()) {
    notificationDict[@"isSilent"] = @(*notification.isSilent());
    if ([notificationDict[@"isSilent"] isEqualToNumber:@(NO)]) {
      notificationDict[@"soundName"] = notification.soundName();
    }
  }
  return notificationDict;
}

@end

#if !TARGET_OS_OSX // [macOS]
@implementation RCTConvert (UIBackgroundFetchResult)

RCT_ENUM_CONVERTER(
    UIBackgroundFetchResult,
    (@{
      @"UIBackgroundFetchResultNewData" : @(UIBackgroundFetchResultNewData),
      @"UIBackgroundFetchResultNoData" : @(UIBackgroundFetchResultNoData),
      @"UIBackgroundFetchResultFailed" : @(UIBackgroundFetchResultFailed),
    }),
    UIBackgroundFetchResultNoData,
    integerValue)
#endif // [macOS]

@end
#else
@interface RCTPushNotificationManager () <NativePushNotificationManagerIOSSpec>
@end
#endif // TARGET_OS_UIKITFORMAC

@implementation RCTPushNotificationManager

#if !TARGET_OS_UIKITFORMAC && !TARGET_OS_OSX // [macOS]

/** DEPRECATED. UILocalNotification was deprecated in iOS 10. Please don't add new callsites. */
static NSDictionary *RCTFormatLocalNotification(UILocalNotification *notification)
{
  NSMutableDictionary *formattedLocalNotification = [NSMutableDictionary dictionary];
  if (notification.fireDate) {
    NSDateFormatter *formatter = [NSDateFormatter new];
    [formatter setDateFormat:@"yyyy-MM-dd'T'HH:mm:ss.SSSZZZZZ"];
    NSString *fireDateString = [formatter stringFromDate:notification.fireDate];
    formattedLocalNotification[@"fireDate"] = fireDateString;
  }
  formattedLocalNotification[@"alertAction"] = RCTNullIfNil(notification.alertAction);
  formattedLocalNotification[@"alertBody"] = RCTNullIfNil(notification.alertBody);
  formattedLocalNotification[@"applicationIconBadgeNumber"] = @(notification.applicationIconBadgeNumber);
  formattedLocalNotification[@"category"] = RCTNullIfNil(notification.category);
  formattedLocalNotification[@"soundName"] = RCTNullIfNil(notification.soundName);
  formattedLocalNotification[@"userInfo"] = RCTNullIfNil(RCTJSONClean(notification.userInfo));
  formattedLocalNotification[@"remote"] = @NO;
  return formattedLocalNotification;
}

/** For delivered notifications */
static NSDictionary<NSString *, id> *RCTFormatUNNotification(UNNotification *notification)
{
  NSMutableDictionary *formattedLocalNotification = [NSMutableDictionary dictionary];
  if (notification.date) {
    formattedLocalNotification[@"fireDate"] = RCTFormatNotificationDateFromNSDate(notification.date);
  }
  [formattedLocalNotification addEntriesFromDictionary:RCTFormatUNNotificationContent(notification.request.content)];
  return formattedLocalNotification;
}

/** For scheduled notification requests */
static NSDictionary<NSString *, id> *RCTFormatUNNotificationRequest(UNNotificationRequest *request)
{
  NSMutableDictionary *formattedLocalNotification = [NSMutableDictionary dictionary];
  if (request.trigger) {
    NSDate *triggerDate = nil;
    if ([request.trigger isKindOfClass:[UNTimeIntervalNotificationTrigger class]]) {
      triggerDate = [(UNTimeIntervalNotificationTrigger *)request.trigger nextTriggerDate];
    } else if ([request.trigger isKindOfClass:[UNCalendarNotificationTrigger class]]) {
      triggerDate = [(UNCalendarNotificationTrigger *)request.trigger nextTriggerDate];
    }

    if (triggerDate) {
      formattedLocalNotification[@"fireDate"] = RCTFormatNotificationDateFromNSDate(triggerDate);
    }
  }
  [formattedLocalNotification addEntriesFromDictionary:RCTFormatUNNotificationContent(request.content)];
  return formattedLocalNotification;
}

static NSDictionary<NSString *, id> *RCTFormatUNNotificationContent(UNNotificationContent *content)
{
  // Note: soundName is not set because this can't be read from UNNotificationSound.
  // Note: alertAction is no longer relevant with UNNotification
  NSMutableDictionary *formattedLocalNotification = [NSMutableDictionary dictionary];
  formattedLocalNotification[@"alertTitle"] = RCTNullIfNil(content.title);
  formattedLocalNotification[@"alertBody"] = RCTNullIfNil(content.body);
  formattedLocalNotification[@"userInfo"] = RCTNullIfNil(RCTJSONClean(content.userInfo));
  formattedLocalNotification[@"category"] = content.categoryIdentifier;
  formattedLocalNotification[@"applicationIconBadgeNumber"] = content.badge;
  formattedLocalNotification[@"remote"] = @NO;
  return formattedLocalNotification;
}

static NSString *RCTFormatNotificationDateFromNSDate(NSDate *date)
{
  NSDateFormatter *formatter = [NSDateFormatter new];
  [formatter setDateFormat:@"yyyy-MM-dd'T'HH:mm:ss.SSSZZZZZ"];
  return [formatter stringFromDate:date];
}

#endif // TARGET_OS_UIKITFORMAC
#if TARGET_OS_OSX // [macOS

static NSDictionary *RCTFormatUserNotification(NSUserNotification *notification)
{
  NSMutableDictionary *formattedUserNotification = [NSMutableDictionary dictionary];
  if (notification.deliveryDate) {
    NSDateFormatter *formatter = [NSDateFormatter new];
    [formatter setDateFormat:@"yyyy-MM-dd'T'HH:mm:ss.SSSZZZZZ"];
    NSString *fireDateString = [formatter stringFromDate:notification.deliveryDate];
    formattedUserNotification[@"fireDate"] = fireDateString;
  }
  formattedUserNotification[@"alertAction"] = RCTNullIfNil(notification.actionButtonTitle);
  formattedUserNotification[@"alertBody"] = RCTNullIfNil(notification.informativeText);
  formattedUserNotification[@"soundName"] = RCTNullIfNil(notification.soundName);
  formattedUserNotification[@"userInfo"] = RCTNullIfNil(RCTJSONClean(notification.userInfo));
  formattedUserNotification[@"remote"] = @(notification.isRemote);
  formattedUserNotification[@"identifier"] = notification.identifier;
  return formattedUserNotification;
}
#endif // macOS]

RCT_EXPORT_MODULE()

- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

#if !TARGET_OS_UIKITFORMAC
- (void)startObserving
{
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(handleLocalNotificationReceived:)
                                               name:kLocalNotificationReceived
                                             object:nil];
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(handleRemoteNotificationReceived:)
                                               name:RCTRemoteNotificationReceived
                                             object:nil];
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(handleRemoteNotificationsRegistered:)
                                               name:kRemoteNotificationsRegistered
                                             object:nil];
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(handleRemoteNotificationRegistrationError:)
                                               name:kRemoteNotificationRegistrationFailed
                                             object:nil];
}

- (void)stopObserving
{
  [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[
    @"localNotificationReceived",
    @"remoteNotificationReceived",
    @"remoteNotificationsRegistered",
    @"remoteNotificationRegistrationError"
  ];
}

+ (void)didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
  NSMutableString *hexString = [NSMutableString string];
  NSUInteger deviceTokenLength = deviceToken.length;
  const unsigned char *bytes = reinterpret_cast<const unsigned char *>(deviceToken.bytes);
  for (NSUInteger i = 0; i < deviceTokenLength; i++) {
    [hexString appendFormat:@"%02x", bytes[i]];
  }
  [[NSNotificationCenter defaultCenter] postNotificationName:kRemoteNotificationsRegistered
                                                      object:self
                                                    userInfo:@{@"deviceToken" : [hexString copy]}];
}

+ (void)didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
  [[NSNotificationCenter defaultCenter] postNotificationName:kRemoteNotificationRegistrationFailed
                                                      object:self
                                                    userInfo:@{@"error" : error}];
}

+ (void)didReceiveRemoteNotification:(NSDictionary *)notification
{
  NSDictionary *userInfo = @{@"notification" : notification};
  [[NSNotificationCenter defaultCenter] postNotificationName:RCTRemoteNotificationReceived
                                                      object:self
                                                    userInfo:userInfo];
}

#if !TARGET_OS_OSX // [macOS]
+ (void)didReceiveRemoteNotification:(NSDictionary *)notification
              fetchCompletionHandler:(RCTRemoteNotificationCallback)completionHandler
{
  NSDictionary *userInfo = @{@"notification" : notification, @"completionHandler" : completionHandler};
  [[NSNotificationCenter defaultCenter] postNotificationName:RCTRemoteNotificationReceived
                                                      object:self
                                                    userInfo:userInfo];
}

+ (void)didReceiveLocalNotification:(UILocalNotification *)notification
{
  [[NSNotificationCenter defaultCenter] postNotificationName:kLocalNotificationReceived
                                                      object:self
                                                    userInfo:RCTFormatLocalNotification(notification)];
}

#else // [macOS

+ (void)didReceiveUserNotification:(NSUserNotification *)notification
{
  NSString *notificationName = notification.isRemote ? RCTRemoteNotificationReceived : kLocalNotificationReceived;
  NSDictionary *userInfo = notification.isRemote ? @{@"notification": notification.userInfo} : RCTFormatUserNotification(notification);
  [[NSNotificationCenter defaultCenter] postNotificationName:notificationName
                                                      object:self
                                                    userInfo:userInfo];
}

#endif // macOS]

- (void)handleLocalNotificationReceived:(NSNotification *)notification
{
  [self sendEventWithName:@"localNotificationReceived" body:notification.userInfo];
}

- (void)handleRemoteNotificationReceived:(NSNotification *)notification
{
  NSMutableDictionary *remoteNotification =
      [NSMutableDictionary dictionaryWithDictionary:notification.userInfo[@"notification"]];
#if !TARGET_OS_OSX // [macOS]
  RCTRemoteNotificationCallback completionHandler = notification.userInfo[@"completionHandler"];
#endif // [macOS]
  NSString *notificationId = [[NSUUID UUID] UUIDString];
  remoteNotification[@"notificationId"] = notificationId;
  remoteNotification[@"remote"] = @YES;
#if !TARGET_OS_OSX // [macOS]
  if (completionHandler) {
    if (!self.remoteNotificationCallbacks) {
      // Lazy initialization
      self.remoteNotificationCallbacks = [NSMutableDictionary dictionary];
    }
    self.remoteNotificationCallbacks[notificationId] = completionHandler;
  }
#endif // [macOS]

  [self sendEventWithName:@"remoteNotificationReceived" body:remoteNotification];
}

- (void)handleRemoteNotificationsRegistered:(NSNotification *)notification
{
  [self sendEventWithName:@"remoteNotificationsRegistered" body:notification.userInfo];
}

- (void)handleRemoteNotificationRegistrationError:(NSNotification *)notification
{
  NSError *error = notification.userInfo[@"error"];
  NSDictionary *errorDetails = @{
    @"message" : error.localizedDescription,
    @"code" : @(error.code),
    @"details" : error.userInfo,
  };
  [self sendEventWithName:@"remoteNotificationRegistrationError" body:errorDetails];
}

#if !TARGET_OS_OSX // [macOS]
RCT_EXPORT_METHOD(onFinishRemoteNotification : (NSString *)notificationId fetchResult : (NSString *)fetchResult)
{
  UIBackgroundFetchResult result = [RCTConvert UIBackgroundFetchResult:fetchResult];
  RCTRemoteNotificationCallback completionHandler = self.remoteNotificationCallbacks[notificationId];
  if (!completionHandler) {
    RCTLogError(@"There is no completion handler with notification id: %@", notificationId);
    return;
  }
  completionHandler(result);
  [self.remoteNotificationCallbacks removeObjectForKey:notificationId];
}
#endif // [macOS]

/**
 * Update the application icon badge number on the home screen
 */
RCT_EXPORT_METHOD(setApplicationIconBadgeNumber : (double)number)
{
#if !TARGET_OS_OSX // [macOS]
  RCTSharedApplication().applicationIconBadgeNumber = number;
#else // [macOS
  NSDockTile *tile = [NSApp dockTile];
  tile.showsApplicationBadge = number > 0;
  tile.badgeLabel = number > 0 ? [NSString stringWithFormat:@"%.0lf", number] : nil;
#endif // macOS]
}

/**
 * Get the current application icon badge number on the home screen
 */
RCT_EXPORT_METHOD(getApplicationIconBadgeNumber : (RCTResponseSenderBlock)callback)
{
#if !TARGET_OS_OSX // [macOS]
  callback(@[ @(RCTSharedApplication().applicationIconBadgeNumber) ]);
#else // [macOS
  callback(@[ @([NSApp dockTile].badgeLabel.integerValue) ]);
#endif // macOS]
}

RCT_EXPORT_METHOD(requestPermissions
                  : (JS::NativePushNotificationManagerIOS::SpecRequestPermissionsPermission &)permissions resolve
                  : (RCTPromiseResolveBlock)resolve reject
                  : (RCTPromiseRejectBlock)reject)
{
#if !TARGET_OS_OSX // [macOS]
  if (RCTRunningInAppExtension()) {
    reject(
        kErrorUnableToRequestPermissions,
        nil,
        RCTErrorWithMessage(@"Requesting push notifications is currently unavailable in an app extension"));
    return;
  }
#endif // [macOS]

  // Add a listener to make sure that startObserving has been called
  [self addListener:@"remoteNotificationsRegistered"];

  UNAuthorizationOptions options = UNAuthorizationOptionNone;

  if (permissions.alert()) {
    options |= UNAuthorizationOptionAlert;
  }
  if (permissions.badge()) {
    options |= UNAuthorizationOptionBadge;
  }
  if (permissions.sound()) {
    options |= UNAuthorizationOptionSound;
  }
#else
    NSRemoteNotificationType types = NSRemoteNotificationTypeNone;

    if (permissions.alert()) {
      types |= NSRemoteNotificationTypeAlert;
    }
    if (permissions.badge()) {
      types |= NSRemoteNotificationTypeBadge;
    }
    if (permissions.sound()) {
      types |= NSRemoteNotificationTypeSound;
    }
#endif // macOS]
  [UNUserNotificationCenter.currentNotificationCenter
      requestAuthorizationWithOptions:options
                    completionHandler:^(BOOL granted, NSError *_Nullable error) {
                      if (error != NULL) {
                        reject(@"-1", @"Error - Push authorization request failed.", error);
                      } else {
                        dispatch_async(dispatch_get_main_queue(), ^{
                          [RCTSharedApplication() registerForRemoteNotifications];
                          [UNUserNotificationCenter.currentNotificationCenter
                              getNotificationSettingsWithCompletionHandler:^(
                                  UNNotificationSettings *_Nonnull settings) {
                                resolve(RCTPromiseResolveValueForUNNotificationSettings(settings));
                              }];
                        });
                      }
                    }];
}

RCT_EXPORT_METHOD(abandonPermissions)
{
  [RCTSharedApplication() unregisterForRemoteNotifications];
}

RCT_EXPORT_METHOD(checkPermissions : (RCTResponseSenderBlock)callback)
{
#if !TARGET_OS_OSX // [macOS]
  if (RCTRunningInAppExtension()) {
    callback(@[ RCTSettingsDictForUNNotificationSettings(NO, NO, NO, NO, NO, NO, UNAuthorizationStatusNotDetermined) ]);
    return;
  }
#endif // [macOS]

  [UNUserNotificationCenter.currentNotificationCenter
      getNotificationSettingsWithCompletionHandler:^(UNNotificationSettings *_Nonnull settings) {
        callback(@[ RCTPromiseResolveValueForUNNotificationSettings(settings) ]);
      }];
}

static inline NSDictionary *RCTPromiseResolveValueForUNNotificationSettings(UNNotificationSettings *_Nonnull settings)
{
  return RCTSettingsDictForUNNotificationSettings(
      settings.alertSetting == UNNotificationSettingEnabled,
      settings.badgeSetting == UNNotificationSettingEnabled,
      settings.soundSetting == UNNotificationSettingEnabled,
      settings.criticalAlertSetting == UNNotificationSettingEnabled,
      settings.lockScreenSetting == UNNotificationSettingEnabled,
      settings.notificationCenterSetting == UNNotificationSettingEnabled,
      settings.authorizationStatus);
}

static inline NSDictionary *RCTSettingsDictForUNNotificationSettings(
    BOOL alert,
    BOOL badge,
    BOOL sound,
    BOOL critical,
    BOOL lockScreen,
    BOOL notificationCenter,
    UNAuthorizationStatus authorizationStatus)
{
  return @{
    @"alert" : @(alert),
    @"badge" : @(badge),
    @"sound" : @(sound),
    @"critical" : @(critical),
    @"lockScreen" : @(lockScreen),
    @"notificationCenter" : @(notificationCenter),
    @"authorizationStatus" : @(authorizationStatus)
  };
}

#if !TARGET_OS_OSX // [macOS]
RCT_EXPORT_METHOD(presentLocalNotification : (JS::NativePushNotificationManagerIOS::Notification &)notification)
{
  NSDictionary<NSString *, id> *notificationDict = [RCTConvert NSDictionaryForNotification:notification];
  UNNotificationContent *content = [RCTConvert UNNotificationContent:notificationDict];
  UNTimeIntervalNotificationTrigger *trigger = [UNTimeIntervalNotificationTrigger triggerWithTimeInterval:0.1
                                                                                                  repeats:NO];
  UNNotificationRequest *request = [UNNotificationRequest requestWithIdentifier:[[NSUUID UUID] UUIDString]
                                                                        content:content
                                                                        trigger:trigger];

  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  [center addNotificationRequest:request withCompletionHandler:nil];
}
#else // [macOS
RCT_EXPORT_METHOD(presentLocalNotification:(NSUserNotification *)notification)
{
  [[NSUserNotificationCenter defaultUserNotificationCenter] deliverNotification:notification];
}
#endif // macOS]

#if !TARGET_OS_OSX // [macOS]
RCT_EXPORT_METHOD(scheduleLocalNotification : (JS::NativePushNotificationManagerIOS::Notification &)notification)
{
  NSDictionary<NSString *, id> *notificationDict = [RCTConvert NSDictionaryForNotification:notification];
  UNNotificationContent *content = [RCTConvert UNNotificationContent:notificationDict];

  UNNotificationTrigger *trigger = nil;
  if (notificationDict[@"fireDate"]) {
    NSDate *fireDate = [RCTConvert NSDate:notificationDict[@"fireDate"]] ?: [NSDate date];
    NSCalendar *calendar = [NSCalendar currentCalendar];
    NSDateComponents *components =
        [calendar components:(NSCalendarUnitYear | NSCalendarUnitMonth | NSCalendarUnitDay | NSCalendarUnitHour |
                              NSCalendarUnitMinute | NSCalendarUnitSecond)
                    fromDate:fireDate];
    trigger = [UNCalendarNotificationTrigger triggerWithDateMatchingComponents:components repeats:NO];
  } else if (notificationDict[@"fireIntervalSeconds"]) {
    trigger = [UNTimeIntervalNotificationTrigger
        triggerWithTimeInterval:[notificationDict[@"fireIntervalSeconds"] doubleValue]
                        repeats:NO];
  }

  UNNotificationRequest *request = [UNNotificationRequest requestWithIdentifier:[[NSUUID UUID] UUIDString]
                                                                        content:content
                                                                        trigger:trigger];

  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  [center addNotificationRequest:request withCompletionHandler:nil];
}
#else // [macOS
RCT_EXPORT_METHOD(scheduleLocalNotification:(NSUserNotification *)notification)
{
  [[NSUserNotificationCenter defaultUserNotificationCenter] scheduleNotification:notification];
}
#endif // macOS]

RCT_EXPORT_METHOD(cancelAllLocalNotifications)
{
  [[UNUserNotificationCenter currentNotificationCenter]
      getPendingNotificationRequestsWithCompletionHandler:^(NSArray<UNNotificationRequest *> *requests) {
        NSMutableArray<NSString *> *notificationIdentifiersToCancel = [NSMutableArray new];
        for (UNNotificationRequest *request in requests) {
          [notificationIdentifiersToCancel addObject:request.identifier];
        }
        [[UNUserNotificationCenter currentNotificationCenter]
            removePendingNotificationRequestsWithIdentifiers:notificationIdentifiersToCancel];
      }];
}

RCT_EXPORT_METHOD(cancelLocalNotifications : (NSDictionary<NSString *, id> *)userInfo)
{
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  [center getPendingNotificationRequestsWithCompletionHandler:^(NSArray<UNNotificationRequest *> *_Nonnull requests) {
    NSMutableArray<NSString *> *notificationIdentifiersToCancel = [NSMutableArray new];
    for (UNNotificationRequest *request in requests) {
      NSDictionary<NSString *, id> *notificationInfo = request.content.userInfo;
      // Note: we do this with a loop instead of just `isEqualToDictionary:`
      // because we only require that all specified userInfo values match the
      // notificationInfo values - notificationInfo may contain additional values
      // which we don't care about.
      __block BOOL shouldCancel = YES;
      [userInfo enumerateKeysAndObjectsUsingBlock:^(NSString *key, id obj, BOOL *stop) {
        if (![notificationInfo[key] isEqual:obj]) {
          shouldCancel = NO;
          *stop = YES;
        }
      }];

      if (shouldCancel) {
        [notificationIdentifiersToCancel addObject:request.identifier];
      }
    }

    [center removePendingNotificationRequestsWithIdentifiers:notificationIdentifiersToCancel];
  }];
}

RCT_EXPORT_METHOD(getInitialNotification
                  : (RCTPromiseResolveBlock)resolve reject
                  : (__unused RCTPromiseRejectBlock)reject)
{
#if !TARGET_OS_OSX // [macOS]
  NSMutableDictionary<NSString *, id> *initialNotification =
      [self.bridge.launchOptions[UIApplicationLaunchOptionsRemoteNotificationKey] mutableCopy];

  UILocalNotification *initialLocalNotification =
      self.bridge.launchOptions[UIApplicationLaunchOptionsLocalNotificationKey];

  if (initialNotification) {
    initialNotification[@"remote"] = @YES;
    resolve(initialNotification);
  } else if (initialLocalNotification) {
    resolve(RCTFormatLocalNotification(initialLocalNotification));
  } else {
    resolve((id)kCFNull);
  }
#else // [macOS
  NSUserNotification *initialNotification = self.bridge.launchOptions[NSApplicationLaunchUserNotificationKey];
  if (initialNotification) {
    resolve(RCTFormatUserNotification(initialNotification));
  } else {
    resolve((id)kCFNull);
  }
#endif // macOS]
}

RCT_EXPORT_METHOD(getScheduledLocalNotifications : (RCTResponseSenderBlock)callback)
{
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  [center getPendingNotificationRequestsWithCompletionHandler:^(NSArray<UNNotificationRequest *> *_Nonnull requests) {
    NSMutableArray<NSDictionary *> *formattedScheduledLocalNotifications = [NSMutableArray new];
    for (UNNotificationRequest *request in requests) {
      [formattedScheduledLocalNotifications addObject:RCTFormatUNNotificationRequest(request)];
    }
    callback(@[ formattedScheduledLocalNotifications ]);
  }];
}

RCT_EXPORT_METHOD(removeAllDeliveredNotifications)
{
#if !TARGET_OS_OSX // [macOS]
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  [center removeAllDeliveredNotifications];
#else // [macOS
  [[NSUserNotificationCenter defaultUserNotificationCenter] removeAllDeliveredNotifications];
#endif // macOS]
}

RCT_EXPORT_METHOD(removeDeliveredNotifications : (NSArray<NSString *> *)identifiers)
{
#if !TARGET_OS_OSX // [macOS]
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  [center removeDeliveredNotificationsWithIdentifiers:identifiers];
#else // [macOS
  NSArray<NSUserNotification*> *notificationsToRemove = [[NSUserNotificationCenter defaultUserNotificationCenter].deliveredNotifications filteredArrayUsingPredicate:[NSPredicate predicateWithBlock:^BOOL(NSUserNotification* evaluatedObject, NSDictionary<NSString *,id> * _Nullable bindings) {
    return [identifiers containsObject:evaluatedObject.identifier];
  }]];
  for (NSUserNotification *notification in notificationsToRemove) {
    [[NSUserNotificationCenter defaultUserNotificationCenter] removeDeliveredNotification:notification];
  }
#endif // macOS]
}

RCT_EXPORT_METHOD(getDeliveredNotifications : (RCTResponseSenderBlock)callback)
{
#if !TARGET_OS_OSX // [macOS]
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  [center getDeliveredNotificationsWithCompletionHandler:^(NSArray<UNNotification *> *_Nonnull notifications) {
    NSMutableArray<NSDictionary *> *formattedNotifications = [NSMutableArray new];

    for (UNNotification *notification in notifications) {
      [formattedNotifications addObject:RCTFormatUNNotification(notification)];
    }
    callback(@[ formattedNotifications ]);
  }];
#else // [macOS
  NSMutableArray<NSDictionary *> *formattedNotifications = [NSMutableArray new];
  for (NSUserNotification *notification in [NSUserNotificationCenter defaultUserNotificationCenter].deliveredNotifications) {
    [formattedNotifications addObject:RCTFormatUserNotification(notification)];
  }
  callback(@[formattedNotifications]);
#endif // macOS]
}

RCT_EXPORT_METHOD(getAuthorizationStatus : (RCTResponseSenderBlock)callback)
{
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  [center getNotificationSettingsWithCompletionHandler:^(UNNotificationSettings *_Nonnull settings) {
    callback(@[ @(settings.authorizationStatus) ]);
  }];
}

#else // TARGET_OS_UIKITFORMAC

RCT_EXPORT_METHOD(onFinishRemoteNotification : (NSString *)notificationId fetchResult : (NSString *)fetchResult)
{
  RCTLogError(@"Not implemented: %@", NSStringFromSelector(_cmd));
}

RCT_EXPORT_METHOD(setApplicationIconBadgeNumber : (double)number)
{
  RCTLogError(@"Not implemented: %@", NSStringFromSelector(_cmd));
}

RCT_EXPORT_METHOD(getApplicationIconBadgeNumber : (RCTResponseSenderBlock)callback)
{
  RCTLogError(@"Not implemented: %@", NSStringFromSelector(_cmd));
}

RCT_EXPORT_METHOD(requestPermissions
                  : (JS::NativePushNotificationManagerIOS::SpecRequestPermissionsPermission &)permissions resolve
                  : (RCTPromiseResolveBlock)resolve reject
                  : (RCTPromiseRejectBlock)reject)
{
  RCTLogError(@"Not implemented: %@", NSStringFromSelector(_cmd));
}

RCT_EXPORT_METHOD(abandonPermissions)
{
  RCTLogError(@"Not implemented: %@", NSStringFromSelector(_cmd));
}

RCT_EXPORT_METHOD(checkPermissions : (RCTResponseSenderBlock)callback)
{
  RCTLogError(@"Not implemented: %@", NSStringFromSelector(_cmd));
}

RCT_EXPORT_METHOD(presentLocalNotification : (JS::NativePushNotificationManagerIOS::Notification &)notification)
{
  RCTLogError(@"Not implemented: %@", NSStringFromSelector(_cmd));
}

RCT_EXPORT_METHOD(scheduleLocalNotification : (JS::NativePushNotificationManagerIOS::Notification &)notification)
{
  RCTLogError(@"Not implemented: %@", NSStringFromSelector(_cmd));
}

RCT_EXPORT_METHOD(cancelAllLocalNotifications)
{
  RCTLogError(@"Not implemented: %@", NSStringFromSelector(_cmd));
}

RCT_EXPORT_METHOD(cancelLocalNotifications : (NSDictionary<NSString *, id> *)userInfo)
{
  RCTLogError(@"Not implemented: %@", NSStringFromSelector(_cmd));
}

RCT_EXPORT_METHOD(getInitialNotification
                  : (RCTPromiseResolveBlock)resolve reject
                  : (__unused RCTPromiseRejectBlock)reject)
{
  RCTLogError(@"Not implemented: %@", NSStringFromSelector(_cmd));
}

RCT_EXPORT_METHOD(getScheduledLocalNotifications : (RCTResponseSenderBlock)callback)
{
  RCTLogError(@"Not implemented: %@", NSStringFromSelector(_cmd));
}

RCT_EXPORT_METHOD(removeAllDeliveredNotifications)
{
  RCTLogError(@"Not implemented: %@", NSStringFromSelector(_cmd));
}

RCT_EXPORT_METHOD(removeDeliveredNotifications : (NSArray<NSString *> *)identifiers)
{
  RCTLogError(@"Not implemented: %@", NSStringFromSelector(_cmd));
}

RCT_EXPORT_METHOD(getDeliveredNotifications : (RCTResponseSenderBlock)callback)
{
  RCTLogError(@"Not implemented: %@", NSStringFromSelector(_cmd));
}

RCT_EXPORT_METHOD(getAuthorizationStatus : (RCTResponseSenderBlock)callback)
{
  RCTLogError(@"Not implemented: %@", NSStringFromSelector(_cmd));
}

- (NSArray<NSString *> *)supportedEvents
{
  return @[];
}

#endif // TARGET_OS_UIKITFORMAC

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativePushNotificationManagerIOSSpecJSI>(params);
}

@end

Class RCTPushNotificationManagerCls(void)
{
  return RCTPushNotificationManager.class;
}
