const _ = require('lodash');
const { expect, domainBuilder, mockLearningContent, catchErr } = require('../../../test-helper');
const Area = require('../../../../lib/domain/models/Area');
const areaRepository = require('../../../../lib/infrastructure/repositories/area-repository');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Integration | Repository | area-repository', function () {
  describe('#list', function () {
    const area0 = {
      id: 'recArea0',
      code: 'area0code',
      name: 'area0name',
      title_i18n: {
        fr: 'area0titleFr',
        en: 'area0titleEn,',
      },
      color: 'area0color',
      frameworkId: 'recFmk123',
      competenceIds: ['recCompetence0'],
    };
    const area1 = {
      id: 'recArea1',
      code: 'area1code',
      name: 'area1name',
      title_i18n: {
        fr: 'area1titleFr',
        en: 'area1titleEn,',
      },
      color: 'area1color',
      frameworkId: 'recFmk456',
      competenceIds: [],
    };

    const learningContent = { areas: [area0, area1] };

    beforeEach(function () {
      mockLearningContent(learningContent);
    });

    it('should return all areas without fetching competences', async function () {
      // when
      const areas = await areaRepository.list();

      // then
      expect(areas).to.have.lengthOf(2);
      expect(areas[0]).to.be.instanceof(Area);
      expect(areas).to.deep.include.members([
        {
          id: area0.id,
          code: area0.code,
          name: area0.name,
          title: area0.title_i18n.fr,
          color: area0.color,
          frameworkId: area0.frameworkId,
          competences: [],
        },
        {
          id: area1.id,
          code: area1.code,
          name: area1.name,
          title: area1.title_i18n.fr,
          color: area1.color,
          frameworkId: area1.frameworkId,
          competences: [],
        },
      ]);
    });

    describe('when locale is "en"', function () {
      it('should return all areas with english title', async function () {
        // given
        const locale = 'en';
        // when
        const areas = await areaRepository.list({ locale });

        // then
        expect(areas[0].title).to.equal(area0.title_i18n.en);
        expect(areas[1].title).to.equal(area1.title_i18n.en);
      });
    });

    describe('when locale is not "en"', function () {
      it('should return all areas with french title', async function () {
        // given
        const locale = 'fr';

        // when
        const areas = await areaRepository.list({ locale });

        // then
        expect(areas[0].title).to.equal(area0.title_i18n.fr);
        expect(areas[1].title).to.equal(area1.title_i18n.fr);
      });
    });
  });

  describe('#listWithPixCompetencesOnly', function () {
    context('when there are areas that do not have pix competences', function () {
      const learningContent = {
        areas: [
          {
            id: 'recArea0',
            code: 'area0code',
            name: 'area0name',
            title_i18n: {
              fr: 'area0titleFr',
              en: 'area0titleEn',
            },
            color: 'area0color',
            frameworkId: 'recFmk123',
            competenceIds: ['recCompetence0'],
          },
        ],
        competences: [{ id: 'recCompetence0', origin: 'NotPix' }],
      };

      beforeEach(function () {
        mockLearningContent(learningContent);
      });

      it('should ignore the area', async function () {
        // when
        const areas = await areaRepository.listWithPixCompetencesOnly();

        // then
        expect(areas).to.be.empty;
      });
    });

    context('when there are areas that have pix competences', function () {
      const area0 = {
        id: 'recArea0',
        code: 'area0code',
        name: 'area0name',
        title_i18n: {
          fr: 'area0titleFr',
          en: 'area0titleEn',
        },
        color: 'area0color',
        frameworkId: 'recFmk123',
        competenceIds: ['recCompetence0', 'recCompetence1'],
      };

      const area1 = {
        id: 'recArea1',
        code: 'area1code',
        name: 'area1name',
        title_i18n: {
          fr: 'area1titleFr',
          en: 'area1titleEn',
        },
        color: 'area1color',
        frameworkId: 'recFmk456',
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

      beforeEach(function () {
        mockLearningContent(learningContent);
      });

      it('should return the areas with only pix competences in it', async function () {
        // when
        const areas = await areaRepository.listWithPixCompetencesOnly();

        // then
        expect(areas).to.have.lengthOf(2);
        expect(areas[0]).to.be.instanceof(Area);
        expect(_.omit(areas[0], 'competences')).to.deep.equal({
          id: area0.id,
          code: area0.code,
          name: area0.name,
          title: area0.title_i18n.fr,
          color: area0.color,
          frameworkId: area0.frameworkId,
        });
        expect(areas[0].competences).to.have.lengthOf(1);
        expect(areas[0].competences[0].id).to.equal('recCompetence1');
        expect(_.omit(areas[1], 'competences')).to.deep.equal({
          id: area1.id,
          code: area1.code,
          name: area1.name,
          title: area1.title_i18n.fr,
          color: area1.color,
          frameworkId: area1.frameworkId,
        });
        expect(areas[1].competences).to.have.lengthOf(1);
        expect(areas[1].competences[0].id).to.equal('recCompetence3');
      });
    });
  });

  describe('#findByFrameworkIdWithCompetences', function () {
    const area0 = {
      id: 'recArea0',
      code: 'area0code',
      name: 'area0name',
      title_i18n: {
        fr: 'area0titleFr',
        en: 'area0titleEn',
      },
      color: 'area0color',
      frameworkId: 'framework1',
      competenceIds: ['recCompetence0', 'recCompetence1'],
    };

    const area1 = {
      id: 'recArea1',
      code: 'area1code',
      name: 'area1name',
      title_i18n: {
        fr: 'area1titleFr',
        en: 'area1titleEn',
      },
      color: 'area1color',
      frameworkId: 'framework2',
      competenceIds: ['recCompetence2', 'recCompetence3'],
    };

    const learningContent = {
      areas: [area0, area1],
      competences: [
        {
          id: 'recCompetence0',
          areaId: 'recArea0',
          name_i18n: {
            fr: 'competence0NameFr',
            en: 'competence0NameEn',
          },
          description_i18n: {
            fr: 'competence0DescriptionFr',
            en: 'competence0DescriptionEn',
          },
        },
        {
          id: 'recCompetence1',
          areaId: 'recArea0',
          name_i18n: {
            fr: 'competence1NameFr',
            en: 'competence1NameEn',
          },
          description_i18n: {
            fr: 'competence1DescriptionFr',
            en: 'competence1DescriptionEn',
          },
        },
        {
          id: 'recCompetence2',
          areaId: 'recArea1',
          name_i18n: {
            fr: 'competence2NameFr',
            en: 'competence2NameEn',
          },
          description_i18n: {
            fr: 'competence2DescriptionFr',
            en: 'competence2DescriptionEn',
          },
        },
        {
          id: 'recCompetence3',
          areaId: 'recArea1',
          name_i18n: {
            fr: 'competence3NameFr',
            en: 'competence3NameEn',
          },
          description_i18n: {
            fr: 'competence3DescriptionFr',
            en: 'competence3DescriptionEn',
          },
        },
      ],
    };
    beforeEach(function () {
      mockLearningContent(learningContent);
    });

    it('should return a list of areas from the proper framework', async function () {
      // when
      const areas = await areaRepository.findByFrameworkIdWithCompetences({ frameworkId: 'framework1' });

      // then
      expect(areas).to.have.lengthOf(1);
      expect(areas[0]).to.be.instanceof(Area);
      expect(_.omit(areas[0], 'competences')).to.deep.equal({
        id: area0.id,
        code: area0.code,
        name: area0.name,
        title: area0.title_i18n.fr,
        color: area0.color,
        frameworkId: area0.frameworkId,
      });
      expect(areas[0].competences).to.have.lengthOf(2);
      expect(areas[0].competences[0].id).to.equal('recCompetence0');
      expect(areas[0].competences[0].name).to.equal('competence0NameFr');
      expect(areas[0].competences[0].description).to.equal('competence0DescriptionFr');
      expect(areas[0].competences[1].id).to.equal('recCompetence1');
      expect(areas[0].competences[1].name).to.equal('competence1NameFr');
      expect(areas[0].competences[1].description).to.equal('competence1DescriptionFr');
    });

    it('should return a list of areas in english', async function () {
      // when
      const areas = await areaRepository.findByFrameworkIdWithCompetences({ frameworkId: 'framework1', locale: 'en' });

      // then
      expect(areas).to.have.lengthOf(1);
      expect(areas[0]).to.be.instanceof(Area);
      expect(_.omit(areas[0], 'competences')).to.deep.equal({
        id: area0.id,
        code: area0.code,
        name: area0.name,
        title: area0.title_i18n.en,
        color: area0.color,
        frameworkId: area0.frameworkId,
      });
      expect(areas[0].competences).to.have.lengthOf(2);
      expect(areas[0].competences[0].id).to.equal('recCompetence0');
      expect(areas[0].competences[0].name).to.equal('competence0NameEn');
      expect(areas[0].competences[0].description).to.equal('competence0DescriptionEn');
      expect(areas[0].competences[1].id).to.equal('recCompetence1');
      expect(areas[0].competences[1].name).to.equal('competence1NameEn');
      expect(areas[0].competences[1].description).to.equal('competence1DescriptionEn');
    });
  });

  describe('#findByRecordIds', function () {
    it('should return a list of areas', async function () {
      // given
      const area1 = domainBuilder.buildArea({
        id: 'recArea1',
        code: 4,
        name: 'area_name1',
        title: 'area_title1FR',
        color: 'blue1',
        frameworkId: 'recFwkId1',
      });
      const area2 = domainBuilder.buildArea({
        id: 'recArea2',
        code: 6,
        name: 'area_name2',
        title: 'area_title2FR',
        color: 'blue2',
        frameworkId: 'recFwkId2',
      });

      const learningContentArea0 = {
        id: 'recArea0',
        code: 1,
        name: 'area_name0',
        title_i18n: {
          fr: 'area_title0FR',
          en: 'area_title0EN',
        },
        color: 'blue0',
        frameworkId: 'recFwkId0',
      };

      const learningContentArea1 = {
        id: 'recArea1',
        code: 4,
        name: 'area_name1',
        title_i18n: {
          fr: 'area_title1FR',
          en: 'area_title1EN',
        },
        color: 'blue1',
        frameworkId: 'recFwkId1',
      };

      const learningContentArea2 = {
        id: 'recArea2',
        code: 6,
        name: 'area_name2',
        title_i18n: {
          fr: 'area_title2FR',
          en: 'area_title2EN',
        },
        color: 'blue2',
        frameworkId: 'recFwkId2',
      };

      mockLearningContent({ areas: [learningContentArea0, learningContentArea1, learningContentArea2] });

      // when
      const areas = await areaRepository.findByRecordIds({ areaIds: ['recArea1', 'recArea2'] });

      // then
      expect(areas).to.deepEqualArray([area1, area2]);
    });

    it('should return a list of english areas', async function () {
      // given
      const area1 = domainBuilder.buildArea({
        id: 'recArea1',
        code: 4,
        name: 'area_name1',
        title: 'area_title1EN',
        color: 'blue1',
        frameworkId: 'recFwkId1',
      });
      const area2 = domainBuilder.buildArea({
        id: 'recArea2',
        code: 6,
        name: 'area_name2',
        title: 'area_title2EN',
        color: 'blue2',
        frameworkId: 'recFwkId2',
      });

      const learningContentArea0 = {
        id: 'recArea0',
        code: 1,
        name: 'area_name0',
        title_i18n: {
          fr: 'area_title0FR',
          en: 'area_title0EN',
        },
        color: 'blue0',
        frameworkId: 'recFwkId0',
      };

      const learningContentArea1 = {
        id: 'recArea1',
        code: 4,
        name: 'area_name1',
        title_i18n: {
          fr: 'area_title1FR',
          en: 'area_title1EN',
        },
        color: 'blue1',
        frameworkId: 'recFwkId1',
      };

      const learningContentArea2 = {
        id: 'recArea2',
        code: 6,
        name: 'area_name2',
        title_i18n: {
          fr: 'area_title2FR',
          en: 'area_title2EN',
        },
        color: 'blue2',
        frameworkId: 'recFwkId2',
      };

      mockLearningContent({ areas: [learningContentArea0, learningContentArea1, learningContentArea2] });

      // when
      const areas = await areaRepository.findByRecordIds({ areaIds: ['recArea1', 'recArea2'], locale: 'en' });

      // then
      expect(areas).to.deepEqualArray([area1, area2]);
    });
  });

  describe('#get', function () {
    beforeEach(function () {
      const learningContentArea0 = {
        id: 'recArea0',
        code: 1,
        name: 'area_name0',
        title_i18n: {
          fr: 'area_title0FR',
          en: 'area_title0EN',
        },
        color: 'blue0',
        frameworkId: 'recFwkId0',
      };
      const learningContentArea1 = {
        id: 'recArea1',
        code: 4,
        name: 'area_name1',
        title_i18n: {
          fr: 'area_title1FR',
          en: 'area_title1EN',
        },
        color: 'blue1',
        frameworkId: 'recFwkId1',
      };
      mockLearningContent({ areas: [learningContentArea0, learningContentArea1] });
    });

    it('should return the area', async function () {
      // when
      const area = await areaRepository.get({ id: 'recArea1' });

      // then
      const expectedArea = domainBuilder.buildArea({
        id: 'recArea1',
        code: 4,
        name: 'area_name1',
        title: 'area_title1FR',
        color: 'blue1',
        frameworkId: 'recFwkId1',
      });
      expect(area).to.deepEqualInstance(expectedArea);
    });

    it('should throw a NotFound error', async function () {
      // when
      const error = await catchErr(areaRepository.get)({ id: 'jexistepas' });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal('Area "jexistepas" not found.');
    });
  });

  describe('#findByFrameworkId', function () {
    beforeEach(function () {
      const area0 = {
        id: 'recArea0',
        code: 'area0code',
        name: 'area0name',
        title_i18n: {
          fr: 'area0titleFr',
          en: 'area0titleEn',
        },
        color: 'area0color',
        frameworkId: 'framework1',
      };
      const area1 = {
        id: 'recArea1',
        code: 'area1code',
        name: 'area1name',
        title_i18n: {
          fr: 'area1titleFr',
          en: 'area1titleEn',
        },
        color: 'area1color',
        frameworkId: 'framework2',
      };
      const area2 = {
        id: 'recArea2',
        code: 'area2code',
        name: 'area2name',
        title_i18n: {
          fr: 'area2titleFr',
          en: 'area2titleEn',
        },
        color: 'area2color',
        frameworkId: 'framework1',
      };
      const learningContent = {
        areas: [area0, area1, area2],
      };
      mockLearningContent(learningContent);
    });

    it('should return a list of areas from the proper framework', async function () {
      // when
      const areas = await areaRepository.findByFrameworkId({ frameworkId: 'framework1' });

      // then
      const area0 = domainBuilder.buildArea({
        id: 'recArea0',
        code: 'area0code',
        name: 'area0name',
        title: 'area0titleFr',
        color: 'area0color',
        frameworkId: 'framework1',
      });
      const area2 = domainBuilder.buildArea({
        id: 'recArea2',
        code: 'area2code',
        name: 'area2name',
        title: 'area2titleFr',
        color: 'area2color',
        frameworkId: 'framework1',
      });
      expect(areas).to.deepEqualArray([area0, area2]);
    });

    it('should return a list of areas in english', async function () {
      // when
      const areas = await areaRepository.findByFrameworkId({ frameworkId: 'framework1', locale: 'en' });

      // then
      const area0 = domainBuilder.buildArea({
        id: 'recArea0',
        code: 'area0code',
        name: 'area0name',
        title: 'area0titleEn',
        color: 'area0color',
        frameworkId: 'framework1',
      });
      const area2 = domainBuilder.buildArea({
        id: 'recArea2',
        code: 'area2code',
        name: 'area2name',
        title: 'area2titleEn',
        color: 'area2color',
        frameworkId: 'framework1',
      });
      expect(areas).to.deepEqualArray([area0, area2]);
    });
  });
});
