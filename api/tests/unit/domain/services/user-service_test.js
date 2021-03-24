const omit = require('lodash/omit');

const { expect, sinon, domainBuilder } = require('../../../test-helper');

const DomainTransaction = require('../../../../lib/infrastructure/DomainTransaction');

const userService = require('../../../../lib/domain/services/user-service');

describe('Unit | Service | user-service', function() {

  const domainTransaction = Symbol('domain transaction');
  const hashedPassword = 'ABCD1234';

  let user;
  let authenticationMethod;
  let transactionToBeExecuted;

  let authenticationMethodRepository;
  let schoolingRegistrationRepository;
  let userRepository;

  beforeEach(function() {
    userRepository = {
      create: sinon.stub(),
      updateUsername: sinon.stub(),
    };
    authenticationMethodRepository = {
      create: sinon.stub(),
      updatePasswordThatShouldBeChanged: sinon.stub(),
      createPasswordThatShouldBeChanged: sinon.stub(),
    };
    schoolingRegistrationRepository = {
      updateUserIdWhereNull: sinon.stub(),
    };

    authenticationMethodRepository.create.resolves();
    schoolingRegistrationRepository.updateUserIdWhereNull.resolves();
    userRepository.create.resolves();

    sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => {
      transactionToBeExecuted = lambda;
    });
  });

  describe('#createUserWithPassword', function() {

    beforeEach(function() {
      user = domainBuilder.buildUser();
      authenticationMethod = domainBuilder.buildAuthenticationMethod.buildWithHashedPassword({
        userId: user.id,
        hashedPassword,
      });
    });

    it('should call user and authenticationMethod create functions ', async function() {
      // given
      userRepository.create.resolves(user);
      const expectedAuthenticationMethod = omit(authenticationMethod, ['id', 'createdAt', 'updatedAt']);

      //when
      await userService.createUserWithPassword({
        user,
        hashedPassword,
        userRepository,
        authenticationMethodRepository,
      });
      await transactionToBeExecuted(domainTransaction);

      // then
      expect(userRepository.create).to.have.been.calledWithMatch({ user });
      expect(authenticationMethodRepository.create).to.have.been.calledWithMatch({
        authenticationMethod: expectedAuthenticationMethod,
      });
    });
  });

  describe('#updateUsernameAndAddPassword', function() {

    beforeEach(function() {
      user = domainBuilder.buildUser();
      authenticationMethod = domainBuilder.buildAuthenticationMethod.buildWithHashedPassword({
        userId: user.id,
        hashedPassword,
      });
      user.authenticationMethods = [authenticationMethod];
    });

    it('should call user and authenticationMethod update functions', async function() {
      const userId = user.id;
      const username = 'newUsername';
      const newHashedPassword = '1234ABCD';

      //when
      await userService.updateUsernameAndAddPassword({
        userId: user.id,
        username,
        hashedPassword: newHashedPassword,
        userRepository,
        authenticationMethodRepository,
      });
      await transactionToBeExecuted(domainTransaction);

      // then
      expect(userRepository.updateUsername).to.have.been.calledWithMatch({
        id: userId,
        username,
      });
      expect(authenticationMethodRepository.createPasswordThatShouldBeChanged).to.have.been.calledWithMatch({
        userId,
        hashedPassword: newHashedPassword,
      });
    });
  });

  describe('#createAndReconcileUserToSchoolingRegistration', function() {

    const samlId = 'ABCD';

    beforeEach(async function() {
      user = domainBuilder.buildUser();
      authenticationMethod = domainBuilder.buildAuthenticationMethod({
        externalIdentifier: samlId,
        userId: user.id,
      });
    });

    it('should call user and authenticationMethod create and function, and schoolingRegistration update function', async function() {
      // given
      const schoolingRegistrationId = 1;
      userRepository.create.resolves(user);

      const expectedAuthenticationMethod = omit(authenticationMethod, ['id', 'createdAt', 'updatedAt']);

      // when
      await userService.createAndReconcileUserToSchoolingRegistration({
        samlId,
        schoolingRegistrationId,
        user,
        authenticationMethodRepository,
        userRepository,
        schoolingRegistrationRepository,
      });
      await transactionToBeExecuted(domainTransaction);

      // then
      expect(userRepository.create).to.have.been.calledWithMatch({
        user,
      });
      expect(authenticationMethodRepository.create).to.have.been.calledWithMatch({
        authenticationMethod: expectedAuthenticationMethod,
      });
      expect(schoolingRegistrationRepository.updateUserIdWhereNull).to.have.been.calledWithMatch({
        schoolingRegistrationId,
        userId: user.id,
      });
    });
  });

});
