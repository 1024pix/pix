const { expect, sinon } = require('../../../test-helper');
const findUserForOidcReconciliation = require('../../../../lib/domain/usecases/find-user-for-oidc-reconciliation');

describe('Unit | UseCase | find-user-for-oidc-reconciliation', function () {
  it('should find pix user', async function () {
    // given
    const userRepository = {};
    const pixAuthenticationService = { getUserByUsernameAndPassword: sinon.stub() };

    // when
    await findUserForOidcReconciliation({
      email: 'ane.trotro@example.net',
      password: 'pix123',
      pixAuthenticationService,
      userRepository,
    });

    // then
    expect(pixAuthenticationService.getUserByUsernameAndPassword).to.be.calledOnceWith({
      username: 'ane.trotro@example.net',
      password: 'pix123',
      userRepository,
    });
  });
});
