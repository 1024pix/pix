import { informationBannersStorage } from '../../../shared/infrastructure/key-value-storages/index.js';
import { InformationBanner } from '../../domain/models/information-banner.ts';

const get = async function (id: string) {
  const banners = await informationBannersStorage.get(id);
  if (!banners) {
    return InformationBanner.empty({ id });
  }

  return new InformationBanner({ id, banners });
};

export const InformationBannerRepository = { get };
