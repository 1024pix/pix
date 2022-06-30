const { expect, HttpTestServer, sinon } = require('../../../test-helper');

const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const targetProfileController = require('../../../../lib/application/target-profiles/target-profile-controller');
const moduleUnderTest = require('../../../../lib/application/target-profiles');

describe('Unit | Application | Target Profiles | Routes', function () {
  describe('GET /api/admin/target-profiles', function () {
    const method = 'GET';
    const url = '/api/admin/target-profiles';

    context('when user has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function () {
      it('should return a response with an HTTP status code 200', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'userHasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkUserHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(() => (request, h) => h.response(true));
        sinon
          .stub(targetProfileController, 'findPaginatedFilteredTargetProfiles')
          .callsFake((request, h) => h.response('ok').code(200));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request(method, url);

        // then
        expect(statusCode).to.equal(200);
      });
    });

    context('when user has role "CERTIF"', function () {
      it('should return a response with an HTTP status code 403', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'userHasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkUserHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(
            () => (request, h) =>
              h
                .response({ errors: new Error('forbidden') })
                .code(403)
                .takeover()
          );
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request(method, url);

        // then
        expect(statusCode).to.equal(403);
      });
    });

    context('when there is no filter nor pagination', function () {
      it('should resolve with HTTP code 200', async function () {
        // given
        sinon.stub(securityPreHandlers, 'userHasAtLeastOneAccessOf').returns(() => true);
        sinon
          .stub(targetProfileController, 'findPaginatedFilteredTargetProfiles')
          .callsFake((request, h) => h.response('ok').code(200));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request(method, url);

        // then
        expect(statusCode).to.equal(200);
      });
    });

    context('when there are filters and pagination', function () {
      it('should resolve with HTTP code 200', async function () {
        // given
        sinon.stub(securityPreHandlers, 'userHasAtLeastOneAccessOf').returns(() => true);
        sinon
          .stub(targetProfileController, 'findPaginatedFilteredTargetProfiles')
          .callsFake((request, h) => h.response('ok').code(200));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request(
          method,
          `${url}?filter[id]=1&filter[name]=azerty&page[size]=10&page[number]=1`
        );

        // then
        expect(response.statusCode).to.equal(200);
      });
    });

    context('when id is not an integer', function () {
      it('should reject request with HTTP code 400', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request(method, `${url}?filter[id]=azerty`);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    context('when page size is not an integer', function () {
      it('should reject request with HTTP code 400', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request(method, `${url}?page[size]=azerty`);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    context('when page number is not an integer', function () {
      it('should reject request with HTTP code 400', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request(method, `${url}?page[number]=azerty`);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });

  describe('GET /api/admin/target-profiles/{id}', function () {
    const method = 'GET';
    const url = '/api/admin/target-profiles/1';

    context('when user has role "SUPER_ADMIN", "SUPPORT", "METIER"', function () {
      it('should return a response with an HTTP status code 200', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'userHasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkUserHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(() => (request, h) => h.response(true));
        sinon
          .stub(targetProfileController, 'getTargetProfileDetails')
          .callsFake((request, h) => h.response('ok').code(200));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request(method, url);

        // then
        expect(statusCode).to.equal(200);
      });

      context('when target profile ID is invalid', function () {
        it('should reject request with HTTP code 400', async function () {
          // given
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const { statusCode } = await httpTestServer.request(method, '/api/admin/target-profiles/azerty');

          // then
          expect(statusCode).to.equal(400);
        });
      });
    });

    context('when user has role "CERTIF"', function () {
      it('should return a response with an HTTP status code 403', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'userHasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkUserHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(
            () => (request, h) =>
              h
                .response({ errors: new Error('forbidden') })
                .code(403)
                .takeover()
          );
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request(method, url);

        // then
        expect(statusCode).to.equal(403);
      });
    });
  });

  describe('GET /api/admin/target-profiles/{id}/organizations', function () {
    const method = 'GET';
    const url = '/api/admin/target-profiles/1/organizations';

    context('when user has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function () {
      it('should return a response with an HTTP status code 200', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'userHasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkUserHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(() => (request, h) => h.response(true));
        sinon
          .stub(targetProfileController, 'findPaginatedFilteredTargetProfileOrganizations')
          .callsFake((request, h) => h.response('ok').code(200));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request(method, url);

        // then
        expect(statusCode).to.equal(200);
      });

      context('when there is no filter nor pagination', function () {
        it('should resolve with an HTTP status code 200', async function () {
          // given
          sinon.stub(securityPreHandlers, 'userHasAtLeastOneAccessOf').returns(() => true);
          sinon
            .stub(targetProfileController, 'findPaginatedFilteredTargetProfileOrganizations')
            .callsFake((request, h) => h.response('ok').code(200));
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const { statusCode } = await httpTestServer.request(method, url);

          // then
          expect(statusCode).to.equal(200);
        });
      });

      context('when there are filters and pagination', function () {
        it('should resolve with an HTTP status code 200', async function () {
          // given
          sinon.stub(securityPreHandlers, 'userHasAtLeastOneAccessOf').returns(() => true);
          sinon
            .stub(targetProfileController, 'findPaginatedFilteredTargetProfileOrganizations')
            .callsFake((request, h) => h.response('ok').code(200));
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const { statusCode } = await httpTestServer.request(
            method,
            `${url}?filter[name]=azerty&filter[type]=sco&filter[external-id]=abc&page[size]=10&page[number]=1`
          );

          // then
          expect(statusCode).to.equal(200);
        });
      });

      context('when id is not an integer', function () {
        it('should reject request with HTTP code 400', async function () {
          // given
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const { statusCode } = await httpTestServer.request(
            method,
            '/api/admin/target-profiles/azerty/organizations'
          );

          // then
          expect(statusCode).to.equal(400);
        });
      });

      context('when page size is not an integer', function () {
        it('should reject request with HTTP code 400', async function () {
          // given
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const { statusCode } = await httpTestServer.request(method, `${url}?page[size]=azerty`);

          // then
          expect(statusCode).to.equal(400);
        });
      });

      context('when page number is not an integer', function () {
        it('should reject request with HTTP code 400', async function () {
          // given
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const { statusCode } = await httpTestServer.request(method, `${url}?page[number]=azerty`);

          // then
          expect(statusCode).to.equal(400);
        });
      });
    });

    context('when user has role "CERTIF"', function () {
      it('should return a response with an HTTP status code 403', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'userHasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkUserHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(
            () => (request, h) =>
              h
                .response({ errors: new Error('forbidden') })
                .code(403)
                .takeover()
          );
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request(method, url);

        // then
        expect(statusCode).to.equal(403);
      });
    });
  });

  describe('GET /api/admin/target-profiles/{id}/stages', function () {
    const method = 'GET';
    const url = '/api/admin/target-profiles/1/stages';

    context('when user has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function () {
      it('should return a response with an HTTP status code 200', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'userHasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkUserHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(() => (request, h) => h.response(true));
        sinon
          .stub(targetProfileController, 'findByTargetProfileId')
          .callsFake((request, h) => h.response('ok').code(200));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request(method, url);

        // then
        expect(statusCode).to.equal(200);
      });

      context('when id is not an integer', function () {
        it('should reject request with HTTP code 400', async function () {
          // given
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const { statusCode } = await httpTestServer.request(method, '/api/admin/target-profiles/azerty/stages');

          // then
          expect(statusCode).to.equal(400);
        });
      });
    });

    context('when user has role "CERTIF"', function () {
      it('should return a response with an HTTP status code 403', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'userHasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkUserHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(
            () => (request, h) =>
              h
                .response({ errors: new Error('forbidden') })
                .code(403)
                .takeover()
          );
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request(method, url);

        // then
        expect(statusCode).to.equal(403);
      });
    });
  });

  describe('GET /api/admin/target-profiles/{id}/badges', function () {
    const method = 'GET';
    const url = '/api/admin/target-profiles/1/badges';

    context('when user has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function () {
      it('should return a response with an HTTP status code 200', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'userHasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkUserHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(() => (request, h) => h.response(true));
        sinon
          .stub(targetProfileController, 'findTargetProfileBadges')
          .callsFake((request, h) => h.response('ok').code(200));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request(method, url);

        // then
        expect(statusCode).to.equal(200);
      });

      context('when id is not an integer', function () {
        it('should reject request with HTTP code 400', async function () {
          // given
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const { statusCode } = await httpTestServer.request(method, '/api/admin/target-profiles/azerty/badges');

          // then
          expect(statusCode).to.equal(400);
        });
      });
    });

    context('when user has role "CERTIF"', function () {
      it('should return a response with an HTTP status code 403', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'userHasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkUserHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(
            () => (request, h) =>
              h
                .response({ errors: new Error('forbidden') })
                .code(403)
                .takeover()
          );
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request(method, url);

        // then
        expect(statusCode).to.equal(403);
      });
    });
  });

  describe('POST /api/admin/target-profiles', function () {
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
          'template-tubes': [
            {
              id: 'tube1',
              level: 7,
            },
          ],
        },
      },
    };

    context('when user has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function () {
      it('should return a response with an HTTP status code 200', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'userHasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkUserHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(() => (request, h) => h.response(true));
        sinon
          .stub(targetProfileController, 'createTargetProfile')
          .callsFake((request, h) => h.response('ok').code(200));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request(method, url, payload);

        // then
        expect(statusCode).to.equal(200);
      });

      it('should resolve with owner organization id to null', async function () {
        // given
        sinon.stub(securityPreHandlers, 'userHasAtLeastOneAccessOf').returns(() => true);
        sinon
          .stub(targetProfileController, 'createTargetProfile')
          .callsFake((request, h) => h.response('ok').code(200));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request(method, url, {
          data: {
            attributes: {
              name: 'MyTargetProfile',
              'owner-organization-id': null,
              'image-url': null,
              'is-public': false,
              'skill-ids': ['skill1', 'skill2'],
              comment: 'comment',
              'template-tubes': [
                {
                  id: 'tube1',
                  level: 7,
                },
              ],
            },
          },
        });

        // then
        expect(statusCode).to.equal(200);
      });

      it('should resolve with owner organization id to empty', async function () {
        // given
        sinon.stub(securityPreHandlers, 'userHasAtLeastOneAccessOf').returns(() => true);
        sinon
          .stub(targetProfileController, 'createTargetProfile')
          .callsFake((request, h) => h.response('ok').code(200));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request(method, url, {
          data: {
            attributes: {
              name: 'MyTargetProfile',
              'owner-organization-id': '',
              'image-url': null,
              'is-public': false,
              'skill-ids': ['skill1', 'skill2'],
              comment: 'comment',
              'template-tubes': [
                {
                  id: 'tube1',
                  level: 7,
                },
              ],
            },
          },
        });

        // then
        expect(statusCode).to.equal(200);
      });

      it('should reject with alphanumeric owner organization id ', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request(method, url, {
          data: {
            attributes: {
              name: 'MyTargetProfile',
              'owner-organization-id': 'ABC',
              'image-url': null,
              'is-public': false,
              'skill-ids': ['skill1', 'skill2'],
              comment: 'comment',
              'template-tubes': [
                {
                  id: 'tube1',
                  level: 7,
                },
              ],
            },
          },
        });

        // then
        expect(statusCode).to.equal(400);
      });
    });

    context('when user has role "CERTIF"', function () {
      it('should return a response with an HTTP status code 403', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'userHasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkUserHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(
            () => (request, h) =>
              h
                .response({ errors: new Error('forbidden') })
                .code(403)
                .takeover()
          );
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request(method, url, payload);

        // then
        expect(statusCode).to.equal(403);
      });
    });
  });

  describe('POST /api/admin/target-profiles/{id}/attach-organizations', function () {
    const method = 'POST';
    const url = '/api/admin/target-profiles/3/attach-organizations';
    const payload = { 'organization-ids': [1, 2] };

    context('when user has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function () {
      it('should return a response with an HTTP status code 204', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'userHasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkUserHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(() => (request, h) => h.response(true));
        sinon
          .stub(targetProfileController, 'attachOrganizations')
          .callsFake((request, h) => h.response('ok').code(204));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request(method, url, payload);

        // then
        expect(statusCode).to.equal(204);
      });

      context('when id is a string', function () {
        it('should reject request with HTTP code 400', async function () {
          // given
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const { statusCode } = await httpTestServer.request(
            method,
            '/api/admin/target-profiles/azerty/attach-organizations',
            payload
          );

          // then
          expect(statusCode).to.equal(400);
        });
      });

      context('when organization-ids is not an array', function () {
        it('should reject request with HTTP code 400', async function () {
          // given
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const { statusCode } = await httpTestServer.request(method, url, { 'organization-ids': {} });

          // then
          expect(statusCode).to.equal(400);
        });
      });

      context('when organization-ids is an array of string', function () {
        it('should reject request with HTTP code 400', async function () {
          // given
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const { statusCode } = await httpTestServer.request(method, url, { 'organization-ids': ['azerty'] });

          // then
          expect(statusCode).to.equal(400);
        });
      });
    });

    context('when user has role "CERTIF"', function () {
      it('should return a response with an HTTP status code 403', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'userHasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkUserHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(
            () => (request, h) =>
              h
                .response({ errors: new Error('forbidden') })
                .code(403)
                .takeover()
          );
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request(method, url, payload);

        // then
        expect(statusCode).to.equal(403);
      });
    });
  });

  describe('POST /api/admin/target-profiles/{id}/copy-organizations', function () {
    const method = 'POST';
    const url = '/api/admin/target-profiles/3/copy-organizations';
    const payload = { 'target-profile-id': 1 };

    context('when user has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function () {
      it('should return a response with an HTTP status code 204', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'userHasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkUserHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(() => (request, h) => h.response(true));
        sinon
          .stub(targetProfileController, 'attachOrganizationsFromExistingTargetProfile')
          .callsFake((request, h) => h.response('ok').code(204));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request(method, url, payload);

        // then
        expect(statusCode).to.equal(204);
        sinon.assert.calledOnce(targetProfileController.attachOrganizationsFromExistingTargetProfile);
      });

      context('when id is a string', function () {
        it('should reject request with HTTP code 400', async function () {
          // given
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const { statusCode } = await httpTestServer.request(
            method,
            '/api/admin/target-profiles/azerty/copy-organizations',
            payload
          );

          // then
          expect(statusCode).to.equal(400);
        });
      });

      context('when target profile id is a string', function () {
        it('should reject request with HTTP code 400', async function () {
          // given
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const { statusCode } = await httpTestServer.request(method, url, { 'target-profile-id': 'azerty' });

          // then
          expect(statusCode).to.equal(400);
        });
      });
    });

    context('when user has role "CERTIF"', function () {
      it('should return a response with an HTTP status code 403', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'userHasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkUserHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(
            () => (request, h) =>
              h
                .response({ errors: new Error('forbidden') })
                .code(403)
                .takeover()
          );
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request(method, url, payload);

        // then
        expect(statusCode).to.equal(403);
      });
    });
  });

  describe('POST /api/admin/target-profiles/{id}/badges', function () {
    const method = 'POST';
    const url = '/api/admin/target-profiles/123/badges';
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

    context('when user has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function () {
      it('should return a response with an HTTP status code 201', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'userHasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkUserHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(() => (request, h) => h.response(true));
        sinon.stub(targetProfileController, 'createBadge').callsFake((request, h) => h.response('ok').code(201));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request(method, url, payload);

        // then
        expect(statusCode).to.equal(201);
      });

      context('when request payload has wrong format', function () {
        it('should return a 400 HTTP response', async function () {
          // given
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const { statusCode } = await httpTestServer.request(method, url, { data: { attributes: {} } });

          // then
          expect(statusCode).to.equal(400);
        });
      });
    });

    context('when user has role "CERTIF"', function () {
      it('should return a response with an HTTP status code 403', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'userHasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkUserHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(
            () => (request, h) =>
              h
                .response({ errors: new Error('forbidden') })
                .code(403)
                .takeover()
          );
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request(method, url, payload);

        // then
        expect(statusCode).to.equal(403);
      });
    });
  });

  describe('PATCH /api/admin/target-profiles/{id}', function () {
    const method = 'PATCH';
    const url = '/api/admin/target-profiles/123';
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

    context('when user has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function () {
      it('should return a response with an HTTP status code 204', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'userHasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkUserHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(() => (request, h) => h.response(true));
        sinon
          .stub(targetProfileController, 'updateTargetProfile')
          .callsFake((request, h) => h.response('ok').code(204));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request(method, url, payload);

        // then
        expect(statusCode).to.equal(204);
      });

      it('should return a 400 error when description is over than 500 characters', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        const description = 'description changée.';
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request(method, url, {
          data: {
            attributes: {
              name: 'test',
              description: description.repeat(26),
              comment: null,
            },
          },
        });

        // then
        expect(statusCode).to.equal(400);
      });

      it('should return a 400 error when comment is over than 500 characters', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        const comment = 'commentaire changé.';
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request(method, url, {
          data: {
            attributes: {
              name: 'test',
              description: 'good',
              comment: comment.repeat(27),
            },
          },
        });

        // then
        expect(statusCode).to.equal(400);
      });

      it('should return a 400 error when the name is not defined', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request(method, url, {
          data: {
            attributes: {
              name: undefined,
            },
          },
        });

        // then
        expect(statusCode).to.equal(400);
      });
    });

    context('when user has role "CERTIF"', function () {
      it('should return a response with an HTTP status code 403', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'userHasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkUserHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(
            () => (request, h) =>
              h
                .response({ errors: new Error('forbidden') })
                .code(403)
                .takeover()
          );
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request(method, url, payload);

        // then
        expect(statusCode).to.equal(403);
      });
    });
  });

  describe('PUT /api/admin/target-profiles/{id}/outdate', function () {
    const method = 'PUT';
    const url = '/api/admin/target-profiles/123/outdate';
    const payload = {};

    context('when user has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function () {
      it('should return a response with an HTTP status code 204', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'userHasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkUserHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(() => (request, h) => h.response(true));
        sinon
          .stub(targetProfileController, 'outdateTargetProfile')
          .callsFake((request, h) => h.response('ok').code(204));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request(method, url, payload);

        // then
        expect(statusCode).to.equal(204);
      });

      context('when target profile ID is invalid', function () {
        it('should reject request with HTTP code 400', async function () {
          // given
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const { statusCode } = await httpTestServer.request(method, '/api/admin/target-profiles/azerty/outdate');

          // then
          expect(statusCode).to.equal(400);
        });
      });
    });

    context('when user has role "CERTIF"', function () {
      it('should return a response with an HTTP status code 403', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'userHasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkUserHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(
            () => (request, h) =>
              h
                .response({ errors: new Error('forbidden') })
                .code(403)
                .takeover()
          );
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request(method, url, payload);

        // then
        expect(statusCode).to.equal(403);
      });
    });
  });

  describe('PUT /api/admin/target-profiles/{id}/simplified-access', function () {
    const method = 'PUT';
    const url = '/api/admin/target-profiles/123/simplified-access';
    const payload = {};

    context('when user has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function () {
      it('should return a response with an HTTP status code 200', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'userHasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkUserHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(() => (request, h) => h.response(true));
        sinon
          .stub(targetProfileController, 'markTargetProfileAsSimplifiedAccess')
          .callsFake((request, h) => h.response('ok').code(200));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request(method, url, payload);

        // then
        expect(statusCode).to.equal(200);
      });

      context('when target profile ID is invalid', function () {
        it('should reject request with HTTP code 400', async function () {
          // given
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const { statusCode } = await httpTestServer.request(
            method,
            '/api/admin/target-profiles/azerty/simplified-access'
          );

          // then
          expect(statusCode).to.equal(400);
        });
      });
    });

    context('when user has role "CERTIF"', function () {
      it('should return a response with an HTTP status code 403', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'userHasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkUserHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(
            () => (request, h) =>
              h
                .response({ errors: new Error('forbidden') })
                .code(403)
                .takeover()
          );
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request(method, url, payload);

        // then
        expect(statusCode).to.equal(403);
      });
    });
  });
});
