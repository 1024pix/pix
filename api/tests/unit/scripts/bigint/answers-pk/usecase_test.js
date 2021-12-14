const { expect, sinon, catchErr } = require('../../../../test-helper');
const { migrate, externalSettings } = require('../../../../../scripts/bigint/answers-pk/usecase');
externalSettings.POLLING_INTERVAL_SECONDS = 0;

describe('Unit | Use-case | usecase.js', function () {
  describe('#migrate', function () {
    let dataRepository;
    let settingsRepository;
    beforeEach(function () {
      dataRepository = {
        copyIntIdToBigintId: sinon.stub(),
      };
      settingsRepository = {
        isScheduled: sinon.stub(),
        pauseInterval: sinon.stub(),
        migrationInterval: sinon.stub(),
        markRowsAsMigrated: sinon.stub(),
        chunkSize: sinon.stub(),
      };
    });
    it('should throw when migration is not scheduled', async function () {
      // given
      settingsRepository.isScheduled.resolves(false);

      // when
      const error = await catchErr(migrate)(settingsRepository, dataRepository);

      // then
      expect(error.message).to.equal('Migration is not scheduled, exiting..');
    });

    it('should throw when there are no rows to migrate', async function () {
      // given
      settingsRepository.isScheduled.resolves(true);
      settingsRepository.migrationInterval.resolves({ startAt: 3, endAt: 3 });

      // when
      const error = await catchErr(migrate)(settingsRepository, dataRepository);

      // then
      expect(error.message).to.deep.equal('All rows have already been migrated, exiting..');
    });

    it('should stop after batch if it has been unscheduled meanwhile', async function () {
      // given
      settingsRepository.isScheduled.onFirstCall().returns(true);
      settingsRepository.isScheduled.onSecondCall().returns(false);
      settingsRepository.isScheduled.onThirdCall().throws();
      settingsRepository.migrationInterval.resolves({ startAt: 1, endAt: 3 });
      settingsRepository.chunkSize.resolves(2);
      settingsRepository.pauseInterval.resolves(0);

      // when
      await catchErr(migrate)(settingsRepository, dataRepository);

      // then
      expect(dataRepository.copyIntIdToBigintId).to.have.been.calledOnceWithExactly({ startAt: 1, endAt: 2 });
    });

    it('should update rows using different batches size if batch size has been modified between batches', async function () {
      // given
      settingsRepository.isScheduled.resolves(true);
      settingsRepository.migrationInterval.resolves({ startAt: 1, endAt: 11 });
      settingsRepository.chunkSize.onFirstCall().returns(2);
      settingsRepository.chunkSize.onSecondCall().returns(4);
      settingsRepository.chunkSize.onThirdCall().returns(6);
      settingsRepository.pauseInterval.resolves(0);

      // when
      await migrate(settingsRepository, dataRepository);

      // then
      expect(dataRepository.copyIntIdToBigintId).to.have.been.calledThrice;
      expect(dataRepository.copyIntIdToBigintId.getCall(0).args[0]).to.deep.equal({ startAt: 1, endAt: 2 });
      expect(dataRepository.copyIntIdToBigintId.getCall(1).args[0]).to.deep.equal({ startAt: 3, endAt: 6 });
      expect(dataRepository.copyIntIdToBigintId.getCall(2).args[0]).to.deep.equal({ startAt: 7, endAt: 11 });
    });

    it('should update at most as many rows as batch size', async function () {
      // given
      settingsRepository.isScheduled.resolves(true);
      settingsRepository.migrationInterval.resolves({ startAt: 1, endAt: 3 });
      settingsRepository.chunkSize.resolves(2);
      settingsRepository.pauseInterval.resolves(0);

      // when
      await migrate(settingsRepository, dataRepository);

      // then
      expect(dataRepository.copyIntIdToBigintId.callCount).to.equal(2);
      expect(dataRepository.copyIntIdToBigintId.getCall(0).args[0]).to.deep.equal({ startAt: 1, endAt: 2 });
      expect(dataRepository.copyIntIdToBigintId.getCall(1).args[0]).to.deep.equal({ startAt: 3, endAt: 3 });
    });

    it('should pause dynamically between batches', async function () {
      // given
      settingsRepository.isScheduled.resolves(true);
      settingsRepository.migrationInterval.resolves({ startAt: 1, endAt: 5 });
      settingsRepository.chunkSize.resolves(2);
      settingsRepository.pauseInterval.onFirstCall().resolves(3);
      settingsRepository.pauseInterval.onSecondCall().resolves(5);
      settingsRepository.pauseInterval.onThirdCall().resolves(10);

      // when
      const start = new Date();
      await migrate(settingsRepository, dataRepository);
      const end = new Date();

      // then
      expect(settingsRepository.pauseInterval).to.have.been.calledThrice;

      const elapsed = end - start;
      expect(elapsed).to.be.greaterThan(3 + 5 + 10);
    });

    it('should save last migrated rows index', async function () {
      // given
      settingsRepository.isScheduled.resolves(true);
      settingsRepository.migrationInterval.resolves({ startAt: 3, endAt: 6 });
      settingsRepository.chunkSize.resolves(2);
      settingsRepository.markRowsAsMigrated.resolves({});
      settingsRepository.pauseInterval.resolves(0);

      // when
      await migrate(settingsRepository, dataRepository);

      // then
      expect(settingsRepository.markRowsAsMigrated.callCount).to.equal(2);
      expect(settingsRepository.markRowsAsMigrated.getCall(0).args[0]).to.equal(4);
      expect(settingsRepository.markRowsAsMigrated.getCall(1).args[0]).to.equal(6);
    });

    it('should not migrate rows inserted by the trigger', async function () {
      // given
      settingsRepository.isScheduled.resolves(true);
      settingsRepository.migrationInterval.resolves({ startAt: 1, endAt: 2 });
      settingsRepository.chunkSize.resolves(2);
      settingsRepository.pauseInterval.resolves(0);

      // when
      await migrate(settingsRepository, dataRepository);

      // then
      expect(dataRepository.copyIntIdToBigintId).to.have.been.calledOnceWithExactly({ startAt: 1, endAt: 2 });
    });

    it('should not migrate already migrated rows', async function () {
      // given
      settingsRepository.isScheduled.resolves(true);
      settingsRepository.migrationInterval.resolves({ startAt: 3, endAt: 4 });
      settingsRepository.chunkSize.resolves(2);
      settingsRepository.pauseInterval.resolves(0);

      // when
      await migrate(settingsRepository, dataRepository);

      // then
      expect(dataRepository.copyIntIdToBigintId.callCount).to.equal(1);
      expect(dataRepository.copyIntIdToBigintId.getCall(0).args[0]).to.deep.equal({ startAt: 3, endAt: 4 });
    });
  });
});
