import { expect, domainBuilder } from '../../../test-helper.js';

describe('Unit | Domain | Models | ComplementaryCertificationBadge', function () {
  describe('#isOutdated', function () {
    it('should return true if detached at is not null', function () {
      // given
      const complementaryCertificationBadge = domainBuilder.buildComplementaryCertificationBadge({
        detachedAt: new Date(),
      });

      // when
      const result = complementaryCertificationBadge.isOutdated();

      // then
      expect(result).to.be.true;
    });

    it('should return false if detached at is null', function () {
      // given
      const complementaryCertificationBadge = domainBuilder.buildComplementaryCertificationBadge({
        detachedAt: null,
      });

      // when
      const result = complementaryCertificationBadge.isOutdated();

      // then
      expect(result).to.be.false;
    });
  });
});
