const _ = require('lodash');
const { expect, airtableBuilder } = require('../../../test-helper');
const cache = require('../../../../lib/infrastructure/caches/learning-content-cache');
const Area = require('../../../../lib/domain/models/Area');
const areaRepository = require('../../../../lib/infrastructure/repositories/area-repository');

describe('Integration | Repository | area-repository', () => {

  afterEach(() => {
    airtableBuilder.cleanAll();
    return cache.flushAll();
  });

  describe('#list', () => {
    const area0 = {
      id: 'recArea0',
      code: 'area0code',
      name: 'area0name',
      titleFr: 'area0titleFr',
      titleEn: 'area0titleEn',
      color: 'area0color',
      competences: [{ id: 'recCompetence0', tubes: [] }],
    };
    const area1 = {
      id: 'recArea1',
      code: 'area1code',
      name: 'area1name',
      titleFr: 'area1titleFr',
      titleEn: 'area1titleEn',
      color: 'area1color',
      competences: [],
    };

    const learningContent = [area0, area1];

    beforeEach(() => {
      const airTableObjects = airtableBuilder.factory.buildLearningContent(learningContent);
      airtableBuilder.mockLists(airTableObjects);
    });

    it('should return all areas without fetching competences', async () => {
      // when
      const areas = await areaRepository.list();

      // then
      expect(areas).to.have.lengthOf(2);
      expect(areas[0]).to.be.instanceof(Area);
      expect(areas).to.deep.include.members([
        { id: area0.id, code: area0.code, name: area0.name, title: area0.titleFr, color: area0.color, competences: [] },
        { id: area1.id, code: area1.code, name: area1.name, title: area1.titleFr, color: area1.color, competences: [] },
      ]);
    });
  });

  describe('#listWithPixCompetencesOnly', () => {

    context('when there are areas that do not have pix competences', () => {
      const area0 = {
        id: 'recArea0',
        code: 'area0code',
        name: 'area0name',
        titleFr: 'area0titleFr',
        titleEn: 'area0titleEn',
        color: 'area0color',
        competences: [{ id: 'recCompetence0', origin: 'NotPix', tubes: [] }],
      };

      const learningContent = [area0];

      beforeEach(() => {
        const airTableObjects = airtableBuilder.factory.buildLearningContent(learningContent);
        airtableBuilder.mockLists(airTableObjects);
      });

      it('should ignore the area', async () => {
        // when
        const areas = await areaRepository.listWithPixCompetencesOnly();

        // then
        expect(areas).to.be.empty;
      });
    });

    context('when there are areas that have pix competences', () => {
      const area0 = {
        id: 'recArea0',
        code: 'area0code',
        name: 'area0name',
        titleFr: 'area0titleFr',
        titleEn: 'area0titleEn',
        color: 'area0color',
        competences: [
          { id: 'recCompetence0', origin: 'NotPix', tubes: [] },
          { id: 'recCompetence1', origin: 'Pix', tubes: [] },
        ],
      };

      const area1 = {
        id: 'recArea1',
        code: 'area1code',
        name: 'area1name',
        titleFr: 'area1titleFr',
        titleEn: 'area1titleEn',
        color: 'area1color',
        competences: [
          { id: 'recCompetence2', origin: 'NotPix', tubes: [] },
          { id: 'recCompetence3', origin: 'Pix', tubes: [] },
        ],
      };

      const learningContent = [area0, area1];

      beforeEach(() => {
        const airTableObjects = airtableBuilder.factory.buildLearningContent(learningContent);
        airtableBuilder.mockLists(airTableObjects);
      });

      it('should return the areas with only pix competences in it', async () => {
        // when
        const areas = await areaRepository.listWithPixCompetencesOnly();

        // then
        expect(areas).to.have.lengthOf(2);
        expect(areas[0]).to.be.instanceof(Area);
        expect(_.omit(areas[0], 'competences')).to.deep.equal(
          { id: area0.id, code: area0.code, name: area0.name, title: area0.titleFr, color: area0.color },
        );
        expect(areas[0].competences).to.have.lengthOf(1);
        expect(areas[0].competences[0].id).to.equal('recCompetence1');
        expect(_.omit(areas[1], 'competences')).to.deep.equal(
          { id: area1.id, code: area1.code, name: area1.name, title: area1.titleFr, color: area1.color },
        );
        expect(areas[1].competences).to.have.lengthOf(1);
        expect(areas[1].competences[0].id).to.equal('recCompetence3');
      });
    });
  });

});
