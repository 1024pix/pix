const { expect, sinon, domainBuilder } = require('../../../test-helper');

const getNextChallengeForSmartRandom = require('../../../../lib/domain/usecases/get-next-challenge-for-smart-placement');
const Challenge = require('../../../../lib/domain/models/Challenge');
const Skill = require('../../../../lib/domain/models/Skill');
const SmartRandom = require('../../../../lib/domain/services/smart-random/SmartRandom');

describe('Unit | Domain | Use Cases | get-next-challenge-for-smart-placement', () => {

  describe('#getNextChallengeForSmartRandom', () => {

    const answerRepository = { findByAssessment: () => undefined };
    const smartPlacementKnowledgeElementRepository = { findByAssessmentId: () => undefined };
    const challengeRepository = { findBySkills: () => undefined };
    const targetProfileRepository = { get: () => undefined };

    const skill = new Skill({ name: '@unite2' });
    const challenge = Challenge.fromAttributes({ status: 'validé', id: 'challenge_ID', skills: [skill] });
    const assessment = domainBuilder.buildAssessment({ id: 'assessment_ID' });
    const campaign = domainBuilder.buildCampaignParticipation();
    assessment.campaignParticipation = domainBuilder.buildCampaignParticipation({ assessmentId: assessment.id, campaign });

    beforeEach(() => {
      answerRepository.findByAssessment = sinon.stub().resolves([]);
      smartPlacementKnowledgeElementRepository.findByAssessmentId = sinon.stub().resolves([]);
      challengeRepository.findBySkills = sinon.stub().resolves([challenge]);
      SmartRandom.prototype.getNextChallenge = sinon.stub().returns(challenge);

      targetProfileRepository.get = sinon.stub()
        .resolves(domainBuilder.buildTargetProfile({ skills: domainBuilder.buildSkillCollection() }));
    });

    it('should find answers, knowledgeElements, challenges and targetProfile of the smart placement assessment', () => {
      // when
      const promise = getNextChallengeForSmartRandom({
        assessment,
        answerRepository,
        challengeRepository,
        smartPlacementKnowledgeElementRepository,
        targetProfileRepository,
      });

      // then
      return promise.then(() => {
        expect(answerRepository.findByAssessment).to.have.been.calledWith('assessment_ID');
        expect(smartPlacementKnowledgeElementRepository.findByAssessmentId).to.have.been.calledWith('assessment_ID');
        expect(challengeRepository.findBySkills).to.have.been.called;
        expect(targetProfileRepository.get).to.have.been.called;
      });
    });

    it('should return the next Challenge', () => {
      // when
      const promise = getNextChallengeForSmartRandom({
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
