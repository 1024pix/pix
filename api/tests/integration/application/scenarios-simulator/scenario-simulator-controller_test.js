import { expect, sinon, HttpTestServer, domainBuilder } from '../../../test-helper.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import * as moduleUnderTest from '../../../../lib/application/scenarios-simulator/index.js';
import { random } from '../../../../lib/infrastructure/utils/random.js';
import { securityPreHandlers } from '../../../../lib/application/security-pre-handlers.js';
import { pickAnswerStatusService } from '../../../../lib/domain/services/pick-answer-status-service.js';

describe('Integration | Application | Scoring-simulator | scenario-simulator-controller', function () {
  let httpTestServer;
  let simulationResults;
  let reward1;
  let errorRate1;
  let challenge1;
  let estimatedLevel1;
  const initialCapacity = 2;

  beforeEach(async function () {
    sinon.stub(usecases, 'simulateFlashDeterministicAssessmentScenario');
    sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin');
    sinon.stub(random, 'weightedRandoms');
    sinon.stub(pickAnswerStatusService, 'pickAnswerStatusFromArray');
    sinon.stub(pickAnswerStatusService, 'pickAnswerStatusForCapacity');

    challenge1 = domainBuilder.buildChallenge({ id: 'chall1', successProbabilityThreshold: 0.65 });
    reward1 = 0.2;
    errorRate1 = 0.3;
    estimatedLevel1 = 0.4;
    simulationResults = [
      {
        challenge: challenge1,
        reward: reward1,
        errorRate: errorRate1,
        estimatedLevel: estimatedLevel1,
      },
    ];

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('/api/scenario-simulator', function () {
    describe('#post', function () {
      beforeEach(async function () {
        challenge1 = domainBuilder.buildChallenge({ id: 'chall1', successProbabilityThreshold: 0.65 });
        reward1 = 0.2;
        errorRate1 = 0.3;
        estimatedLevel1 = 0.4;
        simulationResults = [
          {
            challenge: challenge1,
            reward: reward1,
            errorRate: errorRate1,
            estimatedLevel: estimatedLevel1,
            answerStatus: 'ok',
          },
        ];
      });

      context('When the scenario is deterministic', function () {
        context('When the route is called with correct arguments', function () {
          context('When the route is called with an initial capacity', function () {
            it('should call simulateFlashDeterministicAssessmentScenario usecase with correct arguments', async function () {
              // given
              const answerStatusArray = ['ok'];
              const assessmentId = '13802DK';

              const pickAnswerStatusFromArrayImplementation = sinon.stub();
              pickAnswerStatusService.pickAnswerStatusFromArray
                .withArgs(['ok'])
                .returns(pickAnswerStatusFromArrayImplementation);

              usecases.simulateFlashDeterministicAssessmentScenario
                .withArgs({
                  pickAnswerStatus: pickAnswerStatusFromArrayImplementation,
                  assessmentId,
                  locale: 'en',
                  initialCapacity,
                  stopAtChallenge: undefined,
                })
                .resolves(simulationResults);
              securityPreHandlers.checkAdminMemberHasRoleSuperAdmin.returns(() => true);

              // when
              const response = await httpTestServer.request(
                'POST',
                '/api/scenario-simulator',
                {
                  assessmentId,
                  initialCapacity,
                  answerStatusArray,
                  type: 'deterministic',
                },
                null,
                { 'accept-language': 'en' }
              );

              // then
              expect(response.statusCode).to.equal(200);
              expect(response.result).to.deep.equal(
                _generateScenarioSimulatorBatch([
                  [
                    {
                      errorRate: errorRate1,
                      estimatedLevel: estimatedLevel1,
                      minimumCapability: 0.6190392084062237,
                      'answer-status': 'ok',
                      reward: reward1,
                      difficulty: challenge1.difficulty,
                      discriminant: challenge1.discriminant,
                    },
                  ],
                ])
              );
            });
          });

          context('When the route is called without an initial capacity', function () {
            it('should call simulateFlashDeterministicAssessmentScenario usecase with correct arguments', async function () {
              // given
              const answerStatusArray = ['ok'];
              const assessmentId = '13802DK';

              const pickAnswerStatusFromArrayImplementation = sinon.stub();
              pickAnswerStatusService.pickAnswerStatusFromArray
                .withArgs(['ok'])
                .returns(pickAnswerStatusFromArrayImplementation);

              usecases.simulateFlashDeterministicAssessmentScenario
                .withArgs({
                  pickAnswerStatus: pickAnswerStatusFromArrayImplementation,
                  assessmentId,
                  locale: 'en',
                  stopAtChallenge: undefined,
                  initialCapacity: undefined,
                })
                .resolves(simulationResults);
              securityPreHandlers.checkAdminMemberHasRoleSuperAdmin.returns(() => true);

              // when
              const response = await httpTestServer.request(
                'POST',
                '/api/scenario-simulator',
                {
                  assessmentId,
                  answerStatusArray,
                  type: 'deterministic',
                },
                null,
                { 'accept-language': 'en' }
              );

              // then
              expect(response.statusCode).to.equal(200);
              expect(response.result).to.deep.equal(
                _generateScenarioSimulatorBatch([
                  [
                    {
                      errorRate: errorRate1,
                      estimatedLevel: estimatedLevel1,
                      minimumCapability: 0.6190392084062237,
                      'answer-status': 'ok',
                      reward: reward1,
                      difficulty: challenge1.difficulty,
                      discriminant: challenge1.discriminant,
                    },
                  ],
                ])
              );
            });
          });
        });
      });

      context('When the scenario is random', function () {
        context('When the route is called with correct arguments', function () {
          context('When the route is called without an initial capacity', function () {
            it('should call simulateFlashDeterministicAssessmentScenario usecase with correct arguments', async function () {
              // given
              const length = 1;
              const probabilities = { ok: 0.3, ko: 0.4, aband: 0.3 };
              random.weightedRandoms.withArgs(probabilities, length).returns(['ok']);
              const assessmentId = '13802DK';

              const pickAnswerStatusFromArrayImplementation = sinon.stub();
              pickAnswerStatusService.pickAnswerStatusFromArray
                .withArgs(['ok'])
                .returns(pickAnswerStatusFromArrayImplementation);

              usecases.simulateFlashDeterministicAssessmentScenario
                .withArgs({
                  assessmentId,
                  locale: 'en',
                  pickAnswerStatus: pickAnswerStatusFromArrayImplementation,
                  stopAtChallenge: undefined,
                  initialCapacity: undefined,
                })
                .resolves(simulationResults);
              securityPreHandlers.checkAdminMemberHasRoleSuperAdmin.returns(() => true);

              // when
              const response = await httpTestServer.request(
                'POST',
                '/api/scenario-simulator',
                {
                  assessmentId,
                  type: 'random',
                  probabilities,
                  length,
                },
                null,
                { 'accept-language': 'en' }
              );

              // then
              expect(response.statusCode).to.equal(200);
              expect(response.result).to.deep.equal(
                _generateScenarioSimulatorBatch([
                  [
                    {
                      errorRate: errorRate1,
                      estimatedLevel: estimatedLevel1,
                      minimumCapability: 0.6190392084062237,
                      'answer-status': 'ok',
                      reward: reward1,
                      difficulty: challenge1.difficulty,
                      discriminant: challenge1.discriminant,
                    },
                  ],
                ])
              );
            });
          });

          context('When the route is called with an initial capacity', function () {
            it('should call simulateFlashDeterministicAssessmentScenario usecase with correct arguments', async function () {
              // given
              const length = 1;
              const probabilities = { ok: 0.3, ko: 0.4, aband: 0.3 };
              random.weightedRandoms.withArgs(probabilities, length).returns(['ok']);
              const assessmentId = '13802DK';

              const pickAnswerStatusFromArrayImplementation = sinon.stub();
              pickAnswerStatusService.pickAnswerStatusFromArray
                .withArgs(['ok'])
                .returns(pickAnswerStatusFromArrayImplementation);

              usecases.simulateFlashDeterministicAssessmentScenario
                .withArgs({
                  assessmentId,
                  locale: 'en',
                  pickAnswerStatus: pickAnswerStatusFromArrayImplementation,
                  stopAtChallenge: undefined,
                  initialCapacity,
                })
                .resolves(simulationResults);
              securityPreHandlers.checkAdminMemberHasRoleSuperAdmin.returns(() => true);

              // when
              const response = await httpTestServer.request(
                'POST',
                '/api/scenario-simulator',
                {
                  assessmentId,
                  type: 'random',
                  probabilities,
                  initialCapacity,
                  length,
                },
                null,
                { 'accept-language': 'en' }
              );

              // then
              expect(response.statusCode).to.equal(200);
              expect(response.result).to.deep.equal(
                _generateScenarioSimulatorBatch([
                  [
                    {
                      errorRate: errorRate1,
                      estimatedLevel: estimatedLevel1,
                      minimumCapability: 0.6190392084062237,
                      'answer-status': 'ok',
                      reward: reward1,
                      difficulty: challenge1.difficulty,
                      discriminant: challenge1.discriminant,
                    },
                  ],
                ])
              );
            });
          });
        });
      });

      context('When the scenario is capacity', function () {
        context('When the route is called with correct arguments', function () {
          context('When the route is called without an initial capacity', function () {
            it('should call simulateFlashDeterministicAssessmentScenario usecase with correct arguments', async function () {
              // given
              const capacity = -3.1;
              const assessmentId = '13802DK';

              const pickAnswerStatusFromCapacityImplementation = sinon.stub();
              pickAnswerStatusService.pickAnswerStatusForCapacity
                .withArgs(capacity)
                .returns(pickAnswerStatusFromCapacityImplementation);

              usecases.simulateFlashDeterministicAssessmentScenario
                .withArgs({
                  assessmentId,
                  locale: 'en',
                  pickAnswerStatus: pickAnswerStatusFromCapacityImplementation,
                  stopAtChallenge: undefined,
                  initialCapacity: undefined,
                })
                .resolves(simulationResults);
              securityPreHandlers.checkAdminMemberHasRoleSuperAdmin.returns(() => true);

              // when
              const response = await httpTestServer.request(
                'POST',
                '/api/scenario-simulator',
                {
                  assessmentId,
                  type: 'capacity',
                  capacity,
                },
                null,
                { 'accept-language': 'en' }
              );

              // then
              expect(response.statusCode).to.equal(200);
              expect(response.result).to.deep.equal(
                _generateScenarioSimulatorBatch([
                  [
                    {
                      errorRate: errorRate1,
                      estimatedLevel: estimatedLevel1,
                      minimumCapability: 0.6190392084062237,
                      'answer-status': 'ok',
                      reward: reward1,
                      difficulty: challenge1.difficulty,
                      discriminant: challenge1.discriminant,
                    },
                  ],
                ])
              );
            });
          });

          context('When the route is called with an initial capacity', function () {
            it('should call simulateFlashDeterministicAssessmentScenario usecase with correct arguments', async function () {
              // given
              const capacity = -3.1;
              const assessmentId = '13802DK';

              const pickAnswerStatusFromCapacityImplementation = sinon.stub();
              pickAnswerStatusService.pickAnswerStatusForCapacity
                .withArgs(capacity)
                .returns(pickAnswerStatusFromCapacityImplementation);

              usecases.simulateFlashDeterministicAssessmentScenario
                .withArgs({
                  assessmentId,
                  locale: 'en',
                  pickAnswerStatus: pickAnswerStatusFromCapacityImplementation,
                  stopAtChallenge: undefined,
                  initialCapacity,
                })
                .resolves(simulationResults);
              securityPreHandlers.checkAdminMemberHasRoleSuperAdmin.returns(() => true);

              // when
              const response = await httpTestServer.request(
                'POST',
                '/api/scenario-simulator',
                {
                  assessmentId,
                  type: 'capacity',
                  capacity,
                  initialCapacity,
                },
                null,
                { 'accept-language': 'en' }
              );

              // then
              expect(response.statusCode).to.equal(200);
              expect(response.result).to.deep.equal(
                _generateScenarioSimulatorBatch([
                  [
                    {
                      errorRate: errorRate1,
                      estimatedLevel: estimatedLevel1,
                      minimumCapability: 0.6190392084062237,
                      'answer-status': 'ok',
                      reward: reward1,
                      difficulty: challenge1.difficulty,
                      discriminant: challenge1.discriminant,
                    },
                  ],
                ])
              );
            });
          });
        });
      });
    });
  });

  describe('/api/scenario-simulator/csv-import', function () {
    describe('#post', function () {
      context('when the route is called with a csv file and correct headers', function () {
        it('should call the usecase to validate sessions', async function () {
          // given
          const csvToImport = 'ok;ok\nko;ok';
          const challenge2 = domainBuilder.buildChallenge({ id: 'chall2', successProbabilityThreshold: 0.5 });
          const reward1 = 0.2;
          const errorRate1 = 0.3;
          const estimatedLevel1 = 0.4;
          const reward2 = 0.6;
          const errorRate2 = 0.7;
          const estimatedLevel2 = 0.8;
          const simulationResults1 = [
            {
              challenge: challenge1,
              reward: reward1,
              errorRate: errorRate1,
              estimatedLevel: estimatedLevel1,
              answerStatus: 'ok',
            },
            {
              challenge: challenge2,
              reward: reward2,
              errorRate: errorRate2,
              estimatedLevel: estimatedLevel2,
              answerStatus: 'ok',
            },
          ];

          const pickAnswerStatusFromArrayImplementation1 = sinon.stub();
          const pickAnswerStatusFromArrayImplementation2 = sinon.stub();
          pickAnswerStatusService.pickAnswerStatusFromArray
            .withArgs(['ok', 'ok'])
            .returns(pickAnswerStatusFromArrayImplementation1)
            .withArgs(['ko', 'ok'])
            .returns(pickAnswerStatusFromArrayImplementation2);

          const simulationResults2 = [
            {
              challenge: challenge1,
              reward: reward1,
              errorRate: errorRate1,
              estimatedLevel: estimatedLevel1,
              answerStatus: 'ko',
            },
            {
              challenge: challenge2,
              reward: reward2,
              errorRate: errorRate2,
              estimatedLevel: estimatedLevel2,
              answerStatus: 'ok',
            },
          ];

          usecases.simulateFlashDeterministicAssessmentScenario
            .withArgs({
              assessmentId: 0,
              locale: 'en',
              pickAnswerStatus: pickAnswerStatusFromArrayImplementation1,
            })
            .resolves(simulationResults1);

          usecases.simulateFlashDeterministicAssessmentScenario
            .withArgs({
              assessmentId: 1,
              locale: 'en',
              pickAnswerStatus: pickAnswerStatusFromArrayImplementation2,
            })
            .resolves(simulationResults2);

          securityPreHandlers.checkAdminMemberHasRoleSuperAdmin.returns(() => true);

          // when
          const response = await httpTestServer.request(
            'POST',
            '/api/scenario-simulator/csv-import',
            csvToImport,
            null,
            { 'accept-language': 'en', 'Content-Type': 'text/csv;charset=utf-8' }
          );

          // then
          expect(response.statusCode).to.equal(200);
          expect(response.result).to.deep.equal({
            data: [
              {
                type: 'scenario-simulator-batches',
                id: '0',
                attributes: {
                  'simulation-report': [
                    {
                      'minimum-capability': 0.6190392084062237,
                      reward: reward1,
                      'error-rate': errorRate1,
                      'estimated-level': estimatedLevel1,
                      'answer-status': 'ok',
                      difficulty: challenge1.difficulty,
                      discriminant: challenge1.discriminant,
                    },
                    {
                      'minimum-capability': 0,
                      reward: reward2,
                      'error-rate': errorRate2,
                      'estimated-level': estimatedLevel2,
                      'answer-status': 'ok',
                      difficulty: challenge2.difficulty,
                      discriminant: challenge2.discriminant,
                    },
                  ],
                },
              },
              {
                type: 'scenario-simulator-batches',
                id: '1',
                attributes: {
                  'simulation-report': [
                    {
                      'minimum-capability': 0.6190392084062237,
                      reward: reward1,
                      'error-rate': errorRate1,
                      'estimated-level': estimatedLevel1,
                      'answer-status': 'ko',
                      difficulty: challenge1.difficulty,
                      discriminant: challenge1.discriminant,
                    },
                    {
                      'minimum-capability': 0,
                      reward: reward2,
                      'error-rate': errorRate2,
                      'estimated-level': estimatedLevel2,
                      'answer-status': 'ok',
                      difficulty: challenge2.difficulty,
                      discriminant: challenge2.discriminant,
                    },
                  ],
                },
              },
            ],
          });
        });
      });

      context('when the route is called with a wrong csv file and correct headers', function () {
        it('should send an error message', async function () {
          // given
          const csvToImport = 'ok;error';

          securityPreHandlers.checkAdminMemberHasRoleSuperAdmin.returns(() => true);

          // when
          const response = await httpTestServer.request(
            'POST',
            '/api/scenario-simulator/csv-import',
            csvToImport,
            null,
            { 'accept-language': 'en', 'Content-Type': 'text/csv;charset=utf-8' }
          );

          // then
          expect(response.statusCode).to.equal(400);
        });
      });
    });
  });
});

function _generateScenarioSimulatorBatch(data) {
  return {
    data: data.map((scenario, index) => ({
      type: 'scenario-simulator-batches',
      id: `${index}`,
      attributes: {
        'simulation-report': scenario.map((scenarioSimulatorChallenge) => ({
          'error-rate': scenarioSimulatorChallenge.errorRate,
          'estimated-level': scenarioSimulatorChallenge.estimatedLevel,
          'minimum-capability': scenarioSimulatorChallenge.minimumCapability,
          answer: scenarioSimulatorChallenge.answer,
          reward: scenarioSimulatorChallenge.reward,
          difficulty: scenarioSimulatorChallenge.difficulty,
          discriminant: scenarioSimulatorChallenge.discriminant,
        })),
      },
    })),
  };
}
