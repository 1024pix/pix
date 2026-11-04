import { expect } from 'chai';
import sinon from 'sinon';

import { knowledgeStateSimulationController } from '../../../../../src/shared/application/knowledge-states/knowledge-state-simulation-controller.js';
import { knowledgeStateSimulationRoute as moduleUnderTest } from '../../../../../src/shared/application/knowledge-states/knowledge-state-simulation-route.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Unit | Shared | Application | Route | knowledge-state-simulation-route', function () {
  describe('POST /api/admin/knowledge-states/simulations', function () {
    const knowledgeElement = {
      skillId: 'skill_1',
      competenceId: 'competence_1',
      status: 'validated',
      source: 'direct',
      earnedPix: 1,
      createdAt: '2026-01-10T00:00:00.000Z',
    };
    let httpTestServer;

    beforeEach(async function () {
      sinon.stub(securityPreHandlers, 'hasAtLeastOneAccessOf').returns((request, h) => h.response(true));
      sinon.stub(knowledgeStateSimulationController, 'simulate').callsFake((request, h) => h.response('ok'));
      httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
    });

    it('should accept the rows of the knowledge-elements table, dropping their other columns', async function () {
      // when
      const response = await httpTestServer.request('POST', '/api/admin/knowledge-states/simulations', {
        data: { knowledgeElements: [{ ...knowledgeElement, id: 1, userId: 2, answerId: 3, assessmentId: 4 }] },
      });

      // then
      expect(response.statusCode).to.equal(200);
      const [request] = knowledgeStateSimulationController.simulate.firstCall.args;
      expect(request.payload.data.knowledgeElements).to.deep.equal([
        { ...knowledgeElement, createdAt: new Date('2026-01-10') },
      ]);
    });

    it('should reject a knowledge element without one of the fields of the migration', async function () {
      // when
      const response = await httpTestServer.request('POST', '/api/admin/knowledge-states/simulations', {
        data: { knowledgeElements: [{ ...knowledgeElement, createdAt: undefined }] },
      });

      // then
      expect(response.statusCode).to.equal(400);
    });

    it('should reject an unknown status', async function () {
      // when
      const response = await httpTestServer.request('POST', '/api/admin/knowledge-states/simulations', {
        data: { knowledgeElements: [{ ...knowledgeElement, status: 'maybe' }] },
      });

      // then
      expect(response.statusCode).to.equal(400);
    });
  });
});
