const { expect, sinon } = require('../../../test-helper');

const getNextChallengeForSmartPlacement = require('../../../../lib/domain/usecases/get-next-challenge-for-smart-placement');
const smartRandom = require('../../../../lib/domain/strategies/smartRandom');

describe('Unit | Domain | Use Cases | get-next-challenge-for-smart-placement', () => {

  describe('#getNextChallengeForSmartPlacement', () => {

    const userId = 'dummyUserId';
    const assessmentId = 'dummyAssessmentId';
    const targetProfileId = 'dummyTargetProfileId';
    const assessment = { id: assessmentId, userId, campaignParticipation: { getTargetProfileId() { return targetProfileId; } } };

    const answerRepository = {
      async findByAssessment(assessmentId) { return { answersFor: assessmentId }; }
    };
    const smartPlacementKnowledgeElementRepository = {
      async findByUserId(userId) { return { knowledgeElementsFor: userId }; }
    };
    const challengeRepository = {
      async findBySkills(skills) { return { challengesFor: skills }; }
    };
    const targetProfileRepository = {
      async get(profileId) {
        return { profileId, skills: `skillsOf${profileId}` };
      }
    };

    beforeEach(() => {
      sinon.stub(smartRandom, 'getNextChallenge').returnsArg(0);
    });

    afterEach(() => { smartRandom.getNextChallenge.restore(); });

    it('should have returned the next challenge', async () => {
      const computedChallenge = await getNextChallengeForSmartPlacement({
        assessment,
        answerRepository,
        challengeRepository,
        smartPlacementKnowledgeElementRepository,
        targetProfileRepository
      });
      expect(computedChallenge).to.deep.equal({
        answers: {
          answersFor: 'dummyAssessmentId'
        },
        challenges: {
          challengesFor: 'skillsOfdummyTargetProfileId'
        },
        knowledgeElements: [
          'dummyUserId'
        ],
        targetProfile: {
          profileId: 'dummyTargetProfileId',
          skills: 'skillsOfdummyTargetProfileId'
        }
      });
    });

  });
});
