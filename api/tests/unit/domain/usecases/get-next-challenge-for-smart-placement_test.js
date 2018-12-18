const { expect, sinon } = require('../../../test-helper');

const getNextChallengeForSmartPlacement = require('../../../../lib/domain/usecases/get-next-challenge-for-smart-placement');
const smartRandom = require('../../../../lib/domain/strategies/smartRandom');

describe('Unit | Domain | Use Cases | get-next-challenge-for-smart-placement', () => {

  describe('#getNextChallengeForSmartPlacement', () => {

    let computedChallenge;

    const answerRepository = {};
    const smartPlacementKnowledgeElementRepository = {};
    const challengeRepository = {};
    const targetProfileRepository = {};

    const userId = 'dummyUserId';
    const assessmentId = 'dummyAssessmentId';
    const targetProfileId = 'dummyTargetProfileId';
    const assessment = { id: assessmentId, userId, campaignParticipation: { getTargetProfileId: null } };
    const answers = ['answers'];
    const challenges = ['challenges'];
    const selectedNextChallenge = {};
    const knowledgeElements = ['knowledge-elements'];
    const skills = ['skills'];
    const targetProfile = { skills };

    beforeEach(() => {
      answerRepository.findByAssessment = sinon.stub().resolves([answers]);
      targetProfileRepository.get = sinon.stub().resolves(targetProfile);
      smartPlacementKnowledgeElementRepository.findByUserId = sinon.stub().resolves(knowledgeElements);
      challengeRepository.findBySkills = sinon.stub().resolves(challenges);
      assessment.campaignParticipation.getTargetProfileId = sinon.stub().returns(targetProfileId);
      smartRandom.getNextChallenge = sinon.stub().resolves(selectedNextChallenge);

      return getNextChallengeForSmartPlacement({ assessment, answerRepository, challengeRepository, smartPlacementKnowledgeElementRepository, targetProfileRepository })
        .then((res) => {
          computedChallenge = res;
        });
    });
    it('should have fetched the answers', () => {
      expect(answerRepository.findByAssessment).to.have.been.calledWithExactly(assessmentId);
    });
    it('should have fetched the target profile', () => {
      expect(targetProfileRepository.get).to.have.been.calledWithExactly(targetProfileId);
    });
    it('should have fetched the knowledge elements by user id', () => {
      expect(smartPlacementKnowledgeElementRepository.findByUserId).to.have.been.calledWithExactly(userId);
    });
    it('should have fetched the challenges by skills', () => {
      expect(challengeRepository.findBySkills).to.have.been.calledWithExactly(skills);
    });
    it('should have returned the next challenge', () => {
      expect(computedChallenge).to.deep.equal(selectedNextChallenge);
    });

  });
});
