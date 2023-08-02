import { expect } from '../../../../test-helper.js';
import * as serializer from '../../../../../lib/infrastructure/serializers/jsonapi/target-profiles-attachable-for-admin-serializer.js';
import { TargetProfileAttachableForAdmin } from '../../../../../lib/domain/models/TargetProfileAttachableForAdmin.js';

describe('Unit | Serializer | JSONAPI | target-profiles-attachable-for-admin-serializer', function () {
  describe('#serialize', function () {
    it('should serialize target profiles to JSONAPI', function () {
      // given
      const targetProfileAttachable = new TargetProfileAttachableForAdmin({
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
