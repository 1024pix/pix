import sinon from 'sinon';

import { findUserAuthenticationMethods } from '../../../../../src/identity-access-management/domain/usecases/find-user-authentication-methods.usecase.js';

import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

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
