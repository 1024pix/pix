import { expect, sinon } from '../../../test-helper';
import acceptPixOrgaTermsOfService from '../../../../lib/domain/usecases/accept-pix-orga-terms-of-service';
import userRepository from '../../../../lib/infrastructure/repositories/user-repository';

describe('Unit | UseCase | accept-pix-orga-terms-of-service', function () {
  beforeEach(function () {
    sinon.stub(userRepository, 'updatePixOrgaTermsOfServiceAcceptedToTrue');
  });

  it('should accept terms of service of pix-orga', async function () {
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
