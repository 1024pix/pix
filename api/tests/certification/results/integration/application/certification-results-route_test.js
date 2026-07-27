import sinon from 'sinon';

import { certificationResultsController } from '../../../../../src/certification/results/application/certification-results-controller.js';
import { certificationResultsRoute as moduleUnderTest } from '../../../../../src/certification/results/application/certification-results-route.js';
import { NoCertificationResultsToDownloadError } from '../../../../../src/certification/results/domain/errors.js';
import { PIX_ADMIN } from '../../../../../src/shared/constants.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

const { ROLES } = PIX_ADMIN;

describe('Integration | Certification | Results | Application | certification-results-route', function () {
  describe('GET /api/admin/sessions/download-selection-results', function () {
    const getHeaders = (userId) => generateAuthenticatedUserRequestHeaders({ userId });
    let httpTestServer;
    let method, url, payload;
    let sessionId;

    beforeEach(async function () {
      sinon.stub(certificationResultsController, 'downloadSelectedSessionsResults').resolves('ok');

      httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      httpTestServer.setupAuthentication();

      sessionId = databaseBuilder.factory.buildSession().id;
      await databaseBuilder.commit();

      method = 'GET';
      url = '/api/admin/sessions/download-selection-results?sessionIds=1';
      payload = {
        sessionIds: [sessionId],
      };
    });

    it('should return a 401 status code when calling route unauthenticated', async function () {
      // given
      const headers = {
        authorization: null,
      };

      // when
      const response = await httpTestServer.request(method, url, payload, null, headers);

      // then
      expect(response.statusCode).to.equal(401);
    });

    [ROLES.CERTIF, ROLES.SUPPORT, ROLES.SUPER_ADMIN].forEach((role) => {
      it(`should return a 200 status code when calling route with a user with ${role} role`, async function () {
        // given
        const userId = databaseBuilder.factory.buildUser.withRole({ role }).id;
        await databaseBuilder.commit();

        // when
        const response = await httpTestServer.request(method, url, payload, null, getHeaders(userId));

        // then
        expect(response.statusCode).to.equal(200);
        expect(certificationResultsController.downloadSelectedSessionsResults).to.have.been.calledOnce;
      });
    });

    it('should return a 403 status code when calling route with a user with METIER role', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser.withRole({ role: ROLES.METIER }).id;
      await databaseBuilder.commit();

      // when
      const response = await httpTestServer.request(method, url, payload, null, getHeaders(userId));

      // then
      expect(response.statusCode).to.equal(403);
    });

    it('should return a 422 status code when no selected session has certification results to download', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser.withRole({ role: ROLES.SUPER_ADMIN }).id;
      await databaseBuilder.commit();
      certificationResultsController.downloadSelectedSessionsResults.rejects(
        new NoCertificationResultsToDownloadError(),
      );

      // when
      const response = await httpTestServer.request(method, url, payload, null, getHeaders(userId));

      // then
      expect(response.statusCode).to.equal(422);
      expect(response.result.errors[0].code).to.equal('NO_CERTIFICATION_RESULTS_TO_DOWNLOAD');
    });

    it('should return a 400 status code when no sessionId is set in query parameters', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser.withRole({ role: ROLES.SUPER_ADMIN }).id;
      await databaseBuilder.commit();

      // when
      const response = await httpTestServer.request(
        method,
        '/api/admin/sessions/download-selection-results?sessionId',
        payload,
        null,
        getHeaders(userId),
      );

      // then
      expect(response.statusCode).to.equal(400);
    });
  });
});
