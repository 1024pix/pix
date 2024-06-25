import { findUserAuthenticationMethods } from '../../../../../src/identity-access-management/domain/usecases/find-user-authentication-methods.usecase.js';
import { domainBuilder, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | UseCase | find-user-authentication-methods', function () {
  it('finds user authentication methods', async function () {
    // given
    const authenticationMethodRepository = {
      findByUserId: sinon.stub(),
    };

    const user = domainBuilder.buildUser();
    domainBuilder.buildAuthenticationMethod.withPoleEmploiAsIdentityProvider({ userId: user.id });

    // when
    await findUserAuthenticationMethods({ userId: user.id, authenticationMethodRepository });

    // then
    expect(authenticationMethodRepository.findByUserId).to.have.been.calledWithExactly({ userId: user.id });
  });
});
