const { expect, sinon } = require('../../../test-helper');
const acceptLastPixTermsOfService = require('../../../../lib/domain/usecases/accept-last-pix-terms-of-service');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');

describe('Unit | UseCase | accept-last-pix-terms-of-service', () => {

  beforeEach(() => {
    sinon.stub(userRepository, 'updateLastPixTermsOfServiceAccepted');
  });

  it('should accept terms of service of pix', async () => {
    // given
    const userId = Symbol('userId');
    const updatedUser = Symbol('updateduser');
    userRepository.updateLastPixTermsOfServiceAccepted.resolves(updatedUser);

    // when
    const actualUpdatedUser = await acceptLastPixTermsOfService({ userId, userRepository });

    // then
    expect(userRepository.updateLastPixTermsOfServiceAccepted).to.have.been.calledWith(userId);
    expect(actualUpdatedUser).to.equal(updatedUser);
  });

});
