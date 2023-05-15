const { expect, sinon, HttpTestServer } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases/index.js');
const moduleUnderTest = require('../../../../lib/application/scenarios-simulator');
const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');

describe('Integration | Application | Scoring-simulator | scenario-simulator-controller', function () {
  let httpTestServer;
  let simulationResults;

  beforeEach(async function () {
    sinon.stub(usecases, 'simulateFlashDeterministicAssessmentScenario');
    sinon.stub(securityPreHandlers, 'checkAdminMemberHasRoleSuperAdmin');
    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('/api/scenario-simulator', function () {
    describe('#post', function () {
      beforeEach(async function () {
        simulationResults = {
          challenges: [],
          estimatedLevel: 2.39201,
        };
      });

      context('When the route is called with correct arguments', function () {
        it('should call simulateFlashDeterministicAssessmentScenario usecase with correct arguments', async function () {
          // given
          const simulationAnswers = ['ok', 'aband', 'ko'];
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
          expect(response.result).to.deep.equal(simulationResults);
        });
      });
    });
  });
});
