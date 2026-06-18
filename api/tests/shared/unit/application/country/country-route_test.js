import sinon from 'sinon';

import { countryController } from '../../../../../src/shared/application/country/country-controller.js';
import { countryRoute as moduleUnderTest } from '../../../../../src/shared/application/country/country-route.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Unit | Shared | Application | Router| country-route', function () {
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
