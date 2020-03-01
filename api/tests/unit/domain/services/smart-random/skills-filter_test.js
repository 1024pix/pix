const { expect, domainBuilder } = require('../../../../test-helper');
const TargetProfile = require('../../../../../lib/domain/models/TargetProfile');
const skillsFilter = require('../../../../../lib/domain/services/smart-random/skills-filter');
const Tube = require('../../../../../lib/domain/models/Tube');

const KNOWLEDGE_ELEMENT_STATUS = {
  VALIDATED: 'validated',
  INVALIDATED: 'invalidated'
};

describe('Unit | Domain | services | smart-random | skillsFilter', () => {

  describe('#getFilteredSkillsForFirstChallenge', () => {
    it('should return a first skill possible', () => {
      // given
      const skill1 = domainBuilder.buildSkill({ name: '@web3' });
      const targetProfile = new TargetProfile({ skills: [skill1] });
      const knowledgeElements = [];
      const tubes =  [
        new Tube({ skills: [skill1] })
      ];

      // when
      const result = skillsFilter.getFilteredSkillsForFirstChallenge({
        knowledgeElements,
        tubes: tubes,
        targetSkills: targetProfile.skills
      });

      // then
      expect(result).to.deep.equal([skill1]);
    });

    it('should return a skill even if the only tube has a skill with difficulty > 3', () => {
      // given
      const skill1 = domainBuilder.buildSkill({ name: '@web4' });
      const targetProfile = new TargetProfile({ skills: [skill1] });
      const knowledgeElements = [];
      const tubes =  [
        new Tube({ skills: [skill1] })
      ];

      // when
      const result = skillsFilter.getFilteredSkillsForFirstChallenge({
        knowledgeElements,
        tubes: tubes,
        targetSkills: targetProfile.skills
      });

      // then
      expect(result).to.deep.equal([skill1]);
    });

    it('should return a skill valid from a tubes with max level at 3 (HAPPY PATH)', () => {
      // given
      const skillTube1Level2 = domainBuilder.buildSkill({ name: '@web2' });
      const skillTube1Level4 = domainBuilder.buildSkill({ name: '@web4' });
      const skillFromEasyTubeLevel2 = domainBuilder.buildSkill({ name: '@url2' });
      const skillFromEasyTubeLevel1 = domainBuilder.buildSkill({ name: '@url1' });

      const targetProfile = new TargetProfile({ skills: [skillTube1Level2,skillTube1Level4,skillFromEasyTubeLevel2,skillFromEasyTubeLevel1] });
      const knowledgeElements = [];
      const tubes =  [
        new Tube({ skills: [skillTube1Level4, skillTube1Level2] }),
        new Tube({ skills: [skillFromEasyTubeLevel2, skillFromEasyTubeLevel1] })
      ];

      // when
      const result = skillsFilter.getFilteredSkillsForFirstChallenge({
        knowledgeElements,
        tubes: tubes,
        targetSkills: targetProfile.skills
      });

      // then
      expect(result).to.deep.equal([skillFromEasyTubeLevel2]);
    });

    it('should return non timed skills', () => {
      // given
      const skillTube1Level2Timed = domainBuilder.buildSkill({ name: '@web2' });
      skillTube1Level2Timed.timed = true;
      const skillTube2Level2 = domainBuilder.buildSkill({ name: '@url2' });
      const targetProfile = new TargetProfile({ skills: [skillTube1Level2Timed,skillTube2Level2] });
      const knowledgeElements = [];
      const tubes =  [
        new Tube({ skills: [skillTube1Level2Timed] }),
        new Tube({ skills: [skillTube2Level2] })
      ];

      // when
      const result = skillsFilter.getFilteredSkillsForFirstChallenge({
        knowledgeElements,
        tubes: tubes,
        targetSkills: targetProfile.skills
      });

      // then
      expect(result).to.deep.equal([skillTube2Level2]);
    });

    it('should return timed skills if there is only timed skills', () => {
      // given
      const skillTube1Level2Timed = domainBuilder.buildSkill({ name: '@web2' });
      skillTube1Level2Timed.timed = true;
      const skillTube2Level2Timed = domainBuilder.buildSkill({ name: '@url2' });
      skillTube2Level2Timed.timed = true;
      const targetProfile = new TargetProfile({ skills: [skillTube1Level2Timed,skillTube2Level2Timed] });
      const knowledgeElements = [];
      const tubes =  [
        new Tube({ skills: [skillTube1Level2Timed] }),
        new Tube({ skills: [skillTube2Level2Timed] })
      ];

      // when
      const result = skillsFilter.getFilteredSkillsForFirstChallenge({
        knowledgeElements,
        tubes: tubes,
        targetSkills: targetProfile.skills
      });

      // then
      expect(result).to.deep.equal([skillTube1Level2Timed, skillTube2Level2Timed]);
    });

  });

  describe('#getFilteredSkillsForNextChallenge', function() {
    describe('Verify rules : Skills not already tested', () => {

      it('should not ask a question that targets a skill already assessed', function() {
        // given
        const [skill1, skill2, skillNotAssessedLevel3] = domainBuilder.buildSkillCollection();

        const targetProfile = new TargetProfile({ skills: [skill1, skill2, skillNotAssessedLevel3] });

        const knowledgeElements = [
          domainBuilder.buildKnowledgeElement({ skillId: skill1.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED, source: 'direct' }),
          domainBuilder.buildKnowledgeElement({ skillId: skill2.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED, source: 'direct' }),
        ];

        // when
        const result = skillsFilter.getFilteredSkillsForNextChallenge({
          knowledgeElements,
          predictedLevel: 3,
          isLastChallengeTimed: false,
          targetSkills: targetProfile.skills
        });

        // then
        expect(result).to.deep.equal([skillNotAssessedLevel3]);
      });

    });
    describe('Verify rules : Not skill with timed challenge after timed challenge', () => {
      it('should return a skill without timed challenge if last one was timed', () => {
        // given
        const skill1 = domainBuilder.buildSkill({ name: '@test2' });
        const skillWithoutTimedChallenge = domainBuilder.buildSkill({ name: '@url2' });
        skillWithoutTimedChallenge.timed = false;
        const skillWithTimedChallenge = domainBuilder.buildSkill({ name: '@web2' });
        skillWithTimedChallenge.timed = true;

        const targetProfile = domainBuilder.buildTargetProfile({ skills: [skillWithoutTimedChallenge, skillWithTimedChallenge] });
        const knowledgeElements = [
          domainBuilder.buildKnowledgeElement({ skillId: skill1.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED, source: 'direct' }),
        ];
        const isLastChallengeTimed = true;

        // when
        const result = skillsFilter.getFilteredSkillsForNextChallenge({
          isLastChallengeTimed,
          knowledgeElements,
          predictedLevel: 2,
          targetSkills: targetProfile.skills,
        });

        // then
        expect(result).to.deep.equal([skillWithoutTimedChallenge]);
      });

      it('should return a skill with timed challenges if last one was timed but we dont have not timed challenge', () => {
        // given
        const [skill1, skill2, skill3] = domainBuilder.buildSkillCollection();
        skill1.timed = true;
        skill2.timed = true;
        skill3.timed = true;
        const targetProfile = domainBuilder.buildTargetProfile({ skills: [skill1, skill2, skill3] });

        const knowledgeElements = [
          domainBuilder.buildKnowledgeElement({ skillId: skill1.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED, source: 'direct' }),
        ];
        const isLastChallengeTimed = true;

        // when
        const result = skillsFilter.getFilteredSkillsForNextChallenge({
          knowledgeElements,
          predictedLevel: 2,
          targetSkills: targetProfile.skills,
          isLastChallengeTimed,
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
        const knowledgeElements = [
          domainBuilder.buildKnowledgeElement({ skillId: skill1.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED, source: 'indirect' }),
          domainBuilder.buildKnowledgeElement({ skillId: skill2.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED, source: 'direct' }),
        ];
        const tubes =  [
          new Tube({ skills: [skill1, skill2, skill3, skill4, skill5, skill6] })
        ];

        // when
        const result = skillsFilter.getFilteredSkillsForNextChallenge({
          knowledgeElements,
          predictedLevel: 2,
          targetSkills: targetProfile.skills,
          tubes: tubes,
          isLastChallengeTimed: false,
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

        const knowledgeElements = [
          domainBuilder.buildKnowledgeElement({ skillId: easyTubeSkill1.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED, source: 'direct' }),
        ];
        const tubes =  [
          new Tube({ skills: [skill3, skill4, skill5, skill6] }),
          new Tube({ skills: [easyTubeSkill1, easyTubeSkill2, easyTubeSkill3] })
        ];

        // when
        const result = skillsFilter.getFilteredSkillsForNextChallenge({
          knowledgeElements,
          predictedLevel: 5,
          targetSkills: targetProfile.skills,
          tubes: tubes,
          isLastChallengeTimed: false,
        });

        // then
        expect(result).to.deep.equal([easyTubeSkill2, easyTubeSkill3]);

      });

      it('should return skills from all tubes if there is not easy tubes', () => {
        // given
        const [skill3, skill4, skill5, skill6] = domainBuilder.buildSkillCollection({ name:'web', minLevel: 3, maxLevel: 6 });
        const targetProfile = domainBuilder.buildTargetProfile({ skills: [ skill3, skill4, skill5, skill6] });

        const knowledgeElements = [
          domainBuilder.buildKnowledgeElement({ skillId: skill3.id, status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED, source: 'direct' }),
        ];
        const tubes =  [
          new Tube({ skills: [skill3, skill4, skill5, skill6] })
        ];

        // when
        const result = skillsFilter.getFilteredSkillsForNextChallenge({
          knowledgeElements,
          predictedLevel: 5,
          targetSkills: targetProfile.skills,
          tubes: tubes,
          isLastChallengeTimed: false,
        });

        // then
        expect(result).to.deep.equal([skill4, skill5, skill6]);
      });
    });
  });
});
