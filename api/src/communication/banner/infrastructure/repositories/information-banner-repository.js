import { informationBannersStorage } from '../../../../shared/infrastructure/key-value-storages/index.js';
import { InformationBanner } from '../../domain/models/information-banner.js';

const get = async function ({ id }) {
  const banners = await informationBannersStorage.get(id);
  if (!banners) {
    return InformationBanner.empty({ id });
  }

  return new InformationBanner({ id, banners });
};

export { get };
