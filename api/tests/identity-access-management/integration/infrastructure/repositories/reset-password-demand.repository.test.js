import { PasswordResetDemandNotFoundError } from '../../../../../src/identity-access-management/domain/errors.js';
import { ResetPasswordDemand } from '../../../../../src/identity-access-management/domain/models/ResetPasswordDemand.js';
import { resetPasswordDemandRepository } from '../../../../../src/identity-access-management/infrastructure/repositories/reset-password-demand.repository.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

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

  describe('#markAllAsUsedByEmail', function () {
    const email = 'user1.markAllAsUsedByEmail@example.net';
    const user2Email = 'user2.markAllAsUsedByEmail@example.net';
    const oldPasswordResetDemandTemporaryKey = 'zzz123';
    const oldPasswordResetDemandUpdatedAt = new Date('2013-01-01T15:00:00Z');
    const currentPasswordResetDemandTemporaryKey = 'aha456';
    const currentPasswordResetDemandUpdatedAt = new Date('2023-01-01T17:00:00Z');
    let user2PasswordResetDemandId;

    beforeEach(function () {
      databaseBuilder.factory.buildResetPasswordDemand({
        email,
        used: true,
        temporaryKey: oldPasswordResetDemandTemporaryKey,
        updatedAt: oldPasswordResetDemandUpdatedAt,
      });
      databaseBuilder.factory.buildResetPasswordDemand({
        email,
        used: false,
        temporaryKey: currentPasswordResetDemandTemporaryKey,
        updatedAt: currentPasswordResetDemandUpdatedAt,
      });
      user2PasswordResetDemandId = databaseBuilder.factory.buildResetPasswordDemand({
        email: user2Email,
        used: false,
      }).id;
      return databaseBuilder.commit();
    });

    it('marks only user’s unused reset password demands as used', async function () {
      // when
      await resetPasswordDemandRepository.markAllAsUsedByEmail(email);

      // then
      const oldPasswordResetDemand = await knex('reset-password-demands')
        .select('used', 'updatedAt')
        .where({ temporaryKey: oldPasswordResetDemandTemporaryKey })
        .first();
      expect(oldPasswordResetDemand.updatedAt).to.deep.equal(oldPasswordResetDemandUpdatedAt);

      const currentPasswordResetDemand = await knex('reset-password-demands')
        .select('used', 'updatedAt')
        .where({ temporaryKey: currentPasswordResetDemandTemporaryKey })
        .first();
      expect(currentPasswordResetDemand.used).to.be.true;
      expect(currentPasswordResetDemand.updatedAt).to.be.above(currentPasswordResetDemandUpdatedAt);

      const user2PasswordResetDemand = await knex('reset-password-demands')
        .select('used')
        .where({ id: user2PasswordResetDemandId })
        .first();
      expect(user2PasswordResetDemand.used).to.be.false;
    });

    it('is case insensitive', async function () {
      // when
      const emailWithUppercase = email.toUpperCase();
      await resetPasswordDemandRepository.markAllAsUsedByEmail(emailWithUppercase);

      // then
      const demand = await knex('reset-password-demands').select('used').where({ email }).first();
      expect(demand.used).to.be.true;
    });

    context('when case is not identical', function () {
      it('marks reset password demand as used', async function () {
        // given
        const sameEmailWithAnotherCase = 'SomeEmaIL@example.net';

        // when
        await resetPasswordDemandRepository.markAllAsUsedByEmail(sameEmailWithAnotherCase);

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
