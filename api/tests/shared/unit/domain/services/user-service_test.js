import lodash from 'lodash';
const { omit } = lodash;

import { DomainTransaction } from '../../../../../lib/infrastructure/DomainTransaction.js';
import * as userService from '../../../../../src/shared/domain/services/user-service.js';
import { domainBuilder, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Shared | Domain | Service | user-service', function () {
  const hashedPassword = 'ABCD1234';

  let user;
  let authenticationMethod;

  let authenticationMethodRepository;
  let organizationLearnerRepository;
  let userRepository;
  let userToCreateRepository;

  beforeEach(function () {
    sinon.stub(DomainTransaction, 'execute');
    DomainTransaction.execute.callsFake((fn) => {
      return fn({});
    });

    userRepository = {
      updateUsername: sinon.stub(),
    };
    userToCreateRepository = {
      create: sinon.stub(),
    };
    authenticationMethodRepository = {
      create: sinon.stub(),
      updatePasswordThatShouldBeChanged: sinon.stub(),
      createPasswordThatShouldBeChanged: sinon.stub(),
    };
    organizationLearnerRepository = {
      updateUserIdWhereNull: sinon.stub(),
    };

    authenticationMethodRepository.create.resolves();
    organizationLearnerRepository.updateUserIdWhereNull.resolves();
    userToCreateRepository.create.resolves();
  });

  describe('#createUserWithPassword', function () {
    it('should call user and authenticationMethod create functions ', async function () {
      // given
      const user = domainBuilder.buildUser();
      const authenticationMethod = domainBuilder.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
        userId: user.id,
        hashedPassword,
      });
      userToCreateRepository.create.resolves(user);
      const expectedAuthenticationMethod = omit(authenticationMethod, ['id', 'createdAt', 'updatedAt']);

      //when
      await userService.createUserWithPassword({
        user,
        hashedPassword,
        userRepository,
        userToCreateRepository,
        authenticationMethodRepository,
      });

      // then
      expect(userToCreateRepository.create).to.have.been.calledOnce;
      expect(authenticationMethodRepository.create).to.have.been.calledWithMatch({
        authenticationMethod: expectedAuthenticationMethod,
      });
    });
  });

  describe('#updateUsernameAndAddPassword', function () {
    beforeEach(function () {
      user = domainBuilder.buildUser();
      authenticationMethod = domainBuilder.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({
        userId: user.id,
        hashedPassword,
      });
      user.authenticationMethods = [authenticationMethod];
    });

    it('should call user and authenticationMethod update functions', async function () {
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

  describe('#createAndReconcileUserToOrganizationLearner', function () {
    it('should call user and authenticationMethod create and function, and organizationLearner update function', async function () {
      // given
      const user = domainBuilder.buildUser({
        firstName: 'Mnémosyne',
        lastName: 'Pachidermata',
      });
      const organizationLearnerId = 1;
      userToCreateRepository.create.resolves(user);

      // when
      await userService.createAndReconcileUserToOrganizationLearner({
        samlId: 'SAML_ID',
        organizationLearnerId,
        user,
        authenticationMethodRepository,
        userToCreateRepository,
        organizationLearnerRepository,
      });

      // then
      expect(userToCreateRepository.create).to.have.been.calledOnce;
      expect(authenticationMethodRepository.create).to.have.been.calledWithMatch({
        authenticationMethod: {
          externalIdentifier: 'SAML_ID',
          userId: user.id,
          authenticationComplement: {
            firstName: 'Mnémosyne',
            lastName: 'Pachidermata',
          },
        },
      });
      expect(organizationLearnerRepository.updateUserIdWhereNull).to.have.been.calledWithMatch({
        organizationLearnerId,
        userId: user.id,
      });
    });
  });
});
