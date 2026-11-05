import ENV from 'mon-pix/config/environment';

export function isModulePreviewAllowedOrigin(origin) {
  if (ENV.APP.IS_DEV_ENVIRONMENT) return true;
  return ENV.APP.MODULE_PREVIEW_ALLOWED_ORIGINS.includes(origin);
}
