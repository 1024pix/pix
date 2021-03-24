const { expect, sinon, HttpTestServer } = require('../../../test-helper');

const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const targetProfileController = require('../../../../lib/application/target-profiles/target-profile-controller');
const moduleUnderTest = require('../../../../lib/application/target-profiles');

describe('Integration | Application | Target Profiles | Routes', function() {

  let httpTestServer;

  beforeEach(function() {
    sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));
    sinon.stub(targetProfileController, 'findPaginatedFilteredTargetProfiles').callsFake((request, h) => h.response('ok').code(200));
    sinon.stub(targetProfileController, 'getTargetProfileDetails').callsFake((request, h) => h.response('ok').code(200));
    sinon.stub(targetProfileController, 'findPaginatedFilteredTargetProfileOrganizations').callsFake((request, h) => h.response('ok').code(200));
    sinon.stub(targetProfileController, 'updateTargetProfile').callsFake((request, h) => h.response('ok').code(204));
    sinon.stub(targetProfileController, 'createTargetProfile').callsFake((request, h) => h.response('ok').code(200));

    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  describe('POST /api/target-profiles', function() {
    it('should resolve with owner organization id to null', async function() {
      // given
      const method = 'POST';
      const url = '/api/admin/target-profiles';

      const payload = {
        data: {
          attributes: {
            'name': 'MyTargetProfile',
            'owner-organization-id': null,
            'image-url': null,
            'is-public': false,
            'skills-id': ['skill1', 'skill2'],
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should resolve with owner organization id to empty', async function() {
      // given
      const method = 'POST';
      const url = '/api/admin/target-profiles';

      const payload = {
        data: {
          attributes: {
            'name': 'MyTargetProfile',
            'owner-organization-id': '',
            'image-url': null,
            'is-public': false,
            'skills-id': ['skill1', 'skill2'],
          },
        },
      };
      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should reject with alphanumeric owner organization id ', async function() {
      // given
      const method = 'POST';
      const url = '/api/admin/target-profiles';

      const payload = {
        data: {
          attributes: {
            'name': 'MyTargetProfile',
            'owner-organization-id': 'ABC',
            'image-url': null,
            'is-public': false,
            'skills-id': ['skill1', 'skill2'],
          },
        },
      };
      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('GET /api/target-profiles', function() {

    it('should resolve when there is no filter nor pagination', async function() {
      // given
      const method = 'GET';
      const url = '/api/admin/target-profiles';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should resolve when there are filters and pagination', async function() {
      // given
      const method = 'GET';
      const url = '/api/admin/target-profiles?filter[id]=1&filter[name]=azerty&page[size]=10&page[number]=1';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should reject request with HTTP code 400, when id is not an integer', async function() {
      // given
      const method = 'GET';
      const url = '/api/admin/target-profiles?filter[id]=azerty';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should reject request with HTTP code 400, when page size is not an integer', async function() {
      // given
      const method = 'GET';
      const url = '/api/admin/target-profiles?page[size]=azerty';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should reject request with HTTP code 400, when page number is not an integer', async function() {
      // given
      const method = 'GET';
      const url = '/api/admin/target-profiles?page[number]=azerty';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('GET /api/target-profiles/:id', function() {

    it('should resolve with correct id', async function() {
      // given
      const method = 'GET';
      const url = '/api/admin/target-profiles/1';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should reject request with HTTP code 400', async function() {
      // given
      const method = 'GET';
      const url = '/api/admin/target-profiles/azerty';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('GET /api/target-profiles/:id/organizations', function() {

    it('should resolve when there is no filter nor pagination', async function() {
      // given
      const method = 'GET';
      const url = '/api/admin/target-profiles/1/organizations';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should resolve when there are filters and pagination', async function() {
      // given
      const method = 'GET';
      const url = '/api/admin/target-profiles/1/organizations?filter[name]=azerty&filter[type]=sco&filter[external-id]=abc&page[size]=10&page[number]=1';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should reject request with HTTP code 400, when id is not an integer', async function() {
      // given
      const method = 'GET';
      const url = '/api/admin/target-profiles/azerty/organizations';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should reject request with HTTP code 400, when page size is not an integer', async function() {
      // given
      const method = 'GET';
      const url = '/api/admin/target-profiles/1/organizations?page[size]=azerty';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should reject request with HTTP code 400, when page number is not an integer', async function() {
      // given
      const method = 'GET';
      const url = '/api/admin/target-profiles/1/organizations?page[number]=azerty';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });
  describe('PATCH /api/target-profiles', function() {

    it('should exist', async function() {
      // given
      const method = 'PATCH';
      const payload = { data: {
        attributes: {
          name: 'test',
        },
      } };
      const url = '/api/admin/target-profiles/123';

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('should return a 400 error when payload does not exist', async function() {
      // given
      const method = 'PATCH';
      const payload = { data: {
        attributes: {
          name: undefined,
        },
      } };
      const url = '/api/admin/target-profiles/123';

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    describe('when user does not have a Pix Master role', function() {

      const method = 'PATCH';
      const payload = { data: {
        attributes: {
          name: 'Not Pix Admin',
        },
      } };
      const url = '/api/admin/target-profiles/9999999';

      it('should resolve a 403 HTTP response', async function() {
        //Given
        securityPreHandlers.checkUserHasRolePixMaster.callsFake((request, h) => {
          return Promise.resolve(h.response().code(403).takeover());
        });

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(403);
      });

    });

  });
});
