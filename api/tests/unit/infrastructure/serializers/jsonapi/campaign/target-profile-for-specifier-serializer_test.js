import { expect } from '../../../../../test-helper';
import serializer from '../../../../../../lib/infrastructure/serializers/jsonapi/campaign/target-profile-for-specifier-serializer';
import TargetProfileForSpecifier from '../../../../../../lib/domain/read-models/campaign/TargetProfileForSpecifier';

describe('Unit | Serializer | JSONAPI | target-profile-for-specifier-serializer', function () {
  describe('#serialize', function () {
    it('should serialize target profile to JSONAPI', function () {
      const targetProfile = new TargetProfileForSpecifier({
        id: 132,
        name: 'name',
        tubeCount: 2,
        thematicResultCount: 1,
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
