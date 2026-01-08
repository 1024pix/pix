import type { Request } from '@hapi/hapi';

type Dependencies = Deps<'getInformationBanner' | 'informationBannerSerializer'>

export default class BannerController {
  getInformationBanner: Dependencies['getInformationBanner']
  informationBannerSerializer: Dependencies['informationBannerSerializer']

  constructor(deps: Dependencies) {
    this.getInformationBanner = deps.getInformationBanner;
    this.informationBannerSerializer = deps.informationBannerSerializer;
  }

  async get(request: Request) {
    const { target: id } = request.params;
    const informationBanner = await this.getInformationBanner({ id });

    return this.informationBannerSerializer.serialize(informationBanner);
  }
}
