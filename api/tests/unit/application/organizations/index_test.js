const { expect, sinon, HttpTestServer } = require('../../../test-helper');

const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const organizationController = require('../../../../lib/application/organizations/organization-controller');
const usecases = require('../../../../lib/domain/usecases');
const identifiersType = require('../../../../lib/domain/types/identifiers-type');

const moduleUnderTest = require('../../../../lib/application/organizations');

describe('Unit | Router | organization-router', () => {

  let httpTestServer;

  beforeEach(() => {
    sinon.stub(usecases, 'findPendingOrganizationInvitations').resolves([]);

    sinon.stub(securityPreHandlers, 'checkUserIsAdminInOrganization').returns(true);
    sinon.stub(securityPreHandlers, 'checkUserIsAdminInOrganizationOrHasRolePixMaster').returns(true);
    sinon.stub(securityPreHandlers, 'checkUserHasRolePixMaster').returns(true);

    sinon.stub(organizationController, 'findPaginatedFilteredOrganizations').returns('ok');
    sinon.stub(organizationController, 'sendInvitations').callsFake((request, h) => h.response().created());
    sinon.stub(organizationController, 'getSchoolingRegistrationsCsvTemplate').callsFake((request, h) => h.response('ok').code(200));

    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  describe('GET /api/organizations', () => {

    const method = 'GET';

    it('should return OK (200) when request is valid', async () => {
      // given
      const url = '/api/organizations?filter[id]=&filter[name]=DRA&filter[type]=SCO&page[number]=3&page[size]=25';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });

    context('when request is invalid', () => {

      it('should return BadRequest (400) if id is not numeric', async () => {
        // given
        const idNotNumeric = 'foo';
        const url = `/api/organizations?filter[id]=${idNotNumeric}`;

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(400);
      });

      context('when id is outside number limits', async () => {

        const minNumberLimit = identifiersType.positiveInteger32bits.min;
        const maxNumberLimit = identifiersType.positiveInteger32bits.max;
        const numbersOutsideLimits = [
          {
            expectedBehavior: 'should return HTTP statusCode 400 if id number is less than the minimum value',
            wrongNumber: minNumberLimit - 1,
          },
          {
            expectedBehavior: 'should return HTTP statusCode 400 if id number is greater than the maximum value',
            wrongNumber: maxNumberLimit + 1,
          },
        ];

        numbersOutsideLimits.forEach(({ expectedBehavior, wrongNumber }) => {
          it(expectedBehavior, async () => {
            // given
            const url = `/api/organizations?filter[id]=${wrongNumber}`;

            // when
            const response = await httpTestServer.request(method, url);

            // then
            expect(response.statusCode).to.equal(400);
          });
        });
      });
    });
  });

  describe('POST /api/organizations/{id}/invitations', () => {

    const method = 'POST';
    const url = '/api/organizations/1/invitations';
    let payload;

    beforeEach(() => {
      payload = {
        data: {
          type: 'organization-invitations',
          attributes: {
            email: 'user1@organization.org',
          },
        },
      };
    });

    it('should exist', async () => {
      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(201);
    });

    it('should accept multiple emails', async () => {
      // given
      payload.data.attributes.email = 'user1@organization.org, user2@organization.org';

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(201);
    });

    it('should reject request with HTTP code 400, when email is empty', async () => {
      // given
      payload.data.attributes.email = '';

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should reject request with HTTP code 400, when input is not a email', async () => {
      // given
      payload.data.attributes.email = 'azerty';

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });
  });

  describe('GET /api/organizations/{id}/invitations', () => {

    it('should return an empty list when no organization is found', async () => {
      // given
      const method = 'GET';
      const url = '/api/organizations/1/invitations';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal([]);
    });
  });

  describe('POST /api/organizations/{id}/schooling-registrations/import-csv', () => {

    context('when the id not an integer', () => {
      it('responds 400', async () => {
        // given
        const method = 'POST';
        const url = '/api/organizations/qsdqsd/schooling-registrations/import-csv';

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });

  describe('GET /api/organizations/{id}/schooling-registrations/csv-template', () => {

    it('should call the organization controller to csv template', async () => {
      // given
      const method = 'GET';
      const url = '/api/organizations/1/schooling-registrations/csv-template?accessToken=token';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
      expect(organizationController.getSchoolingRegistrationsCsvTemplate).to.have.been.calledOnce;
    });

    describe('When parameters are not valid', () => {

      it('should throw an error when id is not a number', async () => {
        // given
        const method = 'GET';
        const url = '/api/organizations/ABC/schooling-registrations/csv-template?accessToken=token';

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('should throw an error when id is null', async () => {
        // given
        const method = 'GET';
        const url = '/api/organizations/null/schooling-registrations/csv-template?accessToken=token';

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('should throw an error when access token is not specified', async () => {
        // given
        const method = 'GET';
        const url = '/api/organizations/ABC/schooling-registrations/csv-template';

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('should throw an error when access token is null', async () => {
        // given
        const method = 'GET';
        const url = '/api/organizations/null/schooling-registrations/csv-template?accessToken=null';

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });
});
