import Application from '@ember/application';
import Resolver from 'ember-resolver';
import config from 'pix-certif/config/environment';
import { initialize } from 'pix-certif/instance-initializers/session';
import PixWindow from 'pix-certif/utils/pix-window';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Instance Initializer | session', function (hooks) {
  hooks.beforeEach(function () {
    this.TestApplication = class TestApplication extends Application {
      modulePrefix = config.modulePrefix;
      podModulePrefix = config.podModulePrefix;
      Resolver = Resolver;
    };
    this.TestApplication.instanceInitializer({
      name: 'initializer under test',
      initialize,
    });
    this.application = this.TestApplication.create({ autoboot: false });
    this.instance = this.application.buildInstance();
  });
  hooks.afterEach(function () {
    this.instance.destroy();
    this.application.destroy();
    sinon.restore();
  });

  module('when a session exists', function () {
    module('when a user tries to join a certification center through an invitation', function () {
      test('it should remove the current session before the application loads', async function (assert) {
        // given
        const key = 'ember_simple_auth-session';
        sinon.stub(PixWindow, 'getLocation').returns({ pathname: '/rejoindre?invitationId=1&code=ABCDEF123' });
        window.localStorage.setItem(
          key,
          JSON.stringify({
            authenticated: {
              authenticator: 'authenticator:oauth2',
              token_type: 'bearer',
              access_token: 'access_token',
              user_id: 1,
              refresh_token: 'refresh_token',
              expires_in: 45,
              expires_at: 1667837187635,
            },
          }),
        );

        // when
        await this.instance.boot();

        // then
        const session = window.localStorage.getItem(key);
        assert.strictEqual(session, null);
      });
    });
  });
});
