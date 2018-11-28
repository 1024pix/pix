const { expect, sinon, factory } = require('../../../test-helper');

const getNextChallengeForSmartRandom = require('../../../../lib/domain/usecases/get-next-challenge-for-smart-placement');
const Challenge = require('../../../../lib/domain/models/Challenge');
const Skill = require('../../../../lib/domain/models/Skill');

describe('Unit | Domain | Use Cases | get-next-challenge-for-smart-placement', () => {

  describe('#getNextChallengeForSmartRandom', () => {

    const answerRepository = { findByAssessment: () => undefined };
    const challengeRepository = { findBySkills: () => undefined };
    const targetProfileRepository = { get: () => undefined };

    const skill = new Skill({ name: '@unite2' });
    const challenge = Challenge.fromAttributes({ status: 'validé', id: 'challenge_ID', skills: [skill] });
    const assessment = factory.buildAssessment({ id: 'assessment_ID' });
    const campaign = factory.buildCampaignParticipation();
    assessment.campaignParticipation = factory.buildCampaignParticipation({ assessmentId: assessment.id, campaign });

    beforeEach(() => {
      answerRepository.findByAssessment = sinon.stub().resolves([]);
      challengeRepository.findBySkills = sinon.stub().resolves([challenge]);
      targetProfileRepository.get = sinon.stub()
        .resolves(factory.buildTargetProfile({ skills: factory.buildSkillCollection() }));
    });

    it('should find answers of the smart placement assessment', () => {
      // when
      const promise = getNextChallengeForSmartRandom({
        assessment,
        answerRepository,
        challengeRepository,
        targetProfileRepository,
      });

      // then
      return promise.then(() => {
        expect(answerRepository.findByAssessment).to.have.been.calledWith('assessment_ID');
      });
    });

    it('should return the next Challenge', () => {
      // when
      const promise = getNextChallengeForSmartRandom({
        assessment,
        answerRepository,
        challengeRepository,
        targetProfileRepository,
      });

      // then
      return promise.then((challenge) => {
        expect(challenge).to.equal('challenge_ID');
      });
    });
  });
});
