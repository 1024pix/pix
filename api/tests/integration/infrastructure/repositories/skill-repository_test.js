const { expect, airtableBuilder, domainBuilder } = require('../../../test-helper');
const cache = require('../../../../lib/infrastructure/caches/learning-content-cache');
const Skill = require('../../../../lib/domain/models/Skill');
const skillRepository = require('../../../../lib/infrastructure/repositories/skill-repository');

describe('Integration | Repository | skill-repository', () => {

  afterEach(() => {
    airtableBuilder.cleanAll();
    return cache.flushAll();
  });

  describe('#findActiveByCompetenceId', () => {

    it('should return all skills in the given competence', async () => {
      // given
      const competenceId = 'recCompetenceId';
      const activeSkill = domainBuilder.buildSkill({ competenceId });
      const nonActiveSkill = domainBuilder.buildSkill({ competenceId });
      const activeSkill_otherCompetence = domainBuilder.buildSkill({ competenceId: 'recAnotherCompetence' });
      const airtableActiveSkill = airtableBuilder.factory.buildSkill.fromDomain({ domainSkill: activeSkill, status: 'actif' });
      const airtableArchivedSkill = airtableBuilder.factory.buildSkill.fromDomain({ domainSkill: nonActiveSkill, status: 'archivé' });
      const airtableActiveSkill_otherCompetence = airtableBuilder.factory.buildSkill.fromDomain({ domainSkill: activeSkill_otherCompetence, status: 'actif' });
      airtableBuilder.mockLists({ skills: [airtableActiveSkill, airtableArchivedSkill, airtableActiveSkill_otherCompetence] });

      // when
      const skills = await skillRepository.findActiveByCompetenceId(competenceId);

      // then
      expect(skills).to.have.lengthOf(1);
      expect(skills[0]).to.be.instanceof(Skill);
      expect(skills[0]).to.be.deep.equal(activeSkill);
    });
  });

  describe('#findOperativeByCompetenceId', () => {

    it('should resolve all skills for one competence', async () => {
      // given
      const competenceId = 'recCompetenceId';
      const activeSkill = domainBuilder.buildSkill({ competenceId });
      const archivedSkill = domainBuilder.buildSkill({ competenceId });
      const nonOperativeSkill = domainBuilder.buildSkill({ competenceId });
      const activeSkill_otherCompetence = domainBuilder.buildSkill({ competenceId: 'recAnotherCompetence' });
      const airtableActiveSkill = airtableBuilder.factory.buildSkill.fromDomain({ domainSkill: activeSkill, status: 'actif' });
      const airtableArchivedSkill = airtableBuilder.factory.buildSkill.fromDomain({ domainSkill: archivedSkill, status: 'archivé' });
      const airtableNonOperativeSkill = airtableBuilder.factory.buildSkill.fromDomain({ domainSkill: nonOperativeSkill, status: 'BLABLA' });
      const airtableActiveSkill_otherCompetence = airtableBuilder.factory.buildSkill.fromDomain({ domainSkill: activeSkill_otherCompetence, status: 'actif' });
      airtableBuilder.mockLists({ skills: [airtableActiveSkill, airtableArchivedSkill, airtableNonOperativeSkill, airtableActiveSkill_otherCompetence] });

      // when
      const skills = await skillRepository.findOperativeByCompetenceId(competenceId);

      // then
      expect(skills).to.have.lengthOf(2);
      expect(skills[0]).to.be.instanceof(Skill);
      expect(skills).to.deep.include.members([activeSkill, archivedSkill]);
    });
  });

  describe('#findOperativeByIds', () => {

    it('should resolve all skills passed by ids', async () => {
      // given
      const competenceId = 'recCompetenceId';
      const activeSkill = domainBuilder.buildSkill({ competenceId });
      const archivedSkill = domainBuilder.buildSkill({ competenceId });
      const nonOperativeSkill = domainBuilder.buildSkill({ competenceId });
      const airtableActiveSkill = airtableBuilder.factory.buildSkill.fromDomain({ domainSkill: activeSkill, status: 'actif' });
      const airtableArchivedSkill = airtableBuilder.factory.buildSkill.fromDomain({ domainSkill: archivedSkill, status: 'archivé' });
      const airtableNonOperativeSkill = airtableBuilder.factory.buildSkill.fromDomain({ domainSkill: nonOperativeSkill, status: 'BLABLA' });
      airtableBuilder.mockLists({ skills: [airtableActiveSkill, airtableArchivedSkill, airtableNonOperativeSkill] });

      // when
      const skills = await skillRepository.findOperativeByIds([activeSkill.id, archivedSkill.id, nonOperativeSkill.id]);

      // then
      expect(skills).to.have.lengthOf(2);
      expect(skills[0]).to.be.instanceof(Skill);
      expect(skills).to.deep.include.members([activeSkill, archivedSkill]);
    });
  });
});
