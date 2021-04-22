const { expect, domainBuilder } = require('../../../test-helper');
const PixPlusExpertCertificationResult = require('../../../../lib/domain/models/PixPlusDroitExpertCertificationResult');

describe('Unit | Domain | Models | PixPlusExpertCertificationResult', () => {

  context('#static buildFrom', () => {

    it('builds a PixPlusExpertCertificationResult acquired', async () => {
      // when
      const pixPlusResult = PixPlusExpertCertificationResult.buildFrom({ acquired: true });

      // then
      expect(pixPlusResult).to.be.instanceOf(PixPlusExpertCertificationResult);
      expect(pixPlusResult.status).to.equal(PixPlusExpertCertificationResult.statuses.ACQUIRED);
    });

    it('builds a PixPlusExpertCertificationResult rejected', async () => {
      // when
      const pixPlusResult = PixPlusExpertCertificationResult.buildFrom({ acquired: false });

      // then
      expect(pixPlusResult).to.be.instanceOf(PixPlusExpertCertificationResult);
      expect(pixPlusResult.status).to.equal(PixPlusExpertCertificationResult.statuses.REJECTED);
    });
  });

  context('#static buildNotTaken', () => {

    it('builds a PixPlusExpertCertificationResult not_taken', async () => {
      // when
      const pixPlusResult = PixPlusExpertCertificationResult.buildNotTaken();

      // then
      expect(pixPlusResult).to.be.instanceOf(PixPlusExpertCertificationResult);
      expect(pixPlusResult.status).to.equal(PixPlusExpertCertificationResult.statuses.NOT_TAKEN);
    });
  });

  context('#isTaken', () => {

    it('returns true when PixPlusExpertCertificationResult has a status acquired', async () => {
      // given
      const pixPlusResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.acquired();

      // when
      const isTaken = pixPlusResult.isTaken();

      // then
      expect(isTaken).to.be.true;
    });

    it('returns true when PixPlusExpertCertificationResult has a status rejected', async () => {
      // given
      const pixPlusResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.rejected();

      // when
      const isTaken = pixPlusResult.isTaken();

      // then
      expect(isTaken).to.be.true;
    });

    it('returns false when PixPlusExpertCertificationResult has a status not_taken', async () => {
      // given
      const pixPlusResult = domainBuilder.buildPixPlusDroitCertificationResult.expert.notTaken();

      // when
      const isTaken = pixPlusResult.isTaken();

      // then
      expect(isTaken).to.be.false;
    });
  });
});
