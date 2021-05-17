const { catchErr, domainBuilder, expect, sinon } = require('../../../test-helper');
const {
  AlreadyRegisteredEmailAndUsernameError,
  AlreadyRegisteredEmailError,
  AlreadyRegisteredUsernameError,
} = require('../../../../lib/domain/errors');
const User = require('../../../../lib/domain/models/User');

const updateUserDetailsForAdministration = require('../../../../lib/domain/usecases/update-user-details-for-administration');

describe('Unit | UseCase | update-user-details-for-administration', () => {

  const userId = 1;

  let userRepository;

  beforeEach(() => {
    userRepository = {
      findAnotherUserByEmail: sinon.stub(),
      findAnotherUserByUsername: sinon.stub(),
      getUserDetailsForAdmin: sinon.stub(),
      updateUserDetailsForAdministration: sinon.stub(),
    };
  });

  context('search existing user with email', () => {

    it('should search existing users with email if not empty', async () => {
      // given
      const email = 'user@example.net';
      const userDetailsForAdministration = { email };

      // when
      await updateUserDetailsForAdministration({ userId, userDetailsForAdministration, userRepository });

      // then
      expect(userRepository.findAnotherUserByEmail).to.have.been.calledWith(userId, email);
    });

    it('should not search existing users if email is empty', async () => {
      // given
      const userDetailsForAdministration = { email: null };

      // when
      await updateUserDetailsForAdministration({ userId, userDetailsForAdministration, userRepository });

      // then
      expect(userRepository.findAnotherUserByEmail.notCalled).to.be.true;
    });
  });

  context('search existing user with username', () => {

    it('should search existing user with username if not empty', async () => {
      // given
      const username = 'user.name';
      const userDetailsForAdministration = { username };

      // when
      await updateUserDetailsForAdministration({ userId, userDetailsForAdministration, userRepository });

      // then
      expect(userRepository.findAnotherUserByUsername).to.have.been.calledWith(userId, username);
    });

    it('should not search existing user if username is empty', async () => {
      // given
      const userDetailsForAdministration = { username: null };

      // when
      await updateUserDetailsForAdministration({ userId, userDetailsForAdministration, userRepository });

      // then
      expect(userRepository.findAnotherUserByUsername.notCalled).to.be.true;
    });
  });

  it('should update userDetailsForAdministration data', async () => {
    // given
    const email = 'user@example.net';
    const username = 'user.name';
    const attributesToUpdate = {
      email,
      firstName: 'firstName',
      lastName: 'lastName',
      username,
    };

    userRepository.findAnotherUserByEmail.withArgs(userId, email).resolves([]);
    userRepository.findAnotherUserByUsername.withArgs(userId, username).resolves([]);

    // when
    await updateUserDetailsForAdministration({
      userId,
      userDetailsForAdministration: attributesToUpdate,
      userRepository,
    });

    // then
    expect(userRepository.updateUserDetailsForAdministration).to.have.been.calledWith(userId, attributesToUpdate);
  });

  it('should return the updated user details for admin', async () => {
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
      schoolingRegistrations: [domainBuilder.buildSchoolingRegistrationForAdmin()],
    });

    userRepository.findAnotherUserByEmail.withArgs(userId, email).resolves([]);
    userRepository.findAnotherUserByUsername.withArgs(userId, username).resolves([]);
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

  context('when email and/or username are already used', () => {

    it('should throw AlreadyRegisteredEmailAndUsernameError if email and username already used', async () => {
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

    it('should throw AlreadyRegisteredEmailError if email already used', async () => {
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

    it('should throw AlreadyRegisteredUsernameError if username already used', async () => {
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
