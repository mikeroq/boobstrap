import { initBanners } from "@boobstrap/boobstrap/js/banner";

export function initDevelopmentBanner(root = document) {
  const banner = root.querySelector("[data-dev-banner]");
  const isDevelopmentSite = import.meta.env.DEV || import.meta.env.VITE_SITE_ENV === "development";

  if (!banner) return null;

  if (!isDevelopmentSite) {
    banner.remove();
    return null;
  }

  banner.hidden = false;
  return initBanners(banner)[0] ?? null;
}
