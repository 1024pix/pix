const { expect, sinon, domainBuilder } = require('../../../test-helper');
const acceptPixCertifTermsOfService = require('../../../../lib/domain/usecases/accept-pix-certif-terms-of-service');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const User = require('../../../../lib/domain/models/User');

describe('Unit | UseCase | accept-pix-certif-terms-of-service', () => {

  beforeEach(() => {
    sinon.stub(userRepository, 'get');
    sinon.stub(userRepository, 'updateUser');
  });

  context('when user has already accepted pix-certif terms of service', () => {

    it('should not update terms of service validation', async () => {
      // given
      const userId = 1;
      const user = domainBuilder.buildUser({
        pixCertifTermsOfServiceAccepted: true
      });
      userRepository.get.withArgs(userId).resolves(user);

      // when
      await acceptPixCertifTermsOfService({ userId, userRepository });

      // then
      expect(userRepository.updateUser).to.not.have.been.called;
    });
  });

  context('when user has not accepted pix certif terms of service yet', () => {

    it('should accept terms of service of pix-certif', async () => {
      // given
      const userId = 1;
      const user = domainBuilder.buildUser({
        pixCertifTermsOfServiceAccepted: false
      });
      userRepository.get.resolves(user);
      const expectedUser = new User({ ...user, pixCertifTermsOfServiceAccepted: true });

      // when
      await acceptPixCertifTermsOfService({ authenticatedUserId: userId, requestedUserId: userId, userRepository });

      // then
      expect(userRepository.updateUser).to.have.been.calledWith(expectedUser);
    });

  });

});
