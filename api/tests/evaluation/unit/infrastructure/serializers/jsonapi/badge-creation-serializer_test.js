import { deserializer } from '../../../../../../src/evaluation/infrastructure/serializers/jsonapi/badge-creation-serializer.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | badge-creation-serializer', function () {
  describe('#deserialize', function () {
    it('should convert JSON API data into a BadgeCreation model object', async function () {
      // given
      const jsonBadge = {
        data: {
          type: 'badge-creations',
          attributes: {
            key: 'BADGE_KEY',
            'alt-message': 'alt-message',
            'image-url': 'https://example.net/image.svg',
            message: 'message',
            title: 'title',
            'is-certifiable': false,
            'is-always-visible': true,
            'campaign-threshold': 99,
          },
        },
      };

      // when
      const badgeCreation = await deserializer.deserialize(jsonBadge);

      // then
      const expectedBadgeCreation = {
        key: 'BADGE_KEY',
        altMessage: 'alt-message',
        imageUrl: 'https://example.net/image.svg',
        message: 'message',
        title: 'title',
        isCertifiable: false,
        isAlwaysVisible: true,
        campaignThreshold: 99,
      };
      expect(badgeCreation).to.deep.equal(expectedBadgeCreation);
    });
  });
});
