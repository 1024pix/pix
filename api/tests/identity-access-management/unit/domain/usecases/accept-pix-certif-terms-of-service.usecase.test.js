import { acceptPixCertifTermsOfService } from '../../../../../src/identity-access-management/domain/usecases/accept-pix-certif-terms-of-service.usecase.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | UseCase | accept-pix-certif-terms-of-service', function () {
  let userRepository;

  beforeEach(function () {
    userRepository = { updatePixCertifTermsOfServiceAcceptedToTrue: sinon.stub() };
  });

  it('accepts terms of service of pix-certif', async function () {
    // given
    const userId = Symbol('userId');
    const updatedUser = Symbol('updateduser');
    userRepository.updatePixCertifTermsOfServiceAcceptedToTrue.resolves(updatedUser);

    // when
    const actualUpdatedUser = await acceptPixCertifTermsOfService({ userId, userRepository });

    // then
    expect(userRepository.updatePixCertifTermsOfServiceAcceptedToTrue).to.have.been.calledWithExactly(userId);
    expect(actualUpdatedUser).to.equal(updatedUser);
  });
});
