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
      const email = 'someMail@example.net';
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
    const email = 'someEmail@example.net';

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

    it('should be case insensitive', async () => {
      // when
      const emailWithUppercase = email.toUpperCase();
      await resetPasswordDemandsRepository.markAsBeingUsed(emailWithUppercase);

      // then
      const demand = await knex('reset-password-demands')
        .select('used')
        .where({ email })
        .first();
      expect(demand.used).to.be.true;
    });

    context('when case is not identical', () => {
      it('should mark demand as used', async () => {
        // given
        const sameEmailWithAnotherCase = 'SomeEmaIL@example.net';

        // when
        await resetPasswordDemandsRepository.markAsBeingUsed(sameEmailWithAnotherCase);

        // then
        const demand = await knex('reset-password-demands')
          .select('used')
          .where({ email })
          .first();
        expect(demand.used).to.be.true;
      });
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
        const email = 'someMail@example.net';
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
      const email = 'someMail@example.net';

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

        it('should be case insensitive', async () => {
          // when
          const emailWithUppercase = email.toUpperCase();
          const demand = await resetPasswordDemandsRepository.findByUserEmail(emailWithUppercase, temporaryKey);

          // then
          expect(demand.attributes.id).to.equal(demandId);
          expect(demand.attributes.email).to.equal(email);
          expect(demand.attributes.temporaryKey).to.equal(temporaryKey);
          expect(demand.attributes.used).to.equal(false);
        });

        context('when case is not identical', () => {
          it('should return the bookshelf demand', async () => {
            // given
            const sameEmailWithAnotherCase = 'SomeMaIL@example.net';

            // when
            const demand = await resetPasswordDemandsRepository.findByUserEmail(sameEmailWithAnotherCase, temporaryKey);

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

});
