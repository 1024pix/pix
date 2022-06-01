const { expect, sinon, domainBuilder, HttpTestServer } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const targetProfilesRouter = require('../../../../lib/application/target-profiles');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Integration | Application | Route | target-profile-router', function () {
  describe('GET /api/admin/target-profile-templates/{id}', function () {
    let httpTestServer, targetProfileTemplateId, targetProfileTemplate;
    const targetProfileTemplateNotFoundId = 456;

    beforeEach(async function () {
      httpTestServer = new HttpTestServer();
      await httpTestServer.register(targetProfilesRouter);
      sinon.stub(securityPreHandlers, 'userHasAtLeastOneAccessOf').returns(() => true);
      targetProfileTemplate = domainBuilder.buildTargetProfileTemplate();
    });

    describe('When templateId is found', function () {
      beforeEach(async function () {
        targetProfileTemplateId = targetProfileTemplate.id;
        sinon
          .stub(usecases, 'getTargetProfileTemplate')
          .withArgs({ targetProfileTemplateId })
          .resolves(targetProfileTemplate);
      });

      it('should return status code 200 OK', async function () {
        // when
        const response = await httpTestServer.request(
          'GET',
          `/api/admin/target-profile-templates/${targetProfileTemplateId}`
        );

        // then
        expect(response.statusCode).to.equal(200);
      });

      it('should return target profile template data', async function () {
        // when
        const response = await httpTestServer.request(
          'GET',
          `/api/admin/target-profile-templates/${targetProfileTemplateId}`
        );

        // then
        expect(response.result).to.deep.equal({
          data: {
            type: 'target-profile-templates',
            id: `${targetProfileTemplateId}`,
            attributes: {
              tubes: [{ 'tube-id': 'tubeId1', level: 8 }],
            },
          },
        });
      });
    });
    describe('When templateId is not found', function () {
      it('should return a 404 error', async function () {
        // given
        sinon.stub(usecases, 'getTargetProfileTemplate').rejects(new NotFoundError());

        // when
        const response = await httpTestServer.request(
          'GET',
          `/api/admin/target-profile-templates/${targetProfileTemplateNotFoundId}`
        );

        // then
        expect(response.statusCode).to.equal(404);
      });
    });
    describe('When provided ID is not a number', function () {
      it('should return a 400 error', async function () {
        // when
        const response = await httpTestServer.request('GET', `/api/admin/target-profile-templates/coucou`);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });
});
