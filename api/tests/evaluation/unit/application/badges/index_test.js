import _ from 'lodash';

import { badgesController } from '../../../../../src/evaluation/application/badges/badges-controller.js';
import * as badgesRouter from '../../../../../src/evaluation/application/badges/index.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Unit | Application | Badges | Routes', function () {
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
        sinon.stub(badgesController, 'createBadge').callsFake((request, h) => h.response('ok').code(201));
      });

      it('should return a response with an HTTP status code 201', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(badgesRouter);

        // when
        const { statusCode } = await httpTestServer.request(method, url, payload);

        // then
        expect(statusCode).to.equal(201);
      });

      context('when request payload is empty', function () {
        it('should return a 400 HTTP response', async function () {
          // given
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(badgesRouter);

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
          await httpTestServer.register(badgesRouter);

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
          await httpTestServer.register(badgesRouter);

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
          await httpTestServer.register(badgesRouter);

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
        await httpTestServer.register(badgesRouter);

        // when
        const { statusCode } = await httpTestServer.request(method, url, payload);

        // then
        expect(statusCode).to.equal(403);
      });
    });
  });

  describe('PATCH /api/admin/badges/{id}', function () {
    const validPayload = {};

    beforeEach(function () {
      validPayload.data = {
        type: 'badges',
        attributes: {
          key: '1',
          title: 'titre du badge modifié',
          message: 'Message modifié',
          'alt-message': 'Message alternatif modifié',
          'image-url': 'url_image_modifiée',
          'is-certifiable': true,
          'is-always-visible': true,
        },
      };
    });

    context('when user has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function () {
      it('should return an HTTP status code 204', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkAdminMemberHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(() => (request, h) => h.response(true));
        sinon.stub(badgesController, 'updateBadge').returns(null);
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(badgesRouter);

        // when
        const { statusCode } = await httpTestServer.request('PATCH', '/api/admin/badges/1', validPayload);

        // then
        expect(statusCode).to.equal(204);
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
          await httpTestServer.register(badgesRouter);

          // when
          const { statusCode } = await httpTestServer.request('PATCH', '/api/admin/badges/1', validPayload);

          // then
          expect(statusCode).to.equal(403);
        });
      });

      context('when badge id is invalid', function () {
        it('should return an HTTP status code 400', async function () {
          // given
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(badgesRouter);

          // when
          const { statusCode } = await httpTestServer.request('PATCH', '/api/admin/badges/invalid-id', validPayload);

          // then
          expect(statusCode).to.equal(400);
        });
      });
    });
  });

  describe('DELETE /api/admin/badges/{id}', function () {
    context('when user has role "SUPER_ADMIN", "SUPPORT" or "METIER"', function () {
      it('should return an HTTP status code 204', async function () {
        // given
        sinon
          .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
          .withArgs([
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
            securityPreHandlers.checkAdminMemberHasRoleSupport,
            securityPreHandlers.checkAdminMemberHasRoleMetier,
          ])
          .callsFake(() => (request, h) => h.response(true));
        sinon.stub(badgesController, 'deleteUnassociatedBadge').returns(null);
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(badgesRouter);

        // when
        const { statusCode } = await httpTestServer.request('DELETE', '/api/admin/badges/1');

        // then
        expect(statusCode).to.equal(204);
      });

      context('when badge id is invalid', function () {
        it('should return an HTTP status code 400', async function () {
          // given
          const httpTestServer = new HttpTestServer();
          await httpTestServer.register(badgesRouter);

          // when
          const { statusCode } = await httpTestServer.request('DELETE', '/api/admin/badges/invalid-id');

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
        await httpTestServer.register(badgesRouter);

        // when
        const { statusCode } = await httpTestServer.request('DELETE', '/api/admin/badges/1');

        // then
        expect(statusCode).to.equal(403);
      });
    });
  });
});
