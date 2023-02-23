const { expect, sinon, HttpTestServer } = require('../../../test-helper');
const ScoringSimulationResult = require('../../../../lib/domain/models/ScoringSimulationResult');
const ScoringSimulation = require('../../../../lib/domain/models/ScoringSimulation');
const Answer = require('../../../../lib/domain/models/Answer');
const ScoringSimulationContext = require('../../../../lib/domain/models/ScoringSimulationContext');
const usecases = require('../../../../lib/domain/usecases/index.js');
const moduleUnderTest = require('../../../../lib/application/scoring-simulator');
const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');

describe('Integration | Application | Scoring-simulator | scoring-simulator-controller', function () {
  let httpTestServer;
  let simulationResults;

  beforeEach(async function () {
    sinon.stub(usecases, 'simulateFlashScoring');
    sinon.stub(usecases, 'simulateOldScoring');
    sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin');
    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('/api/scoring-simulator/old', function () {
    describe('#post', function () {
      beforeEach(async function () {
        simulationResults = [
          new ScoringSimulationResult({
            id: 'resultId',
            pixScore: 123,
            pixScoreByCompetence: [
              {
                competenceId: 'competenceId',
                pixScore: 123,
              },
            ],
          }),
        ];
      });

      context('When the route is called with correct arguments', function () {
        it('should call simulateOldScoring usecase with correct arguments', async function () {
          // given
          usecases.simulateOldScoring.resolves(simulationResults);
          securityPreHandlers.checkAdminMemberHasRoleSuperAdmin.returns(() => true);

          // when
          const response = await httpTestServer.request('POST', '/api/scoring-simulator/old', {
            dataset: {
              id: 'datasetId',
              simulations: [{ answers: [{ challengeId: 'okChallengeId', result: 'ok' }] }],
            },
          });

          // then
          expect(response.statusCode).to.equal(200);
          expect(response.result).to.deep.include({
            datasetId: 'datasetId',
            results: simulationResults,
          });
          expect(usecases.simulateOldScoring).to.have.been.calledWith({
            simulations: [
              new ScoringSimulation({
                answers: [new Answer({ challengeId: 'okChallengeId', result: 'ok' })],
              }),
            ],
          });
        });
      });
    });
  });

  describe('/api/scoring-simulator/flash', function () {
    describe('#post', function () {
      beforeEach(async function () {
        simulationResults = [
          new ScoringSimulationResult({
            id: 'resultId',
            estimatedLevel: 2.2498723,
            pixScore: 123,
            pixScoreByCompetence: [
              {
                competenceId: 'competenceId',
                pixScore: 123,
              },
            ],
          }),
        ];
      });

      context('When the route is called with correct arguments', function () {
        it('should call simulateFlashScoring usecase with correct arguments', async function () {
          // given
          usecases.simulateFlashScoring.resolves(simulationResults);
          securityPreHandlers.checkAdminMemberHasRoleSuperAdmin.returns(() => true);

          // when
          const response = await httpTestServer.request('POST', '/api/scoring-simulator/flash', {
            context: {
              id: 'contextId',
              successProbabilityThreshold: 0.8,
              calculateEstimatedLevel: true,
            },
            dataset: {
              id: 'datasetId',
              simulations: [
                {
                  user: {
                    id: '101',
                    estimatedLevel: 2,
                  },
                  answers: [{ challengeId: 'okChallengeId', result: 'ok' }],
                },
              ],
            },
          });

          // then
          expect(response.statusCode).to.equal(200);
          expect(response.result).to.deep.include({
            contextId: 'contextId',
            datasetId: 'datasetId',
            results: simulationResults,
          });
          expect(usecases.simulateFlashScoring).to.have.been.calledWith({
            simulations: [
              new ScoringSimulation({
                user: {
                  id: '101',
                  estimatedLevel: 2,
                },
                answers: [new Answer({ challengeId: 'okChallengeId', result: 'ok' })],
              }),
            ],
            context: new ScoringSimulationContext({
              id: 'contextId',
              successProbabilityThreshold: 0.8,
              calculateEstimatedLevel: true,
            }),
            locale: 'fr-fr',
          });
        });
      });

      context('When the route is called with Accept-Language', function () {
        it('should be used as locale', async function () {
          // given
          usecases.simulateFlashScoring.resolves({ results: simulationResults });
          securityPreHandlers.checkAdminMemberHasRoleSuperAdmin.returns(() => true);

          // when
          const response = await httpTestServer.request(
            'POST',
            '/api/scoring-simulator/flash',
            {
              dataset: { simulations: [{ answers: [{ challengeId: 'okChallengeId', result: 'ok' }] }] },
            },
            null,
            { 'accept-language': 'en' }
          );

          // then
          expect(response.statusCode).to.equal(200);
          expect(usecases.simulateFlashScoring).to.have.been.calledWithMatch({
            locale: 'en',
          });
        });
      });
    });
  });
});
