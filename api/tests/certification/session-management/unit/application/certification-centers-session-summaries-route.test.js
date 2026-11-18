import { expect } from 'chai';
import sinon from 'sinon';

import { certificationCenterController } from '../../../../../src/certification/session-management/application/certification-centers-session-summaries-controller.js';
import { certificationCentersSessionSummariesRoute as moduleUnderTest } from '../../../../../src/certification/session-management/application/certification-centers-session-summaries-route.js';
import { ForbiddenAccess } from '../../../../../src/shared/domain/errors.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Certification | Session-management | Unit | Application | Routes | session-summaries', function () {
  describe('GET /api/certification-centers/{id}/session-summaries', function () {
    it('should return 200', async function () {
      // given
      sinon.stub(certificationCenterController, 'findPaginatedFilteredSessionSummaries').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/certification-centers/123/session-summaries');

      // then
      expect(response.statusCode).to.equal(200);
      sinon.assert.calledOnce(certificationCenterController.findPaginatedFilteredSessionSummaries);
    });

    it('should return 400 when certification center id is not a number', async function () {
      // given
      sinon.stub(certificationCenterController, 'findPaginatedFilteredSessionSummaries').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/certification-centers/invalid/session-summaries');

      // then
      expect(response.statusCode).to.equal(400);
    });

    describe('filters', function () {
      it('should return 400 when filter sessionId is not a number', async function () {
        // given
        sinon.stub(certificationCenterController, 'findPaginatedFilteredSessionSummaries').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request(
          'GET',
          '/api/certification-centers/1/session-summaries?filter[sessionId]=abc',
        );

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('should return 400 when filter startDate is not a valid date', async function () {
        // given
        sinon.stub(certificationCenterController, 'findPaginatedFilteredSessionSummaries').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request(
          'GET',
          '/api/certification-centers/1/session-summaries?filter[startDate]=2020-13-01',
        );

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('should return 400 when filter endDate is not a valid date', async function () {
        // given
        sinon.stub(certificationCenterController, 'findPaginatedFilteredSessionSummaries').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request(
          'GET',
          '/api/certification-centers/1/session-summaries?filter[endDate]=2020-13-01',
        );

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    describe('sort', function () {
      it('should return 400 when date sort query param has not a valid value', async function () {
        // given
        sinon.stub(certificationCenterController, 'findPaginatedFilteredSessionSummaries').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request(
          'GET',
          '/api/certification-centers/1/session-summaries?sort[date]=2020-13-01',
        );

        // then
        expect(response.statusCode).to.equal(400);
        expect(response.result.errors[0].detail).to.include('"sort.date" must be one of [asc, desc]');
      });

      it('should return 400 when unexpected sort query param is set', async function () {
        // given
        sinon.stub(certificationCenterController, 'findPaginatedFilteredSessionSummaries').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request(
          'GET',
          '/api/certification-centers/1/session-summaries?sort[ANOTHER]',
        );

        // then
        expect(response.statusCode).to.equal(400);
        expect(response.result.errors[0].detail).to.include('"sort.ANOTHER" is not allowed');
      });
    });

    it('should return 403 when controller throws a ForbiddenAccess error', async function () {
      // given
      sinon
        .stub(certificationCenterController, 'findPaginatedFilteredSessionSummaries')
        .rejects(new ForbiddenAccess('User is not a member of certification center'));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/certification-centers/1/session-summaries');

      // then
      expect(response.statusCode).to.equal(403);
    });
  });
});
