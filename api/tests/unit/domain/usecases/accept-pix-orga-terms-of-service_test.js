const { expect, sinon } = require('../../../test-helper');
const acceptPixOrgaTermsOfService = require('../../../../lib/domain/usecases/accept-pix-orga-terms-of-service');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');

describe('Unit | UseCase | accept-pix-orga-terms-of-service', () => {

  beforeEach(() => {
    sinon.stub(userRepository, 'updatePixOrgaTermsOfServiceAcceptedToTrue');
  });

  it('should accept terms of service of pix-orga', async () => {
    // given
    const userId = Symbol('userId');
    const updatedUser = Symbol('updateduser');
    userRepository.updatePixOrgaTermsOfServiceAcceptedToTrue.resolves(updatedUser);

    // when
    const actualUpdatedUser = await acceptPixOrgaTermsOfService({ userId, userRepository });

    // then
    expect(userRepository.updatePixOrgaTermsOfServiceAcceptedToTrue).to.have.been.calledWith(userId);
    expect(actualUpdatedUser).to.equal(updatedUser);
  });

});
