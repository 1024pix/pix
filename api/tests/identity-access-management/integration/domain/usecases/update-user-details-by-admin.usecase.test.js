import sinon from 'sinon';

import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import {
  AlreadyRegisteredEmailAndUsernameError,
  AlreadyRegisteredEmailError,
  AlreadyRegisteredUsernameError,
} from '../../../../../src/shared/domain/errors.js';
import { AuditLoggingJob } from '../../../../../src/shared/domain/models/jobs/AuditLoggingJob.js';
import { roles } from '../../../../../src/shared/domain/models/Membership.js';
import { EMPTY_CORRELATION_INFO } from '../../../../../src/shared/infrastructure/execution-context-manager.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Identity Access Management | Domain | UseCase | updateUserDetailsByAdmin', function () {
  let userId;
  let updatedByAdminId;

  let clock;
  const now = new Date('2024-12-25');

  beforeEach(async function () {
    userId = databaseBuilder.factory.buildUser({ email: 'email@example.net' }).id;
    updatedByAdminId = databaseBuilder.factory.buildUser.withRole({
      email: 'admin@example.net',
      role: roles.SUPER_ADMIN,
    }).id;
    databaseBuilder.factory.buildUser({ email: 'alreadyexist@example.net' });
    await databaseBuilder.commit();

    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(async function () {
    clock.restore();
  });

  it('updates user email, firstname and lastname', async function () {
    // given
    const userToUpdate = {
      email: 'partial@example.net',
      firstName: 'firstName',
      lastName: 'lastName',
    };

    // when
    await usecases.updateUserDetailsByAdmin({
      userId,
      userToUpdate,
      updatedByAdminId,
    });

    // then
    const result = await knex('users').where({ id: userId }).first();
    expect(result.email).equal(userToUpdate.email);
    expect(result.firstName).equal(userToUpdate.firstName);
    expect(result.lastName).equal(userToUpdate.lastName);

    await expect(AuditLoggingJob.name).to.have.been.performed.withJobPayload({
      client: 'PIX_ADMIN',
      action: 'EMAIL_CHANGED',
      role: 'SUPPORT',
      userId: updatedByAdminId,
      targetUserIds: [userId],
      data: { oldEmail: 'email@example.net', newEmail: userToUpdate.email },
      occurredAt: '2024-12-25T00:00:00.000Z',
      correlationContext: EMPTY_CORRELATION_INFO,
    });
  });

  it('updates user email only', async function () {
    // given
    const userToUpdate = {
      email: 'partial@example.net',
    };

    // when
    await usecases.updateUserDetailsByAdmin({
      userId,
      userToUpdate,
      updatedByAdminId,
    });

    // then
    const result = await knex('users').where({ id: userId }).first();
    expect(result.email).equal(userToUpdate.email);
  });

  context('When email is not updated', function () {
    it('does not log into audit logger', async function () {
      // given
      const userToUpdate = { email: 'email@example.net' };

      // when
      await usecases.updateUserDetailsByAdmin({
        userId,
        userToUpdate,
        updatedByAdminId,
      });

      // then
      const result = await knex('users').where({ id: userId }).first();
      expect(result.email).equal(userToUpdate.email);

      await expect(AuditLoggingJob.name).to.have.been.performed.withJobsCount(0);
    });
  });

  context('When adding a new email for user', function () {
    context('When user has only a username', function () {
      it('marks terms of service validation as needed ', async function () {
        // given
        const userWithUsername = databaseBuilder.factory.buildUser({
          username: 'bob',
          email: null,
          mustValidateTermsOfService: false,
        });
        await databaseBuilder.commit();

        // when
        await usecases.updateUserDetailsByAdmin({
          userId: userWithUsername.id,
          userToUpdate: { email: 'first@email.com' },
          updatedByAdminId,
        });

        // then
        const result = await knex('users').where({ id: userWithUsername.id }).first();
        expect(result.mustValidateTermsOfService).to.be.true;
      });
    });

    context('When user already has an email', function () {
      it('does not change terms of service validation', async function () {
        // given
        const userWithUsername = databaseBuilder.factory.buildUser({
          username: 'bob',
          email: 'already@email.com',
          mustValidateTermsOfService: false,
        });
        await databaseBuilder.commit();

        // when
        await usecases.updateUserDetailsByAdmin({
          userId: userWithUsername.id,
          userToUpdate: { email: 'first@email.com' },
          updatedByAdminId,
        });

        // then
        const result = await knex('users').where({ id: userWithUsername.id }).first();
        expect(result.mustValidateTermsOfService).to.be.false;
      });
    });
  });

  context('When email is already used by another user', function () {
    it('throws AlreadyRegisteredEmailError', async function () {
      // given
      const userToUpdate = {
        email: 'alreadyEXIST@example.net',
      };

      // when
      const error = await catchErr(usecases.updateUserDetailsByAdmin)({
        userId,
        userToUpdate,
        updatedByAdminId,
      });

      // then
      expect(error).to.be.instanceOf(AlreadyRegisteredEmailError);
      expect(error.message).to.equal('Cette adresse e-mail est déjà utilisée.');
    });
  });

  context('When username is already used', function () {
    it('throws AlreadyRegisteredUsernameError', async function () {
      // given
      const userToUpdate = databaseBuilder.factory.buildUser({
        email: null,
        username: 'current.username',
      });

      const anotherUser = databaseBuilder.factory.buildUser({
        email: null,
        username: 'already.exist.username',
      });
      await databaseBuilder.commit();

      // when
      const error = await catchErr(usecases.updateUserDetailsByAdmin)({
        userId: userToUpdate.id,
        userToUpdate: { username: anotherUser.username },
        updatedByAdminId,
      });

      // then
      expect(error).to.be.instanceOf(AlreadyRegisteredUsernameError);
      expect(error.message).to.equal('Cet identifiant est déjà utilisé.');
    });
  });

  context('When email and username are already used by another user', function () {
    it('throws AlreadyRegisteredEmailAndUsernameError', async function () {
      // given
      databaseBuilder.factory.buildUser({
        email: null,
        username: 'already.exist.username',
      });
      await databaseBuilder.commit();

      const userToUpdate = {
        email: 'alreadyEXIST@example.net',
        username: 'already.exist.username',
      };

      // when
      const error = await catchErr(usecases.updateUserDetailsByAdmin)({
        userId,
        userToUpdate,
        updatedByAdminId,
      });

      // then
      expect(error).to.be.instanceOf(AlreadyRegisteredEmailAndUsernameError);
      expect(error.message).to.equal('Cette adresse e-mail et cet identifiant sont déjà utilisés.');
    });
  });
});
