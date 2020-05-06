const { expect, sinon } = require('../../../test-helper');
const acceptPixLastTermsOfService = require('../../../../lib/domain/usecases/accept-pix-last-terms-of-service');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');

describe('Unit | UseCase | accept-pix-last-terms-of-service', () => {

  beforeEach(() => {
    sinon.stub(userRepository, 'acceptPixLastTermsOfService');
  });

  it('should accept terms of service of pix', async () => {
    // given
    const userId = Symbol('userId');
    const updatedUser = Symbol('updateduser');
    userRepository.acceptPixLastTermsOfService.resolves(updatedUser);

    // when
    const actualUpdatedUser = await acceptPixLastTermsOfService({ userId, userRepository });

    // then
    expect(userRepository.acceptPixLastTermsOfService).to.have.been.calledWith(userId);
    expect(actualUpdatedUser).to.equal(updatedUser);
  });

});
