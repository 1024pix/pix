const { expect, domainBuilder } = require('../../../test-helper');
const CleaCertificationResult = require('../../../../lib/domain/models/CleaCertificationResult');

describe('Unit | Domain | Models | CleaCertificationResult', () => {

  context('#static buildFrom', () => {

    it('builds a CleaCertificationResult acquired', async () => {
      // when
      const cleaCertificationResult = CleaCertificationResult.buildFrom({ acquired: true });

      // then
      expect(cleaCertificationResult).to.be.instanceOf(CleaCertificationResult);
      expect(cleaCertificationResult.status).to.equal(CleaCertificationResult.cleaStatuses.ACQUIRED);
    });

    it('builds a CleaCertificationResult rejected', async () => {
      // when
      const cleaCertificationResult = CleaCertificationResult.buildFrom({ acquired: false });

      // then
      expect(cleaCertificationResult).to.be.instanceOf(CleaCertificationResult);
      expect(cleaCertificationResult.status).to.equal(CleaCertificationResult.cleaStatuses.REJECTED);
    });
  });

  context('#static buildNotTaken', () => {

    it('builds a CleaCertificationResult not_taken', async () => {
      // when
      const cleaCertificationResult = CleaCertificationResult.buildNotTaken();

      // then
      expect(cleaCertificationResult).to.be.instanceOf(CleaCertificationResult);
      expect(cleaCertificationResult.status).to.equal(CleaCertificationResult.cleaStatuses.NOT_TAKEN);
    });
  });

  context('#isTaken', () => {

    it('returns true when CleaCertificationResult has a status acquired', async () => {
      // given
      const cleaCertificationResult = domainBuilder.buildCleaCertificationResult.acquired();

      // when
      const isTaken = cleaCertificationResult.isTaken();

      // then
      expect(isTaken).to.be.true;
    });

    it('returns true when CleaCertificationResult has a status rejected', async () => {
      // given
      const cleaCertificationResult = domainBuilder.buildCleaCertificationResult.rejected();

      // when
      const isTaken = cleaCertificationResult.isTaken();

      // then
      expect(isTaken).to.be.true;
    });

    it('returns false when CleaCertificationResult has a status not_taken', async () => {
      // given
      const cleaCertificationResult = domainBuilder.buildCleaCertificationResult.notTaken();

      // when
      const isTaken = cleaCertificationResult.isTaken();

      // then
      expect(isTaken).to.be.false;
    });
  });
});
