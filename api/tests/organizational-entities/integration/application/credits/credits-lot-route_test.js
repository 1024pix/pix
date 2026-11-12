import { expect } from 'chai';
import sinon from 'sinon';

import { creditsLotController } from '../../../../../src/organizational-entities/application/credits/credits-lot.admin.controller.js';
import { creditsLotsAdminRoute } from '../../../../../src/organizational-entities/application/credits/credits-lot.admin.route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Integration | Organizational Entities | Application | Route | credits', function () {
  const url = '/api/admin/organizations/1/credits-lots';

  const VALID_ATTRIBUTES = {
    count: 50,
    reference: 'CONV-2026-042',
    'activation-date': '2026-01-01',
    'expiration-date': '2026-12-31',
  };

  const payloadWith = (attributes) => ({ data: { type: 'credits-lots', attributes } });

  const forbid = () => (request, h) =>
    h
      .response({ errors: new Error('forbidden') })
      .code(403)
      .takeover();

  beforeEach(function () {
    sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
    sinon.stub(securityPreHandlers, 'makeCheckOrganizationHasFeature').returns(() => true);
    sinon.stub(creditsLotController, 'create').callsFake((request, h) => h.response({}).created());
  });

  const startServer = async function () {
    const httpTestServer = new HttpTestServer();
    await httpTestServer.register(creditsLotsAdminRoute);
    return httpTestServer;
  };

  context('request validation', function () {
    it('accepts a well-formed request', async function () {
      // given
      const httpTestServer = await startServer();

      // when
      const response = await httpTestServer.request('POST', url, payloadWith(VALID_ATTRIBUTES));

      // then
      expect(response.statusCode).to.equal(201);
    });

    it('returns 400 when the organization id is not a number', async function () {
      // given
      const httpTestServer = await startServer();

      // when
      const response = await httpTestServer.request(
        'POST',
        '/api/admin/organizations/not-a-number/credits-lots',
        payloadWith(VALID_ATTRIBUTES),
      );

      // then
      expect(response.statusCode).to.equal(400);
      expect(creditsLotController.create).to.not.have.been.called;
    });

    it('returns 400 when the payload is not a JSON:API document', async function () {
      // given
      const httpTestServer = await startServer();

      // when
      const response = await httpTestServer.request('POST', url, { count: 50 });

      // then
      expect(response.statusCode).to.equal(400);
      expect(creditsLotController.create).to.not.have.been.called;
    });

    it('returns 400 when the payload has no data', async function () {
      // given
      const httpTestServer = await startServer();

      // when
      const response = await httpTestServer.request('POST', url, {});

      // then
      expect(response.statusCode).to.equal(400);
      expect(creditsLotController.create).to.not.have.been.called;
    });
  });

  context('pre-handlers', function () {
    it('returns 403 when the user has no admin role', async function () {
      // given
      securityPreHandlers.hasAtLeastOneAccessOf.returns(forbid());
      const httpTestServer = await startServer();

      // when
      const response = await httpTestServer.request('POST', url, payloadWith(VALID_ATTRIBUTES));

      // then
      expect(response.statusCode).to.equal(403);
      expect(creditsLotController.create).to.not.have.been.called;
    });

    it('returns 403 when the organization does not have the credits feature', async function () {
      // given
      securityPreHandlers.makeCheckOrganizationHasFeature.returns(forbid());
      const httpTestServer = await startServer();

      // when
      const response = await httpTestServer.request('POST', url, payloadWith(VALID_ATTRIBUTES));

      // then
      expect(response.statusCode).to.equal(403);
      expect(creditsLotController.create).to.not.have.been.called;
    });
  });
});
