import { schoolController } from '../../../../src/school/application/school-controller.js';
import * as moduleUnderTest from '../../../../src/school/application/school-route.js';
import { Division } from '../../../../src/school/domain/models/Division.js';
import { usecases } from '../../../../src/school/domain/usecases/index.js';
import { securityPreHandlers } from '../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../test-helper.js';

describe('Unit | Router | school-router', function () {
  describe('GET /api/pix1d/schools/:code', function () {
    it('should return 200 if the school is found', async function () {
      // given
      sinon.stub(schoolController, 'getSchool').callsFake((request, h) => h.response('ok'));

      sinon.stub(securityPreHandlers, 'checkPix1dActivated').callsFake((request, h) => h.response());
      sinon.stub(securityPreHandlers, 'checkSchoolSessionIsActive').callsFake((request, h) => h.response());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/pix1d/schools?code=AZERTY123');

      // then
      expect(response.statusCode).to.equal(200);
      expect(securityPreHandlers.checkPix1dActivated).to.have.been.called;
      expect(securityPreHandlers.checkSchoolSessionIsActive).to.have.been.called;
    });
  });

  describe('POST /api/pix1d/schools/{organizationId}/session/activate', function () {
    context('when user does not belong to organization', function () {
      it('should return 403', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'checkUserBelongsToOrganization')
          .callsFake((request, h) => h.response().code(403).takeover());
        sinon.stub(schoolController, 'activateSchoolSession');

        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('POST', '/api/pix1d/schools/123456/session/activate');

        // then
        expect(response.statusCode).to.equal(403);
        expect(schoolController.activateSchoolSession).to.not.have.been.called;
      });
    });

    context('when user belongs to organization', function () {
      it('should return 204', async function () {
        // given
        sinon.stub(securityPreHandlers, 'checkUserBelongsToOrganization').callsFake((_, h) => h.response(true));
        sinon.spy(schoolController, 'activateSchoolSession');
        sinon.stub(usecases, 'activateSchoolSession').returns('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('POST', '/api/pix1d/schools/123456/session/activate');

        // then
        expect(schoolController.activateSchoolSession).to.have.been.called;
        expect(usecases.activateSchoolSession).to.have.been.calledWith({ organizationId: 123456 });
        expect(response.statusCode).to.equal(204);
      });
    });
  });

  describe('GET /api/pix1d/schools/{organizationId}/divisions', function () {
    context('when user does not belong to organization', function () {
      it('should return 403', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'checkUserBelongsToOrganization')
          .callsFake((_, h) => h.response().code(403).takeover());
        sinon.stub(schoolController, 'getDivisions');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('GET', '/api/pix1d/schools/123456/divisions');

        // then
        expect(response.statusCode).to.equal(403);
        expect(schoolController.getDivisions).to.not.have.been.called;
      });
    });

    context('when user belongs to organization', function () {
      it('should return 200', async function () {
        // given
        sinon.stub(securityPreHandlers, 'checkUserBelongsToOrganization').callsFake((_, h) => h.response(true));
        sinon.spy(schoolController, 'getDivisions');
        sinon.stub(usecases, 'getDivisions').returns([new Division({ name: 'CM2' })]);
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('GET', '/api/pix1d/schools/123456/divisions');

        // then
        expect(schoolController.getDivisions).to.have.been.called;
        expect(usecases.getDivisions).to.have.been.calledWith({ organizationId: 123456 });
        expect(response.statusCode).to.equal(200);
      });
    });
  });
});
