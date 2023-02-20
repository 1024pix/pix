import { expect, sinon, domainBuilder } from '../../../test-helper';
import findUserAuthenticationMethods from '../../../../lib/domain/usecases/find-user-authentication-methods';

describe('Unit | UseCase | find-user-authentication-methods', function () {
  it('should find user authentication methods', async function () {
    // given
    const authenticationMethodRepository = {
      findByUserId: sinon.stub(),
    };

    const user = domainBuilder.buildUser();
    domainBuilder.buildAuthenticationMethod.withPoleEmploiAsIdentityProvider({ userId: user.id });

    // when
    await findUserAuthenticationMethods({ userId: user.id, authenticationMethodRepository });

    // then
    expect(authenticationMethodRepository.findByUserId).to.have.been.calledWith({ userId: user.id });
  });
});
