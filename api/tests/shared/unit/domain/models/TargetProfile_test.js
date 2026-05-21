import { TargetProfile } from '../../../../../src/shared/domain/models/TargetProfile.js';
import { expect } from '../../../../test-helper.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Shared | Domain | Models | TargetProfile', function () {
  describe('#constructor', function () {
    it('initializes targetProfile properties', function () {
      // given & when
      const stage = domainBuilder.buildStage();
      const badge = domainBuilder.buildBadge();
      const targetProfile = new TargetProfile({
        id: 'id',
        badges: [badge],
        category: 'category',
        description: 'description',
        estimatedTime: 4,
        imageUrl: 'imageUrl',
        internalName: 'internalName',
        isSimplifiedAccess: 'isSimplifiedAccess',
        name: 'name',
        outdated: 'outdated',
        stages: [stage],
      });

      // then
      expect(targetProfile).deep.equal({
        id: 'id',
        badges: [badge],
        category: 'category',
        description: 'description',
        estimatedTime: 4,
        imageUrl: 'imageUrl',
        internalName: 'internalName',
        isSimplifiedAccess: 'isSimplifiedAccess',
        name: 'name',
        outdated: 'outdated',
        stages: [stage],
      });
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
