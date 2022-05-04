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
      const expectedCompetence = domainBuilder.buildCompetence({ area: expectedArea });
      const learningContent = {
        areas: [
          {
            ...expectedArea,
            competenceIds: [expectedCompetence.id],
            titleFrFr: expectedArea.title,
          },
        ],
        competences: [
          {
            ...expectedCompetence,
            areaId: expectedArea.id,
            descriptionFrFr: expectedCompetence.description,
            nameFrFr: expectedCompetence.name,
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
            titleEnUs: expectedArea.title,
          },
        ],
        competences: [
          {
            ...expectedCompetence,
            areaId: expectedArea.id,
            descriptionEnUs: expectedCompetence.description,
            nameEnUs: expectedCompetence.name,
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
            titleEnUs: expectedArea.title,
          },
        ],
        competences: [
          {
            ...expectedCompetence,
            areaId: expectedArea.id,
            descriptionEnUs: expectedCompetence.description,
            nameEnUs: expectedCompetence.name,
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
            descriptionFrFr: competence1.description,
            nameFrFr: competence1.name,
          },
          {
            ...competence2,
            descriptionFrFr: competence2.description,
            nameFrFr: competence2.name,
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
            descriptionEnUs: competence.description,
            nameEnUs: competence.name,
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
            descriptionFrFr: pixCompetence.description,
            nameFrFr: pixCompetence.name,
          },
          {
            ...nonPixCompetence,
            descriptionFrFr: nonPixCompetence.description,
            nameFrFr: nonPixCompetence.name,
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
            descriptionEnUs: competence.description,
            nameEnUs: competence.name,
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
});
