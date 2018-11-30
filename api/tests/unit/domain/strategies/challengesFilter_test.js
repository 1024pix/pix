const { expect, domainBuilder } = require('../../../test-helper');
const TargetProfile = require('../../../../lib/domain/models/TargetProfile');
const filterChallenge = require('../../../../lib/domain/strategies/challengesFilter');

const KNOWLEDGE_ELEMENT_STATUS = {
  VALIDATED: 'validated',
  INVALIDATED: 'invalidated'
};

describe('Unit | Domain | Models | filterChallenge', () => {

  describe('filteredChallenges()', function() {
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

  });
});
