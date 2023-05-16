import { expect, sinon, HttpTestServer, domainBuilder } from '../../../test-helper.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import * as moduleUnderTest from '../../../../lib/application/scenarios-simulator/index.js';
import { securityPreHandlers } from '../../../../lib/application/security-pre-handlers.js';

describe('Integration | Application | Scoring-simulator | scenario-simulator-controller', function () {
  let httpTestServer;
  let simulationResults;
  let reward1;
  let errorRate1;
  let challenge1;
  let estimatedLevel1;

  beforeEach(async function () {
    sinon.stub(usecases, 'simulateFlashDeterministicAssessmentScenario');
    sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin');
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
          },
        ];
      });

      context('When the route is called with correct arguments', function () {
        it('should call simulateFlashDeterministicAssessmentScenario usecase with correct arguments', async function () {
          // given
          const simulationAnswers = ['ok'];
          const assessmentId = '13802DK';
          usecases.simulateFlashDeterministicAssessmentScenario
            .withArgs({
              simulationAnswers,
              assessmentId,
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
              simulationAnswers,
            },
            null,
            { 'accept-language': 'en' }
          );

          // then
          expect(response.statusCode).to.equal(200);
          expect(response.result).to.deep.equal({
            data: [
              {
                attributes: {
                  'error-rate': errorRate1,
                  'estimated-level': estimatedLevel1,
                  'minimum-capability': 0.6190392084062237,
                  'simulation-answer': 'ok',
                  reward: reward1,
                },
                id: 'chall1',
                type: 'scenario-simulator-challenges',
              },
            ],
          });
        });
      });
    });
  });
});
