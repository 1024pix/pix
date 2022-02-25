const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/target-profile-serializer');
const TargetProfile = require('../../../../../lib/domain/models/TargetProfile');

describe('Unit | Serializer | JSONAPI | target-profile-serializer', function () {
  describe('#serialize', function () {
    it('should serialize target profile to JSONAPI', function () {
      // given
      const targetProfile = new TargetProfile({
        id: 132,
        ownerOrganizationId: 12,
        name: 'Les compétences de BRO 2.0',
        outdated: true,
        ispublic: false,
        isSimplifiedAccess: true,
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
            'is-simplified-access': targetProfile.isSimplifiedAccess,
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

  describe('#deserialize', function () {
    it('should deserialize JSONAPI to target profile', function () {
      // given

      const json = {
        data: {
          id: '12',
          type: 'target-profiles',
          attributes: {
            name: 'Les compétences de BRO 2.0',
            'is-public': false,
            'owner-organization-id': 12,
            'skill-ids': ['skillId1', 'skillIds2'],
            'image-url': 'superImage.png',
            comment: 'Interesting comment',
            description: 'Amazing description',
            category: 'OTHER',
          },
        },
      };

      const expectTargetProfileObject = {
        ownerOrganizationId: 12,
        name: 'Les compétences de BRO 2.0',
        isPublic: false,
        imageUrl: 'superImage.png',
        skillIds: ['skillId1', 'skillIds2'],
        comment: 'Interesting comment',
        description: 'Amazing description',
        category: 'OTHER',
      };

      // when
      const deserializedTargetProfile = serializer.deserialize(json);

      // then
      return expect(deserializedTargetProfile).to.deep.equal(expectTargetProfileObject);
    });
  });
});
