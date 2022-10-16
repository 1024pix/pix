const { expect, domainBuilder, LearningContentMock } = require('../../../test-helper');
const areaRepository = require('../../../../lib/infrastructure/repositories/area-repository');

describe('Integration | Repository | area-repository', function () {
  let areaPixA1Data, areaCuisineA2Data, competencePixA1C1Data, competenceCuisineA2C1Data;
  const areaPixA1Id = 'areaPixA1';
  const areaCuisineA2Id = 'areaCuisineA2';
  const competencePixA1C1Id = 'competencePixA1C1';
  const competenceCuisineA2C1Id = 'competenceCuisineA2C1';

  beforeEach(function () {
    LearningContentMock.mockCommon();
    areaPixA1Data = LearningContentMock.getAreaDTO(areaPixA1Id);
    areaCuisineA2Data = LearningContentMock.getAreaDTO(areaCuisineA2Id);
    competencePixA1C1Data = LearningContentMock.getCompetenceDTO(competencePixA1C1Id);
    competenceCuisineA2C1Data = LearningContentMock.getCompetenceDTO(competenceCuisineA2C1Id);
  });

  describe('#list', function () {
    it('should return all areas without fetching competences with default language fr', async function () {
      // when
      const areas = await areaRepository.list();

      // then
      const expectedArea1 = domainBuilder.buildArea({
        id: areaPixA1Id,
        code: areaPixA1Data.code,
        title: areaPixA1Data.titleFr,
        name: areaPixA1Data.name,
        color: areaPixA1Data.color,
        competences: [],
        frameworkId: areaPixA1Data.frameworkId,
      });
      const expectedArea2 = domainBuilder.buildArea({
        id: areaCuisineA2Id,
        code: areaCuisineA2Data.code,
        title: areaCuisineA2Data.titleFr,
        name: areaCuisineA2Data.name,
        color: areaCuisineA2Data.color,
        competences: [],
        frameworkId: areaCuisineA2Data.frameworkId,
      });
      expect(areas).to.deepEqualArray([expectedArea1, expectedArea2]);
    });

    context('when locale is "en"', function () {
      it('should return all areas with english title', async function () {
        // given
        const locale = 'en';

        // when
        const areas = await areaRepository.list({ locale });

        // then
        const expectedArea1 = domainBuilder.buildArea({
          id: areaPixA1Id,
          code: areaPixA1Data.code,
          title: areaPixA1Data.titleEn,
          name: areaPixA1Data.name,
          color: areaPixA1Data.color,
          competences: [],
          frameworkId: areaPixA1Data.frameworkId,
        });
        const expectedArea2 = domainBuilder.buildArea({
          id: areaCuisineA2Id,
          code: areaCuisineA2Data.code,
          title: areaCuisineA2Data.titleEn,
          name: areaCuisineA2Data.name,
          color: areaCuisineA2Data.color,
          competences: [],
          frameworkId: areaCuisineA2Data.frameworkId,
        });
        expect(areas).to.deepEqualArray([expectedArea1, expectedArea2]);
      });
    });
  });

  describe('#listWithPixCompetencesOnly', function () {
    it('should return the areas with only pix competences in it', async function () {
      // when
      const areas = await areaRepository.listWithPixCompetencesOnly();

      // then
      const expectedCompetence = domainBuilder.buildCompetence({
        id: competencePixA1C1Id,
        name: competencePixA1C1Data.nameFr,
        index: competencePixA1C1Data.index,
        description: competencePixA1C1Data.descriptionFr,
        area: null,
        skillIds: competencePixA1C1Data.skillIds,
        thematicIds: competencePixA1C1Data.thematicIds,
        tubes: [],
        origin: competencePixA1C1Data.origin,
      });
      const expectedArea = domainBuilder.buildArea({
        id: areaPixA1Id,
        code: areaPixA1Data.code,
        title: areaPixA1Data.titleFr,
        name: areaPixA1Data.name,
        color: areaPixA1Data.color,
        competences: [],
        frameworkId: areaPixA1Data.frameworkId,
      });
      expect(areas).to.have.length(1);
      expect(areas[0]).to.deepEqualInstanceOmitting(expectedArea, ['competences']);
      expect(areas[0].competences).to.have.length(1);
      expect(areas[0].competences[0]).to.deepEqualInstanceOmitting(expectedCompetence, ['area']);
    });
  });

  describe('#findByFrameworkIdWithCompetences', function () {
    it('should return a list of areas from the proper framework', async function () {
      // when
      const areas = await areaRepository.findByFrameworkIdWithCompetences({ frameworkId: 'frameworkCuisine' });

      // then
      const expectedCompetence = domainBuilder.buildCompetence({
        id: competenceCuisineA2C1Id,
        name: competenceCuisineA2C1Data.nameFr,
        index: competenceCuisineA2C1Data.index,
        description: competenceCuisineA2C1Data.descriptionFr,
        area: null,
        skillIds: competenceCuisineA2C1Data.skillIds,
        thematicIds: competenceCuisineA2C1Data.thematicIds,
        tubes: [],
        origin: competenceCuisineA2C1Data.origin,
      });
      const expectedArea = domainBuilder.buildArea({
        id: areaCuisineA2Id,
        code: areaCuisineA2Data.code,
        title: areaCuisineA2Data.titleFr,
        name: areaCuisineA2Data.name,
        color: areaCuisineA2Data.color,
        competences: [],
        frameworkId: areaCuisineA2Data.frameworkId,
        framework: null,
      });
      expect(areas).to.have.length(1);
      expect(areas[0]).to.deepEqualInstanceOmitting(expectedArea, ['competences']);
      expect(areas[0].competences).to.have.length(1);
      expect(areas[0].competences[0]).to.deepEqualInstanceOmitting(expectedCompetence, ['area']);
    });

    it('should return a list of areas in english', async function () {
      // when
      const areas = await areaRepository.findByFrameworkIdWithCompetences({
        frameworkId: 'frameworkCuisine',
        locale: 'en',
      });

      // then
      const expectedCompetence = domainBuilder.buildCompetence({
        id: competenceCuisineA2C1Id,
        name: competenceCuisineA2C1Data.nameEn,
        index: competenceCuisineA2C1Data.index,
        description: competenceCuisineA2C1Data.descriptionEn,
        area: null,
        skillIds: competenceCuisineA2C1Data.skillIds,
        thematicIds: competenceCuisineA2C1Data.thematicIds,
        tubes: [],
        origin: competenceCuisineA2C1Data.origin,
      });
      const expectedArea = domainBuilder.buildArea({
        id: areaCuisineA2Id,
        code: areaCuisineA2Data.code,
        title: areaCuisineA2Data.titleEn,
        name: areaCuisineA2Data.name,
        color: areaCuisineA2Data.color,
        competences: [],
        frameworkId: areaCuisineA2Data.frameworkId,
      });
      expect(areas).to.have.length(1);
      expect(areas[0]).to.deepEqualInstanceOmitting(expectedArea, ['competences']);
      expect(areas[0].competences).to.have.length(1);
      expect(areas[0].competences[0]).to.deepEqualInstanceOmitting(expectedCompetence, ['area']);
    });
  });

  describe('#findByRecordIds', function () {
    it('should return a list of areas', async function () {
      // when
      const areas = await areaRepository.findByRecordIds({ areaIds: ['areaCuisineA2', 'areaPixA1'] });

      // then
      const expectedArea1 = domainBuilder.buildArea({
        id: areaPixA1Id,
        code: areaPixA1Data.code,
        title: areaPixA1Data.titleFr,
        name: areaPixA1Data.name,
        color: areaPixA1Data.color,
        competences: [],
        frameworkId: areaPixA1Data.frameworkId,
      });
      const expectedArea2 = domainBuilder.buildArea({
        id: areaCuisineA2Id,
        code: areaCuisineA2Data.code,
        title: areaCuisineA2Data.titleFr,
        name: areaCuisineA2Data.name,
        color: areaCuisineA2Data.color,
        competences: [],
        frameworkId: areaCuisineA2Data.frameworkId,
      });
      expect(areas).to.deepEqualArray([expectedArea1, expectedArea2]);
    });

    it('should return a list of english areas', async function () {
      // when
      const areas = await areaRepository.findByRecordIds({ areaIds: ['areaCuisineA2'], locale: 'en' });

      // then
      const expectedArea = domainBuilder.buildArea({
        id: areaCuisineA2Id,
        code: areaCuisineA2Data.code,
        title: areaCuisineA2Data.titleEn,
        name: areaCuisineA2Data.name,
        color: areaCuisineA2Data.color,
        competences: [],
        frameworkId: areaCuisineA2Data.frameworkId,
        framework: null,
      });
      expect(areas).to.deepEqualArray([expectedArea]);
    });
  });
});
