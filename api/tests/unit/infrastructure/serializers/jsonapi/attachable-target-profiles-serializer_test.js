import { AttachableTargetProfile } from '../../../../../lib/domain/models/AttachableTargetProfile.js';
import * as serializer from '../../../../../lib/infrastructure/serializers/jsonapi/attachable-target-profiles-serializer.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | attachable-target-profiles-serializer', function () {
  describe('#serialize', function () {
    it('should serialize attachable target profiles to JSONAPI', function () {
      // given
      const attachableTargetProfile = new AttachableTargetProfile({
        id: 1,
        name: 'AttachableTargetProfiles',
      });

      // when
      const serializedAttachableTargetProfiles = serializer.serialize([attachableTargetProfile]);

      // then
      expect(serializedAttachableTargetProfiles).to.deep.equal({
        data: [
          {
            attributes: {
              name: 'AttachableTargetProfiles',
            },
            id: '1',
            type: 'attachable-target-profiles',
          },
        ],
      });
    });
  });
});
