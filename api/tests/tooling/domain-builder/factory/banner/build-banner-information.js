import { InformationBanner } from '../../../../../src/banner/domain/models/information-banner.ts';

const buildEmptyInformationBanner = function ({ id }) {
  return InformationBanner.empty({ id });
};

const buildInformationBanner = function ({ id, banners }) {
  return new InformationBanner({ id, banners });
};

export { buildEmptyInformationBanner, buildInformationBanner };
