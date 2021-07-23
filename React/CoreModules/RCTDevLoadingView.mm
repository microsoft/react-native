/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import <React/RCTDevLoadingView.h>

#import <QuartzCore/QuartzCore.h>

#import <FBReactNativeSpec/FBReactNativeSpec.h>
#import <React/RCTBridge.h>
#import <React/RCTConvert.h>
#import <React/RCTDefines.h>
#import <React/RCTDevSettings.h> // TODO(OSS Candidate ISS#2710739)
#import <React/RCTDevLoadingViewSetEnabled.h>
#if !TARGET_OS_OSX
#import <React/RCTModalHostViewController.h>
#endif // !TARGET_OS_OSX
#import <React/RCTUtils.h>
#import <React/RCTUIKit.h> // TODO(macOS GH#774)

#import "CoreModulesPlugins.h"

using namespace facebook::react;

@interface RCTDevLoadingView () <NativeDevLoadingViewSpec>
@end

#if RCT_DEV | RCT_ENABLE_LOADING_VIEW

@implementation RCTDevLoadingView {
#if !TARGET_OS_OSX // TODO(macOS GH#774)
  UIWindow *_window;
  UILabel *_label;
#else // [TODO(macOS GH#774)
  NSWindow *_window;
  NSTextField *_label;
#endif // ]TODO(macOS GH#774)
  NSDate *_showDate;
}

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE()

+ (void)setEnabled:(BOOL)enabled
{
  RCTDevLoadingViewSetEnabled(enabled);
}

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

- (void)setBridge:(RCTBridge *)bridge
{
  _bridge = bridge;

  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(hide)
                                               name:RCTJavaScriptDidLoadNotification
                                             object:nil];
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(hide)
                                               name:RCTJavaScriptDidFailToLoadNotification
                                             object:nil];

  if ([[bridge devSettings] isDevModeEnabled] && bridge.loading) { // TODO(OSS Candidate ISS#2710739)
    [self showWithURL:bridge.bundleURL];
  }
}

- (void)showMessage:(NSString *)message color:(RCTUIColor *)color backgroundColor:(RCTUIColor *)backgroundColor // TODO(OSS Candidate ISS#2710739)
{
  if (!RCTDevLoadingViewGetEnabled()) {
    return;
  }

  dispatch_async(dispatch_get_main_queue(), ^{
    self->_showDate = [NSDate date];
    if (!self->_window && !RCTRunningInTestEnvironment()) {
#if !TARGET_OS_OSX // TODO(macOS GH#774)
      CGSize screenSize = [UIScreen mainScreen].bounds.size;

      if (@available(iOS 11.0, *)) {
        UIWindow *window = RCTSharedApplication().keyWindow;
        self->_window =
            [[UIWindow alloc] initWithFrame:CGRectMake(0, 0, screenSize.width, window.safeAreaInsets.top + 30)];
        self->_label = [[UILabel alloc] initWithFrame:CGRectMake(0, window.safeAreaInsets.top, screenSize.width, 30)];
      } else {
        self->_window = [[UIWindow alloc] initWithFrame:CGRectMake(0, 0, screenSize.width, 22)];
        self->_label = [[UILabel alloc] initWithFrame:self->_window.bounds];
      }
      [self->_window addSubview:self->_label];
#if TARGET_OS_TV
      self->_window.windowLevel = UIWindowLevelNormal + 1;
#else
      self->_window.windowLevel = UIWindowLevelStatusBar + 1;
#endif
      // set a root VC so rotation is supported
      self->_window.rootViewController = [UIViewController new];

      self->_label.font = [UIFont monospacedDigitSystemFontOfSize:12.0 weight:UIFontWeightRegular];
      self->_label.textAlignment = NSTextAlignmentCenter;
#elif TARGET_OS_OSX // [TODO(macOS GH#774)
      NSRect screenFrame = [NSScreen mainScreen].visibleFrame;
      self->_window = [[NSPanel alloc] initWithContentRect:NSMakeRect(screenFrame.origin.x + round((screenFrame.size.width - 375) / 2), screenFrame.size.height - 20, 375, 19)
                                                 styleMask:NSWindowStyleMaskBorderless
                                                   backing:NSBackingStoreBuffered
                                                     defer:YES];
      self->_window.releasedWhenClosed = NO;
      self->_window.backgroundColor = [NSColor clearColor];

      NSTextField *label = [[NSTextField alloc] initWithFrame:self->_window.contentView.bounds];
      label.alignment = NSTextAlignmentCenter;
      label.bezeled = NO;
      label.editable = NO;
      label.selectable = NO;
      label.wantsLayer = YES;
      label.layer.cornerRadius = label.frame.size.height / 3;
      self->_label = label;
      [[self->_window contentView] addSubview:label];
#endif // ]TODO(macOS GH#774)
    }

#if !TARGET_OS_OSX // TODO(macOS GH#774)
    self->_label.text = message;
    self->_label.textColor = color;
    self->_window.backgroundColor = backgroundColor;
    self->_window.hidden = NO;
#else // [TODO(macOS GH#774)
    self->_label.stringValue = message;
    self->_label.textColor = color;
    self->_label.backgroundColor = backgroundColor;
    [self->_window orderFront:nil];
#endif // ]TODO(macOS GH#774)

#if defined(__IPHONE_OS_VERSION_MAX_ALLOWED) && defined(__IPHONE_13_0) && \
    __IPHONE_OS_VERSION_MAX_ALLOWED >= __IPHONE_13_0
    if (@available(iOS 13.0, *)) {
      UIWindowScene *scene = (UIWindowScene *)RCTSharedApplication().connectedScenes.anyObject;
      self->_window.windowScene = scene;
    }
#endif
  });
}

RCT_EXPORT_METHOD(showMessage
                  : (NSString *)message withColor
                  : (NSNumber *__nonnull)color withBackgroundColor
                  : (NSNumber *__nonnull)backgroundColor)
{
  [self showMessage:message color:[RCTConvert UIColor:color] backgroundColor:[RCTConvert UIColor:backgroundColor]];
}

RCT_EXPORT_METHOD(hide)
{
  if (!RCTDevLoadingViewGetEnabled()) {
    return;
  }

  dispatch_async(dispatch_get_main_queue(), ^{
    const NSTimeInterval MIN_PRESENTED_TIME = 0.6;
    NSTimeInterval presentedTime = [[NSDate date] timeIntervalSinceDate:self->_showDate];
    NSTimeInterval delay = MAX(0, MIN_PRESENTED_TIME - presentedTime);
#if !TARGET_OS_OSX // TODO(macOS GH#774)
    CGRect windowFrame = self->_window.frame;
    [UIView animateWithDuration:0.25
        delay:delay
        options:0
        animations:^{
          self->_window.frame = CGRectOffset(windowFrame, 0, -windowFrame.size.height);
        }
        completion:^(__unused BOOL finished) {
          self->_window.frame = windowFrame;
          self->_window.hidden = YES;
          self->_window = nil;
        }];
#elif TARGET_OS_OSX // [TODO(macOS GH#774)
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(delay * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
      [NSAnimationContext runAnimationGroup:^(__unused NSAnimationContext *context) {
        self->_window.animator.alphaValue = 0.0;
      } completionHandler:^{
        [self->_window orderFront:self];
        self->_window = nil;
      }];
    });
#endif // ]TODO(macOS GH#774)
  });
}

- (void)showWithURL:(NSURL *)URL
{
  RCTUIColor *color; // TODO(macOS GH#774)
  RCTUIColor *backgroundColor; // TODO(macOS GH#774)
  NSString *message;
  if (URL.fileURL) {
    // If dev mode is not enabled, we don't want to show this kind of notification
#if !RCT_DEV
    return;
#endif
    color = [RCTUIColor whiteColor]; //TODO(OSS Candidate ISS#2710739) UIColor -> RCTUIColor
    backgroundColor = [RCTUIColor blackColor]; // TODO(OSS Candidate ISS#2710739)
    message = [NSString stringWithFormat:@"Connect to %@ to develop JavaScript.", RCT_PACKAGER_NAME];
  } else {
    color = [RCTUIColor whiteColor]; // TODO(OSS Candidate ISS#2710739)
    backgroundColor = [RCTUIColor colorWithHue:1. / 3 saturation:1 brightness:.35 alpha:1]; // TODO(OSS Candidate ISS#2710739)
    message = [NSString stringWithFormat:@"Loading from %@:%@...", URL.host, URL.port];
  }

  [self showMessage:message color:color backgroundColor:backgroundColor];
}

- (void)updateProgress:(RCTLoadingProgress *)progress
{
  if (!progress) {
    return;
  }
  dispatch_async(dispatch_get_main_queue(), ^{
#if !TARGET_OS_OSX // TODO(macOS GH#774)
    self->_label.text = [progress description];
#else // [TODO(macOS GH#774)
    self->_label.stringValue = [progress description];
#endif // ]TODO(macOS GH#774)
  });
}

- (std::shared_ptr<TurboModule>)getTurboModule:(const ObjCTurboModule::InitParams &)params
{
  return std::make_shared<NativeDevLoadingViewSpecJSI>(params);
}

@end

#else

@implementation RCTDevLoadingView

+ (NSString *)moduleName
{
  return nil;
}
+ (void)setEnabled:(BOOL)enabled
{
}
- (void)showMessage:(NSString *)message color:(UIColor *)color backgroundColor:(UIColor *)backgroundColor
{
}
- (void)showMessage:(NSString *)message withColor:(NSNumber *)color withBackgroundColor:(NSNumber *)backgroundColor
{
}
- (void)showWithURL:(NSURL *)URL
{
}
- (void)updateProgress:(RCTLoadingProgress *)progress
{
}
- (void)hide
{
}
- (std::shared_ptr<TurboModule>)getTurboModule:(const ObjCTurboModule::InitParams &)params
{
  return std::make_shared<NativeDevLoadingViewSpecJSI>(params);
}

@end

#endif

Class RCTDevLoadingViewCls(void)
{
  return RCTDevLoadingView.class;
}
