import { expect } from 'chai';
import { setupTest } from 'ember-mocha';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import Service from '@ember/service';

import ENV from '../../../config/environment';

const AUTHENTICATED_SOURCE_FROM_POLE_EMPLOI = ENV.APP.AUTHENTICATED_SOURCE_FROM_POLE_EMPLOI;

describe('Unit | Authenticator | pole-emploi', function () {
  setupTest();

  describe('#invalidate', function () {
    it('when invalidate session on logout should redirect to right url', async function () {
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
            id_token: 'ajwtToken',
          },
        },
      });

      const authenticator = this.owner.lookup('authenticator:pole-emploi');
      authenticator.session = sessionStub;

      // when
      await authenticator.invalidate();

      // then
      expect(replaceLocationStub.getCall(0).args[0]).to.equal(
        'https://authentification-candidat-r.pe-qvr.fr/compte/deconnexion?redirect_uri=http://localhost.fr:4200/&id_token_hint=ajwtToken'
      );
    });
  });
});
