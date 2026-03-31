import { knex } from '../../../../../../db/knex-database-connection.js';
import * as calibratedChallengeRepository from '../../../../../../src/certification/evaluation/infrastructure/repositories/calibrated-challenge-repository.js';
import { SCOPES } from '../../../../../../src/certification/shared/domain/models/Scopes.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, databaseBuilder, domainBuilder, expect } from '../../../../../test-helper.js';

describe('Certification | Evaluation | Integration | Repository | calibrated-challenge-repository', function () {
  const challengeData00_skill00_valide_frnl = {
    id: 'challengeId00',
    status: 'validé',
    accessibility1: 'accessibility1 challengeId00',
    accessibility2: 'accessibility2 challengeId00',
    locales: ['fr', 'nl'],
    skillId: 'skillId00',
  };
  const challengeData01_skill00_valide_fren = {
    id: 'challengeId01',
    status: 'validé',
    accessibility1: 'accessibility1 challengeId01',
    accessibility2: 'accessibility2 challengeId01',
    locales: ['fr', 'en'],
    skillId: 'skillId00',
  };
  const challengeData02_skill00_archive_en = {
    id: 'challengeId02',
    status: 'archivé',
    accessibility1: 'accessibility1 challengeId02',
    accessibility2: 'accessibility2 challengeId02',
    locales: ['en'],
    skillId: 'skillId00',
  };
  const challengeData03_skill00_valide_nl = {
    id: 'challengeId03',
    status: 'validé',
    accessibility1: 'accessibility1 challengeId03',
    accessibility2: 'accessibility2 challengeId03',
    locales: ['nl'],
    skillId: 'skillId00',
  };
  const skillData00_tube00competence00_actif = {
    id: 'skillId00',
    name: 'name skillId00',
    status: 'actif',
    pixValue: 2.9,
    version: 5,
    level: 2,
    hintStatus: 'hintStatus Acquis 0',
    competenceId: 'competenceId00',
    tubeId: 'tubeId00',
    tutorialIds: [],
    learningMoreTutorialIds: [],
    hint_i18n: { fr: 'hint FR skillId00', en: 'hint EN skillId00' },
  };
  const challengeData04_skill01_valide_ennl = {
    id: 'challengeId04',
    status: 'validé',
    accessibility1: 'accessibility1 challengeId04',
    accessibility2: 'accessibility2 challengeId04',
    locales: ['en', 'nl'],
    skillId: 'skillId01',
  };
  const skillData01_tube01competence00_actif = {
    id: 'skillId01',
    name: 'name skillId01',
    status: 'actif',
    pixValue: 3.9,
    version: 5,
    level: 1,
    hintStatus: 'hintStatus Acquis 1',
    competenceId: 'competenceId00',
    tubeId: 'tubeId01',
    tutorialIds: [],
    learningMoreTutorialIds: [],
    hint_i18n: { fr: 'hint FR skillId01', en: 'hint EN skillId01' },
  };
  const challengeData05_skill02_perime_fren = {
    id: 'challengeId05',
    status: 'périmé',
    accessibility1: 'accessibility1 challengeId05',
    accessibility2: 'accessibility2 challengeId05',
    locales: ['en', 'fr'],
    skillId: 'skillId02',
  };
  const challengeData06_skill02_perime_fren = {
    id: 'challengeId06',
    status: 'périmé',
    accessibility1: 'accessibility1 challengeId06',
    accessibility2: 'accessibility2 challengeId06',
    locales: ['en', 'fr'],
    skillId: 'skillId02',
  };
  const skillData02_tube02competence01_perime = {
    id: 'skillId02',
    name: 'name skillId02',
    status: 'périmé',
    pixValue: 2,
    version: 1,
    level: 3,
    hintStatus: 'hintStatus Acquis 2',
    competenceId: 'competenceId01',
    tubeId: 'tubeId02',
    tutorialIds: [],
    learningMoreTutorialIds: [],
    hint_i18n: { fr: 'hint FR skillId02', en: 'hint EN skillId02' },
  };
  const challengeData07_skill03_valide_frnl = {
    id: 'challengeId07',
    status: 'validé',
    accessibility1: 'accessibility1 challengeId07',
    accessibility2: 'accessibility2 challengeId07',
    locales: ['nl', 'fr'],
    skillId: 'skillId03',
  };
  const challengeData08_skill03_archive_fr = {
    id: 'challengeId08',
    status: 'archivé',
    accessibility1: 'accessibility1 challengeId08',
    accessibility2: 'accessibility2 challengeId08',
    locales: ['fr'],
    skillId: 'skillId03',
  };
  const challengeData09_skill03_archive_fr = {
    id: 'challengeId09',
    status: 'archivé',
    accessibility1: 'accessibility1 challengeId09',
    accessibility2: 'accessibility2 challengeId09',
    locales: ['fr'],
    skillId: 'skillId03',
  };
  const skillData03_tube02competence01_actif = {
    id: 'skillId03',
    name: 'name skillId03',
    status: 'actif',
    pixValue: 5,
    version: 8,
    level: 7,
    hintStatus: 'hintStatus Acquis 3',
    competenceId: 'competenceId01',
    tubeId: 'tubeId03',
    tutorialIds: [],
    learningMoreTutorialIds: [],
    hint_i18n: { fr: 'hint FR skillId03', en: 'hint EN skillId03' },
  };

  beforeEach(async function () {
    databaseBuilder.factory.learningContent.build({
      skills: [
        skillData00_tube00competence00_actif,
        skillData01_tube01competence00_actif,
        skillData02_tube02competence01_perime,
        skillData03_tube02competence01_actif,
      ],
      challenges: [
        challengeData00_skill00_valide_frnl,
        challengeData01_skill00_valide_fren,
        challengeData02_skill00_archive_en,
        challengeData03_skill00_valide_nl,
        challengeData04_skill01_valide_ennl,
        challengeData05_skill02_perime_fren,
        challengeData06_skill02_perime_fren,
        challengeData07_skill03_valide_frnl,
        challengeData08_skill03_archive_fr,
        challengeData09_skill03_archive_fr,
      ],
    });
    await databaseBuilder.commit();
  });

  describe('#findActiveFlashCompatible', function () {
    let skillsLC = [];
    let challengesLC = [];

    beforeEach(async function () {
      await knex('learningcontent.challenges').truncate();
      await knex('learningcontent.skills').truncate();
      skillsLC = [];
      challengesLC = [];
      skillsLC.push(skillData02_tube02competence01_perime);
      skillsLC.push(skillData03_tube02competence01_actif);
      skillsLC.push(skillData00_tube00competence00_actif);
      challengesLC.push(challengeData06_skill02_perime_fren);
      challengesLC.push(challengeData07_skill03_valide_frnl);
      challengesLC.push(challengeData08_skill03_archive_fr);
    });

    it('returns only valid calibrated flash compatible challenges', async function () {
      // given
      const version = databaseBuilder.factory.buildCertificationVersion({ scope: SCOPES.CORE });
      const otherVersion = databaseBuilder.factory.buildCertificationVersion({
        scope: SCOPES.CORE,
      });

      challengesLC.push({
        id: 'challengeForComplementaryCertification',
        status: 'validé',
        skillId: skillData03_tube02competence01_actif.id,
      });
      challengesLC.push({
        id: 'otherChallengeForComplementaryCertification',
        status: 'validé',
        skillId: skillData03_tube02competence01_actif.id,
      });
      challengesLC.push(domainBuilder.buildChallenge({ id: 'toto', status: 'archivé' }));

      databaseBuilder.factory.learningContent.build({ skills: skillsLC, challenges: challengesLC });

      const certificationFrameworksChallenge = databaseBuilder.factory.buildCertificationFrameworksChallenge({
        challengeId: challengesLC[3].id,
        versionId: version.id,
      });

      databaseBuilder.factory.buildCertificationFrameworksChallenge({
        challengeId: challengesLC[4].id,
        versionId: otherVersion.Id,
      });

      databaseBuilder.factory.buildCertificationFrameworksChallenge({
        challengeId: challengesLC[0].id,
        versionId: otherVersion.id,
      });

      await databaseBuilder.commit();

      // when
      const flashCompatibleChallenges = await calibratedChallengeRepository.findActiveFlashCompatible({
        locale: 'fr',
        version,
      });

      // then
      expect(flashCompatibleChallenges).to.have.lengthOf(1);
      expect(flashCompatibleChallenges[0].id).to.equal(challengesLC[3].id);
      expect(flashCompatibleChallenges[0].difficulty).to.equal(certificationFrameworksChallenge.difficulty);
      expect(flashCompatibleChallenges[0].discriminant).to.equal(certificationFrameworksChallenge.discriminant);
    });

    context('when locale is not defined', function () {
      it('should throw an Error', async function () {
        // given
        databaseBuilder.factory.learningContent.build({ skills: skillsLC, challenges: challengesLC });
        await databaseBuilder.commit();

        // when
        const err = await catchErr(calibratedChallengeRepository.findActiveFlashCompatible)({ version: { id: 1 } });

        // then
        expect(err.message).to.equal('Locale shall be defined');
      });
    });

    context('when locale is defined', function () {
      context('when no active flash compatible challenges found', function () {
        it('should return an empty array', async function () {
          // given
          databaseBuilder.factory.learningContent.build({ skills: skillsLC, challenges: challengesLC });
          const version = databaseBuilder.factory.buildCertificationVersion();
          await databaseBuilder.commit();

          // when
          const challenges = await calibratedChallengeRepository.findActiveFlashCompatible({
            locale: 'fr',
            version,
          });

          // then
          expect(challenges).to.deep.equal([]);
        });
      });

      context('when active flash compatible challenges found', function () {
        it('should return the challenges', async function () {
          // given
          challengesLC.push(challengeData01_skill00_valide_fren);
          challengesLC.push(challengeData00_skill00_valide_frnl);
          challengesLC.push(challengeData03_skill00_valide_nl);
          challengesLC.push(challengeData02_skill00_archive_en);
          challengesLC.push(challengeData09_skill03_archive_fr);
          databaseBuilder.factory.learningContent.build({ skills: skillsLC, challenges: challengesLC });
          const version = databaseBuilder.factory.buildCertificationVersion();

          databaseBuilder.factory.buildCertificationFrameworksChallenge({
            challengeId: challengesLC[3].id,
            versionId: version.id,
          });

          const certificationFrameworkChallenge = databaseBuilder.factory.buildCertificationFrameworksChallenge({
            challengeId: challengesLC[4].id,
            versionId: version.id,
          });

          await databaseBuilder.commit();

          // when
          const challenges = await calibratedChallengeRepository.findActiveFlashCompatible({
            locale: 'nl',
            version,
          });

          // then
          expect(challenges).to.deep.equal([
            domainBuilder.certification.evaluation.buildCalibratedChallenge({
              id: challengeData00_skill00_valide_frnl.id,
              blindnessCompatibility: challengeData00_skill00_valide_frnl.accessibility1,
              colorBlindnessCompatibility: challengeData00_skill00_valide_frnl.accessibility2,
              discriminant: certificationFrameworkChallenge.discriminant,
              difficulty: certificationFrameworkChallenge.difficulty,
              skill: domainBuilder.certification.evaluation.buildCalibratedChallengeSkill({
                id: 'skillId00',
                name: 'name skillId00',
                competenceId: 'competenceId00',
                tubeId: 'tubeId00',
              }),
            }),
          ]);
        });
      });
    });
  });

  describe('#getMany', function () {
    context('when at least one challenge is not found in cert referential amongst the provided ids', function () {
      it('should throw a NotFound error', async function () {
        // given
        const versionWithoutChallenges = databaseBuilder.factory.buildCertificationVersion({
          scope: SCOPES.CORE,
        });
        await databaseBuilder.commit();

        // when
        const err = await catchErr(calibratedChallengeRepository.getMany)({
          ids: ['challengeIdPipeauPipette', 'challengeId00'],
          version: versionWithoutChallenges,
        });

        // then
        expect(err).to.be.instanceOf(NotFoundError);
        expect(err).to.have.property('message', 'Some challenges do not exist in certification version');
      });
    });

    context('when at least one challenge is not found in LCMS amongst the provided ids', function () {
      it('should throw a NotFound error', async function () {
        // given
        const version = databaseBuilder.factory.buildCertificationVersion({
          scope: SCOPES.CORE,
        });
        const challengeCalibrationNotInLCMS = databaseBuilder.factory.buildCertificationFrameworksChallenge({
          challengeId: 'challengeIdPipeauPipette',
          versionId: version.id,
        });
        await databaseBuilder.commit();

        // when
        const err = await catchErr(calibratedChallengeRepository.getMany)({
          ids: [challengeCalibrationNotInLCMS.challengeId],
          version,
        });

        // then
        expect(err).to.be.instanceOf(NotFoundError);
        expect(err).to.have.property('message', 'Épreuve introuvable');
      });
    });

    context('when all challenges are found', function () {
      let skillsLC = [];
      let challengesLC = [];

      beforeEach(async function () {
        await knex('learningcontent.challenges').truncate();
        await knex('learningcontent.skills').truncate();
        skillsLC = [];
        challengesLC = [];
        skillsLC.push(skillData02_tube02competence01_perime);
        skillsLC.push(skillData03_tube02competence01_actif);
        skillsLC.push(skillData00_tube00competence00_actif);
        challengesLC.push(challengeData06_skill02_perime_fren);
        challengesLC.push(challengeData07_skill03_valide_frnl);
        challengesLC.push(challengeData08_skill03_archive_fr);
      });

      it('should return only the challenges for given locale', async function () {
        const versionActive = databaseBuilder.factory.buildCertificationVersion({ scope: SCOPES.CORE });
        const otherVersion = databaseBuilder.factory.buildCertificationVersion({
          scope: SCOPES.CORE,
        });

        challengesLC.push({
          id: 'challengeForComplementaryCertification',
          status: 'validé',
          skillId: skillData03_tube02competence01_actif.id,
        });
        challengesLC.push({
          id: 'otherChallengeForComplementaryCertification',
          status: 'archivé',
          skillId: skillData03_tube02competence01_actif.id,
        });

        databaseBuilder.factory.learningContent.build({ skills: skillsLC, challenges: challengesLC });

        const challengeValide = databaseBuilder.factory.buildCertificationFrameworksChallenge({
          challengeId: challengeData07_skill03_valide_frnl.id,
          versionId: versionActive.id,
          discriminant: 1.0,
          difficulty: 2.1,
        });

        const challengeArchive = databaseBuilder.factory.buildCertificationFrameworksChallenge({
          challengeId: challengeData08_skill03_archive_fr.id,
          versionId: versionActive.id,
          discriminant: 2.0,
          difficulty: 3.1,
        });

        databaseBuilder.factory.buildCertificationFrameworksChallenge({
          challengeId: challengeData06_skill02_perime_fren.id,
          versionId: otherVersion.id,
        });

        await databaseBuilder.commit();

        // when
        const challenges = await calibratedChallengeRepository.getMany({
          ids: [challengeValide.challengeId, challengeArchive.challengeId],
          version: versionActive,
        });

        // then
        expect(challenges).to.deep.equal([
          domainBuilder.certification.evaluation.buildCalibratedChallenge({
            id: challengeData07_skill03_valide_frnl.id,
            blindnessCompatibility: challengeData07_skill03_valide_frnl.accessibility1,
            colorBlindnessCompatibility: challengeData07_skill03_valide_frnl.accessibility2,
            discriminant: challengeValide.discriminant,
            difficulty: challengeValide.difficulty,
            skill: domainBuilder.certification.evaluation.buildCalibratedChallengeSkill({
              id: skillData03_tube02competence01_actif.id,
              name: skillData03_tube02competence01_actif.name,
              competenceId: skillData03_tube02competence01_actif.competenceId,
              tubeId: skillData03_tube02competence01_actif.tubeId,
            }),
          }),
          domainBuilder.certification.evaluation.buildCalibratedChallenge({
            id: challengeData08_skill03_archive_fr.id,
            blindnessCompatibility: challengeData08_skill03_archive_fr.accessibility1,
            colorBlindnessCompatibility: challengeData08_skill03_archive_fr.accessibility2,
            discriminant: challengeArchive.discriminant,
            difficulty: challengeArchive.difficulty,
            skill: domainBuilder.certification.evaluation.buildCalibratedChallengeSkill({
              id: skillData03_tube02competence01_actif.id,
              name: skillData03_tube02competence01_actif.name,
              competenceId: skillData03_tube02competence01_actif.competenceId,
              tubeId: skillData03_tube02competence01_actif.tubeId,
            }),
          }),
        ]);
      });
    });
  });

  describe('#getAllCalibratedChallenges', function () {
    let skillsLC;
    let challengesLC;

    beforeEach(async function () {
      await knex('learningcontent.challenges').truncate();
      await knex('learningcontent.skills').truncate();
      skillsLC = [];
      challengesLC = [];
      skillsLC.push(skillData02_tube02competence01_perime);
      skillsLC.push(skillData03_tube02competence01_actif);
      skillsLC.push(skillData00_tube00competence00_actif);
      challengesLC.push(challengeData06_skill02_perime_fren);
      challengesLC.push(challengeData07_skill03_valide_frnl);
      challengesLC.push(challengeData08_skill03_archive_fr);
    });

    context('when retrieving challenges from archive', function () {
      context('when no flash compatible challenges found', function () {
        it('should return an empty array', async function () {
          // given
          databaseBuilder.factory.learningContent.build({ skills: skillsLC, challenges: challengesLC });

          const { id } = databaseBuilder.factory.buildCertificationVersion({
            startDate: new Date('1977-10-19'),
            expirationDate: new Date('1977-10-20'),
          });
          const archivedVersionWithNonCompatibleChallenge = domainBuilder.certification.shared.buildVersion({ id });
          databaseBuilder.factory.buildCertificationFrameworksChallenge({
            challengeId: challengesLC[0].id,
            versionId: archivedVersionWithNonCompatibleChallenge.id,
            discriminant: null,
            difficulty: null,
          });

          const activeVersionWithEligibleChallenge = databaseBuilder.factory.buildCertificationVersion({
            startDate: new Date('1977-10-20'),
            expirationDate: null,
          });
          databaseBuilder.factory.buildCertificationFrameworksChallenge({
            challengeId: challengesLC[0].id,
            versionId: activeVersionWithEligibleChallenge.id,
            discriminant: 2.2,
            difficulty: 3.5,
          });
          await databaseBuilder.commit();

          // when
          const challenges = await calibratedChallengeRepository.getAllCalibratedChallenges({
            version: archivedVersionWithNonCompatibleChallenge,
          });

          // then
          expect(challenges).to.deep.equal([]);
        });
      });

      context('when flash compatible challenges found', function () {
        it('should return the challenges', async function () {
          // given
          challengesLC.push(challengeData03_skill00_valide_nl);
          challengesLC.push(challengeData05_skill02_perime_fren);
          challengesLC.push(challengeData02_skill00_archive_en);
          databaseBuilder.factory.learningContent.build({ skills: skillsLC, challenges: challengesLC });

          const { id } = databaseBuilder.factory.buildCertificationVersion({
            startDate: new Date('1977-10-19'),
            expirationDate: new Date('1977-10-20'),
          });
          const archivedVersionWithEligibleChallenge = domainBuilder.certification.shared.buildVersion({ id });
          const expectedDiscriminant = 2.221;
          const expectedDifficulty = 3.554;
          databaseBuilder.factory.buildCertificationFrameworksChallenge({
            challengeId: challengeData02_skill00_archive_en.id,
            versionId: archivedVersionWithEligibleChallenge.id,
            discriminant: expectedDiscriminant,
            difficulty: expectedDifficulty,
          });
          const notACompartibleDiscriminant = null;
          databaseBuilder.factory.buildCertificationFrameworksChallenge({
            challengeId: challengeData05_skill02_perime_fren.id,
            versionId: archivedVersionWithEligibleChallenge.id,
            discriminant: notACompartibleDiscriminant,
            difficulty: expectedDifficulty,
          });
          const notACompartibleDifficulty = null;
          databaseBuilder.factory.buildCertificationFrameworksChallenge({
            challengeId: challengeData03_skill00_valide_nl.id,
            versionId: archivedVersionWithEligibleChallenge.id,
            discriminant: expectedDiscriminant,
            difficulty: notACompartibleDifficulty,
          });

          const activeVersionWithNonCompatibleChallenge = databaseBuilder.factory.buildCertificationVersion({
            startDate: new Date('1977-10-20'),
            expirationDate: null,
          });
          databaseBuilder.factory.buildCertificationFrameworksChallenge({
            challengeId: challengeData02_skill00_archive_en.id,
            versionId: activeVersionWithNonCompatibleChallenge.id,
            discriminant: null,
            difficulty: null,
          });
          await databaseBuilder.commit();

          // when
          const challenges = await calibratedChallengeRepository.getAllCalibratedChallenges({
            version: archivedVersionWithEligibleChallenge,
          });

          // then
          expect(challenges).to.deep.equal([
            domainBuilder.certification.evaluation.buildCalibratedChallenge({
              id: challengeData02_skill00_archive_en.id,
              blindnessCompatibility: challengeData02_skill00_archive_en.accessibility1,
              colorBlindnessCompatibility: challengeData02_skill00_archive_en.accessibility2,
              discriminant: expectedDiscriminant,
              difficulty: expectedDifficulty,
              skill: domainBuilder.certification.evaluation.buildCalibratedChallengeSkill({
                id: skillData00_tube00competence00_actif.id,
                name: skillData00_tube00competence00_actif.name,
                competenceId: skillData00_tube00competence00_actif.competenceId,
                tubeId: skillData00_tube00competence00_actif.tubeId,
              }),
            }),
          ]);
        });
      });
    });

    context('when retrieving current framework', function () {
      context('when including obsolete challenges', function () {
        context('when no flash compatible challenges found', function () {
          it('should return an empty array', async function () {
            // given
            databaseBuilder.factory.learningContent.build({ skills: skillsLC, challenges: challengesLC });

            const archivedVersionWithCompatibleChallenge = databaseBuilder.factory.buildCertificationVersion({
              startDate: new Date('1977-10-19'),
              expirationDate: new Date('1977-10-20'),
            });

            databaseBuilder.factory.buildCertificationFrameworksChallenge({
              challengeId: challengesLC[0].id,
              versionId: archivedVersionWithCompatibleChallenge.id,
              discriminant: 2.2,
              difficulty: 3.5,
            });

            const { id } = databaseBuilder.factory.buildCertificationVersion({
              startDate: new Date('1977-10-20'),
              expirationDate: null,
            });
            const activeVersionWithNoEligibleChallenge = domainBuilder.certification.shared.buildVersion({ id });
            databaseBuilder.factory.buildCertificationFrameworksChallenge({
              challengeId: challengesLC[0].id,
              versionId: activeVersionWithNoEligibleChallenge.id,
              discriminant: null,
              difficulty: null,
            });
            await databaseBuilder.commit();

            // when
            const challenges = await calibratedChallengeRepository.getAllCalibratedChallenges({
              version: activeVersionWithNoEligibleChallenge,
            });

            // then
            expect(challenges).to.deep.equal([]);
          });
        });

        context('when flash compatible challenges found', function () {
          it('should return the challenges', async function () {
            // given
            challengesLC.push(challengeData03_skill00_valide_nl);
            challengesLC.push(challengeData05_skill02_perime_fren);
            challengesLC.push(challengeData02_skill00_archive_en);
            databaseBuilder.factory.learningContent.build({ skills: skillsLC, challenges: challengesLC });

            const archivedVersionWithNonCompatibleChallenge = databaseBuilder.factory.buildCertificationVersion({
              startDate: new Date('1977-10-19'),
              expirationDate: new Date('1977-10-20'),
            });

            databaseBuilder.factory.buildCertificationFrameworksChallenge({
              challengeId: challengeData02_skill00_archive_en.id,
              versionId: archivedVersionWithNonCompatibleChallenge.id,
              discriminant: null,
              difficulty: null,
            });
            databaseBuilder.factory.buildCertificationFrameworksChallenge({
              challengeId: challengeData05_skill02_perime_fren.id,
              versionId: archivedVersionWithNonCompatibleChallenge.id,
              discriminant: null,
              difficulty: null,
            });
            databaseBuilder.factory.buildCertificationFrameworksChallenge({
              challengeId: challengeData03_skill00_valide_nl.id,
              versionId: archivedVersionWithNonCompatibleChallenge.id,
              discriminant: null,
              difficulty: null,
            });

            const { id } = databaseBuilder.factory.buildCertificationVersion({
              startDate: new Date('1977-10-20'),
              expirationDate: null,
            });
            const activeVersionWithEligibleChallenge = domainBuilder.certification.shared.buildVersion({ id });
            const expectedDiscriminant = 2.222;
            const expectedDifficulty = 3.555;
            databaseBuilder.factory.buildCertificationFrameworksChallenge({
              challengeId: challengeData02_skill00_archive_en.id,
              versionId: activeVersionWithEligibleChallenge.id,
              discriminant: expectedDiscriminant,
              difficulty: expectedDifficulty,
            });
            databaseBuilder.factory.buildCertificationFrameworksChallenge({
              challengeId: challengeData05_skill02_perime_fren.id,
              versionId: activeVersionWithEligibleChallenge.id,
              discriminant: expectedDiscriminant,
              difficulty: expectedDifficulty,
            });
            databaseBuilder.factory.buildCertificationFrameworksChallenge({
              challengeId: challengeData03_skill00_valide_nl.id,
              versionId: activeVersionWithEligibleChallenge.id,
              discriminant: expectedDiscriminant,
              difficulty: expectedDifficulty,
            });
            await databaseBuilder.commit();

            // when
            const challenges = await calibratedChallengeRepository.getAllCalibratedChallenges({
              version: activeVersionWithEligibleChallenge,
            });

            // then
            expect(challenges).to.deep.equal([
              domainBuilder.certification.evaluation.buildCalibratedChallenge({
                id: challengeData02_skill00_archive_en.id,
                blindnessCompatibility: challengeData02_skill00_archive_en.accessibility1,
                colorBlindnessCompatibility: challengeData02_skill00_archive_en.accessibility2,
                discriminant: expectedDiscriminant,
                difficulty: expectedDifficulty,
                skill: domainBuilder.certification.evaluation.buildCalibratedChallengeSkill({
                  id: skillData00_tube00competence00_actif.id,
                  name: skillData00_tube00competence00_actif.name,
                  competenceId: skillData00_tube00competence00_actif.competenceId,
                  tubeId: skillData00_tube00competence00_actif.tubeId,
                }),
              }),
              domainBuilder.certification.evaluation.buildCalibratedChallenge({
                id: challengeData03_skill00_valide_nl.id,
                blindnessCompatibility: challengeData03_skill00_valide_nl.accessibility1,
                colorBlindnessCompatibility: challengeData03_skill00_valide_nl.accessibility2,
                discriminant: expectedDiscriminant,
                difficulty: expectedDifficulty,
                skill: domainBuilder.certification.evaluation.buildCalibratedChallengeSkill({
                  id: skillData00_tube00competence00_actif.id,
                  name: skillData00_tube00competence00_actif.name,
                  competenceId: skillData00_tube00competence00_actif.competenceId,
                  tubeId: skillData00_tube00competence00_actif.tubeId,
                }),
              }),
              domainBuilder.certification.evaluation.buildCalibratedChallenge({
                id: challengeData05_skill02_perime_fren.id,
                blindnessCompatibility: challengeData05_skill02_perime_fren.accessibility1,
                colorBlindnessCompatibility: challengeData05_skill02_perime_fren.accessibility2,
                discriminant: expectedDiscriminant,
                difficulty: expectedDifficulty,
                skill: domainBuilder.certification.evaluation.buildCalibratedChallengeSkill({
                  id: skillData02_tube02competence01_perime.id,
                  name: skillData02_tube02competence01_perime.name,
                  competenceId: skillData02_tube02competence01_perime.competenceId,
                  tubeId: skillData02_tube02competence01_perime.tubeId,
                }),
              }),
            ]);
          });
        });
      });
    });
  });
});
