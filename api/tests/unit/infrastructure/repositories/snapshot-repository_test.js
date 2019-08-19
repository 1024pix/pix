const { expect, sinon } = require('../../../test-helper');
const snapshotRepository = require('../../../../lib/infrastructure/repositories/snapshot-repository');
const Snapshot = require('../../../../lib/infrastructure/data/snapshot');
const queryBuilder = require('../../../../lib/infrastructure/utils/query-builder');

describe('Unit | Repository | SnapshotRepository', function() {

  describe('#find', () => {
    let options;

    beforeEach(() => {
      sinon.stub(queryBuilder, 'find');

      options = {
        filter: { organisationId: 1 },
      };
    });

    it('should find the snapshots', async () => {
      // given
      queryBuilder.find.withArgs(Snapshot, options).resolves('ok');

      // when
      const result = await snapshotRepository.find(options);

      // then
      expect(result).to.equal('ok');
    });
  });

});
