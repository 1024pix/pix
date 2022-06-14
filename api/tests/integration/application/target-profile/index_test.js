const { expect, sinon, domainBuilder, HttpTestServer } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const targetProfilesRouter = require('../../../../lib/application/target-profiles');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Integration | Application | Route | target-profile-router', function () {
  let httpTestServer;
  beforeEach(async function () {
    httpTestServer = new HttpTestServer();
    await httpTestServer.register(targetProfilesRouter);
    sinon.stub(securityPreHandlers, 'userHasAtLeastOneAccessOf').returns(() => true);
  });

  describe('GET /api/admin/target-profile-templates/{id}', function () {
    let targetProfileTemplateId, targetProfileTemplate;
    const targetProfileTemplateNotFoundId = 456;

    beforeEach(async function () {
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
              tubes: [{ id: 'tubeId1', level: 8 }],
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

  describe('GET api/admin/target-profiles/{id}', function () {
    it('should return a target profile with template', async function () {
      // given
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({
        id: 1,
        name: 'target-profile',
        createdAt: '2021-04-30',
        outdated: '2024-05-23',
        isPublic: false,
        ownerOrganizationId: 2,
        description: 'description',
        comment: 'comment',
        imageUrl: 'imageUrl',
        skills: [],
        tubes: [],
        competences: [],
        areas: [],
        isSimplifiedAccess: false,
        template: domainBuilder.buildTargetProfileTemplate({ id: 123 }),
      });

      sinon
        .stub(usecases, 'getTargetProfileDetails')
        .withArgs({ targetProfileId: targetProfile.id })
        .resolves(targetProfile);

      // when
      const response = await httpTestServer.request('GET', `/api/admin/target-profiles/${targetProfile.id}`);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data.id).to.equal('1');
      expect(response.result.data.attributes).to.deep.equal({
        name: 'target-profile',
        'created-at': '2021-04-30',
        outdated: '2024-05-23',
        'is-public': false,
        'owner-organization-id': 2,
        description: 'description',
        category: 'OTHER',
        comment: 'comment',
        'image-url': 'imageUrl',
        'is-simplified-access': false,
      });
      expect(response.result.data.relationships.template).to.deep.equal({
        data: {
          id: '123',
          type: 'target-profile-templates',
        },
      });
    });

    it('should return a target profile without template', async function () {
      // given
      const targetProfile = domainBuilder.buildTargetProfileWithLearningContent({
        id: 1,
        name: 'target-profile',
        createdAt: '2021-04-30',
        outdated: '2024-05-23',
        isPublic: false,
        ownerOrganizationId: 2,
        description: 'description',
        comment: 'comment',
        imageUrl: 'imageUrl',
        skills: [],
        tubes: [],
        competences: [],
        areas: [],
        isSimplifiedAccess: false,
        template: null,
      });

      sinon
        .stub(usecases, 'getTargetProfileDetails')
        .withArgs({ targetProfileId: targetProfile.id })
        .resolves(targetProfile);

      // when
      const response = await httpTestServer.request('GET', `/api/admin/target-profiles/${targetProfile.id}`);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data.id).to.equal('1');
      expect(response.result.data.attributes).to.deep.equal({
        name: 'target-profile',
        'created-at': '2021-04-30',
        outdated: '2024-05-23',
        'is-public': false,
        'owner-organization-id': 2,
        description: 'description',
        category: 'OTHER',
        comment: 'comment',
        'image-url': 'imageUrl',
        'is-simplified-access': false,
      });
      expect(response.result.data.relationships.template).to.deep.equal({ data: null });
    });

    describe('when target profile id is not found', function () {
      it('should return 404 status code', async function () {
        // given
        sinon.stub(usecases, 'getTargetProfileDetails').withArgs({ targetProfileId: 666 }).rejects(new NotFoundError());

        // when
        const response = await httpTestServer.request('GET', `/api/admin/target-profiles/666`);

        // then
        expect(response.statusCode).to.equal(404);
      });
    });
  });
});
