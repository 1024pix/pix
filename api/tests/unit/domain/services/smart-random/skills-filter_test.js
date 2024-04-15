import { Tube } from '../../../../../lib/domain/models/Tube.js';
import {
  focusOnDefaultLevel,
  getFilteredSkillsForFirstChallenge,
  getFilteredSkillsForNextChallenge,
} from '../../../../../lib/domain/services/algorithm-methods/skills-filter.js';
import { SmartRandomDetails } from '../../../../../src/evaluation/domain/models/SmartRandomDetails.js';
import { domainBuilder, expect } from '../../../../test-helper.js';
import { buildSkill } from '../../../../tooling/domain-builder/factory/index.js';

const KNOWLEDGE_ELEMENT_STATUS = {
  VALIDATED: 'validated',
  INVALIDATED: 'invalidated',
};

function setPlayableSkills(skills) {
  skills.forEach((skill) => {
    skill.isPlayable = true;
  });
}

describe('Unit | Domain | services | smart-random | skillsFilter', function () {
  describe('#getFilteredSkillsForFirstChallenge', function () {
    it('should return the first possible skill', function () {
      // given
      const skill1 = domainBuilder.buildSkill({ name: '@web3', difficulty: 3 });
      const skills = [skill1];
      const knowledgeElements = [];
      const tubes = [new Tube({ skills: [skill1] })];
      setPlayableSkills(skills);

      // when
      const { availableSkills } = getFilteredSkillsForFirstChallenge({
        knowledgeElements,
        tubes,
        targetSkills: skills,
      });

      // then
      expect(availableSkills).to.deep.equal([skill1]);
    });

    it('should return algorithm selection details', function () {
      // given
      const skill1 = domainBuilder.buildSkill({ name: '@web3', difficulty: 3 });
      const skills = [skill1];
      const knowledgeElements = [];
      const tubes = [new Tube({ skills: [skill1] })];
      setPlayableSkills(skills);

      // when
      const { smartRandomDetails } = getFilteredSkillsForFirstChallenge({
        knowledgeElements,
        tubes,
        targetSkills: skills,
      });

      // then
      expect(smartRandomDetails).to.be.instanceof(SmartRandomDetails);
      expect(smartRandomDetails.steps.length).to.equal(5);
    });

    it('should return a skill even if the only tube has a skill with difficulty > 3', function () {
      // given
      const skill1 = domainBuilder.buildSkill({ name: '@web4', difficulty: 4 });
      const skills = [skill1];
      const knowledgeElements = [];
      const tubes = [new Tube({ skills: [skill1] })];
      setPlayableSkills(skills);

      // when
      const { availableSkills } = getFilteredSkillsForFirstChallenge({
        knowledgeElements,
        tubes,
        targetSkills: skills,
      });

      // then
      expect(availableSkills).to.deep.equal([skill1]);
    });

    it('should return a valid skill from a tube which only contains skill levels inferior or equal to 3', function () {
      // given
      const skillTube1Level2 = domainBuilder.buildSkill({ id: 'rec1', name: '@web2', difficulty: 2 });
      const skillTube1Level4 = domainBuilder.buildSkill({ id: 'rec2', name: '@web4', difficulty: 4 });
      const skillFromEasyTubeLevel2 = domainBuilder.buildSkill({ id: 'rec3', name: '@url2', difficulty: 2 });
      const skillFromEasyTubeLevel1 = domainBuilder.buildSkill({ id: 'rec4', name: '@url1', difficulty: 1 });

      const skills = [skillTube1Level2, skillTube1Level4, skillFromEasyTubeLevel2, skillFromEasyTubeLevel1];
      const knowledgeElements = [];
      const tubes = [
        new Tube({ skills: [skillTube1Level4, skillTube1Level2] }),
        new Tube({ skills: [skillFromEasyTubeLevel2, skillFromEasyTubeLevel1] }),
      ];
      setPlayableSkills(skills);

      // when
      const { availableSkills } = getFilteredSkillsForFirstChallenge({
        knowledgeElements,
        tubes,
        targetSkills: skills,
      });

      // then
      expect(availableSkills).to.deep.equal([skillFromEasyTubeLevel2]);
    });

    it('should return non timed skills', function () {
      // given
      const skillTube1Level2Timed = domainBuilder.buildSkill({ id: 'rec1', name: '@web2', difficulty: 2 });
      skillTube1Level2Timed.timed = true;
      const skillTube2Level2 = domainBuilder.buildSkill({ id: 'rec2', name: '@url2', difficulty: 2 });
      const skills = [skillTube1Level2Timed, skillTube2Level2];
      const knowledgeElements = [];
      const tubes = [new Tube({ skills: [skillTube1Level2Timed] }), new Tube({ skills: [skillTube2Level2] })];
      setPlayableSkills(skills);

      // when
      const { availableSkills } = getFilteredSkillsForFirstChallenge({
        knowledgeElements,
        tubes,
        targetSkills: skills,
      });

      // then
      expect(availableSkills).to.deep.equal([skillTube2Level2]);
    });

    it('should return timed skills if there is only timed skills', function () {
      // given
      const skillTube1Level2Timed = domainBuilder.buildSkill({ id: 'rec1', name: '@web2', difficulty: 2 });
      skillTube1Level2Timed.timed = true;
      const skillTube2Level2Timed = domainBuilder.buildSkill({ id: 'rec2', name: '@url2', difficulty: 2 });
      skillTube2Level2Timed.timed = true;
      const skills = [skillTube1Level2Timed, skillTube2Level2Timed];
      const knowledgeElements = [];
      const tubes = [new Tube({ skills: [skillTube1Level2Timed] }), new Tube({ skills: [skillTube2Level2Timed] })];
      setPlayableSkills(skills);

      // when
      const { availableSkills } = getFilteredSkillsForFirstChallenge({
        knowledgeElements,
        tubes,
        targetSkills: skills,
      });

      // then
      expect(availableSkills).to.deep.equal([skillTube1Level2Timed, skillTube2Level2Timed]);
    });

    it('should return only playable skills', function () {
      // given
      const playableSkill = domainBuilder.buildSkill({ name: '@web2', difficulty: 2 });
      const notPlayableSkill = domainBuilder.buildSkill({ name: '@url2', difficulty: 2 });
      const skills = [playableSkill, notPlayableSkill];
      const knowledgeElements = [];
      const tubes = [new Tube({ skills: [playableSkill, notPlayableSkill] })];
      playableSkill.isPlayable = true;
      notPlayableSkill.isPlayable = false;

      // when
      const { availableSkills } = getFilteredSkillsForFirstChallenge({
        knowledgeElements,
        tubes,
        targetSkills: skills,
      });

      // then
      expect(availableSkills).to.deep.equal([playableSkill]);
    });
  });

  describe('#getFilteredSkillsForNextChallenge', function () {
    it('should return algorithm selection details', function () {
      // given
      const skill1 = domainBuilder.buildSkill({ name: '@web3', difficulty: 3 });
      const skills = [skill1];
      const knowledgeElements = [];
      const tubes = [new Tube({ skills: [skill1] })];
      setPlayableSkills(skills);

      // when
      const { smartRandomDetails } = getFilteredSkillsForNextChallenge({
        knowledgeElements,
        tubes,
        targetSkills: skills,
      });

      // then
      expect(smartRandomDetails).to.be.instanceof(SmartRandomDetails);
      expect(smartRandomDetails.steps.length).to.equal(5);
    });

    describe('Verify rules : Skills not already tested', function () {
      it('should not ask a question that targets a skill already assessed', function () {
        // given
        const [skill1, skill2, skillNotAssessedLevel3] = domainBuilder.buildSkillCollection();

        const skills = [skill1, skill2, skillNotAssessedLevel3];

        const knowledgeElements = [
          domainBuilder.buildKnowledgeElement({
            skillId: skill1.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'direct',
          }),
          domainBuilder.buildKnowledgeElement({
            skillId: skill2.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'direct',
          }),
        ];
        setPlayableSkills(skills);

        // when
        const { availableSkills } = getFilteredSkillsForNextChallenge({
          knowledgeElements,
          predictedLevel: 3,
          isLastChallengeTimed: false,
          targetSkills: skills,
        });

        // then
        expect(availableSkills).to.deep.equal([skillNotAssessedLevel3]);
      });
    });

    describe('Verify rules : No successive timed challenges', function () {
      it('should return a skill without timed challenge if last one was timed', function () {
        // given
        const skill1 = domainBuilder.buildSkill({ id: 'rec1', name: '@test2', difficulty: 2 });
        const skillWithoutTimedChallenge = domainBuilder.buildSkill({ id: 'rec2', name: '@url2', difficulty: 2 });
        skillWithoutTimedChallenge.timed = false;
        const skillWithTimedChallenge = domainBuilder.buildSkill({ id: 'rec3', name: '@web2', difficulty: 2 });
        skillWithTimedChallenge.timed = true;

        const skills = [skillWithoutTimedChallenge, skillWithTimedChallenge];
        const knowledgeElements = [
          domainBuilder.buildKnowledgeElement({
            skillId: skill1.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'direct',
          }),
        ];
        const isLastChallengeTimed = true;
        setPlayableSkills(skills);

        // when
        const { availableSkills } = getFilteredSkillsForNextChallenge({
          isLastChallengeTimed,
          knowledgeElements,
          predictedLevel: 2,
          targetSkills: skills,
        });

        // then
        expect(availableSkills).to.deep.equal([skillWithoutTimedChallenge]);
      });

      it('should return a skill with timed challenges if last one was timed but we dont have not timed challenge', function () {
        // given
        const [skill1, skill2, skill3] = domainBuilder.buildSkillCollection();
        skill1.timed = true;
        skill2.timed = true;
        skill3.timed = true;
        const skills = [skill1, skill2, skill3];

        const knowledgeElements = [
          domainBuilder.buildKnowledgeElement({
            skillId: skill1.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'direct',
          }),
        ];
        const isLastChallengeTimed = true;
        setPlayableSkills(skills);

        // when
        const { availableSkills } = getFilteredSkillsForNextChallenge({
          knowledgeElements,
          predictedLevel: 2,
          targetSkills: skills,
          isLastChallengeTimed,
        });

        // then
        expect(availableSkills).to.have.members([skill2]);
      });
    });

    describe('Verify rules : Remove skill too difficult', function () {
      it('should return skills with level maximum of user level + 2', function () {
        // given
        const [skill1, skill2, skill3, skill4, skill5, skill6] = domainBuilder.buildSkillCollection({
          name: 'web',
          minLevel: 1,
          maxLevel: 6,
        });
        const skills = [skill1, skill2, skill3, skill4, skill5, skill6];
        const knowledgeElements = [
          domainBuilder.buildKnowledgeElement({
            skillId: skill1.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'indirect',
          }),
          domainBuilder.buildKnowledgeElement({
            skillId: skill2.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'direct',
          }),
        ];
        const tubes = [new Tube({ skills: [skill1, skill2, skill3, skill4, skill5, skill6] })];
        setPlayableSkills(skills);

        // when
        const { availableSkills } = getFilteredSkillsForNextChallenge({
          knowledgeElements,
          predictedLevel: 2,
          targetSkills: skills,
          tubes,
          isLastChallengeTimed: false,
        });

        // then
        expect(availableSkills).to.deep.equal([skill3, skill4]);
      });
    });

    describe('Verify rules : Focus on easy tubes first', function () {
      it('should return skills from tubes of max level 3', function () {
        // given
        const [skill3, skill4, skill5, skill6] = domainBuilder.buildSkillCollection({
          name: 'web',
          minLevel: 3,
          maxLevel: 6,
        });
        const [easyTubeSkill1, easyTubeSkill2, easyTubeSkill3] = domainBuilder.buildSkillCollection({
          name: 'url',
          minLevel: 1,
          maxLevel: 3,
        });
        const skills = [skill3, skill4, skill5, skill6, easyTubeSkill1, easyTubeSkill2, easyTubeSkill3];

        const knowledgeElements = [
          domainBuilder.buildKnowledgeElement({
            skillId: easyTubeSkill1.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'direct',
          }),
        ];
        const tubes = [
          new Tube({ skills: [skill3, skill4, skill5, skill6] }),
          new Tube({ skills: [easyTubeSkill1, easyTubeSkill2, easyTubeSkill3] }),
        ];
        setPlayableSkills(skills);

        // when
        const { availableSkills } = getFilteredSkillsForNextChallenge({
          knowledgeElements,
          predictedLevel: 5,
          targetSkills: skills,
          tubes,
          isLastChallengeTimed: false,
        });

        // then
        expect(availableSkills).to.deep.equal([easyTubeSkill2, easyTubeSkill3]);
      });

      it('should return skills from all tubes if there is not easy tubes', function () {
        // given
        const [skill3, skill4, skill5, skill6] = domainBuilder.buildSkillCollection({
          name: 'web',
          minLevel: 3,
          maxLevel: 6,
        });
        const skills = [skill3, skill4, skill5, skill6];

        const knowledgeElements = [
          domainBuilder.buildKnowledgeElement({
            skillId: skill3.id,
            status: KNOWLEDGE_ELEMENT_STATUS.VALIDATED,
            source: 'direct',
          }),
        ];
        const tubes = [new Tube({ skills: [skill3, skill4, skill5, skill6] })];
        setPlayableSkills(skills);

        // when
        const { availableSkills } = getFilteredSkillsForNextChallenge({
          knowledgeElements,
          predictedLevel: 5,
          targetSkills: skills,
          tubes,
          isLastChallengeTimed: false,
        });

        // then
        expect(availableSkills).to.deep.equal([skill4, skill5, skill6]);
      });
    });

    describe('Verify rules: Remove skills not playable', function () {
      it('should return only playable skills', function () {
        // given
        const [notPlayableSkill, playableSkill] = domainBuilder.buildSkillCollection({
          name: 'web',
          minLevel: 3,
          maxLevel: 6,
        });
        const skills = [notPlayableSkill, playableSkill];

        const knowledgeElements = [];
        const tubes = [new Tube({ skills: [notPlayableSkill, playableSkill] })];
        notPlayableSkill.isPlayable = false;
        playableSkill.isPlayable = true;

        // when
        const { availableSkills } = getFilteredSkillsForNextChallenge({
          knowledgeElements,
          tubes,
          targetSkills: skills,
        });

        // then
        expect(availableSkills).to.deep.equal([playableSkill]);
      });
    });
  });

  describe('#focusOnDefaultLevel', function () {
    describe("when some skill's difficulty are equal to 2", function () {
      it('should only return difficulty 2 skills', function () {
        // given
        const skills = [
          { id: 1, difficulty: 2 },
          { id: 2, difficulty: 1 },
          { id: 3, difficulty: 3 },
          { id: 4, difficulty: 2 },
        ].map(buildSkill);

        // when
        const difficultyTwoSkills = focusOnDefaultLevel(skills);

        // then
        expect(difficultyTwoSkills.length).to.equal(2);
        expect(difficultyTwoSkills[0].id).to.equal(1);
        expect(difficultyTwoSkills[1].id).to.equal(4);
      });
    });

    describe('when there is no difficulty 2 skills', function () {
      it('should return the lowest difficulty skills', function () {
        // given
        const skills = [
          { id: 4, difficulty: 6 },
          { id: 1, difficulty: 1 },
          { id: 2, difficulty: 1 },
          { id: 3, difficulty: 4 },
        ].map(buildSkill);

        // when
        const lowestDifficultySkills = focusOnDefaultLevel(skills);

        // then
        expect(lowestDifficultySkills.length).to.equal(2);
        expect(lowestDifficultySkills[0].id).to.equal(1);
        expect(lowestDifficultySkills[1].id).to.equal(2);
      });
    });
  });
});
