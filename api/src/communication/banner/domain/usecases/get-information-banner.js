const getInformationBanner = async ({ id, informationBannerRepository }) => {
  return informationBannerRepository.get({ id });
};

export { getInformationBanner };
