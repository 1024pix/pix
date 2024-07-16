import { Badge } from '../../../../../src/evaluation/domain/models/Badge.js';
import { domainBuilder, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Domain | Models | Badge', function () {
  const now = new Date();
  let clock;

  beforeEach(async function () {
    clock = sinon.useFakeTimers(now);
  });

  afterEach(async function () {
    clock.restore();
  });

  describe('#updateBadgeProperties', function () {
    it('should update instantiated badge with given properties', function () {
      // given
      const badge = domainBuilder.buildBadge({
        id: 1,
        altMessage: 'altMessage',
        imageUrl: '/img/badge.svg',
        message: 'original message',
        title: 'original title',
        key: 'originalKey',
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
        key: 'newKey',
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
      expect(badge.key).to.equal('newKey');
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

  describe('#clone', function () {
    it('should clone badge with updated targetProfileId and key', function () {
      // given

      const badge = new Badge({
        id: undefined,
        altMessage: 'altMessage',
        imageUrl: '/img/badge.svg',
        message: 'original message',
        title: 'original title',
        key: 'originalKey',
        isCertifiable: false,
        targetProfileId: 456,
        isAlwaysVisible: false,
        complementaryCertificationBadge: null,
      });
      const newTargetProfileId = 789;

      // when
      const clonedBadge = badge.clone(newTargetProfileId);

      // then
      expect(clonedBadge).to.deep.equal({
        ...badge,
        key: `${now.getTime()}_${badge.key}`,
        targetProfileId: newTargetProfileId,
      });
    });
  });
});
