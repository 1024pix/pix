import { RepositoriesRegistry } from "../../infrastructure/repositories/registry.ts";

const Repositories = RepositoriesRegistry.pick('InformationBannerRepository')

export const makeUsecase = (repositories: typeof Repositories) => async ({ id }: { id: string }) => {
  const { InformationBannerRepository } = repositories;

  return InformationBannerRepository.get(id);
};

export const getInformationBanner = makeUsecase(Repositories);
