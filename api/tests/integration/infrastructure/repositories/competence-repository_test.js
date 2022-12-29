const _ = require('lodash');
const { expect, mockLearningContent, domainBuilder } = require('../../../test-helper');
const Area = require('../../../../lib/domain/models/Area');
const Competence = require('../../../../lib/domain/models/Competence');
const competenceRepository = require('../../../../lib/infrastructure/repositories/competence-repository');

describe('Integration | Repository | competence-repository', function () {
  describe('#get', function () {
    it('should return the competence with full area (minus name)', async function () {
      // given
      const expectedArea = domainBuilder.buildArea();
      const expectedCompetence = domainBuilder.buildCompetence({ area: expectedArea, areaId: expectedArea.id });
      const learningContent = {
        areas: [
          {
            ...expectedArea,
            competenceIds: [expectedCompetence.id],
            title_i18n: {
              fr: expectedArea.title,
            },
          },
        ],
        competences: [
          {
            ...expectedCompetence,
            areaId: expectedArea.id,
            description_i18n: {
              fr: expectedCompetence.description,
            },
            name_i18n: {
              fr: expectedCompetence.name,
            },
          },
        ],
      };
      mockLearningContent(learningContent);

      // when
      const competence = await competenceRepository.get({ id: expectedCompetence.id });

      // then
      expect(competence).to.be.instanceOf(Competence);
      expect(competence.area).to.be.instanceOf(Area);
      expect(_.omit(competence, 'area')).to.deep.equal(_.omit(expectedCompetence, 'area'));
      expect(_.omit(competence.area, 'name')).to.deep.equal(_.omit(expectedCompetence.area, 'name'));
    });

    it('should return the competence with appropriate translations', async function () {
      // given
      const locale = 'en';
      const expectedArea = domainBuilder.buildArea();
      const expectedCompetence = domainBuilder.buildCompetence({ area: expectedArea });
      const learningContent = {
        areas: [
          {
            ...expectedArea,
            competenceIds: [expectedCompetence.id],
            title_i18n: {
              en: expectedArea.title,
            },
          },
        ],
        competences: [
          {
            ...expectedCompetence,
            areaId: expectedArea.id,
            description_i18n: {
              en: expectedCompetence.description,
            },
            name_i18n: {
              en: expectedCompetence.name,
            },
          },
        ],
      };
      mockLearningContent(learningContent);

      // when
      const competence = await competenceRepository.get({ id: expectedCompetence.id, locale });

      // then
      expect(competence.name).to.equal(expectedCompetence.name);
      expect(competence.description).to.equal(expectedCompetence.description);
      expect(competence.area.title).to.equal(expectedArea.title);
    });
  });

  describe('#getCompetenceName', function () {
    it('should return the competence name with appropriate translations', async function () {
      // given
      const locale = 'en';
      const expectedArea = domainBuilder.buildArea();
      const expectedCompetence = domainBuilder.buildCompetence({ area: expectedArea });
      const learningContent = {
        areas: [
          {
            ...expectedArea,
            competenceIds: [expectedCompetence.id],
            title_i18n: {
              en: expectedArea.title,
            },
          },
        ],
        competences: [
          {
            ...expectedCompetence,
            areaId: expectedArea.id,
            description_i18n: {
              en: expectedCompetence.description,
            },
            name_i18n: {
              en: expectedCompetence.name,
            },
          },
        ],
      };
      mockLearningContent(learningContent);

      // when
      const competenceName = await competenceRepository.getCompetenceName({ id: expectedCompetence.id, locale });

      // then
      expect(competenceName).to.equal(expectedCompetence.name);
    });
  });

  describe('#list', function () {
    it('should return the competences', async function () {
      // given
      const competence1 = domainBuilder.buildCompetence();
      const competence2 = domainBuilder.buildCompetence();
      competence1.area = undefined;
      competence2.area = undefined;
      const learningContent = {
        competences: [
          {
            ...competence1,
            description_i18n: {
              fr: competence1.description,
            },
            name_i18n: {
              fr: competence1.name,
            },
          },
          {
            ...competence2,
            description_i18n: {
              fr: competence2.description,
            },
            name_i18n: {
              fr: competence2.name,
            },
          },
        ],
      };
      mockLearningContent(learningContent);
      // when
      const competences = await competenceRepository.list();

      // then
      expect(competences).to.have.lengthOf(2);
      expect(competences[0]).to.be.instanceOf(Competence);
      expect(competences).to.deep.include.members([competence1, competence2]);
    });

    it('should return the competences with appropriate translations', async function () {
      // given
      const locale = 'en';
      const competence = domainBuilder.buildCompetence();
      competence.area = undefined;
      const learningContent = {
        competences: [
          {
            ...competence,
            description_i18n: {
              en: competence.description,
            },
            name_i18n: {
              en: competence.name,
            },
          },
        ],
      };
      mockLearningContent(learningContent);

      // when
      const competences = await competenceRepository.list({ locale });

      // then
      expect(competences[0].name).to.equal(competence.name);
      expect(competences[0].description).to.equal(competence.description);
    });
  });

  describe('#listPixCompetencesOnly', function () {
    it('should return the competences with only Pix as origin', async function () {
      // given
      const pixCompetence = domainBuilder.buildCompetence({ origin: 'Pix' });
      const nonPixCompetence = domainBuilder.buildCompetence({ origin: 'Continuum Espace temps' });
      pixCompetence.area = undefined;
      nonPixCompetence.area = undefined;
      const learningContent = {
        competences: [
          {
            ...pixCompetence,
            description_i18n: {
              fr: pixCompetence.description,
            },
            name_i18n: {
              fr: pixCompetence.name,
            },
          },
          {
            ...nonPixCompetence,
            description_i18n: {
              fr: nonPixCompetence.description,
            },
            name_i18n: {
              fr: nonPixCompetence.name,
            },
          },
        ],
      };
      mockLearningContent(learningContent);

      // when
      const competences = await competenceRepository.listPixCompetencesOnly();

      // then
      expect(competences).to.have.lengthOf(1);
      expect(competences[0]).to.be.instanceOf(Competence);
      expect(competences[0]).to.deep.equal(pixCompetence);
    });

    it('should return the competences with appropriate translations', async function () {
      // given
      const locale = 'en';
      const competence = domainBuilder.buildCompetence({ origin: 'Pix' });
      competence.area = undefined;
      const learningContent = {
        competences: [
          {
            ...competence,
            description_i18n: {
              en: competence.description,
            },
            name_i18n: {
              en: competence.name,
            },
          },
        ],
      };
      mockLearningContent(learningContent);

      // when
      const competences = await competenceRepository.listPixCompetencesOnly({ locale });

      // then
      expect(competences[0].name).to.equal(competence.name);
      expect(competences[0].description).to.equal(competence.description);
    });
  });

  describe('#findByRecordIds', function () {
    beforeEach(function () {
      const learningContent = {
        competences: [
          {
            id: 'competence1',
            name_i18n: { fr: 'competence1 name fr', en: 'competence1 name en' },
            index: '1.1',
            description_i18n: { fr: 'competence1 description fr', en: 'competence1 description en' },
            origin: 'competence1 origin',
            skillIds: ['skillA'],
            thematicIds: ['thematicA'],
            areaId: 'area1',
          },
          {
            id: 'competence2',
            name_i18n: { fr: 'competence2 name fr', en: 'competence2 name en' },
            index: '2.2',
            description_i18n: { fr: 'competence2 description fr', en: 'competence2 description en' },
            origin: 'competence2 origin',
            skillIds: ['skillB'],
            thematicIds: ['thematicB'],
            areaId: 'area2',
          },
          {
            id: 'competence3',
            name_i18n: { fr: 'competence3 name fr', en: 'competence3 name en' },
            index: '3.3',
            description_i18n: { fr: 'competence3 description fr', en: 'competence3 description en' },
            origin: 'competence3 origin',
            skillIds: ['skillC'],
            thematicIds: ['thematicC'],
            areaId: 'area3',
          },
        ],
      };
      mockLearningContent(learningContent);
    });

    it('should return competences given by id with default locale', async function () {
      // when
      const competences = await competenceRepository.findByRecordIds_new({
        competenceIds: ['competence1', 'competence3'],
      });

      // then
      const competence1 = domainBuilder.buildCompetence.noArea({
        id: 'competence1',
        name: 'competence1 name fr',
        index: '1.1',
        description: 'competence1 description fr',
        areaId: 'area1',
        skillIds: ['skillA'],
        thematicIds: ['thematicA'],
        origin: 'competence1 origin',
      });
      const competence3 = domainBuilder.buildCompetence.noArea({
        id: 'competence3',
        name: 'competence3 name fr',
        index: '3.3',
        description: 'competence3 description fr',
        areaId: 'area3',
        skillIds: ['skillC'],
        thematicIds: ['thematicC'],
        origin: 'competence3 origin',
      });
      expect(competences).to.deepEqualArray([competence1, competence3]);
    });

    it('should return competences in given locale', async function () {
      // when
      const competences = await competenceRepository.findByRecordIds_new({
        competenceIds: ['competence1', 'competence3'],
        locale: 'en',
      });

      // then
      const competence1 = domainBuilder.buildCompetence.noArea({
        id: 'competence1',
        name: 'competence1 name en',
        index: '1.1',
        description: 'competence1 description en',
        areaId: 'area1',
        skillIds: ['skillA'],
        thematicIds: ['thematicA'],
        origin: 'competence1 origin',
      });
      const competence3 = domainBuilder.buildCompetence.noArea({
        id: 'competence3',
        name: 'competence3 name en',
        index: '3.3',
        description: 'competence3 description en',
        areaId: 'area3',
        skillIds: ['skillC'],
        thematicIds: ['thematicC'],
        origin: 'competence3 origin',
      });
      expect(competences).to.deepEqualArray([competence1, competence3]);
    });
  });
});
