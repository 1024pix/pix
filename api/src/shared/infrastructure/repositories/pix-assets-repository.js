import { PixAssetImageInfos } from '../../domain/models/PixAssetImageInfos.js';
import { fetchAssetsMetadata } from '../datasources/pix-assets/pix-assets-client.js';
import { logger } from '../utils/logger.js';

const VALID_HOSTNAME = 'assets.pix.org';

const knownAssetsInfos = new Map();

/**
 * @param{string} assetUrl
 */
export async function getAssetInfos(assetUrl) {
  if (knownAssetsInfos.has(assetUrl)) {
    logger.debug(`PixAsset - asset "${assetUrl}" found. Returning cached informations`);
    return knownAssetsInfos.get(assetUrl);
  }

  if (!URL.canParse(assetUrl)) {
    throw new Error(`Asset URL "${assetUrl}" is invalid`);
  }

  const url = new URL(assetUrl);
  if (url.hostname !== VALID_HOSTNAME) {
    throw new Error(`Asset URL "${url.hostname}" hostname is not handled. Use "${VALID_HOSTNAME}"`);
  }

  const assetMetadata = await fetchAssetsMetadata(url);

  const assetInfos = new PixAssetImageInfos({
    width: assetMetadata.get('x-object-meta-width') ? Number.parseInt(assetMetadata.get('x-object-meta-width')) : null,
    height: assetMetadata.get('x-object-meta-height')
      ? Number.parseInt(assetMetadata.get('x-object-meta-height'))
      : null,
    contentType: assetMetadata.get('content-type'),
  });
  logger.debug(`PixAsset - Unknown asset "${url}", caching its informations.`);
  knownAssetsInfos.set(assetUrl, assetInfos);

  return assetInfos;
}
