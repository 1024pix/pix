const { expect, domainBuilder } = require('../../../test-helper');
const PixPlusMaitreCertificationResult = require('../../../../lib/domain/models/PixPlusDroitMaitreCertificationResult');

describe('Unit | Domain | Models | PixPlusMaitreCertificationResult', function () {
  context('#static buildFrom', function () {
    it('builds a PixPlusMaitreCertificationResult acquired', async function () {
      // when
      const pixPlusResult = PixPlusMaitreCertificationResult.buildFrom({ acquired: true });

      // then
      expect(pixPlusResult).to.be.instanceOf(PixPlusMaitreCertificationResult);
      expect(pixPlusResult.status).to.equal(PixPlusMaitreCertificationResult.statuses.ACQUIRED);
    });

    it('builds a PixPlusMaitreCertificationResult rejected', async function () {
      // when
      const pixPlusResult = PixPlusMaitreCertificationResult.buildFrom({ acquired: false });

      // then
      expect(pixPlusResult).to.be.instanceOf(PixPlusMaitreCertificationResult);
      expect(pixPlusResult.status).to.equal(PixPlusMaitreCertificationResult.statuses.REJECTED);
    });
  });

  context('#static buildNotTaken', function () {
    it('builds a PixPlusMaitreCertificationResult not_taken', async function () {
      // when
      const pixPlusResult = PixPlusMaitreCertificationResult.buildNotTaken();

      // then
      expect(pixPlusResult).to.be.instanceOf(PixPlusMaitreCertificationResult);
      expect(pixPlusResult.status).to.equal(PixPlusMaitreCertificationResult.statuses.NOT_TAKEN);
    });
  });

  context('#isTaken', function () {
    it('returns true when PixPlusMaitreCertificationResult has a status acquired', async function () {
      // given
      const pixPlusResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.acquired();

      // when
      const isTaken = pixPlusResult.isTaken();

      // then
      expect(isTaken).to.be.true;
    });

    it('returns true when PixPlusMaitreCertificationResult has a status rejected', async function () {
      // given
      const pixPlusResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.rejected();

      // when
      const isTaken = pixPlusResult.isTaken();

      // then
      expect(isTaken).to.be.true;
    });

    it('returns false when PixPlusMaitreCertificationResult has a status not_taken', async function () {
      // given
      const pixPlusResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.notTaken();

      // when
      const isTaken = pixPlusResult.isTaken();

      // then
      expect(isTaken).to.be.false;
    });
  });

  context('#isAcquired', function () {
    it('returns true when PixPlusMaitreCertificationResult has a status acquired', async function () {
      // given
      const pixPlusResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.acquired();

      // when
      const isAcquired = pixPlusResult.isAcquired();

      // then
      expect(isAcquired).to.be.true;
    });

    it('returns false when PixPlusMaitreCertificationResult has a status rejected', async function () {
      // given
      const pixPlusResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.rejected();

      // when
      const isAcquired = pixPlusResult.isAcquired();

      // then
      expect(isAcquired).to.be.false;
    });

    it('returns false when PixPlusMaitreCertificationResult has a status not_taken', async function () {
      // given
      const pixPlusResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.notTaken();

      // when
      const isAcquired = pixPlusResult.isAcquired();

      // then
      expect(isAcquired).to.be.false;
    });
  });
});
