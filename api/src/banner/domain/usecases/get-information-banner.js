import * as injectedInformationBannerRepository from '../../infrastructure/repositories/information-banner-repository.js';
const getInformationBanner = async ({ id, informationBannerRepository = injectedInformationBannerRepository } = {}) => {
  return informationBannerRepository.get({ id });
};

export { getInformationBanner };
