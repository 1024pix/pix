import { expect, sinon } from '../../../test-helper';
import acceptPixCertifTermsOfService from '../../../../lib/domain/usecases/accept-pix-certif-terms-of-service';
import userRepository from '../../../../lib/infrastructure/repositories/user-repository';

describe('Unit | UseCase | accept-pix-certif-terms-of-service', function () {
  beforeEach(function () {
    sinon.stub(userRepository, 'updatePixCertifTermsOfServiceAcceptedToTrue');
  });

  it('should accept terms of service of pix-certif', async function () {
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
