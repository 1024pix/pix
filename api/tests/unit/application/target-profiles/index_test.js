import _ from 'lodash';

import * as moduleUnderTest from '../../../../lib/application/target-profiles/index.js';
import { targetProfileController } from '../../../../lib/application/target-profiles/target-profile-controller.js';
import { securityPreHandlers } from '../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../test-helper.js';

describe('Unit | Application | Target Profiles | Routes', function () {
  describe('GET /api/admin/target-profile-summaries', function () {
    const method = 'GET';
    const url = '/api/admin/target-profile-summaries';

    context('when user has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function () {
      it('should return a response with an HTTP status code 200', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkAdminMemberHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(() => (request, h) => h.response(true));
        sinon
          .stub(targetProfileController, 'findPaginatedFilteredTargetProfileSummariesForAdmin')
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
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkAdminMemberHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(
            () => (request, h) =>
              h
                .response({ errors: new Error('forbidden') })
                .code(403)
                .takeover(),
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
        sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
        sinon
          .stub(targetProfileController, 'findPaginatedFilteredTargetProfileSummariesForAdmin')
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
        sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
        sinon
          .stub(targetProfileController, 'findPaginatedFilteredTargetProfileSummariesForAdmin')
          .callsFake((request, h) => h.response('ok').code(200));
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request(
          method,
          `${url}?filter[id]=1&filter[name]=azerty&page[size]=10&page[number]=1`,
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
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkAdminMemberHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(() => (request, h) => h.response(true));
        sinon
          .stub(targetProfileController, 'getTargetProfileForAdmin')
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
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkAdminMemberHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(
            () => (request, h) =>
              h
                .response({ errors: new Error('forbidden') })
                .code(403)
                .takeover(),
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
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkAdminMemberHasRoleSupport,
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
          sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
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
          sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns(() => true);
          sinon
            .stub(targetProfileController, 'findPaginatedFilteredTargetProfileOrganizations')
            .callsFake((request, h) => h.response('ok').code(200));
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const { statusCode } = await httpTestServer.request(
            method,
            `${url}?filter[name]=azerty&filter[type]=sco&filter[external-id]=abc&page[size]=10&page[number]=1`,
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
            '/api/admin/target-profiles/azerty/organizations',
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
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkAdminMemberHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(
            () => (request, h) =>
              h
                .response({ errors: new Error('forbidden') })
                .code(403)
                .takeover(),
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
          'campaign-threshold': 20,
          'capped-tubes-criteria': [
            {
              name: 'dummy name',
              threshold: '30',
              cappedTubes: [
                {
                  id: '1',
                  level: 2,
                },
              ],
            },
          ],
        },
      },
    };

    context('when user has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function () {
      beforeEach(function () {
        sinon
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkAdminMemberHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(() => (request, h) => h.response(true));
        sinon.stub(targetProfileController, 'createBadge').callsFake((request, h) => h.response('ok').code(201));
      });

      it('should return a response with an HTTP status code 201', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const { statusCode } = await httpTestServer.request(method, url, payload);

        // then
        expect(statusCode).to.equal(201);
      });

      context('when request payload is empty', function () {
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

      context('when request payload has no campaign-threshold and no capped-tubes-criteria attributes', function () {
        it('should return a 400 HTTP response', async function () {
          // given
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const wrongPayload = _.omit(payload.data.attributes, 'campaign-threshold');
          const { statusCode } = await httpTestServer.request(method, url, { data: { attributes: wrongPayload } });

          // then
          expect(statusCode).to.equal(400);
        });
      });

      context('when capped-tubes-criteria has no threshold', function () {
        it('should return a 400 HTTP response', async function () {
          // given
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const payloadCopy = _.cloneDeep(payload);
          payloadCopy.data.attributes['capped-tubes-criteria'] = [
            {
              cappedTubes: [
                {
                  id: '1',
                  level: 2,
                },
              ],
            },
          ];
          const response = await httpTestServer.request(method, url, payloadCopy);

          // then
          expect(response.statusCode).to.equal(400);
          expect(response.result.errors[0].detail).to.equal(
            '"data.attributes.capped-tubes-criteria[0].threshold" is required',
          );
        });
      });

      context('when capped-tubes-criteria has no capped tubes', function () {
        it('should return a 400 HTTP response', async function () {
          // given
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(moduleUnderTest);

          // when
          const payloadCopy = _.cloneDeep(payload);
          payloadCopy.data.attributes['capped-tubes-criteria'] = [
            {
              threshold: '20',
              cappedTubes: [],
            },
          ];
          const response = await httpTestServer.request(method, url, payloadCopy);

          // then
          expect(response.statusCode).to.equal(400);
          expect(response.result.errors[0].detail).to.equal(
            '"data.attributes.capped-tubes-criteria[0].cappedTubes" must contain at least 1 items',
          );
        });
      });
    });

    context('when user has role "CERTIF"', function () {
      it('should return a response with an HTTP status code 403', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkAdminMemberHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(
            () => (request, h) =>
              h
                .response({ errors: new Error('forbidden') })
                .code(403)
                .takeover(),
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
          'are-knowledge-elements-resettable': false,
          category: 'OTHER',
          comment: 'commentaire changé.',
          description: 'description changée.',
          'image-url': 'http://some-image.url',
          'is-public': true,
          name: 'test',
          tubes: [{ id: 'some-id', level: 1 }],
        },
      },
    };

    context('when user has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function () {
      let httpTestServer;

      beforeEach(async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkAdminMemberHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(() => (request, h) => h.response(true));
        sinon
          .stub(targetProfileController, 'updateTargetProfile')
          .callsFake((request, h) => h.response('ok').code(204));
        httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);
      });

      it('should return a response with an HTTP status code 204', async function () {
        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(204);
      });

      context('payload validation', function () {
        it('[are-knowledge-elements-resettable] should return a 400 error when it is not a boolean value', async function () {
          // when
          const response = await httpTestServer.request(method, url, {
            data: {
              attributes: {
                'are-knowledge-elements-resettable': String('not a boolean value'),
              },
            },
          });

          // then
          expect(response.statusCode).to.equal(400);
        });

        it('[category] should return a 400 error when it is not one of the expected value', async function () {
          // when
          const response = await httpTestServer.request(method, url, {
            data: {
              attributes: {
                category: String('not an expected value'),
              },
            },
          });

          // then
          expect(response.statusCode).to.equal(400);
        });

        it('[comment] should return a 400 error when it has more than 500 characters', async function () {
          // when
          const response = await httpTestServer.request(method, url, {
            data: {
              attributes: {
                comment: String('abcdef').repeat(100),
              },
            },
          });

          // then
          expect(response.statusCode).to.equal(400);
        });

        it('[description] should return a 400 error when it has more than 500 characters', async function () {
          // when
          const { statusCode } = await httpTestServer.request(method, url, {
            data: {
              attributes: {
                description: String('abcdef').repeat(100),
              },
            },
          });

          // then
          expect(statusCode).to.equal(400);
        });

        it('[is-public] should return a 400 error when it is not a boolean value', async function () {
          // when
          const response = await httpTestServer.request(method, url, {
            data: {
              attributes: {
                'is-public': String('not a boolean value'),
              },
            },
          });

          // then
          expect(response.statusCode).to.equal(400);
        });

        it('[image-url] should return a 400 error when it is not a valid URI', async function () {
          // when
          const response = await httpTestServer.request(method, url, {
            data: {
              attributes: {
                'image-url': String('not-a-valid-URI.org'),
              },
            },
          });

          // then
          expect(response.statusCode).to.equal(400);
        });

        it('[name] should return a 400 error when it is not a string', async function () {
          // when
          const response = await httpTestServer.request(method, url, {
            data: {
              attributes: {
                name: 200,
              },
            },
          });

          // then
          expect(response.statusCode).to.equal(400);
        });

        it('[tubes] should return a 400 error when it is not an array of accepted object', async function () {
          // when
          const response = await httpTestServer.request(method, url, {
            data: {
              attributes: {
                tubes: [{ id: 'some-id', level: NaN }],
              },
            },
          });

          // then
          expect(response.statusCode).to.equal(400);
        });
      });
    });

    context('when user has role "CERTIF"', function () {
      it('should return a response with an HTTP status code 403', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkAdminMemberHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(
            () => (request, h) =>
              h
                .response({ errors: new Error('forbidden') })
                .code(403)
                .takeover(),
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
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkAdminMemberHasRoleSupport,
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
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkAdminMemberHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(
            () => (request, h) =>
              h
                .response({ errors: new Error('forbidden') })
                .code(403)
                .takeover(),
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
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkAdminMemberHasRoleSupport,
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
            '/api/admin/target-profiles/azerty/simplified-access',
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
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkAdminMemberHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(
            () => (request, h) =>
              h
                .response({ errors: new Error('forbidden') })
                .code(403)
                .takeover(),
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

  describe('POST /api/admin/target-profiles', function () {
    let validPayload;

    beforeEach(function () {
      validPayload = {
        data: {
          attributes: {
            name: 'targetProfileName',
            category: 'OTHER',
            description: 'coucou maman',
            comment: 'coucou papa',
            'is-public': false,
            'image-url': 'http://some/image.ok',
            'owner-organization-id': null,
            tubes: [{ id: 'recTube1', level: '5' }],
            'are-knowledge-elements-resettable': false,
          },
        },
      };
    });

    it('should allow to controller if user has role SUPER_ADMIN', async function () {
      // given
      sinon.stub(targetProfileController, 'createTargetProfile').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin').callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      await httpTestServer.request('POST', '/api/admin/target-profiles', validPayload);

      // then
      sinon.assert.calledOnce(targetProfileController.createTargetProfile);
    });

    it('should allow to controller if user has role SUPPORT', async function () {
      // given
      sinon.stub(targetProfileController, 'createTargetProfile').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport').callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      await httpTestServer.request('POST', '/api/admin/target-profiles', validPayload);

      // then
      sinon.assert.calledOnce(targetProfileController.createTargetProfile);
    });

    it('should allow to controller if user has role METIER', async function () {
      // given
      sinon.stub(targetProfileController, 'createTargetProfile').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      await httpTestServer.request('POST', '/api/admin/target-profiles', validPayload);

      // then
      sinon.assert.calledOnce(targetProfileController.createTargetProfile);
    });

    it('should return 403 without reaching controller if user has not an allowed role', async function () {
      // given
      sinon.stub(targetProfileController, 'createTargetProfile').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('POST', '/api/admin/target-profiles', validPayload);

      // then
      expect(response.statusCode).to.equal(403);
      sinon.assert.notCalled(targetProfileController.createTargetProfile);
    });

    it('should return 400 without reaching controller if payload has wrong name format', async function () {
      // given
      sinon.stub(targetProfileController, 'createTargetProfile').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const payload = { ...validPayload };
      delete payload.data.attributes.name;
      const response = await httpTestServer.request('POST', '/api/admin/target-profiles', payload);

      // then
      expect(response.statusCode).to.equal(400);
      sinon.assert.notCalled(targetProfileController.createTargetProfile);
    });

    it('should return 400 without reaching controller if payload has wrong category format', async function () {
      // given
      sinon.stub(targetProfileController, 'createTargetProfile').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const payload = { ...validPayload };
      delete payload.data.attributes.category;
      const response = await httpTestServer.request('POST', '/api/admin/target-profiles', payload);

      // then
      expect(response.statusCode).to.equal(400);
      sinon.assert.notCalled(targetProfileController.createTargetProfile);
    });

    it('should return 400 without reaching controller if payload has wrong description format', async function () {
      // given
      sinon.stub(targetProfileController, 'createTargetProfile').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const payload = { ...validPayload };
      payload.data.attributes.description = 123;
      const response = await httpTestServer.request('POST', '/api/admin/target-profiles', payload);

      // then
      expect(response.statusCode).to.equal(400);
      sinon.assert.notCalled(targetProfileController.createTargetProfile);
    });

    it('should return 400 without reaching controller if payload has wrong comment format', async function () {
      // given
      sinon.stub(targetProfileController, 'createTargetProfile').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const payload = { ...validPayload };
      payload.data.attributes.comment = 123;
      const response = await httpTestServer.request('POST', '/api/admin/target-profiles', payload);

      // then
      expect(response.statusCode).to.equal(400);
      sinon.assert.notCalled(targetProfileController.createTargetProfile);
    });

    it('should return 400 without reaching controller if payload has wrong isPublic format', async function () {
      // given
      sinon.stub(targetProfileController, 'createTargetProfile').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const payload = { ...validPayload };
      payload.data.attributes['is-public'] = 123;
      const response = await httpTestServer.request('POST', '/api/admin/target-profiles', payload);

      // then
      expect(response.statusCode).to.equal(400);
      sinon.assert.notCalled(targetProfileController.createTargetProfile);
    });

    it('should return 400 without reaching controller if payload has wrong imageUrl format', async function () {
      // given
      sinon.stub(targetProfileController, 'createTargetProfile').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const payload = { ...validPayload };
      payload.data.attributes['image-url'] = 123;
      const response = await httpTestServer.request('POST', '/api/admin/target-profiles', payload);

      // then
      expect(response.statusCode).to.equal(400);
      sinon.assert.notCalled(targetProfileController.createTargetProfile);
    });

    it('should return 400 without reaching controller if payload has wrong ownerOrganizationId format', async function () {
      // given
      sinon.stub(targetProfileController, 'createTargetProfile').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const payload = { ...validPayload };
      payload.data.attributes['owner-organization-id'] = 'coucou';
      const response = await httpTestServer.request('POST', '/api/admin/target-profiles', payload);

      // then
      expect(response.statusCode).to.equal(400);
      sinon.assert.notCalled(targetProfileController.createTargetProfile);
    });

    it('should return 400 without reaching controller if payload has wrong tubes format', async function () {
      // given
      sinon.stub(targetProfileController, 'createTargetProfile').returns('ok');
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon
        .stub(securityPreHandlers, 'checkAdminMemberHasRoleSupport')
        .callsFake((request, h) => h.response({ errors: new Error('forbidden') }).code(403));
      sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleMetier').callsFake((request, h) => h.response(true));
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const payload = { ...validPayload };
      payload.data.attributes.tubes = 'les tubes c cool';
      const response = await httpTestServer.request('POST', '/api/admin/target-profiles', payload);

      // then
      expect(response.statusCode).to.equal(400);
      sinon.assert.notCalled(targetProfileController.createTargetProfile);
    });
  });

  describe('GET /api/admin/target-profiles/{id}/training-summaries', function () {
    const method = 'GET';
    const url = '/api/admin/target-profiles/1/training-summaries';

    context('when user has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function () {
      it('should return a response with an HTTP status code 200', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkAdminMemberHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(() => (request, h) => h.response(true));
        sinon
          .stub(targetProfileController, 'findPaginatedTrainings')
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
          const { statusCode } = await httpTestServer.request(
            method,
            '/api/admin/target-profiles/azerty/training-summaries',
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
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkAdminMemberHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(
            () => (request, h) =>
              h
                .response({ errors: new Error('forbidden') })
                .code(403)
                .takeover(),
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
});
