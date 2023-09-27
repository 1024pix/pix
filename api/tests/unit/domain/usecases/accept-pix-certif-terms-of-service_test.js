import { expect, sinon } from '../../../test-helper.js';
import { acceptPixCertifTermsOfService } from '../../../../lib/domain/usecases/accept-pix-certif-terms-of-service.js';

describe('Unit | UseCase | accept-pix-certif-terms-of-service', function () {
  let userRepository;

  beforeEach(function () {
    userRepository = { updatePixCertifTermsOfServiceAcceptedToTrue: sinon.stub() };
  });

  it('should accept terms of service of pix-certif', async function () {
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
