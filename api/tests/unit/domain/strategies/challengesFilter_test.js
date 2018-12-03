const { expect, domainBuilder } = require('../../../test-helper');
const TargetProfile = require('../../../../lib/domain/models/TargetProfile');
const filterChallenge = require('../../../../lib/domain/strategies/challengesFilter');

const KNOWLEDGE_ELEMENT_STATUS = {
  VALIDATED: 'validated',
  INVALIDATED: 'invalidated'
};

describe('Unit | Domain | Models | filterChallenge', () => {

  describe('#filteredChallengeForFirstChallenge', () => {
    it('should return a first challenge possible', () => {
      // given
      const skill1 = domainBuilder.buildSkill({ name: '@web3' });
      const targetProfile = new TargetProfile({ skills: [skill1] });
      const challengeAssessingSkill1 = domainBuilder.buildChallenge({ skills: [skill1] });
      const knowledgeElements = [];
      const challenges = [challengeAssessingSkill1];

      // when
      const result = filterChallenge.filteredChallengeForFirstChallenge({
        challenges: challenges,
        knowledgeElements,
        targetProfile: targetProfile
      });

      // then
      expect(result).to.deep.equal([challengeAssessingSkill1]);
    });

    it('should return empty array if challenge are not valid', () => {
      // given
      const skill1 = domainBuilder.buildSkill({ name: '@web3' });
      const targetProfile = new TargetProfile({ skills: [skill1] });
      const challengeAssessingSkill1 = domainBuilder.buildChallenge({ skills: [skill1], status: 'PAS VALIDE' });
      const knowledgeElements = [];
      const challenges = [challengeAssessingSkill1];

      // when
      const result = filterChallenge.filteredChallengeForFirstChallenge({
        challenges: challenges,
        knowledgeElements,
        targetProfile: targetProfile
      });

      // then
      expect(result).to.deep.equal([]);
    });

    it('should return a challenge even if the only tube has a skill with difficulty > 3', () => {
      // given
      const skill1 = domainBuilder.buildSkill({ name: '@web4' });
      const targetProfile = new TargetProfile({ skills: [skill1] });
      const challengeAssessingSkill1 = domainBuilder.buildChallenge({ skills: [skill1] });
      const knowledgeElements = [];
      const challenges = [challengeAssessingSkill1];

      // when
      const result = filterChallenge.filteredChallengeForFirstChallenge({
        challenges: challenges,
        knowledgeElements,
        targetProfile: targetProfile
      });

      // then
      expect(result).to.deep.equal([challengeAssessingSkill1]);
    });
  });

  describe('#filteredChallenges', function() {
    describe('Verify rules 1 : published and valid challenges', () => {
      it('should not ask a question that targets a skill already assessed', function() {
        // given
        const [skill1] = domainBuilder.buildSkillCollection();

        const targetProfile = new TargetProfile({ skills: [skill1] });

        const challengeAssessingSkill1 = domainBuilder.buildChallenge({ skills: [skill1], status: 'invalidated' });

        const knowledgeElements = [];

        const challenges = [
          challengeAssessingSkill1,
        ];

        // when
        const result = filterChallenge.filteredChallenges({
          challenges: challenges,
          knowledgeElements,
          predictedLevel: 3,
          targetProfile: targetProfile
        });

        // then
        expect(result).to.deep.equal([]);
      });
    });

    it('should not ask a question that targets a skill already assessed', function() {
      // given
      const [skill1, skill2, skill3] = domainBuilder.buildSkillCollection();

      const targetProfile = new TargetProfile({ skills: [skill1, skill2, skill3] });

      const challengeAssessingSkill1 = domainBuilder.buildChallenge({ skills: [skill1] });
      const challengeAssessingSkill2 = domainBuilder.buildChallenge({ skills: [skill2] });
      const anotherChallengeAssessingSkill2 = domainBuilder.buildChallenge({ skills: [skill2] });
      const challengeAssessingSkill3 = domainBuilder.buildChallenge({ skills: [skill3] });

      const knowledgeElements = [
        domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: skill1.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED, source: 'direct' }),
        domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: skill2.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED, source: 'direct' }),
      ];

      const challenges = [
        challengeAssessingSkill1,
        challengeAssessingSkill2,
        anotherChallengeAssessingSkill2,
        challengeAssessingSkill3,
      ];

      // when
      const result = filterChallenge.filteredChallenges({
        challenges: challenges,
        knowledgeElements,
        predictedLevel: 3,
        targetProfile: targetProfile
      });

      // then
      expect(result).to.deep.equal([challengeAssessingSkill3]);
    });

    context('when the selected challenges cover more skills than the defined target profile', () => {
      it('should ignore the already answered challenges, even if they have non evaluated skills', function() {
        // given
        const [skill1, skill2] = domainBuilder.buildSkillCollection();

        const targetProfile = domainBuilder.buildTargetProfile({ skills: [skill1] });

        const challengeAssessingSkill1 = domainBuilder.buildChallenge({ skills: [skill1, skill2] });

        const knowledgeElements = [
          domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: skill1.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED, source: 'direct' }),
        ];
        const challenges = [
          challengeAssessingSkill1,
        ];

        // when
        const result = filterChallenge.filteredChallenges({
          challenges: challenges,
          knowledgeElements,
          predictedLevel: 2,
          targetProfile: targetProfile
        });

        // then
        expect(result).to.deep.equal([]);
      });
    });

    describe('Verify rules : Not timed challenge after timed challenge', () => {
      it('should return the not timed challenge if last one was timed', () => {
        // given
        const [skill1, skill2] = domainBuilder.buildSkillCollection();

        const targetProfile = domainBuilder.buildTargetProfile({ skills: [skill1, skill2] });

        const lastChallenge = domainBuilder.buildChallenge({ skills: [skill1], timer: 34 });
        const challengeNotTimed = domainBuilder.buildChallenge({ skills: [skill2], timer: null });
        const challengeTimed = domainBuilder.buildChallenge({ skills: [skill2], timer: 23 });

        const knowledgeElements = [
          domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: skill1.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED, source: 'direct' }),
        ];
        const challenges = [
          lastChallenge,
          challengeNotTimed,
          challengeTimed
        ];

        // when
        const result = filterChallenge.filteredChallenges({
          challenges: challenges,
          knowledgeElements,
          predictedLevel: 2,
          targetProfile: targetProfile,
          lastChallenge
        });

        // then
        expect(result).to.deep.equal([challengeNotTimed]);
      });

      it('should return timed challenges if last one was timed but we dont have not timed challenge', () => {
        // given
        const [skill1, skill2] = domainBuilder.buildSkillCollection();

        const targetProfile = domainBuilder.buildTargetProfile({ skills: [skill1, skill2] });

        const lastChallenge = domainBuilder.buildChallenge({ skills: [skill1], timer: 34 });
        const challengeNotTimed = domainBuilder.buildChallenge({ skills: [skill2], timer: 45 });
        const challengeTimed = domainBuilder.buildChallenge({ skills: [skill2], timer: 23 });

        const knowledgeElements = [
          domainBuilder.buildSmartPlacementKnowledgeElement({ skillId: skill1.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED, source: 'direct' }),
        ];
        const challenges = [
          lastChallenge,
          challengeNotTimed,
          challengeTimed
        ];

        // when
        const result = filterChallenge.filteredChallenges({
          challenges: challenges,
          knowledgeElements,
          predictedLevel: 2,
          targetProfile: targetProfile,
          lastChallenge
        });

        // then
        expect(result).to.have.members([challengeNotTimed, challengeTimed]);
      });
    });

  });
});
