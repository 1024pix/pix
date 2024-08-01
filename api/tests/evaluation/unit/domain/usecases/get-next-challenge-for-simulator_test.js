import { SmartRandomLog } from '../../../../../src/evaluation/domain/models/SmartRandomLog.js';
import { getNextChallengeForSimulator } from '../../../../../src/evaluation/domain/usecases/get-next-challenge-for-simulator.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | UseCase | get-next-challenge-for-simulator', function () {
  describe('#getNextChallengeForSimulator', function () {
    let pickChallengeService;
    let smartRandomService;

    beforeEach(function () {
      pickChallengeService = {
        pickChallenge: sinon.stub(),
      };

      smartRandomService = {
        getPossibleSkillsForNextChallenge: sinon.stub(),
      };
    });

    context('when smartRandomService hasAssessmentEnded property is true', function () {
      it('should only return smartRandom details and call only smartRandomService', function () {
        // given
        smartRandomService.getPossibleSkillsForNextChallenge.returns({
          hasAssessmentEnded: true,
          possibleSkillsForNextChallenge: [],
        });

        // when
        const { challenge } = getNextChallengeForSimulator({
          simulationParameters: {
            answers: [],
          },
          pickChallengeService,
          smartRandomService,
        });

        // then
        expect(smartRandomService.getPossibleSkillsForNextChallenge).to.have.been.calledOnce;
        expect(pickChallengeService.pickChallenge).to.not.have.been.called;
        expect(challenge).to.be.null;
      });
    });

    context('when smartRandomService hasAssessmentEnded property is false', function () {
      it('should return pickChallengeService response', function () {
        // given
        const possibleSkillsForNextChallenge = Symbol('possibleSkillsForNextChallenge');
        const pickChallengeServiceResult = Symbol('pickChallengeServiceResult');
        const smartRandomLog = new SmartRandomLog();
        const simulationParameters = {
          assessmentId: Symbol('assessmentId'),
          locale: Symbol('locale'),
          answers: [],
        };

        smartRandomService.getPossibleSkillsForNextChallenge.returns({
          hasAssessmentEnded: false,
          possibleSkillsForNextChallenge,
          smartRandomLog,
        });

        pickChallengeService.pickChallenge.returns(pickChallengeServiceResult);

        // when
        const result = getNextChallengeForSimulator({
          simulationParameters,
          pickChallengeService,
          smartRandomService,
        });

        // then
        expect(smartRandomService.getPossibleSkillsForNextChallenge).to.have.been.calledOnce;
        expect(pickChallengeService.pickChallenge).to.have.been.calledWithExactly({
          skills: possibleSkillsForNextChallenge,
          randomSeed: simulationParameters.assessmentId,
          locale: simulationParameters.locale,
        });

        expect(result.challenge).to.equal(pickChallengeServiceResult);
      });
    });
  });
});
