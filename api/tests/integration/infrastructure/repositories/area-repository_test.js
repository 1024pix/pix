import { config } from '../../../../src/shared/config.js';
import { PIX_ORIGIN } from '../../../../src/shared/domain/constants.js';
import { NotFoundError } from '../../../../src/shared/domain/errors.js';
import * as areaRepository from '../../../../src/shared/infrastructure/repositories/area-repository.js';
import { catchErr, domainBuilder, expect, mockLearningContent } from '../../../test-helper.js';

describe('Integration | Repository | area-repository', function () {
  const areaData0 = {
    id: 'recArea0',
    code: 'area0code',
    name: 'area0name',
    title_i18n: {
      fr: 'area0titleFr',
      en: 'area0titleEn',
    },
    color: 'area0color',
    frameworkId: 'recFmk123',
    competenceIds: ['recCompetence1_pix', 'recCompetence4_pix'],
  };
  const areaData1 = {
    id: 'recArea1',
    code: 'area1code',
    name: 'area1name',
    title_i18n: {
      fr: 'area1titleFr',
      nl: 'area1titleNl',
    },
    color: 'area1color',
    frameworkId: 'recFmk456',
    competenceIds: ['recCompetence2_pasPix'],
  };
  const areaData2 = {
    id: 'recArea2',
    code: 'area2code',
    name: 'area2name',
    title_i18n: {
      fr: 'area2titleFr',
      nl: 'area2titleNl',
    },
    color: 'area2color',
    frameworkId: 'recFmk123',
    competenceIds: ['recCompetence3_pix'],
  };
  const competenceData1 = {
    id: 'recCompetence1_pix',
    name_i18n: { fr: 'name FR recCompetence1_pix', en: 'name EN recCompetence1_pix' },
    description_i18n: { fr: 'description FR recCompetence1_pix', nl: 'description NL recCompetence1_pix' },
    index: 'index recCompetence1_pix',
    areaId: 'recArea0',
    origin: PIX_ORIGIN,
    skillIds: ['skillIdA'],
    thematicIds: ['thematicIdA'],
  };
  const competenceData2 = {
    id: 'recCompetence2_pasPix',
    name_i18n: { fr: 'name FR recCompetence2_pasPix', en: 'name EN recCompetence2_pasPix' },
    description_i18n: { fr: 'description FR recCompetence2_pasPix', en: 'description EN recCompetence2_pasPix' },
    index: 'index recCompetence2_pasPix',
    areaId: 'recArea1',
    origin: 'PasPix',
    skillIds: ['skillIdB'],
    thematicIds: ['thematicIdB'],
  };
  const competenceData3 = {
    id: 'recCompetence3_pix',
    name_i18n: { fr: 'name FR recCompetence3_pix', nl: 'name NL recCompetence3_pix' },
    description_i18n: { fr: 'description FR recCompetence3_pix', en: 'description EN recCompetence3_pix' },
    index: 'index recCompetence3_pix',
    areaId: 'recArea2',
    origin: PIX_ORIGIN,
    skillIds: ['skillIdC'],
    thematicIds: ['thematicIdC'],
  };
  const competenceData4 = {
    id: 'recCompetence4_pix',
    name_i18n: { fr: 'name FR recCompetence4_pix', en: 'name EN recCompetence4_pix' },
    description_i18n: { fr: 'description FR recCompetence4_pix', en: 'description EN recCompetence4_pix' },
    index: 'index recCompetence4_pix',
    areaId: 'recArea0',
    origin: PIX_ORIGIN,
    skillIds: ['skillIdD'],
    thematicIds: ['thematicIdD'],
  };

  // eslint-disable-next-line mocha/no-setup-in-describe
  testAreaRepository();

  describe('when using old learning content', function () {
    beforeEach(function () {
      config.featureToggles.useNewLearningContent = false;
    });

    afterEach(function () {
      config.featureToggles.useNewLearningContent = true;
    });

    testAreaRepository(); // eslint-disable-line mocha/no-setup-in-describe
  });

  function testAreaRepository() {
    describe('#list', function () {
      beforeEach(async function () {
        await mockLearningContent({
          frameworks: [{ id: 'recFmk123', name: PIX_ORIGIN }],
          areas: [areaData1, areaData0, areaData2],
        });
      });

      context('when no locale provided', function () {
        it('should return all areas translated in default locale FR', async function () {
          // when
          const areas = await areaRepository.list();

          // then
          expect(areas).to.deepEqualArray([
            domainBuilder.buildArea({
              ...areaData0,
              title: areaData0.title_i18n.fr,
              competences: [],
            }),
            domainBuilder.buildArea({
              ...areaData1,
              title: areaData1.title_i18n.fr,
              competences: [],
            }),
            domainBuilder.buildArea({
              ...areaData2,
              title: areaData2.title_i18n.fr,
              competences: [],
            }),
          ]);
        });
      });

      context('when a locale is provided', function () {
        it('should return all areas translated in the given locale or with fallback translations', async function () {
          // when
          const areas = await areaRepository.list({ locale: 'en' });

          // then
          expect(areas).to.deepEqualArray([
            domainBuilder.buildArea({
              ...areaData0,
              title: areaData0.title_i18n.en,
              competences: [],
            }),
            domainBuilder.buildArea({
              ...areaData1,
              title: areaData1.title_i18n.fr,
              competences: [],
            }),
            domainBuilder.buildArea({
              ...areaData2,
              title: areaData2.title_i18n.fr,
              competences: [],
            }),
          ]);
        });
      });
    });

    describe('#getAreaCodeByCompetenceId', function () {
      beforeEach(async function () {
        await mockLearningContent({
          areas: [areaData1, areaData0, areaData2],
        });
      });

      context('when competenceId refers to an existing Area', function () {
        it('should return the code of the corresponding area', async function () {
          // when
          const result = await areaRepository.getAreaCodeByCompetenceId('recCompetence1_pix');

          // then
          expect(result).to.deep.equal(areaData0.code);
        });
      });

      context('when competenceId is not referenced in any area', function () {
        it('should return undefined', async function () {
          // when
          const result = await areaRepository.getAreaCodeByCompetenceId('competenceId_66');

          // then
          expect(result).to.be.undefined;
        });
      });
    });

    describe('#listWithPixCompetencesOnly', function () {
      context('when there are some area that have pix competences', function () {
        beforeEach(async function () {
          await mockLearningContent({
            frameworks: [{ id: 'recFmk123', name: PIX_ORIGIN }],
            areas: [areaData1, areaData0, areaData2],
            competences: [competenceData1, competenceData2, competenceData3, competenceData4],
          });
        });
        context('when a locale is provided', function () {
          it('should return only areas with pix competences with entities translated in given locale when possible or fallback to default locale FR', async function () {
            // when
            const areas = await areaRepository.listWithPixCompetencesOnly({ locale: 'en' });

            // then
            expect(areas).to.deepEqualArray([
              domainBuilder.buildArea({
                ...areaData0,
                title: areaData0.title_i18n.en,
                competences: [
                  domainBuilder.buildCompetence({
                    ...competenceData1,
                    name: competenceData1.name_i18n.en,
                    description: competenceData1.description_i18n.fr,
                  }),
                  domainBuilder.buildCompetence({
                    ...competenceData4,
                    name: competenceData4.name_i18n.en,
                    description: competenceData4.description_i18n.en,
                  }),
                ],
              }),
              domainBuilder.buildArea({
                ...areaData2,
                title: areaData2.title_i18n.fr,
                competences: [
                  domainBuilder.buildCompetence({
                    ...competenceData3,
                    name: competenceData3.name_i18n.fr,
                    description: competenceData3.description_i18n.en,
                  }),
                ],
              }),
            ]);
          });
        });
        context('when no locale is provided', function () {
          it('should return only areas with pix competences with entities translated in default locale FR', async function () {
            // when
            const areas = await areaRepository.listWithPixCompetencesOnly();

            // then
            expect(areas).to.deepEqualArray([
              domainBuilder.buildArea({
                ...areaData0,
                title: areaData0.title_i18n.fr,
                competences: [
                  domainBuilder.buildCompetence({
                    ...competenceData1,
                    name: competenceData1.name_i18n.fr,
                    description: competenceData1.description_i18n.fr,
                  }),
                  domainBuilder.buildCompetence({
                    ...competenceData4,
                    name: competenceData4.name_i18n.fr,
                    description: competenceData4.description_i18n.fr,
                  }),
                ],
              }),
              domainBuilder.buildArea({
                ...areaData2,
                title: areaData2.title_i18n.fr,
                competences: [
                  domainBuilder.buildCompetence({
                    ...competenceData3,
                    name: competenceData3.name_i18n.fr,
                    description: competenceData3.description_i18n.fr,
                  }),
                ],
              }),
            ]);
          });
        });
      });
      context('when there are no areas that have pix competences', function () {
        beforeEach(async function () {
          await mockLearningContent({
            areas: [areaData1],
            competences: [competenceData2],
          });
        });

        it('should return an empty array', async function () {
          // when
          const areas = await areaRepository.listWithPixCompetencesOnly();

          // then
          expect(areas).to.deep.equal([]);
        });
      });
    });

    describe('#findByFrameworkIdWithCompetences', function () {
      beforeEach(async function () {
        await mockLearningContent({
          areas: [areaData2, areaData0, areaData1],
          competences: [competenceData1, competenceData2, competenceData3, competenceData4],
        });
      });

      context('when some areas have the given framework id', function () {
        context('when a locale is provided', function () {
          it('should return the areas with competences with all entities translated in given locale or fallback to default locale FR', async function () {
            // when
            const areas = await areaRepository.findByFrameworkIdWithCompetences({
              frameworkId: 'recFmk123',
              locale: 'en',
            });

            // then
            expect(areas).to.deepEqualArray([
              domainBuilder.buildArea({
                ...areaData0,
                title: areaData0.title_i18n.en,
                competences: [
                  domainBuilder.buildCompetence({
                    ...competenceData1,
                    name: competenceData1.name_i18n.en,
                    description: competenceData1.description_i18n.fr,
                  }),
                  domainBuilder.buildCompetence({
                    ...competenceData4,
                    name: competenceData4.name_i18n.en,
                    description: competenceData4.description_i18n.en,
                  }),
                ],
              }),
              domainBuilder.buildArea({
                ...areaData2,
                title: areaData2.title_i18n.fr,
                competences: [
                  domainBuilder.buildCompetence({
                    ...competenceData3,
                    name: competenceData3.name_i18n.fr,
                    description: competenceData3.description_i18n.en,
                  }),
                ],
              }),
            ]);
          });
        });
        context('when no locale is provided', function () {
          it('should return the areas with competences with all entities translated in default locale FR', async function () {
            // when
            const areas = await areaRepository.findByFrameworkIdWithCompetences({ frameworkId: 'recFmk123' });

            // then
            expect(areas).to.deepEqualArray([
              domainBuilder.buildArea({
                ...areaData0,
                title: areaData0.title_i18n.fr,
                competences: [
                  domainBuilder.buildCompetence({
                    ...competenceData1,
                    name: competenceData1.name_i18n.fr,
                    description: competenceData1.description_i18n.fr,
                  }),
                  domainBuilder.buildCompetence({
                    ...competenceData4,
                    name: competenceData4.name_i18n.fr,
                    description: competenceData4.description_i18n.fr,
                  }),
                ],
              }),
              domainBuilder.buildArea({
                ...areaData2,
                title: areaData2.title_i18n.fr,
                competences: [
                  domainBuilder.buildCompetence({
                    ...competenceData3,
                    name: competenceData3.name_i18n.fr,
                    description: competenceData3.description_i18n.fr,
                  }),
                ],
              }),
            ]);
          });
        });
      });
      context('when no areas exist for given framework id', function () {
        it('should return an empty array', async function () {
          // when
          const areas = await areaRepository.findByFrameworkIdWithCompetences({
            frameworkId: 'BLOUBLOU',
          });

          // then
          expect(areas).to.deep.equal([]);
        });
      });
    });

    describe('#findByRecordIds', function () {
      beforeEach(async function () {
        await mockLearningContent({
          areas: [areaData1, areaData2, areaData0],
        });
      });

      context('when areas found by ids', function () {
        context('when no locale provided', function () {
          it('should return all areas found translated in default locale FR given by their ids', async function () {
            // when
            const areas = await areaRepository.findByRecordIds({ areaIds: ['recArea2', 'recArea0'] });

            // then
            expect(areas).to.deepEqualArray([
              domainBuilder.buildArea({
                ...areaData0,
                title: areaData0.title_i18n.fr,
                competences: [],
              }),
              domainBuilder.buildArea({
                ...areaData2,
                title: areaData2.title_i18n.fr,
                competences: [],
              }),
            ]);
          });
        });

        context('when a locale is provided', function () {
          it('should return all areas found translated in provided locale or fallback to default locale FR given by their ids', async function () {
            // when
            const areas = await areaRepository.findByRecordIds({ areaIds: ['recArea2', 'recArea0'], locale: 'en' });

            // then
            expect(areas).to.deepEqualArray([
              domainBuilder.buildArea({
                ...areaData0,
                title: areaData0.title_i18n.en,
                competences: [],
              }),
              domainBuilder.buildArea({
                ...areaData2,
                title: areaData2.title_i18n.fr,
                competences: [],
              }),
            ]);
          });
        });
      });

      context('when no areas found for given ids', function () {
        it('should return an empty array', async function () {
          // when
          const areas = await areaRepository.findByRecordIds({ areaIds: ['recAreaCOUCOU', 'recAreaMAMAN'] });

          // then
          expect(areas).to.deep.equal([]);
        });
      });
    });

    describe('#get', function () {
      beforeEach(async function () {
        await mockLearningContent({
          areas: [areaData1, areaData0],
        });
      });

      context('when area is found', function () {
        context('when a locale is provided', function () {
          it('should return the area translated with the provided locale of fallback to default locale FR', async function () {
            // given
            const area0 = await areaRepository.get({ id: 'recArea0', locale: 'nl' });
            const area1 = await areaRepository.get({ id: 'recArea1', locale: 'nl' });

            // then
            expect(area0).to.deepEqualInstance(
              domainBuilder.buildArea({
                ...areaData0,
                title: areaData0.title_i18n.fr,
                competences: [],
              }),
            );
            expect(area1).to.deepEqualInstance(
              domainBuilder.buildArea({
                ...areaData1,
                title: areaData1.title_i18n.nl,
                competences: [],
              }),
            );
          });
        });
        context('when no locale is provided', function () {
          it('should return the area translated with default locale FR', async function () {
            // when
            const area1 = await areaRepository.get({ id: 'recArea1' });

            // then
            expect(area1).to.deepEqualInstance(
              domainBuilder.buildArea({
                ...areaData1,
                title: areaData1.title_i18n.fr,
                competences: [],
              }),
            );
          });
        });
      });
      context('when no area found', function () {
        it('should throw a NotFound error', async function () {
          // when
          const err = await catchErr(areaRepository.get, areaRepository)({ id: 'recCouCouPapa' });

          // then
          expect(err).to.be.instanceOf(NotFoundError);
          expect(err.message).to.equal('Area "recCouCouPapa" not found.');
        });
      });
    });

    describe('#findByFrameworkId', function () {
      beforeEach(async function () {
        await mockLearningContent({
          areas: [areaData2, areaData0, areaData1],
        });
      });

      context('when some areas have the given framework id', function () {
        context('when a locale is provided', function () {
          it('should return the areas translated in given locale or fallback to default locale FR', async function () {
            // when
            const areas = await areaRepository.findByFrameworkId({
              frameworkId: 'recFmk123',
              locale: 'en',
            });

            // then
            expect(areas).to.deepEqualArray([
              domainBuilder.buildArea({
                ...areaData0,
                title: areaData0.title_i18n.en,
                competences: [],
              }),
              domainBuilder.buildArea({
                ...areaData2,
                title: areaData2.title_i18n.fr,
                competences: [],
              }),
            ]);
          });
        });
        context('when no locale is provided', function () {
          it('should return the areas translated in default locale FR', async function () {
            // when
            const areas = await areaRepository.findByFrameworkId({ frameworkId: 'recFmk123' });

            // then
            expect(areas).to.deepEqualArray([
              domainBuilder.buildArea({
                ...areaData0,
                title: areaData0.title_i18n.fr,
                competences: [],
              }),
              domainBuilder.buildArea({
                ...areaData2,
                title: areaData2.title_i18n.fr,
                competences: [],
              }),
            ]);
          });
        });
      });
      context('when no areas exist for given framework id', function () {
        it('should return an empty array', async function () {
          // when
          const areas = await areaRepository.findByFrameworkId({
            frameworkId: 'BLOUBLOU',
          });

          // then
          expect(areas).to.deep.equal([]);
        });
      });
    });
  }
});
