const { expect, sinon, HttpTestServer } = require('../../../test-helper');

const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const targetProfileController = require('../../../../lib/application/target-profiles/target-profile-controller');
const moduleUnderTest = require('../../../../lib/application/target-profiles');

describe('Integration | Application | Target Profiles | Routes', () => {

  let httpTestServer;

  beforeEach(() => {
    sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster').callsFake((request, h) => h.response(true));
    sinon.stub(targetProfileController, 'findPaginatedFilteredTargetProfiles').callsFake((request, h) => h.response('ok').code(200));
    sinon.stub(targetProfileController, 'getTargetProfileDetails').callsFake((request, h) => h.response('ok').code(200));
    sinon.stub(targetProfileController, 'findPaginatedFilteredTargetProfileOrganizations').callsFake((request, h) => h.response('ok').code(200));

    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  describe('GET /api/target-profiles', () => {

    it('should resolve when there is no filter nor pagination', async () => {
      // given
      const method = 'GET';
      const url = '/api/admin/target-profiles';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should resolve when there are filters and pagination', async () => {
      // given
      const method = 'GET';
      const url = '/api/admin/target-profiles?filter[id]=1&filter[name]=azerty&page[size]=10&page[number]=1';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should reject request with HTTP code 400, when id is not an integer', async () => {
      // given
      const method = 'GET';
      const url = '/api/admin/target-profiles?filter[id]=azerty';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should reject request with HTTP code 400, when page size is not an integer', async () => {
      // given
      const method = 'GET';
      const url = '/api/admin/target-profiles?page[size]=azerty';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should reject request with HTTP code 400, when page number is not an integer', async () => {
      // given
      const method = 'GET';
      const url = '/api/admin/target-profiles?page[number]=azerty';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('GET /api/target-profiles/:id', () => {

    it('should resolve with correct id', async () => {
      // given
      const method = 'GET';
      const url = '/api/admin/target-profiles/1';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should reject request with HTTP code 400', async () => {
      // given
      const method = 'GET';
      const url = '/api/admin/target-profiles/azerty';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('GET /api/target-profiles/:id/organizations', () => {

    it('should resolve when there is no filter nor pagination', async () => {
      // given
      const method = 'GET';
      const url = '/api/admin/target-profiles/1/organizations';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should resolve when there are filters and pagination', async () => {
      // given
      const method = 'GET';
      const url = '/api/admin/target-profiles/1/organizations?filter[name]=azerty&filter[type]=sco&filter[external-id]=abc&page[size]=10&page[number]=1';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });

    it('should reject request with HTTP code 400, when id is not an integer', async () => {
      // given
      const method = 'GET';
      const url = '/api/admin/target-profiles/azerty/organizations';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should reject request with HTTP code 400, when page size is not an integer', async () => {
      // given
      const method = 'GET';
      const url = '/api/admin/target-profiles/1/organizations?page[size]=azerty';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should reject request with HTTP code 400, when page number is not an integer', async () => {
      // given
      const method = 'GET';
      const url = '/api/admin/target-profiles/1/organizations?page[number]=azerty';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });
});
