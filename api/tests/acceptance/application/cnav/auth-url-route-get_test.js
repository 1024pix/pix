const { expect } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Route | cnav auth-url', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('GET /api/cnav/auth-url', function () {
    context('When the request returns 200', function () {
      it('should return the url of authentication', async function () {
        // when
        const response = await server.inject({
          method: 'GET',
          url: `/api/cnav/auth-url?redirect_uri=${encodeURIComponent('http://app.pix.fr/connexion-cnav')}`,
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
        expect(redirectTargetUrl.searchParams.get('redirect_uri')).to.equal('http://app.pix.fr/connexion-cnav');
        expect(redirectTargetUrl.searchParams.get('client_id')).to.equal('PIX_CNAV_CLIENT_ID');
        expect(redirectTargetUrl.searchParams.get('response_type')).to.equal('code');
        expect(redirectTargetUrl.searchParams.get('scope')).to.equal('openid profile');
      });
    });
  });
});
