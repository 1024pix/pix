import sinon from 'sinon';

import { competenceEvaluationController } from '../../../../../src/evaluation/application/competence-evaluations/competence-evaluation-controller.js';
import { competenceEvaluationsRoute as competenceEvaluationsRouter } from '../../../../../src/evaluation/application/competence-evaluations/index.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Unit | Application | Router | competence-evaluations', function () {
  let httpTestServer;

  describe('POST /api/competence-evaluations/start-or-resume', function () {
    beforeEach(async function () {
      sinon.stub(competenceEvaluationController, 'startOrResume').callsFake((request, h) => h.response('ok').code(200));
      httpTestServer = new HttpTestServer();
      await httpTestServer.register(competenceEvaluationsRouter);
    });

    context('when payload is valid', function () {
      it('should return 200', async function () {
        // given
        const payload = {
          competenceId: 'competenceId',
        };

        // when
        const response = await httpTestServer.request('POST', '/api/competence-evaluations/start-or-resume', payload);

        // then
        expect(response.statusCode).to.equal(200);
      });
    });

    context('when competenceId is missing in payload', function () {
      it('should return 400', async function () {
        // given
        const payload = {
          competenceId: null,
        };

        // when
        const response = await httpTestServer.request('POST', '/api/competence-evaluations/start-or-resume', payload);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });

  describe('PUT /api/competence-evaluations/improve', function () {
    beforeEach(async function () {
      sinon.stub(competenceEvaluationController, 'improve').callsFake((request, h) => h.response('ok').code(200));
      httpTestServer = new HttpTestServer();
      await httpTestServer.register(competenceEvaluationsRouter);
    });

    context('when payload is valid', function () {
      it('should return 200', async function () {
        // given
        const payload = {
          competenceId: 'competenceId',
        };

        // when
        const response = await httpTestServer.request('PUT', '/api/competence-evaluations/improve', payload);

        // then
        expect(response.statusCode).to.equal(200);
      });
    });

    context('when competenceId is missing in payload', function () {
      it('should return 400', async function () {
        // given
        const payload = {
          competenceId: null,
        };

        // when
        const response = await httpTestServer.request('PUT', '/api/competence-evaluations/improve', payload);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });
});
