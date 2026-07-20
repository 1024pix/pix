import { Version, VERSION_STATUSES } from '../../../../../../src/certification/configuration/domain/models/Version.js';
import * as versionRepository from '../../../../../../src/certification/configuration/infrastructure/repositories/version-repository.js';
import { DEFAULT_SESSION_DURATION_MINUTES } from '../../../../../../src/certification/shared/domain/constants.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { SCOPES } from '../../../../../../src/certification/shared/domain/models/Scopes.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Configuration | Integration | Repository | Version', function () {
  describe('#save', function () {
    context('when the saved certification version does not exist', function () {
      it('should insert the new certification version', async function () {
        // given
        const challengesConfiguration = {
          maximumAssessmentLength: 32,
          limitToOneQuestionPerTube: true,
          defaultCandidateCapacity: -8,
        };
        const version = domainBuilder.certification.configuration
          .versionBuilder()
          .asActive({ startDate: new Date('2025-06-01') })
          .withParameters({
            scope: SCOPES.PIX_PLUS_DROIT,
            assessmentDuration: DEFAULT_SESSION_DURATION_MINUTES,
            minimumAnswersRequiredToValidateACertification: 123,
            comments: 'COUCOU',
            status: VERSION_STATUSES.ACTIVE,
            globalScoringConfiguration: [{ meshLevel: 0, bounds: { min: -8, max: -1.4 } }],
            competencesScoringConfiguration: [
              {
                competence: '1.1',
                values: [{ bounds: { max: -2, min: -10 }, competenceLevel: 0 }],
              },
            ],
            challengesConfiguration,
            tubeIds: ['rec123', 'rec456', 'rec789'],
          })
          .insertToDB({ databaseBuilder });

        await databaseBuilder.commit();

        // when
        const versionId = await versionRepository.save(version);

        // then
        const savedVersion = await versionRepository.getById({ id: versionId });
        expect(savedVersion).to.deepEqualInstance(version);
      });
    });

    context('when the saved certification version already exists', function () {
      it('should update the certification version', async function () {
        // given
        const challengesConfiguration = {
          maximumAssessmentLength: 32,
          limitToOneQuestionPerTube: true,
          defaultCandidateCapacity: -8,
        };
        const version = domainBuilder.certification.configuration
          .versionBuilder()
          .asActive({ startDate: new Date('2025-06-01') })
          .withParameters({
            scope: SCOPES.PIX_PLUS_DROIT,
            assessmentDuration: DEFAULT_SESSION_DURATION_MINUTES,
            minimumAnswersRequiredToValidateACertification: 123,
            comments: 'COUCOU',
            status: VERSION_STATUSES.ACTIVE,
            globalScoringConfiguration: [{ meshLevel: 0, bounds: { min: -8, max: -1.4 } }],
            competencesScoringConfiguration: [
              {
                competence: '1.1',
                values: [{ bounds: { max: -2, min: -10 }, competenceLevel: 0 }],
              },
            ],
            challengesConfiguration,
            tubeIds: ['rec123', 'rec456', 'rec789'],
          })
          .insertToDB({ databaseBuilder });
        const alteredVersion = domainBuilder.certification.configuration
          .versionBuilder()
          .copy(version)
          .withParameters({
            assessmentDuration: 11111,
            minimumAnswersRequiredToValidateACertification: 22222,
            comments: 'COUCOU',
          })
          .build();

        // when
        await versionRepository.save(alteredVersion);

        // then
        const savedVersion = await versionRepository.getById({ id: version.id });
        expect(savedVersion).to.deepEqualInstance(alteredVersion);
      });
    });
  });

  describe('#findAllByScope', function () {
    it('returns all the versions of a given scope', async function () {
      // given
      const scope = SCOPES.PIX_PLUS_DROIT;

      const oldConfig = {
        maximumAssessmentLength: 32,
        challengesBetweenSameCompetence: 2,
        limitToOneQuestionPerTube: false,
        enablePassageByAllCompetences: false,
        variationPercent: 0.25,
        defaultCandidateCapacity: -1,
        defaultProbabilityToPickChallenge: 10,
      };
      const archivedVersion = domainBuilder.certification.configuration
        .versionBuilder()
        .asArchived({ startDate: new Date('2025-01-01'), expirationDate: new Date('2025-05-31') })
        .withParameters({
          scope,
          tubeIds: ['rec123', 'rec5678'],
          id: 1000,
          assessmentDuration: 90,
          globalScoringConfiguration: [{ config: 'old' }],
          competencesScoringConfiguration: [{ config: 'old' }],
          challengesConfiguration: oldConfig,
        })
        .insertToDB({ databaseBuilder });

      const middleConfig = {
        maximumAssessmentLength: 31,
        challengesBetweenSameCompetence: 2,
        limitToOneQuestionPerTube: false,
        enablePassageByAllCompetences: false,
        variationPercent: 0.25,
        defaultCandidateCapacity: -2,
        defaultProbabilityToPickChallenge: 20,
      };
      const archivedVersion2 = domainBuilder.certification.configuration
        .versionBuilder()
        .asArchived({ startDate: new Date('2025-03-01'), expirationDate: new Date('2025-08-31') })
        .withParameters({
          scope,
          tubeIds: ['rec123', 'rec5678'],
          id: 10000,
          assessmentDuration: 100,
          globalScoringConfiguration: [{ config: 'middle' }],
          competencesScoringConfiguration: [{ config: 'middle' }],
          challengesConfiguration: middleConfig,
        })
        .insertToDB({ databaseBuilder });

      const activeConfig = {
        maximumAssessmentLength: 30,
        challengesBetweenSameCompetence: 2,
        limitToOneQuestionPerTube: false,
        enablePassageByAllCompetences: false,
        variationPercent: 0.25,
        defaultCandidateCapacity: -3,
        defaultProbabilityToPickChallenge: 30,
      };

      const activeVersion = domainBuilder.certification.configuration
        .versionBuilder()
        .asActive({ startDate: new Date('2025-06-01') })
        .withParameters({
          scope,
          tubeIds: ['rec123', 'rec5678'],
          id: 100,
          assessmentDuration: 120,
          globalScoringConfiguration: [{ config: 'latest' }],
          competencesScoringConfiguration: [{ config: 'latest' }],
          challengesConfiguration: activeConfig,
        })
        .insertToDB({ databaseBuilder });

      const aWeDoNotCareConfig = {
        maximumAssessmentLength: 29,
        challengesBetweenSameCompetence: 2,
        limitToOneQuestionPerTube: false,
        enablePassageByAllCompetences: false,
        variationPercent: 0.25,
        defaultCandidateCapacity: -8,
        defaultProbabilityToPickChallenge: 40,
      };
      const aScopeWeAreNotInterestedIn = SCOPES.CORE;
      domainBuilder.certification.configuration
        .versionBuilder()
        .asActive({ startDate: new Date('2025-10-01') })
        .withParameters({
          scope: aScopeWeAreNotInterestedIn,
          tubeIds: ['rec123', 'rec5678'],
          id: 2,
          assessmentDuration: 150,
          globalScoringConfiguration: [{ other: 'scope' }],
          challengesConfiguration: aWeDoNotCareConfig,
        })
        .insertToDB({ databaseBuilder });

      await databaseBuilder.commit();

      // when
      const versions = await versionRepository.findAllByScope({ scope });

      // then
      expect(versions).to.deepEqualArray([activeVersion, archivedVersion, archivedVersion2]);
    });

    context('when no version exists for the scope', function () {
      it('return an empty array', async function () {
        // given
        const scope = SCOPES.PIX_PLUS_EDU_CPE;

        domainBuilder.certification.configuration
          .versionBuilder()
          .asActive({ startDate: new Date('2025-01-01') })
          .withParameters({ scope: SCOPES.CORE, tubeIds: ['rec123'], assessmentDuration: 90 })
          .insertToDB({ databaseBuilder });

        await databaseBuilder.commit();

        // when
        const versions = await versionRepository.findAllByScope({ scope });

        // then
        expect(versions).to.deepEqualArray([]);
      });
    });
  });

  describe('#getById', function () {
    it('should return the version with the given id', async function () {
      // given
      const scope = SCOPES.PIX_PLUS_DROIT;
      const expectedConfig = {
        maximumAssessmentLength: 30,
        challengesBetweenSameCompetence: 2,
        limitToOneQuestionPerTube: false,
        enablePassageByAllCompetences: false,
        variationPercent: 0.25,
        defaultCandidateCapacity: 1,
        defaultProbabilityToPickChallenge: 51,
      };
      const version = domainBuilder.certification.configuration
        .versionBuilder()
        .asArchived({ startDate: new Date('2025-06-01'), expirationDate: new Date('2025-12-31') })
        .withParameters({
          scope,
          tubeIds: ['rec123', 'rec5678'],
          assessmentDuration: 120,
          globalScoringConfiguration: [{ config: 'test' }],
          competencesScoringConfiguration: [{ config: 'test' }],
          challengesConfiguration: expectedConfig,
        })
        .insertToDB({ databaseBuilder });

      await databaseBuilder.commit();

      // when
      const result = await versionRepository.getById({ id: version.id });

      // then
      expect(result).to.be.instanceOf(Version);
      expect(result.id).to.equal(version.id);
      expect(result.scope).to.equal(scope);
      expect(result.startDate).to.deep.equal(new Date('2025-06-01'));
      expect(result.expirationDate).to.deep.equal(new Date('2025-12-31'));
      expect(result.assessmentDuration).to.equal(120);
      expect(result.globalScoringConfiguration).to.deep.equal([{ config: 'test' }]);
      expect(result.competencesScoringConfiguration).to.deep.equal([{ config: 'test' }]);
      expect(result.challengesConfiguration).to.deep.equal(expectedConfig);
      expect(result.tubeIds).to.deep.equal(['rec123', 'rec5678']);
    });

    context('when the version does not exist', function () {
      it('should throw a NotFoundError', async function () {
        // given
        const nonExistentVersionId = 99999;

        // when
        const error = await catchErr(versionRepository.getById)({ id: nonExistentVersionId });

        // then
        expect(error).to.deepEqualInstance(new NotFoundError(`Version with id ${nonExistentVersionId} not found`));
      });
    });
  });

  describe('#getFrameworkHistory', function () {
    it('should return an empty array when there is no framework history', async function () {
      // given
      const scope = SCOPES.PIX_PLUS_DROIT;

      // when
      const frameworkHistory = await versionRepository.getFrameworkHistory({ scope });

      // then
      expect(frameworkHistory).to.deep.equal([]);
    });

    it('should return the framework history ordered by start date descending', async function () {
      // given
      const scope = SCOPES.PIX_PLUS_DROIT;
      const otherScope = SCOPES.CLEA;

      const version1Config = { maximumAssessmentLength: 1 };
      const version1 = domainBuilder.certification.configuration
        .versionBuilder()
        .asActive({ startDate: new Date('2024-03-15') })
        .withParameters({ scope, tubeIds: ['rec123'], assessmentDuration: 90, challengesConfiguration: version1Config })
        .insertToDB({ databaseBuilder });
      const version2Config = { maximumAssessmentLength: 2 };
      const version2 = domainBuilder.certification.configuration
        .versionBuilder()
        .withParameters({ scope, tubeIds: ['rec123'], assessmentDuration: 80, challengesConfiguration: version2Config })
        .insertToDB({ databaseBuilder });
      const version3Config = { maximumAssessmentLength: 3 };
      const version3 = domainBuilder.certification.configuration
        .versionBuilder()
        .asArchived({ startDate: new Date('2024-03-10'), expirationDate: new Date('2024-03-14') })
        .withParameters({ scope, tubeIds: ['rec123'], assessmentDuration: 50, challengesConfiguration: version3Config })
        .insertToDB({ databaseBuilder });
      domainBuilder.certification.configuration
        .versionBuilder()
        .asActive({ startDate: new Date('2025-06-21') })
        .withParameters({
          scope: otherScope,
          tubeIds: ['rec123'],
          assessmentDuration: 60,
          challengesConfiguration: { maximumAssessmentLength: 4 },
        })
        .insertToDB({ databaseBuilder });

      await databaseBuilder.commit();

      // when
      const frameworkHistory = await versionRepository.getFrameworkHistory({ scope });

      // then
      expect(frameworkHistory).to.deep.equal([
        domainBuilder.certification.configuration.buildFrameworkHistoryEntry({
          id: version2.id,
          startDate: version2.startDate,
          expirationDate: version2.expirationDate,
          assessmentDuration: version2.assessmentDuration,
          maximumAssessmentLength: version2Config.maximumAssessmentLength,
          status: VERSION_STATUSES.DRAFT,
        }),
        domainBuilder.certification.configuration.buildFrameworkHistoryEntry({
          id: version1.id,
          startDate: version1.startDate,
          expirationDate: version1.expirationDate,
          assessmentDuration: version1.assessmentDuration,
          maximumAssessmentLength: version1Config.maximumAssessmentLength,
          status: VERSION_STATUSES.ACTIVE,
        }),
        domainBuilder.certification.configuration.buildFrameworkHistoryEntry({
          id: version3.id,
          startDate: version3.startDate,
          expirationDate: version3.expirationDate,
          assessmentDuration: version3.assessmentDuration,
          maximumAssessmentLength: version3Config.maximumAssessmentLength,
          status: VERSION_STATUSES.ARCHIVED,
        }),
      ]);
    });
  });

  describe('#findAll', function () {
    it('should return all the versions ordered by id', async function () {
      // given
      const scopeDroit = Frameworks.DROIT;
      const expectedConfigDroit = {
        maximumAssessmentLength: 30,
        challengesBetweenSameCompetence: 2,
        limitToOneQuestionPerTube: false,
        enablePassageByAllCompetences: false,
        variationPercent: 0.25,
        defaultCandidateCapacity: 1,
        defaultProbabilityToPickChallenge: 51,
      };
      const versionDroit = domainBuilder.certification.configuration
        .versionBuilder()
        .asArchived({ startDate: new Date('2025-06-01'), expirationDate: new Date('2025-12-31') })
        .withParameters({
          scope: scopeDroit,
          tubeIds: ['rec1234', 'rec5678'],
          id: 3,
          assessmentDuration: 120,
          minimumAnswersRequiredToValidateACertification: 1,
          globalScoringConfiguration: [{ config: 'testDroit' }],
          competencesScoringConfiguration: [{ config: 'testDroit' }],
          challengesConfiguration: expectedConfigDroit,
          comments: 'versionDroit',
        })
        .insertToDB({ databaseBuilder });
      const scopeCoreOld = Frameworks.CORE;
      const expectedConfigCoreOld = {
        maximumAssessmentLength: 1,
        challengesBetweenSameCompetence: 3,
        limitToOneQuestionPerTube: true,
        enablePassageByAllCompetences: true,
        variationPercent: 0.5,
        defaultCandidateCapacity: 4,
        defaultProbabilityToPickChallenge: 5,
      };
      const versionCoreOld = domainBuilder.certification.configuration
        .versionBuilder()
        .asArchived({ startDate: new Date('2024-01-01'), expirationDate: new Date('2025-12-31') })
        .withParameters({
          scope: scopeCoreOld,
          tubeIds: ['rec1234', 'rec5678'],
          id: 2,
          assessmentDuration: 66,
          minimumAnswersRequiredToValidateACertification: 2,
          globalScoringConfiguration: [{ config: 'testCoreOld' }],
          competencesScoringConfiguration: [{ config: 'testCoreOld' }],
          challengesConfiguration: expectedConfigCoreOld,
          comments: 'versionCoreOld',
        })
        .insertToDB({ databaseBuilder });
      const scopeCoreNew = Frameworks.CORE;
      const expectedConfigCoreNew = {
        maximumAssessmentLength: 10,
        challengesBetweenSameCompetence: 30,
        limitToOneQuestionPerTube: false,
        enablePassageByAllCompetences: false,
        variationPercent: 0.75,
        defaultCandidateCapacity: 40,
        defaultProbabilityToPickChallenge: 50,
      };
      const versionCoreNew = domainBuilder.certification.configuration
        .versionBuilder()
        .asActive({ startDate: new Date('2026-01-01') })
        .withParameters({
          scope: scopeCoreNew,
          tubeIds: ['rec1234', 'rec5678'],
          id: 1,
          assessmentDuration: 3,
          minimumAnswersRequiredToValidateACertification: 3,
          globalScoringConfiguration: [{ config: 'testCoreNew' }],
          competencesScoringConfiguration: [{ config: 'testCoreNew' }],
          challengesConfiguration: expectedConfigCoreNew,
          comments: 'versionCoreNew',
        })
        .insertToDB({ databaseBuilder });

      await databaseBuilder.commit();

      // when
      const result = await versionRepository.findAll();

      // then
      expect(result).to.deepEqualArray([versionCoreNew, versionCoreOld, versionDroit]);
    });
  });

  describe('#remove', function () {
    it('should delete a draft certification version ', async function () {
      const certificationVersion = domainBuilder.certification.configuration
        .versionBuilder()
        .withParameters({ scope: SCOPES.CORE, tubeIds: ['rec123'] })
        .insertToDB({ databaseBuilder });

      await databaseBuilder.commit();

      await versionRepository.remove(certificationVersion.id);

      const matchingCertificationVersions = await knex
        .from('certification_versions')
        .where({ id: certificationVersion.id });
      expect(matchingCertificationVersions).to.be.empty;

      const certificationVersionTubeIds = await knex('certification_versions_tubes').where({
        version_id: certificationVersion.id,
      });
      expect(certificationVersionTubeIds).to.be.empty;
    });
  });
});
