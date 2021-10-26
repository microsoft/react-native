--- ./ReactAndroid/src/main/java/com/facebook/react/views/view/ReactViewManager.java	2021-10-19 18:12:12.000000000 -0700
+++ /var/folders/vs/8_b205053dddbcv7btj0w0v80000gn/T/update-Ge4Sm3/merge/Focus/ReactAndroid/src/main/java/com/facebook/react/views/view/ReactViewManager.java	2021-10-25 12:22:45.000000000 -0700
@@ -25,6 +25,7 @@
 import com.facebook.react.uimanager.Spacing;
 import com.facebook.react.uimanager.ThemedReactContext;
 import com.facebook.react.uimanager.UIManagerHelper;
+import com.facebook.react.uimanager.UIManagerModule;
 import com.facebook.react.uimanager.ViewProps;
 import com.facebook.react.uimanager.annotations.ReactProp;
 import com.facebook.react.uimanager.annotations.ReactPropGroup;
@@ -48,8 +49,13 @@
     Spacing.START,
     Spacing.END,
   };
-  private static final int CMD_HOTSPOT_UPDATE = 1;
-  private static final int CMD_SET_PRESSED = 2;
+  // Focus or blur call on native components (through NativeMethodsMixin) redirects to TextInputState.js
+  // which dispatches focusTextInput or blurTextInput commands. These commands are mapped to FOCUS_TEXT_INPUT=1
+  // and BLUR_TEXT_INPUT=2 in ReactTextInputManager, hence these constants value should be in sync with ReactTextInputManager.
+  private static final int FOCUS_TEXT_INPUT = 1;
+  private static final int BLUR_TEXT_INPUT = 2;
+  private static final int CMD_HOTSPOT_UPDATE = 3;
+  private static final int CMD_SET_PRESSED = 4;
   private static final String HOTSPOT_UPDATE_KEY = "hotspotUpdate";
 
   @ReactProp(name = "accessible")
@@ -120,6 +126,36 @@
     }
   }
 
+  @Nullable
+  @Override
+  public Map<String, Object> getExportedCustomBubblingEventTypeConstants() {
+    return MapBuilder.<String, Object>builder()
+      .put(
+        "topOnFocusChange",
+        MapBuilder.of(
+          "phasedRegistrationNames",
+          MapBuilder.of("bubbled", "onFocusChange","captured", "onFocusChangeCapture")))
+      .build();
+  }
+
+  @Override
+  protected void addEventEmitters(
+    final ThemedReactContext reactContext,
+    final ReactViewGroup reactViewGroup) {
+    reactViewGroup.setOnFocusChangeListener(
+      new View.OnFocusChangeListener() {
+        @Override
+        public void onFocusChange(View v, boolean hasFocus) {
+          EventDispatcher eventDispatcher =
+            reactContext.getNativeModule(UIManagerModule.class).getEventDispatcher();
+            eventDispatcher.dispatchEvent(
+              new ReactViewFocusEvent(reactViewGroup.getId(), hasFocus));
+        }
+      }
+    );
+  }
+
+
   @ReactProp(name = "borderStyle")
   public void setBorderStyle(ReactViewGroup view, @Nullable String borderStyle) {
     view.setBorderStyle(borderStyle);
@@ -287,7 +323,7 @@
 
   @Override
   public Map<String, Integer> getCommandsMap() {
-    return MapBuilder.of(HOTSPOT_UPDATE_KEY, CMD_HOTSPOT_UPDATE, "setPressed", CMD_SET_PRESSED);
+    return MapBuilder.of("focusTextInput", FOCUS_TEXT_INPUT, "blurTextInput", BLUR_TEXT_INPUT, HOTSPOT_UPDATE_KEY, CMD_HOTSPOT_UPDATE, "setPressed", CMD_SET_PRESSED);
   }
 
   @Override
@@ -303,6 +339,16 @@
           handleSetPressed(root, args);
           break;
         }
+      case FOCUS_TEXT_INPUT: 
+        {
+          root.requestFocus();
+          break;
+        }
+      case BLUR_TEXT_INPUT: 
+        {
+          root.clearFocus();
+          break;
+        }
     }
   }
 
@@ -319,6 +365,16 @@
           handleSetPressed(root, args);
           break;
         }
+      case "focusTextInput": 
+        {
+          root.requestFocus();
+          break;
+        }
+      case "blurTextInput": 
+        {
+          root.clearFocus();
+          break;
+        }
     }
   }
 
