import * as tubeRepository from '../../../../lib/infrastructure/repositories/tube-repository.js';
import { config } from '../../../../src/shared/config.js';
import { LearningContentResourceNotFound } from '../../../../src/shared/infrastructure/datasources/learning-content/LearningContentResourceNotFound.js';
import { catchErr, domainBuilder, expect, mockLearningContent } from '../../../test-helper.js';

describe('Integration | Repository | tube-repository', function () {
  const tubeData0 = {
    id: 'tubeId0',
    name: 'name Tube 0',
    title: 'title Tube 0',
    description: 'description Tube 0',
    practicalTitle_i18n: { fr: 'practicalTitle FR Tube 0', en: 'practicalTitle EN Tube 0' },
    practicalDescription_i18n: { fr: 'practicalDescription FR Tube 0', en: 'practicalDescription EN Tube 0' },
    competenceId: 'competenceId0',
    thematicId: 'thematicId0',
    skillIds: ['skillIdActive0'],
    isMobileCompliant: true,
    isTabletCompliant: true,
  };
  const tubeData1 = {
    id: 'tubeId1',
    name: 'name Tube 1',
    title: 'title Tube 1',
    description: 'description Tube 1',
    practicalTitle_i18n: { fr: 'practicalTitle FR Tube 1', nl: 'practicalTitle NL Tube 1' },
    practicalDescription_i18n: { fr: 'practicalDescription FR Tube 1', en: 'practicalDescription EN Tube 1' },
    competenceId: 'competenceId1',
    thematicId: 'thematicId1',
    skillIds: ['skillIdPasActive1'],
    isMobileCompliant: false,
    isTabletCompliant: true,
  };
  const tubeData2 = {
    id: 'tubeId2',
    name: 'name Tube 2',
    title: 'title Tube 2',
    description: 'description Tube 2',
    practicalTitle_i18n: { fr: 'practicalTitle FR Tube 2', nl: 'practicalTitle NL Tube 2' },
    practicalDescription_i18n: { fr: 'practicalDescription FR Tube 2', en: 'practicalDescription EN Tube 2' },
    competenceId: 'competenceId2',
    thematicId: 'thematicId2',
    skillIds: ['skillIdActive2', 'skillIdPasActive3'],
    isMobileCompliant: false,
    isTabletCompliant: true,
  };
  const skillActive0 = {
    id: 'skillIdActive0',
    status: 'actif',
    tubeId: 'tubeId0',
  };
  const skillPasActive1 = {
    id: 'skillIdPasActive1',
    status: 'pas actif',
    tubeId: 'tubeId1',
  };
  const skillActive2 = {
    id: 'skillIdActive2',
    status: 'actif',
    tubeId: 'tubeId2',
  };
  const skillPasActive3 = {
    id: 'skillIdPasActive3',
    status: 'pas actif',
    tubeId: 'tubeId2',
  };

  beforeEach(async function () {
    await mockLearningContent({
      tubes: [tubeData0, tubeData1, tubeData2],
      skills: [skillActive0, skillPasActive1, skillActive2, skillPasActive3],
    });
  });

  testTubeRepository(); // eslint-disable-line mocha/no-setup-in-describe

  describe('when using old learning content', function () {
    beforeEach(function () {
      config.featureToggles.useNewLearningContent = false;
    });

    afterEach(function () {
      config.featureToggles.useNewLearningContent = true;
    });

    testTubeRepository(); // eslint-disable-line mocha/no-setup-in-describe
  });

  function testTubeRepository() {
    describe('#get', function () {
      context('when tube found for given id', function () {
        it('should return the tube translated with default locale FR', async function () {
          // when
          const tube = await tubeRepository.get('tubeId0');

          // then
          expect(tube).to.deepEqualInstance(
            domainBuilder.buildTube({
              ...tubeData0,
              practicalTitle: tubeData0.practicalTitle_i18n.fr,
              practicalDescription: tubeData0.practicalDescription_i18n.fr,
              skills: [],
            }),
          );
        });
      });

      context('when no tube found', function () {
        it('should throw a LearningContentResourceNotFound error', async function () {
          // when
          const err = await catchErr(tubeRepository.get, tubeRepository)('recCoucouZouZou');

          // then
          expect(err).to.be.instanceOf(LearningContentResourceNotFound);
        });
      });
    });

    describe('#list', function () {
      it('should return all tubes translated by default locale FR ordered by name', async function () {
        // when
        const tubes = await tubeRepository.list();

        // then
        expect(tubes).to.deepEqualArray([
          domainBuilder.buildTube({
            ...tubeData0,
            practicalTitle: tubeData0.practicalTitle_i18n.fr,
            practicalDescription: tubeData0.practicalDescription_i18n.fr,
            skills: [],
          }),
          domainBuilder.buildTube({
            ...tubeData1,
            practicalTitle: tubeData1.practicalTitle_i18n.fr,
            practicalDescription: tubeData1.practicalDescription_i18n.fr,
            skills: [],
          }),
          domainBuilder.buildTube({
            ...tubeData2,
            practicalTitle: tubeData2.practicalTitle_i18n.fr,
            practicalDescription: tubeData2.practicalDescription_i18n.fr,
            skills: [],
          }),
        ]);
      });
    });

    describe('#findByNames', function () {
      context('when tubes found by names', function () {
        context('when no locale provided', function () {
          it('should return all tubes found translated in default locale FR given by their name', async function () {
            // when
            const tubes = await tubeRepository.findByNames({
              tubeNames: ['name Tube 2', 'name Tube 0', 'non existant mais on sen fiche'],
            });

            // then
            expect(tubes).to.deepEqualArray([
              domainBuilder.buildTube({
                ...tubeData0,
                practicalTitle: tubeData0.practicalTitle_i18n.fr,
                practicalDescription: tubeData0.practicalDescription_i18n.fr,
                skills: [],
              }),
              domainBuilder.buildTube({
                ...tubeData2,
                practicalTitle: tubeData2.practicalTitle_i18n.fr,
                practicalDescription: tubeData2.practicalDescription_i18n.fr,
                skills: [],
              }),
            ]);
          });
        });

        context('when a locale is provided', function () {
          it('should return all tubes found translated in default locale FR given by their name', async function () {
            // when
            const tubes = await tubeRepository.findByNames({ tubeNames: ['name Tube 2', 'name Tube 0'], locale: 'en' });

            // then
            expect(tubes).to.deepEqualArray([
              domainBuilder.buildTube({
                ...tubeData0,
                practicalTitle: tubeData0.practicalTitle_i18n.en,
                practicalDescription: tubeData0.practicalDescription_i18n.en,
                skills: [],
              }),
              domainBuilder.buildTube({
                ...tubeData2,
                practicalTitle: tubeData2.practicalTitle_i18n.fr,
                practicalDescription: tubeData2.practicalDescription_i18n.en,
                skills: [],
              }),
            ]);
          });
        });
      });

      context('when no tubes found for given names', function () {
        it('should return an empty array', async function () {
          // when
          const tubes = await tubeRepository.findByNames({ tubeNames: ['name Tube 888888'] });

          // then
          expect(tubes).to.deep.equal([]);
        });
      });
    });

    describe('#findByRecordIds', function () {
      context('when tubes found by ids', function () {
        context('when no locale provided', function () {
          it('should return all tubes found translated in default locale FR given by their name', async function () {
            // when
            const tubes = await tubeRepository.findByRecordIds([
              'tubeId2',
              'tubeId0',
              'non existant mais on sen fiche',
            ]);

            // then
            expect(tubes).to.deepEqualArray([
              domainBuilder.buildTube({
                ...tubeData0,
                practicalTitle: tubeData0.practicalTitle_i18n.fr,
                practicalDescription: tubeData0.practicalDescription_i18n.fr,
                skills: [],
              }),
              domainBuilder.buildTube({
                ...tubeData2,
                practicalTitle: tubeData2.practicalTitle_i18n.fr,
                practicalDescription: tubeData2.practicalDescription_i18n.fr,
                skills: [],
              }),
            ]);
          });
        });

        context('when a locale is provided', function () {
          it('should return all tubes found translated in default locale FR given by their name', async function () {
            // when
            const tubes = await tubeRepository.findByRecordIds(
              ['tubeId2', 'tubeId0', 'non existant mais on sen fiche'],
              'en',
            );

            // then
            expect(tubes).to.deepEqualArray([
              domainBuilder.buildTube({
                ...tubeData0,
                practicalTitle: tubeData0.practicalTitle_i18n.en,
                practicalDescription: tubeData0.practicalDescription_i18n.en,
                skills: [],
              }),
              domainBuilder.buildTube({
                ...tubeData2,
                practicalTitle: tubeData2.practicalTitle_i18n.fr,
                practicalDescription: tubeData2.practicalDescription_i18n.en,
                skills: [],
              }),
            ]);
          });
        });
      });

      context('when no tubes found for given ids', function () {
        it('should return an empty array', async function () {
          // when
          const tubes = await tubeRepository.findByRecordIds(['name Tube 888888']);

          // then
          expect(tubes).to.deep.equal([]);
        });
      });
    });

    describe('#findActiveByRecordIds', function () {
      context('when active tubes found by ids', function () {
        context('when no locale provided', function () {
          it('should return all tubes that have at least one active skill found translated in default locale FR given by their ids', async function () {
            // when
            const tubes = await tubeRepository.findActiveByRecordIds([
              'tubeId2',
              'tubeId0',
              'tubeId1',
              'non existant mais on sen fiche',
            ]);

            // then
            expect(tubes).to.deepEqualArray([
              domainBuilder.buildTube({
                ...tubeData0,
                practicalTitle: tubeData0.practicalTitle_i18n.fr,
                practicalDescription: tubeData0.practicalDescription_i18n.fr,
                skills: [],
              }),
              domainBuilder.buildTube({
                ...tubeData2,
                practicalTitle: tubeData2.practicalTitle_i18n.fr,
                practicalDescription: tubeData2.practicalDescription_i18n.fr,
                skills: [],
              }),
            ]);
          });
        });

        context('when a locale is provided', function () {
          it('should return all tubes found translated in default locale FR given by their name', async function () {
            // when
            const tubes = await tubeRepository.findActiveByRecordIds(
              ['tubeId2', 'tubeId0', 'tubeId1', 'non existant mais on sen fiche'],
              'en',
            );

            // then
            expect(tubes).to.deepEqualArray([
              domainBuilder.buildTube({
                ...tubeData0,
                practicalTitle: tubeData0.practicalTitle_i18n.en,
                practicalDescription: tubeData0.practicalDescription_i18n.en,
                skills: [],
              }),
              domainBuilder.buildTube({
                ...tubeData2,
                practicalTitle: tubeData2.practicalTitle_i18n.fr,
                practicalDescription: tubeData2.practicalDescription_i18n.en,
                skills: [],
              }),
            ]);
          });
        });
      });

      context('when no active tubes found for given ids', function () {
        it('should return an empty array', async function () {
          // when
          const tubes = await tubeRepository.findActiveByRecordIds(['tubeId1']);

          // then
          expect(tubes).to.deep.equal([]);
        });
      });
    });
  }
});
