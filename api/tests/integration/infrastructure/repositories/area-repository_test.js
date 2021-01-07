const _ = require('lodash');
const { expect, mockLearningContent } = require('../../../test-helper');
const Area = require('../../../../lib/domain/models/Area');
const areaRepository = require('../../../../lib/infrastructure/repositories/area-repository');

describe('Integration | Repository | area-repository', () => {

  describe('#list', () => {
    const area0 = {
      id: 'recArea0',
      code: 'area0code',
      name: 'area0name',
      titleFrFr: 'area0titleFr',
      titleEn: 'area0titleEn',
      color: 'area0color',
      competenceIds: ['recCompetence0'],
    };
    const area1 = {
      id: 'recArea1',
      code: 'area1code',
      name: 'area1name',
      titleFrFr: 'area1titleFr',
      titleEn: 'area1titleEn',
      color: 'area1color',
      competenceIds: [],
    };

    const learningContent = { areas: [area0, area1] };

    beforeEach(() => {
      mockLearningContent(learningContent);
    });

    it('should return all areas without fetching competences', async () => {
      // when
      const areas = await areaRepository.list();

      // then
      expect(areas).to.have.lengthOf(2);
      expect(areas[0]).to.be.instanceof(Area);
      expect(areas).to.deep.include.members([
        { id: area0.id, code: area0.code, name: area0.name, title: area0.titleFrFr, color: area0.color, competences: [] },
        { id: area1.id, code: area1.code, name: area1.name, title: area1.titleFrFr, color: area1.color, competences: [] },
      ]);
    });
  });

  describe('#listWithPixCompetencesOnly', () => {

    context('when there are areas that do not have pix competences', () => {
      const learningContent = {
        areas: [{
          id: 'recArea0',
          code: 'area0code',
          name: 'area0name',
          titleFrFr: 'area0titleFr',
          titleEn: 'area0titleEn',
          color: 'area0color',
          competenceIds: ['recCompetence0'],
        }],
        competences: [{ id: 'recCompetence0', origin: 'NotPix' }],
      };

      beforeEach(() => {
        mockLearningContent(learningContent);
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
        titleFrFr: 'area0titleFr',
        titleEn: 'area0titleEn',
        color: 'area0color',
        competenceIds: ['recCompetence0', 'recCompetence1'],
      };

      const area1 = {
        id: 'recArea1',
        code: 'area1code',
        name: 'area1name',
        titleFrFr: 'area1titleFr',
        titleEn: 'area1titleEn',
        color: 'area1color',
        competenceIds: ['recCompetence2', 'recCompetence3'],
      };

      const learningContent = {
        areas: [area0, area1],
        competences: [
          { id: 'recCompetence0', origin: 'NotPix', areaId: 'recArea0' },
          { id: 'recCompetence1', origin: 'Pix', areaId: 'recArea0' },
          { id: 'recCompetence2', origin: 'NotPix', areaId: 'recArea1' },
          { id: 'recCompetence3', origin: 'Pix', areaId: 'recArea1' },
        ],
      };

      beforeEach(() => {
        mockLearningContent(learningContent);
      });

      it('should return the areas with only pix competences in it', async () => {
        // when
        const areas = await areaRepository.listWithPixCompetencesOnly();

        // then
        expect(areas).to.have.lengthOf(2);
        expect(areas[0]).to.be.instanceof(Area);
        expect(_.omit(areas[0], 'competences')).to.deep.equal(
          { id: area0.id, code: area0.code, name: area0.name, title: area0.titleFrFr, color: area0.color },
        );
        expect(areas[0].competences).to.have.lengthOf(1);
        expect(areas[0].competences[0].id).to.equal('recCompetence1');
        expect(_.omit(areas[1], 'competences')).to.deep.equal(
          { id: area1.id, code: area1.code, name: area1.name, title: area1.titleFrFr, color: area1.color },
        );
        expect(areas[1].competences).to.have.lengthOf(1);
        expect(areas[1].competences[0].id).to.equal('recCompetence3');
      });
    });
  });

});
