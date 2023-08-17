import { countryController } from '../../../../lib/application/countries/country-controller.js';
import * as moduleUnderTest from '../../../../lib/application/countries/index.js';
import { expect, HttpTestServer, sinon } from '../../../test-helper.js';

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
