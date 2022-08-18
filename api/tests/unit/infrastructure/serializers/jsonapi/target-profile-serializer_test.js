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

  describe('#serializeId', function () {
    it('should return a serialized target profile to JSONAPI with only ID filled', function () {
      // when
      const serializedTargetProfile = serializer.serializeId(123);

      // then
      const expectedTargetProfileSerialized = {
        data: {
          id: '123',
          type: 'target-profiles',
        },
      };
      return expect(serializedTargetProfile).to.deep.equal(expectedTargetProfileSerialized);
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
            'tubes-selection': [
              { id: 'tubeId1', level: 5 },
              { id: 'tubeId2', level: 7 },
            ],
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
        tubes: [
          { id: 'tubeId1', level: 5 },
          { id: 'tubeId2', level: 7 },
        ],
      };

      // when
      const deserializedTargetProfile = serializer.deserialize(json);

      // then
      expect(deserializedTargetProfile).to.deep.equal(expectTargetProfileObject);
    });
  });

  describe('#deserializeCreationCommand', function () {
    it('should deserialize JSONAPI to target profile creation command', function () {
      // given
      const json = {
        data: {
          attributes: {
            name: 'Les compétences de BRO 2.0',
            category: 'OTHER',
            description: 'Amazing description',
            comment: 'Interesting comment',
            'is-public': false,
            'image-url': 'superImage.png',
            'owner-organization-id': 12,
            tubes: [
              { id: 'tubeId1', level: '5' },
              { id: 'tubeId2', level: '7' },
            ],
          },
        },
      };

      // when
      const deserializedTargetProfileCreationCommand = serializer.deserializeCreationCommand(json);

      // then
      const expectedTargetProfileCreationCommand = {
        name: 'Les compétences de BRO 2.0',
        category: 'OTHER',
        description: 'Amazing description',
        comment: 'Interesting comment',
        isPublic: false,
        imageUrl: 'superImage.png',
        ownerOrganizationId: 12,
        tubes: [
          { id: 'tubeId1', level: '5' },
          { id: 'tubeId2', level: '7' },
        ],
      };
      expect(deserializedTargetProfileCreationCommand).to.deep.equal(expectedTargetProfileCreationCommand);
    });
  });
});
