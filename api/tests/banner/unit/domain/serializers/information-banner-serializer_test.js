import { informationBannerSerializer } from '../../../../../src/banner/infrastructure/serializers/jsonapi/information-banner-serializer.js';
import { expect } from '../../../../test-helper.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Serializer | JSONAPI | information-banner-serializer', function () {
  describe('#serialize', function () {
    it('should convert JSON API data', async function () {
      // given
      const bannerInformation = domainBuilder.banner.buildInformationBanner({
        id: 'pix-target',
        banners: [
          {
            id: 'pix-target:1',
            message: [{ fr: 'message fr', en: 'message en' }],
            severity: 'info',
          },
        ],
      });

      const serializedBannerInformation = await informationBannerSerializer.serialize(bannerInformation);

      expect(serializedBannerInformation).to.deep.equal({
        data: {
          type: 'information-banners',
          id: 'pix-target',
          attributes: {},
          relationships: {
            banners: {
              data: [{ id: 'pix-target:1', type: 'banners' }],
            },
          },
        },
        included: [
          {
            attributes: {
              message: [
                {
                  fr: 'message fr',
                  en: 'message en',
                },
              ],
              severity: 'info',
            },
            id: 'pix-target:1',
            type: 'banners',
          },
        ],
      });
    });
  });
});
