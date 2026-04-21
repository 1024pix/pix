import * as replicationRepository from '../../../../../src/maddo/infrastructure/repositories/replication-repository.js';

describe('Maddo | Infrastructure | Repositories | Unit | replication', function () {
  describe('#getByName', function () {
    it('should return replication object', function () {
      // given
      const replications = [{ name: 'replication1' }, { name: 'replication2' }, { name: 'replication3' }];

      // when
      const replication = replicationRepository.getByName('replication2', { replications });

      // then
      expect(replication).to.equal(replications[1]);
    });

    describe('when name is unknown', function () {
      it('should return undefined', function () {
        // given
        const replications = [{ name: 'replication1' }, { name: 'replication2' }, { name: 'replication3' }];

        // when
        const replication = replicationRepository.getByName('unknown', { replications });

        // then
        expect(replication).to.be.undefined;
      });
    });
  });
});
