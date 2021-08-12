const { expect, knex, databaseBuilder, domainBuilder, catchErr } = require('../../../test-helper');
const accountRecoveryDemandRepository = require('../../../../lib/infrastructure/repositories/account-recovery-demand-repository');
const { NotFoundError } = require('../../../../lib/domain/errors');
const AccountRecoveryDemand = require('../../../../lib/domain/models/AccountRecoveryDemand');
const DomainTransaction = require('../../../../lib/infrastructure/DomainTransaction');

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

        it('should return the account recovery demand', async () => {
          // given
          const email = 'someMail@example.net';
          const temporaryKey = 'someTemporaryKey';
          const { id: demandId, userId, schoolingRegistrationId, createdAt } = await databaseBuilder.factory.buildAccountRecoveryDemand({ email, temporaryKey, used: true });
          await databaseBuilder.factory.buildAccountRecoveryDemand({ email, used: false });
          await databaseBuilder.commit();
          const expectedAccountRecoveryDemand = {
            id: demandId,
            userId,
            oldEmail: null,
            schoolingRegistrationId,
            newEmail: 'philipe@example.net',
            temporaryKey: 'someTemporaryKey',
            used: true,
            createdAt,
          };
          // when
          const demand = await accountRecoveryDemandRepository.findByTemporaryKey(temporaryKey);

          // then
          expect(demand).to.deep.equal(expectedAccountRecoveryDemand);
        });

      });

      context('when demand is not used yet', () => {

        it('should return the account recovery demand when demand is still valid', async () => {
          // given
          const email = 'someMail@example.net';
          const temporaryKey = 'someTemporaryKey';
          const { id: demandId, userId, schoolingRegistrationId, createdAt } = await databaseBuilder.factory.buildAccountRecoveryDemand({ email, temporaryKey, used: false });
          await databaseBuilder.factory.buildAccountRecoveryDemand({ email, used: false });
          await databaseBuilder.commit();
          const expectedAccountRecoveryDemand = {
            id: demandId,
            userId,
            oldEmail: null,
            schoolingRegistrationId,
            newEmail: 'philipe@example.net',
            temporaryKey: 'someTemporaryKey',
            used: false,
            createdAt,
          };
          // when
          const demand = await accountRecoveryDemandRepository.findByTemporaryKey(temporaryKey);

          // then
          expect(demand).to.deep.equal(expectedAccountRecoveryDemand);
        });

      });

    });

  });

  describe('#findByUserId', () => {

    context('when there is no demand', () => {

      it('should return an empty array', async () => {
        //given
        const userId = 1;

        // when
        const result = await accountRecoveryDemandRepository.findByUserId(userId);

        // then
        expect(result).to.be.an('array').that.is.empty;

      });
    });

    context('when there are several demands for several users', () => {

      it('should return only the user ones', async () => {
        // given
        await databaseBuilder.factory.buildAccountRecoveryDemand();
        const expectedUser = await databaseBuilder.factory.buildUser();
        const firstAccounRecoveryDemand = await databaseBuilder.factory.buildAccountRecoveryDemand({
          userId: expectedUser.id,
          temporaryKey: 'temporaryKey1',
          oldEmail: null,
        });
        const secondAccounRecoveryDemand = await databaseBuilder.factory.buildAccountRecoveryDemand({
          userId: expectedUser.id,
          used: true,
          temporaryKey: 'temporaryKey2',
          oldEmail: null,
        });

        await databaseBuilder.commit();

        // when
        const result = await accountRecoveryDemandRepository.findByUserId(expectedUser.id);

        // then
        expect(result).to.be.deep.equal([firstAccounRecoveryDemand, secondAccounRecoveryDemand]);

      });

    });

  });

  describe('#markAsBeingUsed', () => {

    it('should mark demand as used', async () => {
      // given
      const temporaryKey = 'temporaryKey';
      databaseBuilder.factory.buildAccountRecoveryDemand({ temporaryKey, used: false });
      await databaseBuilder.commit();

      // when
      await accountRecoveryDemandRepository.markAsBeingUsed(temporaryKey);

      // then
      const demand = await knex('account-recovery-demands')
        .select('used')
        .where({ temporaryKey })
        .first();
      expect(demand.used).to.be.true;
    });

    it('should rollback update if error occurs in transaction', async () => {
      // given
      const temporaryKey = 'temporaryKey';
      databaseBuilder.factory.buildAccountRecoveryDemand({ temporaryKey, used: false });
      await databaseBuilder.commit();

      // when
      await catchErr(async () => {
        await DomainTransaction.execute(async (domainTransaction) => {
          await accountRecoveryDemandRepository.markAsBeingUsed(temporaryKey, domainTransaction);
          throw new Error('Error occurs in transaction');
        });
      });

      // then
      const demand = await knex('account-recovery-demands')
        .select('used')
        .where({ temporaryKey })
        .first();
      expect(demand.used).to.be.false;

    });

  });

  describe('#save', () => {

    it('should persist the account recovery demand', async () => {
      // given
      const user = databaseBuilder.factory.buildUser();
      const schoolingRegistrationId = databaseBuilder.factory.buildSchoolingRegistration({ userId: user.id }).id;
      await databaseBuilder.commit();

      const userId = user.id;
      const newEmail = 'dupont@example.net';
      const oldEmail = 'eleve-dupont@example.net';
      const used = false;
      const temporaryKey = '123456789AZERTYUIO';
      const accountRecoveryDemandAttributes = {
        userId,
        schoolingRegistrationId,
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
