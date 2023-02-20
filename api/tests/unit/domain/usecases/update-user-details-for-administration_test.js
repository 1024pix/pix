import { catchErr, domainBuilder, expect, sinon } from '../../../test-helper';

import {
  AlreadyRegisteredEmailAndUsernameError,
  AlreadyRegisteredEmailError,
  AlreadyRegisteredUsernameError,
} from '../../../../lib/domain/errors';

import User from '../../../../lib/domain/models/User';
import updateUserDetailsForAdministration from '../../../../lib/domain/usecases/update-user-details-for-administration';

describe('Unit | UseCase | update-user-details-for-administration', function () {
  const userId = 1;

  let userRepository;

  beforeEach(function () {
    userRepository = {
      findAnotherUserByEmail: sinon.stub(),
      findAnotherUserByUsername: sinon.stub(),
      getUserDetailsForAdmin: sinon.stub(),
      updateUserDetailsForAdministration: sinon.stub(),
      get: sinon.stub(),
    };
  });

  context('search existing user with email', function () {
    it('should search existing users with email if not empty', async function () {
      // given
      const email = 'user@example.net';
      const userDetailsForAdministration = { email };
      const user = domainBuilder.buildUser({ email: 'another@email.net' });

      userRepository.get.resolves(user);

      // when
      await updateUserDetailsForAdministration({ userId, userDetailsForAdministration, userRepository });

      // then
      expect(userRepository.findAnotherUserByEmail).to.have.been.calledWith(userId, email);
    });

    it('should not search existing users if email is empty', async function () {
      // given
      const userDetailsForAdministration = { email: null };
      const user = domainBuilder.buildUser({ email: 'another@email.net' });

      userRepository.get.resolves(user);

      // when
      await updateUserDetailsForAdministration({ userId, userDetailsForAdministration, userRepository });

      // then
      expect(userRepository.findAnotherUserByEmail.notCalled).to.be.true;
    });
  });

  context('search existing user with username', function () {
    it('should search existing user with username if not empty', async function () {
      // given
      const username = 'user.name';
      const userDetailsForAdministration = { username };
      const user = domainBuilder.buildUser({ username });

      userRepository.get.resolves(user);

      // when
      await updateUserDetailsForAdministration({ userId, userDetailsForAdministration, userRepository });

      // then
      expect(userRepository.findAnotherUserByUsername).to.have.been.calledWith(userId, username);
    });

    it('should not search existing user if username is empty', async function () {
      // given
      const userDetailsForAdministration = { username: null };
      const user = domainBuilder.buildUser();

      userRepository.get.resolves(user);

      // when
      await updateUserDetailsForAdministration({ userId, userDetailsForAdministration, userRepository });

      // then
      expect(userRepository.findAnotherUserByUsername.notCalled).to.be.true;
    });
  });

  it('should update userDetailsForAdministration data', async function () {
    // given
    const email = 'user@example.net';
    const username = 'user.name';
    const attributesToUpdate = {
      email,
      firstName: 'firstName',
      lastName: 'lastName',
      username,
    };
    const user = domainBuilder.buildUser({ username, email: 'another@email.net' });

    userRepository.findAnotherUserByEmail.withArgs(userId, email).resolves([]);
    userRepository.findAnotherUserByUsername.withArgs(userId, username).resolves([]);
    userRepository.get.resolves(user);

    // when
    await updateUserDetailsForAdministration({
      userId,
      userDetailsForAdministration: attributesToUpdate,
      userRepository,
    });

    // then
    expect(userRepository.updateUserDetailsForAdministration).to.have.been.calledWith({
      id: userId,
      userAttributes: attributesToUpdate,
    });
  });

  context('when adding a new email for user', function () {
    it('should update mustValidateTermsOfService if user has username', async function () {
      // given
      const email = 'user@example.net';
      const username = 'user.name';
      const attributesToUpdate = { email };
      const user = domainBuilder.buildUser({ username, email: null });

      userRepository.findAnotherUserByEmail.withArgs(userId, email).resolves([]);
      userRepository.findAnotherUserByUsername.withArgs(userId, username).resolves([]);
      userRepository.get.withArgs(userId).resolves(user);

      // when
      await updateUserDetailsForAdministration({
        userId,
        userDetailsForAdministration: attributesToUpdate,
        userRepository,
      });

      // then
      const expectedAttributes = { email, mustValidateTermsOfService: true };
      expect(userRepository.updateUserDetailsForAdministration).to.have.been.calledWith({
        id: userId,
        userAttributes: expectedAttributes,
      });
    });

    it('should not update mustValidateTermsOfService if user has email', async function () {
      // given
      const email = 'user@example.net';
      const username = 'user.name';
      const attributesToUpdate = { email };
      const user = domainBuilder.buildUser({ email, username });

      userRepository.findAnotherUserByEmail.withArgs(userId, email).resolves([]);
      userRepository.findAnotherUserByUsername.withArgs(userId, username).resolves([]);
      userRepository.get.withArgs(userId).resolves(user);

      // when
      await updateUserDetailsForAdministration({
        userId,
        userDetailsForAdministration: attributesToUpdate,
        userRepository,
      });

      // then
      const expectedAttributes = { email };
      expect(userRepository.updateUserDetailsForAdministration).to.have.been.calledWith({
        id: userId,
        userAttributes: expectedAttributes,
      });
    });
  });

  it('should return the updated user details for admin', async function () {
    // given
    const email = 'user@example.net';
    const username = 'user.name';
    const attributesToUpdate = {
      email,
      firstName: 'firstName',
      lastName: 'lastName',
      username,
    };
    const expectedUserDetailsForAdmin = domainBuilder.buildUserDetailsForAdmin({
      ...attributesToUpdate,
      organizationLearners: [domainBuilder.buildOrganizationLearnerForAdmin()],
    });
    const user = domainBuilder.buildUser({ username, email: 'another@email.net' });

    userRepository.findAnotherUserByEmail.withArgs(userId, email).resolves([]);
    userRepository.findAnotherUserByUsername.withArgs(userId, username).resolves([]);
    userRepository.get.resolves(user);
    userRepository.getUserDetailsForAdmin.resolves(expectedUserDetailsForAdmin);

    // when
    const updatedUserDetailsForAdmin = await updateUserDetailsForAdministration({
      userId,
      userDetailsForAdministration: attributesToUpdate,
      userRepository,
    });
    // then
    expect(updatedUserDetailsForAdmin).to.deep.equal(expectedUserDetailsForAdmin);
  });

  context('when email and/or username are already used', function () {
    it('should throw AlreadyRegisteredEmailAndUsernameError if email and username already used', async function () {
      // given
      const email = 'user@example.net';
      const username = 'user.name';
      const userDetailsForAdministration = { email, username };

      userRepository.findAnotherUserByEmail.withArgs(userId, email).resolves([new User({ email })]);
      userRepository.findAnotherUserByUsername.withArgs(userId, username).resolves([new User({ username })]);

      // when
      const error = await catchErr(updateUserDetailsForAdministration)({
        userId,
        userDetailsForAdministration,
        userRepository,
      });

      // then
      expect(error).to.be.an.instanceof(AlreadyRegisteredEmailAndUsernameError);
    });

    it('should throw AlreadyRegisteredEmailError if email already used', async function () {
      // given
      const email = 'user@example.net';
      const userDetailsForAdministration = { email };

      userRepository.findAnotherUserByEmail.withArgs(userId, email).resolves([new User({ email })]);

      // when
      const error = await catchErr(updateUserDetailsForAdministration)({
        userId,
        userDetailsForAdministration,
        userRepository,
      });

      // then
      expect(error).to.be.an.instanceof(AlreadyRegisteredEmailError);
    });

    it('should throw AlreadyRegisteredUsernameError if username already used', async function () {
      // given
      const username = 'user.name';
      const userDetailsForAdministration = { username };

      userRepository.findAnotherUserByUsername.withArgs(userId, username).resolves([new User({ username })]);

      // when
      const error = await catchErr(updateUserDetailsForAdministration)({
        userId,
        userDetailsForAdministration,
        userRepository,
      });

      // then
      expect(error).to.be.an.instanceof(AlreadyRegisteredUsernameError);
    });
  });
});
