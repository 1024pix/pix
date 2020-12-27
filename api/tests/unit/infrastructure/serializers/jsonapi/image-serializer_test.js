const { expect } = require('../../../../test-helper');
const imageSerializer = require('../../../../../lib/infrastructure/serializers/jsonapi/image-serializer');

describe('Unit | Serializer | JSONAPI | image-serializer', () => {

  describe('#serializeOrganizationLogoUrl()', () => {

    it('should convert an organization logo url into JSON API data', () => {
      // given
      const organizationId = 123;
      const organizationLogoUrl = 'someImageBaseCode';

      // when
      const jsonApi = imageSerializer.serializeOrganizationLogoUrl(organizationId, organizationLogoUrl);

      // then
      expect(jsonApi).to.deep.equal({
        data: {
          type: 'organization-logo-urls',
          id: organizationId.toString(),
          attributes: {
            'image': organizationLogoUrl,
          },
        },
      });
    });
  });

  describe('#serializeTargetProfileImageUrl()', () => {

    it('should convert an target profile image url into JSON API data', () => {
      // given
      const targetProfileId = 123;
      const targetProfileImageUrl = 'someImageBaseCode';

      // when
      const jsonApi = imageSerializer.serializeTargetProfileImageUrl(targetProfileId, targetProfileImageUrl);

      // then
      expect(jsonApi).to.deep.equal({
        data: {
          type: 'target-profile-image-urls',
          id: targetProfileId.toString(),
          attributes: {
            'image': targetProfileImageUrl,
          },
        },
      });
    });
  });
});
