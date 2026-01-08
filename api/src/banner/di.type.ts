import type BannerController from './application/banner-controller.ts'
import makeGetInformationBanner from './domain/usecases/get-information-banner.ts'
import type InformationBannerRepository from './infrastructure/repositories/information-banner-repository.ts'
import type InformationBannerSerializer from './infrastructure/serializers/jsonapi/information-banner-serializer.ts'
import { informationBannersStorage } from '../shared/infrastructure/key-value-storages/index.js';

export type Dependencies = {
  // controllers
  bannerController: BannerController,
  // serializers
  informationBannerSerializer: InformationBannerSerializer,
  // repositories
  informationBannerRepository: InformationBannerRepository,
  // usecases
  getInformationBanner: ReturnType<typeof makeGetInformationBanner>
  // shared:
  informationBannersStorage: typeof informationBannersStorage,
}

declare global {
  type Deps<Name extends keyof Dependencies> = Pick<Dependencies, Name>
}
