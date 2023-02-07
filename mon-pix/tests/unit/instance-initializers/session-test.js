import { module, test } from 'qunit';
import Application from '@ember/application';
import { initialize } from 'mon-pix/instance-initializers/session';
import { run } from '@ember/runloop';
import Resolver from 'ember-resolver';
import PixWindow from 'mon-pix/utils/pix-window';
import sinon from 'sinon';

module('Unit | Instance Initializer | session', function () {
  module('when a session exists', function () {
    module('when a user finalizes a GAR authentication process', function () {
      test('it removes the current session before the application loads', async function (assert) {
        // given
        run(() => {
          // eslint-disable-next-line ember/no-classic-classes
          this.TestApplication = Application.extend();
          this.TestApplication.instanceInitializer({
            name: 'initializer under test',
            initialize,
          });
          this.application = this.TestApplication.create({ autoboot: false, Resolver, modulePrefix: 'mon-pix-test' });
          this.instance = this.application.buildInstance();
        });
        const key = 'ember_simple_auth-session';
        sinon.stub(PixWindow, 'getLocationHref').returns('/connexion/gar#access_token');
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
          })
        );

        // when
        await this.instance.boot();

        // then
        const session = window.localStorage.getItem(key);
        assert.notOk(session);
        run(this.instance, 'destroy');
        run(this.application, 'destroy');
        sinon.restore();
      });
    });

    module('when current URL contains externalUser as query parameter', function () {
      test('it removes the current session before the application loads', async function (assert) {
        // given
        run(() => {
          // eslint-disable-next-line ember/no-classic-classes
          this.TestApplication = Application.extend();
          this.TestApplication.instanceInitializer({
            name: 'initializer under test',
            initialize,
          });
          this.application = this.TestApplication.create({ autoboot: false, Resolver, modulePrefix: 'mon-pix-test' });
          this.instance = this.application.buildInstance();
        });
        const key = 'ember_simple_auth-session';
        sinon.stub(PixWindow, 'getLocationHref').returns('/campagnes?externalUser=EXTERNAL_USER_TOKEN');
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
          })
        );

        // when
        await this.instance.boot();

        // then
        const session = window.localStorage.getItem(key);
        assert.notOk(session);
        run(this.instance, 'destroy');
        run(this.application, 'destroy');
        sinon.restore();
      });
    });
  });

  module('when user is anonymously authenticated', function () {
    module('when current URL is a campaign URL', function () {
      test('it removes the current session before the application loads', async function (assert) {
        // given
        run(() => {
          // eslint-disable-next-line ember/no-classic-classes
          this.TestApplication = Application.extend();
          this.TestApplication.instanceInitializer({
            name: 'initializer under test',
            initialize,
          });
          this.application = this.TestApplication.create({ autoboot: false, Resolver, modulePrefix: 'mon-pix-test' });
          this.instance = this.application.buildInstance();
        });
        const key = 'ember_simple_auth-session';
        sinon.stub(PixWindow, 'getLocationHref').returns('/campagnes');
        window.localStorage.setItem(
          key,
          JSON.stringify({
            authenticated: {
              authenticator: 'authenticator:anonymous',
              access_token: 'access_token',
              user_id: 1,
            },
          })
        );

        // when
        await this.instance.boot();

        // then
        const session = window.localStorage.getItem(key);
        assert.notOk(session);
        run(this.instance, 'destroy');
        run(this.application, 'destroy');
        sinon.restore();
      });
    });

    module('when current URL is a campaign URL with a code', function () {
      test('it removes the current session before the application loads', async function (assert) {
        // given
        run(() => {
          // eslint-disable-next-line ember/no-classic-classes
          this.TestApplication = Application.extend();
          this.TestApplication.instanceInitializer({
            name: 'initializer under test',
            initialize,
          });
          this.application = this.TestApplication.create({ autoboot: false, Resolver, modulePrefix: 'mon-pix-test' });
          this.instance = this.application.buildInstance();
        });
        const key = 'ember_simple_auth-session';
        sinon.stub(PixWindow, 'getLocationHref').returns('/campagnes/SIMPLIFIE');
        window.localStorage.setItem(
          key,
          JSON.stringify({
            authenticated: {
              authenticator: 'authenticator:anonymous',
              access_token: 'access_token',
              user_id: 1,
            },
          })
        );

        // when
        await this.instance.boot();

        // then
        const session = window.localStorage.getItem(key);
        assert.notOk(session);
        run(this.instance, 'destroy');
        run(this.application, 'destroy');
        sinon.restore();
      });
    });

    module('when current URL is a campaign tutorial URL with a code', function () {
      test('it removes the current session before the application loads', async function (assert) {
        // given
        run(() => {
          // eslint-disable-next-line ember/no-classic-classes
          this.TestApplication = Application.extend();
          this.TestApplication.instanceInitializer({
            name: 'initializer under test',
            initialize,
          });
          this.application = this.TestApplication.create({ autoboot: false, Resolver, modulePrefix: 'mon-pix-test' });
          this.instance = this.application.buildInstance();
        });
        const key = 'ember_simple_auth-session';
        sinon.stub(PixWindow, 'getLocationHref').returns('/campagnes/SIMPLIFIE/evaluation/didacticiel');
        window.localStorage.setItem(
          key,
          JSON.stringify({
            authenticated: {
              authenticator: 'authenticator:anonymous',
              access_token: 'access_token',
              user_id: 1,
            },
          })
        );

        // when
        await this.instance.boot();

        // then
        const session = window.localStorage.getItem(key);
        assert.notOk(session);
        run(this.instance, 'destroy');
        run(this.application, 'destroy');
        sinon.restore();
      });
    });
  });
});
