import { expect } from '../../../../test-helper.js';
import * as serializer from '../../../../../lib/infrastructure/serializers/jsonapi/target-profiles-attachable-for-admin-serializer.js';
import { AttachableTargetProfile } from '../../../../../lib/domain/models/AttachableTargetProfile.js';

describe('Unit | Serializer | JSONAPI | target-profiles-attachable-for-admin-serializer', function () {
  describe('#serialize', function () {
    it('should serialize target profiles to JSONAPI', function () {
      // given
      const targetProfileAttachable = new AttachableTargetProfile({
        id: 1,
        name: 'TargetProfilesAttachableForAdmin',
      });

      // when
      const serializedTargetProfilesAttachable = serializer.serialize([targetProfileAttachable]);

      // then
      expect(serializedTargetProfilesAttachable).to.deep.equal({
        data: [
          {
            attributes: {
              name: 'TargetProfilesAttachableForAdmin',
            },
            id: '1',
            type: 'attachable-target-profiles',
          },
        ],
      });
    });
  });
});
