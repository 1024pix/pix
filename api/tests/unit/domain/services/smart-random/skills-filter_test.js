const { expect, domainBuilder } = require('../../../../test-helper');
const TargetProfile = require('../../../../../lib/domain/models/TargetProfile');
const skillsFilter = require('../../../../../lib/domain/services/smart-random/skills-filter');
const Tube = require('../../../../../lib/domain/models/Tube');

const KNOWLEDGE_ELEMENT_STATUS = {
  VALIDATED: 'validated',
  INVALIDATED: 'invalidated'
};

describe('Unit | Domain | services | smart-random | skillsFilter', () => {

  describe('#getFilteredChallengesForFirstSkill', () => {
    it('should return a first skill possible', () => {
      // given
      const skill1 = domainBuilder.buildSkill({ name: '@web3' });
      const targetProfile = new TargetProfile({ skills: [skill1] });
      const challengeAssessingSkill1 = domainBuilder.buildChallenge({ skills: [skill1] });
      const knowledgeElements = [];
      const challenges = [challengeAssessingSkill1];
      const tubes =  [
        new Tube({ skills: [skill1] })
      ];

      // when
      const result = skillsFilter.getFilteredChallengesForFirstSkill({
        challenges,
        knowledgeElements,
        courseTubes: tubes,
        targetSkills: targetProfile.skills
      });

      // then
      expect(result).to.deep.equal([skill1]);
    });

    it('should return empty array if challenge of only possible skill are not valid', () => {
      // given
      const skill1 = domainBuilder.buildSkill({ name: '@web3' });
      const targetProfile = new TargetProfile({ skills: [skill1] });
      const challengeAssessingSkill1 = domainBuilder.buildChallenge({ skills: [skill1], status: 'PAS VALIDE' });
      const knowledgeElements = [];
      const challenges = [challengeAssessingSkill1];
      const tubes =  [
        new Tube({ skills: [skill1] })
      ];
      // when
      const result = skillsFilter.getFilteredChallengesForFirstSkill({
        challenges,
        knowledgeElements,
        courseTubes: tubes,
        targetSkills: targetProfile.skills
      });

      // then
      expect(result).to.deep.equal([]);
    });

    it('should return a skill even if the only tube has a skill with difficulty > 3', () => {
      // given
      const skill1 = domainBuilder.buildSkill({ name: '@web4' });
      const targetProfile = new TargetProfile({ skills: [skill1] });
      const challengeAssessingSkill1 = domainBuilder.buildChallenge({ skills: [skill1] });
      const knowledgeElements = [];
      const challenges = [challengeAssessingSkill1];
      const tubes =  [
        new Tube({ skills: [skill1] })
      ];

      // when
      const result = skillsFilter.getFilteredChallengesForFirstSkill({
        challenges,
        knowledgeElements,
        courseTubes: tubes,
        targetSkills: targetProfile.skills
      });

      // then
      expect(result).to.deep.equal([skill1]);
    });

    it('should return a skill valid from a tubes with max level at 3 (HAPPY PATH)', () => {
      // given
      const skillTube1Level2 = domainBuilder.buildSkill({ name: '@web2' });
      const skillTube1Level4 = domainBuilder.buildSkill({ name: '@web4' });
      const skillTube2Level2 = domainBuilder.buildSkill({ name: '@url2' });
      const skillTube2Level1 = domainBuilder.buildSkill({ name: '@url1' });

      const targetProfile = new TargetProfile({ skills: [skillTube1Level2,skillTube1Level4,skillTube2Level2,skillTube2Level1] });
      const challengeGoodLevelTubeTooHigh = domainBuilder.buildChallenge({ skills: [skillTube1Level2] });
      const challengeLevelHighTubeTooHigh = domainBuilder.buildChallenge({ skills: [skillTube1Level4] });
      const challengeGoodTubeAndValid = domainBuilder.buildChallenge({ skills: [skillTube2Level1] });
      const challengeGoodTubeGoodLevelInvalid = domainBuilder.buildChallenge({ skills: [skillTube2Level2], status: 'NON VALIDE' });
      const knowledgeElements = [];
      const challenges = [challengeGoodLevelTubeTooHigh, challengeGoodTubeAndValid, challengeLevelHighTubeTooHigh, challengeGoodTubeGoodLevelInvalid];
      const tubes =  [
        new Tube({ skills: [skillTube1Level4, skillTube1Level2] }),
        new Tube({ skills: [skillTube2Level2, skillTube2Level1] })
      ];

      // when
      const result = skillsFilter.getFilteredChallengesForFirstSkill({
        challenges,
        knowledgeElements,
        courseTubes: tubes,
        targetSkills: targetProfile.skills
      });

      // then
      expect(result).to.deep.equal([skillTube2Level1]);
    });
  });

  describe('#getFilteredChallengesForAnySkill', function() {
    describe('Verify rules 1 : published and valid challenges', () => {

      it('should not ask a question that targets a skill already assessed', function() {
        // given
        const [skill1, skill2, skillNotAssessedLevel3] = domainBuilder.buildSkillCollection();

        const targetProfile = new TargetProfile({ skills: [skill1, skill2, skillNotAssessedLevel3] });

        const challengeAssessingSkill1 = domainBuilder.buildChallenge({ skills: [skill1] });
        const challengeAssessingSkill2 = domainBuilder.buildChallenge({ skills: [skill2] });
        const anotherChallengeAssessingSkill2 = domainBuilder.buildChallenge({ skills: [skill2] });
        const challengeAssessingSkill3 = domainBuilder.buildChallenge({ skills: [skillNotAssessedLevel3] });
        const lastChallenge = domainBuilder.buildChallenge();

        const knowledgeElements = [
          domainBuilder.buildKnowledgeElement({ skillId: skill1.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED, source: 'direct' }),
          domainBuilder.buildKnowledgeElement({ skillId: skill2.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED, source: 'direct' }),
        ];

        const challenges = [
          challengeAssessingSkill1,
          challengeAssessingSkill2,
          anotherChallengeAssessingSkill2,
          challengeAssessingSkill3,
        ];

        // when
        const result = skillsFilter.getFilteredChallengesForAnySkill({
          challenges,
          knowledgeElements,
          predictedLevel: 3,
          lastChallenge,
          targetSkills: targetProfile.skills
        });

        // then
        expect(result).to.deep.equal([skillNotAssessedLevel3]);
      });

    });
    describe('Verify rules : Not skill with timed challenge after timed challenge', () => {
      it('should return a skill without timed challenge if last one was timed', () => {
        // given
        const [skill1, skillWithNotTimedChallenge, skill3] = domainBuilder.buildSkillCollection();

        const targetProfile = domainBuilder.buildTargetProfile({ skills: [skill1, skillWithNotTimedChallenge, skill3] });

        const lastChallenge = domainBuilder.buildChallenge({ skills: [skill1], timer: 34 });
        const challengeNotTimed = domainBuilder.buildChallenge({ skills: [skillWithNotTimedChallenge], timer: null });
        const challengeTimed = domainBuilder.buildChallenge({ skills: [skill3], timer: 23 });

        const knowledgeElements = [
          domainBuilder.buildKnowledgeElement({ skillId: skill1.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED, source: 'direct' }),
        ];
        const challenges = [
          lastChallenge,
          challengeNotTimed,
          challengeTimed
        ];

        // when
        const result = skillsFilter.getFilteredChallengesForAnySkill({
          challenges,
          knowledgeElements,
          predictedLevel: 2,
          targetSkills: targetProfile.skills,
          lastChallenge
        });

        // then
        expect(result).to.deep.equal([skillWithNotTimedChallenge]);
      });

      it('should return a skill with timed challenges if last one was timed but we dont have not timed challenge', () => {
        // given
        const [skill1, skill2, skill3] = domainBuilder.buildSkill({ l});

        const targetProfile = domainBuilder.buildTargetProfile({ skills: [skill1, skill2, skill3] });

        const lastChallenge = domainBuilder.buildChallenge({ skills: [skill1], timer: 34 });
        const challengeNotTimed = domainBuilder.buildChallenge({ skills: [skill2], timer: 45 });
        const challengeTimed = domainBuilder.buildChallenge({ skills: [skill2], timer: 23 });

        const knowledgeElements = [
          domainBuilder.buildKnowledgeElement({ skillId: skill1.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED, source: 'direct' }),
        ];
        const challenges = [
          lastChallenge,
          challengeNotTimed,
          challengeTimed
        ];

        // when
        const result = skillsFilter.getFilteredChallengesForAnySkill({
          challenges,
          knowledgeElements,
          predictedLevel: 2,
          targetSkills: targetProfile.skills,
          lastChallenge
        });

        // then
        expect(result).to.have.members([skill2]);
      });
    });

    describe('Verify rules : Remove skill too difficult', () => {
      it('should return skills with level maximum of user level + 2', () => {
        // given
        const [skill1, skill2, skill3, skill4, skill5, skill6] = domainBuilder.buildSkillCollection({ name:'web', minLevel: 1, maxLevel: 6 });
        const targetProfile = domainBuilder.buildTargetProfile({ skills: [skill1, skill2, skill3, skill4, skill5, skill6] });

        const lastChallenge = domainBuilder.buildChallenge({ skills: [skill2] });
        const challengeLevel1 = domainBuilder.buildChallenge({ skills: [skill1] });
        const challengeLevel3 = domainBuilder.buildChallenge({ skills: [skill3] });
        const challengeLevel4 = domainBuilder.buildChallenge({ skills: [skill4] });
        const challengeLevel5 = domainBuilder.buildChallenge({ skills: [skill5] });
        const challengeLevel6 = domainBuilder.buildChallenge({ skills: [skill6] });

        const knowledgeElements = [
          domainBuilder.buildKnowledgeElement({ skillId: skill1.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED, source: 'indirect' }),
          domainBuilder.buildKnowledgeElement({ skillId: skill2.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED, source: 'direct' }),
        ];
        const challenges = [
          lastChallenge,
          challengeLevel1,
          challengeLevel3,
          challengeLevel4,
          challengeLevel5,
          challengeLevel6
        ];
        const tubes =  [
          new Tube({ skills: [skill1, skill2, skill3, skill4, skill5, skill6] })
        ];

        // when
        const result = skillsFilter.getFilteredChallengesForAnySkill({
          challenges,
          knowledgeElements,
          predictedLevel: 2,
          targetSkills: targetProfile.skills,
          courseTubes: tubes,
          lastChallenge
        });

        // then
        expect(result).to.deep.equal([skill3, skill4]);
      });

    });

    describe('Verify rules : Focus on easy tubes first', () => {
      it('should return skills from tubes of max level 3', () => {
        // given
        const [skill3, skill4, skill5, skill6] = domainBuilder.buildSkillCollection({ name:'web', minLevel: 3, maxLevel: 6 });
        const [easyTubeSkill1, easyTubeSkill2, easyTubeSkill3] = domainBuilder.buildSkillCollection({ name:'url', minLevel: 1, maxLevel: 3 });
        const targetProfile = domainBuilder.buildTargetProfile({ skills: [ skill3, skill4, skill5, skill6, easyTubeSkill1, easyTubeSkill2, easyTubeSkill3] });

        const lastChallenge = domainBuilder.buildChallenge({ skills: [easyTubeSkill1] });
        const challengeLevel3 = domainBuilder.buildChallenge({ skills: [skill3] });
        const challengeLevel4 = domainBuilder.buildChallenge({ skills: [skill4] });
        const challengeLevel5 = domainBuilder.buildChallenge({ skills: [skill5] });
        const challengeLevel6 = domainBuilder.buildChallenge({ skills: [skill6] });
        const challengeLevel2 = domainBuilder.buildChallenge({ skills: [easyTubeSkill2] });
        const challengeLevel3EasyTube = domainBuilder.buildChallenge({ skills: [easyTubeSkill3] });

        const knowledgeElements = [
          domainBuilder.buildKnowledgeElement({ skillId: easyTubeSkill1.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED, source: 'direct' }),
        ];
        const challenges = [
          lastChallenge,
          challengeLevel3,
          challengeLevel4,
          challengeLevel5,
          challengeLevel6,
          challengeLevel2,
          challengeLevel3EasyTube,
        ];
        const tubes =  [
          new Tube({ skills: [skill3, skill4, skill5, skill6] }),
          new Tube({ skills: [easyTubeSkill1, easyTubeSkill2, easyTubeSkill3] })
        ];

        // when
        const result = skillsFilter.getFilteredChallengesForAnySkill({
          challenges,
          knowledgeElements,
          predictedLevel: 5,
          targetSkills: targetProfile.skills,
          courseTubes: tubes,
          lastChallenge
        });

        // then
        expect(result).to.deep.equal([easyTubeSkill2, easyTubeSkill3]);

      });

      it('should return skills from all tubes if there is not easy tubes', () => {
        // given
        const [skill3, skill4, skill5, skill6] = domainBuilder.buildSkillCollection({ name:'web', minLevel: 3, maxLevel: 6 });
        const targetProfile = domainBuilder.buildTargetProfile({ skills: [ skill3, skill4, skill5, skill6] });

        const lastChallenge = domainBuilder.buildChallenge({ skills: [skill3] });
        const challengeLevel4 = domainBuilder.buildChallenge({ skills: [skill4] });
        const challengeLevel5 = domainBuilder.buildChallenge({ skills: [skill5] });
        const challengeLevel6 = domainBuilder.buildChallenge({ skills: [skill6] });

        const knowledgeElements = [
          domainBuilder.buildKnowledgeElement({ skillId: skill3.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED, source: 'direct' }),
        ];
        const challenges = [
          lastChallenge,
          challengeLevel4,
          challengeLevel5,
          challengeLevel6
        ];
        const tubes =  [
          new Tube({ skills: [skill3, skill4, skill5, skill6] })
        ];

        // when
        const result = skillsFilter.getFilteredChallengesForAnySkill({
          challenges,
          knowledgeElements,
          predictedLevel: 5,
          targetSkills: targetProfile.skills,
          courseTubes: tubes,
          lastChallenge
        });

        // then
        expect(result).to.deep.equal([skill4, skill5, skill6]);
      });
    });

    context('when the selected skills cover more skills than the defined target profile', () => {
      it('should ignore the already answered skills, even if they have non evaluated skills', function() {
        // given
        const [skill1, skill2] = domainBuilder.buildSkillCollection();

        const targetProfile = domainBuilder.buildTargetProfile({ skills: [skill1] });

        const lastChallenge = domainBuilder.buildChallenge();
        const challengeAssessingSkill1 = domainBuilder.buildChallenge({ skills: [skill1, skill2] });

        const knowledgeElements = [
          domainBuilder.buildKnowledgeElement({ skillId: skill1.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED, source: 'direct' }),
        ];
        const challenges = [
          challengeAssessingSkill1,
        ];

        // when
        const result = skillsFilter.getFilteredChallengesForAnySkill({
          challenges,
          knowledgeElements,
          predictedLevel: 2,
          lastChallenge,
          targetSkills: targetProfile.skills
        });

        // then
        expect(result).to.deep.equal([]);
      });
    });

  });
});
