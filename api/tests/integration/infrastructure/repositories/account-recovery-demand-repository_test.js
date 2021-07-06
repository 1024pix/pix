const { expect, knex, databaseBuilder, domainBuilder, catchErr } = require('../../../test-helper');
const accountRecoveryDemandRepository = require('../../../../lib/infrastructure/repositories/account-recovery-demand-repository');
const {
  NotFoundError,
  TooManyRows,
  AccountRecoveryDemandExpired,
} = require('../../../../lib/domain/errors');
const AccountRecoveryDemand = require('../../../../lib/domain/models/AccountRecoveryDemand');

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

      context('when demand has been used already', () => {

        it('should throw a not found recovery demand', async () => {
          // given
          const temporaryKey = 'RDFGGHFFDZZ';
          databaseBuilder.factory.buildAccountRecoveryDemand({ temporaryKey, used: true });
          await databaseBuilder.commit();

          // when
          const error = await catchErr(accountRecoveryDemandRepository.findByTemporaryKey)(temporaryKey);

          // then
          expect(error).to.be.instanceOf(NotFoundError);
          expect(error.message).to.be.equal('No account recovery demand found');

        });

      });

      context('when demand is unused yet', () => {

        it('should return the account recovery demand when temporary key not expired', async () => {
          // given
          const email = 'someMail@example.net';
          const temporaryKey = 'someTemporaryKey';
          const demandId = databaseBuilder.factory.buildAccountRecoveryDemand({ email, temporaryKey, used: false }).id;
          databaseBuilder.factory.buildAccountRecoveryDemand({ email, used: false });
          await databaseBuilder.commit();

          // when
          const demand = await accountRecoveryDemandRepository.findByTemporaryKey(temporaryKey);

          // then
          expect(demand.id).to.equal(demandId);
          expect(demand.temporaryKey).to.equal(temporaryKey);
          expect(demand.used).to.equal(false);
        });
      });

      context('when multiple demands found for the same temporary key', () => {

        it('should throw too many rows error', async () => {
          // given
          const email = 'someMail@example.net';
          const temporaryKey = 'ERTFFAZSDFR';
          databaseBuilder.factory.buildAccountRecoveryDemand({ email, temporaryKey, used: false }).id;
          databaseBuilder.factory.buildAccountRecoveryDemand({ email, temporaryKey, used: false });
          await databaseBuilder.commit();

          // when
          const error = await catchErr(accountRecoveryDemandRepository.findByTemporaryKey)(temporaryKey);

          // then
          expect(error).to.be.instanceOf(TooManyRows);
          expect(error.message).to.be.equal('Multiple demands found for the same temporary key');
        });

      });

      context('when demand expired a day ago', () => {

        it('should throw Account Recovery Demand Expired ', async () => {
          // given
          const email = 'someMail@example.net';
          const temporaryKey = 'someTemporaryKey';
          const createdAtExpiredOneDayAgo = new Date();
          createdAtExpiredOneDayAgo.setDate(createdAtExpiredOneDayAgo.getDate() - 1);

          databaseBuilder.factory.buildAccountRecoveryDemand({ email, temporaryKey, used: false, createdAt: createdAtExpiredOneDayAgo }).id;
          databaseBuilder.factory.buildAccountRecoveryDemand({ email, used: false });
          await databaseBuilder.commit();

          // when
          const error = await catchErr(accountRecoveryDemandRepository.findByTemporaryKey)(temporaryKey);

          // then
          expect(error).to.be.instanceOf(AccountRecoveryDemandExpired);
        });

      });

    });

  });

  describe('#save', () => {

    it('should insert the account recovery demand in db', async () => {
      // given
      const userId = 123;
      const newEmail = 'dupont@example.net';
      const oldEmail = 'eleve-dupont@example.net';
      const used = false;
      const temporaryKey = '123456789AZERTYUIO';
      const accountRecoveryDemandAttributes = {
        userId,
        newEmail,
        oldEmail,
        used,
        temporaryKey,
      };
      const accountRecoveryDemand = domainBuilder.buildAccountRecoveryDemand(accountRecoveryDemandAttributes);

      // when
      const result = await accountRecoveryDemandRepository.save(accountRecoveryDemand);

      // then
      const accountRecoveryDemands = await knex('account-recovery-demands').select();
      expect(accountRecoveryDemands).to.have.length(1);
      expect(result).to.be.instanceOf(AccountRecoveryDemand);
      expect(result.userId).to.equal(userId);
      expect(result.newEmail).to.equal(newEmail);
      expect(result.used).to.equal(used);
      expect(result.temporaryKey).to.equal(temporaryKey);
    });

    it('should throw an error if no row is saved', async () => {
      // given
      const notValidAccountRecoveryDemand = 123;

      // when
      const error = await catchErr(accountRecoveryDemandRepository.save)(notValidAccountRecoveryDemand);

      // then
      expect(error).to.be.instanceOf(Error);
    });
  });

});
