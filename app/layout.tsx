import type React from "react"
import { Geist, Geist_Mono } from "next/font/google"
import Script from "next/script"
import { Analytics } from "@vercel/analytics/next"
import { ServiceWorkerReset } from "@/components/service-worker-reset"
import { SiteMotion } from "@/components/site-motion"
import { getSiteSettings } from "@/lib/site-settings"
import { buildSeoMetadata } from "@/lib/seo"
import { resolveAssetUrl } from "@/lib/asset-url"
import { headingTypographyToCssVariables } from "@/lib/heading-typography"
import "./globals.css"

const DEFAULT_FAVICON = "/uploads/default-icon-light-32x32.png"
const DARK_FAVICON = "/uploads/default-icon-dark-32x32.png"
const SVG_FAVICON = "/uploads/default-icon.svg"
const DEFAULT_LOGO = "/uploads/default-logo.png"
const SAFE_PERFORMANCE_MEASURE_PATCH = `
(function () {
  if (typeof window === "undefined") return;
  if (typeof Performance === "undefined") return;

  var perf = window.performance;
  if (!perf) return;
  var proto = Object.getPrototypeOf(perf);
  var flag = "__absonsSafeMeasurePatched";
  if (perf[flag] || (proto && proto[flag])) return;

  var sanitizeName = function (value) {
    if (typeof value !== "string") return value;
    return value.replace(/\\u200B|\\u200C|\\u200D|\\uFEFF/g, "");
  };

  var clampTimingOptions = function (value) {
    if (!value || typeof value !== "object" || Array.isArray(value)) return value;
    var next = Object.assign({}, value);
    if (typeof next.startTime === "number") {
      if (!Number.isFinite(next.startTime) || next.startTime < 0) next.startTime = 0;
    }
    if (typeof next.start === "number" && next.start < 0) next.start = 0;
    if (typeof next.end === "number" && next.end < 0) next.end = 0;
    if (typeof next.duration === "number" && next.duration < 0) next.duration = 0;
    return next;
  };

  var isNegativeTimestampError = function (error) {
    var message = error && typeof error === "object" && "message" in error ? String(error.message || "") : "";
    return /negative time stamp/i.test(message);
  };

  var wrapMeasure = function (original) {
    if (typeof original !== "function") return null;
    return function (name, startOrOptions, endMark) {
      var safeName = sanitizeName(name);
      var safeEndMark = typeof endMark === "string" ? sanitizeName(endMark) : endMark;
      try {
        return original.call(this, safeName, startOrOptions, safeEndMark);
      } catch (error) {
        if (!isNegativeTimestampError(error)) throw error;

        try {
          var safeStart = clampTimingOptions(startOrOptions);
          if (typeof safeStart === "string") safeStart = undefined;
          return original.call(this, safeName, safeStart, safeEndMark);
        } catch {
          try {
            return original.call(this, safeName);
          } catch {
            return;
          }
        }
      }
    };
  };

  var wrapMark = function (original) {
    if (typeof original !== "function") return null;
    return function (name, options) {
      var safeName = sanitizeName(name);
      try {
        return original.call(this, safeName, options);
      } catch (error) {
        if (!isNegativeTimestampError(error)) throw error;
        try {
          return original.call(this, safeName, clampTimingOptions(options));
        } catch {
          return;
        }
      }
    };
  };

  var patchMethod = function (target, key, wrap) {
    if (!target || typeof wrap !== "function") return false;
    var original = target[key];
    var wrapped = wrap(original);
    if (typeof wrapped !== "function") return false;

    try {
      Object.defineProperty(target, key, {
        value: wrapped,
        configurable: true,
        writable: true,
      });
      return true;
    } catch {
      try {
        target[key] = wrapped;
        return true;
      } catch {
        return false;
      }
    }
  };

  try {
    var patched =
      patchMethod(perf, "measure", wrapMeasure) ||
      patchMethod(proto, "measure", wrapMeasure) ||
      patchMethod(Performance.prototype, "measure", wrapMeasure);
    patchMethod(perf, "mark", wrapMark) ||
      patchMethod(proto, "mark", wrapMark) ||
      patchMethod(Performance.prototype, "mark", wrapMark);
    if (!patched) return;

    Object.defineProperty(perf, flag, {
      value: true,
      configurable: true,
      enumerable: false,
      writable: false,
    });
    if (proto) {
      Object.defineProperty(proto, flag, {
        value: true,
        configurable: true,
        enumerable: false,
        writable: false,
      });
    }
  } catch {
    return;
  }
})();
`
const SITE_PRELOADER_SCRIPT = `
(function () {
  if (typeof window === "undefined") return;

  var startedAt = Date.now();
  var MIN_SHOW_MS = 150;
  var ADMIN_AUTH_PATH = /^\\/(admin|auth)(\\/|$)/;

  var hidePreloader = function () {
    var preloader = document.getElementById("site-preloader");
    if (!preloader) return;

    var elapsed = Date.now() - startedAt;
    var delay = ADMIN_AUTH_PATH.test(window.location.pathname || "") ? 0 : Math.max(0, MIN_SHOW_MS - elapsed);

    window.setTimeout(function () {
      preloader.classList.add("is-hidden");
      preloader.setAttribute("aria-busy", "false");

      var removeNode = function () {
        if (preloader && preloader.parentNode) preloader.parentNode.removeChild(preloader);
      };

      preloader.addEventListener("transitionend", removeNode, { once: true });
      window.setTimeout(removeNode, 700);
    }, delay);
  };

  if (document.readyState === "complete") {
    hidePreloader();
  } else {
    window.addEventListener("load", hidePreloader, { once: true });
  }
})();
`

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

// Force dynamic rendering so pages always pick up current settings and assets
export const dynamic = "force-dynamic"
export const revalidate = 0

function iconMeta(url: string | null | undefined) {
  const safeUrl = resolveAssetUrl(url || DEFAULT_FAVICON) || resolveAssetUrl(DEFAULT_FAVICON) || DEFAULT_FAVICON
  const lower = safeUrl.toLowerCase()
  const isPng = lower.includes(".png")
  const isIco = lower.includes(".ico")

  return {
    url: safeUrl,
    // Uploaded favicons are normalized to 32x32 PNG; leave undefined for ICO/misc to let browsers choose
    sizes: isIco ? undefined : "32x32",
    type: isPng ? "image/png" : isIco ? "image/x-icon" : undefined,
  }
}

export async function generateMetadata() {
  const settings = await getSiteSettings()
  const favicon = settings.faviconUrl || DEFAULT_FAVICON
  const iconEntry = iconMeta(favicon)
  const usingCustomFavicon = favicon !== DEFAULT_FAVICON

  const iconList = usingCustomFavicon
    ? [iconEntry]
    : [
        iconEntry,
        {
          url: DARK_FAVICON,
          media: "(prefers-color-scheme: dark)",
          sizes: "32x32",
          type: "image/png",
        },
        {
          url: SVG_FAVICON,
          type: "image/svg+xml",
        },
      ]

  const baseMetadata = buildSeoMetadata(settings, {})
  return {
    ...baseMetadata,
    generator: "v0.app",
    icons: {
      icon: iconList,
      shortcut: iconEntry,
      apple: iconEntry,
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head />
      <body className={`font-sans antialiased`}>
        <Script id="safe-performance-measure" strategy="beforeInteractive">
          {SAFE_PERFORMANCE_MEASURE_PATCH}
        </Script>
        <Script id="site-preloader-script" strategy="beforeInteractive">
          {SITE_PRELOADER_SCRIPT}
        </Script>
        <LayoutWithSettings>{children}</LayoutWithSettings>
        <Analytics />
      </body>
    </html>
  )
}

async function LayoutWithSettings({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()
  const preloaderLogo = resolveAssetUrl(settings.logoUrl || DEFAULT_LOGO) || DEFAULT_LOGO
  const preloaderAlt = `${settings.siteTitle || "Site"} loading`
  const layoutMode = settings.layoutMode || "container"
  const widthValue = layoutMode === "full" ? "100%" : `${Math.min(Math.max(settings.layoutWidth || 90, 60), 100)}%`
  const motionDesktopPercent = Math.min(90, Math.max(0, Math.round(settings.motionEntranceDesktopPercent || 34)))
  const motionMobilePercent = Math.min(90, Math.max(0, Math.round(settings.motionEntranceMobilePercent || 50)))
  const headingVars = headingTypographyToCssVariables(settings.headingTypography)
  const analyticsSnippet = settings.analyticsScript?.trim()
  const headerSnippet = settings.headerCode?.trim()
  const footerSnippet = settings.footerCode?.trim()

  return (
    <div
      id="site-layout-vars"
      style={{
        ["--page-container-max" as string]: widthValue,
        ["--motion-trigger-desktop-pct" as string]: String(motionDesktopPercent),
        ["--motion-trigger-mobile-pct" as string]: String(motionMobilePercent),
        ...headingVars,
      }}
    >
      <div id="site-preloader" role="status" aria-live="polite" aria-busy="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="site-preloader-logo" src={preloaderLogo} alt={preloaderAlt} width={150} height={150} />
      </div>
      <ServiceWorkerReset />
      <SiteMotion />
      {analyticsSnippet ? <div dangerouslySetInnerHTML={{ __html: analyticsSnippet }} /> : null}
      {headerSnippet ? <div dangerouslySetInnerHTML={{ __html: headerSnippet }} /> : null}
      {children}
      {footerSnippet ? <div dangerouslySetInnerHTML={{ __html: footerSnippet }} /> : null}
    </div>
  )
}
