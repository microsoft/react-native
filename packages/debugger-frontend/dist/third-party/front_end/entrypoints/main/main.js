import*as e from"../../core/sdk/sdk.js";import*as t from"../../core/common/common.js";import*as n from"../../core/host/host.js";import*as o from"../../core/i18n/i18n.js";import*as s from"../../core/platform/platform.js";import*as r from"../../core/protocol_client/protocol_client.js";import*as i from"../../core/root/root.js";import*as a from"../../models/autofill_manager/autofill_manager.js";import*as c from"../../models/bindings/bindings.js";import*as l from"../../models/breakpoints/breakpoints.js";import*as d from"../../models/crux-manager/crux-manager.js";import*as g from"../../models/extensions/extensions.js";import*as m from"../../models/issues_manager/issues_manager.js";import*as p from"../../models/live-metrics/live-metrics.js";import*as u from"../../models/logs/logs.js";import*as h from"../../models/persistence/persistence.js";import*as f from"../../models/workspace/workspace.js";import*as w from"../../panels/snippets/snippets.js";import*as S from"../../panels/timeline/timeline.js";import*as x from"../../ui/components/icon_button/icon_button.js";import*as v from"../../ui/legacy/components/perf_ui/perf_ui.js";import*as C from"../../ui/legacy/components/utils/utils.js";import*as b from"../../ui/legacy/legacy.js";import*as M from"../../ui/legacy/theme_support/theme_support.js";import*as I from"../../core/rn_experiments/rn_experiments.js";import*as T from"../../ui/visual_logging/visual_logging.js";class k{#e;#t;#n;#o;constructor(t,n){n.addFlavorChangeListener(e.RuntimeModel.ExecutionContext,this.#s,this),n.addFlavorChangeListener(e.Target.Target,this.#r,this),t.addModelListener(e.RuntimeModel.RuntimeModel,e.RuntimeModel.Events.ExecutionContextCreated,this.#i,this),t.addModelListener(e.RuntimeModel.RuntimeModel,e.RuntimeModel.Events.ExecutionContextDestroyed,this.#a,this),t.addModelListener(e.RuntimeModel.RuntimeModel,e.RuntimeModel.Events.ExecutionContextOrderChanged,this.#c,this),this.#e=t,this.#t=n,t.observeModels(e.RuntimeModel.RuntimeModel,this)}modelAdded(t){queueMicrotask(function(){this.#t.flavor(e.Target.Target)||this.#t.setFlavor(e.Target.Target,t.target())}.bind(this))}modelRemoved(t){const n=this.#t.flavor(e.RuntimeModel.ExecutionContext);n&&n.runtimeModel===t&&this.#l();const o=this.#e.models(e.RuntimeModel.RuntimeModel);this.#t.flavor(e.Target.Target)===t.target()&&o.length&&this.#t.setFlavor(e.Target.Target,o[0].target())}#s({data:t}){t&&(this.#t.setFlavor(e.Target.Target,t.target()),this.#o||(this.#n=this.#d(t)))}#d(e){return e.isDefault?e.target().name()+":"+e.frameId:""}#r({data:t}){const n=this.#t.flavor(e.RuntimeModel.ExecutionContext);if(!t||n&&n.target()===t)return;const o=t.model(e.RuntimeModel.RuntimeModel),s=o?o.executionContexts():[];if(!s.length)return;let r=null;for(let e=0;e<s.length&&!r;++e)this.#g(s[e])&&(r=s[e]);for(let e=0;e<s.length&&!r;++e)this.#m(s[e])&&(r=s[e]);this.#o=!0,this.#t.setFlavor(e.RuntimeModel.ExecutionContext,r||s[0]),this.#o=!1}#g(e){return!e.target().targetInfo()?.subtype&&(!(!this.#n||this.#n!==this.#d(e))||!this.#n&&this.#m(e))}#m(t){if(!t.isDefault||!t.frameId)return!1;if(t.target().parentTarget()?.type()===e.Target.Type.Frame)return!1;const n=t.target().model(e.ResourceTreeModel.ResourceTreeModel),o=n&&n.frameForId(t.frameId);return Boolean(o?.isOutermostFrame())}#i(e){this.#p(e.data)}#a(t){const n=t.data;this.#t.flavor(e.RuntimeModel.ExecutionContext)===n&&this.#l()}#c(e){const t=e.data.executionContexts();for(let e=0;e<t.length&&!this.#p(t[e]);e++);}#p(t){return!(this.#t.flavor(e.RuntimeModel.ExecutionContext)&&!this.#g(t))&&(this.#o=!0,this.#t.setFlavor(e.RuntimeModel.ExecutionContext,t),this.#o=!1,!0)}#l(){const t=this.#e.models(e.RuntimeModel.RuntimeModel);let n=null;for(let e=0;e<t.length&&!n;++e){const o=t[e].executionContexts();for(const e of o)if(this.#m(e)){n=e;break}}if(!n)for(let e=0;e<t.length&&!n;++e){const o=t[e].executionContexts();if(o.length){n=o[0];break}}this.#o=!0,this.#t.setFlavor(e.RuntimeModel.ExecutionContext,n),this.#o=!1}}var R=Object.freeze({__proto__:null,ExecutionContextSelector:k});const y="console-insights-toggled",E="console-insights-enabled";class D{constructor(){this.#u(),this.#h()}#f(){this.#w(E)?.get()&&t.Settings.Settings.instance().createLocalSetting("console-insights-onboarding-finished",!1).set(!1),t.Settings.Settings.instance().createLocalSetting(y,!1).set(!0)}#h(){this.#w(E)?.addChangeListener(this.#f,this)}dispose(){this.#w(E)?.removeChangeListener(this.#f,this)}#w(e){try{return t.Settings.moduleSetting(e)}catch{return}}#u(){const e=t.Settings.Settings.instance().createLocalSetting(y,!1),n=this.#w(E);if(!e.get()){const e=t.Settings.Settings.instance().getHostConfig();n?.set(!0!==e?.devToolsConsoleInsights.optIn)}}}var F=Object.freeze({__proto__:null,SettingTracker:D});const L={customizeAndControlDevtools:"Customize and control DevTools",dockSide:"Dock side",placementOfDevtoolsRelativeToThe:"Placement of DevTools relative to the page. ({PH1} to restore last position)",undockIntoSeparateWindow:"Undock into separate window",dockToBottom:"Dock to bottom",dockToRight:"Dock to right",dockToLeft:"Dock to left",focusDebuggee:"Focus page",hideConsoleDrawer:"Hide console drawer",showConsoleDrawer:"Show console drawer",moreTools:"More tools",help:"Help",dockSideNaviation:"Use left and right arrow keys to navigate the options"},P=o.i18n.registerUIStrings("entrypoints/main/MainImpl.ts",L),A=o.i18n.getLocalizedString.bind(void 0,P);class H{#S;#x;#v;constructor(){H.instanceForTest=this,this.#x=new Promise((e=>{this.#v=e})),this.#C()}static time(e){n.InspectorFrontendHost.isUnderTest()||console.time(e)}static timeEnd(e){n.InspectorFrontendHost.isUnderTest()||console.timeEnd(e)}async#C(){console.timeStamp("Main._loaded"),i.Runtime.Runtime.setPlatform(n.Platform.platform());const e=new Promise((e=>{n.InspectorFrontendHost.InspectorFrontendHostInstance.getPreferences(e)})),o=new Promise((e=>{n.InspectorFrontendHost.InspectorFrontendHostInstance.getHostConfig(e)})),[s,r]=await Promise.all([e,o]);console.timeStamp("Main._gotPreferences"),this.#b(),this.createSettings(s,r),await this.requestAndRegisterLocaleData(),n.userMetrics.syncSetting(t.Settings.Settings.instance().moduleSetting("sync-preferences").get());const a=t.Settings.Settings.instance().getHostConfig()?.devToolsVeLogging;if(a?.enabled)if(a?.testing){T.setVeDebugLoggingEnabled(!0,T.DebugLoggingFormat.Test);const e={processingThrottler:new t.Throttler.Throttler(10),keyboardLogThrottler:new t.Throttler.Throttler(10),hoverLogThrottler:new t.Throttler.Throttler(10),dragLogThrottler:new t.Throttler.Throttler(10),clickLogThrottler:new t.Throttler.Throttler(10),resizeLogThrottler:new t.Throttler.Throttler(10)};T.startLogging(e)}else T.startLogging();this.#M()}#b(){self.Extensions||={},self.Host||={},self.Host.userMetrics||=n.userMetrics,self.Host.UserMetrics||=n.UserMetrics,self.ProtocolClient||={},self.ProtocolClient.test||=r.InspectorBackend.test}async requestAndRegisterLocaleData(){const e=t.Settings.Settings.instance().moduleSetting("language").get(),s=o.DevToolsLocale.DevToolsLocale.instance({create:!0,data:{navigatorLanguage:navigator.language,settingLanguage:e,lookupClosestDevToolsLocale:o.i18n.lookupClosestSupportedDevToolsLocale}});n.userMetrics.language(s.locale),"en-US"!==s.locale&&await o.i18n.fetchAndRegisterLocaleData("en-US");try{await o.i18n.fetchAndRegisterLocaleData(s.locale)}catch(e){console.warn(`Unable to fetch & register locale data for '${s.locale}', falling back to 'en-US'. Cause: `,e),s.forceFallbackLocale()}}createSettings(e,o){this.#I();let s,r="";if(n.Platform.isCustomDevtoolsFrontend()?r="__custom__":i.Runtime.Runtime.queryParam("can_dock")||!Boolean(i.Runtime.Runtime.queryParam("debugFrontend"))||n.InspectorFrontendHost.isUnderTest()||(r="__bundled__"),!n.InspectorFrontendHost.isUnderTest()&&window.localStorage){const e={...t.Settings.NOOP_STORAGE,clear:()=>window.localStorage.clear()};s=new t.Settings.SettingsStorage(window.localStorage,e,r)}else s=new t.Settings.SettingsStorage({},t.Settings.NOOP_STORAGE,r);const a={register:e=>n.InspectorFrontendHost.InspectorFrontendHostInstance.registerPreference(e,{synced:!1}),set:n.InspectorFrontendHost.InspectorFrontendHostInstance.setPreference,get:e=>new Promise((t=>{n.InspectorFrontendHost.InspectorFrontendHostInstance.getPreference(e,t)})),remove:n.InspectorFrontendHost.InspectorFrontendHostInstance.removePreference,clear:n.InspectorFrontendHost.InspectorFrontendHostInstance.clearPreferences},c={...a,register:e=>n.InspectorFrontendHost.InspectorFrontendHostInstance.registerPreference(e,{synced:!0})},l=new t.Settings.SettingsStorage(e,c,r),d=new t.Settings.SettingsStorage(e,a,r);t.Settings.Settings.instance({forceNew:!0,syncedStorage:l,globalStorage:d,localStorage:s,config:o}),new D,n.InspectorFrontendHost.isUnderTest()||(new t.Settings.VersionController).updateVersion()}#I(){i.Runtime.experiments.register("apply-custom-stylesheet","Allow extensions to load custom stylesheets"),i.Runtime.experiments.register("capture-node-creation-stacks","Capture node creation stacks"),i.Runtime.experiments.register("live-heap-profile","Live heap profile",!0),i.Runtime.experiments.register("protocol-monitor","Protocol Monitor",void 0,"https://developer.chrome.com/blog/new-in-devtools-92/#protocol-monitor"),i.Runtime.experiments.register("sampling-heap-profiler-timeline","Sampling heap profiler timeline",!0),i.Runtime.experiments.register("show-option-tp-expose-internals-in-heap-snapshot","Show option to expose internals in heap snapshots"),i.Runtime.experiments.register("timeline-invalidation-tracking","Performance panel: invalidation tracking",!0),i.Runtime.experiments.register("timeline-show-all-events","Performance panel: show all events",!0),i.Runtime.experiments.register("timeline-v8-runtime-call-stats","Performance panel: V8 runtime call stats",!0),i.Runtime.experiments.register("timeline-enhanced-traces","Performance panel: Enable collecting enhanced traces",!0),i.Runtime.experiments.register("timeline-compiled-sources","Performance panel: Enable collecting source text for compiled script",!0),i.Runtime.experiments.register("timeline-debug-mode","Performance panel: Enable debug mode (trace event details, etc)",!0),i.Runtime.experiments.register("sources-frame-indentation-markers-temporarily-disable","Disable indentation markers temporarily",!1,"https://developer.chrome.com/blog/new-in-devtools-121/#indentation","https://crbug.com/1479986"),i.Runtime.experiments.register("instrumentation-breakpoints","Enable instrumentation breakpoints",!0),i.Runtime.experiments.register("use-source-map-scopes","Use scope information from source maps",!0),i.Runtime.experiments.register("apca","Enable new Advanced Perceptual Contrast Algorithm (APCA) replacing previous contrast ratio and AA/AAA guidelines",void 0,"https://developer.chrome.com/blog/new-in-devtools-89/#apca"),i.Runtime.experiments.register("full-accessibility-tree","Enable full accessibility tree view in the Elements panel",void 0,"https://developer.chrome.com/blog/new-in-devtools-90/#accesibility-tree","https://g.co/devtools/a11y-tree-feedback"),i.Runtime.experiments.register("font-editor","Enable new font editor within the Styles tab",void 0,"https://developer.chrome.com/blog/new-in-devtools-89/#font"),i.Runtime.experiments.register("contrast-issues","Enable automatic contrast issue reporting via the Issues panel",void 0,"https://developer.chrome.com/blog/new-in-devtools-90/#low-contrast"),i.Runtime.experiments.register("experimental-cookie-features","Enable experimental cookie features"),i.Runtime.experiments.register("css-type-component-length-deprecate","Deprecate CSS <length> authoring tool in the Styles tab",void 0,"https://goo.gle/devtools-deprecate-length-tools","https://crbug.com/1522657"),i.Runtime.experiments.register("styles-pane-css-changes","Sync CSS changes in the Styles tab"),i.Runtime.experiments.register("highlight-errors-elements-panel","Highlights a violating node or attribute in the Elements panel DOM tree"),i.Runtime.experiments.register("authored-deployed-grouping","Group sources into authored and deployed trees",void 0,"https://goo.gle/authored-deployed","https://goo.gle/authored-deployed-feedback"),i.Runtime.experiments.register("just-my-code","Hide ignore-listed code in Sources tree view"),i.Runtime.experiments.register("important-dom-properties","Highlight important DOM properties in the Properties tab"),i.Runtime.experiments.register("preloading-status-panel","Enable speculative loads panel in Application panel",!0),i.Runtime.experiments.register("outermost-target-selector","Enable background page selector (for prerendering)",!1),i.Runtime.experiments.register("network-panel-filter-bar-redesign","Redesign of the filter bar in the Network panel",!1,"https://goo.gle/devtools-network-filter-redesign","https://crbug.com/1500573"),i.Runtime.experiments.register("autofill-view","Autofill panel",!1,"https://goo.gle/devtools-autofill-panel","https://crbug.com/329106326"),i.Runtime.experiments.register("timeline-show-postmessage-events","Performance panel: show postMessage dispatch and handling flows"),i.Runtime.experiments.register("perf-panel-annotations","Performance panel: enable annotations",!0),i.Runtime.experiments.register("timeline-rpp-sidebar","Performance panel: enable sidebar",!0),i.Runtime.experiments.register("timeline-observations","Performance panel: enable live metrics landing page"),I.RNExperimentsImpl.Instance.copyInto(i.Runtime.experiments,"[React Native] "),i.Runtime.experiments.enableExperimentsByDefault(["css-type-component-length-deprecate","outermost-target-selector","preloading-status-panel","autofill-view",...i.Runtime.Runtime.queryParam("isChromeForTesting")?["protocol-monitor"]:[]]),i.Runtime.experiments.cleanUpStaleExperiments();const e=i.Runtime.Runtime.queryParam("enabledExperiments");if(e&&i.Runtime.experiments.setServerEnabledExperiments(e.split(";")),i.Runtime.experiments.enableExperimentsTransiently([]),n.InspectorFrontendHost.isUnderTest()){const e=i.Runtime.Runtime.queryParam("test");e&&e.includes("live-line-level-heap-profile.js")&&i.Runtime.experiments.enableForTest("live-heap-profile")}for(const e of i.Runtime.experiments.allConfigurableExperiments())e.isEnabled()?n.userMetrics.experimentEnabledAtLaunch(e.name):n.userMetrics.experimentDisabledAtLaunch(e.name)}async#M(){H.time("Main._createAppUI"),h.IsolatedFileSystemManager.IsolatedFileSystemManager.instance();const o=t.Settings.Settings.instance().createSetting("ui-theme","systemPreferred");b.UIUtils.initializeUIUtils(document),M.ThemeSupport.hasInstance()||M.ThemeSupport.instance({forceNew:!0,setting:o}),b.UIUtils.installComponentRootStyles(document.body),this.#T(document);const s=Boolean(i.Runtime.Runtime.queryParam("can_dock"));b.ZoomManager.ZoomManager.instance({forceNew:!0,win:window,frontendHost:n.InspectorFrontendHost.InspectorFrontendHostInstance}),b.ContextMenu.ContextMenu.initialize(),b.ContextMenu.ContextMenu.installHandler(document),u.NetworkLog.NetworkLog.instance(),e.FrameManager.FrameManager.instance(),u.LogManager.LogManager.instance(),m.IssuesManager.IssuesManager.instance({forceNew:!0,ensureFirst:!0,showThirdPartyIssuesSetting:m.Issue.getShowThirdPartyIssuesSetting(),hideIssueSetting:m.IssuesManager.getHideIssueByCodeSetting()}),m.ContrastCheckTrigger.ContrastCheckTrigger.instance(),b.DockController.DockController.instance({forceNew:!0,canDock:s}),e.NetworkManager.MultitargetNetworkManager.instance({forceNew:!0}),e.DOMDebuggerModel.DOMDebuggerManager.instance({forceNew:!0}),e.TargetManager.TargetManager.instance().addEventListener("SuspendStateChanged",this.#k.bind(this)),f.FileManager.FileManager.instance({forceNew:!0}),f.Workspace.WorkspaceImpl.instance(),c.NetworkProject.NetworkProjectManager.instance();const r=new c.ResourceMapping.ResourceMapping(e.TargetManager.TargetManager.instance(),f.Workspace.WorkspaceImpl.instance());new c.PresentationConsoleMessageHelper.PresentationConsoleMessageManager,c.CSSWorkspaceBinding.CSSWorkspaceBinding.instance({forceNew:!0,resourceMapping:r,targetManager:e.TargetManager.TargetManager.instance()}),c.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance({forceNew:!0,resourceMapping:r,targetManager:e.TargetManager.TargetManager.instance()}),e.TargetManager.TargetManager.instance().setScopeTarget(e.TargetManager.TargetManager.instance().primaryPageTarget()),b.Context.Context.instance().addFlavorChangeListener(e.Target.Target,(({data:t})=>{const n=t?.outermostTarget();e.TargetManager.TargetManager.instance().setScopeTarget(n)})),l.BreakpointManager.BreakpointManager.instance({forceNew:!0,workspace:f.Workspace.WorkspaceImpl.instance(),targetManager:e.TargetManager.TargetManager.instance(),debuggerWorkspaceBinding:c.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance()}),self.Extensions.extensionServer=g.ExtensionServer.ExtensionServer.instance({forceNew:!0}),new h.FileSystemWorkspaceBinding.FileSystemWorkspaceBinding(h.IsolatedFileSystemManager.IsolatedFileSystemManager.instance(),f.Workspace.WorkspaceImpl.instance()),h.IsolatedFileSystemManager.IsolatedFileSystemManager.instance().addPlatformFileSystem("snippet://",new w.ScriptSnippetFileSystem.SnippetFileSystem),h.Persistence.PersistenceImpl.instance({forceNew:!0,workspace:f.Workspace.WorkspaceImpl.instance(),breakpointManager:l.BreakpointManager.BreakpointManager.instance()}),h.NetworkPersistenceManager.NetworkPersistenceManager.instance({forceNew:!0,workspace:f.Workspace.WorkspaceImpl.instance()}),new k(e.TargetManager.TargetManager.instance(),b.Context.Context.instance()),c.IgnoreListManager.IgnoreListManager.instance({forceNew:!0,debuggerWorkspaceBinding:c.DebuggerWorkspaceBinding.DebuggerWorkspaceBinding.instance()}),a.AutofillManager.AutofillManager.instance(),i.Runtime.experiments.isEnabled("timeline-observations")&&(p.LiveMetrics.instance({forceNew:!0}),d.CrUXManager.instance({forceNew:!0})),new W;const S=b.ActionRegistry.ActionRegistry.instance({forceNew:!0});b.ShortcutRegistry.ShortcutRegistry.instance({forceNew:!0,actionRegistry:S}),this.#R(),H.timeEnd("Main._createAppUI");const x=t.AppProvider.getRegisteredAppProviders()[0];if(!x)throw new Error("Unable to boot DevTools, as the appprovider is missing");await this.#y(await x.loadAppProvider())}async#y(e){H.time("Main._showAppUI");const t=e.createApp();if(b.DockController.DockController.instance().initialize(),M.ThemeSupport.instance().fetchColorsAndApplyHostTheme(),t.presentUI(document),b.ActionRegistry.ActionRegistry.instance().hasAction("elements.toggle-element-search")){const e=b.ActionRegistry.ActionRegistry.instance().getAction("elements.toggle-element-search");n.InspectorFrontendHost.InspectorFrontendHostInstance.events.addEventListener(n.InspectorFrontendHostAPI.Events.EnterInspectElementMode,(()=>{e.execute()}),this)}n.InspectorFrontendHost.InspectorFrontendHostInstance.events.addEventListener(n.InspectorFrontendHostAPI.Events.RevealSourceLine,this.#E,this),await b.InspectorView.InspectorView.instance().createToolbars(),n.InspectorFrontendHost.InspectorFrontendHostInstance.loadCompleted();const o=i.Runtime.Runtime.queryParam("loadTimelineFromURL");null!==o&&S.TimelinePanel.LoadTimelineHandler.instance().handleQueryParam(o),b.ARIAUtils.getOrCreateAlertElements(),b.DockController.DockController.instance().announceDockLocation(),window.setTimeout(this.#D.bind(this),0),H.timeEnd("Main._showAppUI")}async#D(){H.time("Main._initializeTarget");for(const e of t.Runnable.earlyInitializationRunnables())await e().run();n.InspectorFrontendHost.InspectorFrontendHostInstance.readyForTest(),this.#v(),window.setTimeout(this.#F.bind(this),100),H.timeEnd("Main._initializeTarget")}#F(){H.time("Main._lateInitialization"),g.ExtensionServer.ExtensionServer.instance().initializeExtensions();const e=t.Runnable.lateInitializationRunnables().map((async e=>(await e()).run()));if(i.Runtime.experiments.isEnabled("live-heap-profile")){const n="memory-live-heap-profile";if(t.Settings.Settings.instance().moduleSetting(n).get())e.push(v.LiveHeapProfile.LiveHeapProfile.instance().run());else{const e=async o=>{o.data&&(t.Settings.Settings.instance().moduleSetting(n).removeChangeListener(e),v.LiveHeapProfile.LiveHeapProfile.instance().run())};t.Settings.Settings.instance().moduleSetting(n).addChangeListener(e)}}this.#S=Promise.all(e).then((()=>{})),H.timeEnd("Main._lateInitialization")}lateInitDonePromiseForTest(){return this.#S}readyForTest(){return this.#x}#R(){t.Console.Console.instance().addEventListener("messageAdded",(function({data:e}){e.show&&t.Console.Console.instance().show()}))}#E(e){const{url:n,lineNumber:o,columnNumber:s}=e.data,r=f.Workspace.WorkspaceImpl.instance().uiSourceCodeForURL(n);r?t.Revealer.reveal(r.uiLocation(o,s)):f.Workspace.WorkspaceImpl.instance().addEventListener(f.Workspace.Events.UISourceCodeAdded,(function e(r){const i=r.data;i.url()===n&&(t.Revealer.reveal(i.uiLocation(o,s)),f.Workspace.WorkspaceImpl.instance().removeEventListener(f.Workspace.Events.UISourceCodeAdded,e))}))}#L(e){e.handled||b.ShortcutRegistry.ShortcutRegistry.instance().handleShortcut(e)}#P(e){const t=new CustomEvent("clipboard-"+e.type,{bubbles:!0});t.original=e;const n=e.target&&e.target.ownerDocument,o=n?s.DOMUtilities.deepActiveElement(n):null;o&&o.dispatchEvent(t),t.handled&&e.preventDefault()}#A(e){(e.handled||e.target.classList.contains("popup-glasspane"))&&e.preventDefault()}#T(e){e.addEventListener("keydown",this.#L.bind(this),!1),e.addEventListener("beforecopy",this.#P.bind(this),!0),e.addEventListener("copy",this.#P.bind(this),!1),e.addEventListener("cut",this.#P.bind(this),!1),e.addEventListener("paste",this.#P.bind(this),!1),e.addEventListener("contextmenu",this.#A.bind(this),!0)}#k(){const t=e.TargetManager.TargetManager.instance().allTargetsSuspended();b.InspectorView.InspectorView.instance().onSuspendStateChanged(t)}static instanceForTest=null}globalThis.Main=globalThis.Main||{},globalThis.Main.Main=H;let _,N;class U{#H;constructor(){this.#H=new b.Toolbar.ToolbarMenuButton(this.#_.bind(this),!0,!0,"main-menu"),this.#H.setGlyph("dots-vertical"),this.#H.element.classList.add("main-menu"),this.#H.setTitle(A(L.customizeAndControlDevtools))}static instance(e={forceNew:null}){const{forceNew:t}=e;return _&&!t||(_=new U),_}item(){return this.#H}#_(o){if(b.DockController.DockController.instance().canDock()){const e=document.createElement("div");e.classList.add("flex-centered"),e.classList.add("flex-auto"),e.classList.add("location-menu"),e.tabIndex=-1,b.ARIAUtils.setLabel(e,L.dockSide+L.dockSideNaviation);const t=e.createChild("span","dockside-title");t.textContent=A(L.dockSide);const n=b.ShortcutRegistry.ShortcutRegistry.instance().shortcutsForAction("main.toggle-dock");b.Tooltip.Tooltip.install(t,A(L.placementOfDevtoolsRelativeToThe,{PH1:n[0].title()})),e.appendChild(t);const r=new b.Toolbar.Toolbar("",e);e.setAttribute("jslog",`${T.item("dock-side").track({keydown:"ArrowDown|ArrowLeft|ArrowRight"})}`),r.makeBlueOnHover();const a=new b.Toolbar.ToolbarToggle(A(L.undockIntoSeparateWindow),"dock-window",void 0,"current-dock-state-undock"),c=new b.Toolbar.ToolbarToggle(A(L.dockToBottom),"dock-bottom",void 0,"current-dock-state-bottom"),l=new b.Toolbar.ToolbarToggle(A(L.dockToRight),"dock-right",void 0,"current-dock-state-right"),d=new b.Toolbar.ToolbarToggle(A(L.dockToLeft),"dock-left",void 0,"current-dock-state-left");a.addEventListener("MouseDown",(e=>e.data.consume())),c.addEventListener("MouseDown",(e=>e.data.consume())),l.addEventListener("MouseDown",(e=>e.data.consume())),d.addEventListener("MouseDown",(e=>e.data.consume())),a.addEventListener("Click",i.bind(null,"undocked")),c.addEventListener("Click",i.bind(null,"bottom")),l.addEventListener("Click",i.bind(null,"right")),d.addEventListener("Click",i.bind(null,"left")),a.setToggled("undocked"===b.DockController.DockController.instance().dockSide()),c.setToggled("bottom"===b.DockController.DockController.instance().dockSide()),l.setToggled("right"===b.DockController.DockController.instance().dockSide()),d.setToggled("left"===b.DockController.DockController.instance().dockSide()),r.appendToolbarItem(a),r.appendToolbarItem(d),r.appendToolbarItem(c),r.appendToolbarItem(l),e.addEventListener("keydown",(t=>{let n=0;if("ArrowLeft"===t.key)n=-1;else{if("ArrowRight"!==t.key){if("ArrowDown"===t.key){const t=e.closest(".soft-context-menu");return void t?.dispatchEvent(new KeyboardEvent("keydown",{key:"ArrowDown"}))}return}n=1}const o=[a,d,c,l];let r=o.findIndex((e=>e.element.hasFocus()));r=s.NumberUtilities.clamp(r+n,0,o.length-1),o[r].element.focus(),t.consume(!0)})),o.headerSection().appendCustomItem(e,"dock-side")}const r=this.#H.element;function i(e){b.DockController.DockController.instance().once("AfterDockSideChanged").then((()=>{r.focus()})),b.DockController.DockController.instance().setDockSide(e),o.discard()}if("undocked"===b.DockController.DockController.instance().dockSide()){const t=e.TargetManager.TargetManager.instance().primaryPageTarget();t&&t.type()===e.Target.Type.Frame&&o.defaultSection().appendAction("inspector-main.focus-debuggee",A(L.focusDebuggee))}o.defaultSection().appendAction("main.toggle-drawer",b.InspectorView.InspectorView.instance().drawerVisible()?A(L.hideConsoleDrawer):A(L.showConsoleDrawer)),o.appendItemsAtLocation("mainMenu");const a=o.defaultSection().appendSubMenuItem(A(L.moreTools),!1,"more-tools"),c=b.ViewManager.getRegisteredViewExtensions(t.Settings.Settings.instance().getHostConfig());c.sort(((e,t)=>{const n=e.title(),o=t.title();return n.localeCompare(o)}));for(const e of c){const t=e.location(),o=e.persistence(),s=e.title(),r=e.viewId();if("issues-pane"!==r){if("closeable"===o&&("drawer-view"===t||"panel"===t))if(e.isPreviewFeature()){const e=x.Icon.create("experiment");a.defaultSection().appendItem(s,(()=>{b.ViewManager.ViewManager.instance().showView(r,!0,!1)}),{disabled:!1,additionalElement:e,jslogContext:r})}else a.defaultSection().appendItem(s,(()=>{b.ViewManager.ViewManager.instance().showView(r,!0,!1)}),{jslogContext:r})}else a.defaultSection().appendItem(s,(()=>{n.userMetrics.issuesPanelOpenedFrom(3),b.ViewManager.ViewManager.instance().showView("issues-pane",!0)}),{jslogContext:r})}o.footerSection().appendSubMenuItem(A(L.help),!1,"help").appendItemsAtLocation("mainMenuHelp")}}class j{#N;constructor(){this.#N=b.Toolbar.Toolbar.createActionButtonForId("settings.show",{showLabel:!1,userActionCode:void 0})}static instance(e={forceNew:null}){const{forceNew:t}=e;return N&&!t||(N=new j),N}item(){return this.#N}}class W{constructor(){e.TargetManager.TargetManager.instance().addModelListener(e.DebuggerModel.DebuggerModel,e.DebuggerModel.Events.DebuggerPaused,this.#U,this)}#U(n){e.TargetManager.TargetManager.instance().removeModelListener(e.DebuggerModel.DebuggerModel,e.DebuggerModel.Events.DebuggerPaused,this.#U,this);const o=n.data,s=o.debuggerPausedDetails();b.Context.Context.instance().setFlavor(e.Target.Target,o.target()),t.Revealer.reveal(s)}}var V=Object.freeze({__proto__:null,MainImpl:H,ZoomActionDelegate:class{handleAction(e,t){if(n.InspectorFrontendHost.InspectorFrontendHostInstance.isHostedMode())return!1;switch(t){case"main.zoom-in":return n.InspectorFrontendHost.InspectorFrontendHostInstance.zoomIn(),!0;case"main.zoom-out":return n.InspectorFrontendHost.InspectorFrontendHostInstance.zoomOut(),!0;case"main.zoom-reset":return n.InspectorFrontendHost.InspectorFrontendHostInstance.resetZoom(),!0}return!1}},SearchActionDelegate:class{handleAction(e,t){let n=b.SearchableView.SearchableView.fromElement(s.DOMUtilities.deepActiveElement(document));if(!n){const e=b.InspectorView.InspectorView.instance().currentPanelDeprecated();if(e&&e.searchableView&&(n=e.searchableView()),!n)return!1}switch(t){case"main.search-in-panel.find":return n.handleFindShortcut();case"main.search-in-panel.cancel":return n.handleCancelSearchShortcut();case"main.search-in-panel.find-next":return n.handleFindNextShortcut();case"main.search-in-panel.find-previous":return n.handleFindPreviousShortcut()}return!1}},MainMenuItem:U,SettingsButtonProvider:j,PauseListener:W,sendOverProtocol:function(e,t){return new Promise(((n,o)=>{const s=r.InspectorBackend.test.sendRawMessage;if(!s)return o("Unable to send message to test client");s(e,t,((e,...t)=>e?o(e):n(t)))}))},ReloadActionDelegate:class{handleAction(e,t){return"main.debug-reload"===t&&(C.Reload.reload(),!0)}}});class z{presentUI(e){const t=new b.RootView.RootView;b.InspectorView.InspectorView.instance().show(t.element),t.attachToDocument(e),t.focus()}}let B;class O{static instance(e={forceNew:null}){const{forceNew:t}=e;return B&&!t||(B=new O),B}createApp(){return new z}}var q=Object.freeze({__proto__:null,SimpleApp:z,SimpleAppProvider:O});export{R as ExecutionContextSelector,V as MainImpl,F as SettingTracker,q as SimpleApp};
