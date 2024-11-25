import * as moduleUnderTest from '../../../../../src/certification/flash-certification/application/scenario-simulator-route.js';
import { usecases } from '../../../../../src/certification/flash-certification/domain/usecases/index.js';
import { pickAnswerStatusService } from '../../../../../src/certification/shared/domain/services/pick-answer-status-service.js';
import { pickChallengeService } from '../../../../../src/evaluation/domain/services/pick-challenge-service.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { domainBuilder, expect, HttpTestServer, parseJsonStream, sinon } from '../../../../test-helper.js';

describe('Integration | Application | scenario-simulator-controller', function () {
  let httpTestServer;
  let simulationResults;
  let reward1;
  let errorRate1;
  let challenge1;
  let capacity1;
  const initialCapacity = 2;

  beforeEach(async function () {
    sinon.stub(usecases, 'simulateFlashAssessmentScenario');
    sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin');
    sinon.stub(pickAnswerStatusService, 'pickAnswerStatusFromArray');
    sinon.stub(pickAnswerStatusService, 'pickAnswerStatusForCapacity');
    sinon.stub(pickChallengeService, 'chooseNextChallenge');

    challenge1 = domainBuilder.buildChallenge({ id: 'chall1', successProbabilityThreshold: 0.65 });
    reward1 = 0.2;
    errorRate1 = 0.3;
    capacity1 = 0.4;
    simulationResults = [
      {
        challenge: challenge1,
        reward: reward1,
        errorRate: errorRate1,
        capacity: capacity1,
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
        capacity1 = 0.4;
        simulationResults = [
          {
            challenge: challenge1,
            reward: reward1,
            errorRate: errorRate1,
            capacity: capacity1,
            answerStatus: 'ok',
          },
        ];
      });

      context('When the scenario is forced to space competences', function () {
        it('should call the usecase with the right parameters', async function () {
          // given
          const challengesBetweenSameCompetence = 2;

          const pickChallengeImplementation = sinon.stub();
          pickChallengeService.chooseNextChallenge.withArgs().returns(pickChallengeImplementation);
          const pickAnswerStatusForCapacityImplementation = sinon.stub();
          pickAnswerStatusService.pickAnswerStatusForCapacity
            .withArgs(6)
            .returns(pickAnswerStatusForCapacityImplementation);

          usecases.simulateFlashAssessmentScenario
            .withArgs({
              pickAnswerStatus: pickAnswerStatusForCapacityImplementation,
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
              capacity: 6,
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
                  capacity: capacity1,
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
        it('should call simulateFlashAssessmentScenario usecase with correct arguments', async function () {
          // given
          const challengePickProbability = 40;

          const pickChallengeImplementation = sinon.stub();
          pickChallengeService.chooseNextChallenge
            .withArgs(challengePickProbability)
            .returns(pickChallengeImplementation);
          const pickAnswerStatusForCapacityImplementation = sinon.stub();
          pickAnswerStatusService.pickAnswerStatusForCapacity
            .withArgs(6)
            .returns(pickAnswerStatusForCapacityImplementation);

          usecases.simulateFlashAssessmentScenario
            .withArgs({
              pickAnswerStatus: pickAnswerStatusForCapacityImplementation,
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
              capacity: 6,
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
                  capacity: capacity1,
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
        it('should call simulateFlashAssessmentScenario usecase with correct arguments', async function () {
          // given
          const limitToOneQuestionPerTube = true;

          const pickChallengeImplementation = sinon.stub();
          pickChallengeService.chooseNextChallenge.withArgs().returns(pickChallengeImplementation);
          const pickAnswerStatusForCapacityImplementation = sinon.stub();
          pickAnswerStatusService.pickAnswerStatusForCapacity
            .withArgs(6)
            .returns(pickAnswerStatusForCapacityImplementation);

          usecases.simulateFlashAssessmentScenario
            .withArgs({
              pickAnswerStatus: pickAnswerStatusForCapacityImplementation,
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
              capacity: 6,
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
                  capacity: capacity1,
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
          it('should call simulateFlashAssessmentScenario usecase with correct arguments', async function () {
            // given
            const minimumEstimatedSuccessRateRanges = [
              {
                startingChallengeIndex: 0,
                endingChallengeIndex: 7,
                value: 0.8,
              },
            ];

            const expectedSuccessRateRanges = [
              domainBuilder.buildFlashAssessmentAlgorithmSuccessRateHandlerFixed({
                startingChallengeIndex: 0,
                endingChallengeIndex: 7,
                value: 0.8,
              }),
            ];

            const pickChallengeImplementation = sinon.stub();
            pickChallengeService.chooseNextChallenge.withArgs().returns(pickChallengeImplementation);
            const pickAnswerStatusForCapacityImplementation = sinon.stub();
            pickAnswerStatusService.pickAnswerStatusForCapacity
              .withArgs(6)
              .returns(pickAnswerStatusForCapacityImplementation);

            usecases.simulateFlashAssessmentScenario
              .withArgs({
                pickAnswerStatus: pickAnswerStatusForCapacityImplementation,
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
                capacity: 6,
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
                    capacity: capacity1,
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

      context('When the scenario is capacity', function () {
        context('When the route is called with correct arguments', function () {
          context('When the route is called without an initial capacity', function () {
            it('should call simulateFlashAssessmentScenario usecase with correct arguments', async function () {
              // given
              const capacity = -3.1;

              const pickChallengeImplementation = sinon.stub();
              pickChallengeService.chooseNextChallenge.returns(pickChallengeImplementation);
              const pickAnswerStatusFromCapacityImplementation = sinon.stub();
              pickAnswerStatusService.pickAnswerStatusForCapacity
                .withArgs(capacity)
                .returns(pickAnswerStatusFromCapacityImplementation);

              usecases.simulateFlashAssessmentScenario
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
                      capacity: capacity1,
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
            it('should call simulateFlashAssessmentScenario usecase with correct arguments', async function () {
              // given
              const capacity = -3.1;

              const pickChallengeImplementation = sinon.stub();
              pickChallengeService.chooseNextChallenge.returns(pickChallengeImplementation);
              const pickAnswerStatusFromCapacityImplementation = sinon.stub();
              pickAnswerStatusService.pickAnswerStatusForCapacity
                .withArgs(capacity)
                .returns(pickAnswerStatusFromCapacityImplementation);

              usecases.simulateFlashAssessmentScenario
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
                      capacity: capacity1,
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
});
