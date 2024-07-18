import { PasswordResetDemandNotFoundError } from '../../../../../src/identity-access-management/domain/errors.js';
import { ResetPasswordDemand } from '../../../../../src/identity-access-management/domain/models/ResetPasswordDemand.js';
import { resetPasswordDemandRepository } from '../../../../../src/identity-access-management/infrastructure/repositories/reset-password-demand.repository.js';
import { catchErr, databaseBuilder, expect, knex } from '../../../../test-helper.js';

describe('Integration | Identity Access Management | Infrastructure | Repository | reset-password-demand', function () {
  describe('#create', function () {
    it('creates a reset password demand', async function () {
      // given
      const email = 'someMail@example.net';
      const temporaryKey = 'someKey';

      // when
      const resetPasswordDemand = await resetPasswordDemandRepository.create({ email, temporaryKey });

      // then
      expect(resetPasswordDemand).to.be.instanceOf(ResetPasswordDemand);
      expect(resetPasswordDemand.id).to.exist;
      expect(resetPasswordDemand.email).to.equal(email);
      expect(resetPasswordDemand.temporaryKey).to.equal(temporaryKey);
      expect(resetPasswordDemand.used).to.be.false;
      expect(resetPasswordDemand.createdAt).to.be.a('Date');
      expect(resetPasswordDemand.updatedAt).to.be.a('Date');
    });
  });

  describe('#markAsBeingUsed', function () {
    const email = 'someEmail@example.net';
    const updatedAt = new Date('2013-01-01T15:00:00Z');

    beforeEach(function () {
      databaseBuilder.factory.buildResetPasswordDemand({ email, used: false, updatedAt });
      return databaseBuilder.commit();
    });

    it('marks reset password demand as used', async function () {
      // when
      await resetPasswordDemandRepository.markAsBeingUsed(email);

      // then
      const demand = await knex('reset-password-demands').select('used', 'updatedAt').where({ email }).first();
      expect(demand.used).to.be.true;
      expect(demand.updatedAt).to.be.above(updatedAt);
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

        it('returns the reset password demand', async function () {
          // when
          const demand = await resetPasswordDemandRepository.findByTemporaryKey(temporaryKey);

          // then
          expect(demand).to.be.instanceOf(ResetPasswordDemand);
          expect(demand.id).to.equal(demandId);
          expect(demand.email).to.equal(email);
          expect(demand.temporaryKey).to.equal(temporaryKey);
          expect(demand.used).to.equal(false);
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

        it('returns the password reset demand', async function () {
          // when
          const demand = await resetPasswordDemandRepository.findByUserEmail(email, temporaryKey);

          // then
          expect(demand).to.be.instanceOf(ResetPasswordDemand);
          expect(demand.id).to.equal(demandId);
          expect(demand.email).to.equal(email);
          expect(demand.temporaryKey).to.equal(temporaryKey);
          expect(demand.used).to.equal(false);
        });

        context('when case is not identical', function () {
          it('returns the password reset demand', async function () {
            // given
            const sameEmailWithAnotherCase = 'SomeMaIL@example.net';

            // when
            const demand = await resetPasswordDemandRepository.findByUserEmail(sameEmailWithAnotherCase, temporaryKey);

            // then
            expect(demand.id).to.equal(demandId);
          });
        });
      });
    });
  });

  describe('#removeAllByEmail', function () {
    const email = 'someMail@example.net';

    let demandId1;
    let demandId2;
    let demandId3;

    beforeEach(function () {
      demandId1 = databaseBuilder.factory.buildResetPasswordDemand({ email, used: false, temporaryKey: 'key1' }).id;
      demandId2 = databaseBuilder.factory.buildResetPasswordDemand({ email, used: true, temporaryKey: 'key2' }).id;
      demandId3 = databaseBuilder.factory.buildResetPasswordDemand({ used: false, temporaryKey: 'key3' }).id;
      return databaseBuilder.commit();
    });

    it('deletes the password reset demand with given email', async function () {
      // when
      await resetPasswordDemandRepository.removeAllByEmail(email);

      // then
      const demand1 = await knex('reset-password-demands').where({ id: demandId1 }).first();
      expect(demand1).to.be.undefined;
      const demand2 = await knex('reset-password-demands').where({ id: demandId2 }).first();
      expect(demand2).to.be.undefined;
      const demand3 = await knex('reset-password-demands').where({ id: demandId3 }).first();
      expect(demand3.id).to.be.equal(demandId3);
    });

    context('when case is not identical', function () {
      it('deletes the password reset demand with given email', async function () {
        // given
        const sameEmailWithAnotherCase = 'SomeMaIL@example.net';

        // when
        await resetPasswordDemandRepository.removeAllByEmail(sameEmailWithAnotherCase);

        // then
        const demand1 = await knex('reset-password-demands').where({ id: demandId1 }).first();
        expect(demand1).to.be.undefined;
        const demand2 = await knex('reset-password-demands').where({ id: demandId2 }).first();
        expect(demand2).to.be.undefined;
        const demand3 = await knex('reset-password-demands').where({ id: demandId3 }).first();
        expect(demand3.id).to.be.equal(demandId3);
      });
    });
  });
});
