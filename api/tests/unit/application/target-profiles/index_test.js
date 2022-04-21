const { expect, HttpTestServer, sinon } = require('../../../test-helper');

const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const targetProfileController = require('../../../../lib/application/target-profiles/target-profile-controller');
const moduleUnderTest = require('../../../../lib/application/target-profiles');

describe('Integration | Application | Target Profiles | Routes', function () {
  describe('POST /api/target-profiles', function () {
    it('should resolve with owner organization id to null', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
      sinon.stub(targetProfileController, 'createTargetProfile').callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'POST';
      const url = '/api/admin/target-profiles';
      const payload = {
        data: {
          attributes: {
            name: 'MyTargetProfile',
            'owner-organization-id': null,
            'image-url': null,
            'is-public': false,
            'skill-ids': ['skill1', 'skill2'],
            comment: 'comment',
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should resolve with owner organization id to empty', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
      sinon.stub(targetProfileController, 'createTargetProfile').callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'POST';
      const url = '/api/admin/target-profiles';
      const payload = {
        data: {
          attributes: {
            name: 'MyTargetProfile',
            'owner-organization-id': '',
            'image-url': null,
            'is-public': false,
            'skill-ids': ['skill1', 'skill2'],
            comment: 'comment',
          },
        },
      };
      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should reject with alphanumeric owner organization id ', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'POST';
      const url = '/api/admin/target-profiles';
      const payload = {
        data: {
          attributes: {
            name: 'MyTargetProfile',
            'owner-organization-id': 'ABC',
            'image-url': null,
            'is-public': false,
            'skill-ids': ['skill1', 'skill2'],
            comment: 'comment',
          },
        },
      };
      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('GET /api/target-profiles', function () {
    it('should resolve when there is no filter nor pagination', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
      sinon
        .stub(targetProfileController, 'findPaginatedFilteredTargetProfiles')
        .callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'GET';
      const url = '/api/admin/target-profiles';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should resolve when there are filters and pagination', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
      sinon
        .stub(targetProfileController, 'findPaginatedFilteredTargetProfiles')
        .callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'GET';
      const url = '/api/admin/target-profiles?filter[id]=1&filter[name]=azerty&page[size]=10&page[number]=1';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should reject request with HTTP code 400, when id is not an integer', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'GET';
      const url = '/api/admin/target-profiles?filter[id]=azerty';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should reject request with HTTP code 400, when page size is not an integer', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'GET';
      const url = '/api/admin/target-profiles?page[size]=azerty';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should reject request with HTTP code 400, when page number is not an integer', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'GET';
      const url = '/api/admin/target-profiles?page[number]=azerty';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('GET /api/target-profiles/:id', function () {
    it('should resolve with correct id', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
      sinon
        .stub(targetProfileController, 'getTargetProfileDetails')
        .callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'GET';
      const url = '/api/admin/target-profiles/1';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should reject request with HTTP code 400', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'GET';
      const url = '/api/admin/target-profiles/azerty';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('POST /api/admin/target-profiles/:id/attach-organizations', function () {
    it('should resolve with correct id', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
      sinon.stub(targetProfileController, 'attachOrganizations').callsFake((request, h) => h.response('ok').code(204));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'POST';
      const url = '/api/admin/target-profiles/3/attach-organizations';
      const payload = { 'organization-ids': [1, 2] };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('should reject request with HTTP code 400 when id is a string', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'POST';
      const url = '/api/admin/target-profiles/azerty/attach-organizations';
      const payload = { 'organization-ids': [1, 2] };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should reject request with HTTP code 400 when organization-ids is not an array', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'POST';
      const url = '/api/admin/target-profiles/3/attach-organizations';
      const payload = { 'organization-ids': {} };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should reject request with HTTP code 400 when organization-ids is an array of string', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'POST';
      const url = '/api/admin/target-profiles/3/attach-organizations';
      const payload = { 'organization-ids': ['azerty'] };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should reject request with HTTP code 403 when the user is not authorized', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'checkUserHasRoleSuperAdmin')
        .callsFake((request, h) => h.response().code(403).takeover());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'POST';
      const url = '/api/admin/target-profiles/3/attach-organizations';
      const payload = { 'organization-ids': [1, 2] };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('POST /api/admin/target-profiles/:id/copy-organizations', function () {
    it('should resolve', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
      sinon
        .stub(targetProfileController, 'attachOrganizationsFromExistingTargetProfile')
        .callsFake((request, h) => h.response('ok').code(204));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'POST';
      const url = '/api/admin/target-profiles/3/copy-organizations';
      const payload = { 'target-profile-id': 1 };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('should reject request with HTTP code 400 when id is a string', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'POST';
      const url = '/api/admin/target-profiles/azerty/copy-organizations';
      const payload = { 'target-profile-id': 1 };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should reject request with HTTP code 400 when target profile id is a string', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'POST';
      const url = '/api/admin/target-profiles/3/copy-organizations';
      const payload = { 'target-profile-id': 'azerty' };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should reject request with HTTP code 403 when the user is not authorized', async function () {
      // given
      sinon
        .stub(securityPreHandlers, 'checkUserHasRoleSuperAdmin')
        .callsFake((request, h) => h.response().code(403).takeover());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'POST';
      const url = '/api/admin/target-profiles/3/copy-organizations';
      const payload = { 'target-profile-id': 1 };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(403);
    });
  });

  describe('GET /api/target-profiles/:id/organizations', function () {
    it('should resolve when there is no filter nor pagination', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
      sinon
        .stub(targetProfileController, 'findPaginatedFilteredTargetProfileOrganizations')
        .callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'GET';
      const url = '/api/admin/target-profiles/1/organizations';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should resolve when there are filters and pagination', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
      sinon
        .stub(targetProfileController, 'findPaginatedFilteredTargetProfileOrganizations')
        .callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'GET';
      const url =
        '/api/admin/target-profiles/1/organizations?filter[name]=azerty&filter[type]=sco&filter[external-id]=abc&page[size]=10&page[number]=1';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should reject request with HTTP code 400, when id is not an integer', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'GET';
      const url = '/api/admin/target-profiles/azerty/organizations';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should reject request with HTTP code 400, when page size is not an integer', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'GET';
      const url = '/api/admin/target-profiles/1/organizations?page[size]=azerty';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should reject request with HTTP code 400, when page number is not an integer', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'GET';
      const url = '/api/admin/target-profiles/1/organizations?page[number]=azerty';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('PATCH /api/admin/target-profiles', function () {
    it('should exist', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
      sinon.stub(targetProfileController, 'updateTargetProfile').callsFake((request, h) => h.response('ok').code(204));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'PATCH';
      const payload = {
        data: {
          attributes: {
            name: 'test',
            description: 'description changée.',
            comment: 'commentaire changé.',
            category: 'OTHER',
          },
        },
      };
      const url = '/api/admin/target-profiles/123';

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('should return a 400 error when description is over than 500 characters', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      const description = 'description changée.';
      await httpTestServer.register(moduleUnderTest);

      const method = 'PATCH';
      const payload = {
        data: {
          attributes: {
            name: 'test',
            description: description.repeat(26),
            comment: null,
          },
        },
      };
      const url = '/api/admin/target-profiles/123';

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return a 400 error when comment is over than 500 characters', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      const comment = 'commentaire changé.';
      await httpTestServer.register(moduleUnderTest);

      const method = 'PATCH';
      const payload = {
        data: {
          attributes: {
            name: 'test',
            description: 'good',
            comment: comment.repeat(27),
          },
        },
      };
      const url = '/api/admin/target-profiles/123';

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return a 400 error when the name is not defined', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'PATCH';
      const payload = {
        data: {
          attributes: {
            name: undefined,
          },
        },
      };
      const url = '/api/admin/target-profiles/123';

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    describe('when user does not have a SUPER_ADMIN role', function () {
      const method = 'PATCH';
      const payload = {
        data: {
          attributes: {
            name: 'Not Pix Admin',
            description: null,
            comment: null,
            category: 'OTHER',
          },
        },
      };
      const url = '/api/admin/target-profiles/9999999';

      it('should resolve a 403 HTTP response', async function () {
        //Given
        sinon
          .stub(securityPreHandlers, 'checkUserHasRoleSuperAdmin')
          .callsFake((request, h) => h.response().code(403).takeover());
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });

  describe('PUT /api/target-profiles/{:id}/outdate', function () {
    it('should exist', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
      sinon.stub(targetProfileController, 'outdateTargetProfile').callsFake((request, h) => h.response('ok').code(204));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'PUT';
      const payload = {};
      const url = '/api/admin/target-profiles/123/outdate';

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(204);
    });

    describe('when user does not have a SUPER_ADMIN role', function () {
      const method = 'PUT';
      const payload = {};
      const url = '/api/admin/target-profiles/9999999/outdate';

      it('should resolve a 403 HTTP response', async function () {
        //Given
        sinon
          .stub(securityPreHandlers, 'checkUserHasRoleSuperAdmin')
          .callsFake((request, h) => h.response().code(403).takeover());
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });

  describe('POST /api/target-profiles/{id}/badges', function () {
    it('should return 201 HTTP response', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
      sinon.stub(targetProfileController, 'createBadge').callsFake((request, h) => h.response('ok').code(201));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'POST';
      const payload = {
        data: {
          type: 'badges',
          attributes: {
            key: 'KEY',
            'alt-message': 'alt-message',
            'image-url': 'https://example.net/image.svg',
            message: 'message',
            title: 'title',
            'is-certifiable': false,
            'is-always-visible': true,
          },
        },
      };
      const url = '/api/admin/target-profiles/123/badges';

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(201);
    });

    describe('when user does not have a SUPER_ADMIN role', function () {
      it('should return a 403 HTTP response', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'checkUserHasRoleSuperAdmin')
          .callsFake((request, h) => h.response().code(403).takeover());
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const method = 'POST';
        const payload = {
          data: {
            type: 'badges',
            attributes: {
              key: 'KEY',
              'alt-message': 'alt-message',
              'image-url': 'https://example.net/image.svg',
              message: 'message',
              title: 'title',
              'is-certifiable': false,
              'is-always-visible': true,
            },
          },
        };
        const url = '/api/admin/target-profiles/123/badges';

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    describe('when request payload has wrong format', function () {
      it('should return a 400 HTTP response', async function () {
        // given
        sinon.stub(securityPreHandlers, 'checkUserHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const method = 'POST';
        const payload = { data: { attributes: {} } };
        const url = '/api/admin/target-profiles/123/badges';

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });
});
