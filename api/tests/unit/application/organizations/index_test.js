const { expect, HttpTestServer, sinon } = require('../../../test-helper');

const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const organizationController = require('../../../../lib/application/organizations/organization-controller');
const usecases = require('../../../../lib/domain/usecases');
const identifiersType = require('../../../../lib/domain/types/identifiers-type');
const moduleUnderTest = require('../../../../lib/application/organizations');

describe('Unit | Router | organization-router', function () {
  describe('GET /api/admin/organizations', function () {
    const method = 'GET';

    it('should return OK (200) when request is valid', async function () {
      // given
      sinon.stub(securityPreHandlers, 'userHasAtLeastOneAccessOf').returns(() => true);
      sinon.stub(organizationController, 'findPaginatedFilteredOrganizations').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // given
      const url = '/api/admin/organizations?filter[id]=&filter[name]=DRA&filter[type]=SCO&page[number]=3&page[size]=25';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
    });

    context('when request is invalid', function () {
      it('should return BadRequest (400) if id is not numeric', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const idNotNumeric = 'foo';
        const url = `/api/admin/organizations?filter[id]=${idNotNumeric}`;

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(400);
      });

      context('when id is outside number limits', function () {
        it('should return HTTP statusCode 400 if id number is less than the minimum value', async function () {
          // given
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          const minNumberLimit = identifiersType.positiveInteger32bits.min;
          const wrongNumber = minNumberLimit - 1;
          const url = `/api/admin/organizations?filter[id]=${wrongNumber}`;

          // when
          const response = await httpTestServer.request(method, url);

          // then
          expect(response.statusCode).to.equal(400);
        });

        it('should return HTTP statusCode 400 if id number is greater than the maximum value', async function () {
          // given
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          const maxNumberLimit = identifiersType.positiveInteger32bits.max;
          const wrongNumber = maxNumberLimit + 1;
          const url = `/api/admin/organizations?filter[id]=${wrongNumber}`;

          // when
          const response = await httpTestServer.request(method, url);

          // then
          expect(response.statusCode).to.equal(400);
        });
      });
    });
  });

  describe('POST /api/organizations/{id}/invitations', function () {
    const method = 'POST';
    const url = '/api/organizations/1/invitations';

    it('should return HTTP code 201', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserIsAdminInOrganization').returns(true);
      sinon.stub(organizationController, 'sendInvitations').callsFake((request, h) => h.response().created());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payload = {
        data: {
          type: 'organization-invitations',
          attributes: {
            email: 'user1@organization.org',
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(201);
    });

    it('should accept multiple emails', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserIsAdminInOrganization').returns(true);
      sinon.stub(organizationController, 'sendInvitations').callsFake((request, h) => h.response().created());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payload = {
        data: {
          type: 'organization-invitations',
          attributes: {
            email: 'user1@organization.org, user2@organization.org',
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(201);
    });

    it('should reject request with HTTP code 400, when email is empty', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payload = {
        data: {
          type: 'organization-invitations',
          attributes: {
            email: '',
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should reject request with HTTP code 400, when input is not a email', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payload = {
        data: {
          type: 'organization-invitations',
          attributes: {
            email: 'azerty',
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should check if user is admin in organization', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserIsAdminInOrganization').resolves(false);
      sinon.stub(organizationController, 'sendInvitations').callsFake((request, h) => h.response().created());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payload = {
        data: {
          type: 'organization-invitations',
          attributes: {
            email: 'user1@organization.org',
          },
        },
      };

      // when
      await httpTestServer.request(method, url, payload);

      // then
      expect(securityPreHandlers.checkUserIsAdminInOrganization).to.have.be.called;
    });
  });

  describe('POST /api/admin/organizations/{id}/invitations', function () {
    const method = 'POST';
    const url = '/api/admin/organizations/1/invitations';

    it('should return HTTP code 201', async function () {
      // given
      sinon.stub(securityPreHandlers, 'userHasAtLeastOneAccessOf').returns(() => true);
      sinon
        .stub(organizationController, 'sendInvitationByLangAndRole')
        .callsFake((request, h) => h.response().created());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payload = {
        data: {
          type: 'organization-invitations',
          attributes: {
            email: 'user1@organization.org',
            lang: 'fr',
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(201);
    });

    it('should reject request with HTTP code 400, when email is empty', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payload = {
        data: {
          type: 'organization-invitations',
          attributes: {
            email: '',
            lang: 'fr',
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should reject request with HTTP code 400, when input is not a email', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payload = {
        data: {
          type: 'organization-invitations',
          attributes: {
            email: 'azerty',
            lang: 'fr',
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should reject request with HTTP code 400, when lang is unknown', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payload = {
        data: {
          type: 'organization-invitations',
          attributes: {
            email: 'user1@organization.org',
            lang: 'pt',
          },
        },
      };

      // when
      const response = await httpTestServer.request(method, url, payload);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should check if user is Super Admin', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserHasRoleSuperAdmin').resolves(false);
      sinon
        .stub(organizationController, 'sendInvitationByLangAndRole')
        .callsFake((request, h) => h.response().created());
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const payload = {
        data: {
          type: 'organization-invitations',
          attributes: {
            email: 'user1@organization.org',
            lang: 'fr',
          },
        },
      };

      // when
      await httpTestServer.request(method, url, payload);

      // then
      expect(securityPreHandlers.checkUserHasRoleSuperAdmin).to.have.be.called;
    });
  });

  describe('GET /api/admin/organizations/{id}/places', function () {
    it('should return BadRequest (400) if id is not numeric', async function () {
      // given
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const idNotNumeric = 'foo';
      const method = 'GET';
      const url = `/api/admin/organizations/${idNotNumeric}/places`;

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should return an empty list when no places is found', async function () {
      // given
      sinon.stub(securityPreHandlers, 'checkUserHasRoleSuperAdmin').returns(true);
      sinon.stub(usecases, 'findOrganizationPlaces').returns([]);
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'GET';
      const url = '/api/admin/organizations/1/places';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal([]);
    });
  });

  describe('GET /api/organizations/{id}/invitations', function () {
    it('should return an empty list when no organization is found', async function () {
      // given
      sinon.stub(usecases, 'findPendingOrganizationInvitations').resolves([]);
      sinon.stub(securityPreHandlers, 'checkUserIsAdminInOrganization').returns(true);
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'GET';
      const url = '/api/organizations/1/invitations';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.result.data).to.deep.equal([]);
    });
  });

  describe('POST /api/organizations/{id}/schooling-registrations/import-csv', function () {
    context('when the id not an integer', function () {
      it('responds 400', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const method = 'POST';
        const url = '/api/organizations/qsdqsd/schooling-registrations/import-csv';

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });

  describe('POST /api/organizations/{id}/schooling-registrations/replace-csv', function () {
    context(
      'when the user is an admin for the organization and the organization is SUP and manages student',
      function () {
        afterEach(function () {
          sinon.restore();
        });

        it('responds 200', async function () {
          sinon.stub(organizationController, 'replaceHigherSchoolingRegistrations');
          sinon.stub(securityPreHandlers, 'checkUserIsAdminInSUPOrganizationManagingStudents');
          organizationController.replaceHigherSchoolingRegistrations.resolves('ok');
          securityPreHandlers.checkUserIsAdminInSUPOrganizationManagingStudents.resolves(true);
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          const method = 'POST';
          const url = '/api/organizations/1/schooling-registrations/replace-csv';

          const response = await httpTestServer.request(method, url);

          expect(response.statusCode).to.equal(200);
        });
      }
    );

    context('when the user is not admin for the organization', function () {
      afterEach(function () {
        sinon.restore();
      });

      it('responds 403', async function () {
        sinon.stub(organizationController, 'replaceHigherSchoolingRegistrations');
        sinon.stub(securityPreHandlers, 'checkUserIsAdminInSUPOrganizationManagingStudents');
        organizationController.replaceHigherSchoolingRegistrations.resolves('ok');
        securityPreHandlers.checkUserIsAdminInSUPOrganizationManagingStudents.callsFake((request, h) =>
          h.response().code(403).takeover()
        );
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const method = 'POST';
        const url = '/api/organizations/1/schooling-registrations/replace-csv';

        const response = await httpTestServer.request(method, url);

        expect(response.statusCode).to.equal(403);
      });
    });
  });

  describe('GET /api/organizations/{id}/schooling-registrations/csv-template', function () {
    it('should call the organization controller to csv template', async function () {
      // given
      sinon
        .stub(organizationController, 'getSchoolingRegistrationsCsvTemplate')
        .callsFake((request, h) => h.response('ok').code(200));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'GET';
      const url = '/api/organizations/1/schooling-registrations/csv-template?accessToken=token';

      // when
      const response = await httpTestServer.request(method, url);

      // then
      expect(response.statusCode).to.equal(200);
      expect(organizationController.getSchoolingRegistrationsCsvTemplate).to.have.been.calledOnce;
    });

    describe('When parameters are not valid', function () {
      it('should throw an error when id is not a number', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const method = 'GET';
        const url = '/api/organizations/ABC/schooling-registrations/csv-template?accessToken=token';

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('should throw an error when id is null', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const method = 'GET';
        const url = '/api/organizations/null/schooling-registrations/csv-template?accessToken=token';

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('should throw an error when access token is not specified', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const method = 'GET';
        const url = '/api/organizations/ABC/schooling-registrations/csv-template';

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(400);
      });

      it('should throw an error when access token is null', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const method = 'GET';
        const url = '/api/organizations/null/schooling-registrations/csv-template?accessToken=null';

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });

  describe('DELETE /api/organizations/{id}/invitations/{invitationId}', function () {
    it('should call the cancel organization invitation controller', async function () {
      // given
      sinon
        .stub(organizationController, 'cancelOrganizationInvitation')
        .callsFake((request, h) => h.response('ok').code(200));
      sinon.stub(securityPreHandlers, 'checkUserIsAdminInOrganization').returns(true);

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const method = 'DELETE';
      const url = '/api/organizations/1/invitations/1';

      // when
      await httpTestServer.request(method, url);

      // then
      expect(securityPreHandlers.checkUserIsAdminInOrganization).to.have.be.called;
      expect(organizationController.cancelOrganizationInvitation).to.have.been.calledOnce;
    });
  });
});
