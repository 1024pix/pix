const { expect, sinon } = require('../../test-helper');
const {
  getUserValidatedKnowledgeElements,
  getTubeByIds,
  getUserSkillsGroupedByTubeId,
  getHardestSkillByTubeId,
  compareUserScoreWithLatestRelease,
} = require('../../../scripts/compare-pix-with-latest-release');
const knowledgeElementRepository = require('../../../lib/infrastructure/repositories/knowledge-element-repository');
const tubeRepository = require('../../../lib/infrastructure/repositories/tube-repository');
const skillRepository = require('../../../lib/infrastructure/repositories/skill-repository');

// mock datas
const KnowledgeElement = require('../../../lib/domain/models/KnowledgeElement');
const Tube = require('../../../lib/domain/models/Tube');
const Skill = require('../../../lib/domain/models/Skill');

const skill1 = new Skill({
  id: 'skill1',
  name: '@info1',
  tubeId: 'tube1',
  tutorialIds: [],
  pixValue: 10,
  competenceId: 'comp1',
  difficulty: 1,
});
const skill2 = new Skill({
  id: 'skill2',
  name: '@info2',
  tubeId: 'tube1',
  tutorialIds: [],
  pixValue: 10,
  competenceId: 'comp1',
  difficulty: 2,
});
const skill3 = new Skill({
  id: 'skill3',
  name: '@hack3',
  tubeId: 'tube2',
  tutorialIds: [],
  pixValue: 10,
  competenceId: 'comp1',
  difficulty: 3,
});

// additionnal 'active' skill which level is beyond user level
// should not be retained for calculating today score
const skill4 = new Skill({
  id: 'skill4',
  name: '@info3',
  tubeId: 'tube1',
  tutorialIds: [],
  pixValue: 10,
  competenceId: 'comp1',
  difficulty: 3,
});

const activeSkills = [skill1, skill2, skill3, skill4];
const skills = [skill1, skill2, skill3];

const tube1 = new Tube({ id: 'tube1', skills: [skill1, skill2] });
const tube2 = new Tube({ id: 'tube2', skills: [skill3] });
const tubes = [tube1, tube2];

const knowledge1 = new KnowledgeElement({ id: 'ke1', status: 'validated', skillId: 'skill1', earnedPix: 5 });
const knowledge2 = new KnowledgeElement({ id: 'ke2', status: 'validated', skillId: 'skill2', earnedPix: 5 });
const knowledge3 = new KnowledgeElement({ id: 'ke3', status: 'validated', skillId: 'skill3', earnedPix: 5 });

const invalidatedKe = new KnowledgeElement({ id: 'ke3', status: 'invalidated', skillId: 'skill1' });
const knowledgeElements = [knowledge1, knowledge2, invalidatedKe, knowledge3];

describe('Unit | Scripts | compare-pix-with-latest-release.js', function () {
  beforeEach(async function () {
    // stub repositories
    knowledgeElementRepository.findUniqByUserId = sinon.stub().resolves(knowledgeElements);
    tubeRepository.get = sinon.stub().callsFake((tubeId) => tubes.find((tube) => tube.id === tubeId));
    skillRepository.get = sinon.stub().callsFake((skillId) => skills.find((skill) => skill.id === skillId));
    skillRepository.findActiveByTubeId = sinon.stub().callsFake((tubeId) => {
      const result = activeSkills.filter((skill) => skill.tubeId === tubeId);
      return result;
    });
  });

  describe('#getUserValidatedKnowledgeElements', function () {
    it('should return validated knowledgeElementsOnly', async function () {
      // when
      const validated = await getUserValidatedKnowledgeElements(1);

      // then
      validated.forEach((current) => {
        expect(current.status).to.equal('validated');
      });
    });
  });

  describe('#getTubeByIds', function () {
    it('should return the tube instances by their ids', async function () {
      // when
      const result = await getTubeByIds(['tube1', 'tube2']);

      // then
      expect(tubes).to.deep.equal(result);
    });
  });

  describe('#getUserSkillsGroupedByTubeId', function () {
    it('should return the skills associated to the knowledgeElements grouped by their tube ids', async function () {
      // when
      const validated = await getUserValidatedKnowledgeElements(1);
      const result = await getUserSkillsGroupedByTubeId(validated);

      // then
      expect(result).to.deep.equal({
        tube1: [skill1, skill2],
        tube2: [skill3],
      });
    });
  });

  describe('#getHardestSkillByTubeId', function () {
    it('should keep only the hardest skill for each tube', async function () {
      // when
      const validated = await getUserValidatedKnowledgeElements(1);
      const grouped = await getUserSkillsGroupedByTubeId(validated);
      const hardest = getHardestSkillByTubeId(grouped);

      // then
      expect(hardest).to.deep.equal({
        tube1: skill2,
        tube2: skill3,
      });
    });
  });

  describe('#compareUserScoreWithLatestRelease', function () {
    it('should be able to calculate the user score according to his knowledge elements', async function () {
      // when
      const result = await compareUserScoreWithLatestRelease(1);

      // then
      expect(result.userScore).to.equal(15);
      expect(result.todayScore).to.equal(30);
    });
  });
});
