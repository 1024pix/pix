const { expect, knex, databaseBuilder, catchErr } = require('../../../test-helper');
const accountRecoveryDemandRepository = require('../../../../lib/infrastructure/repositories/account-recovery-demand-repository');
const { NotFoundError, TooManyRows } = require('../../../../lib/domain/errors');

describe('Integration | Infrastructure | Repository | account-recovery-demand-repository', () => {

  afterEach(() => {
    return knex('account-recovery-demands').delete();
  });

  describe('#findByTemporaryKey', () => {

    context('when demand does not exist', () => {

      it('should throw a not found error', async () => {
        // when
        const error = await catchErr(accountRecoveryDemandRepository.findByTemporaryKey)('temporary key not found');

        // then
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.be.equal('No account recovery demand found');

      });
    });

    context('when demand exists', () => {
      const temporaryKey = 'someTemporaryKey';

      context('when demand has been used already', () => {

        beforeEach(() => {
          databaseBuilder.factory.buildAccountRecoveryDemand({ temporaryKey, used: true });
          return databaseBuilder.commit();
        });

        it('should throw a not found recovery demand', async () => {
          // when
          const error = await catchErr(accountRecoveryDemandRepository.findByTemporaryKey)(temporaryKey);

          // then
          expect(error).to.be.instanceOf(NotFoundError);
          expect(error.message).to.be.equal('No account recovery demand found');

        });

      });

      context('when demand is unused yet', () => {
        const email = 'someMail@example.net';
        let demandId;

        beforeEach(() => {
          demandId = databaseBuilder.factory.buildAccountRecoveryDemand({ email, temporaryKey, used: false }).id;
          databaseBuilder.factory.buildAccountRecoveryDemand({ email, used: false });
          return databaseBuilder.commit();
        });

        it('should return the account recovery demand', async () => {
          // when
          const demand = await accountRecoveryDemandRepository.findByTemporaryKey(temporaryKey);

          // then
          expect(demand.length).to.equal(1);
          expect(demand[0].id).to.equal(demandId);
          expect(demand[0].temporaryKey).to.equal(temporaryKey);
          expect(demand[0].used).to.equal(false);
        });

      });

      context('when multiple demands found for the same temporary key', () => {
        const email = 'someMail@example.net';

        beforeEach(() => {
          databaseBuilder.factory.buildAccountRecoveryDemand({ email, temporaryKey, used: false }).id;
          databaseBuilder.factory.buildAccountRecoveryDemand({ email, temporaryKey, used: false });
          return databaseBuilder.commit();
        });

        it('should return the account recovery demand', async () => {
          // when
          const error = await catchErr(accountRecoveryDemandRepository.findByTemporaryKey)(temporaryKey);

          // then
          expect(error).to.be.instanceOf(TooManyRows);
          expect(error.message).to.be.equal('Multiple demands found for the same temporary key');
        });

      });

    });

  });

});
