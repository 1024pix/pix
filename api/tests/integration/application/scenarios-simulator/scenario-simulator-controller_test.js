import { expect, sinon, HttpTestServer, domainBuilder } from '../../../test-helper.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import * as moduleUnderTest from '../../../../lib/application/scenarios-simulator/index.js';
import { random } from '../../../../lib/infrastructure/utils/random.js';
import { securityPreHandlers } from '../../../../lib/application/security-pre-handlers.js';
import { pickAnswerStatusService } from '../../../../lib/domain/services/pick-answer-status-service.js';
import { pickChallengeService } from '../../../../lib/domain/services/pick-challenge-service.js';

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
    sinon.stub(pickChallengeService, 'chooseNextChallenge');

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

      context('When the scenario is force to pass some competences', function () {
        context('When there is no warmup', function () {
          it('should call simulateFlashDeterministicAssessmentScenario usecase with correct arguments', async function () {
            // given
            const answerStatusArray = ['ok'];
            const assessmentId = '13802DK';
            const forcedCompetences = ['compA', 'compB', 'compC'];

            const pickChallengeImplementation = sinon.stub();
            pickChallengeService.chooseNextChallenge.withArgs(`${assessmentId}-0`).returns(pickChallengeImplementation);
            const pickAnswerStatusFromArrayImplementation = sinon.stub();
            pickAnswerStatusService.pickAnswerStatusFromArray
              .withArgs(['ok'])
              .returns(pickAnswerStatusFromArrayImplementation);

            usecases.simulateFlashDeterministicAssessmentScenario
              .withArgs({
                pickAnswerStatus: pickAnswerStatusFromArrayImplementation,
                locale: 'en',
                pickChallenge: pickChallengeImplementation,
                initialCapacity,
                forcedCompetences,
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
                forcedCompetences,
              },
              null,
              { 'accept-language': 'en' },
            );

            // then
            expect(response.statusCode).to.equal(200);
            expect(response.result).to.deep.equal(
              _generateScenarioSimulatorBatch([
                [
                  {
                    challengeId: challenge1.id,
                    errorRate: errorRate1,
                    estimatedLevel: estimatedLevel1,
                    minimumCapability: 0.6190392084062237,
                    answerStatus: 'ok',
                    reward: reward1,
                    difficulty: challenge1.difficulty,
                    discriminant: challenge1.discriminant,
                  },
                ],
              ]),
            );
          });
        });
      });

      context('When the scenario is deterministic', function () {
        context('When the route is called with correct arguments', function () {
          context('When the route is called with an initial capacity', function () {
            it('should call simulateFlashDeterministicAssessmentScenario usecase with correct arguments', async function () {
              // given
              const answerStatusArray = ['ok'];
              const assessmentId = '13802DK';

              const pickChallengeImplementation = sinon.stub();
              pickChallengeService.chooseNextChallenge
                .withArgs(`${assessmentId}-0`)
                .returns(pickChallengeImplementation);
              const pickAnswerStatusFromArrayImplementation = sinon.stub();
              pickAnswerStatusService.pickAnswerStatusFromArray
                .withArgs(['ok'])
                .returns(pickAnswerStatusFromArrayImplementation);

              usecases.simulateFlashDeterministicAssessmentScenario
                .withArgs({
                  pickAnswerStatus: pickAnswerStatusFromArrayImplementation,
                  locale: 'en',
                  pickChallenge: pickChallengeImplementation,
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
                  initialCapacity,
                  answerStatusArray,
                  type: 'deterministic',
                },
                null,
                { 'accept-language': 'en' },
              );

              // then
              expect(response.statusCode).to.equal(200);
              expect(response.result).to.deep.equal(
                _generateScenarioSimulatorBatch([
                  [
                    {
                      challengeId: challenge1.id,
                      errorRate: errorRate1,
                      estimatedLevel: estimatedLevel1,
                      minimumCapability: 0.6190392084062237,
                      answerStatus: 'ok',
                      reward: reward1,
                      difficulty: challenge1.difficulty,
                      discriminant: challenge1.discriminant,
                    },
                  ],
                ]),
              );
            });
          });

          context('When the route is called without an initial capacity', function () {
            it('should call simulateFlashDeterministicAssessmentScenario usecase with correct arguments', async function () {
              // given
              const answerStatusArray = ['ok'];
              const assessmentId = '13802DK';

              const pickChallengeImplementation = sinon.stub();
              pickChallengeService.chooseNextChallenge
                .withArgs(`${assessmentId}-0`)
                .returns(pickChallengeImplementation);
              const pickAnswerStatusFromArrayImplementation = sinon.stub();
              pickAnswerStatusService.pickAnswerStatusFromArray
                .withArgs(['ok'])
                .returns(pickAnswerStatusFromArrayImplementation);

              usecases.simulateFlashDeterministicAssessmentScenario
                .withArgs({
                  pickAnswerStatus: pickAnswerStatusFromArrayImplementation,
                  pickChallenge: pickChallengeImplementation,
                  locale: 'en',
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
                { 'accept-language': 'en' },
              );

              // then
              expect(response.statusCode).to.equal(200);
              expect(response.result).to.deep.equal(
                _generateScenarioSimulatorBatch([
                  [
                    {
                      challengeId: challenge1.id,
                      errorRate: errorRate1,
                      estimatedLevel: estimatedLevel1,
                      minimumCapability: 0.6190392084062237,
                      answerStatus: 'ok',
                      reward: reward1,
                      difficulty: challenge1.difficulty,
                      discriminant: challenge1.discriminant,
                    },
                  ],
                ]),
              );
            });
          });

          context('When the route is called with a numberOfIterations', function () {
            it('should call simulateFlashDeterministicAssessmentScenario usecase with correct arguments', async function () {
              // given
              const answerStatusArray = ['ok'];
              const assessmentId = '13802DK';
              const numberOfIterations = 2;

              const pickChallengeImplementation = sinon.stub();
              pickChallengeService.chooseNextChallenge
                .withArgs(`${assessmentId}-0`)
                .returns(pickChallengeImplementation)
                .withArgs(`${assessmentId}-1`)
                .returns(pickChallengeImplementation);
              const pickAnswerStatusFromArrayImplementation = sinon.stub();
              pickAnswerStatusService.pickAnswerStatusFromArray
                .withArgs(['ok'])
                .returns(pickAnswerStatusFromArrayImplementation);

              usecases.simulateFlashDeterministicAssessmentScenario
                .withArgs({
                  pickAnswerStatus: pickAnswerStatusFromArrayImplementation,
                  pickChallenge: pickChallengeImplementation,
                  locale: 'en',
                })
                .resolves(simulationResults);
              securityPreHandlers.checkAdminMemberHasRoleSuperAdmin.returns(() => true);

              // when
              const response = await httpTestServer.request(
                'POST',
                '/api/scenario-simulator',
                {
                  assessmentId,
                  numberOfIterations,
                  answerStatusArray,
                  type: 'deterministic',
                },
                null,
                { 'accept-language': 'en' },
              );

              const result = {
                challengeId: challenge1.id,
                errorRate: errorRate1,
                estimatedLevel: estimatedLevel1,
                minimumCapability: 0.6190392084062237,
                answerStatus: 'ok',
                reward: reward1,
                difficulty: challenge1.difficulty,
                discriminant: challenge1.discriminant,
              };

              // then
              expect(response.statusCode).to.equal(200);
              expect(response.result).to.deep.equal(_generateScenarioSimulatorBatch([[result], [result]]));
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

              const pickChallengeImplementation = sinon.stub();
              pickChallengeService.chooseNextChallenge
                .withArgs(`${assessmentId}-0`)
                .returns(pickChallengeImplementation);
              const pickAnswerStatusFromArrayImplementation = sinon.stub();
              pickAnswerStatusService.pickAnswerStatusFromArray
                .withArgs(['ok'])
                .returns(pickAnswerStatusFromArrayImplementation);

              usecases.simulateFlashDeterministicAssessmentScenario
                .withArgs({
                  pickChallenge: pickChallengeImplementation,
                  locale: 'en',
                  pickAnswerStatus: pickAnswerStatusFromArrayImplementation,
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
                { 'accept-language': 'en' },
              );

              // then
              expect(response.statusCode).to.equal(200);
              expect(response.result).to.deep.equal(
                _generateScenarioSimulatorBatch([
                  [
                    {
                      challengeId: challenge1.id,
                      errorRate: errorRate1,
                      estimatedLevel: estimatedLevel1,
                      minimumCapability: 0.6190392084062237,
                      answerStatus: 'ok',
                      reward: reward1,
                      difficulty: challenge1.difficulty,
                      discriminant: challenge1.discriminant,
                    },
                  ],
                ]),
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

              const pickChallengeImplementation = sinon.stub();
              pickChallengeService.chooseNextChallenge
                .withArgs(`${assessmentId}-0`)
                .returns(pickChallengeImplementation);
              const pickAnswerStatusFromArrayImplementation = sinon.stub();
              pickAnswerStatusService.pickAnswerStatusFromArray
                .withArgs(['ok'])
                .returns(pickAnswerStatusFromArrayImplementation);

              usecases.simulateFlashDeterministicAssessmentScenario
                .withArgs({
                  pickChallenge: pickChallengeImplementation,
                  locale: 'en',
                  pickAnswerStatus: pickAnswerStatusFromArrayImplementation,
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
                { 'accept-language': 'en' },
              );

              // then
              expect(response.statusCode).to.equal(200);
              expect(response.result).to.deep.equal(
                _generateScenarioSimulatorBatch([
                  [
                    {
                      challengeId: challenge1.id,
                      errorRate: errorRate1,
                      estimatedLevel: estimatedLevel1,
                      minimumCapability: 0.6190392084062237,
                      answerStatus: 'ok',
                      reward: reward1,
                      difficulty: challenge1.difficulty,
                      discriminant: challenge1.discriminant,
                    },
                  ],
                ]),
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

              const pickChallengeImplementation = sinon.stub();
              pickChallengeService.chooseNextChallenge
                .withArgs(`${assessmentId}-0`)
                .returns(pickChallengeImplementation);
              const pickAnswerStatusFromCapacityImplementation = sinon.stub();
              pickAnswerStatusService.pickAnswerStatusForCapacity
                .withArgs(capacity)
                .returns(pickAnswerStatusFromCapacityImplementation);

              usecases.simulateFlashDeterministicAssessmentScenario
                .withArgs({
                  pickChallenge: pickChallengeImplementation,
                  locale: 'en',
                  pickAnswerStatus: pickAnswerStatusFromCapacityImplementation,
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
                { 'accept-language': 'en' },
              );

              // then
              expect(response.statusCode).to.equal(200);
              expect(response.result).to.deep.equal(
                _generateScenarioSimulatorBatch([
                  [
                    {
                      challengeId: challenge1.id,
                      errorRate: errorRate1,
                      estimatedLevel: estimatedLevel1,
                      minimumCapability: 0.6190392084062237,
                      answerStatus: 'ok',
                      reward: reward1,
                      difficulty: challenge1.difficulty,
                      discriminant: challenge1.discriminant,
                    },
                  ],
                ]),
              );
            });
          });

          context('When the route is called with an initial capacity', function () {
            it('should call simulateFlashDeterministicAssessmentScenario usecase with correct arguments', async function () {
              // given
              const capacity = -3.1;
              const assessmentId = '13802DK';

              const pickChallengeImplementation = sinon.stub();
              pickChallengeService.chooseNextChallenge
                .withArgs(`${assessmentId}-0`)
                .returns(pickChallengeImplementation);
              const pickAnswerStatusFromCapacityImplementation = sinon.stub();
              pickAnswerStatusService.pickAnswerStatusForCapacity
                .withArgs(capacity)
                .returns(pickAnswerStatusFromCapacityImplementation);

              usecases.simulateFlashDeterministicAssessmentScenario
                .withArgs({
                  pickChallenge: pickChallengeImplementation,
                  locale: 'en',
                  pickAnswerStatus: pickAnswerStatusFromCapacityImplementation,
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
                { 'accept-language': 'en' },
              );

              // then
              expect(response.statusCode).to.equal(200);
              expect(response.result).to.deep.equal(
                _generateScenarioSimulatorBatch([
                  [
                    {
                      challengeId: challenge1.id,
                      errorRate: errorRate1,
                      estimatedLevel: estimatedLevel1,
                      minimumCapability: 0.6190392084062237,
                      answerStatus: 'ok',
                      reward: reward1,
                      difficulty: challenge1.difficulty,
                      discriminant: challenge1.discriminant,
                    },
                  ],
                ]),
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

          const pickChallengeImplementation = sinon.stub();
          pickChallengeService.chooseNextChallenge
            .withArgs(0)
            .returns(pickChallengeImplementation)
            .withArgs(1)
            .returns(pickChallengeImplementation);

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
              pickChallenge: pickChallengeImplementation,
              locale: 'en',
              pickAnswerStatus: pickAnswerStatusFromArrayImplementation1,
            })
            .resolves(simulationResults1);

          usecases.simulateFlashDeterministicAssessmentScenario
            .withArgs({
              pickChallenge: pickChallengeImplementation,
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
            { 'accept-language': 'en', 'Content-Type': 'text/csv;charset=utf-8' },
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
                      'challenge-id': challenge1.id,
                      'minimum-capability': 0.6190392084062237,
                      reward: reward1,
                      'error-rate': errorRate1,
                      'estimated-level': estimatedLevel1,
                      'answer-status': 'ok',
                      difficulty: challenge1.difficulty,
                      discriminant: challenge1.discriminant,
                    },
                    {
                      'challenge-id': challenge2.id,
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
                      'challenge-id': challenge1.id,
                      'minimum-capability': 0.6190392084062237,
                      reward: reward1,
                      'error-rate': errorRate1,
                      'estimated-level': estimatedLevel1,
                      'answer-status': 'ko',
                      difficulty: challenge1.difficulty,
                      discriminant: challenge1.discriminant,
                    },
                    {
                      'challenge-id': challenge2.id,
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
            { 'accept-language': 'en', 'Content-Type': 'text/csv;charset=utf-8' },
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
          'challenge-id': scenarioSimulatorChallenge.challengeId,
          'error-rate': scenarioSimulatorChallenge.errorRate,
          'estimated-level': scenarioSimulatorChallenge.estimatedLevel,
          'minimum-capability': scenarioSimulatorChallenge.minimumCapability,
          'answer-status': scenarioSimulatorChallenge.answerStatus,
          reward: scenarioSimulatorChallenge.reward,
          difficulty: scenarioSimulatorChallenge.difficulty,
          discriminant: scenarioSimulatorChallenge.discriminant,
        })),
      },
    })),
  };
}
