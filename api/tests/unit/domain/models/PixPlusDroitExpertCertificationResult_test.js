const { expect, domainBuilder } = require('../../../test-helper');
const PixPlusExpertCertificationResult = require('../../../../lib/domain/models/PixPlusDroitExpertCertificationResult');

describe('Unit | Domain | Models | PixPlusExpertCertificationResult', function () {
  context('#static buildFrom', function () {
    it('builds a PixPlusExpertCertificationResult acquired', async function () {
      // when
      const pixPlusResult = PixPlusExpertCertificationResult.buildFrom({ acquired: true });

      // then
      expect(pixPlusResult).to.be.instanceOf(PixPlusExpertCertificationResult);
      expect(pixPlusResult.status).to.equal(PixPlusExpertCertificationResult.statuses.ACQUIRED);
    });

    it('builds a PixPlusExpertCertificationResult rejected', async function () {
      // when
      const pixPlusResult = PixPlusExpertCertificationResult.buildFrom({ acquired: false });

      // then
      expect(pixPlusResult).to.be.instanceOf(PixPlusExpertCertificationResult);
      expect(pixPlusResult.status).to.equal(PixPlusExpertCertificationResult.statuses.REJECTED);
    });
  });

  context('#static buildNotTaken', function () {
    it('builds a PixPlusExpertCertificationResult not_taken', async function () {
      // when
      const pixPlusResult = PixPlusExpertCertificationResult.buildNotTaken();

      // then
      expect(pixPlusResult).to.be.instanceOf(PixPlusExpertCertificationResult);
      expect(pixPlusResult.status).to.equal(PixPlusExpertCertificationResult.statuses.NOT_TAKEN);
    });
  });

  context('#isTaken', function () {
    it('returns true when PixPlusExpertCertificationResult has a status acquired', async function () {
      // given
      const pixPlusResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.acquired();

      // when
      const isTaken = pixPlusResult.isTaken();

      // then
      expect(isTaken).to.be.true;
    });

    it('returns true when PixPlusExpertCertificationResult has a status rejected', async function () {
      // given
      const pixPlusResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.rejected();

      // when
      const isTaken = pixPlusResult.isTaken();

      // then
      expect(isTaken).to.be.true;
    });

    it('returns false when PixPlusExpertCertificationResult has a status not_taken', async function () {
      // given
      const pixPlusResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.notTaken();

      // when
      const isTaken = pixPlusResult.isTaken();

      // then
      expect(isTaken).to.be.false;
    });
  });

  context('#isAcquired', function () {
    it('returns true when PixPlusExpertCertificationResult has a status acquired', async function () {
      // given
      const pixPlusResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.acquired();

      // when
      const isAcquired = pixPlusResult.isAcquired();

      // then
      expect(isAcquired).to.be.true;
    });

    it('returns false when PixPlusExpertCertificationResult has a status rejected', async function () {
      // given
      const pixPlusResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.rejected();

      // when
      const isAcquired = pixPlusResult.isAcquired();

      // then
      expect(isAcquired).to.be.false;
    });

    it('returns false when PixPlusExpertCertificationResult has a status not_taken', async function () {
      // given
      const pixPlusResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.notTaken();

      // when
      const isAcquired = pixPlusResult.isAcquired();

      // then
      expect(isAcquired).to.be.false;
    });
  });
});
