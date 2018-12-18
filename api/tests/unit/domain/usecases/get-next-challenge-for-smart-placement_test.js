const { expect, sinon, domainBuilder } = require('../../../test-helper');

const getNextChallengeForSmartPlacement = require('../../../../lib/domain/usecases/get-next-challenge-for-smart-placement');
const Challenge = require('../../../../lib/domain/models/Challenge');
const Skill = require('../../../../lib/domain/models/Skill');
const smartRandom = require('../../../../lib/domain/strategies/smartRandom');

describe('Unit | Domain | Use Cases | get-next-challenge-for-smart-placement', () => {

  describe('#getNextChallengeForSmartPlacement', () => {

    const answerRepository = {};
    const smartPlacementKnowledgeElementRepository = {};
    const challengeRepository = {};
    const targetProfileRepository = {};

    const userId = 'user_ID';
    const skill = new Skill({ name: '@unite2' });
    const challenge = Challenge.fromAttributes({ status: 'validé', id: 'challenge_ID', skills: [skill] });
    const assessment = domainBuilder.buildAssessment({ id: 'assessment_ID', userId });
    const kE_1 = domainBuilder.buildSmartPlacementKnowledgeElement({ id: 'kE_ID_1', skillId: '1' });
    const kE_2 = domainBuilder.buildSmartPlacementKnowledgeElement({ id: 'kE_ID_2', skillId: '2' });
    const kE_3 = domainBuilder.buildSmartPlacementKnowledgeElement({ id: 'kE_ID_3', skillId: '2' });
    const campaign = domainBuilder.buildCampaignParticipation();
    assessment.campaignParticipation = domainBuilder.buildCampaignParticipation({ assessmentId: assessment.id, campaign });

    beforeEach(() => {
      answerRepository.findByAssessment = sinon.stub().resolves([]);
      smartPlacementKnowledgeElementRepository.findByUserId = sinon.stub().resolves([kE_1, kE_2, kE_3]);
      challengeRepository.findBySkills = sinon.stub().resolves([challenge]);
      smartRandom.getNextChallenge = sinon.stub().returns(challenge);

      targetProfileRepository.get = sinon.stub()
        .resolves(domainBuilder.buildTargetProfile({ skills: domainBuilder.buildSkillCollection() }));
    });

    it('should find answers, knowledgeElements, challenges and targetProfile of the smart placement assessment', () => {
      // when
      const promise = getNextChallengeForSmartPlacement({
        assessment,
        answerRepository,
        challengeRepository,
        smartPlacementKnowledgeElementRepository,
        targetProfileRepository,
      });

      // then
      return promise.then(() => {
        expect(answerRepository.findByAssessment).to.have.been.calledWith('assessment_ID');
        expect(smartPlacementKnowledgeElementRepository.findByUserId).to.have.been.calledWith(userId);
        expect(challengeRepository.findBySkills).to.have.been.called;
        expect(targetProfileRepository.get).to.have.been.called;
      });
    });

    it('should return the next Challenge', () => {
      // when
      const promise = getNextChallengeForSmartPlacement({
        assessment,
        answerRepository,
        challengeRepository,
        smartPlacementKnowledgeElementRepository,
        targetProfileRepository,
      });

      // then
      return promise.then((challenge) => {
        expect(challenge).to.equal('challenge_ID');
      });
    });
  });
});
