import { Serializer } from 'jsonapi-serializer';
import type { InformationBanner } from '../../../domain/models/information-banner.js';

export default class InformationBannerSerializer {
  serialize(informationBanner: InformationBanner) {
    // XXX: 'jsonapi-serializer' are not clever, they return any.
    // What about deserialize ? Is there better typed alternatives ?
    return new Serializer('information-banners', {
      attributes: ['banners'],
      banners: {
        included: true,
        ref: 'id',
        attributes: ['severity', 'message'],
      },
    }).serialize(informationBanner);
  }
}
