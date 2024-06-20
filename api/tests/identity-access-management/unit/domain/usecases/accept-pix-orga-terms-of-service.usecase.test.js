import { acceptPixOrgaTermsOfService } from '../../../../../src/identity-access-management/domain/usecases/accept-pix-orga-terms-of-service.usecase.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | UseCase | accept-pix-orga-terms-of-service', function () {
  let userRepository;

  beforeEach(function () {
    userRepository = { updatePixOrgaTermsOfServiceAcceptedToTrue: sinon.stub() };
  });

  it('accepts terms of service of pix-orga', async function () {
    // given
    const userId = Symbol('userId');
    const updatedUser = Symbol('updateduser');
    userRepository.updatePixOrgaTermsOfServiceAcceptedToTrue.resolves(updatedUser);

    // when
    const actualUpdatedUser = await acceptPixOrgaTermsOfService({ userId, userRepository });

    // then
    expect(userRepository.updatePixOrgaTermsOfServiceAcceptedToTrue).to.have.been.calledWithExactly(userId);
    expect(actualUpdatedUser).to.equal(updatedUser);
  });
});
