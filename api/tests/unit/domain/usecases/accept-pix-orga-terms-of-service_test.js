const { expect, sinon, domainBuilder } = require('../../../test-helper');
const acceptPixOrgaTermsOfService = require('../../../../lib/domain/usecases/accept-pix-orga-terms-of-service');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const User = require('../../../../lib/domain/models/User');

describe('Unit | UseCase | accept-pix-orga-terms-of-service', () => {

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(userRepository, 'get');
    sandbox.stub(userRepository, 'updateUser');
  });

  afterEach(() => {
    sandbox.restore();
  });

  context('when user has already accepted pix-orga terms of service', () => {
    it('should not update terms of service validation', () => {
      // given
      const userId = 1;
      const user = domainBuilder.buildUser({
        pixOrgaTermsOfServiceAccepted: true
      });
      userRepository.get.resolves(user);

      // when
      const promise = acceptPixOrgaTermsOfService({ userId, userRepository });

      // then
      return promise.then(() => {
        expect(userRepository.updateUser).to.not.have.been.called;
      });
    });
  });

  context('when user has not accepted pix orga terms of service yet', () => {

    it('should accept terms of service of pix-orga', () => {
      // given
      const userId = 1;
      const user = domainBuilder.buildUser({
        pixOrgaTermsOfServiceAccepted: false
      });
      userRepository.get.resolves(user);
      const expectedUser = new User({ ...user, pixOrgaTermsOfServiceAccepted: true });

      // when
      const promise = acceptPixOrgaTermsOfService({ userId, userRepository });

      // then
      return promise.then(() => {
        expect(userRepository.updateUser).to.have.been.calledWith(expectedUser);
      });
    });

  });

});
