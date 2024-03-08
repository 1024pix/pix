import { domainBuilder, expect } from '../../../test-helper.js';

describe('Unit | Domain | Models | BadgeAcquisition', function () {
  describe('#get badgeKey', function () {
    it('should return the key of the related badge', function () {
      // given
      const badge = domainBuilder.buildBadge({ id: 123, key: 'someKey' });
      const badgeAcquisition = domainBuilder.buildBadgeAcquisition({ badge, badgeId: 123 });

      // when
      const badgeKey = badgeAcquisition.badgeKey;

      // then
      expect(badgeKey).to.equal('someKey');
    });
  });
});
