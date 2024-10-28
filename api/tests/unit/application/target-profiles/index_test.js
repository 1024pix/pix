import * as moduleUnderTest from '../../../../lib/application/target-profiles/index.js';
import { targetProfileController } from '../../../../lib/application/target-profiles/target-profile-controller.js';
import { securityPreHandlers } from '../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../test-helper.js';

describe('Unit | Application | Target Profiles | Routes', function () {
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

        it('[category] should return a 400 error when it is not a string', async function () {
          // when
          const response = await httpTestServer.request(method, url, {
            data: {
              attributes: {
                category: 404,
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
                name: 404,
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
