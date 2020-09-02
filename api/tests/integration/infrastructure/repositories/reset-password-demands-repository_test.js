const { expect, knex, databaseBuilder, catchErr } = require('../../../test-helper');
const resetPasswordDemandsRepository = require('../../../../lib/infrastructure/repositories/reset-password-demands-repository');
const { PasswordResetDemandNotFoundError } = require('../../../../lib/domain/errors');

describe('Integration | Infrastructure | Repository | reset-password-demands-repository', () => {

  afterEach(() => {
    return knex('reset-password-demands').delete();
  });

  describe('#create', () => {

    it('should create a password reset demand', async () => {
      // when
      const email = 'someMail';
      const temporaryKey = 'someKey';
      await resetPasswordDemandsRepository.create({ email, temporaryKey });

      // then
      const demand = await knex('reset-password-demands')
        .select('email', 'temporaryKey', 'used')
        .first();
      expect(demand.email).to.equal(email);
      expect(demand.temporaryKey).to.equal(temporaryKey);
      expect(demand.used).to.be.false;
    });
  });

  describe('#markAsBeingUsed', () => {
    const email = 'someEmail';

    beforeEach(() => {
      databaseBuilder.factory.buildResetPasswordDemand({ email, used: false });
      return databaseBuilder.commit();
    });

    it('should mark demand as used', async () => {
      // when
      await resetPasswordDemandsRepository.markAsBeingUsed(email);

      // then
      const demand = await knex('reset-password-demands')
        .select('used')
        .where({ email })
        .first();
      expect(demand.used).to.be.true;
    });
  });

  describe('#findByTemporaryKey', () => {

    context('when demand does not exist', () => {

      it('should throw a PasswordResetDemandNotFoundError', async () => {
        // when
        const error = await catchErr(resetPasswordDemandsRepository.findByTemporaryKey)('salut les noobs');

        // then
        expect(error).to.be.instanceOf(PasswordResetDemandNotFoundError);
      });
    });

    context('when demand exists', () => {
      const temporaryKey = 'someTemporaryKey';

      context('when demand has been used already', () => {

        beforeEach(() => {
          databaseBuilder.factory.buildResetPasswordDemand({ temporaryKey, used: true });
          return databaseBuilder.commit();
        });

        it('should throw a PasswordResetDemandNotFoundError', async () => {
          // when
          const error = await catchErr(resetPasswordDemandsRepository.findByTemporaryKey)(temporaryKey);

          // then
          expect(error).to.be.instanceOf(PasswordResetDemandNotFoundError);
        });

      });

      context('when demand is still up', () => {
        const email = 'someMail';
        let demandId;

        beforeEach(() => {
          demandId = databaseBuilder.factory.buildResetPasswordDemand({ email, temporaryKey, used: false }).id;
          databaseBuilder.factory.buildResetPasswordDemand({ email, used: false });
          return databaseBuilder.commit();
        });

        it('should return the bookshelf demand', async () => {
          // when
          const demand = await resetPasswordDemandsRepository.findByTemporaryKey(temporaryKey);

          // then
          expect(demand.attributes.id).to.equal(demandId);
          expect(demand.attributes.email).to.equal(email);
          expect(demand.attributes.temporaryKey).to.equal(temporaryKey);
          expect(demand.attributes.used).to.equal(false);
        });

      });
    });
  });

  describe('#findByUserEmail', () => {

    context('when demand does not exist', () => {

      it('should throw a PasswordResetDemandNotFoundError', async () => {
        // when
        const error = await catchErr(resetPasswordDemandsRepository.findByUserEmail)('bolossdu66@example.net', 'salut les noobs');

        // then
        expect(error).to.be.instanceOf(PasswordResetDemandNotFoundError);
      });
    });

    context('when demand exists', () => {
      const temporaryKey = 'someTemporaryKey';
      const email = 'someMail';

      context('when demand has been used already', () => {

        beforeEach(() => {
          databaseBuilder.factory.buildResetPasswordDemand({ email, temporaryKey, used: true });
          return databaseBuilder.commit();
        });

        it('should throw a PasswordResetDemandNotFoundError', async () => {
          // when
          const error = await catchErr(resetPasswordDemandsRepository.findByUserEmail)(email, temporaryKey);

          // then
          expect(error).to.be.instanceOf(PasswordResetDemandNotFoundError);
        });

      });

      context('when demand is still up', () => {
        let demandId;

        beforeEach(() => {
          demandId = databaseBuilder.factory.buildResetPasswordDemand({ email, temporaryKey, used: false }).id;
          databaseBuilder.factory.buildResetPasswordDemand({ email, used: false });
          databaseBuilder.factory.buildResetPasswordDemand({ temporaryKey, used: false });
          return databaseBuilder.commit();
        });

        it('should return the bookshelf demand', async () => {
          // when
          const demand = await resetPasswordDemandsRepository.findByUserEmail(email, temporaryKey);

          // then
          expect(demand.attributes.id).to.equal(demandId);
          expect(demand.attributes.email).to.equal(email);
          expect(demand.attributes.temporaryKey).to.equal(temporaryKey);
          expect(demand.attributes.used).to.equal(false);
        });

      });
    });
  });

});
