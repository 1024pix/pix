import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Services | authentication', function (hooks) {
  setupTest(hooks);

  let authenticationService;

  hooks.beforeEach(function () {
    authenticationService = this.owner.lookup('service:authentication');

    sinon.stub(authenticationService.session, 'invalidate').resolves();
    sinon.stub(authenticationService.router, 'replaceWith');
  });

  hooks.afterEach(function () {
    sinon.restore();
  });

  module('#handleAnonymousAuthentication', function () {
    module('when there is no session', function () {
      module('when the route is available for an anonymous user', function () {
        test('should do nothing', async function (assert) {
          // given
          const transition = { to: { name: 'fill-in-campaign-code' } };

          // when
          await authenticationService.handleAnonymousAuthentication(transition);

          // then
          sinon.assert.notCalled(authenticationService.session.invalidate);
          assert.ok(true);
        });
      });

      module('when the route is not available for an anonymous user', function () {
        test('should do nothing', async function (assert) {
          // given
          const transition = { to: { name: 'not-available-route' } };

          // when
          await authenticationService.handleAnonymousAuthentication(transition);

          // then
          sinon.assert.notCalled(authenticationService.session.invalidate);
          assert.ok(true);
        });
      });
    });

    module('when there is a session', function () {
      module('created with the anonymous authenticator', function (hooks) {
        hooks.beforeEach(function () {
          sinon
            .stub(authenticationService.session, 'data')
            .value({ authenticated: { authenticator: 'authenticator:anonymous' } });
        });

        module('when the route is available for an anonymous user', function () {
          test('should do nothing', async function (assert) {
            // given
            const transition = { to: { name: 'fill-in-campaign-code' } };

            // when
            await authenticationService.handleAnonymousAuthentication(transition);

            // then
            sinon.assert.notCalled(authenticationService.session.invalidate);
            assert.ok(true);
          });
        });

        module('when the route is not available for an anonymous user', function () {
          test('should invalidate the current session and redirect the user to /campagnes', async function (assert) {
            // given
            const transition = { to: { name: 'not-available-route' } };

            // when
            await authenticationService.handleAnonymousAuthentication(transition);

            // then
            sinon.assert.calledOnce(authenticationService.session.invalidate);
            sinon.assert.calledWith(authenticationService.router.replaceWith, '/campagnes');
            assert.ok(true);
          });
        });
      });

      module('created with another authenticator', function (hooks) {
        hooks.beforeEach(function () {
          sinon
            .stub(authenticationService.session, 'data')
            .value({ authenticated: { authenticator: 'authenticator:oauth2' } });
        });

        module('when the route is available for an anonymous user', function () {
          test('should do nothing', async function (assert) {
            // given
            const transition = { to: { name: 'fill-in-campaign-code' } };

            // when
            await authenticationService.handleAnonymousAuthentication(transition);

            // then
            sinon.assert.notCalled(authenticationService.session.invalidate);
            assert.ok(true);
          });
        });

        module('when the route is not available for an anonymous user', function () {
          test('should do nothing', async function (assert) {
            // given
            const transition = { to: { name: 'not-available-route' } };

            // when
            await authenticationService.handleAnonymousAuthentication(transition);

            // then
            sinon.assert.notCalled(authenticationService.session.invalidate);
            assert.ok(true);
          });
        });
      });
    });
  });
});
