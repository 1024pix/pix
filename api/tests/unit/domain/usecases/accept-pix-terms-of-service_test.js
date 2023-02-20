import { expect, sinon } from '../../../test-helper';
import acceptPixLastTermsOfService from '../../../../lib/domain/usecases/accept-pix-last-terms-of-service';
import userRepository from '../../../../lib/infrastructure/repositories/user-repository';

describe('Unit | UseCase | accept-pix-last-terms-of-service', function () {
  beforeEach(function () {
    sinon.stub(userRepository, 'acceptPixLastTermsOfService');
  });

  it('should accept terms of service of pix', async function () {
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
