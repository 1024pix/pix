import type { Request } from '@hapi/hapi';
import { InformationBannerSerializer } from '../infrastructure/serializers/jsonapi/information-banner-serializer.ts';
import { getInformationBanner } from '../domain/usecases/get-information-banner.ts';

export const get = async function (request: Request) {
  const { target: id } = request.params;

  const informationBanner = await getInformationBanner({ id });

  return InformationBannerSerializer.serialize(informationBanner);
};

export const InformationBannerController = { get }
