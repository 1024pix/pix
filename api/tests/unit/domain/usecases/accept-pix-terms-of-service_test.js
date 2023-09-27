import { expect, sinon } from '../../../test-helper.js';
import { acceptPixLastTermsOfService } from '../../../../lib/domain/usecases/accept-pix-last-terms-of-service.js';

describe('Unit | UseCase | accept-pix-last-terms-of-service', function () {
  let userRepository;

  beforeEach(function () {
    userRepository = { acceptPixLastTermsOfService: sinon.stub() };
  });

  it('should accept terms of service of pix', async function () {
    // given
    const userId = Symbol('userId');
    const updatedUser = Symbol('updateduser');
    userRepository.acceptPixLastTermsOfService.resolves(updatedUser);

    // when
    const actualUpdatedUser = await acceptPixLastTermsOfService({ userId, userRepository });

    // then
    expect(userRepository.acceptPixLastTermsOfService).to.have.been.calledWithExactly(userId);
    expect(actualUpdatedUser).to.equal(updatedUser);
  });
});
