const { expect, sinon } = require('../../../test-helper');
const findUserForOidcReconciliation = require('../../../../lib/domain/usecases/find-user-for-oidc-reconciliation');

describe('Unit | UseCase | find-user-for-oidc-reconciliation', function () {
  it('should find pix user and their oidc authentication method', async function () {
    // given
    const authenticationMethodRepository = { findOneByUserIdAndIdentityProvider: sinon.stub() };
    const userRepository = {};
    const pixAuthenticationService = { getUserByUsernameAndPassword: sinon.stub() };
    pixAuthenticationService.getUserByUsernameAndPassword.resolves({ id: 2 });

    // when
    await findUserForOidcReconciliation({
      email: 'ane.trotro@example.net',
      password: 'pix123',
      identityProvider: 'oidc',
      pixAuthenticationService,
      authenticationMethodRepository,
      userRepository,
    });

    // then
    expect(pixAuthenticationService.getUserByUsernameAndPassword).to.be.calledOnceWith({
      username: 'ane.trotro@example.net',
      password: 'pix123',
      userRepository,
    });

    expect(authenticationMethodRepository.findOneByUserIdAndIdentityProvider).to.be.calledOnceWith({
      userId: 2,
      identityProvider: 'oidc',
    });
  });
});
