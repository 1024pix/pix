import { TargetProfile } from '../../../../../../src/prescription/target-profile/domain/models/TargetProfile.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

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

  describe('#hasBadges', function () {
    it('should return true when target profile has badges', function () {
      // given
      const badge = domainBuilder.buildBadge();
      const targetProfile = domainBuilder.buildTargetProfile({ badges: [badge] });

      // then
      expect(targetProfile.hasBadges).to.be.true;
    });

    it("should return false when target profile doesn't have badges", function () {
      // given
      const targetProfile = domainBuilder.buildTargetProfile();

      // then
      expect(targetProfile.hasBadges).to.be.false;
    });
  });
});
