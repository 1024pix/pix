import { config } from '../../../../../src/shared/config.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import * as skillRepository from '../../../../../src/shared/infrastructure/repositories/skill-repository.js';
import { catchErr, domainBuilder, expect, mockLearningContent } from '../../../../test-helper.js';

describe('Integration | Repository | skill-repository', function () {
  const skillData00_tubeAcompetenceA_actif = {
    id: 'skillId00',
    name: 'name Acquis 0',
    status: 'actif',
    pixValue: 2.9,
    version: 5,
    level: 2,
    hintStatus: 'hintStatus Acquis 0',
    competenceId: 'competenceIdA',
    tubeId: 'tubeIdA',
    tutorialIds: ['tutorialIdA'],
    learningMoreTutorialIds: [],
    hint_i18n: { fr: 'hint FR skillId00', en: 'hint EN skillId00' },
  };
  const skillData01_tubeAcompetenceA_archive = {
    id: 'skillId01',
    name: 'name Acquis 1',
    status: 'archivé',
    pixValue: 4.2,
    version: 8,
    level: 3,
    hintStatus: 'hintStatus Acquis 1',
    competenceId: 'competenceIdA',
    tubeId: 'tubeIdA',
    tutorialIds: ['tutorialIdA'],
    learningMoreTutorialIds: ['tutorialIdB'],
    hint_i18n: { fr: 'hint FR skillId01', en: 'hint EN skillId01' },
  };
  const skillData02_tubeAcompetenceA_perime = {
    id: 'skillId02',
    name: 'name Acquis 2',
    status: 'périmé',
    pixValue: 5.1,
    version: 9,
    level: 1,
    hintStatus: 'hintStatus Acquis 2',
    competenceId: 'competenceIdA',
    tubeId: 'tubeIdA',
    tutorialIds: [],
    learningMoreTutorialIds: ['tutorialIdB'],
    hint_i18n: { fr: 'hint FR skillId02', en: 'hint EN skillId02' },
  };
  const skillData03_tubeBcompetenceA_actif = {
    id: 'skillId03',
    name: 'name Acquis 3',
    status: 'actif',
    pixValue: 1.2,
    version: 11,
    level: 5,
    hintStatus: 'hintStatus Acquis 3',
    competenceId: 'competenceIdA',
    tubeId: 'tubeIdB',
    tutorialIds: [],
    learningMoreTutorialIds: ['tutorialIdB'],
    hint_i18n: { fr: 'hint FR skillId03', en: 'hint EN skillId03' },
  };
  const skillData04_tubeBcompetenceA_archive = {
    id: 'skillId04',
    name: 'name Acquis 4',
    status: 'archivé',
    pixValue: 1.3,
    version: 5,
    level: 7,
    hintStatus: 'hintStatus Acquis 4',
    competenceId: 'competenceIdA',
    tubeId: 'tubeIdB',
    tutorialIds: [],
    learningMoreTutorialIds: ['tutorialIdB'],
    hint_i18n: { fr: 'hint FR skillId04', en: 'hint EN skillId04' },
  };
  const skillData05_tubeBcompetenceA_perime = {
    id: 'skillId05',
    name: 'name Acquis 5',
    status: 'périmé',
    pixValue: 7,
    version: 25,
    level: 3,
    hintStatus: 'hintStatus Acquis 5',
    competenceId: 'competenceIdA',
    tubeId: 'tubeIdB',
    tutorialIds: [],
    learningMoreTutorialIds: ['tutorialIdB'],
    hint_i18n: { fr: 'hint FR skillId05', en: 'hint EN skillId05' },
  };
  const skillData06_tubeCcompetenceB_actif = {
    id: 'skillId06',
    name: 'name Acquis 6',
    status: 'actif',
    pixValue: 4,
    version: 5,
    level: 6,
    hintStatus: 'hintStatus Acquis 6',
    competenceId: 'competenceIdB',
    tubeId: 'tubeIdC',
    tutorialIds: [],
    learningMoreTutorialIds: ['tutorialIdB'],
    hint_i18n: { fr: 'hint FR skillId06', en: 'hint EN skillId06' },
  };
  const skillData07_tubeCcompetenceB_archive = {
    id: 'skillId07',
    name: 'name Acquis 7',
    status: 'archivé',
    pixValue: 4.2,
    version: 4,
    level: 2,
    hintStatus: 'hintStatus Acquis 7',
    competenceId: 'competenceIdB',
    tubeId: 'tubeIdC',
    tutorialIds: [],
    learningMoreTutorialIds: ['tutorialIdB'],
    hint_i18n: { fr: 'hint FR skillId07', en: 'hint EN skillId07' },
  };
  const skillData08_tubeCcompetenceB_perime = {
    id: 'skillId08',
    name: 'name Acquis 8',
    status: 'périmé',
    pixValue: 5.2,
    version: 1,
    level: 4,
    hintStatus: 'hintStatus Acquis 8',
    competenceId: 'competenceIdB',
    tubeId: 'tubeIdC',
    tutorialIds: [],
    learningMoreTutorialIds: ['tutorialIdB'],
    hint_i18n: { fr: 'hint FR skillId08', en: 'hint EN skillId08' },
  };
  const skillData09_tubeDcompetenceB_actif = {
    id: 'skillId09',
    name: 'name Acquis 9',
    status: 'actif',
    pixValue: 60,
    version: 10,
    level: 1,
    hintStatus: 'hintStatus Acquis 9',
    competenceId: 'competenceIdB',
    tubeId: 'tubeIdD',
    tutorialIds: [],
    learningMoreTutorialIds: ['tutorialIdB'],
    hint_i18n: { fr: 'hint FR skillId09', en: 'hint EN skillId09' },
  };
  const skillData10_tubeDcompetenceB_archive = {
    id: 'skillId10',
    name: 'name Acquis 10',
    status: 'archivé',
    pixValue: 1.1,
    version: 25,
    level: 2,
    hintStatus: 'hintStatus Acquis 10',
    competenceId: 'competenceIdB',
    tubeId: 'tubeIdD',
    tutorialIds: [],
    learningMoreTutorialIds: ['tutorialIdB'],
    hint_i18n: { fr: 'hint FR skillId10', en: 'hint EN skillId10' },
  };
  const skillData11_tubeDcompetenceB_perime = {
    id: 'skillId11',
    name: 'name Acquis 11',
    status: 'périmé',
    pixValue: 2.32,
    version: 11,
    level: 5,
    hintStatus: 'hintStatus Acquis 11',
    competenceId: 'competenceIdB',
    tubeId: 'tubeIdD',
    tutorialIds: [],
    learningMoreTutorialIds: ['tutorialIdB'],
    hint_i18n: { fr: 'hint FR skillId11', en: 'hint EN skillId11' },
  };
  const skillData12_tubeEcompetenceC_perime = {
    id: 'skillId12',
    name: 'name Acquis 12',
    status: 'périmé',
    pixValue: 4.4,
    version: 12,
    level: 4,
    hintStatus: 'hintStatus Acquis 12',
    competenceId: 'competenceIdC',
    tubeId: 'tubeIdD',
    tutorialIds: [],
    learningMoreTutorialIds: ['tutorialIdB'],
    hint_i18n: { fr: 'hint FR skillId12', en: 'hint EN skillId12' },
  };

  beforeEach(async function () {
    await mockLearningContent({
      skills: [
        skillData06_tubeCcompetenceB_actif,
        skillData03_tubeBcompetenceA_actif,
        skillData10_tubeDcompetenceB_archive,
        skillData00_tubeAcompetenceA_actif,
        skillData04_tubeBcompetenceA_archive,
        skillData01_tubeAcompetenceA_archive,
        skillData02_tubeAcompetenceA_perime,
        skillData11_tubeDcompetenceB_perime,
        skillData08_tubeCcompetenceB_perime,
        skillData05_tubeBcompetenceA_perime,
        skillData12_tubeEcompetenceC_perime,
        skillData07_tubeCcompetenceB_archive,
        skillData09_tubeDcompetenceB_actif,
      ],
    });
  });

  // eslint-disable-next-line mocha/no-setup-in-describe
  testSkillRepository();

  describe('when using old learning content', function () {
    beforeEach(function () {
      config.featureToggles.useNewLearningContent = false;
    });

    afterEach(function () {
      config.featureToggles.useNewLearningContent = true;
    });

    // eslint-disable-next-line mocha/no-setup-in-describe
    testSkillRepository();
  });

  function testSkillRepository() {
    describe('#list', function () {
      it('should return all skills', async function () {
        // when
        const skills = await skillRepository.list();

        // then
        expect(skills).to.deepEqualArray([
          domainBuilder.buildSkill({
            ...skillData00_tubeAcompetenceA_actif,
            difficulty: skillData00_tubeAcompetenceA_actif.level,
            hint: skillData00_tubeAcompetenceA_actif.hint_i18n.fr,
          }),
          domainBuilder.buildSkill({
            ...skillData01_tubeAcompetenceA_archive,
            difficulty: skillData01_tubeAcompetenceA_archive.level,
            hint: skillData01_tubeAcompetenceA_archive.hint_i18n.fr,
          }),
          domainBuilder.buildSkill({
            ...skillData02_tubeAcompetenceA_perime,
            difficulty: skillData02_tubeAcompetenceA_perime.level,
            hint: skillData02_tubeAcompetenceA_perime.hint_i18n.fr,
          }),
          domainBuilder.buildSkill({
            ...skillData03_tubeBcompetenceA_actif,
            difficulty: skillData03_tubeBcompetenceA_actif.level,
            hint: skillData03_tubeBcompetenceA_actif.hint_i18n.fr,
          }),
          domainBuilder.buildSkill({
            ...skillData04_tubeBcompetenceA_archive,
            difficulty: skillData04_tubeBcompetenceA_archive.level,
            hint: skillData04_tubeBcompetenceA_archive.hint_i18n.fr,
          }),
          domainBuilder.buildSkill({
            ...skillData05_tubeBcompetenceA_perime,
            difficulty: skillData05_tubeBcompetenceA_perime.level,
            hint: skillData05_tubeBcompetenceA_perime.hint_i18n.fr,
          }),
          domainBuilder.buildSkill({
            ...skillData06_tubeCcompetenceB_actif,
            difficulty: skillData06_tubeCcompetenceB_actif.level,
            hint: skillData06_tubeCcompetenceB_actif.hint_i18n.fr,
          }),
          domainBuilder.buildSkill({
            ...skillData07_tubeCcompetenceB_archive,
            difficulty: skillData07_tubeCcompetenceB_archive.level,
            hint: skillData07_tubeCcompetenceB_archive.hint_i18n.fr,
          }),
          domainBuilder.buildSkill({
            ...skillData08_tubeCcompetenceB_perime,
            difficulty: skillData08_tubeCcompetenceB_perime.level,
            hint: skillData08_tubeCcompetenceB_perime.hint_i18n.fr,
          }),
          domainBuilder.buildSkill({
            ...skillData09_tubeDcompetenceB_actif,
            difficulty: skillData09_tubeDcompetenceB_actif.level,
            hint: skillData09_tubeDcompetenceB_actif.hint_i18n.fr,
          }),
          domainBuilder.buildSkill({
            ...skillData10_tubeDcompetenceB_archive,
            difficulty: skillData10_tubeDcompetenceB_archive.level,
            hint: skillData10_tubeDcompetenceB_archive.hint_i18n.fr,
          }),
          domainBuilder.buildSkill({
            ...skillData11_tubeDcompetenceB_perime,
            difficulty: skillData11_tubeDcompetenceB_perime.level,
            hint: skillData11_tubeDcompetenceB_perime.hint_i18n.fr,
          }),
          domainBuilder.buildSkill({
            ...skillData12_tubeEcompetenceC_perime,
            difficulty: skillData12_tubeEcompetenceC_perime.level,
            hint: skillData12_tubeEcompetenceC_perime.hint_i18n.fr,
          }),
        ]);
      });
    });

    describe('#findActiveByCompetenceId', function () {
      context('when no active skills for given competence id', function () {
        it('should return an empty array', async function () {
          // when
          const skills = await skillRepository.findActiveByCompetenceId('competenceIdC');

          // then
          expect(skills).to.deep.equal([]);
        });
      });

      context('when active skills for given competence id', function () {
        it('should return skills', async function () {
          // when
          const skills = await skillRepository.findActiveByCompetenceId('competenceIdB');

          // then
          expect(skills).to.deepEqualArray([
            domainBuilder.buildSkill({
              ...skillData06_tubeCcompetenceB_actif,
              difficulty: skillData06_tubeCcompetenceB_actif.level,
              hint: skillData06_tubeCcompetenceB_actif.hint_i18n.fr,
            }),
            domainBuilder.buildSkill({
              ...skillData09_tubeDcompetenceB_actif,
              difficulty: skillData09_tubeDcompetenceB_actif.level,
              hint: skillData09_tubeDcompetenceB_actif.hint_i18n.fr,
            }),
          ]);
        });
      });
    });

    describe('#findOperativeByCompetenceId', function () {
      context('when no operative skills for given competence id', function () {
        it('should return an empty array', async function () {
          // when
          const skills = await skillRepository.findOperativeByCompetenceId('competenceIdC');

          // then
          expect(skills).to.deep.equal([]);
        });
      });

      context('when operative skills for given competence id', function () {
        it('should return skills', async function () {
          // when
          const skills = await skillRepository.findOperativeByCompetenceId('competenceIdB');

          // then
          expect(skills).to.deepEqualArray([
            domainBuilder.buildSkill({
              ...skillData06_tubeCcompetenceB_actif,
              difficulty: skillData06_tubeCcompetenceB_actif.level,
              hint: skillData06_tubeCcompetenceB_actif.hint_i18n.fr,
            }),
            domainBuilder.buildSkill({
              ...skillData07_tubeCcompetenceB_archive,
              difficulty: skillData07_tubeCcompetenceB_archive.level,
              hint: skillData07_tubeCcompetenceB_archive.hint_i18n.fr,
            }),
            domainBuilder.buildSkill({
              ...skillData09_tubeDcompetenceB_actif,
              difficulty: skillData09_tubeDcompetenceB_actif.level,
              hint: skillData09_tubeDcompetenceB_actif.hint_i18n.fr,
            }),
            domainBuilder.buildSkill({
              ...skillData10_tubeDcompetenceB_archive,
              difficulty: skillData10_tubeDcompetenceB_archive.level,
              hint: skillData10_tubeDcompetenceB_archive.hint_i18n.fr,
            }),
          ]);
        });
      });
    });

    describe('#findOperativeByCompetenceIds', function () {
      context('when some operative skills find for competence ids', function () {
        it('should return skills', async function () {
          // when
          const skills = await skillRepository.findOperativeByCompetenceIds([
            'competenceIdA',
            'competenceIdB',
            'competenceInconnue',
          ]);

          // then
          expect(skills).to.deepEqualArray([
            domainBuilder.buildSkill({
              ...skillData00_tubeAcompetenceA_actif,
              difficulty: skillData00_tubeAcompetenceA_actif.level,
              hint: skillData00_tubeAcompetenceA_actif.hint_i18n.fr,
            }),
            domainBuilder.buildSkill({
              ...skillData01_tubeAcompetenceA_archive,
              difficulty: skillData01_tubeAcompetenceA_archive.level,
              hint: skillData01_tubeAcompetenceA_archive.hint_i18n.fr,
            }),
            domainBuilder.buildSkill({
              ...skillData03_tubeBcompetenceA_actif,
              difficulty: skillData03_tubeBcompetenceA_actif.level,
              hint: skillData03_tubeBcompetenceA_actif.hint_i18n.fr,
            }),
            domainBuilder.buildSkill({
              ...skillData04_tubeBcompetenceA_archive,
              difficulty: skillData04_tubeBcompetenceA_archive.level,
              hint: skillData04_tubeBcompetenceA_archive.hint_i18n.fr,
            }),
            domainBuilder.buildSkill({
              ...skillData06_tubeCcompetenceB_actif,
              difficulty: skillData06_tubeCcompetenceB_actif.level,
              hint: skillData06_tubeCcompetenceB_actif.hint_i18n.fr,
            }),
            domainBuilder.buildSkill({
              ...skillData07_tubeCcompetenceB_archive,
              difficulty: skillData07_tubeCcompetenceB_archive.level,
              hint: skillData07_tubeCcompetenceB_archive.hint_i18n.fr,
            }),
            domainBuilder.buildSkill({
              ...skillData09_tubeDcompetenceB_actif,
              difficulty: skillData09_tubeDcompetenceB_actif.level,
              hint: skillData09_tubeDcompetenceB_actif.hint_i18n.fr,
            }),
            domainBuilder.buildSkill({
              ...skillData10_tubeDcompetenceB_archive,
              difficulty: skillData10_tubeDcompetenceB_archive.level,
              hint: skillData10_tubeDcompetenceB_archive.hint_i18n.fr,
            }),
          ]);
        });
      });

      context('when no operative skills find for competence ids', function () {
        it('should return an empty array', async function () {
          // when
          const skills = await skillRepository.findOperativeByCompetenceIds(['competenceIdC', 'competenceInconnue']);

          // then
          expect(skills).to.deep.equal([]);
        });
      });
    });

    describe('#findActiveByTubeId', function () {
      context('when no active skills for given tube id', function () {
        it('should return an empty array', async function () {
          // when
          const skills = await skillRepository.findActiveByTubeId('tubeD');

          // then
          expect(skills).to.deep.equal([]);
        });
      });

      context('when active skills for given tube id', function () {
        it('should return skills', async function () {
          // when
          const skills = await skillRepository.findActiveByTubeId('tubeIdB');

          // then
          expect(skills).to.deepEqualArray([
            domainBuilder.buildSkill({
              ...skillData03_tubeBcompetenceA_actif,
              difficulty: skillData03_tubeBcompetenceA_actif.level,
              hint: skillData03_tubeBcompetenceA_actif.hint_i18n.fr,
            }),
          ]);
        });
      });
    });

    describe('#findOperativeByTubeId', function () {
      context('when no operative skills for given tube id', function () {
        it('should return an empty array', async function () {
          // when
          const skills = await skillRepository.findOperativeByTubeId('tubeD');

          // then
          expect(skills).to.deep.equal([]);
        });
      });

      context('when operative skills for given tube id', function () {
        it('should return skills', async function () {
          // when
          const skills = await skillRepository.findOperativeByTubeId('tubeIdB');

          // then
          expect(skills).to.deepEqualArray([
            domainBuilder.buildSkill({
              ...skillData03_tubeBcompetenceA_actif,
              difficulty: skillData03_tubeBcompetenceA_actif.level,
              hint: skillData03_tubeBcompetenceA_actif.hint_i18n.fr,
            }),
            domainBuilder.buildSkill({
              ...skillData04_tubeBcompetenceA_archive,
              difficulty: skillData04_tubeBcompetenceA_archive.level,
              hint: skillData04_tubeBcompetenceA_archive.hint_i18n.fr,
            }),
          ]);
        });
      });
    });

    describe('#findOperativeByIds', function () {
      context('when no operative skills for given ids', function () {
        it('should return an empty array', async function () {
          // when
          const skills = await skillRepository.findOperativeByIds(['skillId02', 'skillCoucou']);

          // then
          expect(skills).to.deep.equal([]);
        });
      });

      context('when operative skills for given ids', function () {
        it('should return skills', async function () {
          // when
          const skills = await skillRepository.findOperativeByIds([
            'skillId02',
            'skillId03',
            'skillId01',
            'skillIdCoucou',
          ]);

          // then
          expect(skills).to.deepEqualArray([
            domainBuilder.buildSkill({
              ...skillData01_tubeAcompetenceA_archive,
              difficulty: skillData01_tubeAcompetenceA_archive.level,
              hint: skillData01_tubeAcompetenceA_archive.hint_i18n.fr,
            }),
            domainBuilder.buildSkill({
              ...skillData03_tubeBcompetenceA_actif,
              difficulty: skillData03_tubeBcompetenceA_actif.level,
              hint: skillData03_tubeBcompetenceA_actif.hint_i18n.fr,
            }),
          ]);
        });
      });
    });

    describe('#get', function () {
      context('when no skill for given id', function () {
        it('should throw a NotFoundError', async function () {
          // when
          const err = await catchErr(skillRepository.get, skillRepository)('skillCoucou');

          // then
          expect(err).to.be.instanceOf(NotFoundError);
          expect(err.message).to.equal('Erreur, acquis introuvable');
        });
      });

      context('when skill for given id', function () {
        context('when locale provided', function () {
          context('when no translations for provided locale', function () {
            context('when no fallback asked', function () {
              it('should return skill with null translations', async function () {
                // when
                const skills = await skillRepository.get('skillId03', { locale: 'nl', useFallback: false });

                // then
                expect(skills).to.deepEqualInstance(
                  domainBuilder.buildSkill({
                    ...skillData03_tubeBcompetenceA_actif,
                    difficulty: skillData03_tubeBcompetenceA_actif.level,
                    hint: null,
                  }),
                );
              });
            });
            context('when fallback asked', function () {
              it('should return skill with fallback default locale FR', async function () {
                // when
                const skills = await skillRepository.get('skillId03', { locale: 'nl', useFallback: true });

                // then
                expect(skills).to.deepEqualInstance(
                  domainBuilder.buildSkill({
                    ...skillData03_tubeBcompetenceA_actif,
                    difficulty: skillData03_tubeBcompetenceA_actif.level,
                    hint: skillData03_tubeBcompetenceA_actif.hint_i18n.fr,
                  }),
                );
              });
            });
          });
          context('when translation exist for provided locale', function () {
            it('should return skill translated', async function () {
              // when
              const skills = await skillRepository.get('skillId03', { locale: 'en', useFallback: false });

              // then
              expect(skills).to.deepEqualInstance(
                domainBuilder.buildSkill({
                  ...skillData03_tubeBcompetenceA_actif,
                  difficulty: skillData03_tubeBcompetenceA_actif.level,
                  hint: skillData03_tubeBcompetenceA_actif.hint_i18n.en,
                }),
              );
            });
          });
        });
        context('when no locale provided', function () {
          it('should return skill with default translation in locale FR', async function () {
            // when
            const skills = await skillRepository.get('skillId03');

            // then
            expect(skills).to.deepEqualInstance(
              domainBuilder.buildSkill({
                ...skillData03_tubeBcompetenceA_actif,
                difficulty: skillData03_tubeBcompetenceA_actif.level,
                hint: skillData03_tubeBcompetenceA_actif.hint_i18n.fr,
              }),
            );
          });
        });
      });
    });

    describe('#findActiveByRecordIds', function () {
      context('when no active skills for given ids', function () {
        it('should return an empty array', async function () {
          // when
          const skills = await skillRepository.findActiveByRecordIds(['skillId01', 'skillCoucou']);

          // then
          expect(skills).to.deep.equal([]);
        });
      });

      context('when active skills for given ids', function () {
        it('should return skills', async function () {
          // when
          const skills = await skillRepository.findActiveByRecordIds([
            'skillId02',
            'skillId03',
            'skillId01',
            'skillId00',
            'skillIdCoucou',
          ]);

          // then
          expect(skills).to.deepEqualArray([
            domainBuilder.buildSkill({
              ...skillData00_tubeAcompetenceA_actif,
              difficulty: skillData00_tubeAcompetenceA_actif.level,
              hint: skillData00_tubeAcompetenceA_actif.hint_i18n.fr,
            }),
            domainBuilder.buildSkill({
              ...skillData03_tubeBcompetenceA_actif,
              difficulty: skillData03_tubeBcompetenceA_actif.level,
              hint: skillData03_tubeBcompetenceA_actif.hint_i18n.fr,
            }),
          ]);
        });
      });
    });

    describe('#findByRecordIds', function () {
      context('when no skills for given ids', function () {
        it('should return an empty array', async function () {
          // when
          const skills = await skillRepository.findByRecordIds(['skillCoucou']);

          // then
          expect(skills).to.deep.equal([]);
        });
      });

      context('when skills for given ids', function () {
        it('should return skills', async function () {
          // when
          const skills = await skillRepository.findByRecordIds([
            'skillId02',
            'skillId03',
            'skillId01',
            'skillId00',
            'skillIdCoucou',
          ]);

          // then
          expect(skills).to.deepEqualArray([
            domainBuilder.buildSkill({
              ...skillData00_tubeAcompetenceA_actif,
              difficulty: skillData00_tubeAcompetenceA_actif.level,
              hint: skillData00_tubeAcompetenceA_actif.hint_i18n.fr,
            }),
            domainBuilder.buildSkill({
              ...skillData01_tubeAcompetenceA_archive,
              difficulty: skillData01_tubeAcompetenceA_archive.level,
              hint: skillData01_tubeAcompetenceA_archive.hint_i18n.fr,
            }),
            domainBuilder.buildSkill({
              ...skillData02_tubeAcompetenceA_perime,
              difficulty: skillData02_tubeAcompetenceA_perime.level,
              hint: skillData02_tubeAcompetenceA_perime.hint_i18n.fr,
            }),
            domainBuilder.buildSkill({
              ...skillData03_tubeBcompetenceA_actif,
              difficulty: skillData03_tubeBcompetenceA_actif.level,
              hint: skillData03_tubeBcompetenceA_actif.hint_i18n.fr,
            }),
          ]);
        });
      });
    });
  }
});
