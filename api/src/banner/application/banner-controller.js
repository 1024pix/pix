import { usecases } from '../domain/usecases/index.js';
import * as informationBannerSerializer from '../infrastructure/serializers/jsonapi/information-banner-serializer.js';

const getInformationBanner = async function (request) {
  const { target: id } = request.params;

  const informationBanner = await usecases.getInformationBanner({ id });

  return informationBannerSerializer.serialize(informationBanner);
};

export const bannerController = {
  getInformationBanner,
};
