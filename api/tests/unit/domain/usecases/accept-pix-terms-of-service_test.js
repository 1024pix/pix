const { expect, sinon } = require('../../../test-helper');
const acceptPixTermsOfService = require('../../../../lib/domain/usecases/accept-pix-terms-of-service');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');

describe('Unit | UseCase | accept-pix-terms-of-service', () => {

  beforeEach(() => {
    sinon.stub(userRepository, 'updateLastPixTermsOfServiceAccepted');
  });

  it('should accept terms of service of pix', async () => {
    // given
    const userId = Symbol('userId');
    const updatedUser = Symbol('updateduser');
    userRepository.updateLastPixTermsOfServiceAccepted.resolves(updatedUser);

    // when
    const actualUpdatedUser = await acceptPixTermsOfService({ userId, userRepository });

    // then
    expect(userRepository.updateLastPixTermsOfServiceAccepted).to.have.been.calledWith(userId);
    expect(actualUpdatedUser).to.equal(updatedUser);
  });

});
