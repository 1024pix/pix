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
  describe('#create', function () {
    it('should create a certification version', async function () {
      // given
      const challengesConfiguration = {
        maximumAssessmentLength: 32,
        limitToOneQuestionPerTube: true,
        defaultCandidateCapacity: -8,
      };
      const version = domainBuilder.certification.configuration.buildVersion({
        scope: SCOPES.PIX_PLUS_DROIT,
        startDate: new Date('2025-06-01'),
        expirationDate: new Date('2025-12-31'),
        assessmentDuration: DEFAULT_SESSION_DURATION_MINUTES,
        globalScoringConfiguration: [{ meshLevel: 0, bounds: { min: -8, max: -1.4 } }],
        competencesScoringConfiguration: [
          {
            competence: '1.1',
            values: [{ bounds: { max: -2, min: -10 }, competenceLevel: 0 }],
          },
        ],
        challengesConfiguration,
      });

      await databaseBuilder.commit();

      // when
      const versionId = await versionRepository.create(version);

      // then
      const results = await knex('certification_versions')
        .select(
          'id',
          'scope',
          'startDate',
          'expirationDate',
          'assessmentDuration',
          'globalScoringConfiguration',
          'competencesScoringConfiguration',
          'challengesConfiguration',
        )
        .where({ id: versionId })
        .first();

      expect(results).to.deep.equal({
        id: versionId,
        scope: version.scope,
        startDate: version.startDate,
        expirationDate: version.expirationDate,
        assessmentDuration: version.assessmentDuration,
        globalScoringConfiguration: version.globalScoringConfiguration,
        competencesScoringConfiguration: version.competencesScoringConfiguration,
        challengesConfiguration: version.challengesConfiguration,
      });
    });
  });

  describe('#update', function () {
    it('should update the expiration date, challenges configuration and comments of a certification version', async function () {
      // given
      const initialChallengesConfiguration = domainBuilder.buildFlashAlgorithmConfiguration({
        maximumAssessmentLength: 20,
        limitToOneQuestionPerTube: false,
      });
      const existingVersion = databaseBuilder.factory.buildCertificationVersion({
        scope: SCOPES.PIX_PLUS_DROIT,
        startDate: new Date('2024-01-01'),
        expirationDate: null,
        assessmentDuration: DEFAULT_SESSION_DURATION_MINUTES,
        challengesConfiguration: initialChallengesConfiguration,
      });

      await databaseBuilder.commit();

      const newExpirationDate = new Date('2025-10-21T10:00:00Z');
      const newComments = 'New comments';
      const newChallengesConfiguration = {
        maximumAssessmentLength: 32,
        limitToOneQuestionPerTube: true,
        defaultCandidateCapacity: 1,
      };
      const versionToUpdate = domainBuilder.certification.configuration.buildVersion({
        id: existingVersion.id,
        scope: existingVersion.scope,
        startDate: existingVersion.startDate,
        expirationDate: newExpirationDate,
        assessmentDuration: existingVersion.assessmentDuration,
        challengesConfiguration: newChallengesConfiguration,
        comments: newComments,
      });

      // when
      await versionRepository.update({ version: versionToUpdate });

      // then
      const updatedVersion = await knex('certification_versions').where({ id: existingVersion.id }).first();

      expect(updatedVersion.expirationDate).to.deep.equal(newExpirationDate);
      expect(updatedVersion.challengesConfiguration).to.deep.equal(versionToUpdate.challengesConfiguration);
      expect(updatedVersion.scope).to.equal(existingVersion.scope);
      expect(updatedVersion.startDate).to.deep.equal(existingVersion.startDate);
      expect(updatedVersion.comments).to.equal(newComments);
    });

    it('updates the comments to null if given an empty string', async function () {
      // given
      const initialChallengesConfiguration = domainBuilder.buildFlashAlgorithmConfiguration({
        maximumAssessmentLength: 20,
        limitToOneQuestionPerTube: false,
      });
      const existingVersion = databaseBuilder.factory.buildCertificationVersion({
        scope: SCOPES.PIX_PLUS_DROIT,
        startDate: new Date('2024-01-01'),
        expirationDate: null,
        assessmentDuration: DEFAULT_SESSION_DURATION_MINUTES,
        challengesConfiguration: initialChallengesConfiguration,
      });

      await databaseBuilder.commit();

      const versionToUpdate = domainBuilder.certification.configuration.buildVersion({
        id: existingVersion.id,
        scope: existingVersion.scope,
        startDate: existingVersion.startDate,
        expirationDate: existingVersion.expirationDate,
        assessmentDuration: existingVersion.assessmentDuration,
        challengesConfiguration: existingVersion.challengesConfiguration,
        comments: '',
      });

      // when
      await versionRepository.update({ version: versionToUpdate });

      // then
      const updatedVersion = await knex('certification_versions').where({ id: existingVersion.id }).first();
      expect(updatedVersion.comments).to.equal(null);
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
      databaseBuilder.factory.buildCertificationVersion({
        id: 1000,
        scope,
        startDate: new Date('2025-01-01'),
        expirationDate: new Date('2025-05-31'),
        assessmentDuration: 90,
        globalScoringConfiguration: [{ config: 'old' }],
        competencesScoringConfiguration: [{ config: 'old' }],
        challengesConfiguration: oldConfig,
      });

      const middleConfig = {
        maximumAssessmentLength: 31,
        challengesBetweenSameCompetence: 2,
        limitToOneQuestionPerTube: false,
        enablePassageByAllCompetences: false,
        variationPercent: 0.25,
        defaultCandidateCapacity: -2,
        defaultProbabilityToPickChallenge: 20,
      };
      databaseBuilder.factory.buildCertificationVersion({
        id: 10000,
        scope,
        startDate: new Date('2025-03-01'),
        expirationDate: new Date('2025-08-31'),
        assessmentDuration: 100,
        globalScoringConfiguration: [{ config: 'middle' }],
        competencesScoringConfiguration: [{ config: 'middle' }],
        challengesConfiguration: middleConfig,
      });

      const activeConfig = {
        maximumAssessmentLength: 30,
        challengesBetweenSameCompetence: 2,
        limitToOneQuestionPerTube: false,
        enablePassageByAllCompetences: false,
        variationPercent: 0.25,
        defaultCandidateCapacity: -3,
        defaultProbabilityToPickChallenge: 30,
      };

      databaseBuilder.factory.buildCertificationVersion({
        id: 100,
        scope,
        startDate: new Date('2025-06-01'),
        expirationDate: null,
        assessmentDuration: 120,
        globalScoringConfiguration: [{ config: 'latest' }],
        competencesScoringConfiguration: [{ config: 'latest' }],
        challengesConfiguration: activeConfig,
      });

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
      databaseBuilder.factory.buildCertificationVersion({
        id: 2,
        scope: aScopeWeAreNotInterestedIn,
        startDate: new Date('2025-10-01'),
        expirationDate: null,
        assessmentDuration: 150,
        globalScoringConfiguration: [{ other: 'scope' }],
        competencesScoringConfiguration: null,
        challengesConfiguration: aWeDoNotCareConfig,
      });

      await databaseBuilder.commit();

      // when
      const versions = await versionRepository.findAllByScope({ scope });

      // then
      expect(versions).to.deepEqualArray([
        domainBuilder.certification.configuration.buildVersion({
          id: 100,
          scope,
          startDate: new Date('2025-06-01'),
          expirationDate: null,
          assessmentDuration: 120,
          globalScoringConfiguration: [{ config: 'latest' }],
          competencesScoringConfiguration: [{ config: 'latest' }],
          challengesConfiguration: activeConfig,
        }),
        domainBuilder.certification.configuration.buildVersion({
          id: 1000,
          scope,
          startDate: new Date('2025-01-01'),
          expirationDate: new Date('2025-05-31'),
          assessmentDuration: 90,
          globalScoringConfiguration: [{ config: 'old' }],
          competencesScoringConfiguration: [{ config: 'old' }],
          challengesConfiguration: oldConfig,
        }),
        domainBuilder.certification.configuration.buildVersion({
          id: 10000,
          scope,
          startDate: new Date('2025-03-01'),
          expirationDate: new Date('2025-08-31'),
          assessmentDuration: 100,
          globalScoringConfiguration: [{ config: 'middle' }],
          competencesScoringConfiguration: [{ config: 'middle' }],
          challengesConfiguration: middleConfig,
        }),
      ]);
    });

    context('when no version exists for the scope', function () {
      it('return an empty array', async function () {
        // given
        const scope = SCOPES.PIX_PLUS_EDU_CPE;

        databaseBuilder.factory.buildCertificationVersion({
          scope: SCOPES.CORE,
          startDate: new Date('2025-01-01'),
          expirationDate: null,
          assessmentDuration: 90,
          globalScoringConfiguration: null,
          competencesScoringConfiguration: null,
          challengesConfiguration: { config: 'test' },
        });

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
      const versionId = databaseBuilder.factory.buildCertificationVersion({
        scope,
        startDate: new Date('2025-06-01'),
        expirationDate: new Date('2025-12-31'),
        assessmentDuration: 120,
        globalScoringConfiguration: [{ config: 'test' }],
        competencesScoringConfiguration: [{ config: 'test' }],
        challengesConfiguration: expectedConfig,
      }).id;

      await databaseBuilder.commit();

      // when
      const result = await versionRepository.getById({ id: versionId });

      // then
      expect(result).to.be.instanceOf(Version);
      expect(result.id).to.equal(versionId);
      expect(result.scope).to.equal(scope);
      expect(result.startDate).to.deep.equal(new Date('2025-06-01'));
      expect(result.expirationDate).to.deep.equal(new Date('2025-12-31'));
      expect(result.assessmentDuration).to.equal(120);
      expect(result.globalScoringConfiguration).to.deep.equal([{ config: 'test' }]);
      expect(result.competencesScoringConfiguration).to.deep.equal([{ config: 'test' }]);
      expect(result.challengesConfiguration).to.deep.equal(expectedConfig);
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
      const version1 = databaseBuilder.factory.buildCertificationVersion({
        scope,
        startDate: new Date('2024-03-15'),
        assessmentDuration: 90,
        challengesConfiguration: version1Config,
        status: VERSION_STATUSES.ACTIVE,
      });
      const version2Config = { maximumAssessmentLength: 2 };
      const version2 = databaseBuilder.factory.buildCertificationVersion({
        scope,
        startDate: null,
        assessmentDuration: 80,
        challengesConfiguration: version2Config,
        status: VERSION_STATUSES.DRAFT,
      });
      const version3Config = { maximumAssessmentLength: 3 };
      const version3 = databaseBuilder.factory.buildCertificationVersion({
        scope,
        startDate: new Date('2024-03-10'),
        expirationDate: new Date('2024-03-14'),
        assessmentDuration: 50,
        challengesConfiguration: version3Config,
        status: VERSION_STATUSES.ARCHIVED,
      });
      databaseBuilder.factory.buildCertificationVersion({
        scope: otherScope,
        startDate: new Date('2025-06-21'),
        assessmentDuration: 60,
        challengesConfiguration: { maximumAssessmentLength: 4 },
        status: VERSION_STATUSES.ACTIVE,
      });

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
      const versionIdDroit = databaseBuilder.factory.buildCertificationVersion({
        id: 3,
        scope: scopeDroit,
        startDate: new Date('2025-06-01'),
        expirationDate: new Date('2025-12-31'),
        assessmentDuration: 120,
        minimumAnswersRequiredToValidateACertification: 1,
        globalScoringConfiguration: [{ config: 'testDroit' }],
        competencesScoringConfiguration: [{ config: 'testDroit' }],
        challengesConfiguration: expectedConfigDroit,
        comments: 'versionDroit',
      }).id;
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
      const versionIdCoreOld = databaseBuilder.factory.buildCertificationVersion({
        id: 2,
        scope: scopeCoreOld,
        startDate: new Date('2024-01-01'),
        expirationDate: new Date('2025-12-31'),
        assessmentDuration: 66,
        minimumAnswersRequiredToValidateACertification: 2,
        globalScoringConfiguration: [{ config: 'testCoreOld' }],
        competencesScoringConfiguration: [{ config: 'testCoreOld' }],
        challengesConfiguration: expectedConfigCoreOld,
        comments: 'versionCoreOld',
      }).id;
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
      const versionIdCoreNew = databaseBuilder.factory.buildCertificationVersion({
        id: 1,
        scope: scopeCoreNew,
        startDate: new Date('2026-01-01'),
        expirationDate: null,
        assessmentDuration: 3,
        minimumAnswersRequiredToValidateACertification: 3,
        globalScoringConfiguration: [{ config: 'testCoreNew' }],
        competencesScoringConfiguration: [{ config: 'testCoreNew' }],
        challengesConfiguration: expectedConfigCoreNew,
        comments: 'versionCoreNew',
      }).id;
      await databaseBuilder.commit();

      // when
      const result = await versionRepository.findAll();

      // then
      expect(result).to.deepEqualArray([
        domainBuilder.certification.configuration.buildVersion({
          id: versionIdCoreNew,
          scope: scopeCoreNew,
          startDate: new Date('2026-01-01'),
          expirationDate: null,
          assessmentDuration: 3,
          minimumAnswersRequiredToValidateACertification: 3,
          globalScoringConfiguration: [{ config: 'testCoreNew' }],
          competencesScoringConfiguration: [{ config: 'testCoreNew' }],
          challengesConfiguration: expectedConfigCoreNew,
          comments: 'versionCoreNew',
        }),
        domainBuilder.certification.configuration.buildVersion({
          id: versionIdCoreOld,
          scope: scopeCoreOld,
          startDate: new Date('2024-01-01'),
          expirationDate: new Date('2025-12-31'),
          assessmentDuration: 66,
          minimumAnswersRequiredToValidateACertification: 2,
          globalScoringConfiguration: [{ config: 'testCoreOld' }],
          competencesScoringConfiguration: [{ config: 'testCoreOld' }],
          challengesConfiguration: expectedConfigCoreOld,
          comments: 'versionCoreOld',
        }),
        domainBuilder.certification.configuration.buildVersion({
          id: versionIdDroit,
          scope: scopeDroit,
          startDate: new Date('2025-06-01'),
          expirationDate: new Date('2025-12-31'),
          assessmentDuration: 120,
          minimumAnswersRequiredToValidateACertification: 1,
          globalScoringConfiguration: [{ config: 'testDroit' }],
          competencesScoringConfiguration: [{ config: 'testDroit' }],
          challengesConfiguration: expectedConfigDroit,
          comments: 'versionDroit',
        }),
      ]);
    });
  });

  describe('#deleteVersion', function () {
    it('should return delete a draft certification version ', async function () {
      const certificationVersionId = databaseBuilder.factory.buildCertificationVersion({
        startDate: null,
        expirationDate: null,
      }).id;
      await databaseBuilder.commit();

      await versionRepository.deleteVersion(certificationVersionId);

      const matchingCertificationVersions = await knex
        .from('certification_versions')
        .where({ id: certificationVersionId });
      expect(matchingCertificationVersions).to.be.empty;
    });
  });
});
