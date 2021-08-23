const { expect, domainBuilder } = require('../../../test-helper');
const CleaCertificationResult = require('../../../../lib/domain/models/CleaCertificationResult');

describe('Unit | Domain | Models | CleaCertificationResult', function() {

  context('#static buildFrom', function() {

    it('builds a CleaCertificationResult acquired', function() {
      // when
      const cleaCertificationResult = CleaCertificationResult.buildFrom({ acquired: true });

      // then
      expect(cleaCertificationResult).to.be.instanceOf(CleaCertificationResult);
      expect(cleaCertificationResult.status).to.equal(CleaCertificationResult.cleaStatuses.ACQUIRED);
    });

    it('builds a CleaCertificationResult rejected', function() {
      // when
      const cleaCertificationResult = CleaCertificationResult.buildFrom({ acquired: false });

      // then
      expect(cleaCertificationResult).to.be.instanceOf(CleaCertificationResult);
      expect(cleaCertificationResult.status).to.equal(CleaCertificationResult.cleaStatuses.REJECTED);
    });
  });

  context('#static buildNotTaken', function() {

    it('builds a CleaCertificationResult not_taken', function() {
      // when
      const cleaCertificationResult = CleaCertificationResult.buildNotTaken();

      // then
      expect(cleaCertificationResult).to.be.instanceOf(CleaCertificationResult);
      expect(cleaCertificationResult.status).to.equal(CleaCertificationResult.cleaStatuses.NOT_TAKEN);
    });
  });

  context('#isTaken', function() {

    it('returns true when CleaCertificationResult has a status acquired', function() {
      // given
      const cleaCertificationResult = domainBuilder.buildCleaCertificationResult.acquired();

      // when
      const isTaken = cleaCertificationResult.isTaken();

      // then
      expect(isTaken).to.be.true;
    });

    it('returns true when CleaCertificationResult has a status rejected', function() {
      // given
      const cleaCertificationResult = domainBuilder.buildCleaCertificationResult.rejected();

      // when
      const isTaken = cleaCertificationResult.isTaken();

      // then
      expect(isTaken).to.be.true;
    });

    it('returns false when CleaCertificationResult has a status not_taken', function() {
      // given
      const cleaCertificationResult = domainBuilder.buildCleaCertificationResult.notTaken();

      // when
      const isTaken = cleaCertificationResult.isTaken();

      // then
      expect(isTaken).to.be.false;
    });
  });

  context('#isAcquired', function() {

    it('returns true when CleaCertificationResult has a status acquired', function() {
      // given
      const cleaCertificationResult = domainBuilder.buildCleaCertificationResult.acquired();

      // when
      const isAcquired = cleaCertificationResult.isAcquired();

      // then
      expect(isAcquired).to.be.true;
    });

    it('returns true when CleaCertificationResult has a status rejected', function() {
      // given
      const cleaCertificationResult = domainBuilder.buildCleaCertificationResult.rejected();

      // when
      const isAcquired = cleaCertificationResult.isAcquired();

      // then
      expect(isAcquired).to.be.false;
    });

    it('returns false when CleaCertificationResult has a status not_taken', function() {
      // given
      const cleaCertificationResult = domainBuilder.buildCleaCertificationResult.notTaken();

      // when
      const isAcquired = cleaCertificationResult.isAcquired();

      // then
      expect(isAcquired).to.be.false;
    });
  });
});
