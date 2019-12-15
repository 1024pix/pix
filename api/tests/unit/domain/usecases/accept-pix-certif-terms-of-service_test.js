const { expect, sinon } = require('../../../test-helper');
const acceptPixCertifTermsOfService = require('../../../../lib/domain/usecases/accept-pix-certif-terms-of-service');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');

describe('Unit | UseCase | accept-pix-certif-terms-of-service', () => {

  beforeEach(() => {
    sinon.stub(userRepository, 'updatePixCertifTermsOfServiceAcceptedToTrue');
  });

  it('should accept terms of service of pix-certif', async () => {
    // given
    const userId = Symbol('userId');
    const updatedUser = Symbol('updateduser');
    userRepository.updatePixCertifTermsOfServiceAcceptedToTrue.resolves(updatedUser);

    // when
    const actualUpdatedUser = await acceptPixCertifTermsOfService({ userId, userRepository });

    // then
    expect(userRepository.updatePixCertifTermsOfServiceAcceptedToTrue).to.have.been.calledWith(userId);
    expect(actualUpdatedUser).to.equal(updatedUser);
  });

});
