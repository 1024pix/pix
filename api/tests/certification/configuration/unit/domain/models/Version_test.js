import { Version } from '../../../../../../src/certification/configuration/domain/models/Version.js';
import {
  DEFAULT_MINIMUM_ANSWERS_REQUIRED_TO_VALIDATE_A_CERTIFICATION,
  DEFAULT_PROBABILITY_TO_PICK_CHALLENGE,
  DEFAULT_SESSION_DURATION_MINUTES,
} from '../../../../../../src/certification/shared/domain/constants.js';
import { SCOPES } from '../../../../../../src/certification/shared/domain/models/Scopes.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Configuration | Unit | Domain | Models | Version', function () {
  describe('#static buildFromVersion', function () {
    context('when a base version is provided', function () {
      it('returns a newly created Version model based on attributes of the base version', function () {
        const baseVersion = domainBuilder.certification.configuration.buildVersion({
          id: 1,
          scope: SCOPES.PIX_PLUS_DROIT,
          startDate: new Date(),
          expirationDate: new Date(),
          assessmentDuration: 11,
          minimumAnswersRequiredToValidateACertification: 11,
          globalScoringConfiguration: ['some ignored value'],
          competencesScoringConfiguration: ['some ignored value'],
          challengesConfiguration: domainBuilder.certification.shared.buildFlashAssessmentAlgorithmConfiguration({
            maximumAssessmentLength: 11,
            challengesBetweenSameCompetence: 11,
            limitToOneQuestionPerTube: false,
            enablePassageByAllCompetences: false,
            variationPercent: 0.1,
            defaultCandidateCapacity: 11,
            defaultProbabilityToPickChallenge: 11,
          }),
          comments: 'Some ignored value',
        });

        const newVersion = Version.buildFromVersion({ scope: SCOPES.PIX_PLUS_PRO_SANTE, version: baseVersion });

        expect(newVersion).to.deepEqualInstance(
          domainBuilder.certification.configuration.buildVersion({
            id: undefined,
            scope: SCOPES.PIX_PLUS_PRO_SANTE,
            startDate: null,
            expirationDate: null,
            assessmentDuration: 11,
            minimumAnswersRequiredToValidateACertification: 11,
            globalScoringConfiguration: [],
            competencesScoringConfiguration: [],
            challengesConfiguration: domainBuilder.certification.shared.buildFlashAssessmentAlgorithmConfiguration({
              maximumAssessmentLength: 11,
              challengesBetweenSameCompetence: 11,
              limitToOneQuestionPerTube: false,
              enablePassageByAllCompetences: false,
              variationPercent: 0.1,
              defaultCandidateCapacity: 11,
              defaultProbabilityToPickChallenge: 11,
            }),
            comments: null,
          }),
        );
      });
    });
    context('when no base version is provided', function () {
      it('returns a newly created Version model built on default values', function () {
        const newVersion = Version.buildFromVersion({ scope: SCOPES.PIX_PLUS_PRO_SANTE, version: null });

        expect(newVersion).to.deepEqualInstance(
          domainBuilder.certification.configuration.buildVersion({
            id: undefined,
            scope: SCOPES.PIX_PLUS_PRO_SANTE,
            startDate: null,
            expirationDate: null,
            assessmentDuration: DEFAULT_SESSION_DURATION_MINUTES,
            minimumAnswersRequiredToValidateACertification:
              DEFAULT_MINIMUM_ANSWERS_REQUIRED_TO_VALIDATE_A_CERTIFICATION,
            globalScoringConfiguration: [],
            competencesScoringConfiguration: [],
            challengesConfiguration: domainBuilder.certification.shared.buildFlashAssessmentAlgorithmConfiguration({
              maximumAssessmentLength: 32,
              challengesBetweenSameCompetence: 0,
              limitToOneQuestionPerTube: true,
              enablePassageByAllCompetences: true,
              variationPercent: 1,
              defaultCandidateCapacity: 0,
              defaultProbabilityToPickChallenge: DEFAULT_PROBABILITY_TO_PICK_CHALLENGE,
            }),
            comments: null,
          }),
        );
      });
    });
  });
});
