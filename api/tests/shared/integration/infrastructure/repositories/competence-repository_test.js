import { config } from '../../../../../src/shared/config.js';
import { PIX_ORIGIN } from '../../../../../src/shared/domain/constants.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import * as competenceRepository from '../../../../../src/shared/infrastructure/repositories/competence-repository.js';
import { catchErr, domainBuilder, expect, mockLearningContent } from '../../../../test-helper.js';

describe('Integration | Repository | competence-repository', function () {
  const competenceData1 = {
    id: 'recCompetence1_pix',
    name_i18n: { fr: 'name FR recCompetence1_pix', en: 'name EN recCompetence1_pix' },
    description_i18n: { fr: 'description FR recCompetence1_pix', nl: 'description NL recCompetence1_pix' },
    index: 'index recCompetence1_pix',
    areaId: 'recArea1',
    origin: PIX_ORIGIN,
    skillIds: ['skillIdA'],
    thematicIds: ['thematicIdA'],
  };
  const competenceData2 = {
    id: 'recCompetence2_pasPix',
    name_i18n: { fr: 'name FR recCompetence2_pasPix', en: 'name EN recCompetence2_pasPix' },
    description_i18n: { fr: 'description FR recCompetence2_pasPix', en: 'description EN recCompetence2_pasPix' },
    index: 'index recCompetence2_pasPix',
    areaId: 'recArea0',
    origin: 'PasPix',
    skillIds: ['skillIdB'],
    thematicIds: ['thematicIdB'],
  };
  const competenceData3 = {
    id: 'recCompetence3_pix',
    name_i18n: { fr: 'name FR recCompetence3_pix', nl: 'name NL recCompetence3_pix' },
    description_i18n: { fr: 'description FR recCompetence3_pix', en: 'description EN recCompetence3_pix' },
    index: 'index recCompetence3_pix',
    areaId: 'recArea1',
    origin: PIX_ORIGIN,
    skillIds: ['skillIdC'],
    thematicIds: ['thematicIdC'],
  };

  beforeEach(async function () {
    await mockLearningContent({
      competences: [competenceData3, competenceData2, competenceData1],
    });
  });

  // eslint-disable-next-line mocha/no-setup-in-describe
  testCompetenceRepository();

  describe('when using old learning content', function () {
    beforeEach(function () {
      config.featureToggles.useNewLearningContent = false;
    });

    afterEach(function () {
      config.featureToggles.useNewLearningContent = true;
    });

    testCompetenceRepository(); // eslint-disable-line mocha/no-setup-in-describe
  });

  function testCompetenceRepository() {
    describe('#get', function () {
      context('when competence found for given id', function () {
        context('when locale is provided', function () {
          it('should return the competence translated in the provided locale or fallback to default locale FR', async function () {
            // when
            const competence = await competenceRepository.get({ id: 'recCompetence3_pix', locale: 'en' });

            // then
            expect(competence).to.deepEqualInstance(
              domainBuilder.buildCompetence({
                ...competenceData3,
                name: competenceData3.name_i18n.fr,
                description: competenceData3.description_i18n.en,
              }),
            );
          });
        });
        context('when no locale provided', function () {
          it('should return the competence translated in default locale FR', async function () {
            // when
            const competence = await competenceRepository.get({ id: 'recCompetence3_pix' });

            // then
            expect(competence).to.deepEqualInstance(
              domainBuilder.buildCompetence({
                ...competenceData3,
                name: competenceData3.name_i18n.fr,
                description: competenceData3.description_i18n.fr,
              }),
            );
          });
        });
      });

      context('when no competence found', function () {
        it('should throw a NotFound error', async function () {
          // when
          const err = await catchErr(
            competenceRepository.get,
            competenceRepository,
          )({ id: 'CoucouLesZamis', locale: 'en' });

          // then
          expect(err).to.be.instanceOf(NotFoundError);
          expect(err.message).to.equal('La compétence demandée n’existe pas');
        });
      });
    });

    describe('#getCompetenceName', function () {
      context('when competence found for given id', function () {
        context('when locale is provided', function () {
          it('should return the competence name translated in the provided locale or fallback to default locale FR', async function () {
            // when
            const competenceName = await competenceRepository.getCompetenceName({
              id: 'recCompetence1_pix',
              locale: 'en',
            });

            // then
            expect(competenceName).to.equal(competenceData1.name_i18n.en);
          });
        });
        context('when no locale provided', function () {
          it('should return the competence name translated in default locale FR', async function () {
            // when
            const competenceName = await competenceRepository.getCompetenceName({ id: 'recCompetence1_pix' });

            // then
            expect(competenceName).to.equal(competenceData1.name_i18n.fr);
          });
        });
      });

      context('when no competence found', function () {
        it('should throw a NotFound error', async function () {
          // when
          const err = await catchErr(
            competenceRepository.getCompetenceName,
            competenceRepository,
          )({ id: 'CoucouLesZamis', locale: 'en' });

          // then
          expect(err).to.be.instanceOf(NotFoundError);
          expect(err.message).to.equal('La compétence demandée n’existe pas');
        });
      });
    });

    describe('#list', function () {
      context('when no locale provided', function () {
        it('should return all competences translated by default with locale FR-FR ordered by index', async function () {
          // when
          const competences = await competenceRepository.list();

          // then
          expect(competences).to.deepEqualArray([
            domainBuilder.buildCompetence({
              ...competenceData1,
              name: competenceData1.name_i18n.fr,
              description: competenceData1.description_i18n.fr,
            }),
            domainBuilder.buildCompetence({
              ...competenceData2,
              name: competenceData2.name_i18n.fr,
              description: competenceData2.description_i18n.fr,
            }),
            domainBuilder.buildCompetence({
              ...competenceData3,
              name: competenceData3.name_i18n.fr,
              description: competenceData3.description_i18n.fr,
            }),
          ]);
        });
      });

      context('when a locale is provided', function () {
        it('should return all competences translated in the given locale or with fallback FR-FR', async function () {
          // when
          const competences = await competenceRepository.list({ locale: 'en' });

          // then
          expect(competences).to.deepEqualArray([
            domainBuilder.buildCompetence({
              ...competenceData1,
              name: competenceData1.name_i18n.en,
              description: competenceData1.description_i18n.fr,
            }),
            domainBuilder.buildCompetence({
              ...competenceData2,
              name: competenceData2.name_i18n.en,
              description: competenceData2.description_i18n.en,
            }),
            domainBuilder.buildCompetence({
              ...competenceData3,
              name: competenceData3.name_i18n.fr,
              description: competenceData3.description_i18n.en,
            }),
          ]);
        });
      });
    });

    describe('#listPixCompetencesOnly', function () {
      context('when no locale provided', function () {
        it('should return all pix competences translated by default with locale FR-FR ordered by index', async function () {
          // when
          const competences = await competenceRepository.listPixCompetencesOnly();

          // then
          expect(competences).to.deepEqualArray([
            domainBuilder.buildCompetence({
              ...competenceData1,
              name: competenceData1.name_i18n.fr,
              description: competenceData1.description_i18n.fr,
            }),
            domainBuilder.buildCompetence({
              ...competenceData3,
              name: competenceData3.name_i18n.fr,
              description: competenceData3.description_i18n.fr,
            }),
          ]);
        });
      });

      context('when a locale is provided', function () {
        it('should return all pix competences translated in the given locale or with fallback FR-FR', async function () {
          // when
          const competences = await competenceRepository.listPixCompetencesOnly({ locale: 'en' });

          // then
          expect(competences).to.deepEqualArray([
            domainBuilder.buildCompetence({
              ...competenceData1,
              name: competenceData1.name_i18n.en,
              description: competenceData1.description_i18n.fr,
            }),
            domainBuilder.buildCompetence({
              ...competenceData3,
              name: competenceData3.name_i18n.fr,
              description: competenceData3.description_i18n.en,
            }),
          ]);
        });
      });
    });

    describe('#findByRecordIds', function () {
      context('when competences found by ids', function () {
        context('when no locale provided', function () {
          it('should return all competences found translated in default locale FR given by their ids', async function () {
            // when
            const competences = await competenceRepository.findByRecordIds({
              competenceIds: ['recCompetence3_pix', 'recCompetence2_pasPix'],
            });

            // then
            expect(competences).to.deepEqualArray([
              domainBuilder.buildCompetence({
                ...competenceData2,
                name: competenceData2.name_i18n.fr,
                description: competenceData2.description_i18n.fr,
              }),
              domainBuilder.buildCompetence({
                ...competenceData3,
                name: competenceData3.name_i18n.fr,
                description: competenceData3.description_i18n.fr,
              }),
            ]);
          });
        });

        context('when a locale is provided', function () {
          it('should return all competences found translated in provided locale of fallback to default locale FR', async function () {
            // when
            const competences = await competenceRepository.findByRecordIds({
              competenceIds: ['recCompetence3_pix', 'recCompetence2_pasPix'],
              locale: 'en',
            });

            // then
            expect(competences).to.deepEqualArray([
              domainBuilder.buildCompetence({
                ...competenceData2,
                name: competenceData2.name_i18n.en,
                description: competenceData2.description_i18n.en,
              }),
              domainBuilder.buildCompetence({
                ...competenceData3,
                name: competenceData3.name_i18n.fr,
                description: competenceData3.description_i18n.en,
              }),
            ]);
          });
        });
      });

      context('when no competences found for given ids', function () {
        it('should return an empty array', async function () {
          // when
          const competences = await competenceRepository.findByRecordIds({
            competenceIds: ['recCompetenceCOUCOU', 'recCompetenceMAMAN'],
          });

          // then
          expect(competences).to.deep.equal([]);
        });
      });
    });

    describe('#findByAreaId', function () {
      context('when competences found for area id', function () {
        context('when no locale provided', function () {
          it('should return all competences found translated in default locale FR given by their ids', async function () {
            // when
            const competences = await competenceRepository.findByAreaId({
              areaId: 'recArea1',
            });

            // then
            expect(competences).to.deepEqualArray([
              domainBuilder.buildCompetence({
                ...competenceData1,
                name: competenceData1.name_i18n.fr,
                description: competenceData1.description_i18n.fr,
              }),
              domainBuilder.buildCompetence({
                ...competenceData3,
                name: competenceData3.name_i18n.fr,
                description: competenceData3.description_i18n.fr,
              }),
            ]);
          });
        });

        context('when a locale is provided', function () {
          it('should return all competences found translated in provided locale of fallback to default locale FR', async function () {
            // when
            const competences = await competenceRepository.findByAreaId({
              areaId: 'recArea1',
              locale: 'en',
            });

            // then
            expect(competences).to.deepEqualArray([
              domainBuilder.buildCompetence({
                ...competenceData1,
                name: competenceData1.name_i18n.en,
                description: competenceData1.description_i18n.fr,
              }),
              domainBuilder.buildCompetence({
                ...competenceData3,
                name: competenceData3.name_i18n.fr,
                description: competenceData3.description_i18n.en,
              }),
            ]);
          });
        });
      });

      context('when no competences found for given area id', function () {
        it('should return an empty array', async function () {
          // when
          const competences = await competenceRepository.findByAreaId({
            areaId: 'recCoucouRoro',
          });

          // then
          expect(competences).to.deep.equal([]);
        });
      });
    });
  }
});
