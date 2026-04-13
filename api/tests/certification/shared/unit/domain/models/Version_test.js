import { FlashAssessmentAlgorithmConfiguration } from '../../../../../../src/certification/shared/domain/models/FlashAssessmentAlgorithmConfiguration.js';
import { SCOPES } from '../../../../../../src/certification/shared/domain/models/Scopes.js';
import { Version } from '../../../../../../src/certification/shared/domain/models/Version.js';
import { EntityValidationError } from '../../../../../../src/shared/domain/errors.js';
import { catchErrSync, expect } from '../../../../../test-helper.js';

describe('Unit | Certification | Evaluation | Domain | Models | Version', function () {
  describe('constructor', function () {
    it('should build a Version with id, scope and challengesConfiguration', function () {
      // given
      const versionData = {
        id: 123,
        scope: SCOPES.CORE,
        minimumAnswersRequiredToValidateACertification: 20,
        challengesConfiguration: new FlashAssessmentAlgorithmConfiguration({
          challengesBetweenSameCompetence: 0,
          maximumAssessmentLength: 10,
          defaultCandidateCapacity: 1,
          defaultProbabilityToPickChallenge: 51,
          limitToOneQuestionPerTube: false,
          enablePassageByAllCompetences: false,
          variationPercent: 0.5,
        }),
      };

      // when
      const version = new Version(versionData);

      // then
      expect(version).to.be.instanceOf(Version);
      expect(version.id).to.equal(123);
      expect(version.scope).to.equal(SCOPES.CORE);
      expect(version.minimumAnswersRequiredToValidateACertification).to.equal(20);
      expect(version.challengesConfiguration).to.deep.equal(
        new FlashAssessmentAlgorithmConfiguration({
          challengesBetweenSameCompetence: 0,
          maximumAssessmentLength: 10,
          defaultCandidateCapacity: 1,
          defaultProbabilityToPickChallenge: 51,
          limitToOneQuestionPerTube: false,
          enablePassageByAllCompetences: false,
          variationPercent: 0.5,
        }),
      );
    });

    it('should build a Version with PIX_PLUS_DROIT scope', function () {
      // given
      const versionData = {
        id: 456,
        scope: SCOPES.PIX_PLUS_DROIT,
        minimumAnswersRequiredToValidateACertification: 20,
        challengesConfiguration: new FlashAssessmentAlgorithmConfiguration({
          challengesBetweenSameCompetence: 0,
          maximumAssessmentLength: 10,
          defaultCandidateCapacity: -3,
          defaultProbabilityToPickChallenge: 51,
          limitToOneQuestionPerTube: false,
          enablePassageByAllCompetences: false,
          variationPercent: 0.5,
        }),
      };

      // when
      const version = new Version(versionData);

      // then
      expect(version).to.be.instanceOf(Version);
      expect(version.id).to.equal(456);
      expect(version.scope).to.equal(SCOPES.PIX_PLUS_DROIT);
      expect(version.minimumAnswersRequiredToValidateACertification).to.equal(20);
      expect(version.challengesConfiguration).to.deep.equal(
        new FlashAssessmentAlgorithmConfiguration({
          challengesBetweenSameCompetence: 0,
          maximumAssessmentLength: 10,
          defaultCandidateCapacity: -3,
          defaultProbabilityToPickChallenge: 51,
          limitToOneQuestionPerTube: false,
          enablePassageByAllCompetences: false,
          variationPercent: 0.5,
        }),
      );
    });

    it('should throw an EntityValidationError when id is missing', function () {
      // given
      const invalidData = {
        scope: SCOPES.CORE,
        minimumAnswersRequiredToValidateACertification: 123,
        challengesConfiguration: { config: 'test' },
      };

      // when
      const error = catchErrSync(() => new Version(invalidData))();

      // then
      expect(error).to.be.instanceOf(EntityValidationError);
    });

    it('should throw an EntityValidationError when id is not a number', function () {
      // given
      const invalidData = {
        id: 'not-a-number',
        scope: SCOPES.CORE,
        minimumAnswersRequiredToValidateACertification: 123,
        challengesConfiguration: { config: 'test' },
      };

      // when
      const error = catchErrSync(() => new Version(invalidData))();

      // then
      expect(error).to.be.instanceOf(EntityValidationError);
    });

    it('should throw an EntityValidationError when scope is missing', function () {
      // given
      const invalidData = {
        id: 123,
        minimumAnswersRequiredToValidateACertification: 123,
        challengesConfiguration: { config: 'test' }
      };

      // when
      const error = catchErrSync(() => new Version(invalidData))();

      // then
      expect(error).to.be.instanceOf(EntityValidationError);
    });

    it('should throw an EntityValidationError when minimumAnswersRequiredToValidateACertification is missing', function () {
      // given
      const invalidData = {
        id: 123,
        scope: SCOPES.CORE,
        challengesConfiguration: { config: 'test' }
      };

      // when
      const error = catchErrSync(() => new Version(invalidData))();

      // then
      expect(error).to.be.instanceOf(EntityValidationError);
    });

    it('should throw an EntityValidationError when minimumAnswersRequiredToValidateACertification is not a number', function () {
      // given
      const invalidData = {
        id: 123,
        scope: SCOPES.CORE,
        minimumAnswersRequiredToValidateACertification: 'not-a-number',
        challengesConfiguration: { config: 'test' }
      };

      // when
      const error = catchErrSync(() => new Version(invalidData))();

      // then
      expect(error).to.be.instanceOf(EntityValidationError);
    });

    it('should throw an EntityValidationError when scope is invalid', function () {
      // given
      const invalidData = {
        id: 123,
        scope: 'INVALID_SCOPE',
      };

      // when
      const error = catchErrSync(() => new Version(invalidData))();

      // then
      expect(error).to.be.instanceOf(EntityValidationError);
    });

    it('should throw an EntityValidationError when challengesConfiguration is missing', function () {
      // given
      const invalidData = {
        id: 123,
        scope: SCOPES.CORE,
      };

      // when
      const error = catchErrSync(() => new Version(invalidData))();

      // then
      expect(error).to.be.instanceOf(EntityValidationError);
    });

    it('should throw an EntityValidationError when challengesConfiguration is invalid', function () {
      // given
      const invalidData = {
        id: 123,
        scope: SCOPES.CORE,
        challengesConfiguration: { defaultCandidateCapacity: 'not-a-number' },
      };

      // when
      const error = catchErrSync(() => new Version(invalidData))();

      // then
      expect(error).to.be.instanceOf(EntityValidationError);
    });
  });
});
