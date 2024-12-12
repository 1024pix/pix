import * as thematicRepository from '../../../../lib/infrastructure/repositories/thematic-repository.js';
import { config } from '../../../../src/shared/config.js';
import { domainBuilder, expect, mockLearningContent } from '../../../test-helper.js';

describe('Integration | Repository | thematic-repository', function () {
  const thematicData0 = {
    id: 'thematicId0',
    name_i18n: { fr: 'name FR thematicId0', en: 'name EN thematicId0' },
    index: 5,
    competenceId: 'competenceIdA',
    tubeIds: ['tubeIdA'],
  };
  const thematicData1 = {
    id: 'thematicId1',
    name_i18n: { fr: 'name FR thematicId1', nl: 'name NL thematicId1' },
    index: 15,
    competenceId: 'competenceIdB',
    tubeIds: ['tubeIdA'],
  };
  const thematicData2 = {
    id: 'thematicId2',
    name_i18n: { fr: 'name FR thematicId2', en: 'name EN thematicId2' },
    index: 9,
    competenceId: 'competenceIdA',
    tubeIds: ['tubeIdB'],
  };
  const thematicData3 = {
    id: 'thematicId3',
    name_i18n: { fr: 'name FR thematicId3', nl: 'name NL thematicId3' },
    index: 2,
    competenceId: 'competenceIdC',
    tubeIds: ['tubeIdC'],
  };

  beforeEach(async function () {
    await mockLearningContent({
      thematics: [thematicData0, thematicData3, thematicData2, thematicData1],
    });
  });

  // eslint-disable-next-line mocha/no-setup-in-describe
  testThematicRepository();

  describe('when using old learning content', function () {
    beforeEach(function () {
      config.featureToggles.useNewLearningContent = false;
    });

    afterEach(function () {
      config.featureToggles.useNewLearningContent = true;
    });

    testThematicRepository(); // eslint-disable-line mocha/no-setup-in-describe
  });

  function testThematicRepository() {
    describe('#list', function () {
      context('when no locale provided', function () {
        it('should return all thematics translated by default with locale FR-FR', async function () {
          // when
          const thematics = await thematicRepository.list();

          // then
          expect(thematics).to.deepEqualArray([
            domainBuilder.buildThematic({
              ...thematicData0,
              name: thematicData0.name_i18n.fr,
            }),
            domainBuilder.buildThematic({
              ...thematicData1,
              name: thematicData1.name_i18n.fr,
            }),
            domainBuilder.buildThematic({
              ...thematicData2,
              name: thematicData2.name_i18n.fr,
            }),
            domainBuilder.buildThematic({
              ...thematicData3,
              name: thematicData3.name_i18n.fr,
            }),
          ]);
        });
      });

      context('when a locale is provided', function () {
        it('should return all thematics translated in the given locale or with fallback FR-FR', async function () {
          // when
          const thematics = await thematicRepository.list({ locale: 'en' });

          // then
          expect(thematics).to.deepEqualArray([
            domainBuilder.buildThematic({
              ...thematicData0,
              name: thematicData0.name_i18n.en,
            }),
            domainBuilder.buildThematic({
              ...thematicData1,
              name: thematicData1.name_i18n.fr,
            }),
            domainBuilder.buildThematic({
              ...thematicData2,
              name: thematicData2.name_i18n.en,
            }),
            domainBuilder.buildThematic({
              ...thematicData3,
              name: thematicData3.name_i18n.fr,
            }),
          ]);
        });
      });
    });

    describe('#findByCompetenceIds', function () {
      context('when thematics found by competence ids', function () {
        context('when no locale provided', function () {
          it('should return all thematics found translated in default locale FR given by their ids', async function () {
            // when
            const thematics = await thematicRepository.findByCompetenceIds(['competenceIdB', 'competenceIdA']);

            // then
            expect(thematics).to.deepEqualArray([
              domainBuilder.buildThematic({
                ...thematicData0,
                name: thematicData0.name_i18n.fr,
              }),
              domainBuilder.buildThematic({
                ...thematicData1,
                name: thematicData1.name_i18n.fr,
              }),
              domainBuilder.buildThematic({
                ...thematicData2,
                name: thematicData2.name_i18n.fr,
              }),
            ]);
          });
        });

        context('when a locale is provided', function () {
          it('should return all thematics found translated in provided locale of fallback to default locale FR', async function () {
            // when
            const thematics = await thematicRepository.findByCompetenceIds(['competenceIdB', 'competenceIdA'], 'en');

            // then
            expect(thematics).to.deepEqualArray([
              domainBuilder.buildThematic({
                ...thematicData0,
                name: thematicData0.name_i18n.en,
              }),
              domainBuilder.buildThematic({
                ...thematicData1,
                name: thematicData1.name_i18n.fr,
              }),
              domainBuilder.buildThematic({
                ...thematicData2,
                name: thematicData2.name_i18n.en,
              }),
            ]);
          });
        });
      });

      context('when no thematics found for given competence ids', function () {
        it('should return an empty array', async function () {
          // when
          const thematics = await thematicRepository.findByCompetenceIds(['recCouCouRoRo', 'recCouCouGabDou']);

          // then
          expect(thematics).to.deep.equal([]);
        });
      });
    });

    describe('#findByRecordIds', function () {
      context('when thematics found by ids', function () {
        context('when no locale provided', function () {
          it('should return all thematics found translated in default locale FR given by their ids ordered by name', async function () {
            // when
            const thematics = await thematicRepository.findByRecordIds(['thematicId3', 'thematicId0']);

            // then
            expect(thematics).to.deepEqualArray([
              domainBuilder.buildThematic({
                ...thematicData0,
                name: thematicData0.name_i18n.fr,
              }),
              domainBuilder.buildThematic({
                ...thematicData3,
                name: thematicData3.name_i18n.fr,
              }),
            ]);
          });
        });

        context('when a locale is provided', function () {
          it('should return all thematics found translated in provided locale of fallback to default locale FR', async function () {
            // when
            const thematics = await thematicRepository.findByRecordIds(['thematicId3', 'thematicId0'], 'en');

            // then
            expect(thematics).to.deepEqualArray([
              domainBuilder.buildThematic({
                ...thematicData0,
                name: thematicData0.name_i18n.en,
              }),
              domainBuilder.buildThematic({
                ...thematicData3,
                name: thematicData3.name_i18n.fr,
              }),
            ]);
          });
        });
      });

      context('when no thematics found for given ids', function () {
        it('should return an empty array', async function () {
          // when
          const thematics = await thematicRepository.findByRecordIds(['recCouCouRoRo', 'recCouCouGabDou']);

          // then
          expect(thematics).to.deep.equal([]);
        });
      });
    });
  }
});
