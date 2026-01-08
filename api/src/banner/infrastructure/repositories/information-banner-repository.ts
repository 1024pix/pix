import { InformationBanner } from '../../domain/models/information-banner.ts';

type Dependencies = Deps<'informationBannersStorage'>

export default class InformationBannerRepository {
  informationBannersStorage: Dependencies['informationBannersStorage']

  constructor(deps: Dependencies) {
    this.informationBannersStorage = deps.informationBannersStorage
  }

  async get(id: string) {
    const banners = await this.informationBannersStorage.get(id);
    if (!banners) {
      return InformationBanner.empty({ id });
    }

    return new InformationBanner({ id, banners });
  };
}
