import { expect } from '../../../../../test-helper.js';
import * as serializer from '../../../../../../src/certification/complementary-certification/infrastructure/serializers/jsonapi/complementary-certification-badge-serializer.js';

describe('Unit | Serializer | JSONAPI | badge-serializer', function () {
  describe('#deserialize', function () {
    it('should convert JSON API data', async function () {
      // given
      const json = {
        data: {
          attributes: {
            'target-profile-id': 12,
            'complementary-certification-badges': [
              {
                data: {
                  attributes: {
                    'badge-id': 1,
                    level: 1,
                    'image-url': 'imageUrl',
                    label: 'label',
                    'sticker-url': 'stickerUrl',
                    'certificate-message': '',
                    'temporary-certificate-message': '',
                  },
                  relationships: {
                    'complementary-certification': {
                      data: {
                        type: 'complementary-certifications',
                        id: '52',
                      },
                    },
                  },
                  type: 'complementary-certification-badges',
                },
              },
            ],
          },
        },
      };

      // when
      const complementaryCertification = await serializer.deserialize(json);

      // then
      const expectedComplementaryCertification = {
        targetProfileId: 12,
        complementaryCertificationBadges: [
          {
            badgeId: 1,
            level: 1,
            imageUrl: 'imageUrl',
            label: 'label',
            stickerUrl: 'stickerUrl',
            certificateMessage: '',
            temporaryCertificateMessage: '',
          },
        ],
      };
      expect(complementaryCertification).to.deep.equal(expectedComplementaryCertification);
    });
  });
});
