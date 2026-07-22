import { VersionNotDraftError } from '../../../../../../../src/certification/configuration/domain/errors.js';
import { Version } from '../../../../../../../src/certification/configuration/domain/models/Version.js';
import { SCOPES } from '../../../../../../../src/certification/shared/domain/models/Scopes.js';
import { EntityValidationError } from '../../../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../../../test-helper.js';
import { domainBuilder } from '../../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Configuration | Unit | Application | Api | Models | Version', function () {
  describe('#get isDraft', function () {
    context('when the version is archived', function () {
      it('return false', function () {
        const version = domainBuilder.certification.configuration
          .versionBuilder()
          .asArchived()
          .withParameters({ scope: SCOPES.CORE, tubeIds: ['rec123'] })
          .build();

        expect(version.isDraft).to.be.false;
      });
    });

    context('when the version is active', function () {
      it('return false', function () {
        const version = domainBuilder.certification.configuration
          .versionBuilder()
          .asActive()
          .withParameters({ scope: SCOPES.CORE, tubeIds: ['rec123'] })
          .build();

        expect(version.isDraft).to.be.false;
      });
    });

    context('when the version is draft', function () {
      it('return true', function () {
        const version = domainBuilder.certification.configuration
          .versionBuilder()
          .withParameters({ scope: SCOPES.CORE, tubeIds: ['rec123'] })
          .build();

        expect(version.isDraft).to.be.true;
      });
    });
  });

  describe('#canRemove', function () {
    context('when the version is archived', function () {
      it('return false', function () {
        const version = domainBuilder.certification.configuration
          .versionBuilder()
          .asArchived()
          .withParameters({ scope: SCOPES.CORE, tubeIds: ['rec123'] })
          .build();

        expect(version.canRemove).to.be.false;
      });
    });

    context('when the version is active', function () {
      it('return false', function () {
        const version = domainBuilder.certification.configuration
          .versionBuilder()
          .asActive()
          .withParameters({ scope: SCOPES.CORE, tubeIds: ['rec123'] })
          .build();

        expect(version.canRemove).to.be.false;
      });
    });

    context('when the version is draft', function () {
      it('return true', function () {
        const version = domainBuilder.certification.configuration
          .versionBuilder()
          .withParameters({ scope: SCOPES.CORE, tubeIds: ['rec123'] })
          .build();

        expect(version.canRemove).to.be.true;
      });
    });
  });

  describe('#get isActive', function () {
    context('when the version is archived', function () {
      it('return false', function () {
        const version = domainBuilder.certification.configuration
          .versionBuilder()
          .asArchived()
          .withParameters({ scope: SCOPES.CORE, tubeIds: ['rec123'] })
          .build();

        expect(version.isActive).to.be.false;
      });
    });

    context('when the version is active', function () {
      it('return true', function () {
        const version = domainBuilder.certification.configuration
          .versionBuilder()
          .asActive()
          .withParameters({ scope: SCOPES.CORE, tubeIds: ['rec123'] })
          .build();

        expect(version.isActive).to.be.true;
      });
    });

    context('when the version is draft', function () {
      it('return false', function () {
        const version = domainBuilder.certification.configuration
          .versionBuilder()
          .withParameters({ scope: SCOPES.CORE, tubeIds: ['rec123'] })
          .build();

        expect(version.isActive).to.be.false;
      });
    });
  });

  describe('#static buildDraftFromActiveVersion', function () {
    context('success cases', function () {
      context('when a base version is provided', function () {
        it('returns a newly created Version model based on attributes of the base version', function () {
          const baseVersion = domainBuilder.certification.configuration
            .versionBuilder()
            .asActive({ startDate: new Date() })
            .withParameters({
              scope: SCOPES.PIX_PLUS_DROIT,
              tubeIds: ['rec123'],
              id: 1,
              assessmentDuration: 11,
              minimumAnswersRequiredToValidateACertification: 11,
              globalScoringConfiguration: ['some globalScoringConfiguration'],
              competencesScoringConfiguration: ['some competencesScoringConfiguration'],
              challengesConfiguration: {
                maximumAssessmentLength: 11,
                challengesBetweenSameCompetence: 11,
                limitToOneQuestionPerTube: false,
                enablePassageByAllCompetences: false,
                variationPercent: 0.1,
                defaultCandidateCapacity: 11,
                defaultProbabilityToPickChallenge: 11,
              },
              comments: 'Some ignored value',
            })
            .build();

          const newVersion = Version.buildDraftFromActiveVersion({
            scope: SCOPES.PIX_PLUS_PRO_SANTE,
            version: baseVersion,
            tubeIds: ['rec456'],
          });

          expect(newVersion).to.deepEqualInstance(
            domainBuilder.certification.configuration
              .versionBuilder()
              .withParameters({
                scope: SCOPES.PIX_PLUS_DROIT,
                tubeIds: ['rec456'],
                assessmentDuration: 11,
                minimumAnswersRequiredToValidateACertification: 11,
                globalScoringConfiguration: ['some globalScoringConfiguration'],
                competencesScoringConfiguration: ['some competencesScoringConfiguration'],
                challengesConfiguration: {
                  maximumAssessmentLength: 11,
                  challengesBetweenSameCompetence: 11,
                  limitToOneQuestionPerTube: false,
                  enablePassageByAllCompetences: false,
                  variationPercent: 0.1,
                  defaultCandidateCapacity: 11,
                  defaultProbabilityToPickChallenge: 11,
                },
              })
              .build(),
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
            domainBuilder.certification.configuration
              .versionBuilder()
              .withParameters({ scope: SCOPES.PIX_PLUS_PRO_SANTE, tubeIds: ['rec456'] })
              .build(),
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
    let baseVersionData, validUpdateData;

    beforeEach(function () {
      baseVersionData = {
        id: 123,
        scope: SCOPES.PIX_PLUS_DROIT,
        assessmentDuration: 111,
        minimumAnswersRequiredToValidateACertification: 222,
        comments: '333',
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
      };
    });

    context('when version is a draft', function () {
      it('updates the version', function () {
        const version = domainBuilder.certification.configuration
          .versionBuilder()
          .asDraft({ startDate: new Date('2025-05-05') })
          .withParameters(baseVersionData)
          .build();

        version.update(validUpdateData);

        const expectedVersion = domainBuilder.certification.configuration
          .versionBuilder()
          .asDraft({ startDate: validUpdateData.startDate })
          .withParameters(baseVersionData)
          .withParameters({
            assessmentDuration: validUpdateData.assessmentDuration,
            minimumAnswersRequiredToValidateACertification: validUpdateData.minimumAnswersRequiredForValidation,
            challengesConfiguration: {
              maximumAssessmentLength: validUpdateData.maximumAssessmentLength,
              challengesBetweenSameCompetence: validUpdateData.challengesBetweenSameCompetence,
              defaultProbabilityToPickChallenge: validUpdateData.defaultProbabilityToPickChallenge,
              variationPercent: validUpdateData.variationPercent,
              defaultCandidateCapacity: validUpdateData.defaultCandidateCapacity,
              limitToOneQuestionPerTube: validUpdateData.limitToOneQuestionPerTube,
              enablePassageByAllCompetences: validUpdateData.enablePassageByAllCompetences,
            },
          })
          .build();
        expect(version).to.deepEqualInstance(expectedVersion);
      });
    });

    context('when version is not a draft', function () {
      it('throws a VersionNotDraft error', function () {
        let version = domainBuilder.certification.configuration.versionBuilder().asActive().build();
        expect(() => version.update(validUpdateData)).to.throw(VersionNotDraftError);
        version = domainBuilder.certification.configuration.versionBuilder().asArchived().build();
        expect(() => version.update(validUpdateData)).to.throw(VersionNotDraftError);
      });
    });
  });
});
