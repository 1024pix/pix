import badgeCriteriaController from '../../../../../src/evaluation/application/badge-criteria/badge-criteria-controller.js';
import * as badgeCriteriaRouter from '../../../../../src/evaluation/application/badge-criteria/index.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Unit | Application | Router | badge-criteria-router', function () {
  describe('PATCH /api/admin/badge-criteria/{id}', function () {
    let httpTestServer;

    beforeEach(async function () {
      sinon
        .stub(securityPreHandlers, 'hasAtLeastOneAccessOf')
        .withArgs([
          securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
          securityPreHandlers.checkAdminMemberHasRoleSupport,
          securityPreHandlers.checkAdminMemberHasRoleMetier,
          securityPreHandlers.checkAdminMemberHasRoleCertif,
        ])
        .callsFake(() => (request, h) => h.response(true));

      sinon.stub(badgeCriteriaController, 'updateCriterion').callsFake((request, h) => h.response('ok').code(204));
      httpTestServer = new HttpTestServer();
      await httpTestServer.register(badgeCriteriaRouter);
    });

    context('when payload is valid', function () {
      it('should return 204', async function () {
        // given
        const method = 'PATCH';
        const url = '/api/admin/badge-criteria/1';
        const payload = {
          data: {
            type: 'badge-criteria',
            attributes: {
              name: 'Dummy name',
              threshold: 10,
            },
            relationships: {
              badge: {
                data: {
                  type: 'badges',
                  id: 111,
                },
              },
            },
          },
        };

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(204);
      });
    });

    context('when payload attributes is empty', function () {
      it('should return 400', async function () {
        // given
        const method = 'PATCH';
        const url = '/api/admin/badge-criteria/1';
        const payload = {
          data: {
            type: 'badge-criteria',
            attributes: {},
            relationships: {
              badge: {
                data: {
                  type: 'badges',
                  id: 111,
                },
              },
            },
          },
        };

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    context('when payload relationships is not valid', function () {
      it('should return 400', async function () {
        // given
        const method = 'PATCH';
        const url = '/api/admin/badge-criteria/1';
        const payload = {
          data: {
            type: 'badge-criteria',
            attributes: {
              name: 'Dummy name',
              threshold: 10,
            },
            relationships: {
              badge: {
                data: {
                  type: 'not-badges',
                  id: 1,
                },
              },
            },
          },
        };

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });
});
