const { expect, domainBuilder } = require('../../../../../test-helper');
const serializer = require('../../../../../../lib/infrastructure/serializers/jsonapi/campaign/target-profile-for-specifier-serializer');
const TargetProfileForSpecifier = require('../../../../../../lib/domain/read-models/campaign/TargetProfileForSpecifier');

describe('Unit | Serializer | JSONAPI | target-profile-for-specifier-serializer', function () {
  describe('#serialize', function () {
    it('should serialize target profile to JSONAPI', function () {
      const skills = [domainBuilder.buildSkill({ tubeId: 'tube1' }), domainBuilder.buildSkill({ tubeId: 'tube2' })];
      const thematicResults = [domainBuilder.buildBadge()];

      const targetProfile = new TargetProfileForSpecifier({
        id: 132,
        name: 'name',
        skills,
        thematicResults,
        hasStage: true,
        description: 'description',
        category: 'SUBJECT',
      });

      const meta = { some: 'meta' };

      const expectedTargetProfile = {
        data: {
          id: targetProfile.id.toString(),
          type: 'target-profiles',
          attributes: {
            name: 'name',
            'tube-count': 2,
            'thematic-result-count': 1,
            'has-stage': true,
            description: 'description',
            category: 'SUBJECT',
          },
        },
        meta,
      };

      const serializedTargetProfile = serializer.serialize(targetProfile, meta);

      return expect(serializedTargetProfile).to.deep.equal(expectedTargetProfile);
    });
  });
});
