const { expect, domainBuilder } = require('../../../test-helper');
const PixPlusMaitreCertificationResult = require('../../../../lib/domain/models/PixPlusDroitMaitreCertificationResult');

describe('Unit | Domain | Models | PixPlusMaitreCertificationResult', () => {

  context('#static buildFrom', () => {

    it('builds a PixPlusMaitreCertificationResult acquired', async () => {
      // when
      const pixPlusResult = PixPlusMaitreCertificationResult.buildFrom({ acquired: true });

      // then
      expect(pixPlusResult).to.be.instanceOf(PixPlusMaitreCertificationResult);
      expect(pixPlusResult.status).to.equal(PixPlusMaitreCertificationResult.statuses.ACQUIRED);
    });

    it('builds a PixPlusMaitreCertificationResult rejected', async () => {
      // when
      const pixPlusResult = PixPlusMaitreCertificationResult.buildFrom({ acquired: false });

      // then
      expect(pixPlusResult).to.be.instanceOf(PixPlusMaitreCertificationResult);
      expect(pixPlusResult.status).to.equal(PixPlusMaitreCertificationResult.statuses.REJECTED);
    });
  });

  context('#static buildNotTaken', () => {

    it('builds a PixPlusMaitreCertificationResult not_taken', async () => {
      // when
      const pixPlusResult = PixPlusMaitreCertificationResult.buildNotTaken();

      // then
      expect(pixPlusResult).to.be.instanceOf(PixPlusMaitreCertificationResult);
      expect(pixPlusResult.status).to.equal(PixPlusMaitreCertificationResult.statuses.NOT_TAKEN);
    });
  });

  context('#isTaken', () => {

    it('returns true when PixPlusMaitreCertificationResult has a status acquired', async () => {
      // given
      const pixPlusResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.acquired();

      // when
      const isTaken = pixPlusResult.isTaken();

      // then
      expect(isTaken).to.be.true;
    });

    it('returns true when PixPlusMaitreCertificationResult has a status rejected', async () => {
      // given
      const pixPlusResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.rejected();

      // when
      const isTaken = pixPlusResult.isTaken();

      // then
      expect(isTaken).to.be.true;
    });

    it('returns false when PixPlusMaitreCertificationResult has a status not_taken', async () => {
      // given
      const pixPlusResult = domainBuilder.buildPixPlusDroitCertificationResult.maitre.notTaken();

      // when
      const isTaken = pixPlusResult.isTaken();

      // then
      expect(isTaken).to.be.false;
    });
  });
});
