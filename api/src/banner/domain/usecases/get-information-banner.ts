type Dependencies = Deps<'informationBannerRepository'>;

const makeGetInformationBanner = (deps: Dependencies) => {
  return async ({ id }: { id: string }) => {
    const { informationBannerRepository } = deps;
    return informationBannerRepository.get(id);
  };
};

export default makeGetInformationBanner;
