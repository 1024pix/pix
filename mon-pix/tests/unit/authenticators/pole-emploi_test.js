import { expect } from 'chai';
import { setupTest } from 'ember-mocha';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import Service from '@ember/service';
import * as fetch from 'fetch';

import ENV from '../../../config/environment';

const AUTHENTICATED_SOURCE_FROM_POLE_EMPLOI = ENV.APP.AUTHENTICATED_SOURCE_FROM_POLE_EMPLOI;

describe('Unit | Authenticator | pole-emploi', function () {
  setupTest();

  describe('#invalidate', function () {
    context('when user still has an idToken in their session', function () {
      it('should redirect to the correct url', async function () {
        // given
        const replaceLocationStub = sinon.stub().resolves();
        this.owner.register(
          'service:location',
          // eslint-disable-next-line ember/no-classic-classes
          Service.extend({
            replace: replaceLocationStub,
          })
        );

        const sessionStub = Service.create({
          isAuthenticated: true,
          data: {
            authenticated: {
              source: AUTHENTICATED_SOURCE_FROM_POLE_EMPLOI,
              id_token: 'ID_TOKEN',
            },
          },
        });

        const authenticator = this.owner.lookup('authenticator:pole-emploi');
        authenticator.session = sessionStub;

        // when
        await authenticator.invalidate();

        // then
        expect(replaceLocationStub.getCall(0).args[0]).to.equal(
          'https://authentification-candidat-r.pe-qvr.fr/compte/deconnexion?id_token_hint=ID_TOKEN'
        );
      });
    });

    context('when user has logoutUrlUUID in their session', function () {
      it('should redirect to the correct url', async function () {
        // given
        const replaceLocationStub = sinon.stub().resolves();
        this.owner.register(
          'service:location',
          // eslint-disable-next-line ember/no-classic-classes
          Service.extend({
            replace: replaceLocationStub,
          })
        );
        const sessionStub = Service.create({
          isAuthenticated: true,
          data: {
            authenticated: {
              source: AUTHENTICATED_SOURCE_FROM_POLE_EMPLOI,
              logout_url_uuid: 'da689777-0158-4bfc-ae21-ee6fcd41e62c',
            },
          },
        });
        const authenticator = this.owner.lookup('authenticator:pole-emploi');
        authenticator.session = sessionStub;
        sinon.stub(fetch, 'default').resolves({
          json: () =>
            new Promise((resolve) =>
              resolve({
                redirectLogoutUrl:
                  'http://identity_provider_base_url/deconnexion?id_token_hint=ID_TOKEN&redirect_uri=http%3A%2F%2Flocalhost.fr%3A4200%2Fconnexion',
              })
            ),
        });

        // when
        await authenticator.invalidate();

        // then
        expect(replaceLocationStub.getCall(0).args[0]).to.equal(
          'http://identity_provider_base_url/deconnexion?id_token_hint=ID_TOKEN&redirect_uri=http%3A%2F%2Flocalhost.fr%3A4200%2Fconnexion'
        );
      });
    });
  });
});
