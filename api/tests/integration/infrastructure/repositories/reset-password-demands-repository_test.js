import { expect, knex, databaseBuilder, catchErr } from '../../../test-helper';
import resetPasswordDemandsRepository from '../../../../lib/infrastructure/repositories/reset-password-demands-repository';
import { PasswordResetDemandNotFoundError } from '../../../../lib/domain/errors';

describe('Integration | Infrastructure | Repository | reset-password-demands-repository', function () {
  afterEach(function () {
    return knex('reset-password-demands').delete();
  });

  describe('#create', function () {
    it('should create a password reset demand', async function () {
      // when
      const email = 'someMail@example.net';
      const temporaryKey = 'someKey';
      await resetPasswordDemandsRepository.create({ email, temporaryKey });

      // then
      const demand = await knex('reset-password-demands').select('email', 'temporaryKey', 'used').first();
      expect(demand.email).to.equal(email);
      expect(demand.temporaryKey).to.equal(temporaryKey);
      expect(demand.used).to.be.false;
    });
  });

  describe('#markAsBeingUsed', function () {
    const email = 'someEmail@example.net';

    beforeEach(function () {
      databaseBuilder.factory.buildResetPasswordDemand({ email, used: false });
      return databaseBuilder.commit();
    });

    it('should mark demand as used', async function () {
      // when
      await resetPasswordDemandsRepository.markAsBeingUsed(email);

      // then
      const demand = await knex('reset-password-demands').select('used').where({ email }).first();
      expect(demand.used).to.be.true;
    });

    it('should be case insensitive', async function () {
      // when
      const emailWithUppercase = email.toUpperCase();
      await resetPasswordDemandsRepository.markAsBeingUsed(emailWithUppercase);

      // then
      const demand = await knex('reset-password-demands').select('used').where({ email }).first();
      expect(demand.used).to.be.true;
    });

    context('when case is not identical', function () {
      it('should mark demand as used', async function () {
        // given
        const sameEmailWithAnotherCase = 'SomeEmaIL@example.net';

        // when
        await resetPasswordDemandsRepository.markAsBeingUsed(sameEmailWithAnotherCase);

        // then
        const demand = await knex('reset-password-demands').select('used').where({ email }).first();
        expect(demand.used).to.be.true;
      });
    });
  });

  describe('#findByTemporaryKey', function () {
    context('when demand does not exist', function () {
      it('should throw a PasswordResetDemandNotFoundError', async function () {
        // when
        const error = await catchErr(resetPasswordDemandsRepository.findByTemporaryKey)('salut les noobs');

        // then
        expect(error).to.be.instanceOf(PasswordResetDemandNotFoundError);
      });
    });

    context('when demand exists', function () {
      const temporaryKey = 'someTemporaryKey';

      context('when demand has been used already', function () {
        beforeEach(function () {
          databaseBuilder.factory.buildResetPasswordDemand({ temporaryKey, used: true });
          return databaseBuilder.commit();
        });

        it('should throw a PasswordResetDemandNotFoundError', async function () {
          // when
          const error = await catchErr(resetPasswordDemandsRepository.findByTemporaryKey)(temporaryKey);

          // then
          expect(error).to.be.instanceOf(PasswordResetDemandNotFoundError);
        });
      });

      context('when demand is still up', function () {
        const email = 'someMail@example.net';
        let demandId;

        beforeEach(function () {
          demandId = databaseBuilder.factory.buildResetPasswordDemand({ email, temporaryKey, used: false }).id;
          databaseBuilder.factory.buildResetPasswordDemand({ email, used: false });
          return databaseBuilder.commit();
        });

        it('should return the bookshelf demand', async function () {
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

  describe('#findByUserEmail', function () {
    context('when demand does not exist', function () {
      it('should throw a PasswordResetDemandNotFoundError', async function () {
        // when
        const error = await catchErr(resetPasswordDemandsRepository.findByUserEmail)(
          'bolossdu66@example.net',
          'salut les noobs'
        );

        // then
        expect(error).to.be.instanceOf(PasswordResetDemandNotFoundError);
      });
    });

    context('when demand exists', function () {
      const temporaryKey = 'someTemporaryKey';
      const email = 'someMail@example.net';

      context('when demand has been used already', function () {
        beforeEach(function () {
          databaseBuilder.factory.buildResetPasswordDemand({ email, temporaryKey, used: true });
          return databaseBuilder.commit();
        });

        it('should throw a PasswordResetDemandNotFoundError', async function () {
          // when
          const error = await catchErr(resetPasswordDemandsRepository.findByUserEmail)(email, temporaryKey);

          // then
          expect(error).to.be.instanceOf(PasswordResetDemandNotFoundError);
        });
      });

      context('when demand is still up', function () {
        let demandId;

        beforeEach(function () {
          demandId = databaseBuilder.factory.buildResetPasswordDemand({ email, temporaryKey, used: false }).id;
          databaseBuilder.factory.buildResetPasswordDemand({ email, used: false });
          databaseBuilder.factory.buildResetPasswordDemand({ temporaryKey, used: false });
          return databaseBuilder.commit();
        });

        it('should return the bookshelf demand', async function () {
          // when
          const demand = await resetPasswordDemandsRepository.findByUserEmail(email, temporaryKey);

          // then
          expect(demand.attributes.id).to.equal(demandId);
          expect(demand.attributes.email).to.equal(email);
          expect(demand.attributes.temporaryKey).to.equal(temporaryKey);
          expect(demand.attributes.used).to.equal(false);
        });

        it('should be case insensitive', async function () {
          // when
          const emailWithUppercase = email.toUpperCase();
          const demand = await resetPasswordDemandsRepository.findByUserEmail(emailWithUppercase, temporaryKey);

          // then
          expect(demand.attributes.id).to.equal(demandId);
          expect(demand.attributes.email).to.equal(email);
          expect(demand.attributes.temporaryKey).to.equal(temporaryKey);
          expect(demand.attributes.used).to.equal(false);
        });

        context('when case is not identical', function () {
          it('should return the bookshelf demand', async function () {
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
