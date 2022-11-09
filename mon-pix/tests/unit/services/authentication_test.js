import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import { it } from 'mocha';

describe('Unit | Services | authentication', function () {
  setupTest();

  let authenticationService;

  beforeEach(function () {
    authenticationService = this.owner.lookup('service:authentication');

    sinon.stub(authenticationService.session, 'invalidate').resolves();
    sinon.stub(authenticationService.router, 'replaceWith');
  });

  afterEach(function () {
    sinon.restore();
  });

  describe('#handleAnonymousAuthentication', function () {
    context('when there is no session', function () {
      context('when the route is available for an anonymous user', function () {
        it('should do nothing', async function () {
          // given
          const transition = { to: { name: 'fill-in-campaign-code' } };

          // when
          await authenticationService.handleAnonymousAuthentication(transition);

          // then
          sinon.assert.notCalled(authenticationService.session.invalidate);
        });
      });

      context('when the route is not available for an anonymous user', function () {
        it('should do nothing', async function () {
          // given
          const transition = { to: { name: 'not-available-route' } };

          // when
          await authenticationService.handleAnonymousAuthentication(transition);

          // then
          sinon.assert.notCalled(authenticationService.session.invalidate);
        });
      });
    });

    context('when there is a session', function () {
      context('created with the anonymous authenticator', function () {
        beforeEach(function () {
          sinon
            .stub(authenticationService.session, 'data')
            .value({ authenticated: { authenticator: 'authenticator:anonymous' } });
        });

        context('when the route is available for an anonymous user', function () {
          it('should do nothing', async function () {
            // given
            const transition = { to: { name: 'fill-in-campaign-code' } };

            // when
            await authenticationService.handleAnonymousAuthentication(transition);

            // then
            sinon.assert.notCalled(authenticationService.session.invalidate);
          });
        });

        context('when the route is not available for an anonymous user', function () {
          it('should invalidate the current session and redirect the user to /campagnes', async function () {
            // given
            const transition = { to: { name: 'not-available-route' } };

            // when
            await authenticationService.handleAnonymousAuthentication(transition);

            // then
            sinon.assert.calledOnce(authenticationService.session.invalidate);
            sinon.assert.calledWith(authenticationService.router.replaceWith, '/campagnes');
          });
        });
      });

      context('created with another authenticator', function () {
        beforeEach(function () {
          sinon
            .stub(authenticationService.session, 'data')
            .value({ authenticated: { authenticator: 'authenticator:oauth2' } });
        });

        context('when the route is available for an anonymous user', function () {
          it('should do nothing', async function () {
            // given
            const transition = { to: { name: 'fill-in-campaign-code' } };

            // when
            await authenticationService.handleAnonymousAuthentication(transition);

            // then
            sinon.assert.notCalled(authenticationService.session.invalidate);
          });
        });

        context('when the route is not available for an anonymous user', function () {
          it('should do nothing', async function () {
            // given
            const transition = { to: { name: 'not-available-route' } };

            // when
            await authenticationService.handleAnonymousAuthentication(transition);

            // then
            sinon.assert.notCalled(authenticationService.session.invalidate);
          });
        });
      });
    });
  });
});
