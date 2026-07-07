import { VersionNotDraftError } from '../../../../../../../src/certification/configuration/domain/errors.js';
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
import { EntityValidationError } from '../../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../../test-helper.js';
import { domainBuilder } from '../../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Configuration | Unit | Application | Api | Models | Version', function () {
  describe('#get isDraft', function () {
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

  describe('#canRemove', function () {
    context('when the version is archived', function () {
      it('return false', function () {
        const version = domainBuilder.certification.configuration.buildVersion({
          status: VERSION_STATUSES.ARCHIVED,
        });

        expect(version.canRemove).to.be.false;
      });
    });

    context('when the version is active', function () {
      it('return false', function () {
        const version = domainBuilder.certification.configuration.buildVersion({
          status: VERSION_STATUSES.ACTIVE,
        });

        expect(version.canRemove).to.be.false;
      });
    });

    context('when the version is draft', function () {
      it('return true', function () {
        const version = domainBuilder.certification.configuration.buildVersion({
          status: VERSION_STATUSES.DRAFT,
        });

        expect(version.canRemove).to.be.true;
      });
    });
  });

  describe('#get isActive', function () {
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
    context('success cases', function () {
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
            tubeIds: ['rec123'],
          });

          const newVersion = Version.buildDraftFromActiveVersion({
            scope: SCOPES.PIX_PLUS_PRO_SANTE,
            version: baseVersion,
            tubeIds: ['rec456'],
          });

          expect(newVersion).to.deepEqualInstance(
            domainBuilder.certification.configuration.buildVersion({
              id: null,
              scope: SCOPES.PIX_PLUS_DROIT,
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
              tubeIds: ['rec456'],
            }),
          );
        });
      });

      context('when no base version is provided', function () {
        it('returns a newly created Version model built on default values', function () {
          const newVersion = Version.buildDraftFromActiveVersion({
            scope: SCOPES.PIX_PLUS_PRO_SANTE,
            version: null,
            tubeIds: ['rec456'],
          });

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
              tubeIds: ['rec456'],
            }),
          );
        });
      });
    });

    context('error cases', function () {
      context('when no tubeId is provided', function () {
        it('throws an error', function () {
          expect(() =>
            Version.buildDraftFromActiveVersion({
              scope: SCOPES.PIX_PLUS_PRO_SANTE,
              version: null,
              tubeIds: [],
            }),
          ).to.throw(EntityValidationError);
        });
      });

      context('when two tubeIds are identical', function () {
        it('throws an error', function () {
          expect(() =>
            Version.buildDraftFromActiveVersion({
              scope: SCOPES.PIX_PLUS_PRO_SANTE,
              version: null,
              tubeIds: ['rec123', 'rec123'],
            }),
          ).to.throw(EntityValidationError);
        });
      });
    });
  });

  describe('#update', function () {
    let baseVersionData, version;

    beforeEach(function () {
      baseVersionData = {
        id: 123,
        scope: SCOPES.PIX_PLUS_DROIT,
        startDate: new Date('2025-01-01'),
        expirationDate: new Date('2025-11-11'),
        assessmentDuration: 111,
        minimumAnswersRequiredToValidateACertification: 222,
        comments: '333',
        status: VERSION_STATUSES.ACTIVE,
        globalScoringConfiguration: [],
        competencesScoringConfiguration: [],
        challengesConfiguration: {
          maximumAssessmentLength: 4,
          challengesBetweenSameCompetence: 5,
          defaultProbabilityToPickChallenge: 6,
          variationPercent: 0.7,
          defaultCandidateCapacity: 8,
          limitToOneQuestionPerTube: false,
          enablePassageByAllCompetences: false,
        },
      };
      version = domainBuilder.certification.configuration.buildVersion(baseVersionData);
    });

    context('when version is active', function () {
      let validIsoUpdate;

      beforeEach(function () {
        version.status = VERSION_STATUSES.ACTIVE;
        validIsoUpdate = {
          startDate: new Date('2025-01-01'),
          assessmentDuration: 111,
          minimumAnswersRequiredForValidation: 222,
          maximumAssessmentLength: 4,
          challengesBetweenSameCompetence: 5,
          defaultProbabilityToPickChallenge: 6,
          variationPercent: 0.7,
          defaultCandidateCapacity: 8,
          limitToOneQuestionPerTube: false,
          enablePassageByAllCompetences: false,
          comments: '333',
        };
      });

      [
        { attr: 'startDate', value: new Date('2021-01-01') },
        { attr: 'assessmentDuration', value: 999 },
        { attr: 'minimumAnswersRequiredForValidation', value: 999 },
      ].forEach(({ attr, value }) => {
        it(`throws VersionNotDraftError when "${attr}" has a different value`, function () {
          expect(() =>
            version.update({
              ...validIsoUpdate,
              [attr]: value,
            }),
          ).to.throw(VersionNotDraftError);
        });
      });

      it('throws VersionNotDraftError when a value is different in challengesConfiguration', function () {
        expect(() =>
          version.update({
            ...validIsoUpdate,
            limitToOneQuestionPerTube: true,
          }),
        ).to.throw(VersionNotDraftError);
      });

      it('updates the comments when exclusively the comments change', function () {
        version.update({
          ...validIsoUpdate,
          comments: 'SALUT LES AMIS',
        });

        expect(version).to.deepEqualInstance(
          domainBuilder.certification.configuration.buildVersion({
            ...baseVersionData,
            status: VERSION_STATUSES.ACTIVE,
            comments: 'SALUT LES AMIS',
          }),
        );
      });
    });

    context('when version is archived', function () {
      let validIsoUpdate;

      beforeEach(function () {
        version.status = VERSION_STATUSES.ARCHIVED;
        validIsoUpdate = {
          startDate: new Date('2025-01-01'),
          assessmentDuration: 111,
          minimumAnswersRequiredForValidation: 222,
          maximumAssessmentLength: 4,
          challengesBetweenSameCompetence: 5,
          defaultProbabilityToPickChallenge: 6,
          variationPercent: 0.7,
          defaultCandidateCapacity: 8,
          limitToOneQuestionPerTube: false,
          enablePassageByAllCompetences: false,
          comments: '333',
        };
      });

      [
        { attr: 'startDate', value: new Date('2021-01-01') },
        { attr: 'assessmentDuration', value: 999 },
        { attr: 'minimumAnswersRequiredForValidation', value: 999 },
      ].forEach(({ attr, value }) => {
        it(`throws VersionNotDraftError when "${attr}" has a different value`, function () {
          expect(() =>
            version.update({
              ...validIsoUpdate,
              [attr]: value,
            }),
          ).to.throw(VersionNotDraftError);
        });

        it('throws VersionNotDraftError when a value is different in challengesConfiguration', function () {
          expect(() =>
            version.update({
              ...validIsoUpdate,
              limitToOneQuestionPerTube: true,
            }),
          ).to.throw(VersionNotDraftError);
        });

        it('updates the comments when exclusively the comments change', function () {
          version.update({
            ...validIsoUpdate,
            comments: 'SALUT LES AMIS',
          });

          expect(version).to.deepEqualInstance(
            domainBuilder.certification.configuration.buildVersion({
              ...baseVersionData,
              status: VERSION_STATUSES.ARCHIVED,
              comments: 'SALUT LES AMIS',
            }),
          );
        });
      });
    });

    context('when version is a draft', function () {
      let validUpdateData;

      beforeEach(function () {
        version.status = VERSION_STATUSES.DRAFT;
        validUpdateData = {
          startDate: new Date('2026-06-06'),
          assessmentDuration: 100,
          minimumAnswersRequiredForValidation: 200,
          maximumAssessmentLength: 300,
          challengesBetweenSameCompetence: 400,
          defaultProbabilityToPickChallenge: 55,
          variationPercent: 0.6,
          defaultCandidateCapacity: 700,
          limitToOneQuestionPerTube: false,
          enablePassageByAllCompetences: false,
          comments: 'COUCOU',
        };
      });

      context('success case', function () {
        it('updates the version', function () {
          version.update(validUpdateData);

          expect(version).to.deepEqualInstance(
            domainBuilder.certification.configuration.buildVersion({
              ...baseVersionData,
              status: VERSION_STATUSES.DRAFT,
              startDate: validUpdateData.startDate,
              assessmentDuration: validUpdateData.assessmentDuration,
              minimumAnswersRequiredToValidateACertification: validUpdateData.minimumAnswersRequiredForValidation,
              comments: validUpdateData.comments,
              challengesConfiguration: {
                maximumAssessmentLength: validUpdateData.maximumAssessmentLength,
                challengesBetweenSameCompetence: validUpdateData.challengesBetweenSameCompetence,
                defaultProbabilityToPickChallenge: validUpdateData.defaultProbabilityToPickChallenge,
                variationPercent: validUpdateData.variationPercent,
                defaultCandidateCapacity: validUpdateData.defaultCandidateCapacity,
                limitToOneQuestionPerTube: validUpdateData.limitToOneQuestionPerTube,
                enablePassageByAllCompetences: validUpdateData.enablePassageByAllCompetences,
              },
            }),
          );
        });
      });

      context('error cases', function () {
        it('throws when updating with an invalid comments', function () {
          expect(() =>
            version.update({
              ...validUpdateData,
              comments: ['coucou'],
            }),
          )
            .to.throw(EntityValidationError)
            .that.has.property('invalidAttributes')
            .deep.equal([
              {
                attribute: 'comments',
                message: '"comments" must be a string',
              },
            ]);
        });

        it('throws when updating with an invalid startDate', function () {
          expect(() =>
            version.update({
              ...validUpdateData,
              startDate: 'coucou',
            }),
          )
            .to.throw(EntityValidationError)
            .that.has.property('invalidAttributes')
            .deep.equal([
              {
                attribute: 'startDate',
                message: '"startDate" must be a valid date',
              },
            ]);
        });

        it('throws when updating with an invalid assessmentDuration', function () {
          expect(() =>
            version.update({
              ...validUpdateData,
              assessmentDuration: 'coucou',
            }),
          )
            .to.throw(EntityValidationError)
            .that.has.property('invalidAttributes')
            .deep.equal([
              {
                attribute: 'assessmentDuration',
                message: '"assessmentDuration" must be a number',
              },
            ]);
        });

        it('throws when updating with an invalid minimumAnswersRequiredToValidateACertification', function () {
          expect(() =>
            version.update({
              ...validUpdateData,
              minimumAnswersRequiredForValidation: 'coucou',
            }),
          )
            .to.throw(EntityValidationError)
            .that.has.property('invalidAttributes')
            .deep.equal([
              {
                attribute: 'minimumAnswersRequiredToValidateACertification',
                message: '"minimumAnswersRequiredToValidateACertification" must be a number',
              },
            ]);
        });

        it('throws when updating with an invalid maximumAssessmentLength', function () {
          expect(() =>
            version.update({
              ...validUpdateData,
              maximumAssessmentLength: 'coucou',
            }),
          )
            .to.throw(EntityValidationError)
            .that.has.property('invalidAttributes')
            .deep.equal([
              {
                attribute: 'maximumAssessmentLength',
                message: '"maximumAssessmentLength" must be a number',
              },
            ]);
        });

        it('throws when updating with an invalid challengesBetweenSameCompetence', function () {
          expect(() =>
            version.update({
              ...validUpdateData,
              challengesBetweenSameCompetence: 'coucou',
            }),
          )
            .to.throw(EntityValidationError)
            .that.has.property('invalidAttributes')
            .deep.equal([
              {
                attribute: 'challengesBetweenSameCompetence',
                message: '"challengesBetweenSameCompetence" must be a number',
              },
            ]);
        });

        it('throws when updating with an invalid limitToOneQuestionPerTube', function () {
          expect(() =>
            version.update({
              ...validUpdateData,
              limitToOneQuestionPerTube: 'coucou',
            }),
          )
            .to.throw(EntityValidationError)
            .that.has.property('invalidAttributes')
            .deep.equal([
              {
                attribute: 'limitToOneQuestionPerTube',
                message: '"limitToOneQuestionPerTube" must be a boolean',
              },
            ]);
        });

        it('throws when updating with an invalid enablePassageByAllCompetences', function () {
          expect(() =>
            version.update({
              ...validUpdateData,
              enablePassageByAllCompetences: 'coucou',
            }),
          )
            .to.throw(EntityValidationError)
            .that.has.property('invalidAttributes')
            .deep.equal([
              {
                attribute: 'enablePassageByAllCompetences',
                message: '"enablePassageByAllCompetences" must be a boolean',
              },
            ]);
        });

        it('throws when updating with an invalid variationPercent', function () {
          expect(() =>
            version.update({
              ...validUpdateData,
              variationPercent: 'coucou',
            }),
          )
            .to.throw(EntityValidationError)
            .that.has.property('invalidAttributes')
            .deep.equal([
              {
                attribute: 'variationPercent',
                message: '"variationPercent" must be a number',
              },
            ]);
        });

        it('throws when updating with an invalid defaultCandidateCapacity', function () {
          expect(() =>
            version.update({
              ...validUpdateData,
              defaultCandidateCapacity: 'coucou',
            }),
          )
            .to.throw(EntityValidationError)
            .that.has.property('invalidAttributes')
            .deep.equal([
              {
                attribute: 'defaultCandidateCapacity',
                message: '"defaultCandidateCapacity" must be a number',
              },
            ]);
        });

        it('throws when updating with an invalid defaultProbabilityToPickChallenge', function () {
          expect(() =>
            version.update({
              ...validUpdateData,
              defaultProbabilityToPickChallenge: 'coucou',
            }),
          )
            .to.throw(EntityValidationError)
            .that.has.property('invalidAttributes')
            .deep.equal([
              {
                attribute: 'defaultProbabilityToPickChallenge',
                message: '"defaultProbabilityToPickChallenge" must be a number',
              },
            ]);
        });
      });
    });
  });
});
