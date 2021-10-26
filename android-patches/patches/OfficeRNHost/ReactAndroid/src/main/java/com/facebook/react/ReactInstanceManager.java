--- ./ReactAndroid/src/main/java/com/facebook/react/ReactInstanceManager.java	2021-10-06 16:05:18.000000000 -0700
+++ /var/folders/vs/8_b205053dddbcv7btj0w0v80000gn/T/update-Ge4Sm3/merge/OfficeRNHost/ReactAndroid/src/main/java/com/facebook/react/ReactInstanceManager.java	2021-10-25 12:22:45.000000000 -0700
@@ -51,6 +51,7 @@
 import com.facebook.infer.annotation.ThreadSafe;
 import com.facebook.react.bridge.Arguments;
 import com.facebook.react.bridge.CatalystInstance;
+import com.facebook.react.bridge.CatalystInstance.CatalystInstanceEventListener;
 import com.facebook.react.bridge.CatalystInstanceImpl;
 import com.facebook.react.bridge.JSBundleLoader;
 import com.facebook.react.bridge.JSIModule;
@@ -173,6 +174,7 @@
   private final @Nullable NativeModuleCallExceptionHandler mNativeModuleCallExceptionHandler;
   private final @Nullable JSIModulePackage mJSIModulePackage;
   private List<ViewManager> mViewManagers;
+  private @Nullable CatalystInstanceEventListener mCatalystInstanceEventListener;
 
   private class ReactContextInitParams {
     private final JavaScriptExecutorFactory mJsExecutorFactory;
@@ -193,6 +195,15 @@
     }
   }
 
+  /**
+  *
+  * Register CatalystInstanceEventListener
+  * This methods is called from Office ReactNativeHost
+  */
+  public void setCatalystInstanceEventListener(CatalystInstanceEventListener catalystInstanceEventListener) {
+    mCatalystInstanceEventListener = catalystInstanceEventListener;
+  }
+
   /** Creates a builder that is capable of creating an instance of {@link ReactInstanceManager}. */
   public static ReactInstanceManagerBuilder builder() {
     return new ReactInstanceManagerBuilder();
@@ -1245,7 +1256,8 @@
             .setJSExecutor(jsExecutor)
             .setRegistry(nativeModuleRegistry)
             .setJSBundleLoader(jsBundleLoader)
-            .setNativeModuleCallExceptionHandler(exceptionHandler);
+            .setNativeModuleCallExceptionHandler(exceptionHandler)
+	    .setCatalystInstanceEventListener(mCatalystInstanceEventListener);
 
     ReactMarker.logMarker(CREATE_CATALYST_INSTANCE_START);
     // CREATE_CATALYST_INSTANCE_END is in JSCExecutor.cpp
