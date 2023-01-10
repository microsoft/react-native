/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import <React/RCTUtils.h>

#import <React/RCTAlertController.h>

@interface RCTAlertController ()

#if !TARGET_OS_OSX // [macOS]
@property (nonatomic, strong) UIWindow *alertWindow;
#endif // [macOS]

@end

@implementation RCTAlertController

#if !TARGET_OS_OSX // [macOS]
- (UIWindow *)alertWindow
{
  if (_alertWindow == nil) {
    _alertWindow = [[UIWindow alloc] initWithFrame:RCTSharedApplication().keyWindow.bounds];
    _alertWindow.rootViewController = [UIViewController new];
    _alertWindow.windowLevel = UIWindowLevelAlert + 1;
  }
  return _alertWindow;
}

- (void)show:(BOOL)animated completion:(void (^)(void))completion
{
  // [macOS
  // Call self.alertWindow to ensure that it gets populated
  UIWindow *alertWindow = self.alertWindow;

  // If the window is tracked by our application then it will show the alert
  if ([[[UIApplication sharedApplication] windows] containsObject:alertWindow]) {
    // On iOS 14, makeKeyAndVisible should only be called if alertWindow is tracked by the application.
    // Later versions of iOS appear to already do this check for us behind the scenes.
    [alertWindow makeKeyAndVisible];
    [alertWindow.rootViewController presentViewController:self animated:animated completion:completion];
  } else {
    // When using Scenes, we must present the alert from a view controller associated with a window in the Scene. A fresh window (i.e. _alertWindow) cannot show the alert.
    [RCTPresentedViewController() presentViewController:self animated:animated completion:completion];
  }
  // macOS]
}

- (void)hide
{
  [_alertWindow setHidden:YES];

  if (@available(iOS 13, *)) {
    _alertWindow.windowScene = nil;
  }

  _alertWindow = nil;
}
#endif // [macOS]

@end
