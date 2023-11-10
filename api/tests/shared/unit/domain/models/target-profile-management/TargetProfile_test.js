import { expect } from '../../../../../test-helper.js';
import { TargetProfile } from '../../../../../../src/shared/domain/models/target-profile-management/TargetProfile.js';

describe('Unit | Domain | Models | TargetProfile', function () {
  describe('#detach', function () {
    it('should detach organizations', function () {
      const targetProfile = new TargetProfile({ id: 123 });

      targetProfile.detach([1, 2]);

      expect(targetProfile.organizationIdsToDetach).deep.equal([1, 2]);
    });

    it('should not detach an organization twice', function () {
      const targetProfile = new TargetProfile({ id: 123 });

      targetProfile.detach([3, 3]);

      expect(targetProfile.organizationIdsToDetach).deep.equal([3]);
    });
  });
});
