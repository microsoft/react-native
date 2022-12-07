/*
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import <React/RCTUIKit.h> // TODO(macOS GH#774)

#include <react/renderer/textlayoutmanager/RCTFontProperties.h>
#include <react/renderer/textlayoutmanager/RCTFontUtils.h>

using namespace facebook::react;

inline static NSTextAlignment RCTNSTextAlignmentFromTextAlignment(TextAlignment textAlignment)
{
  switch (textAlignment) {
    case TextAlignment::Natural:
      return NSTextAlignmentNatural;
    case TextAlignment::Left:
      return NSTextAlignmentLeft;
    case TextAlignment::Right:
      return NSTextAlignmentRight;
    case TextAlignment::Center:
      return NSTextAlignmentCenter;
    case TextAlignment::Justified:
      return NSTextAlignmentJustified;
  }
}

inline static NSWritingDirection RCTNSWritingDirectionFromWritingDirection(WritingDirection writingDirection)
{
  switch (writingDirection) {
    case WritingDirection::Natural:
      return NSWritingDirectionNatural;
    case WritingDirection::LeftToRight:
      return NSWritingDirectionLeftToRight;
    case WritingDirection::RightToLeft:
      return NSWritingDirectionRightToLeft;
  }
}

inline static RCTFontStyle RCTFontStyleFromFontStyle(FontStyle fontStyle)
{
  switch (fontStyle) {
    case FontStyle::Normal:
      return RCTFontStyleNormal;
    case FontStyle::Italic:
      return RCTFontStyleItalic;
    case FontStyle::Oblique:
      return RCTFontStyleOblique;
  }
}

inline static RCTFontVariant RCTFontVariantFromFontVariant(FontVariant fontVariant)
{
  return (RCTFontVariant)fontVariant;
}

inline static NSUnderlineStyle RCTNSUnderlineStyleFromTextDecorationStyle(TextDecorationStyle textDecorationStyle)
{
  switch (textDecorationStyle) {
    case TextDecorationStyle::Solid:
      return NSUnderlineStyleSingle;
    case TextDecorationStyle::Double:
      return NSUnderlineStyleDouble;
    case TextDecorationStyle::Dashed:
      return NSUnderlinePatternDash | NSUnderlineStyleSingle;
    case TextDecorationStyle::Dotted:
      return NSUnderlinePatternDot | NSUnderlineStyleSingle;
  }
}

inline static RCTUIColor *RCTUIColorFromSharedColor(const SharedColor &sharedColor) // TODO(macOS GH#774)
{
  if (!sharedColor) {
    return nil;
  }

  if (*facebook::react::clearColor() == *sharedColor) {
    return [RCTUIColor clearColor]; // TODO(macOS GH#774)
  }

  if (*facebook::react::blackColor() == *sharedColor) {
    return [RCTUIColor blackColor]; // TODO(macOS GH#774)
  }

  if (*facebook::react::whiteColor() == *sharedColor) {
    return [RCTUIColor whiteColor]; // TODO(macOS GH#774)
  }

  auto components = facebook::react::colorComponentsFromColor(sharedColor);
  return [RCTUIColor colorWithRed:components.red green:components.green blue:components.blue alpha:components.alpha]; // TODO(macOS GH#774)
}
