import { Version } from '../../../../../../src/certification/configuration/domain/models/Version.js';
import * as versionsRepository from '../../../../../../src/certification/configuration/infrastructure/repositories/versions-repository.js';
import { DEFAULT_SESSION_DURATION_MINUTES } from '../../../../../../src/certification/shared/domain/constants.js';
import { SCOPES } from '../../../../../../src/certification/shared/domain/models/Scopes.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, databaseBuilder, domainBuilder, expect, knex } from '../../../../../test-helper.js';

describe('Certification | Configuration | Integration | Repository | Versions', function () {
  describe('#create', function () {
    it('should create a certification version and link challenges', async function () {
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

      databaseBuilder.factory.buildComplementaryCertification({ key: version.scope });
      const challenge1 = databaseBuilder.factory.learningContent.buildChallenge({ id: 'challenge1' });
      const challenge2 = databaseBuilder.factory.learningContent.buildChallenge({ id: 'challenge2' });

      await databaseBuilder.commit();

      // when
      const versionId = await versionsRepository.create({ version, challenges: [challenge1, challenge2] });

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
        .where({ scope: version.scope })
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

      const linkedChallenges = await knex('certification-frameworks-challenges')
        .where({ versionId })
        .orderBy('challengeId');

      expect(linkedChallenges).to.have.lengthOf(2);
      expect(linkedChallenges[0]).to.include({
        challengeId: challenge1.id,
        versionId,
      });
      expect(linkedChallenges[1]).to.include({
        challengeId: challenge2.id,
        versionId,
      });
    });
  });

  describe('#update', function () {
    it('should update the expiration date and challenges configuration of a certification version', async function () {
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
      });

      // when
      await versionsRepository.update({ version: versionToUpdate });

      // then
      const updatedVersion = await knex('certification_versions').where({ id: existingVersion.id }).first();

      expect(updatedVersion.expirationDate).to.deep.equal(newExpirationDate);
      expect(updatedVersion.challengesConfiguration).to.deep.equal(versionToUpdate.challengesConfiguration);
      expect(updatedVersion.scope).to.equal(existingVersion.scope);
      expect(updatedVersion.startDate).to.deep.equal(existingVersion.startDate);
    });
  });

  describe('#findActiveByScope', function () {
    it('should return the current version for the given scope', async function () {
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
        scope,
        startDate: new Date('2025-03-01'),
        expirationDate: new Date('2025-08-31'),
        assessmentDuration: 100,
        globalScoringConfiguration: [{ config: 'middle' }],
        competencesScoringConfiguration: [{ config: 'middle' }],
        challengesConfiguration: middleConfig,
      });

      const expectedConfig = {
        maximumAssessmentLength: 30,
        challengesBetweenSameCompetence: 2,
        limitToOneQuestionPerTube: false,
        enablePassageByAllCompetences: false,
        variationPercent: 0.25,
        defaultCandidateCapacity: -3,
        defaultProbabilityToPickChallenge: 30,
      };
      const expectedVersionId = databaseBuilder.factory.buildCertificationVersion({
        scope,
        startDate: new Date('2025-06-01'),
        expirationDate: null,
        assessmentDuration: 120,
        globalScoringConfiguration: [{ config: 'latest' }],
        competencesScoringConfiguration: [{ config: 'latest' }],
        challengesConfiguration: expectedConfig,
      }).id;

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
      const result = await versionsRepository.findActiveByScope({ scope });

      // then
      expect(result).to.be.instanceOf(Version);
      expect(result.id).to.equal(expectedVersionId);
      expect(result.scope).to.equal(scope);
      expect(result.startDate).to.deep.equal(new Date('2025-06-01'));
      expect(result.expirationDate).to.be.null;
      expect(result.assessmentDuration).to.equal(120);
      expect(result.globalScoringConfiguration).to.deep.equal([{ config: 'latest' }]);
      expect(result.competencesScoringConfiguration).to.deep.equal([{ config: 'latest' }]);
      expect(result.challengesConfiguration).to.deep.equal(expectedConfig);
    });

    context('when no version exists for the scope', function () {
      it('should return null', async function () {
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
        const result = await versionsRepository.findActiveByScope({ scope });

        // then
        expect(result).to.be.null;
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
      const result = await versionsRepository.getById({ id: versionId });

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
        const error = await catchErr(versionsRepository.getById)({ id: nonExistentVersionId });

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
      const frameworkHistory = await versionsRepository.getFrameworkHistory({ scope });

      // then
      expect(frameworkHistory).to.deep.equal([]);
    });

    it('should return the framework history ordered by start date descending', async function () {
      // given
      const scope = SCOPES.PIX_PLUS_DROIT;
      const otherScope = SCOPES.CLEA;

      const version1 = databaseBuilder.factory.buildCertificationVersion({
        scope,
        startDate: new Date('2024-03-15'),
        assessmentDuration: 90,
        challengesConfiguration: {},
      });
      const version2 = databaseBuilder.factory.buildCertificationVersion({
        scope,
        startDate: new Date('2025-06-21'),
        assessmentDuration: 90,
        challengesConfiguration: {},
      });
      const version3 = databaseBuilder.factory.buildCertificationVersion({
        scope,
        startDate: new Date('2026-01-01'),
        assessmentDuration: 90,
        challengesConfiguration: {},
      });
      databaseBuilder.factory.buildCertificationVersion({
        scope: otherScope,
        startDate: new Date('2025-06-21'),
        assessmentDuration: 90,
        challengesConfiguration: {},
      });

      await databaseBuilder.commit();

      // when
      const frameworkHistory = await versionsRepository.getFrameworkHistory({ scope });

      // then
      expect(frameworkHistory).to.deep.equal([
        { id: version3.id, startDate: version3.startDate, expirationDate: version3.expirationDate },
        { id: version2.id, startDate: version2.startDate, expirationDate: version2.expirationDate },
        { id: version1.id, startDate: version1.startDate, expirationDate: version1.expirationDate },
      ]);
    });
  });
});
