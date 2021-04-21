const { expect } = require('../../../test-helper');
const CleaCertificationResult = require('../../../../lib/domain/models/CleaCertificationResult');

describe('Unit | Domain | Models | CleaCertificationResult', () => {

  context('#static from', () => {

    it('builds a CleaCertificationResult acquired', async () => {
      // when
      const cleaCertificationResult = CleaCertificationResult.from({ acquired: true });

      // then
      expect(cleaCertificationResult).to.be.instanceOf(CleaCertificationResult);
      expect(cleaCertificationResult.status).to.equal(CleaCertificationResult.cleaStatuses.ACQUIRED);
    });

    it('builds a CleaCertificationResult rejected', async () => {
      // when
      const cleaCertificationResult = CleaCertificationResult.from({ acquired: false });

      // then
      expect(cleaCertificationResult).to.be.instanceOf(CleaCertificationResult);
      expect(cleaCertificationResult.status).to.equal(CleaCertificationResult.cleaStatuses.REJECTED);
    });
  });

  context('#static buildNotPassed', () => {

    it('builds a CleaCertificationResult not_passed', async () => {
      // when
      const cleaCertificationResult = CleaCertificationResult.buildNotPassed();

      // then
      expect(cleaCertificationResult).to.be.instanceOf(CleaCertificationResult);
      expect(cleaCertificationResult.status).to.equal(CleaCertificationResult.cleaStatuses.NOT_PASSED);
    });
  });
});
