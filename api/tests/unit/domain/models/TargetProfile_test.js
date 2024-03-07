import { domainBuilder, expect } from '../../../test-helper.js';

describe('Unit | Domain | Models | TargetProfile', function () {
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
