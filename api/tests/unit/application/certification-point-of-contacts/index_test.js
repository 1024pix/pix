import { expect, HttpTestServer, sinon } from '../../../test-helper.js';
import { certificationPointOfContactController } from '../../../../lib/shared/application/certification-point-of-contacts/certification-point-of-contact-controller.js';
import * as moduleUnderTest from '../../../../lib/shared/application/certification-point-of-contacts/index.js';

describe('Unit | Router | certification-point-of-contact-router', function () {
  describe('GET /api/certification-point-of-contacts/me', function () {
    it('should exist', async function () {
      // given
      sinon.stub(certificationPointOfContactController, 'get').callsFake((request, h) => h.response().code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const result = await httpTestServer.request('GET', '/api/certification-point-of-contacts/me');

      // then
      expect(result.statusCode).to.equal(200);
    });
  });
});
