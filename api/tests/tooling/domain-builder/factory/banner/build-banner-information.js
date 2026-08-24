import { InformationBanner } from '../../../../../src/communication/banner/domain/models/information-banner.js';

const buildEmptyInformationBanner = function ({ id }) {
  return InformationBanner.empty({ id });
};

const buildInformationBanner = function ({ id, banners }) {
  return new InformationBanner({ id, banners });
};

export { buildEmptyInformationBanner, buildInformationBanner };
