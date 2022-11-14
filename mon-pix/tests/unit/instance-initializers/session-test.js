import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import Application from '@ember/application';
import { initialize } from 'mon-pix/instance-initializers/session';
import { run } from '@ember/runloop';
import Resolver from 'ember-resolver';
import PixWindow from 'mon-pix/utils/pix-window';
import sinon from 'sinon';

describe('Unit | Instance Initializer | session', function () {
  beforeEach(function () {
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
  });
  afterEach(function () {
    run(this.instance, 'destroy');
    run(this.application, 'destroy');

    sinon.restore();
  });

  context('when a session exists', function () {
    context('when a user finalizes a GAR authentication process', function () {
      it('should remove the current session before the application loads', async function () {
        // given
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
        expect(session).to.be.null;
      });
    });

    context('when current URL contains externalUser as query parameter', function () {
      it('should remove the current session before the application loads', async function () {
        // given
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
        expect(session).to.be.null;
      });
    });
  });
});
