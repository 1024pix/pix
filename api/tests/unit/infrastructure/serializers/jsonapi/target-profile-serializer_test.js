const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/target-profile-serializer');

describe('Unit | Serializer | JSONAPI | target-profile-serializer', function() {

  describe('#serialize', function() {

    it('should serialize target profile to JSONAPI', function() {
      // given
      const organizationId = domainBuilder.buildOrganization({ id: 456, name: 'organization 3.0' }).id;
      const targetProfile = domainBuilder.buildTargetProfile({ id: 132, organizationId, name: 'Les compétences de BRO 2.0' });
      const meta = { some: 'meta' };

      const expectedTargetProfile = {
        data: {
          id: targetProfile.id.toString(),
          type: 'target-profiles',
          attributes: {
            name: targetProfile.name,
            outdated: targetProfile.outdated,
            'is-public': targetProfile.isPublic,
            'organization-id': targetProfile.organizationId,
          },
          relationships: {
            organizations: {
              links: {
                related: `/api/target-profiles/${targetProfile.id}/organizations`,
              },
            },
          },
        },
        meta,
      };

      // when
      const serializedTargetProfile = serializer.serialize(targetProfile, meta);

      // then
      return expect(serializedTargetProfile).to.deep.equal(expectedTargetProfile);
    });
  });
});
