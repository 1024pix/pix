import { expect } from '../../../../../../test-helper.js';
import * as serializer from '../../../../../../../src/prescription/target-profile/infrastructure/serializers/jsonapi/target-profile-for-specifier-serializer.js';
import { TargetProfileForSpecifier } from '../../../../../../../src/prescription/target-profile/domain/read-models/TargetProfileForSpecifier.js';

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
        areKnowledgeElementsResettable: true,
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
            'are-knowledge-elements-resettable': true,
          },
        },
        meta,
      };

      const serializedTargetProfile = serializer.serialize(targetProfile, meta);

      return expect(serializedTargetProfile).to.deep.equal(expectedTargetProfile);
    });
  });
});
