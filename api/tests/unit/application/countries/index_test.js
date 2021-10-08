const { expect, HttpTestServer, sinon } = require('../../../test-helper');

const moduleUnderTest = require('../../../../lib/application/countries');
const countryController = require('../../../../lib/application/countries/country-controller');

describe('Unit | Router | country-router', function () {
  describe('GET /api/countries', function () {
    it('should exist', async function () {
      // given
      sinon.stub(countryController, 'findCountries').callsFake((request, h) => h.response().code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/countries');

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
