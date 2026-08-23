window.__ModuleLoader__.load({
  id: "dsh-better-ux",
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    var React = require("react")
    var h = React.createElement

    const STORAGE_KEY = "dsh-better-ux:v1"
    const CHANGE = "dsh-better-ux-change"
    const DEFAULTS = {
      sessionRow: { enabled: true, open: true, rename: true, fork: true, archive: true, tooltip: true },
      modelPicker: { enabled: true, open: true, search: true, providers: true, efforts: true, closeOnPick: false },
      mobileLayout: { enabled: true, open: true, longPressDrag: true, overflowHint: true, sidebarCompat: true, noPinchZoom: true, noAutoFocus: true },
      fontScale: { enabled: true, open: true, mobile: 80, desktop: 100 },
    }
    const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]))

    function loadSettings() {
      try {
        const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")
        const fontScale = { ...DEFAULTS.fontScale, ...(raw.fontScale || {}) }
        if (raw.fontScale && raw.fontScale.mobile === undefined) fontScale.mobile = raw.fontScale.phone ?? raw.fontScale.tablet ?? DEFAULTS.fontScale.mobile
        return {
          sessionRow: { ...DEFAULTS.sessionRow, ...(raw.sessionRow || {}) },
          modelPicker: { ...DEFAULTS.modelPicker, ...(raw.modelPicker || {}) },
          mobileLayout: { ...DEFAULTS.mobileLayout, ...(raw.mobileLayout || {}) },
          fontScale,
        }
      } catch {
        return {
          sessionRow: { ...DEFAULTS.sessionRow },
          modelPicker: { ...DEFAULTS.modelPicker },
          mobileLayout: { ...DEFAULTS.mobileLayout },
          fontScale: { ...DEFAULTS.fontScale },
        }
      }
    }

    function saveSettings(next) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      window.dispatchEvent(new Event(CHANGE))
    }

    const SESSION_CSS = `
@media (min-width:1024px){.YDXeBa_sessionRow.dsh-inline-menu-redundant .dsh-inline-native-menu{display:none!important}}
.dsh-inline-acts{display:inline-flex;align-items:center;gap:8px}
.dsh-inline-act{position:relative;width:16px;height:16px;padding:0;border:none;border-radius:4px;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;flex:none}
.dsh-inline-act:hover{color:var(--dsw-alias-label-primary)}
.dsh-inline-act svg{width:16px;height:16px;display:block}
.dsh-inline-act[data-tip-on="1"]:hover::after{content:attr(data-tip);position:absolute;top:calc(100% + 6px);left:50%;transform:translateX(-50%);z-index:2000;padding:4px 8px;border-radius:6px;border:1px solid var(--dsw-alias-border-inverted);background:var(--dsw-specific-menu);color:var(--dsw-alias-label-primary);font-size:12px;line-height:16px;white-space:nowrap;pointer-events:none;box-shadow:var(--dsw-shadow-lv3)}
`
    const VISION_ICON = encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="black" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>',
    )
    const VISION_MASK = `background:currentColor;-webkit-mask:url("data:image/svg+xml,${VISION_ICON}") center/contain no-repeat;mask:url("data:image/svg+xml,${VISION_ICON}") center/contain no-repeat`
    const PICKER_HIDE = "._7KE1Ra_menu{display:none!important}"
    const PICKER_CSS = `
.mpo-root{position:fixed;inset:0;z-index:4000;display:flex;align-items:center;justify-content:center;padding:24px}
.mpo-dim{position:absolute;inset:0;background:rgba(0,0,0,.46)}
.mpo-panel{position:relative;z-index:1;width:min(880px,calc(100vw - 48px));max-height:min(720px,calc(100vh - 48px));display:flex;flex-direction:column;border-radius:16px;border:1px solid var(--dsw-alias-border-inverted);background:var(--dsw-specific-menu);box-shadow:var(--dsw-shadow-lv3);overflow:hidden}
.mpo-head{display:flex;align-items:center;gap:12px;padding:16px 18px 12px}
.mpo-title{margin:0;color:var(--dsw-alias-label-primary);font-size:16px;font-weight:600;line-height:22px}
.mpo-search{flex:1;min-width:0;height:34px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);border-radius:10px;padding:0 12px;font-size:13px}
.mpo-search:focus{outline:none;border-color:var(--dsw-alias-label-tertiary)}
.mpo-close{width:28px;height:28px;border:none;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;font-size:18px;line-height:28px}
.mpo-close:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.mpo-providers-wrap{position:relative;min-width:0}
.mpo-providers-wrap:before,.mpo-providers-wrap:after{content:"";position:absolute;top:0;bottom:12px;width:8px;z-index:2;pointer-events:none;opacity:0;transition:opacity .16s var(--ds-ease-in-out)}
.mpo-providers-wrap:before{left:0;background:linear-gradient(90deg,var(--dsw-specific-menu),transparent)}
.mpo-providers-wrap:after{right:0;background:linear-gradient(270deg,var(--dsw-specific-menu),transparent)}
.mpo-providers-wrap[data-overflow-left="1"]:before,.mpo-providers-wrap[data-overflow-right="1"]:after{opacity:1}
.mpo-providers{display:flex;flex-wrap:nowrap;gap:8px;padding:0 18px 12px;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch}
.mpo-providers::-webkit-scrollbar{display:none}
.mpo-chip{height:28px;flex:none;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-secondary);border-radius:999px;padding:0 12px;font-size:12px;cursor:pointer}
.mpo-chip[data-on="1"]{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary);border-color:transparent}
.mpo-grid{flex:1;min-height:0;overflow:auto;padding:4px 18px 12px;display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px}
.mpo-card{text-align:left;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:inherit;border-radius:12px;padding:0;cursor:pointer;min-height:74px;display:flex;flex-direction:row;align-items:stretch;overflow:hidden}
.mpo-card:hover{background:var(--dsw-alias-interactive-bg-hover)}
.mpo-card[data-on="1"]{border-color:var(--dsw-alias-label-tertiary);background:var(--dsw-alias-interactive-bg-hover)}
.mpo-card-main{flex:1;min-width:0;padding:12px 14px;display:flex;flex-direction:column;gap:4px}
.mpo-card-name{color:var(--dsw-alias-label-primary);font-size:13px;font-weight:600;line-height:18px}
.mpo-card-meta{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:16px}
.mpo-card-vision{position:relative;flex:none;width:52px;align-self:stretch;border:none;border-left:1px solid var(--dsw-alias-border-l2);border-radius:0;background:transparent;cursor:pointer}
.mpo-card-vision::after{content:"";position:absolute;left:50%;top:50%;width:18px;height:18px;margin:-9px 0 0 -9px;${VISION_MASK};opacity:.55}
.mpo-card:hover:has(.mpo-card-vision:hover){background:var(--dsw-alias-bg-layer-1)}
.mpo-card[data-on="1"]:hover:has(.mpo-card-vision:hover){border-color:var(--dsw-alias-border-l2)}
.mpo-card-vision:hover,.mpo-card-vision[data-on="1"]{background:var(--dsw-alias-interactive-bg-hover)}
.mpo-card-vision:hover::after,.mpo-card-vision[data-on="1"]::after{opacity:1}
.mpo-empty{grid-column:1/-1;color:var(--dsw-alias-label-tertiary);padding:24px 8px;font-size:13px}
.mpo-foot{border-top:1px solid var(--dsw-alias-border-l1);padding:12px 18px 16px}
.mpo-foot-label{color:var(--dsw-alias-label-secondary);font-size:12px;margin-bottom:8px}
.mpo-efforts{display:flex;flex-wrap:wrap;gap:8px}
.mpo-effort{height:30px;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-secondary);border-radius:8px;padding:0 12px;font-size:12px;cursor:pointer}
.mpo-effort[data-on="1"]{background:var(--dsw-alias-label-primary);color:var(--dsw-alias-bg-base);border-color:transparent}
.mpo-effort:disabled{opacity:.4;cursor:default}
`
    const WAND_ICON = encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"/><path d="m14 7 3 3"/><path d="M5 6v4"/><path d="M19 14v4"/><path d="M10 2v2"/><path d="M7 8H3"/><path d="M21 16h-4"/><path d="M11 3H9"/></svg>',
    )
    const WAND_MASK = `background:currentColor;-webkit-mask:url("data:image/svg+xml,${WAND_ICON}") center/contain no-repeat;mask:url("data:image/svg+xml,${WAND_ICON}") center/contain no-repeat`
    const SETTINGS_CSS = `
.VOzbGW_navCell[data-dsh-bux-nav="1"] .VOzbGW_navIcon{display:none}
.VOzbGW_navCell[data-dsh-bux-nav="1"]::before{content:"";width:16px;height:16px;flex:none;${WAND_MASK}}
.bux-page{display:flex;flex-direction:column;max-width:720px;padding:0 2px 24px}
.bux-lead{color:var(--dsw-alias-label-secondary);font-size:13px;line-height:20px;margin:0 0 8px}
.bux-cat{padding:18px 0;border-bottom:1px solid var(--dsw-alias-border-l1)}
.bux-cat:last-child{border-bottom:0}
.bux-cat-head{display:flex;align-items:center;gap:10px;min-height:30px;margin-bottom:12px}
.bux-cat-title{flex:1;min-width:0;margin:0;color:var(--dsw-alias-label-primary);font-size:16px;font-weight:600;line-height:22px}
.bux-fold{box-sizing:border-box;width:28px;height:28px;flex:none;padding:0;border:0;border-radius:7px;background:transparent;color:var(--dsw-alias-label-tertiary);cursor:pointer;display:inline-flex;align-items:center;justify-content:center}
.bux-fold:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.bux-fold svg{width:16px;height:16px;display:block;transition:transform .16s var(--ds-ease-in-out)}
.bux-fold[aria-expanded="false"] svg{transform:rotate(-90deg)}
.bux-switch{appearance:none;box-sizing:border-box;width:38px;height:22px;flex:none;margin:0;border:1px solid var(--dsw-alias-border-l2);border-radius:999px;background:var(--dsw-alias-bg-layer-1);position:relative;cursor:pointer;transition:background .16s var(--ds-ease-in-out),border-color .16s var(--ds-ease-in-out)}
.bux-switch:checked{background:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-label-primary)}
.bux-switch:after{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:var(--dsw-alias-label-tertiary);transition:left .16s var(--ds-ease-in-out),background .16s var(--ds-ease-in-out)}
.bux-switch:checked:after{left:18px;background:var(--dsw-alias-bg-base)}
.bux-switch:focus-visible,.bux-check:focus-visible{outline:2px solid var(--dsw-alias-label-secondary);outline-offset:2px}
.bux-body{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.bux-option{box-sizing:border-box;min-height:44px;padding:0 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);cursor:pointer;display:flex;align-items:center;gap:10px;transition:background .16s var(--ds-ease-in-out),border-color .16s var(--ds-ease-in-out),color .16s var(--ds-ease-in-out)}
.bux-option:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.bux-option[data-checked="1"]{border-color:var(--dsw-alias-label-tertiary);background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.bux-option-label{min-width:0;font-size:13px;line-height:18px}
.bux-check{appearance:none;box-sizing:border-box;width:18px;height:18px;flex:none;margin:0;border:1px solid var(--dsw-alias-border-l2);border-radius:5px;background:var(--dsw-alias-bg-base);position:relative;cursor:pointer}
.bux-check:checked{background:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-label-primary)}
.bux-check:checked:after{content:"";position:absolute;left:4px;top:4px;width:7px;height:4px;border-left:2px solid var(--dsw-alias-bg-base);border-bottom:2px solid var(--dsw-alias-bg-base);transform:rotate(-45deg)}
.bux-scale-row{box-sizing:border-box;min-height:44px;padding:7px 10px 7px 12px;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-1);display:flex;align-items:center;justify-content:space-between;gap:12px}
.bux-scale-label{min-width:0;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:18px}
.bux-stepper{display:flex;align-items:center;gap:4px;flex:none}
.bux-stepper button{box-sizing:border-box;width:28px;height:28px;border:1px solid var(--dsw-alias-border-l2);border-radius:7px;background:transparent;color:var(--dsw-alias-label-primary);font-size:18px;line-height:24px;cursor:pointer}
.bux-stepper button:hover{background:var(--dsw-alias-interactive-bg-hover)}
.bux-scale-input{box-sizing:border-box;width:56px;height:28px;border:1px solid var(--dsw-alias-border-l2);border-radius:7px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);text-align:center;font-size:13px}
.bux-scale-input:focus{outline:none;border-color:var(--dsw-alias-label-tertiary)}
.bux-scale-unit{color:var(--dsw-alias-label-tertiary);font-size:13px;margin-left:-2px}
@media (max-width:640px){.bux-body{grid-template-columns:minmax(0,1fr)}}
`

    const MOBILE_CSS = `
@media (max-width:1023px){
html.dsh-no-pinch-zoom,html.dsh-no-pinch-zoom body{touch-action:pan-x pan-y}
.pI_x6G_frame.dsh-mobile-frame{grid-template-columns:minmax(0,1fr)!important;grid-template-rows:100%!important}
.pI_x6G_frame.dsh-mobile-frame .pI_x6G_sidebarCol{display:none!important}
.pI_x6G_frame.dsh-mobile-frame .pI_x6G_sidebarCol:has(.VOzbGW_panel){display:block!important;position:fixed;inset:0;width:100%!important;height:100%!important;z-index:80}
.pI_x6G_frame.dsh-mobile-frame .pI_x6G_centerCol{grid-column:1;grid-row:1;box-sizing:border-box;width:100%;height:100%;min-width:0;padding-top:calc(48px + var(--dsh-mobile-session-row-height,33.8px) + var(--dsh-mobile-session-row-height,33.8px) + env(safe-area-inset-top))!important}
.pI_x6G_frame.dsh-mobile-frame .pI_x6G_detailsCol{display:none!important}
.pI_x6G_frame.dsh-mobile-frame.dsh-mobile-sidebar-compat .nArs4W_toggleCluster{top:calc(52px + var(--dsh-mobile-session-row-height,33.8px) + var(--dsh-mobile-session-row-height,33.8px) + env(safe-area-inset-top))!important;z-index:55!important}
.pI_x6G_frame.dsh-mobile-frame.dsh-mobile-sidebar-compat .nArs4W_panel{top:calc(48px + var(--dsh-mobile-session-row-height,33.8px) + var(--dsh-mobile-session-row-height,33.8px) + env(safe-area-inset-top))!important}
body.dsh-mobile-active.dsh-mobile-sidebar-compat .nArs4W_toggleCluster{top:calc(52px + var(--dsh-mobile-session-row-height,33.8px) + var(--dsh-mobile-session-row-height,33.8px) + env(safe-area-inset-top))!important;z-index:55!important}
body.dsh-mobile-active.dsh-mobile-flat .pI_x6G_centerCol{padding-top:calc(48px + var(--dsh-mobile-session-row-height,33.8px) + env(safe-area-inset-top))!important}
body.dsh-mobile-active.dsh-mobile-sidebar-compat .nArs4W_panel{top:calc(48px + var(--dsh-mobile-session-row-height,33.8px) + var(--dsh-mobile-session-row-height,33.8px) + env(safe-area-inset-top))!important}
body.dsh-mobile-active.dsh-mobile-flat.dsh-mobile-sidebar-compat .nArs4W_toggleCluster{top:calc(52px + var(--dsh-mobile-session-row-height,33.8px) + env(safe-area-inset-top))!important}
body.dsh-mobile-active.dsh-mobile-flat.dsh-mobile-sidebar-compat .nArs4W_panel{top:calc(48px + var(--dsh-mobile-session-row-height,33.8px) + env(safe-area-inset-top))!important}
.dsh-mobile-shell{position:fixed;inset:0 0 auto;box-sizing:border-box;height:calc(48px + var(--dsh-mobile-session-row-height,33.8px) + var(--dsh-mobile-session-row-height,33.8px) + env(safe-area-inset-top));padding-top:env(safe-area-inset-top);z-index:60;display:grid;grid-template-rows:48px var(--dsh-mobile-session-row-height,33.8px) var(--dsh-mobile-session-row-height,33.8px);background:var(--dsw-specific-sidebar-fill);border-bottom:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-primary);font-size:13px;isolation:isolate;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
.dsh-mobile-scroll-wrap{position:relative;min-width:0;overflow:hidden}
.dsh-mobile-scroll-wrap:before,.dsh-mobile-scroll-wrap:after{content:"";position:absolute;top:0;bottom:0;width:8px;z-index:5;pointer-events:none;opacity:0;transition:opacity .16s var(--ds-ease-in-out)}
.dsh-mobile-scroll-wrap:before{left:0;background:linear-gradient(90deg,var(--dsw-specific-sidebar-fill),transparent)}
.dsh-mobile-scroll-wrap:after{right:0;background:linear-gradient(270deg,var(--dsw-specific-sidebar-fill),transparent)}
.dsh-mobile-scroll-wrap[data-overflow-enabled="1"][data-overflow-left="1"]:before,.dsh-mobile-scroll-wrap[data-overflow-enabled="1"][data-overflow-right="1"]:after{opacity:1}
.dsh-mobile-controls{display:flex;align-items:center;gap:4px;min-width:0;padding:0 10px}
.dsh-mobile-actions{display:flex;align-items:center;gap:6px;flex:none;margin-left:auto}
.dsh-mobile-action{box-sizing:border-box;width:32px;height:32px;min-width:32px;padding:0;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);display:inline-flex;align-items:center;justify-content:center;cursor:pointer}
.dsh-mobile-logo{box-sizing:border-box;width:40px;height:40px;display:flex;align-items:center;justify-content:flex-start;overflow:hidden;flex:none;color:var(--dsw-alias-label-primary)}
.dsh-mobile-logo svg{width:34px!important;height:34px!important;max-width:none;flex:none}
.dsh-mobile-action svg{width:18px!important;height:18px!important;display:block}
.dsh-mobile-chrome-toggle{margin-left:2px}
.dsh-mobile-chrome-toggle svg{transition:transform .24s var(--ds-ease-in-out)}
.dsh-mobile-chrome-toggle[aria-expanded="false"] svg{transform:rotate(180deg)}
body.dsh-mobile-active .wSkVaW_header:not(.wSkVaW_headerHidden){box-sizing:border-box;overflow:hidden;max-height:var(--dsh-conversation-header-height,96px);opacity:1;transform:translateY(0);transition:max-height .24s var(--ds-ease-in-out),padding .24s var(--ds-ease-in-out),opacity .16s var(--ds-ease-in-out),transform .24s var(--ds-ease-in-out)}
body.dsh-mobile-active.dsh-conversation-header-collapsed .wSkVaW_header:not(.wSkVaW_headerHidden){max-height:0!important;padding-top:0!important;padding-bottom:0!important;border-bottom-width:0!important;opacity:0;transform:translateY(-8px);pointer-events:none}
.dsh-mobile-image-upload{position:relative}
.dsh-image-upload-icon{display:block;width:16px;height:16px;${VISION_MASK}}
.dsh-mobile-item-more{box-sizing:border-box;flex:none;width:24px;height:24px;margin-left:6px;padding:0;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-tertiary);font-size:15px;line-height:20px;text-align:center;cursor:pointer;display:inline-flex;align-items:center;justify-content:center}
.dsh-mobile-item-more svg{width:16px!important;height:16px!important;display:block}
.dsh-mobile-item-more:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dsh-mobile-search-popover{position:fixed;top:calc(48px + env(safe-area-inset-top));left:10px;right:10px;z-index:75;display:flex;align-items:center;gap:6px;padding:6px;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-specific-menu);box-shadow:var(--dsw-shadow-lv3,var(--dsw-shadow-lv3));color:var(--dsw-alias-label-primary)}
.dsh-mobile-search-input{box-sizing:border-box;width:100%;height:32px;min-width:0;border:0;border-radius:6px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);padding:0 9px;font-size:13px;outline:none}
.dsh-mobile-search-close{box-sizing:border-box;width:28px;height:28px;flex:none;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);font-size:18px;cursor:pointer}
.dsh-mobile-search-close:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}


.dsh-mobile-scroll{position:relative;z-index:1;box-sizing:border-box;width:100%;height:100%;display:flex;align-items:stretch;gap:4px;padding:0 10px;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch;touch-action:pan-x}
.dsh-mobile-scroll::-webkit-scrollbar{display:none}
.dsh-mobile-workspaces,.dsh-mobile-sessions{height:var(--dsh-mobile-session-row-height,33.8px)}
.dsh-mobile-workspaces .dsh-mobile-scroll,.dsh-mobile-sessions .dsh-mobile-scroll{height:calc(2.6em + 6px);align-items:flex-start}
.dsh-mobile-shell[data-flat="1"]{height:calc(48px + var(--dsh-mobile-session-row-height,33.8px) + env(safe-area-inset-top));grid-template-rows:48px 0 var(--dsh-mobile-session-row-height,33.8px)}
.dsh-mobile-shell[data-flat="1"] .dsh-mobile-workspaces{display:none}
.dsh-mobile-shell[data-flat="1"] .dsh-mobile-sessions{grid-row:3}

.dsh-mobile-item{box-sizing:border-box;position:relative;flex:none;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;text-align:left;display:flex;align-items:center;gap:8px;padding:0 10px;min-width:112px;height:48px;margin:6px 0;touch-action:pan-x}
.dsh-mobile-item:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dsh-mobile-item[data-selected="1"]{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-primary)}
.dsh-mobile-item[data-drag-active="1"]{opacity:.62}
.dsh-mobile-sort-capsule{position:fixed;z-index:70;display:flex;align-items:center;gap:2px;padding:4px;border:1px solid var(--dsw-alias-border-l2);border-radius:999px;background:var(--dsw-specific-menu);box-shadow:var(--dsw-shadow-lv3)}
.dsh-mobile-sort-capsule button{width:34px;height:34px;border:0;border-radius:999px;background:transparent;color:var(--dsw-alias-label-primary);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;padding:0}
.dsh-mobile-sort-capsule button:hover{background:var(--dsw-alias-interactive-bg-hover)}
.dsh-mobile-sort-capsule button:disabled{opacity:.35;cursor:default;background:transparent}
.dsh-mobile-sort-capsule svg{width:16px;height:16px;display:block}
.dsh-mobile-workspace-item{width:max-content;min-width:0;max-width:260px;height:2.6em;margin:0 0 6px;padding:0 8px;gap:6px;font-size:inherit}
.dsh-mobile-workspace-item .dsh-mobile-item-title{flex:1;min-width:0}
.dsh-mobile-session-item{width:max-content;min-width:0;max-width:none;height:2.6em;margin:0 0 6px;padding:0 8px;gap:6px;font-size:inherit}
.dsh-mobile-session-status{position:relative;display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;flex:none}
.dsh-mobile-session-status[data-state="warning"]:empty::before,.dsh-mobile-session-status[data-state="done"]:empty::before{content:"";width:8px;height:8px;border-radius:50%}
.dsh-mobile-session-status[data-state="warning"]:empty::before{background:#f2b84b}
.dsh-mobile-session-status[data-state="done"]:empty::before{background:#35c878}
.dsh-mobile-session-status[data-state="ongoing"]:empty::before{content:"";box-sizing:border-box;width:10px;height:10px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%}
.dsh-mobile-session-status svg{width:12px!important;height:12px!important;display:block;flex:none}
.dsh-mobile-item svg{width:16px;height:16px;display:block;flex:none}
.dsh-mobile-item-title{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;line-height:18px}
.dsh-mobile-session-item .dsh-mobile-item-title{width:auto;max-width:24ch;flex:0 1 auto}
.dsh-mobile-item-meta{max-width:100%;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:none}
.dsh-mobile-workspace-item .dsh-mobile-item-more,.dsh-mobile-session-item .dsh-mobile-item-more{margin-left:0}
.dsh-mobile-empty{height:2.6em;margin:0 0 6px;padding:0 10px;display:flex;align-items:center;color:var(--dsw-alias-label-tertiary);white-space:nowrap}
.dsh-mobile-view-menu{position:fixed;top:calc(44px + env(safe-area-inset-top));right:10px;z-index:75;width:190px;padding:6px;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-specific-menu);box-shadow:var(--ds-shadow-lv3,var(--dsw-shadow-lv3));color:var(--dsw-alias-label-primary)}
.dsh-mobile-view-label{padding:6px 8px;color:var(--dsw-alias-label-tertiary);font-size:11px}
.dsh-mobile-view-option{width:100%;height:32px;border:0;border-radius:6px;background:transparent;color:inherit;text-align:left;padding:0 8px;cursor:pointer}
.dsh-mobile-view-option:hover,.dsh-mobile-view-option[data-selected="1"]{background:var(--dsw-alias-interactive-bg-hover)}
.dsh-mobile-view-option:before{content:"";display:inline-block;width:14px;color:var(--dsw-alias-label-primary)}
.dsh-mobile-view-option[data-selected="1"]:before{content:"✓"}

.VOzbGW_panel{position:relative!important;width:calc(100vw - 24px)!important;max-width:none!important;height:calc(100vh - 24px)!important;max-height:none!important;flex-direction:column!important}
.VOzbGW_panel .VOzbGW_nav{box-sizing:border-box;width:100%!important;height:120px!important;min-height:120px!important;flex:0 0 120px!important;overflow:hidden!important}
.VOzbGW_panel .VOzbGW_navTitle{box-sizing:border-box;width:100%!important;height:32px!important;min-height:32px!important;flex:0 0 32px!important;padding:0 12px!important;display:flex!important;align-items:center!important}
.VOzbGW_panel .VOzbGW_navList{box-sizing:border-box;width:100%!important;height:44px!important;min-height:44px!important;flex:0 0 44px!important;display:flex!important;flex-direction:row!important;align-items:center!important;gap:4px!important;padding:0 8px!important;overflow-x:auto!important;overflow-y:hidden!important;scrollbar-width:none}
.VOzbGW_navList::-webkit-scrollbar{display:none}
.VOzbGW_navCell{box-sizing:border-box;flex:0 0 32px!important;width:32px!important;height:32px!important}
.VOzbGW_content{box-sizing:border-box;width:100%!important;min-width:0!important;flex:1 1 auto!important;overflow:hidden!important}
.VOzbGW_panel .VOzbGW_header{position:static!important;width:100%!important;min-width:0!important;height:0!important;min-height:0!important;flex:0 0 0!important;overflow:visible!important}
.VOzbGW_panel .VOzbGW_header .VOzbGW_close{position:absolute!important;top:18px!important;right:12px!important;z-index:5!important}
.VOzbGW_panel .VOzbGW_header button:first-child{position:absolute!important;top:18px!important;right:52px!important;z-index:5!important}
.VOzbGW_options{box-sizing:border-box;width:100%!important;min-width:0!important;overflow:auto!important;padding:0 14px 24px!important}
.uV2eYG_trailing{min-width:0!important;max-width:100%!important;flex:1 1 auto!important}
.uV2eYG_trailing ._7KE1Ra_root{box-sizing:border-box;min-width:0!important;max-width:44vw!important;flex:0 1 44vw!important;overflow:hidden!important}
.uV2eYG_trailing ._7KE1Ra_trigger{box-sizing:border-box;min-width:0!important;max-width:100%!important;overflow:hidden!important;white-space:nowrap!important}
.uV2eYG_trailing ._7KE1Ra_triggerLabel{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.uV2eYG_trailing ._7KE1Ra_triggerEffort{max-width:34%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
}
`

    const ICONS = {
      rename: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M9.2 3.2l3.6 3.6M3 13l.7-3.6L11.4 1.7a1.2 1.2 0 0 1 1.7 0l1.2 1.2a1.2 1.2 0 0 1 0 1.7L6.6 12.3 3 13z"/></svg>',
      fork: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="4.5" cy="3.5" r="1.4"/><circle cx="4.5" cy="12.5" r="1.4"/><circle cx="11.5" cy="8" r="1.4"/><path d="M4.5 4.9v5.6M4.5 8h5.6"/></svg>',
      archive: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2.5 5h11v8.2a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1V5zM2 3.2h12v1.8H2zM6.2 8.2h3.6"/></svg>',
    }
    const BUTTONS = [
      ["rename", "重命名"],
      ["fork", "分叉会话"],
      ["archive", "归档会话"],
    ]

    function fiberProps(row) {
      const key = Object.keys(row).find((name) => name.startsWith("__reactFiber$"))
      let fiber = key ? row[key] : null
      while (fiber) {
        const props = fiber.memoizedProps
        if (props && props.node && props.node.id && typeof props.onRename === "function") return props
        fiber = fiber.return
      }
      return null
    }

    function menuItems(button) {
      const key = Object.keys(button || {}).find((name) => name.startsWith("__reactFiber$"))
      let fiber = key ? button[key] : null
      while (fiber) {
        const props = fiber.memoizedProps
        if (Array.isArray(props?.items) && typeof props.onSelect === "function") return props.items
        fiber = fiber.return
      }
      return null
    }

    function startSessionRow() {
      const style = document.createElement("style")
      style.dataset.plugin = "dsh-better-ux-session"
      const syncCss = () => {
        style.textContent = SESSION_CSS
      }
      syncCss()
      document.head.appendChild(style)

      const clearNativeMenu = (row) => {
        row.classList.remove("dsh-inline-menu-redundant")
        for (const root of row.querySelectorAll(".dsh-inline-native-menu")) root.classList.remove("dsh-inline-native-menu")
      }

      const syncNativeMenu = (row, actions, settings) => {
        clearNativeMenu(row)
        const button = actions.querySelector("button.YDXeBa_iconButton")
        if (!button) return
        let root = button
        while (root.parentElement && root.parentElement !== actions) root = root.parentElement
        if (root.parentElement !== actions) return
        root.classList.add("dsh-inline-native-menu")
        const ids = menuItems(button)?.map((item) => item?.id)
        const allInline = BUTTONS.every(([id]) => settings[id] !== false)
        const nativeOnly = ids?.length === BUTTONS.length && BUTTONS.every(([id]) => ids.includes(id))
        row.classList.toggle("dsh-inline-menu-redundant", allInline && nativeOnly)
      }

      const enhance = (row) => {
        const settings = loadSettings().sessionRow
        const actions = row.querySelector(".YDXeBa_rowActions")
        const existing = row.querySelector(".dsh-inline-acts")
        if (!actions || !settings.enabled) {
          existing?.remove()
          clearNativeMenu(row)
          delete row.dataset.dshInlineActs
          return
        }
        if (existing) {
          for (const [id] of BUTTONS) {
            const button = existing.querySelector(`[data-act="${id}"]`)
            if (button) {
              button.hidden = settings[id] === false
              button.dataset.tipOn = settings.tooltip ? "1" : "0"
            }
          }
          syncNativeMenu(row, actions, settings)
          return
        }
        row.dataset.dshInlineActs = "1"
        const bar = document.createElement("span")
        bar.className = "dsh-inline-acts"
        for (const [id, tip] of BUTTONS) {
          const button = document.createElement("button")
          button.type = "button"
          button.className = "dsh-inline-act"
          button.dataset.act = id
          button.dataset.tip = tip
          button.dataset.tipOn = settings.tooltip ? "1" : "0"
          button.hidden = settings[id] === false
          button.setAttribute("aria-label", tip)
          button.innerHTML = ICONS[id]
          button.addEventListener("click", (event) => {
            event.preventDefault()
            event.stopPropagation()
            const props = fiberProps(row)
            if (!props) return
            if (id === "rename") props.onRename(props.node.id, props.node.title)
            if (id === "fork") props.onFork(props.node.id)
            if (id === "archive") props.onArchive(props.node.id)
          })
          bar.appendChild(button)
        }
        actions.appendChild(bar)
        syncNativeMenu(row, actions, settings)
      }

      const scan = (root) => {
        if (!root.querySelectorAll) return
        for (const row of root.querySelectorAll(".YDXeBa_sessionRow")) enhance(row)
      }

      scan(document)
      const observer = new MutationObserver((records) => {
        for (const record of records) {
          for (const node of record.addedNodes) {
            if (node.nodeType !== 1) continue
            const row = node.matches?.(".YDXeBa_sessionRow") ? node : node.closest?.(".YDXeBa_sessionRow")
            if (row) enhance(row)
            scan(node)
          }
        }
      })
      const observeBody = () => {
        if (document.body) observer.observe(document.body, { childList: true, subtree: true })
      }
      if (document.body) observeBody()
      else if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", observeBody, { once: true })
      else observeBody()
      const onPointerOver = (event) => {
        const row = event.target.closest?.(".YDXeBa_sessionRow")
        if (row) enhance(row)
      }
      const onChange = () => {
        syncCss()
        scan(document)
      }
      document.addEventListener("pointerover", onPointerOver, true)
      window.addEventListener(CHANGE, onChange)
      return () => {
        observer.disconnect()
        document.removeEventListener("DOMContentLoaded", observeBody)
        document.removeEventListener("pointerover", onPointerOver, true)
        window.removeEventListener(CHANGE, onChange)
        style.remove()
        for (const bar of document.querySelectorAll(".dsh-inline-acts")) bar.remove()
        for (const row of document.querySelectorAll("[data-dsh-inline-acts]")) {
          delete row.dataset.dshInlineActs
          clearNativeMenu(row)
        }
      }
    }

    const HOST_TEXT = {
      viewOptions: "视图选项",
      addWorkspace: "添加工作区",
      itemMenu: "操作",
      viewWorkspace: "按工作区",
      viewFlat: "单列表",
      orderManual: "手动排序",
      orderUpdated: "最近更新",
    }
    const SEL_VIEW_OPTIONS = `button[aria-label="${HOST_TEXT.viewOptions}"]`
    const SEL_ADD_WORKSPACE = `[aria-label="${HOST_TEXT.addWorkspace}"]`
    const SEL_ITEM_MENU = `button[aria-label*="${HOST_TEXT.itemMenu}"]`

    function startMobileLayout(ctx) {
      const style = document.createElement("style")
      style.dataset.plugin = "dsh-better-ux-mobile"
      const syncCss = () => {
        style.textContent = loadSettings().mobileLayout.enabled ? MOBILE_CSS : ""
      }
      syncCss()
      document.head.appendChild(style)

      let shell = null
      let viewMenu = null
      let searchPopover = null
      let searchQuery = ""
      let raf = null
      let observer = null
      let sourceObserver = null
      let lastData = null
      let activeFrame = null
      let selectedGroupKey = null
      let lastNativeGroupKey = null
      let suppressClickUntil = 0
      const suppressClickItems = new Set()
      let sourceInitiallyCollapsed = null
      let sourceExpandAt = 0
      let sourceExpandTimer = null
      let lastMobileSettings = ""
      let imageButton = null
      let imageInput = null
      let imageTools = null
      let imageComposer = null
      let imageComposerObserver = null
      let sessionHeightObserver = null
      let conversationHeaderExpanded = true
      let lastRenderAt = 0
      let suppressFocusUntil = 0
      let lastSessionId = null

      const mobileSettings = () => loadSettings().mobileLayout
      const mobileActive = () => mobileSettings().enabled && window.innerWidth <= 1023
      let pinchLocked = false
      let viewportMeta = null
      let viewportSaved = undefined
      let viewportCreated = false
      const pinchOpts = { capture: true, passive: false }
      const onPinchTouch = (event) => {
        if (event.touches.length > 1) event.preventDefault()
      }
      const onPinchGesture = (event) => event.preventDefault()
      const applyPinchLock = (on) => {
        if (on === pinchLocked) return
        pinchLocked = on
        document.documentElement.classList.toggle("dsh-no-pinch-zoom", on)
        if (on) {
          viewportMeta = document.querySelector('meta[name="viewport"]')
          if (viewportMeta) {
            viewportSaved = viewportMeta.getAttribute("content") || ""
            const kept = viewportSaved.split(",").map((part) => part.trim()).filter((part) => part && !/^(maximum-scale|minimum-scale|user-scalable)\s*=/i.test(part)).join(", ")
            viewportMeta.setAttribute("content", (kept ? kept + ", " : "") + "maximum-scale=1, user-scalable=no")
          } else {
            viewportMeta = document.createElement("meta")
            viewportMeta.setAttribute("name", "viewport")
            viewportMeta.setAttribute("content", "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no")
            document.head.appendChild(viewportMeta)
            viewportCreated = true
          }
          document.addEventListener("touchstart", onPinchTouch, pinchOpts)
          document.addEventListener("touchmove", onPinchTouch, pinchOpts)
          document.addEventListener("gesturestart", onPinchGesture, pinchOpts)
          document.addEventListener("gesturechange", onPinchGesture, pinchOpts)
          document.addEventListener("gestureend", onPinchGesture, pinchOpts)
        } else {
          if (viewportCreated) viewportMeta?.remove()
          else if (viewportMeta && viewportSaved !== undefined) viewportMeta.setAttribute("content", viewportSaved)
          viewportMeta = null
          viewportSaved = undefined
          viewportCreated = false
          document.removeEventListener("touchstart", onPinchTouch, pinchOpts)
          document.removeEventListener("touchmove", onPinchTouch, pinchOpts)
          document.removeEventListener("gesturestart", onPinchGesture, pinchOpts)
          document.removeEventListener("gesturechange", onPinchGesture, pinchOpts)
          document.removeEventListener("gestureend", onPinchGesture, pinchOpts)
        }
      }
      const fiberPropsFor = (node, predicate) => {
        const key = Object.keys(node || {}).find((name) => name.startsWith("__reactFiber$"))
        let fiber = key ? node[key] : null
        while (fiber) {
          const props = fiber.memoizedProps
          if (props && predicate(props)) return props
          fiber = fiber.return
        }
        return null
      }
      const sourceRoot = () => document.querySelector(".hHd-Xa_root")
      const sourceButton = (selector) => sourceRoot()?.querySelector(selector) || document.querySelector(selector)
      const sourceSvg = (selector) => sourceButton(selector)?.querySelector("svg")?.cloneNode(true) || null
      const stopSessionHeightObserver = () => {
        sessionHeightObserver?.disconnect()
        sessionHeightObserver = null
        document.body.style.removeProperty("--dsh-mobile-session-row-height")
        document.body.style.removeProperty("--dsh-conversation-header-height")
      }
      const observeSessionHeight = (target) => {
        stopSessionHeightObserver()
        sessionHeightObserver = new ResizeObserver(([entry]) => {
          document.body.style.setProperty("--dsh-mobile-session-row-height", `${Math.round(entry.contentRect.height * 100) / 100}px`)
        })
        sessionHeightObserver.observe(target)
      }
      const removeImageUpload = () => {
        imageComposerObserver?.disconnect()
        imageComposerObserver = null
        imageComposer = null
        imageButton?.remove()
        imageInput?.remove()
        imageButton = null
        imageInput = null
        imageTools = null
      }
      const syncImageUpload = () => {
        if (!mobileActive()) {
          removeImageUpload()
          return
        }
        const composer = document.querySelector(".uV2eYG_root")
        const tools = composer?.querySelector(".uV2eYG_tools")
        const plus = tools?.querySelector(".uV2eYG_add")
        const addImages = fiberPropsFor(composer, (props) => typeof props.addImages === "function")?.addImages
        if (!composer || !tools || !plus || !addImages) {
          removeImageUpload()
          return
        }
        if (composer !== imageComposer) {
          imageComposerObserver?.disconnect()
          imageComposer = composer
          imageComposerObserver = new MutationObserver(() => syncImageUpload())
          imageComposerObserver.observe(composer, { childList: true, subtree: true })
        }
        if (imageButton && imageTools === tools && tools.contains(imageButton)) return
        imageButton?.remove()
        imageInput?.remove()
        const input = document.createElement("input")
        input.type = "file"
        input.accept = "image/*"
        input.multiple = true
        input.tabIndex = -1
        input.setAttribute("aria-hidden", "true")
        input.style.display = "none"
        const button = document.createElement("button")
        button.type = "button"
        button.className = "uV2eYG_add dsh-mobile-image-upload"
        button.setAttribute("aria-label", "添加图片")
        button.title = "添加图片"
        const icon = document.createElement("span")
        icon.className = "dsh-image-upload-icon"
        button.appendChild(icon)
        button.addEventListener("click", () => input.click())
        input.addEventListener("change", () => {
          const files = [...input.files]
          const textarea = composer.querySelector(".uV2eYG_input")
          if (files.length && textarea) {
            const transfer = new DataTransfer()
            for (const file of files) transfer.items.add(file)
            const paste = new ClipboardEvent("paste", { bubbles: true, cancelable: true, clipboardData: transfer })
            if (paste.clipboardData === null) Object.defineProperty(paste, "clipboardData", { value: transfer })
            textarea.dispatchEvent(paste)
          }
          input.value = ""
        })
        plus.insertAdjacentElement("afterend", button)
        tools.appendChild(input)
        imageButton = button
        imageInput = input
        imageTools = tools
      }
 const rowDrag = (row) => fiberPropsFor(row, (props) => props.drag && typeof props.drag.start === "function" && typeof props.drag.end === "function")?.drag || null
      const groupHandlers = (group) => fiberPropsFor(group, (props) => typeof props.onDragOver === "function" && typeof props.onDrop === "function")
      const projectKey = (project, index) => fiberPropsFor(project, (props) => props.group && typeof props.group.key === "string")?.group?.key || "index:" + index
      const sessionProps = (row) => fiberPropsFor(row, (props) => props.node?.id && typeof props.onOpen === "function")
      const textOf = (node) => node?.textContent?.trim() || ""
      const titleOfRow = (row) => textOf(row.querySelector(".YDXeBa_title")) || textOf(row).replace(/\s+\d+分钟$|\s+\d+小时$|\s+\d+天$/, "").trim()
      const timeOfRow = (row) => textOf(row.querySelector(".YDXeBa_time"))
      const selectedOfRow = (row) => row.getAttribute("aria-selected") === "true" || row.classList.contains("YDXeBa_selected")

      const readNative = () => {
        const root = sourceRoot()
        const nativeGroups = [...document.querySelectorAll(".qDHVXG_groupSection")]
        if (!nativeGroups.length && !document.querySelector(".YDXeBa_sessionRow") && lastData?.groups?.length) return lastData
        const groups = nativeGroups.map((group, index) => {
          const project = group.querySelector(".YDXeBa_projectRow")
          const projectProps = project && fiberPropsFor(project, (props) => props.group && typeof props.group.key === "string")
          const key = projectKey(project, index)
          const sessions = [...group.querySelectorAll(".YDXeBa_sessionRow")].map((row) => {
            const props = sessionProps(row)
            return {
              id: props?.node?.id || "row:" + index + ":" + titleOfRow(row),
              title: titleOfRow(row) || "未命名会话",
              time: timeOfRow(row),
              selected: selectedOfRow(row),
              pendingInteraction: props?.node?.pendingInteraction,
              running: Boolean(props?.node?.running),
              runningSubagentCount: Number(props?.node?.runningSubagentCount || 0),
              completed: Boolean(props?.node?.completed),
              status: row.querySelector(".YDXeBa_slot")?.firstElementChild?.cloneNode(true) || null,
              source: row,
              drag: rowDrag(row),
              groupKey: key,
            }
          })
          return {
            key,
            title: textOf(project) || "未命名工作区",
            source: group,
            project,
            projectProps,
            handlers: groupHandlers(group),
            sessions,
            nativeCurrent: Boolean(projectProps?.group?.containsCurrent || sessions.some((session) => session.selected)),
          }
        })
        if (!groups.length) {
          const rows = [...document.querySelectorAll(".YDXeBa_sessionRow")]
          groups.push({
            key: "flat",
            title: "全部会话",
            source: null,
            project: null,
            projectProps: null,
            handlers: null,
            nativeCurrent: true,
            sessions: rows.map((row, index) => {
              const props = sessionProps(row)
              return {
                id: props?.node?.id || "flat:" + index + ":" + titleOfRow(row),
                title: titleOfRow(row) || "未命名会话",
                time: timeOfRow(row),
                selected: selectedOfRow(row),
                pendingInteraction: props?.node?.pendingInteraction,
                running: Boolean(props?.node?.running),
                runningSubagentCount: Number(props?.node?.runningSubagentCount || 0),
                completed: Boolean(props?.node?.completed),
                status: row.querySelector(".YDXeBa_slot")?.firstElementChild?.cloneNode(true) || null,
                source: row,
                drag: rowDrag(row),
                groupKey: "flat",
              }
            }),
          })
        }
        const nativeCurrent = groups.find((group) => group.nativeCurrent)
        if (nativeCurrent && nativeCurrent.key !== lastNativeGroupKey) {
          selectedGroupKey = nativeCurrent.key
          lastNativeGroupKey = nativeCurrent.key
        }
        if (!selectedGroupKey || !groups.some((group) => group.key === selectedGroupKey)) selectedGroupKey = nativeCurrent?.key || groups[0]?.key || null
        const groupsByKey = new Map(groups.map((group) => [group.key, group]))
        const sessionsById = new Map()
        for (const group of groups) for (const session of group.sessions) sessionsById.set(session.id, session)
        const selectedGroup = groupsByKey.get(selectedGroupKey) || groups[0]
        const selectedSession = groups.flatMap((group) => group.sessions).find((session) => session.selected) || null
        return { root, groups, groupsByKey, sessionsById, selectedGroup, selectedSession }
      }

      const makeIcon = (svg, fallback) => {
        if (svg) return svg.cloneNode(true)
        const span = document.createElement("span")
        span.textContent = fallback
        return span
      }
      const makeAction = (action, label, selector, fallback) => {
        const button = document.createElement("button")
        button.type = "button"
        button.className = "dsh-mobile-action"
        button.dataset.action = action
        button.setAttribute("aria-label", label)
        button.title = label
        button.appendChild(makeIcon(sourceSvg(selector), fallback))
        return button
      }
      const syncConversationHeaderToggle = () => {
        const header = document.querySelector(".wSkVaW_header:not(.wSkVaW_headerHidden)")
        const height = header?.getBoundingClientRect().height || 0
        if (height > 8) document.body.style.setProperty("--dsh-conversation-header-height", `${Math.round(height * 100) / 100}px`)
        document.body.classList.toggle("dsh-conversation-header-collapsed", !conversationHeaderExpanded)
        const button = shell?.querySelector('[data-action="toggle-conversation-header"]')
        if (!button) return
        const label = conversationHeaderExpanded ? "收起会话头部" : "展开会话头部"
        button.setAttribute("aria-expanded", conversationHeaderExpanded ? "true" : "false")
        button.setAttribute("aria-label", label)
        button.title = label
      }
      const makeConversationHeaderToggle = () => {
        const button = document.createElement("button")
        button.type = "button"
        button.className = "dsh-mobile-action dsh-mobile-chrome-toggle"
        button.dataset.action = "toggle-conversation-header"
        button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m18 15-6-6-6 6"/></svg>'
        return button
      }
      const fitSessionTitle = (text) => {
        const chars = Array.from(text)
        const units = (char) => char.codePointAt(0) <= 0x7f ? 1 : 2
        if (chars.reduce((total, char) => total + units(char), 0) <= 24) return text
        let width = 0
        let fitted = ""
        for (const char of chars) {
          const next = units(char)
          if (width + next > 21) break
          fitted += char
          width += next
        }
        return fitted + "..."
      }
      const sessionStatus = (entry) => {
        if (entry.pendingInteraction) {
          const labels = { approval: "需要批准", "plan-review": "需要审阅计划", question: "等待回答" }
          return { state: "warning", label: labels[entry.pendingInteraction] || "等待操作" }
        }
        if (entry.running || entry.runningSubagentCount > 0) return { state: "ongoing", label: "进行中" }
        if (entry.completed) return { state: "done", label: "已完成未读" }
        return null
      }
      const makeItem = (entry, kind) => {
        const item = document.createElement("div")
        item.setAttribute("role", "button")
        item.tabIndex = 0
        item.className = "dsh-mobile-item dsh-mobile-" + kind + "-item"
        item.dataset.action = kind
        if (kind === "workspace") item.dataset.key = entry.key
        else item.dataset.id = entry.id
        item.dataset.selected = kind === "workspace" ? (entry.key === selectedGroupKey ? "1" : "0") : (entry.selected ? "1" : "0")
        const icon = entry.project ? entry.project.querySelector("svg")?.cloneNode(true) : null
        if (kind === "workspace") {
          if (icon) item.appendChild(icon)
          const title = document.createElement("span")
          title.className = "dsh-mobile-item-title"
          title.textContent = entry.title
          item.appendChild(title)
        } else {
          const status = sessionStatus(entry)
          if (status) {
            const dot = document.createElement("span")
            dot.className = "dsh-mobile-session-status"
            dot.dataset.state = status.state
            dot.setAttribute("aria-label", status.label)
            if (entry.status) dot.appendChild(entry.status.cloneNode(true))
            item.appendChild(dot)
          }
          const title = document.createElement("span")
          title.className = "dsh-mobile-item-title"
          title.textContent = fitSessionTitle(entry.title)
          if (title.textContent !== entry.title) title.title = entry.title
          item.appendChild(title)
          if (entry.time) {
            const time = document.createElement("span")
            time.className = "dsh-mobile-item-meta"
            time.textContent = entry.time
            item.appendChild(time)
          }
        }
        const more = document.createElement("button")
        more.type = "button"
        more.className = "dsh-mobile-item-more"
        more.dataset.action = "item-menu"
        more.dataset.kind = kind
        if (kind === "workspace") more.dataset.key = entry.key
        else more.dataset.id = entry.id
        more.setAttribute("aria-label", entry.title + "的操作")
        const source = kind === "workspace" ? entry.project : entry.source
        const moreIcon = source?.querySelector(SEL_ITEM_MENU + " svg")?.cloneNode(true)
        if (moreIcon) more.appendChild(moreIcon)
        else more.textContent = "…"
        item.appendChild(more)
        return item
      }
      const makeScrollRow = (className) => {
        const wrap = document.createElement("div")
        wrap.className = "dsh-mobile-scroll-wrap " + className
        const scroll = document.createElement("div")
        scroll.className = "dsh-mobile-scroll"
        wrap.appendChild(scroll)
        return { wrap, scroll }
      }
      const updateOverflow = (wrap, scroll) => {
        if (Date.now() - lastRenderAt > 150) closeSortCapsule()
        const max = Math.max(0, scroll.scrollWidth - scroll.clientWidth)
        wrap.dataset.overflowLeft = scroll.scrollLeft > 2 ? "1" : "0"
        wrap.dataset.overflowRight = max - scroll.scrollLeft > 2 ? "1" : "0"
        wrap.dataset.overflowEnabled = mobileSettings().overflowHint ? "1" : "0"
      }
      const currentView = () => {
        try {
          const state = JSON.parse(localStorage.getItem("dsh.workspace.view.v5") || "{}")
          return { groupBy: state.groupBy || "workspace", orderBy: state.orderBy || "updated" }
        } catch {
          return { groupBy: "workspace", orderBy: "updated" }
        }
      }
      const closeViewMenu = () => {
        viewMenu?.remove()
        viewMenu = null
      }
      const fallbackViewChange = (groupBy, orderBy) => {
        try {
          const state = JSON.parse(localStorage.getItem("dsh.workspace.view.v5") || "{}")
          if (groupBy) state.groupBy = groupBy
          if (orderBy) state.orderBy = orderBy
          const next = JSON.stringify(state)
          localStorage.setItem("dsh.workspace.view.v5", next)
          window.dispatchEvent(new StorageEvent("storage", { key: "dsh.workspace.view.v5", newValue: next }))
        } catch {}
      }
      const chooseNativeView = (label, groupBy, orderBy) => {
        closeViewMenu()
        const trigger = sourceButton(SEL_VIEW_OPTIONS)
        if (!trigger) {
          fallbackViewChange(groupBy, orderBy)
          schedule()
          return
        }
        trigger.click()
        window.setTimeout(() => {
          const item = [...document.querySelectorAll('[role="menuitem"]')].find((node) => node.textContent.trim() === label)
          if (item) item.click()
          fallbackViewChange(groupBy, orderBy)
          schedule()
        }, 0)
      }
      const applyViewAction = (viewAction) => {
        if (viewAction === "group-workspace") chooseNativeView(HOST_TEXT.viewWorkspace, "workspace", null)
        if (viewAction === "group-flat") chooseNativeView(HOST_TEXT.viewFlat, "flat", null)
        if (viewAction === "order-manual") chooseNativeView(HOST_TEXT.orderManual, null, "manual")
        if (viewAction === "order-updated") chooseNativeView(HOST_TEXT.orderUpdated, null, "updated")
      }
      const openViewMenu = () => {
        closeViewMenu()
        const state = currentView()
        viewMenu = document.createElement("div")
        viewMenu.className = "dsh-mobile-view-menu"
        viewMenu.setAttribute("role", "menu")
        const addLabel = (text) => {
          const label = document.createElement("div")
          label.className = "dsh-mobile-view-label"
          label.textContent = text
          viewMenu.appendChild(label)
        }
        const addOption = (text, action, selected) => {
          const option = document.createElement("button")
          option.type = "button"
          option.className = "dsh-mobile-view-option"
          option.dataset.action = "view-option"
          option.dataset.viewAction = action
          option.dataset.selected = selected ? "1" : "0"
          option.textContent = text
          viewMenu.appendChild(option)
        }
        addLabel("分组方式")
        addOption(HOST_TEXT.viewWorkspace, "group-workspace", state.groupBy === "workspace")
        addOption(HOST_TEXT.viewFlat, "group-flat", state.groupBy !== "workspace")
        addLabel("排序方式")
        addOption(HOST_TEXT.orderManual, "order-manual", state.orderBy === "manual")
        addOption(HOST_TEXT.orderUpdated, "order-updated", state.orderBy !== "manual")
        viewMenu.addEventListener("click", (event) => {
          const option = event.target.closest?.("[data-view-action]")
          if (option) applyViewAction(option.dataset.viewAction)
        })
        document.body.appendChild(viewMenu)
      }
      const nativeClick = (selector) => sourceButton(selector)?.click()
      const setNativeSearch = (value) => {
        searchQuery = value
        const input = sourceRoot()?.querySelector(".qDHVXG_searchInput")
        if (!input) return
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set
        setter?.call(input, value)
        input.dispatchEvent(new Event("input", { bubbles: true }))
        input.dispatchEvent(new Event("change", { bubbles: true }))
        schedule()
      }
      const closeSearch = (clear = true) => {
        searchPopover?.remove()
        searchPopover = null
        if (clear) setNativeSearch("")
        else searchQuery = ""
      }
      const openSearch = () => {
        if (searchPopover) return closeSearch()
        nativeClick(".qDHVXG_searchButton")
        searchPopover = document.createElement("div")
        searchPopover.className = "dsh-mobile-search-popover"
        const input = document.createElement("input")
        input.className = "dsh-mobile-search-input"
        input.type = "search"
        input.placeholder = "搜索会话…"
        input.value = sourceRoot()?.querySelector(".qDHVXG_searchInput")?.value || ""
        input.addEventListener("input", () => setNativeSearch(input.value))
        const close = document.createElement("button")
        close.type = "button"
        close.className = "dsh-mobile-search-close"
        close.setAttribute("aria-label", "关闭搜索")
        close.textContent = "×"
        close.addEventListener("click", closeSearch)
        searchPopover.append(input, close)
        document.body.appendChild(searchPopover)
        input.focus()
      }
      const openNativeItemMenu = (item, entry, kind) => {
        const source = kind === "workspace" ? entry.project : entry.source
        const action = source?.querySelector(SEL_ITEM_MENU)
        if (!action) return
        action.click()
        window.setTimeout(() => {
          const menu = [...document.querySelectorAll('[role="menu"]')].find((node) => !node.classList.contains("dsh-mobile-view-menu"))
          if (!menu) return
          const rect = item.getBoundingClientRect()
          menu.style.position = "fixed"
          menu.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - menu.getBoundingClientRect().width - 8)) + "px"
          menu.style.top = Math.min(rect.bottom + 4, window.innerHeight - menu.getBoundingClientRect().height - 8) + "px"
          menu.style.zIndex = "76"
        }, 0)
      }
      const chevronSvg = (left) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${left ? '<path d="m15 18-6-6 6-6"/>' : '<path d="m9 18 6-6-6-6"/>'}</svg>`
      let sortCapsule = null
      let sortTarget = null
      let pressTimer = null

      const closeSortCapsule = () => {
        sortCapsule?.remove()
        sortCapsule = null
        sortTarget = null
      }

      const sessionListFor = (data) => (currentView().groupBy !== "workspace" ? (data.groups || []).flatMap((group) => group.sessions) : data.selectedGroup?.sessions || [])

      const workspaceDraggable = (group) => Boolean(group.project && fiberPropsFor(group.project, (props) => props.drag && typeof props.drag.start === "function"))

      const nextFrame = () => new Promise((resolve) => window.requestAnimationFrame(() => window.requestAnimationFrame(resolve)))

      let moving = false

      const moveEntry = async (kind, entry, dir) => {
        if (moving) return
        const data = lastData
        if (!data) return
        moving = true
        try {
          if (kind === "workspace") {
            const groups = data.groups || []
            const index = groups.indexOf(entry)
            const neighbor = groups[index + dir]
            if (!neighbor || !workspaceDraggable(neighbor)) return
            const section = neighbor.source
            if (!section) return
            const startDrag = entry.project ? fiberPropsFor(entry.project, (props) => props.drag && typeof props.drag.start === "function")?.drag : null
            startDrag?.start?.()
            await nextFrame()
            if (!section.isConnected) return
            const fresh = fiberPropsFor(section, (props) => typeof props.onDrop === "function")
            if (!fresh) return
            fresh.onDrop({
              clientY: dir < 0 ? -1 : Number.MAX_SAFE_INTEGER,
              preventDefault() {},
              dataTransfer: { dropEffect: "move" },
              currentTarget: section,
            })
          } else {
            const list = sessionListFor(data)
            const index = list.indexOf(entry)
            const neighbor = list[index + dir]
            if (!neighbor || neighbor.groupKey !== entry.groupKey) return
            const half = dir < 0 ? "before" : "after"
            entry.drag?.start?.()
            await nextFrame()
            const node = neighbor.source
            if (!node || !node.isConnected) return
            const fresh = fiberPropsFor(node, (props) => props.node?.id && typeof props.onOpen === "function")?.drag
            fresh?.drop?.(half)
          }
        } finally {
          moving = false
        }
        schedule()
      }

      const anchorSortCapsule = () => {
        if (!sortCapsule || !sortTarget) return
        const data = lastData
        if (!data) return closeSortCapsule()
        const selector = sortTarget.kind === "workspace" ? `.dsh-mobile-workspace-item[data-key="${sortTarget.key}"]` : `.dsh-mobile-session-item[data-id="${sortTarget.id}"]`
        const item = document.querySelector(selector)
        if (!item) return closeSortCapsule()
        const rect = item.getBoundingClientRect()
        sortCapsule.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - sortCapsule.offsetWidth - 8)) + "px"
        sortCapsule.style.top = Math.min(rect.bottom + 6, window.innerHeight - sortCapsule.offsetHeight - 8) + "px"
        let prevOk = false
        let nextOk = false
        if (sortTarget.kind === "workspace") {
          const groups = data.groups || []
          const index = groups.findIndex((group) => group.key === sortTarget.key)
          prevOk = index > 0 && workspaceDraggable(groups[index - 1])
          nextOk = index >= 0 && index < groups.length - 1 && workspaceDraggable(groups[index + 1])
        } else {
          const list = sessionListFor(data)
          const index = list.findIndex((session) => session.id === sortTarget.id)
          const entry = list[index]
          prevOk = index > 0 && list[index - 1].groupKey === entry?.groupKey && Boolean(list[index - 1].drag)
          nextOk = index >= 0 && index < list.length - 1 && list[index + 1].groupKey === entry?.groupKey && Boolean(list[index + 1].drag)
        }
        const buttons = sortCapsule.querySelectorAll("button")
        buttons[0].disabled = !prevOk
        buttons[1].disabled = !nextOk
      }

      const openSortCapsule = (item, entry, kind) => {
        closeSortCapsule()
        sortTarget = kind === "workspace" ? { kind, key: entry.key } : { kind, id: entry.id }
        sortCapsule = document.createElement("div")
        sortCapsule.className = "dsh-mobile-sort-capsule"
        sortCapsule.setAttribute("role", "toolbar")
        sortCapsule.setAttribute("aria-label", "调整排序")
        const makeButton = (dir, label) => {
          const button = document.createElement("button")
          button.type = "button"
          button.innerHTML = chevronSvg(dir < 0)
          button.setAttribute("aria-label", label)
          button.addEventListener("click", (event) => {
            event.preventDefault()
            event.stopPropagation()
            const data = lastData
            if (!data || !sortTarget) return
            const current = sortTarget.kind === "workspace" ? data.groupsByKey.get(sortTarget.key) : data.sessionsById.get(sortTarget.id)
            if (current) moveEntry(sortTarget.kind, current, dir)
          })
          return button
        }
        sortCapsule.append(makeButton(-1, "前移一位"), makeButton(1, "后移一位"))
        document.body.appendChild(sortCapsule)
        suppressClickUntil = Date.now() + 700
        suppressClickItems.add(item)
        window.setTimeout(() => suppressClickItems.delete(item), 900)
        anchorSortCapsule()
      }

      const bindLongPress = (item, entry, kind) => {
        let startX = 0
        let startY = 0
        let active = false
        item.addEventListener("pointerdown", (event) => {
          if (!mobileActive() || !mobileSettings().longPressDrag) return
          if (event.pointerType !== "touch" && event.button !== 0) return
          startX = event.clientX
          startY = event.clientY
          active = true
          window.clearTimeout(pressTimer)
          pressTimer = window.setTimeout(() => {
            if (!active || !mobileActive()) return
            active = false
            openSortCapsule(item, entry, kind)
          }, 420)
        })
        item.addEventListener("pointermove", (event) => {
          if (!active) return
          if (Math.hypot(event.clientX - startX, event.clientY - startY) > 10) {
            active = false
            window.clearTimeout(pressTimer)
          }
        })
        const stop = () => {
          active = false
          window.clearTimeout(pressTimer)
        }
        item.addEventListener("pointerup", stop)
        item.addEventListener("pointercancel", stop)
      }
      const syncActionIcons = () => {
        if (!shell) return
        const sources = [
          ["new-session", ".hHd-Xa_newSession"],
          ["new-workspace", SEL_ADD_WORKSPACE],
          ["search", ".qDHVXG_searchButton"],
          ["view", SEL_VIEW_OPTIONS],
          ["settings", ".VOzbGW_trigger"],
        ]
        for (const [action, selector] of sources) {
          const target = shell.querySelector(`.dsh-mobile-action[data-action="${action}"]`)
          const svg = sourceSvg(selector)
          if (target && svg) target.replaceChildren(svg)
        }
      }
      const render = () => {
        if (!shell) return
        lastRenderAt = Date.now()
        const currentId = ctx?.sessions?.list?.getSnapshot?.()?.current ?? null
        if (lastSessionId !== null && currentId !== lastSessionId) suppressFocusUntil = Math.max(suppressFocusUntil, Date.now() + 900)
        lastSessionId = currentId
        const logo = shell.querySelector('.dsh-mobile-logo')
        if (logo && !logo.querySelector('svg')) {
          const logoSvg = sourceRoot()?.querySelector('.hHd-Xa_brand svg')?.cloneNode(true)
          if (logoSvg) {
            logoSvg.setAttribute("viewBox", "0 0 24 24")
            logoSvg.setAttribute("width", "24")
            logoSvg.setAttribute("height", "24")
            logo.replaceChildren(logoSvg)
          }
        }
        syncActionIcons()
        const data = readNative()
        lastData = data
        const flat = currentView().groupBy !== "workspace"
        shell.dataset.flat = flat ? "1" : "0"
        document.body.classList.toggle("dsh-mobile-flat", flat)
        workspaceWrap.hidden = flat
        workspaceScroll.replaceChildren()
        if (!flat) for (const entry of data.groups) {
          const item = makeItem(entry, "workspace")
          workspaceScroll.appendChild(item)
          bindLongPress(item, entry, "workspace")
        }
        sessionScroll.replaceChildren()
        const query = searchQuery.trim().toLowerCase()
        const sessionEntries = (flat ? data.groups.flatMap((entry) => entry.sessions) : data.selectedGroup?.sessions || []).filter((entry) => !query || (entry.title + " " + entry.time).toLowerCase().includes(query))
        if (sessionEntries.length) {
          for (const entry of sessionEntries) {
            const item = makeItem(entry, "session")
            sessionScroll.appendChild(item)
            bindLongPress(item, entry, "session")
          }
        } else {
          const empty = document.createElement("span")
          empty.className = "dsh-mobile-empty"
          empty.textContent = "当前工作区暂无会话"
          sessionScroll.appendChild(empty)
        }
        onWorkspaceScroll?.()
        onSessionScroll?.()
        anchorSortCapsule()
        window.dispatchEvent(new Event("dsh-mobile-shell-rendered"))
      }
      const buildShell = () => {
        shell = document.createElement("div")
        shell.className = "dsh-mobile-shell"
        shell.setAttribute("role", "region")
        shell.setAttribute("aria-label", "移动端会话栏")
        const controls = document.createElement("div")
        controls.className = "dsh-mobile-controls"
        const logo = document.createElement("span")
        logo.className = "dsh-mobile-logo"
        const logoSvg = sourceRoot()?.querySelector(".hHd-Xa_brand svg")?.cloneNode(true)
        if (logoSvg) {
          logoSvg.setAttribute("viewBox", "0 0 24 24")
          logoSvg.setAttribute("width", "24")
          logoSvg.setAttribute("height", "24")
          logo.appendChild(logoSvg)
        } else {
          logo.textContent = "◉"
        }
        const headerToggle = makeConversationHeaderToggle()
        controls.append(logo, headerToggle)
        const actions = document.createElement("div")
        actions.className = "dsh-mobile-actions"
        actions.append(
          makeAction("new-session", "新建对话", ".hHd-Xa_newSession", "+"),
          makeAction("new-workspace", "新建文件夹", SEL_ADD_WORKSPACE, "+"),
          makeAction("search", "搜索会话", ".qDHVXG_searchButton", "⌕"),
          makeAction("view", "视图选项", SEL_VIEW_OPTIONS, "☷"),
          makeAction("settings", "设置", ".VOzbGW_trigger", "⚙"),
        )
        controls.appendChild(actions)
        shell.appendChild(controls)
        syncConversationHeaderToggle()
        const workspaceRow = makeScrollRow("dsh-mobile-workspaces")
        const sessionRow = makeScrollRow("dsh-mobile-sessions")
        workspaceWrap = workspaceRow.wrap
        workspaceScroll = workspaceRow.scroll
        sessionWrap = sessionRow.wrap
        sessionScroll = sessionRow.scroll
        onWorkspaceScroll = () => updateOverflow(workspaceWrap, workspaceScroll)
        onSessionScroll = () => updateOverflow(sessionWrap, sessionScroll)
        workspaceScroll.addEventListener("scroll", onWorkspaceScroll, { passive: true })
        sessionScroll.addEventListener("scroll", onSessionScroll, { passive: true })
        shell.append(workspaceWrap, sessionWrap)
        shell.addEventListener("click", onShellClick)
        shell.addEventListener("pointerdown", (event) => {
          const item = event.target.closest?.(".dsh-mobile-item")
          if (!item) return
          if (suppressClickUntil > Date.now() && suppressClickItems.has(item)) {
            event.preventDefault()
            event.stopPropagation()
            suppressClickUntil = 0
            suppressClickItems.clear()
          }
        }, true)
        document.body.appendChild(shell)
        observeSessionHeight(sessionScroll)
      }
      let workspaceWrap = null
      let workspaceScroll = null
      let sessionWrap = null
      let sessionScroll = null
      let onWorkspaceScroll = null
      let onSessionScroll = null
      const onShellClick = (event) => {
        const action = event.target.closest?.("[data-action]")
        if (!action) return
        if (suppressClickUntil > Date.now() && suppressClickItems.has(action)) {
          event.preventDefault()
          event.stopPropagation()
          suppressClickUntil = 0
          suppressClickItems.clear()
          return
        }
        const name = action.dataset.action
        if (name === "toggle-conversation-header") {
          conversationHeaderExpanded = !conversationHeaderExpanded
          syncConversationHeaderToggle()
          return
        }
        if (name === "item-menu") {
          event.preventDefault()
          event.stopPropagation()
          const kind = action.dataset.kind
          const entry = kind === "workspace" ? lastData?.groupsByKey.get(action.dataset.key) : lastData?.sessionsById.get(action.dataset.id)
          if (entry) openNativeItemMenu(action.closest(".dsh-mobile-item"), entry, kind)
          return
        }
        if (name === "workspace") {
          selectedGroupKey = action.dataset.key
          const group = lastData?.groupsByKey.get(selectedGroupKey)
          if (group?.projectProps?.group?.expanded === false) group.projectProps.onToggle?.()
          render()
          return
        }
        if (name === "session") {
          const entry = lastData?.sessionsById.get(action.dataset.id)
          entry?.source?.click()
          return
        }
        if (name === "new-session") nativeClick(".hHd-Xa_newSession")
        if (name === "new-workspace") nativeClick(SEL_ADD_WORKSPACE)
        if (name === "search") openSearch()
        if (name === "settings") nativeClick(".VOzbGW_trigger")
        if (name === "view") {
          if (viewMenu) closeViewMenu()
          else openViewMenu()
        }
        if (name === "view-option") applyViewAction(action.dataset.viewAction)
      }
      const ensureSourceExpanded = (root) => {
        if (!root || !root.classList.contains("hHd-Xa_collapsed")) {
          sourceExpandAt = 0
          window.clearTimeout(sourceExpandTimer)
          sourceExpandTimer = null
          return
        }
        if (Date.now() - sourceExpandAt > 900) {
          sourceExpandAt = Date.now()
          const toggle = fiberPropsFor(root, (props) => typeof props.toggleSidebar === "function")?.toggleSidebar
          if (toggle) toggle()
          else root.querySelector(".hHd-Xa_toggle")?.click()
        }
        window.clearTimeout(sourceExpandTimer)
        sourceExpandTimer = window.setTimeout(schedule, 900)
      }
      const sync = () => {
        const settings = mobileSettings()
        lastMobileSettings = JSON.stringify(settings)
        const active = settings.enabled && window.innerWidth <= 1023
        applyPinchLock(active && settings.noPinchZoom)
        const root = sourceRoot()
        const frame = root?.closest(".pI_x6G_sidebarCol")?.closest(".pI_x6G_frame") || document.querySelector(".pI_x6G_frame")
        if (active) {
          if (sourceInitiallyCollapsed === null && root) sourceInitiallyCollapsed = root.classList.contains("hHd-Xa_collapsed")
          ensureSourceExpanded(root)
          if (!shell) buildShell()
          if (activeFrame && activeFrame !== frame) activeFrame.classList.remove("dsh-mobile-frame", "dsh-mobile-sidebar-compat")
          activeFrame = frame
          frame?.classList.add("dsh-mobile-frame")
          frame?.classList.toggle("dsh-mobile-sidebar-compat", settings.sidebarCompat)
          document.body.classList.add("dsh-mobile-active")
          document.body.classList.toggle("dsh-mobile-sidebar-compat", settings.sidebarCompat)
          render()
          syncImageUpload()
        } else {
          if (sourceInitiallyCollapsed && root && !root.classList.contains("hHd-Xa_collapsed")) {
            const toggle = fiberPropsFor(root, (props) => typeof props.toggleSidebar === "function")?.toggleSidebar
            if (toggle) toggle()
            else root.querySelector(".hHd-Xa_toggle")?.click()
          }
          sourceInitiallyCollapsed = null
          window.clearTimeout(sourceExpandTimer)
          sourceExpandTimer = null
          activeFrame?.classList.remove("dsh-mobile-frame", "dsh-mobile-sidebar-compat")
          activeFrame = null
          document.body.classList.remove("dsh-mobile-active", "dsh-mobile-sidebar-compat", "dsh-mobile-flat", "dsh-conversation-header-collapsed")
          closeViewMenu()
          closeSearch(false)
          closeSortCapsule()
          removeImageUpload()
          if (workspaceScroll && onWorkspaceScroll) workspaceScroll.removeEventListener("scroll", onWorkspaceScroll)
          if (sessionScroll && onSessionScroll) sessionScroll.removeEventListener("scroll", onSessionScroll)
          onWorkspaceScroll = null
          onSessionScroll = null
          stopSessionHeightObserver()
          shell?.remove()
          shell = null
        }
      }
      const schedule = () => {
        if (raf !== null) return
        raf = window.requestAnimationFrame(() => {
          raf = null
          sync()
        })
      }
      const observeSource = () => {
        sourceObserver?.disconnect()
        const column = sourceRoot()?.closest(".pI_x6G_sidebarCol")
        if (column) sourceObserver?.observe(column, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "aria-selected", "aria-expanded", "aria-label"] })
      }
      observer = new MutationObserver((records) => {
        const changedNodes = records.flatMap((record) => [...record.addedNodes, ...record.removedNodes]).filter((node) => node.nodeType === 1)
        const sourceReplaced = changedNodes.some((node) => node.matches?.(".pI_x6G_sidebarCol,.hHd-Xa_root") || node.querySelector?.(".pI_x6G_sidebarCol,.hHd-Xa_root"))
        const composerReplaced = changedNodes.some((node) => node.matches?.(".uV2eYG_root") || node.querySelector?.(".uV2eYG_root"))
        if (sourceReplaced) {
          observeSource()
          schedule()
        }
        if (composerReplaced) syncImageUpload()
      })
      sourceObserver = new MutationObserver(() => schedule())
      observer.observe(document.body, { childList: true, subtree: true })
      observeSource()
      const onDocumentClick = (event) => {
        if (viewMenu && !viewMenu.contains(event.target) && !event.target.closest?.('[data-action="view"]')) closeViewMenu()
        if (searchPopover && !searchPopover.contains(event.target) && !event.target.closest?.('[data-action="search"]')) closeSearch()
        if (sortCapsule && !sortCapsule.contains(event.target) && !event.target.closest?.(".dsh-mobile-item")) closeSortCapsule()
      }
      const onChange = () => {
        const next = JSON.stringify(mobileSettings())
        if (next === lastMobileSettings) return
        lastMobileSettings = next
        syncCss()
        schedule()
      }
      const onContextMenu = (event) => {
        if (event.target.closest?.(".dsh-mobile-item")) event.preventDefault()
      }
      const onPointerDownArm = (event) => {
        if (!mobileActive()) return
        if (event.target.closest?.('.dsh-mobile-item[data-action="session"], .YDXeBa_sessionRow')) suppressFocusUntil = Date.now() + 1500
      }
      const onFocusIn = (event) => {
        if (!mobileActive() || !mobileSettings().noAutoFocus) return
        if (Date.now() > suppressFocusUntil) return
        const target = event.target
        if ((target instanceof HTMLTextAreaElement || target instanceof HTMLInputElement) && target.closest(".uV2eYG_root")) target.blur()
      }
      document.addEventListener("click", onDocumentClick, true)
      document.addEventListener("contextmenu", onContextMenu)
      document.addEventListener("pointerdown", onPointerDownArm, true)
      document.addEventListener("focusin", onFocusIn, true)
      window.addEventListener(CHANGE, onChange)
      window.addEventListener("resize", schedule)
      sync()
      return () => {
        window.clearTimeout(pressTimer)
        closeSortCapsule()
        observer.disconnect()
        sourceObserver?.disconnect()
        document.removeEventListener("click", onDocumentClick, true)
        document.removeEventListener("contextmenu", onContextMenu)
        document.removeEventListener("pointerdown", onPointerDownArm, true)
        document.removeEventListener("focusin", onFocusIn, true)
        window.removeEventListener(CHANGE, onChange)
        window.removeEventListener("resize", schedule)
        window.clearTimeout(sourceExpandTimer)
        if (raf !== null) window.cancelAnimationFrame(raf)
        if (sourceInitiallyCollapsed) {
          const root = sourceRoot()
          if (root && !root.classList.contains("hHd-Xa_collapsed")) {
            const toggle = fiberPropsFor(root, (props) => typeof props.toggleSidebar === "function")?.toggleSidebar
            if (toggle) toggle()
            else root.querySelector(".hHd-Xa_toggle")?.click()
          }
        }
        activeFrame?.classList.remove("dsh-mobile-frame", "dsh-mobile-sidebar-compat")
        document.body.classList.remove("dsh-mobile-active", "dsh-mobile-sidebar-compat", "dsh-mobile-flat", "dsh-conversation-header-collapsed")
        closeViewMenu()
        closeSearch(false)
        removeImageUpload()
        stopSessionHeightObserver()
        if (workspaceScroll && onWorkspaceScroll) workspaceScroll.removeEventListener("scroll", onWorkspaceScroll)
        if (sessionScroll && onSessionScroll) sessionScroll.removeEventListener("scroll", onSessionScroll)
        onWorkspaceScroll = null
        onSessionScroll = null
        shell?.remove()
        shell = null
        applyPinchLock(false)
        style.remove()
      }
    }


    function startFontScale() {
      const original = new Map()
      const pendingNodes = new Set()
      let mutationRaf = null
      let applying = false
      let appliedRatio = 100
      const clamp = (value) => Math.min(200, Math.max(10, Math.round(Number(value) || 100)))
      const currentScale = () => {
        const settings = loadSettings().fontScale
        if (!settings.enabled) return 100
        if (window.innerWidth <= 1023) return clamp(settings.mobile)
        return clamp(settings.desktop)
      }
      const restore = () => {
        for (const [element, state] of original) {
          if (!element.isConnected) continue
          for (const [property, value] of Object.entries(state.inline)) {
            if (value.value) element.style.setProperty(property, value.value, value.priority)
            else element.style.removeProperty(property)
          }
        }
        original.clear()
        appliedRatio = 100
      }
      const collect = (roots) => {
        const elements = new Set()
        for (const root of roots) {
          if (!root || root.nodeType !== 1) continue
          if (!root.matches("script,style,svg,br")) elements.add(root)
          for (const element of root.querySelectorAll("*:not(script):not(style):not(svg):not(br)")) elements.add(element)
        }
        return [...elements].map((element) => {
          const computed = getComputedStyle(element)
          return {
            element,
            fontSize: parseFloat(computed.fontSize),
            lineHeight: computed.lineHeight === "normal" ? 0 : parseFloat(computed.lineHeight),
            padding: [computed.paddingTop, computed.paddingRight, computed.paddingBottom, computed.paddingLeft].map(parseFloat),
          }
        })
      }
      const applyElements = (elements, ratio, added = false) => {
        const paddingNames = ["padding-top", "padding-right", "padding-bottom", "padding-left"]
        for (const { element, fontSize, lineHeight, padding } of elements) {
          let state = original.get(element)
          if (!state) {
            if (!Number.isFinite(fontSize) || fontSize <= 0) continue
            const parent = element.parentElement
            const parentFontSize = parent ? parseFloat(getComputedStyle(parent).fontSize) : 0
            const inheritedFont = added && !element.style.getPropertyValue("font-size") && Math.abs(parentFontSize - fontSize) < 0.01
            state = {
              inline: {
                "font-size": { value: element.style.getPropertyValue("font-size"), priority: element.style.getPropertyPriority("font-size") },
              },
              base: {
                fontSize: added ? (inheritedFont ? fontSize * 100 / appliedRatio : fontSize) : fontSize * 100 / appliedRatio,
                lineHeight: Number.isFinite(lineHeight) && lineHeight > 0 ? (added && !inheritedFont ? lineHeight : lineHeight * 100 / appliedRatio) : 0,
                padding: padding.map((value) => Number.isFinite(value) ? (added ? value : value * 100 / appliedRatio) : 0),
              },
            }
            original.set(element, state)
          }
          element.style.setProperty("font-size", `${Math.max(1, Math.round(state.base.fontSize * ratio) / 100)}px`)
          if (state.base.lineHeight > 0) {
            if (!state.inline["line-height"]) state.inline["line-height"] = { value: element.style.getPropertyValue("line-height"), priority: element.style.getPropertyPriority("line-height") }
            element.style.setProperty("line-height", `${Math.max(1, Math.round(state.base.lineHeight * ratio) / 100)}px`)
          }
          if (state.base.padding.some((value) => value > 0)) {
            for (let index = 0; index < paddingNames.length; index += 1) {
              const property = paddingNames[index]
              if (!state.inline[property]) state.inline[property] = { value: element.style.getPropertyValue(property), priority: element.style.getPropertyPriority(property) }
              element.style.setProperty(property, `${Math.max(0, Math.round(state.base.padding[index] * ratio) / 100)}px`)
            }
          }
        }
      }
      const apply = () => {
        if (applying || !document.body) return
        applying = true
        const ratio = currentScale()
        if (ratio === appliedRatio) {
          applying = false
          return
        }
        if (ratio === 100) {
          restore()
          applying = false
          return
        }
        const elements = collect([document.body])
        const live = new Set(elements.map(({ element }) => element))
        for (const element of original.keys()) if (!live.has(element)) original.delete(element)
        applyElements(elements, ratio)
        appliedRatio = ratio
        applying = false
      }
      const flushAdded = () => {
        mutationRaf = null
        if (applying || appliedRatio === 100 || pendingNodes.size === 0) {
          pendingNodes.clear()
          return
        }
        const nodes = [...pendingNodes]
        pendingNodes.clear()
        applying = true
        applyElements(collect(nodes), appliedRatio, true)
        applying = false
      }
      const refreshShell = () => {
        if (applying || appliedRatio === 100) return
        const shell = document.querySelector('.dsh-mobile-shell')
        if (!shell) return
        applying = true
        applyElements(collect([shell]), appliedRatio, true)
        applying = false
      }
      const observer = new MutationObserver((records) => {
        if (applying || appliedRatio === 100) return
        for (const record of records) for (const node of record.addedNodes) {
          if (node.nodeType === 1 && !node.closest?.('.dsh-mobile-shell')) pendingNodes.add(node)
        }
        if (pendingNodes.size && mutationRaf === null) mutationRaf = window.requestAnimationFrame(flushAdded)
      })
      if (document.body) observer.observe(document.body, { childList: true, subtree: true })
      window.addEventListener(CHANGE, apply)
      window.addEventListener("resize", apply)
      window.addEventListener("dsh-mobile-shell-rendered", refreshShell)
      apply()
      return () => {
        observer.disconnect()
        window.removeEventListener(CHANGE, apply)
        window.removeEventListener("resize", apply)
        window.removeEventListener("dsh-mobile-shell-rendered", refreshShell)
        if (mutationRaf !== null) window.cancelAnimationFrame(mutationRaf)
        pendingNodes.clear()
        restore()
      }
    }

    function startModelPicker(ctx) {
      const style = document.createElement("style")
      style.dataset.plugin = "dsh-better-ux-picker"
      const syncCss = () => {
        style.textContent = (loadSettings().modelPicker.enabled ? PICKER_HIDE : "") + PICKER_CSS
      }
      syncCss()
      document.head.appendChild(style)

      let root = null
      let query = ""
      let provider = "all"
      let preview = null
      let unsubStore = null

      const snapshot = () => ctx.sessions.list?.getSnapshot?.() || {}
      const close = () => {
        root?.remove()
        root = null
        query = ""
        provider = "all"
        preview = null
        unsubStore?.()
        unsubStore = null
      }
      const directoryOf = () => {
        const sessionId = snapshot().current
        if (!sessionId || !ctx.modelDirectories) return null
        return ctx.modelDirectories.directoryFor(sessionId)
      }
      const stateOf = (directory) => directory.store.getSnapshot()

      const isTwinId = (id) => id === "deepseek-vision" || (typeof id === "string" && id.endsWith("-vision"))
      const twinOf = (id) => {
        if (id === "deepseek-official") return "deepseek-vision"
        if (isTwinId(id) || id === "vision-http" || id === "vision-chain") return null
        return `${id}-vision`
      }
      const nestGroups = (groups) => {
        const byId = new Map(groups.map((group) => [group.id, group]))
        const out = []
        for (const group of groups) {
          if (isTwinId(group.id) || group.id === "vision-http" || group.id === "vision-chain") continue
          const twin = byId.get(twinOf(group.id))
          const twinIds = new Set((twin?.models || []).map((model) => model.id))
          out.push({
            ...group,
            models: group.models.map((model) => ({
              ...model,
              visionProvider: twin && twinIds.has(model.id) ? twin.id : null,
            })),
          })
        }
        return out
      }
      const updateProviderOverflow = () => {
        const providers = root?.querySelector(".mpo-providers")
        const wrap = providers?.closest(".mpo-providers-wrap")
        if (!providers || !wrap) return
        const max = Math.max(0, providers.scrollWidth - providers.clientWidth)
        wrap.dataset.overflowLeft = providers.scrollLeft > 2 ? "1" : "0"
        wrap.dataset.overflowRight = max - providers.scrollLeft > 2 ? "1" : "0"
      }
      const onProviderWheel = (event) => {
        const providers = event.currentTarget
        const max = Math.max(0, providers.scrollWidth - providers.clientWidth)
        if (max === 0) return
        const raw = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
        const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? providers.clientWidth : 1
        const next = Math.max(0, Math.min(max, providers.scrollLeft + raw * unit))
        if (next === providers.scrollLeft) return
        event.preventDefault()
        providers.scrollLeft = next
        updateProviderOverflow()
      }

      const render = () => {
        if (!root) return
        const settings = loadSettings().modelPicker
        const directory = directoryOf()
        const state = directory ? stateOf(directory) : { groups: [], current: null }
        const groups = nestGroups(state.groups || [])
        const current = state.current
        const q = query.trim().toLowerCase()
        const visible = groups
          .filter((group) => provider === "all" || group.id === provider)
          .map((group) => ({
            ...group,
            models: group.models.filter((model) => {
              if (!q) return true
              return `${group.name} ${model.name} ${model.id}`.toLowerCase().includes(q)
            }),
          }))
          .filter((group) => group.models.length)
        const selected = preview || (current && { provider: current.provider, model: current.model })
        let selectedModel = null
        for (const group of groups) {
          for (const model of group.models) {
            const route = selected && (selected.provider === group.id || selected.provider === model.visionProvider)
            if (route && model.id === selected.model) selectedModel = { group, model }
          }
        }
        const efforts = selectedModel?.model.reasoning?.efforts || []
        const currentEffort = current && selected && current.provider === selected.provider && current.model === selected.model
          ? current.reasoningEffort || selectedModel?.model.reasoning?.defaultEffort
          : selectedModel?.model.reasoning?.defaultEffort

        const search = root.querySelector(".mpo-search")
        if (search) search.hidden = !settings.search
        const providers = root.querySelector(".mpo-providers")
        const providersWrap = providers.closest(".mpo-providers-wrap")
        providersWrap.hidden = !settings.providers
        providers.innerHTML = [
          `<button type="button" class="mpo-chip" data-provider="all" data-on="${provider === "all" ? "1" : "0"}">全部</button>`,
          ...groups.map((group) => `<button type="button" class="mpo-chip" data-provider="${escapeHtml(group.id)}" data-on="${provider === group.id ? "1" : "0"}">${escapeHtml(group.name)}</button>`),
        ].join("")
        updateProviderOverflow()
        root.querySelector(".mpo-grid").innerHTML = visible.length
          ? visible.flatMap((group) => group.models.map((model) => {
            const on = selected && selected.provider === group.id && selected.model === model.id
            const visionOn = model.visionProvider && selected && selected.provider === model.visionProvider && selected.model === model.id
            const vision = model.visionProvider
              ? `<span class="mpo-card-vision" data-provider="${escapeHtml(model.visionProvider)}" data-model="${escapeHtml(model.id)}" data-on="${visionOn ? "1" : "0"}" role="button" aria-label="自动识图"></span>`
              : ""
            return `<button type="button" class="mpo-card" data-provider="${escapeHtml(group.id)}" data-model="${escapeHtml(model.id)}" data-on="${on ? "1" : "0"}"><span class="mpo-card-main"><span class="mpo-card-name">${escapeHtml(model.name)}</span><span class="mpo-card-meta">${escapeHtml(group.name)}</span></span>${vision}</button>`
          })).join("")
          : `<div class="mpo-empty">${state.status === "loading" ? "正在加载模型…" : "没有匹配的模型"}</div>`
        const foot = root.querySelector(".mpo-foot")
        foot.hidden = !settings.efforts
        const effortsEl = root.querySelector(".mpo-efforts")
        if (!selectedModel || efforts.length === 0) {
          effortsEl.innerHTML = `<button type="button" class="mpo-effort" disabled>当前模型没有思考档位</button>`
        } else {
          effortsEl.innerHTML = efforts.map((effort) => `<button type="button" class="mpo-effort" data-effort="${escapeHtml(effort.id)}" data-on="${currentEffort === effort.id ? "1" : "0"}">${escapeHtml(effort.name || effort.id)}</button>`).join("")
        }
      }

      const pick = async (selection) => {
        const directory = directoryOf()
        if (!directory) return
        preview = { provider: selection.provider, model: selection.model }
        render()
        await directory.select(selection).catch(() => false)
        if (loadSettings().modelPicker.closeOnPick) close()
        else render()
      }

      const open = () => {
        if (root) return
        const directory = directoryOf()
        directory?.load?.().catch(() => {})
        root = document.createElement("div")
        root.className = "mpo-root"
        root.innerHTML = `
          <div class="mpo-dim"></div>
          <div class="mpo-panel" role="dialog" aria-label="选择模型">
            <div class="mpo-head">
              <h2 class="mpo-title">选择模型</h2>
              <input class="mpo-search" type="search" placeholder="搜索模型或供应商">
              <button type="button" class="mpo-close" aria-label="关闭">×</button>
            </div>
            <div class="mpo-providers-wrap"><div class="mpo-providers"></div></div>
            <div class="mpo-grid"></div>
            <div class="mpo-foot">
              <div class="mpo-foot-label">思考程度</div>
              <div class="mpo-efforts"></div>
            </div>
          </div>`
        document.body.appendChild(root)
        const providers = root.querySelector(".mpo-providers")
        providers.addEventListener("scroll", updateProviderOverflow, { passive: true })
        providers.addEventListener("wheel", onProviderWheel, { passive: false })
        const current = directory ? stateOf(directory).current : null
        preview = current && { provider: current.provider, model: current.model }
        render()
        root.querySelector(".mpo-search")?.focus()
        unsubStore?.()
        unsubStore = directory?.store?.subscribe?.(render) ?? null
      }

      const onClick = (event) => {
        if (!loadSettings().modelPicker.enabled) return
        const trigger = event.target.closest?.("._7KE1Ra_trigger")
        if (trigger) {
          event.preventDefault()
          event.stopPropagation()
          event.stopImmediatePropagation()
          if (root) close()
          else open()
          return
        }
        if (!root) return
        if (event.target.closest(".mpo-dim") || event.target.closest(".mpo-close")) {
          close()
          return
        }
        const chip = event.target.closest(".mpo-chip")
        if (chip) {
          provider = chip.dataset.provider
          render()
          return
        }
        const vision = event.target.closest(".mpo-card-vision")
        if (vision) {
          event.preventDefault()
          event.stopPropagation()
          event.stopImmediatePropagation()
          pick({ provider: vision.dataset.provider, model: vision.dataset.model })
          return
        }
        const card = event.target.closest(".mpo-card")
        if (card) {
          const group = (directoryOf()?.store.getSnapshot().groups || []).find((item) => item.id === card.dataset.provider)
          const model = group?.models.find((item) => item.id === card.dataset.model)
          const effort = model?.reasoning?.defaultEffort
          pick({
            provider: card.dataset.provider,
            model: card.dataset.model,
            ...effort ? { reasoningEffort: effort } : {},
          })
          return
        }
        const effort = event.target.closest(".mpo-effort")
        if (effort && !effort.disabled && preview) {
          pick({
            provider: preview.provider,
            model: preview.model,
            reasoningEffort: effort.dataset.effort,
          })
        }
      }
      const onKey = (event) => {
        if (event.key === "Escape" && root) close()
      }
      const onInput = (event) => {
        if (!event.target.classList?.contains("mpo-search")) return
        query = event.target.value
        render()
      }
      const onChange = () => {
        syncCss()
        if (!loadSettings().modelPicker.enabled) close()
        else if (root) render()
      }
      document.addEventListener("click", onClick, true)
      document.addEventListener("keydown", onKey)
      document.addEventListener("input", onInput)
      window.addEventListener(CHANGE, onChange)
      window.addEventListener("resize", updateProviderOverflow)
      return () => {
        document.removeEventListener("click", onClick, true)
        document.removeEventListener("keydown", onKey)
        document.removeEventListener("input", onInput)
        window.removeEventListener(CHANGE, onChange)
        window.removeEventListener("resize", updateProviderOverflow)
        close()
        style.remove()
      }
    }

    function Toggle({ checked, onChange, label }) {
      return h("input", { type: "checkbox", className: "bux-switch", checked, "aria-label": label, onChange: (event) => onChange(event.target.checked) })
    }

    function ScaleOption({ label, value, onChange }) {
      const change = (next) => {
        const number = Number(next)
        if (Number.isFinite(number)) onChange(Math.min(200, Math.max(10, Math.round(number))))
      }
      return h("div", { className: "bux-scale-row" },
        h("span", { className: "bux-scale-label" }, label),
        h("div", { className: "bux-stepper" },
          h("button", { type: "button", "aria-label": `${label}减少 5%`, onClick: () => change(value - 5) }, "−"),
          h("input", { className: "bux-scale-input", type: "number", min: 10, max: 200, step: 1, value, "aria-label": `${label}缩放比例`, onChange: (event) => change(event.target.value), onBlur: (event) => change(event.target.value) }),
          h("span", { className: "bux-scale-unit" }, "%"),
          h("button", { type: "button", "aria-label": `${label}增加 5%`, onClick: () => change(value + 5) }, "+"),
        ),
      )
    }

    function SettingsPage() {
      const [settings, setSettings] = React.useState(loadSettings)
      const update = (next) => {
        setSettings(next)
        saveSettings(next)
      }
      return h("div", { className: "bux-page" },
        h("p", { className: "bux-lead" }, "按分类调整网页交互；关闭分类总开关后恢复对应的原版界面。"),
        h(Category, {
          title: "会话行快捷操作",
          open: settings.sessionRow.open,
          enabled: settings.sessionRow.enabled,
          onFold: (open) => update({ ...settings, sessionRow: { ...settings.sessionRow, open } }),
          onEnabled: (enabled) => update({ ...settings, sessionRow: { ...settings.sessionRow, enabled } }),
          children: [
            h(Option, { key: "rename", label: "重命名", checked: settings.sessionRow.rename, onChange: (rename) => update({ ...settings, sessionRow: { ...settings.sessionRow, rename } }) }),
            h(Option, { key: "fork", label: "分叉会话", checked: settings.sessionRow.fork, onChange: (fork) => update({ ...settings, sessionRow: { ...settings.sessionRow, fork } }) }),
            h(Option, { key: "archive", label: "归档会话", checked: settings.sessionRow.archive, onChange: (archive) => update({ ...settings, sessionRow: { ...settings.sessionRow, archive } }) }),
            h(Option, { key: "tooltip", label: "悬停显示功能名", checked: settings.sessionRow.tooltip, onChange: (tooltip) => update({ ...settings, sessionRow: { ...settings.sessionRow, tooltip } }) }),
          ],
        }),
        h(Category, {
          title: "模型选择器",
          open: settings.modelPicker.open,
          enabled: settings.modelPicker.enabled,
          onFold: (open) => update({ ...settings, modelPicker: { ...settings.modelPicker, open } }),
          onEnabled: (enabled) => update({ ...settings, modelPicker: { ...settings.modelPicker, enabled } }),
          children: [
            h(Option, { key: "search", label: "搜索框", checked: settings.modelPicker.search, onChange: (search) => update({ ...settings, modelPicker: { ...settings.modelPicker, search } }) }),
            h(Option, { key: "providers", label: "供应商筛选", checked: settings.modelPicker.providers, onChange: (providers) => update({ ...settings, modelPicker: { ...settings.modelPicker, providers } }) }),
            h(Option, { key: "efforts", label: "底部思考档位", checked: settings.modelPicker.efforts, onChange: (efforts) => update({ ...settings, modelPicker: { ...settings.modelPicker, efforts } }) }),
            h(Option, { key: "closeOnPick", label: "点选后关闭", checked: settings.modelPicker.closeOnPick, onChange: (closeOnPick) => update({ ...settings, modelPicker: { ...settings.modelPicker, closeOnPick } }) }),
          ],
        }),
        h(Category, {
          title: "移动端优化",
          open: settings.mobileLayout.open,
          enabled: settings.mobileLayout.enabled,
          onFold: (open) => update({ ...settings, mobileLayout: { ...settings.mobileLayout, open } }),
          onEnabled: (enabled) => update({ ...settings, mobileLayout: { ...settings.mobileLayout, enabled } }),
          children: [
            h(Option, { key: "longPressDrag", label: "长按调序胶囊", checked: settings.mobileLayout.longPressDrag, onChange: (longPressDrag) => update({ ...settings, mobileLayout: { ...settings.mobileLayout, longPressDrag } }) }),
            h(Option, { key: "overflowHint", label: "横向溢出渐变提示", checked: settings.mobileLayout.overflowHint, onChange: (overflowHint) => update({ ...settings, mobileLayout: { ...settings.mobileLayout, overflowHint } }) }),
            h(Option, { key: "sidebarCompat", label: "兼容右侧侧边栏按钮", checked: settings.mobileLayout.sidebarCompat, onChange: (sidebarCompat) => update({ ...settings, mobileLayout: { ...settings.mobileLayout, sidebarCompat } }) }),
            h(Option, { key: "noPinchZoom", label: "禁止双指缩放页面", checked: settings.mobileLayout.noPinchZoom, onChange: (noPinchZoom) => update({ ...settings, mobileLayout: { ...settings.mobileLayout, noPinchZoom } }) }),
            h(Option, { key: "noAutoFocus", label: "切换会话不自动聚焦输入框", checked: settings.mobileLayout.noAutoFocus, onChange: (noAutoFocus) => update({ ...settings, mobileLayout: { ...settings.mobileLayout, noAutoFocus } }) }),
          ],
        }),
        h(Category, {
          title: "全局字体缩放",
          open: settings.fontScale.open,
          enabled: settings.fontScale.enabled,
          onFold: (open) => update({ ...settings, fontScale: { ...settings.fontScale, open } }),
          onEnabled: (enabled) => update({ ...settings, fontScale: { ...settings.fontScale, enabled } }),
          children: [
            h(ScaleOption, { key: "mobile", label: "移动端（手机 / 平板）", value: settings.fontScale.mobile, onChange: (mobile) => update({ ...settings, fontScale: { ...settings.fontScale, mobile } }) }),
            h(ScaleOption, { key: "desktop", label: "桌面 / 其他", value: settings.fontScale.desktop, onChange: (desktop) => update({ ...settings, fontScale: { ...settings.fontScale, desktop } }) }),
          ],
        }),
      )
    }

    function Category({ title, open, enabled, onFold, onEnabled, children }) {
      return h("section", { className: "bux-cat", "data-enabled": enabled ? "1" : "0" },
        h("div", { className: "bux-cat-head" },
          h("h2", { className: "bux-cat-title" }, title),
          h(Toggle, { checked: enabled, onChange: onEnabled, label: `${title}总开关` }),
          h("button", { type: "button", className: "bux-fold", onClick: () => onFold(!open), "aria-expanded": open, "aria-label": open ? `收起${title}` : `展开${title}` },
            h("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" },
              h("path", { d: "m6 9 6 6 6-6" }),
            ),
          ),
        ),
        open ? h("div", { className: "bux-body" }, children) : null,
      )
    }

    function Option({ label, checked, onChange }) {
      return h("label", { className: "bux-option", "data-checked": checked ? "1" : "0" },
        h("input", { type: "checkbox", className: "bux-check", checked, onChange: (event) => onChange(event.target.checked) }),
        h("span", { className: "bux-option-label" }, label),
      )
    }

    function startSettingsIcon() {
      let scheduled = false
      const mark = () => {
        scheduled = false
        for (const button of document.querySelectorAll(".VOzbGW_navCell")) {
          const label = button.querySelector(".VOzbGW_navLabel")?.textContent.trim()
          if (label === "交互体验") button.dataset.dshBuxNav = "1"
          else delete button.dataset.dshBuxNav
        }
      }
      const schedule = () => {
        if (scheduled) return
        scheduled = true
        queueMicrotask(mark)
      }
      const observer = new MutationObserver(schedule)
      observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] })
      mark()
      return () => {
        observer.disconnect()
        for (const button of document.querySelectorAll("[data-dsh-bux-nav]")) delete button.dataset.dshBuxNav
      }
    }

    function apply(ctx) {
      const style = document.createElement("style")
      style.dataset.plugin = "dsh-better-ux"
      style.textContent = SETTINGS_CSS
      document.head.appendChild(style)
      const stopSession = startSessionRow()
      const stopPicker = startModelPicker(ctx)
      const stopMobile = startMobileLayout(ctx)
      const stopFontScale = startFontScale()
      const stopSettingsIcon = startSettingsIcon()
      ctx.slots.inject("settings.section", () => ctx.slots.register(
        { name: "settings.section", id: "dsh-better-ux", order: 35, label: "交互体验" },
        () => h(SettingsPage, null),
      ))
      ctx.effect(() => () => {
        stopSession()
        stopPicker()
        stopMobile()
        stopFontScale()
        stopSettingsIcon()
        style.remove()
      }, "dsh-better-ux")
    }

    exports.apply = apply
    exports.inject = ["slots", "sessions", "modelDirectories"]
    return module.exports
  },
})
