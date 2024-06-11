import { PasswordResetDemandNotFoundError } from '../../../../../lib/domain/errors.js';
import * as resetPasswordDemandRepository from '../../../../../src/identity-access-management/infrastructure/repositories/reset-password-demand.repository.js';
import { catchErr, databaseBuilder, expect, knex } from '../../../../test-helper.js';

describe('Integration | Identity Access Management | Infrastructure | Repository | reset-password-demand', function () {
  describe('#create', function () {
    it('creates a reset password demand', async function () {
      // when
      const email = 'someMail@example.net';
      const temporaryKey = 'someKey';
      await resetPasswordDemandRepository.create({ email, temporaryKey });

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

    it('marks reset password demand as used', async function () {
      // when
      await resetPasswordDemandRepository.markAsBeingUsed(email);

      // then
      const demand = await knex('reset-password-demands').select('used').where({ email }).first();
      expect(demand.used).to.be.true;
    });

    it('is case insensitive', async function () {
      // when
      const emailWithUppercase = email.toUpperCase();
      await resetPasswordDemandRepository.markAsBeingUsed(emailWithUppercase);

      // then
      const demand = await knex('reset-password-demands').select('used').where({ email }).first();
      expect(demand.used).to.be.true;
    });

    context('when case is not identical', function () {
      it('marks reset password demand as used', async function () {
        // given
        const sameEmailWithAnotherCase = 'SomeEmaIL@example.net';

        // when
        await resetPasswordDemandRepository.markAsBeingUsed(sameEmailWithAnotherCase);

        // then
        const demand = await knex('reset-password-demands').select('used').where({ email }).first();
        expect(demand.used).to.be.true;
      });
    });
  });

  describe('#findByTemporaryKey', function () {
    context('when demand does not exist', function () {
      it('throws a PasswordResetDemandNotFoundError', async function () {
        // when
        const error = await catchErr(resetPasswordDemandRepository.findByTemporaryKey)('salut les noobs');

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

        it('throws a PasswordResetDemandNotFoundError', async function () {
          // when
          const error = await catchErr(resetPasswordDemandRepository.findByTemporaryKey)(temporaryKey);

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

        it('returns the bookshelf demand', async function () {
          // when
          const demand = await resetPasswordDemandRepository.findByTemporaryKey(temporaryKey);

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
      it('throws a PasswordResetDemandNotFoundError', async function () {
        // when
        const error = await catchErr(resetPasswordDemandRepository.findByUserEmail)(
          'bolossdu66@example.net',
          'salut les noobs',
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

        it('throws a PasswordResetDemandNotFoundError', async function () {
          // when
          const error = await catchErr(resetPasswordDemandRepository.findByUserEmail)(email, temporaryKey);

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

        it('returns the bookshelf demand', async function () {
          // when
          const demand = await resetPasswordDemandRepository.findByUserEmail(email, temporaryKey);

          // then
          expect(demand.attributes.id).to.equal(demandId);
          expect(demand.attributes.email).to.equal(email);
          expect(demand.attributes.temporaryKey).to.equal(temporaryKey);
          expect(demand.attributes.used).to.equal(false);
        });

        it('is case insensitive', async function () {
          // when
          const emailWithUppercase = email.toUpperCase();
          const demand = await resetPasswordDemandRepository.findByUserEmail(emailWithUppercase, temporaryKey);

          // then
          expect(demand.attributes.id).to.equal(demandId);
          expect(demand.attributes.email).to.equal(email);
          expect(demand.attributes.temporaryKey).to.equal(temporaryKey);
          expect(demand.attributes.used).to.equal(false);
        });

        context('when case is not identical', function () {
          it('returns the bookshelf demand', async function () {
            // given
            const sameEmailWithAnotherCase = 'SomeMaIL@example.net';

            // when
            const demand = await resetPasswordDemandRepository.findByUserEmail(sameEmailWithAnotherCase, temporaryKey);

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
