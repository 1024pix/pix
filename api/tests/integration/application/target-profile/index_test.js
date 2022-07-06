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
    sinon.stub(securityPreHandlers, 'adminMemberHasAtLeastOneAccessOf').returns(() => true);
  });

  describe('GET api/admin/target-profiles/{id}', function () {
    it('should return a target profile', async function () {
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
        'tubes-selection': [],
      });
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
