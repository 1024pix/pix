const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/target-profile-serializer');
const TargetProfile = require('../../../../../lib/domain/models/TargetProfile');

describe('Unit | Serializer | JSONAPI | target-profile-serializer', function() {

  describe('#serialize', function() {

    it('should serialize target profile to JSONAPI', function() {
      // given
      const targetProfile = new TargetProfile({
        id: 132,
        ownerOrganizationId: 12,
        name: 'Les compétences de BRO 2.0',
        outdated: true,
        ispublic: false,
      });

      const meta = { some: 'meta' };

      const expectedTargetProfile = {
        data: {
          id: targetProfile.id.toString(),
          type: 'target-profiles',
          attributes: {
            name: targetProfile.name,
            outdated: targetProfile.outdated,
            'is-public': targetProfile.isPublic,
            'owner-organization-id': targetProfile.ownerOrganizationId,
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
