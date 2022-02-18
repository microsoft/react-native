/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "RCTConstants.h"

NSString *const RCTUserInterfaceStyleDidChangeNotification = @"RCTUserInterfaceStyleDidChangeNotification";
NSString *const RCTUserInterfaceStyleDidChangeNotificationTraitCollectionKey = @"traitCollection";

/*
 * W3C Pointer Events
 */
static BOOL RCTDispatchW3CPointerEvents = NO;

BOOL RCTGetDispatchW3CPointerEvents()
{
  return RCTDispatchW3CPointerEvents;
}

void RCTSetDispatchW3CPointerEvents(BOOL value)
{
  RCTDispatchW3CPointerEvents = value;
}

/*
 * Preemptive View Allocation
 */
static BOOL RCTInteropLayerKeepViewHierarchy = NO;

BOOL RCTGetInteropLayerKeepViewHierarchy()
{
  return RCTInteropLayerKeepViewHierarchy;
}

void RCTSetInteropLayerKeepViewHierarchy(BOOL value)
{
  RCTInteropLayerKeepViewHierarchy = value;
}
