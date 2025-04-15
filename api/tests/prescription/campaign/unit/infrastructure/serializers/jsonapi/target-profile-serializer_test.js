import * as serializer from '../../../../../../../src/prescription/campaign/infrastructure/serializers/jsonapi/target-profile-serializer.js';
import { TargetProfile } from '../../../../../../../src/shared/domain/models/TargetProfile.js';
import { expect } from '../../../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | target-profile-serializer', function () {
  describe('#serialize', function () {
    it('should serialize target profile to JSONAPI', function () {
      // given
      const targetProfile = new TargetProfile({
        id: 132,
        name: 'Ouaiche la zone',
        isSimplifiedAccess: true,
      });

      const expectedTargetProfile = {
        data: {
          id: targetProfile.id.toString(),
          type: 'target-profiles',
          attributes: {
            name: targetProfile.name,
            'is-simplified-access': targetProfile.isSimplifiedAccess,
          },
        },
      };

      // when
      const serializedTargetProfile = serializer.serialize(targetProfile);

      // then
      return expect(serializedTargetProfile).to.deep.equal(expectedTargetProfile);
    });
  });
});
