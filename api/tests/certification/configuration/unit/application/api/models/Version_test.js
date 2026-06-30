import {
  Version,
  VERSION_STATUSES,
} from '../../../../../../../src/certification/configuration/domain/models/Version.js';
import {
  DEFAULT_MINIMUM_ANSWERS_REQUIRED_TO_VALIDATE_A_CERTIFICATION,
  DEFAULT_PROBABILITY_TO_PICK_CHALLENGE,
  DEFAULT_SESSION_DURATION_MINUTES,
} from '../../../../../../../src/certification/shared/domain/constants.js';
import { SCOPES } from '../../../../../../../src/certification/shared/domain/models/Scopes.js';
import { expect } from '../../../../../../test-helper.js';
import { domainBuilder } from '../../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Configuration | Unit | Application | Api | Models | Version', function () {
  describe('#isDraft', function () {
    context('when the version is archived', function () {
      it('return false', function () {
        const version = domainBuilder.certification.configuration.buildVersion({
          status: VERSION_STATUSES.ARCHIVED,
        });

        expect(version.isDraft).to.be.false;
      });
    });

    context('when the version is active', function () {
      it('return false', function () {
        const version = domainBuilder.certification.configuration.buildVersion({
          status: VERSION_STATUSES.ACTIVE,
        });

        expect(version.isDraft).to.be.false;
      });
    });

    context('when the version is draft', function () {
      it('return true', function () {
        const version = domainBuilder.certification.configuration.buildVersion({
          status: VERSION_STATUSES.DRAFT,
        });

        expect(version.isDraft).to.be.true;
      });
    });
  });

  describe('#isActive', function () {
    context('when the version is archived', function () {
      it('return false', function () {
        const version = domainBuilder.certification.configuration.buildVersion({
          status: VERSION_STATUSES.ARCHIVED,
        });

        expect(version.isActive).to.be.false;
      });
    });

    context('when the version is active', function () {
      it('return true', function () {
        const version = domainBuilder.certification.configuration.buildVersion({
          status: VERSION_STATUSES.ACTIVE,
        });

        expect(version.isActive).to.be.true;
      });
    });

    context('when the version is draft', function () {
      it('return false', function () {
        const version = domainBuilder.certification.configuration.buildVersion({
          status: VERSION_STATUSES.DRAFT,
        });

        expect(version.isActive).to.be.false;
      });
    });
  });

  describe('#static buildDraftFromActiveVersion', function () {
    context('when a base version is provided', function () {
      it('returns a newly created Version model based on attributes of the base version', function () {
        const baseVersion = domainBuilder.certification.configuration.buildVersion({
          id: 1,
          scope: SCOPES.PIX_PLUS_DROIT,
          startDate: new Date(),
          expirationDate: new Date(),
          assessmentDuration: 11,
          minimumAnswersRequiredToValidateACertification: 11,
          globalScoringConfiguration: ['some globalScoringConfiguration'],
          competencesScoringConfiguration: ['some competencesScoringConfiguration'],
          challengesConfiguration: domainBuilder.buildFlashAlgorithmConfiguration({
            maximumAssessmentLength: 11,
            challengesBetweenSameCompetence: 11,
            limitToOneQuestionPerTube: false,
            enablePassageByAllCompetences: false,
            variationPercent: 0.1,
            defaultCandidateCapacity: 11,
            defaultProbabilityToPickChallenge: 11,
          }),
          status: VERSION_STATUSES.ACTIVE,
          comments: 'Some ignored value',
        });

        const newVersion = Version.buildDraftFromActiveVersion({
          scope: SCOPES.PIX_PLUS_PRO_SANTE,
          version: baseVersion,
        });

        expect(newVersion).to.deepEqualInstance(
          domainBuilder.certification.configuration.buildVersion({
            id: null,
            scope: SCOPES.PIX_PLUS_PRO_SANTE,
            startDate: null,
            expirationDate: null,
            assessmentDuration: 11,
            minimumAnswersRequiredToValidateACertification: 11,
            globalScoringConfiguration: ['some globalScoringConfiguration'],
            competencesScoringConfiguration: ['some competencesScoringConfiguration'],
            challengesConfiguration: domainBuilder.buildFlashAlgorithmConfiguration({
              maximumAssessmentLength: 11,
              challengesBetweenSameCompetence: 11,
              limitToOneQuestionPerTube: false,
              enablePassageByAllCompetences: false,
              variationPercent: 0.1,
              defaultCandidateCapacity: 11,
              defaultProbabilityToPickChallenge: 11,
            }),
            status: VERSION_STATUSES.DRAFT,
            comments: null,
          }),
        );
      });
    });

    context('when no base version is provided', function () {
      it('returns a newly created Version model built on default values', function () {
        const newVersion = Version.buildDraftFromActiveVersion({ scope: SCOPES.PIX_PLUS_PRO_SANTE, version: null });

        expect(newVersion).to.deepEqualInstance(
          domainBuilder.certification.configuration.buildVersion({
            id: null,
            scope: SCOPES.PIX_PLUS_PRO_SANTE,
            startDate: null,
            expirationDate: null,
            assessmentDuration: DEFAULT_SESSION_DURATION_MINUTES,
            minimumAnswersRequiredToValidateACertification:
              DEFAULT_MINIMUM_ANSWERS_REQUIRED_TO_VALIDATE_A_CERTIFICATION,
            globalScoringConfiguration: [],
            competencesScoringConfiguration: [],
            challengesConfiguration: domainBuilder.buildFlashAlgorithmConfiguration({
              maximumAssessmentLength: 32,
              challengesBetweenSameCompetence: 0,
              limitToOneQuestionPerTube: true,
              enablePassageByAllCompetences: true,
              variationPercent: 1,
              defaultCandidateCapacity: 0,
              defaultProbabilityToPickChallenge: DEFAULT_PROBABILITY_TO_PICK_CHALLENGE,
            }),
            status: VERSION_STATUSES.DRAFT,
            comments: null,
          }),
        );
      });
    });
  });
});
