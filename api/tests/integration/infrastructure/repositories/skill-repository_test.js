const { expect, airtableBuilder } = require('../../../test-helper');
const cache = require('../../../../lib/infrastructure/caches/learning-content-cache');
const Skill = require('../../../../lib/domain/models/Skill');
const skillRepository = require('../../../../lib/infrastructure/repositories/skill-repository');

const skill0ForCompetence0_archived = {
  id: 'recSkill0_0',
  name: '@recSkill0_0',
  tubeId: 'recTube0_0',
  competenceId: 'recCompetence0',
  pixValue: 1,
  tutorialIds: [],
};

const airtableSkill0_0 = airtableBuilder.factory.buildSkill({
  id: skill0ForCompetence0_archived.id,
  nom: skill0ForCompetence0_archived.name,
  tube: [skill0ForCompetence0_archived.tubeId],
  compétenceViaTube: [skill0ForCompetence0_archived.competenceId],
  pixValue: skill0ForCompetence0_archived.pixValue,
  status: 'archivé',
  comprendre: skill0ForCompetence0_archived.tutorialIds,
});

const skill1ForCompetence0_active = {
  id: 'recSkill1_0',
  name: '@recSkill1_0',
  tubeId: 'recTube1_0',
  competenceId: 'recCompetence0',
  pixValue: 4,
  tutorialIds: ['recTutorial1_0'],
};

const airtableSkill1_0 = airtableBuilder.factory.buildSkill({
  id: skill1ForCompetence0_active.id,
  nom: skill1ForCompetence0_active.name,
  tube: [skill1ForCompetence0_active.tubeId],
  compétenceViaTube: [skill1ForCompetence0_active.competenceId],
  pixValue: skill1ForCompetence0_active.pixValue,
  status: 'actif',
  comprendre: skill1ForCompetence0_active.tutorialIds,
});

const skill2ForCompetence0_other = {
  id: 'recSkill2_0',
  name: '@recSkill2_0',
  tubeId: 'recTube2_0',
  competenceId: 'recCompetence0',
  pixValue: 3,
  tutorialIds: ['recTutorial2_0'],
};

const airtableSkill2_0 = airtableBuilder.factory.buildSkill({
  id: skill2ForCompetence0_other.id,
  nom: skill2ForCompetence0_other.name,
  tube: [skill2ForCompetence0_other.tubeId],
  compétenceViaTube: [skill2ForCompetence0_other.competenceId],
  pixValue: skill2ForCompetence0_other.pixValue,
  status: 'blabla',
  comprendre: skill2ForCompetence0_other.tutorialIds,
});

const skill0ForCompetence1_active = {
  id: 'recSkill0_1',
  name: '@recSkill0_1',
  tubeId: 'recTube0_1',
  competenceId: 'recCompetence1',
  pixValue: 2,
  tutorialIds: ['recTutorial0_1'],
};

const airtableSkill0_1 = airtableBuilder.factory.buildSkill({
  id: skill0ForCompetence1_active.id,
  nom: skill0ForCompetence1_active.name,
  tube: [skill0ForCompetence1_active.tubeId],
  compétenceViaTube: [skill0ForCompetence1_active.competenceId],
  pixValue: skill0ForCompetence1_active.pixValue,
  status: 'actif',
  comprendre: skill0ForCompetence1_active.tutorialIds,
});

describe('Integration | Repository | skill-repository', () => {

  beforeEach(() => {
    airtableBuilder.mockLists({ skills: [airtableSkill0_0, airtableSkill1_0, airtableSkill0_1, airtableSkill2_0] });
  });

  afterEach(() => {
    airtableBuilder.cleanAll();
    return cache.flushAll();
  });

  describe('#findActiveByCompetenceId', () => {

    it('should return all skills in the given competence', async () => {
      // when
      const skills = await skillRepository.findActiveByCompetenceId('recCompetence0');

      // then
      expect(skills).to.have.lengthOf(1);
      expect(skills[0]).to.be.instanceof(Skill);
      expect(skills[0]).to.be.deep.equal(skill1ForCompetence0_active);
    });
  });

  describe('#findOperativeByCompetenceId', () => {

    it('should resolve all skills for one competence', async () => {
      // when
      const skills = await skillRepository.findOperativeByCompetenceId('recCompetence0');

      // then
      expect(skills).to.have.lengthOf(2);
      expect(skills[0]).to.be.instanceof(Skill);
      expect(skills).to.be.deep.equal([skill0ForCompetence0_archived, skill1ForCompetence0_active]);
    });
  });

  describe('#findOperativeByIds', () => {

    it('should resolve all skills passed by ids', async () => {
      // when
      const skills = await skillRepository.findOperativeByIds([skill0ForCompetence0_archived.id, skill0ForCompetence1_active.id]);

      // then
      expect(skills).to.have.lengthOf(2);
      expect(skills[0]).to.be.instanceof(Skill);
      expect(skills).to.be.deep.equal([skill0ForCompetence0_archived, skill0ForCompetence1_active]);
    });
  });
});
