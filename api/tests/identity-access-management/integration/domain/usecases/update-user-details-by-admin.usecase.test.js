import { EventLoggingJob } from '../../../../../src/identity-access-management/domain/models/jobs/EventLoggingJob.js';
import { UserDetailsForAdmin } from '../../../../../src/identity-access-management/domain/models/UserDetailsForAdmin.js';
import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import * as userRepository from '../../../../../src/identity-access-management/infrastructure/repositories/user.repository.js';
import {
  AlreadyRegisteredEmailAndUsernameError,
  AlreadyRegisteredEmailError,
  AlreadyRegisteredUsernameError,
} from '../../../../../src/shared/domain/errors.js';
import { roles } from '../../../../../src/shared/domain/models/Membership.js';
import { catchErr, databaseBuilder, expect, sinon } from '../../../../test-helper.js';

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
    const userDetailsToUpdate = {
      email: 'partial@example.net',
      firstName: 'firstName',
      lastName: 'lastName',
    };

    // when
    const result = await usecases.updateUserDetailsByAdmin({
      userId,
      userDetailsToUpdate,
      updatedByAdminId,
    });

    // then
    expect(result).to.be.an.instanceOf(UserDetailsForAdmin);
    expect(result.email).equal(userDetailsToUpdate.email);
    expect(result.firstName).equal(userDetailsToUpdate.firstName);
    expect(result.lastName).equal(userDetailsToUpdate.lastName);

    await expect(EventLoggingJob.name).to.have.been.performed.withJobPayload({
      client: 'PIX_ADMIN',
      action: 'EMAIL_CHANGED',
      role: 'SUPPORT',
      userId: updatedByAdminId,
      targetUserId: userId,
      data: { oldEmail: 'email@example.net', newEmail: userDetailsToUpdate.email },
      occurredAt: '2024-12-25T00:00:00.000Z',
    });
  });

  it('updates user email only', async function () {
    // given
    const userDetailsToUpdate = {
      email: 'partial@example.net',
    };

    // when
    const result = await usecases.updateUserDetailsByAdmin({
      userId,
      userDetailsToUpdate,
      updatedByAdminId,
    });

    // then
    expect(result.email).equal(userDetailsToUpdate.email);
  });

  it('updates user and returns it with its organization learners', async function () {
    // given
    let organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO' }).id;
    databaseBuilder.factory.buildOrganizationLearner({ id: 1, userId, organizationId });
    organizationId = databaseBuilder.factory.buildOrganization({ type: 'SCO' }).id;
    databaseBuilder.factory.buildOrganizationLearner({ id: 2, userId, organizationId });
    await databaseBuilder.commit();
    const userDetailsToUpdate = { email: 'partial@example.net' };

    // when
    const result = await usecases.updateUserDetailsByAdmin({
      userId,
      userDetailsToUpdate,
      updatedByAdminId,
    });

    // then
    expect(result.organizationLearners).to.have.lengthOf(2);
    expect(result.email).to.equal(userDetailsToUpdate.email);
  });

  context('When email is not updated', function () {
    it('does not log into audit logger', async function () {
      // given
      const userDetailsToUpdate = { email: 'email@example.net' };

      // when
      const result = await usecases.updateUserDetailsByAdmin({
        userId,
        userDetailsToUpdate,
        updatedByAdminId,
      });

      // then
      expect(result.email).equal(userDetailsToUpdate.email);

      await expect(EventLoggingJob.name).to.have.been.performed.withJobsCount(0);
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
          userDetailsToUpdate: { email: 'first@email.com' },
          updatedByAdminId,
        });

        // then
        const updatedUser = await userRepository.get(userWithUsername.id);
        expect(updatedUser.mustValidateTermsOfService).to.be.true;
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
          userDetailsToUpdate: { email: 'first@email.com' },
          updatedByAdminId,
        });

        // then
        const updatedUser = await userRepository.get(userWithUsername.id);
        expect(updatedUser.mustValidateTermsOfService).to.be.false;
      });
    });
  });

  context('When email is already used by another user', function () {
    it('throws AlreadyRegisteredEmailError', async function () {
      // given
      const userDetailsToUpdate = {
        email: 'alreadyEXIST@example.net',
      };

      // when
      const error = await catchErr(usecases.updateUserDetailsByAdmin)({
        userId,
        userDetailsToUpdate,
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
        userDetailsToUpdate: { username: anotherUser.username },
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

      const userDetailsToUpdate = {
        email: 'alreadyEXIST@example.net',
        username: 'already.exist.username',
      };

      // when
      const error = await catchErr(usecases.updateUserDetailsByAdmin)({
        userId,
        userDetailsToUpdate,
        updatedByAdminId,
      });

      // then
      expect(error).to.be.instanceOf(AlreadyRegisteredEmailAndUsernameError);
      expect(error.message).to.equal('Cette adresse e-mail et cet identifiant sont déjà utilisés.');
    });
  });
});
