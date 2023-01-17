const { expect, sinon, HttpTestServer } = require('../../../test-helper');
const SimulationResult = require('../../../../lib/domain/models/SimulationResult');
const ScoringSimulation = require('../../../../lib/domain/models/ScoringSimulation');
const Answer = require('../../../../lib/domain/models/Answer');
const usecases = require('../../../../lib/domain/usecases');
const moduleUnderTest = require('../../../../lib/application/scoring-simulator');
const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');

describe('Integration | Application | Scoring-simulator | scoring-simulator-controller', function () {
  let simulationResults;

  let httpTestServer;

  beforeEach(async function () {
    sinon.stub(usecases, 'simulateFlashScoring');
    sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin');
    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
    simulationResults = [new SimulationResult({ pixScore: 10 })];
  });

  describe('#post', function () {
    context('When the route is called with correct arguments', function () {
      it('should resolve a 200 HTTP response', async function () {
        // given
        usecases.simulateFlashScoring.resolves({ results: simulationResults });
        securityPreHandlers.checkAdminMemberHasRoleSuperAdmin.returns(() => {
          return true;
        });

        // when
        const response = await httpTestServer.request('POST', '/api/scoring-simulator/flash', {
          simulations: [{ estimatedLevel: 2, answers: [{ challengeId: 'okChallengeId', result: 'ok' }] }],
          successProbabilityThreshold: 0.8,
        });

        // then
        expect(response.statusCode).to.equal(200);
        expect(usecases.simulateFlashScoring).to.have.been.calledWith({
          simulations: [
            new ScoringSimulation({
              estimatedLevel: 2,
              answers: [new Answer({ challengeId: 'okChallengeId', result: 'ok' })],
            }),
          ],
          successProbabilityThreshold: 0.8,
        });
      });
    });
  });
});
