import { expect } from '../../../../test-helper';
import createServer from '../../../../../server';
import OidcIdentityProviders from '../../../../../lib/domain/constants/oidc-identity-providers';
import querystring from 'querystring';

describe('Acceptance | Route | oidc authentication url', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/oidc/authentication-url', function () {
    context('When the request returns 200', function () {
      it('should return the authentication url for cnav', async function () {
        // given
        const query = querystring.stringify({
          identity_provider: OidcIdentityProviders.CNAV.service.code,
          redirect_uri: 'http://app.pix.fr/connexion/cnav',
        });

        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/oidc/authentication-url?${query}`,
        });

        // then
        function _checkIfValidUUID(str) {
          const regexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
          return regexExp.test(str);
        }

        expect(response.statusCode).to.equal(200);
        expect(_checkIfValidUUID(response.result.state)).to.be.true;
        expect(_checkIfValidUUID(response.result.nonce)).to.be.true;

        const redirectTargetUrl = new URL(response.result.redirectTarget);

        expect(redirectTargetUrl.origin).to.equal('http://idp.cnav');
        expect(redirectTargetUrl.pathname).to.equal('/auth');
        expect(redirectTargetUrl.searchParams.get('redirect_uri')).to.equal('http://app.pix.fr/connexion/cnav');
        expect(redirectTargetUrl.searchParams.get('client_id')).to.equal('PIX_CNAV_CLIENT_ID');
        expect(redirectTargetUrl.searchParams.get('response_type')).to.equal('code');
        expect(redirectTargetUrl.searchParams.get('scope')).to.equal('openid profile');
      });

      it('should return the authentication url for pole emploi', async function () {
        // given
        const query = querystring.stringify({
          identity_provider: OidcIdentityProviders.POLE_EMPLOI.service.code,
          redirect_uri: 'http://app.pix.fr/connexion/pole-emploi',
        });

        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/oidc/authentication-url?${query}`,
        });

        // then
        function _checkIfValidUUID(str) {
          const regexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
          return regexExp.test(str);
        }

        expect(response.statusCode).to.equal(200);
        expect(_checkIfValidUUID(response.result.state)).to.be.true;
        expect(_checkIfValidUUID(response.result.nonce)).to.be.true;

        const redirectTargetUrl = new URL(response.result.redirectTarget);

        expect(redirectTargetUrl.origin).to.equal('http://authurl.fr');
        expect(redirectTargetUrl.searchParams.get('redirect_uri')).to.equal('http://app.pix.fr/connexion/pole-emploi');
        expect(redirectTargetUrl.searchParams.get('client_id')).to.equal('PIX_POLE_EMPLOI_CLIENT_ID');
        expect(redirectTargetUrl.searchParams.get('response_type')).to.equal('code');
        expect(redirectTargetUrl.searchParams.get('realm')).to.equal('/individu');
        expect(redirectTargetUrl.searchParams.get('scope')).to.equal(
          'application_PIX_POLE_EMPLOI_CLIENT_ID api_peconnect-individuv1 openid profile serviceDigitauxExposition api_peconnect-servicesdigitauxv1'
        );
      });
    });
  });
});
