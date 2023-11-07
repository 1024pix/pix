import { expect, sinon, HttpTestServer, domainBuilder, parseJsonStream } from '../../../../test-helper.js';
import { usecases } from '../../../../../src/certification/shared/domain/usecases/index.js';
import * as moduleUnderTest from '../../../../../src/certification/flash-certification/application/scenario-simulator-route.js';
import { random } from '../../../../../lib/infrastructure/utils/random.js';
import { securityPreHandlers } from '../../../../../lib/application/security-pre-handlers.js';
import { pickAnswerStatusService } from '../../../../../lib/domain/services/pick-answer-status-service.js';
import { pickChallengeService } from '../../../../../lib/domain/services/pick-challenge-service.js';

describe('Integration | Application | scenario-simulator-controller', function () {
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

      context('When the scenario is forced to pass through some competences', function () {
        context('When there is no warmup', function () {
          it('should call simulateFlashDeterministicAssessmentScenario usecase with correct arguments', async function () {
            // given
            const answerStatusArray = ['ok'];
            const forcedCompetences = ['compA', 'compB', 'compC'];

            const pickChallengeImplementation = sinon.stub();
            pickChallengeService.chooseNextChallenge.withArgs().returns(pickChallengeImplementation);
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
            const parsedResult = parseJsonStream(response);
            expect(parsedResult).to.deep.equal([
              {
                index: 0,
                simulationReport: [
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
              },
            ]);
          });
        });
      });

      context('When the scenario is forced to space competences', function () {
        it('should call the usecase with the right parameters', async function () {
          // given
          const answerStatusArray = ['ok'];
          const challengesBetweenSameCompetence = 2;

          const pickChallengeImplementation = sinon.stub();
          pickChallengeService.chooseNextChallenge.withArgs().returns(pickChallengeImplementation);
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
              challengesBetweenSameCompetence,
            })
            .resolves(simulationResults);
          securityPreHandlers.checkAdminMemberHasRoleSuperAdmin.returns(() => true);

          // when
          const response = await httpTestServer.request(
            'POST',
            '/api/scenario-simulator',
            {
              initialCapacity,
              answerStatusArray,
              type: 'deterministic',
              challengesBetweenSameCompetence,
            },
            null,
            { 'accept-language': 'en' },
          );

          // then
          expect(response.statusCode).to.equal(200);
          const parsedResult = parseJsonStream(response);
          expect(parsedResult).to.deep.equal([
            {
              index: 0,
              simulationReport: [
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
            },
          ]);
        });
      });

      context('When configuring the challenge pick probability', function () {
        it('should call simulateFlashDeterministicAssessmentScenario usecase with correct arguments', async function () {
          // given
          const answerStatusArray = ['ok'];
          const challengePickProbability = 40;

          const pickChallengeImplementation = sinon.stub();
          pickChallengeService.chooseNextChallenge
            .withArgs(challengePickProbability)
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
              initialCapacity,
              answerStatusArray,
              type: 'deterministic',
              challengePickProbability,
            },
            null,
            { 'accept-language': 'en' },
          );

          // then
          expect(response.statusCode).to.equal(200);
          const parsedResult = parseJsonStream(response);
          expect(parsedResult).to.deep.equal([
            {
              index: 0,
              simulationReport: [
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
            },
          ]);
        });
      });

      context('When configuring the limit of challenges per tube', function () {
        it('should call simulateFlashDeterministicAssessmentScenario usecase with correct arguments', async function () {
          // given
          const limitToOneQuestionPerTube = true;
          const answerStatusArray = ['ok'];

          const pickChallengeImplementation = sinon.stub();
          pickChallengeService.chooseNextChallenge.withArgs().returns(pickChallengeImplementation);
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
              limitToOneQuestionPerTube,
            })
            .resolves(simulationResults);
          securityPreHandlers.checkAdminMemberHasRoleSuperAdmin.returns(() => true);

          // when
          const response = await httpTestServer.request(
            'POST',
            '/api/scenario-simulator',
            {
              initialCapacity,
              answerStatusArray,
              type: 'deterministic',
              limitToOneQuestionPerTube,
            },
            null,
            { 'accept-language': 'en' },
          );

          // then
          expect(response.statusCode).to.equal(200);
          const parsedResult = parseJsonStream(response);
          expect(parsedResult).to.deep.equal([
            {
              index: 0,
              simulationReport: [
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
            },
          ]);
        });
      });

      context('When configuring the minimum success rates', function () {
        context('When providing valid parameters', function () {
          it('should call simulateFlashDeterministicAssessmentScenario usecase with correct arguments', async function () {
            // given
            const answerStatusArray = ['ok'];

            const minimumEstimatedSuccessRateRanges = [
              {
                type: 'fixed',
                startingChallengeIndex: 0,
                endingChallengeIndex: 7,
                value: 0.8,
              },
              {
                type: 'linear',
                startingChallengeIndex: 8,
                endingChallengeIndex: 15,
                startingValue: 0.8,
                endingValue: 0.5,
              },
            ];

            const expectedSuccessRateRanges = [
              domainBuilder.buildFlashAssessmentAlgorithmSuccessRateHandlerFixed({
                startingChallengeIndex: 0,
                endingChallengeIndex: 7,
                value: 0.8,
              }),
              domainBuilder.buildFlashAssessmentAlgorithmSuccessRateHandlerLinear({
                startingChallengeIndex: 8,
                endingChallengeIndex: 15,
                startingValue: 0.8,
                endingValue: 0.5,
              }),
            ];

            const pickChallengeImplementation = sinon.stub();
            pickChallengeService.chooseNextChallenge.withArgs().returns(pickChallengeImplementation);
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
                minimumEstimatedSuccessRateRanges: expectedSuccessRateRanges,
              })
              .resolves(simulationResults);
            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin.returns(() => true);

            // when
            const response = await httpTestServer.request(
              'POST',
              '/api/scenario-simulator',
              {
                initialCapacity,
                answerStatusArray,
                type: 'deterministic',
                minimumEstimatedSuccessRateRanges,
              },
              null,
              { 'accept-language': 'en' },
            );

            // then
            expect(response.statusCode).to.equal(200);
            const parsedResult = parseJsonStream(response);
            expect(parsedResult).to.deep.equal([
              {
                index: 0,
                simulationReport: [
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
              },
            ]);
          });
        });

        context('When providing invalid fixed config', function () {
          it('should respond with a 400 error', async function () {
            // given
            const answerStatusArray = ['ok'];

            const minimumEstimatedSuccessRateRanges = [
              {
                type: 'fixed',
                startingChallengeIndex: 0,
                endingChallengeIndex: 7,
                value: 0.8,
              },
              {
                type: 'linear',
                startingChallengeIndex: 8,
                endingChallengeIndex: 7,
                startingValue: 0.8,
                endingValue: 0.5,
              },
            ];

            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin.returns(() => true);

            // when
            const response = await httpTestServer.request(
              'POST',
              '/api/scenario-simulator',
              {
                initialCapacity,
                answerStatusArray,
                type: 'deterministic',
                minimumEstimatedSuccessRateRanges,
              },
              null,
              { 'accept-language': 'en' },
            );

            // then
            expect(response.statusCode).to.equal(400);
          });
        });

        context('When providing invalid linear config', function () {
          it('should respond with a 400 error', async function () {
            // given
            const answerStatusArray = ['ok'];

            const minimumEstimatedSuccessRateRanges = [
              {
                type: 'fixed',
                startingChallengeIndex: 0,
                endingChallengeIndex: 7,
                value: 0.8,
              },
              {
                type: 'linear',
                startingChallengeIndex: 8,
                endingChallengeIndex: 15,
                startingValue: 1.3,
                endingValue: 0.5,
              },
            ];

            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin.returns(() => true);

            // when
            const response = await httpTestServer.request(
              'POST',
              '/api/scenario-simulator',
              {
                initialCapacity,
                answerStatusArray,
                type: 'deterministic',
                minimumEstimatedSuccessRateRanges,
              },
              null,
              { 'accept-language': 'en' },
            );

            // then
            expect(response.statusCode).to.equal(400);
          });
        });

        context('When providing invalid type', function () {
          it('should respond with a 400 error', async function () {
            // given
            const answerStatusArray = ['ok'];

            const minimumEstimatedSuccessRateRanges = [
              {
                type: 'toto',
                startingChallengeIndex: 0,
                endingChallengeIndex: 7,
                value: 0.8,
              },
            ];

            securityPreHandlers.checkAdminMemberHasRoleSuperAdmin.returns(() => true);

            // when
            const response = await httpTestServer.request(
              'POST',
              '/api/scenario-simulator',
              {
                initialCapacity,
                answerStatusArray,
                type: 'deterministic',
                minimumEstimatedSuccessRateRanges,
              },
              null,
              { 'accept-language': 'en' },
            );

            // then
            expect(response.statusCode).to.equal(400);
          });
        });
      });

      context('When configuring the passage by all competences', function () {
        it('should call simulateFlashDeterministicAssessmentScenario usecase with correct arguments', async function () {
          // given
          const enablePassageByAllCompetences = true;
          const answerStatusArray = ['ok'];

          const pickChallengeImplementation = sinon.stub();
          pickChallengeService.chooseNextChallenge.withArgs().returns(pickChallengeImplementation);
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
              enablePassageByAllCompetences,
            })
            .resolves(simulationResults);
          securityPreHandlers.checkAdminMemberHasRoleSuperAdmin.returns(() => true);

          // when
          const response = await httpTestServer.request(
            'POST',
            '/api/scenario-simulator',
            {
              initialCapacity,
              answerStatusArray,
              type: 'deterministic',
              enablePassageByAllCompetences,
            },
            null,
            { 'accept-language': 'en' },
          );

          // then
          expect(response.statusCode).to.equal(200);
          const parsedResult = parseJsonStream(response);
          expect(parsedResult).to.deep.equal([
            {
              index: 0,
              simulationReport: [
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
            },
          ]);
        });
      });

      context('When the scenario is deterministic', function () {
        context('When the route is called with correct arguments', function () {
          context('When the route is called with an initial capacity', function () {
            it('should call simulateFlashDeterministicAssessmentScenario usecase with correct arguments', async function () {
              // given
              const answerStatusArray = ['ok'];

              const pickChallengeImplementation = sinon.stub();
              pickChallengeService.chooseNextChallenge.returns(pickChallengeImplementation);
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
                  initialCapacity,
                  answerStatusArray,
                  type: 'deterministic',
                },
                null,
                { 'accept-language': 'en' },
              );

              // then
              expect(response.statusCode).to.equal(200);
              const parsedResult = parseJsonStream(response);
              expect(parsedResult).to.deep.equal([
                {
                  index: 0,
                  simulationReport: [
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
                },
              ]);
            });
          });

          context('When the route is called without an initial capacity', function () {
            it('should call simulateFlashDeterministicAssessmentScenario usecase with correct arguments', async function () {
              // given
              const answerStatusArray = ['ok'];

              const pickChallengeImplementation = sinon.stub();
              pickChallengeService.chooseNextChallenge.returns(pickChallengeImplementation);
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
                  answerStatusArray,
                  type: 'deterministic',
                },
                null,
                { 'accept-language': 'en' },
              );

              // then
              expect(response.statusCode).to.equal(200);
              const parsedResult = parseJsonStream(response);
              expect(parsedResult).to.deep.equal([
                {
                  index: 0,
                  simulationReport: [
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
                },
              ]);
            });
          });

          context('When the route is called with a numberOfIterations', function () {
            it('should call simulateFlashDeterministicAssessmentScenario usecase with correct arguments', async function () {
              // given
              const answerStatusArray = ['ok'];
              const numberOfIterations = 2;

              const pickChallengeImplementation = sinon.stub();
              pickChallengeService.chooseNextChallenge
                .returns(pickChallengeImplementation)
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

              const parsedResult = parseJsonStream(response);
              expect(parsedResult).to.deep.equal([
                {
                  index: 0,
                  simulationReport: [result],
                },
                {
                  index: 1,
                  simulationReport: [result],
                },
              ]);
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

              const pickChallengeImplementation = sinon.stub();
              pickChallengeService.chooseNextChallenge.returns(pickChallengeImplementation);
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
                  type: 'random',
                  probabilities,
                  length,
                },
                null,
                { 'accept-language': 'en' },
              );

              // then
              expect(response.statusCode).to.equal(200);
              const parsedResult = parseJsonStream(response);
              expect(parsedResult).to.deep.equal([
                {
                  index: 0,
                  simulationReport: [
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
                },
              ]);
            });
          });

          context('When the route is called with an initial capacity', function () {
            it('should call simulateFlashDeterministicAssessmentScenario usecase with correct arguments', async function () {
              // given
              const length = 1;
              const probabilities = { ok: 0.3, ko: 0.4, aband: 0.3 };
              random.weightedRandoms.withArgs(probabilities, length).returns(['ok']);

              const pickChallengeImplementation = sinon.stub();
              pickChallengeService.chooseNextChallenge.returns(pickChallengeImplementation);
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
              const parsedResult = parseJsonStream(response);
              expect(parsedResult).to.deep.equal([
                {
                  index: 0,
                  simulationReport: [
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
                },
              ]);
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

              const pickChallengeImplementation = sinon.stub();
              pickChallengeService.chooseNextChallenge.returns(pickChallengeImplementation);
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
                  type: 'capacity',
                  capacity,
                },
                null,
                { 'accept-language': 'en' },
              );

              // then
              expect(response.statusCode).to.equal(200);
              const parsedResult = parseJsonStream(response);
              expect(parsedResult).to.deep.equal([
                {
                  index: 0,
                  simulationReport: [
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
                },
              ]);
            });
          });

          context('When the route is called with an initial capacity', function () {
            it('should call simulateFlashDeterministicAssessmentScenario usecase with correct arguments', async function () {
              // given
              const capacity = -3.1;

              const pickChallengeImplementation = sinon.stub();
              pickChallengeService.chooseNextChallenge.returns(pickChallengeImplementation);
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
                  type: 'capacity',
                  capacity,
                  initialCapacity,
                },
                null,
                { 'accept-language': 'en' },
              );

              // then
              expect(response.statusCode).to.equal(200);
              const parsedResult = parseJsonStream(response);
              expect(parsedResult).to.deep.equal([
                {
                  index: 0,
                  simulationReport: [
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
                },
              ]);
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
