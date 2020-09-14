const _ = require('lodash');
const { expect, airtableBuilder, domainBuilder, databaseBuilder } = require('../../../test-helper');
const cache = require('../../../../lib/infrastructure/caches/learning-content-cache');
const Area = require('../../../../lib/domain/models/Area');
const Competence = require('../../../../lib/domain/models/Competence');
const competenceRepository = require('../../../../lib/infrastructure/repositories/competence-repository');

describe('Integration | Repository | competence-repository', () => {

  afterEach(() => {
    airtableBuilder.cleanAll();
    return cache.flushAll();
  });

  describe('#get', () => {
    it('should return the competence with full area (minus name)', async () => {
      // given
      const expectedArea = domainBuilder.buildArea();
      const expectedCompetence = domainBuilder.buildCompetence({ area: expectedArea });
      const airtableArea = airtableBuilder.factory.buildArea.fromDomain({ domainArea: expectedArea });
      const airtableCompetence = airtableBuilder.factory.buildCompetence.fromDomain({ domainCompetence: expectedCompetence });
      airtableBuilder.mockLists({ areas: [airtableArea], competences: [airtableCompetence] });

      // when
      const competence = await competenceRepository.get({ id: expectedCompetence.id });

      // then
      expect(competence).to.be.instanceOf(Competence);
      expect(competence.area).to.be.instanceOf(Area);
      expect(_.omit(competence, 'area')).to.deep.equal(_.omit(expectedCompetence, 'area'));
      expect(_.omit(competence.area, 'name')).to.deep.equal(_.omit(expectedCompetence.area, 'name'));
    });

    it('should return the competence with appropriate translations', async () => {
      // given
      const locale = 'en';
      const expectedArea = domainBuilder.buildArea();
      const expectedCompetence = domainBuilder.buildCompetence({ area: expectedArea });
      const airtableArea = airtableBuilder.factory.buildArea.fromDomain({ domainArea: expectedArea, locale });
      const airtableCompetence = airtableBuilder.factory.buildCompetence.fromDomain({ domainCompetence: expectedCompetence, locale });
      airtableBuilder.mockLists({ areas: [airtableArea], competences: [airtableCompetence] });

      // when
      const competence = await competenceRepository.get({ id: expectedCompetence.id, locale });

      // then
      expect(competence.name).to.equal(airtableCompetence.fields['Titre en-us']);
      expect(competence.description).to.equal(airtableCompetence.fields['Description en-us']);
      expect(competence.area.title).to.equal(airtableArea.fields['Titre en-us']);
    });
  });

  describe('#getCompetenceName', () => {
    it('should return the competence name with appropriate translations', async () => {
      // given
      const locale = 'en';
      const expectedArea = domainBuilder.buildArea();
      const expectedCompetence = domainBuilder.buildCompetence({ area: expectedArea });
      const airtableArea = airtableBuilder.factory.buildArea.fromDomain({ domainArea: expectedArea, locale });
      const airtableCompetence = airtableBuilder.factory.buildCompetence.fromDomain({ domainCompetence: expectedCompetence, locale });
      airtableBuilder.mockLists({ areas: [airtableArea], competences: [airtableCompetence] });

      // when
      const competenceName = await competenceRepository.getCompetenceName({ id: expectedCompetence.id, locale });

      // then
      expect(competenceName).to.equal(airtableCompetence.fields['Titre en-us']);
    });
  });

  describe('#getPixScoreByCompetence', () => {
    it('should return the user pixScore by competence within date', async () => {
      // given
      const competenceId1 = 'recCompetenceId1';
      const competenceId2 = 'recCompetenceId2';
      const userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildKnowledgeElement({ competenceId: competenceId1, earnedPix: 1, userId });
      databaseBuilder.factory.buildKnowledgeElement({ competenceId: competenceId2, earnedPix: 10, userId });
      await databaseBuilder.commit();

      // when
      const pixScoreByCompetence = await competenceRepository.getPixScoreByCompetence({ userId });

      // then
      expect(pixScoreByCompetence[competenceId1]).to.equal(1);
      expect(pixScoreByCompetence[competenceId2]).to.equal(10);
    });
  });

  describe('#list', () => {
    it('should return the competences', async () => {
      // given
      const competence1 = domainBuilder.buildCompetence();
      const competence2 = domainBuilder.buildCompetence();
      competence1.area = undefined;
      competence2.area = undefined;
      const airtableCompetence1 = airtableBuilder.factory.buildCompetence.fromDomain({ domainCompetence: competence1 });
      const airtableCompetence2 = airtableBuilder.factory.buildCompetence.fromDomain({ domainCompetence: competence2 });
      airtableBuilder.mockLists({ competences: [airtableCompetence1, airtableCompetence2] });

      // when
      const competences = await competenceRepository.list();

      // then
      expect(competences).to.have.lengthOf(2);
      expect(competences[0]).to.be.instanceOf(Competence);
      expect(competences).to.deep.include.members([competence1, competence2]);
    });

    it('should return the competences with appropriate translations', async () => {
      // given
      const locale = 'en';
      const competence = domainBuilder.buildCompetence();
      competence.area = undefined;
      const airtableCompetence = airtableBuilder.factory.buildCompetence.fromDomain({ domainCompetence: competence, locale });
      airtableBuilder.mockLists({ competences: [airtableCompetence] });

      // when
      const competences = await competenceRepository.list({ locale });

      // then
      expect(competences[0].name).to.equal(airtableCompetence.fields['Titre en-us']);
      expect(competences[0].description).to.equal(airtableCompetence.fields['Description en-us']);
    });
  });

  describe('#listPixCompetencesOnly', () => {
    it('should return the competences with only Pix as origin', async () => {
      // given
      const pixCompetence = domainBuilder.buildCompetence({ origin: 'Pix' });
      const nonPixCompetence = domainBuilder.buildCompetence({ origin: 'Continuum Espace temps' });
      pixCompetence.area = undefined;
      nonPixCompetence.area = undefined;
      const airtablePixCompetence = airtableBuilder.factory.buildCompetence.fromDomain({ domainCompetence: pixCompetence });
      const airtableNonPixCompetence = airtableBuilder.factory.buildCompetence.fromDomain({ domainCompetence: nonPixCompetence });
      airtableBuilder.mockLists({ competences: [airtablePixCompetence, airtableNonPixCompetence] });

      // when
      const competences = await competenceRepository.listPixCompetencesOnly();

      // then
      expect(competences).to.have.lengthOf(1);
      expect(competences[0]).to.be.instanceOf(Competence);
      expect(competences[0]).to.deep.equal(pixCompetence);
    });

    it('should return the competences with appropriate translations', async () => {
      // given
      const locale = 'en';
      const competence = domainBuilder.buildCompetence({ origin: 'Pix' });
      competence.area = undefined;
      const airtableCompetence = airtableBuilder.factory.buildCompetence.fromDomain({ domainCompetence: competence, locale });
      airtableBuilder.mockLists({ competences: [airtableCompetence] });

      // when
      const competences = await competenceRepository.listPixCompetencesOnly({ locale });

      // then
      expect(competences[0].name).to.equal(airtableCompetence.fields['Titre en-us']);
      expect(competences[0].description).to.equal(airtableCompetence.fields['Description en-us']);
    });
  });
});
