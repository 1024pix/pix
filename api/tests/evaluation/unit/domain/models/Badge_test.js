import { domainBuilder, expect } from '../../../../test-helper.js';

describe('Unit | Domain | Models | Badge', function () {
  describe('#updateBadgeProperties', function () {
    it('should update instantiated badge with given properties', function () {
      // given
      const badge = domainBuilder.buildBadge({
        id: 1,
        altMessage: 'altMessage',
        imageUrl: '/img/badge.svg',
        message: 'original message',
        title: 'original title',
        key: 'original key',
        isCertifiable: false,
        targetProfileId: 456,
        isAlwaysVisible: false,
        complementaryCertificationBadge: null,
      });

      const updateData = {
        altMessage: 'new message',
        imageUrl: '/img/new-badge.svg',
        message: 'new message',
        title: 'new title',
        key: 'new key',
        isCertifiable: true,
        isAlwaysVisible: true,
      };

      // when
      badge.updateBadgeProperties(updateData);

      // then
      expect(badge.altMessage).to.equal('new message');
      expect(badge.imageUrl).to.equal('/img/new-badge.svg');
      expect(badge.message).to.equal('new message');
      expect(badge.title).to.equal('new title');
      expect(badge.key).to.equal('new key');
      expect(badge.isCertifiable).to.equal(true);
      expect(badge.isAlwaysVisible).to.equal(true);
    });

    it('should not update instantiated badge target profile id', function () {
      // given
      const badge = domainBuilder.buildBadge({
        targetProfileId: 456,
      });

      const updateData = {
        targetProfileId: 555,
      };

      // when
      badge.updateBadgeProperties(updateData);

      // then
      expect(badge.targetProfileId).to.equal(456);
    });
  });
});
