import ENV from '1d/config/environment';

export function isEmbedAllowedOrigin(origin) {
  return getEmbedAllowedOriginsRegexps().some((allowedOrigin) => origin.match(allowedOrigin));
}

function getEmbedAllowedOriginsRegexps() {
  return ENV.APP.EMBED_ALLOWED_ORIGINS.map((allowedOrigin) => new RegExp(allowedOrigin.replace('*', '[\\w-]+')));
}
