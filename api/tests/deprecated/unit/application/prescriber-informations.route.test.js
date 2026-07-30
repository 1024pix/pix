import sinon from 'sinon';

import { deprecatedRoutes } from '../../../../src/deprecated/application/routes.js';
import { usecases } from '../../../../src/deprecated/domain/usecases/index.js';
import { securityPreHandlers } from '../../../../src/shared/application/security-pre-handlers.js';
import { expect } from '../../../test-helper.js';
import { domainBuilder } from '../../../tooling/domain-builder/domain-builder.js';
import { HttpTestServer } from '../../../tooling/server/http-test-server.js';

describe('Deprecated | Unit | Application | Route | prescriber-informations', function () {
  let httpTestServer;

  beforeEach(async function () {
    sinon.stub(securityPreHandlers, 'checkRequestedUserIsAuthenticatedUser');
    sinon.stub(usecases, 'getPrescriber');
    httpTestServer = new HttpTestServer();
    await httpTestServer.register(deprecatedRoutes);
  });

  describe('GET /api/prescription/prescribers/{id}', function () {
    it('should exist', async function () {
      // given
      securityPreHandlers.checkRequestedUserIsAuthenticatedUser.callsFake((request, h) => h.response(true));
      const prescriber = domainBuilder.buildPrescriber();
      usecases.getPrescriber.resolves(prescriber);

      // when
      const response = await httpTestServer.request('GET', '/api/prescription/prescribers/123', null, {
        credentials: { userId: '123' },
        strategy: {},
      });

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should return a 400 when id in param is not a number"', async function () {
      // when
      const response = await httpTestServer.request('GET', '/api/prescription/prescribers/NOT_A_NUMBER');

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return a 403 HTTP response when not authenticated', async function () {
      // given
      securityPreHandlers.checkRequestedUserIsAuthenticatedUser.callsFake((request, h) => {
        return Promise.resolve(h.response().code(403).takeover());
      });

      // when
      const response = await httpTestServer.request('GET', '/api/prescription/prescribers/123', null, {
        credentials: { userId: null },
        strategy: {},
      });

      // then
      expect(response.statusCode).to.equal(403);
    });
  });
});
