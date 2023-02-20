import { expect, domainBuilder, sinon } from '../../../test-helper';
import {
  CertificationIssueReportCategories,
  CertificationIssueReportSubcategories,
} from '../../../../lib/domain/models/CertificationIssueReportCategory';
import CertificationIssueReportResolutionAttempt from '../../../../lib/domain/models/CertificationIssueReportResolutionAttempt';
import { CertificationIssueReportResolutionStrategies } from '../../../../lib/domain/models/CertificationIssueReportResolutionStrategies';

import {
  neutralizeWithoutCheckingStrategy,
  neutralizeIfImageOrEmbedStrategy,
  neutralizeIfAttachmentStrategy,
  neutralizeIfTimedChallengeStrategy,
  neutralizeOrValidateIfFocusedChallengeStrategy,
  doNotResolveStrategy,
} from '../../../../lib/domain/models/CertificationIssueReportResolutionStrategies';

describe('Unit | Domain | Models | CertificationIssueReportResolutionStrategies', function () {
  context('#NEUTRALIZE_WITHOUT_CHECKING', function () {
    context('When challenge is neutralizable', function () {
      it('neutralizes successfully', async function () {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
        const certificationAnswer = domainBuilder.buildAnswer.ko({ challengeId: certificationChallenge.challengeId });
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [certificationAnswer],
        });
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.SOFTWARE_NOT_WORKING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };

        // when
        const neutralizationAttempt = await neutralizeWithoutCheckingStrategy({
          certificationIssueReport,
          certificationAssessment,
          certificationIssueReportRepository,
        });

        // then
        expect(neutralizationAttempt).to.deepEqualInstance(
          CertificationIssueReportResolutionAttempt.resolvedWithEffect()
        );
      });

      it('resolves the issue report', async function () {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
        const certificationAnswer = domainBuilder.buildAnswer.ko({ challengeId: certificationChallenge.challengeId });
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [certificationAnswer],
        });
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.SOFTWARE_NOT_WORKING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };

        // when
        await neutralizeWithoutCheckingStrategy({
          certificationIssueReport,
          certificationAssessment,
          certificationIssueReportRepository,
        });

        // then
        expect(certificationIssueReport.isResolved()).to.be.true;
        expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
      });
    });

    context('When challenge is not neutralizable', function () {
      it('returns a successful resolution without effect', async function () {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
        const certificationAnswer = domainBuilder.buildAnswer.ok({ challengeId: certificationChallenge.challengeId });
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [certificationAnswer],
        });
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.SOFTWARE_NOT_WORKING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };

        // when
        const neutralizationAttempt = await neutralizeWithoutCheckingStrategy({
          certificationIssueReport,
          certificationAssessment,
          certificationIssueReportRepository,
        });

        // then
        expect(neutralizationAttempt).to.deepEqualInstance(
          CertificationIssueReportResolutionAttempt.resolvedWithoutEffect()
        );
      });

      it('resolves the certification issue report anyway', async function () {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
        const certificationAnswer = domainBuilder.buildAnswer.ok({ challengeId: certificationChallenge.challengeId });
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [certificationAnswer],
        });
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.SOFTWARE_NOT_WORKING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };

        // when
        await neutralizeWithoutCheckingStrategy({
          certificationIssueReport,
          certificationAssessment,
          certificationIssueReportRepository,
        });

        // then
        expect(certificationIssueReport.isResolved()).to.be.true;
        expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
      });
    });
  });

  context('#NEUTRALIZE_IF_IMAGE_OR_EMBED', function () {
    context('When challenge is neutralizable', function () {
      context('When challenge contains an image', function () {
        it('neutralizes successfully', async function () {
          // given
          const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
          const certificationAnswer = domainBuilder.buildAnswer.ko({ challengeId: certificationChallenge.challengeId });
          const certificationAssessment = domainBuilder.buildCertificationAssessment({
            certificationChallenges: [certificationChallenge],
            certificationAnswersByDate: [certificationAnswer],
          });
          const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
            subcategory: CertificationIssueReportSubcategories.SOFTWARE_NOT_WORKING,
            category: CertificationIssueReportCategories.IN_CHALLENGE,
            questionNumber: 1,
          });
          const challengeWithImage = domainBuilder.buildChallenge({ illustrationUrl: 'image_url' });
          const certificationIssueReportRepository = {
            save: sinon.stub(),
          };
          const challengeRepository = {
            get: sinon.stub().resolves(challengeWithImage),
          };

          // when
          const neutralizationAttempt = await neutralizeIfImageOrEmbedStrategy({
            certificationIssueReport,
            certificationAssessment,
            certificationIssueReportRepository,
            challengeRepository,
          });

          // then
          expect(neutralizationAttempt).to.deepEqualInstance(
            CertificationIssueReportResolutionAttempt.resolvedWithEffect()
          );
        });

        it('resolves the issue report', async function () {
          // given
          const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
          const certificationAnswer = domainBuilder.buildAnswer.ko({ challengeId: certificationChallenge.challengeId });
          const certificationAssessment = domainBuilder.buildCertificationAssessment({
            certificationChallenges: [certificationChallenge],
            certificationAnswersByDate: [certificationAnswer],
          });
          const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
            subcategory: CertificationIssueReportSubcategories.SOFTWARE_NOT_WORKING,
            category: CertificationIssueReportCategories.IN_CHALLENGE,
            questionNumber: 1,
          });
          const challengeWithImage = domainBuilder.buildChallenge({ illustrationUrl: 'image_url' });

          const certificationIssueReportRepository = {
            save: sinon.stub(),
          };
          const challengeRepository = {
            get: sinon.stub().resolves(challengeWithImage),
          };

          // when
          await neutralizeIfImageOrEmbedStrategy({
            certificationIssueReport,
            certificationAssessment,
            certificationIssueReportRepository,
            challengeRepository,
          });

          // then
          expect(certificationIssueReport.isResolved()).to.be.true;
          expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
        });
      });

      context('When challenge contains an embed', function () {
        it('neutralizes successfully', async function () {
          // given
          const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
          const certificationAnswer = domainBuilder.buildAnswer.ko({ challengeId: certificationChallenge.challengeId });
          const certificationAssessment = domainBuilder.buildCertificationAssessment({
            certificationChallenges: [certificationChallenge],
            certificationAnswersByDate: [certificationAnswer],
          });
          const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
            subcategory: CertificationIssueReportSubcategories.SOFTWARE_NOT_WORKING,
            category: CertificationIssueReportCategories.IN_CHALLENGE,
            questionNumber: 1,
          });
          const challengeWithEmbed = domainBuilder.buildChallenge({ embedUrl: 'embed_url' });
          const certificationIssueReportRepository = {
            save: sinon.stub(),
          };
          const challengeRepository = {
            get: sinon.stub().resolves(challengeWithEmbed),
          };

          // when
          const neutralizationAttempt = await neutralizeIfImageOrEmbedStrategy({
            certificationIssueReport,
            certificationAssessment,
            certificationIssueReportRepository,
            challengeRepository,
          });

          // then
          expect(neutralizationAttempt).to.deepEqualInstance(
            CertificationIssueReportResolutionAttempt.resolvedWithEffect()
          );
        });

        it('resolves the issue report', async function () {
          // given
          const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
          const certificationAnswer = domainBuilder.buildAnswer.ko({ challengeId: certificationChallenge.challengeId });
          const certificationAssessment = domainBuilder.buildCertificationAssessment({
            certificationChallenges: [certificationChallenge],
            certificationAnswersByDate: [certificationAnswer],
          });
          const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
            subcategory: CertificationIssueReportSubcategories.SOFTWARE_NOT_WORKING,
            category: CertificationIssueReportCategories.IN_CHALLENGE,
            questionNumber: 1,
          });
          const challengeWithEmbed = domainBuilder.buildChallenge({ embedUrl: 'embed_url' });

          const certificationIssueReportRepository = {
            save: sinon.stub(),
          };
          const challengeRepository = {
            get: sinon.stub().resolves(challengeWithEmbed),
          };

          // when
          await neutralizeIfImageOrEmbedStrategy({
            certificationIssueReport,
            certificationAssessment,
            certificationIssueReportRepository,
            challengeRepository,
          });

          // then
          expect(certificationIssueReport.isResolved()).to.be.true;
          expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
        });
      });
    });

    context('the challenge does not contain the question designated by the question number', function () {
      it('returns a successful resolution without effect', async function () {
        // given
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.SOFTWARE_NOT_WORKING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [domainBuilder.buildCertificationChallengeWithType()],
          certificationAnswersByDate: [],
        });

        // when
        const neutralizationAttempt = await neutralizeIfImageOrEmbedStrategy({
          certificationIssueReport,
          certificationAssessment,
          certificationIssueReportRepository,
        });

        // then
        expect(neutralizationAttempt).to.deepEqualInstance(
          CertificationIssueReportResolutionAttempt.resolvedWithoutEffect()
        );
      });

      it('resolves the certification issue report anyway', async function () {
        // given
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.SOFTWARE_NOT_WORKING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [domainBuilder.buildCertificationChallengeWithType()],
          certificationAnswersByDate: [],
        });

        // when
        await neutralizeIfImageOrEmbedStrategy({
          certificationIssueReport,
          certificationAssessment,
          certificationIssueReportRepository,
        });

        // then
        expect(certificationIssueReport.isResolved()).to.be.true;
        expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
      });
    });

    context('the challenge does not contain an image nor an embed', function () {
      it('returns a successful resolution without effect', async function () {
        // given
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.SOFTWARE_NOT_WORKING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const challengeWithoutIllustrationAndEmbed = domainBuilder.buildChallenge({
          illustrationUrl: null,
          embedUrl: null,
        });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };
        const challengeRepository = {
          get: sinon.stub().resolves(challengeWithoutIllustrationAndEmbed),
        };
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType();
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [domainBuilder.buildAnswer({ challengeId: certificationChallenge.challengeId })],
        });

        // when
        const neutralizationAttempt = await neutralizeIfImageOrEmbedStrategy({
          certificationIssueReport,
          certificationAssessment,
          certificationIssueReportRepository,
          challengeRepository,
        });

        // then
        expect(certificationIssueReport.resolution).to.equal(
          "Cette question n'a pas été neutralisée car elle ne contient ni image ni application/simulateur"
        );
        expect(neutralizationAttempt).to.deepEqualInstance(
          CertificationIssueReportResolutionAttempt.resolvedWithoutEffect()
        );
      });

      it('resolves the certification issue report anyway', async function () {
        // given
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.SOFTWARE_NOT_WORKING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const challengeWithoutIllustration = domainBuilder.buildChallenge({ illustrationUrl: null });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };
        const challengeRepository = {
          get: sinon.stub().resolves(challengeWithoutIllustration),
        };
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType();
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [domainBuilder.buildAnswer({ challengeId: certificationChallenge.challengeId })],
        });

        // when
        await neutralizeIfImageOrEmbedStrategy({
          certificationIssueReport,
          certificationAssessment,
          certificationIssueReportRepository,
          challengeRepository,
        });

        // then
        expect(certificationIssueReport.isResolved()).to.be.true;
        expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
      });
    });

    context('When challenge is not neutralizable', function () {
      it('returns a successful resolution attempt without effect', async function () {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
        const certificationAnswer = domainBuilder.buildAnswer.ok({ challengeId: certificationChallenge.challengeId });
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [certificationAnswer],
        });
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.SOFTWARE_NOT_WORKING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const challengeWithImage = domainBuilder.buildChallenge({ illustrationUrl: 'image_url' });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };
        const challengeRepository = {
          get: sinon.stub().resolves(challengeWithImage),
        };

        // when
        const neutralizationAttempt = await neutralizeIfImageOrEmbedStrategy({
          certificationIssueReport,
          certificationAssessment,
          certificationIssueReportRepository,
          challengeRepository,
        });

        // then
        expect(neutralizationAttempt).to.deepEqualInstance(
          CertificationIssueReportResolutionAttempt.resolvedWithoutEffect()
        );
      });

      it('resolves the certification issue report anyway', async function () {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
        const certificationAnswer = domainBuilder.buildAnswer.ok({ challengeId: certificationChallenge.challengeId });
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [certificationAnswer],
        });
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.SOFTWARE_NOT_WORKING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const challengeWithImage = domainBuilder.buildChallenge({ illustrationUrl: 'image_url' });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };
        const challengeRepository = {
          get: sinon.stub().resolves(challengeWithImage),
        };

        // when
        await neutralizeIfImageOrEmbedStrategy({
          certificationIssueReport,
          certificationAssessment,
          certificationIssueReportRepository,
          challengeRepository,
        });

        // then
        expect(certificationIssueReport.isResolved()).to.be.true;
        expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
      });
    });
  });

  context('#NEUTRALIZE_IF_ATTACHMENT', function () {
    context('When challenge is neutralizable', function () {
      it('neutralizes successfully', async function () {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
        const certificationAnswer = domainBuilder.buildAnswer.ko({ challengeId: certificationChallenge.challengeId });
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [certificationAnswer],
        });
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.FILE_NOT_OPENING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const challengeWithAttachment = domainBuilder.buildChallenge({
          attachments: ['some/attachment/url'],
        });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };
        const challengeRepository = {
          get: sinon.stub().resolves(challengeWithAttachment),
        };

        // when
        const neutralizationAttempt = await neutralizeIfAttachmentStrategy({
          certificationIssueReport,
          certificationAssessment,
          certificationIssueReportRepository,
          challengeRepository,
        });

        // then
        expect(neutralizationAttempt).to.deepEqualInstance(
          CertificationIssueReportResolutionAttempt.resolvedWithEffect()
        );
      });

      it('resolves the issue report', async function () {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
        const certificationAnswer = domainBuilder.buildAnswer.ko({ challengeId: certificationChallenge.challengeId });
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [certificationAnswer],
        });
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.FILE_NOT_OPENING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });

        const challengeWithAttachment = domainBuilder.buildChallenge({
          attachments: ['some/attachment/url'],
        });

        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };

        const challengeRepository = {
          get: sinon.stub().resolves(challengeWithAttachment),
        };

        // when
        await neutralizeIfAttachmentStrategy({
          certificationIssueReport,
          certificationAssessment,
          certificationIssueReportRepository,
          challengeRepository,
        });

        // then
        expect(certificationIssueReport.isResolved()).to.be.true;
        expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
      });
    });

    context('the challenge does not contain the question designated by the question number', function () {
      it('returns a successful resolution attempt without effect', async function () {
        // given
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.SOFTWARE_NOT_WORKING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [domainBuilder.buildCertificationChallengeWithType()],
          certificationAnswersByDate: [],
        });

        // when
        const neutralizationAttempt = await neutralizeIfAttachmentStrategy({
          certificationIssueReport,
          certificationAssessment,
          certificationIssueReportRepository,
        });

        // then
        expect(neutralizationAttempt).to.deepEqualInstance(
          CertificationIssueReportResolutionAttempt.resolvedWithoutEffect()
        );
      });

      it('resolves the certification issue report anyway', async function () {
        // given
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.FILE_NOT_OPENING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [domainBuilder.buildCertificationChallengeWithType()],
          certificationAnswersByDate: [],
        });

        // when
        await neutralizeIfAttachmentStrategy({
          certificationIssueReport,
          certificationAssessment,
          certificationIssueReportRepository,
        });

        // then
        expect(certificationIssueReport.isResolved()).to.be.true;
        expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
      });
    });

    context('the challenge does not contain an attachment', function () {
      it('returns a successful resolution attempt without effect', async function () {
        // given
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.FILE_NOT_OPENING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const challengeWithoutAttachment = domainBuilder.buildChallenge({ attachments: [] });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };
        const challengeRepository = {
          get: sinon.stub().resolves(challengeWithoutAttachment),
        };
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType();
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [domainBuilder.buildAnswer({ challengeId: certificationChallenge.challengeId })],
        });

        // when
        const neutralizationAttempt = await neutralizeIfAttachmentStrategy({
          certificationIssueReport,
          certificationAssessment,
          certificationIssueReportRepository,
          challengeRepository,
        });

        // then
        expect(neutralizationAttempt).to.deepEqualInstance(
          CertificationIssueReportResolutionAttempt.resolvedWithoutEffect()
        );
      });

      it('resolves the certification issue report anyway', async function () {
        // given
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.FILE_NOT_OPENING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const challengeWithoutAttachment = domainBuilder.buildChallenge({ attachments: [] });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };
        const challengeRepository = {
          get: sinon.stub().resolves(challengeWithoutAttachment),
        };
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType();
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [domainBuilder.buildAnswer({ challengeId: certificationChallenge.challengeId })],
        });

        // when
        await neutralizeIfAttachmentStrategy({
          certificationIssueReport,
          certificationAssessment,
          certificationIssueReportRepository,
          challengeRepository,
        });

        // then
        expect(certificationIssueReport.isResolved()).to.be.true;
        expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
      });
    });

    context('When challenge is not neutralizable', function () {
      it('returns a successful resolution attempt without effect', async function () {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
        const certificationAnswer = domainBuilder.buildAnswer.ok({ challengeId: certificationChallenge.challengeId });
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [certificationAnswer],
        });
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.FILE_NOT_OPENING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const challengeWithAttachment = domainBuilder.buildChallenge({
          attachments: ['some/attachment/url'],
        });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };
        const challengeRepository = {
          get: sinon.stub().resolves(challengeWithAttachment),
        };

        // when
        const neutralizationAttempt = await neutralizeIfAttachmentStrategy({
          certificationIssueReport,
          certificationAssessment,
          certificationIssueReportRepository,
          challengeRepository,
        });

        // then
        expect(neutralizationAttempt).to.deepEqualInstance(
          CertificationIssueReportResolutionAttempt.resolvedWithoutEffect()
        );
      });

      it('resolves the certification issue report anyway', async function () {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
        const certificationAnswer = domainBuilder.buildAnswer.ok({ challengeId: certificationChallenge.challengeId });
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [certificationAnswer],
        });
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.FILE_NOT_OPENING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const challengeWithAttachment = domainBuilder.buildChallenge({
          attachments: ['some/attachment/url'],
        });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };
        const challengeRepository = {
          get: sinon.stub().resolves(challengeWithAttachment),
        };

        // when
        await neutralizeIfAttachmentStrategy({
          certificationIssueReport,
          certificationAssessment,
          certificationIssueReportRepository,
          challengeRepository,
        });

        // then
        expect(certificationIssueReport.isResolved()).to.be.true;
        expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
      });
    });
  });

  context('#NEUTRALIZE_IF_TIMED_CHALLENGE', function () {
    context('When challenge is neutralizable', function () {
      it('neutralizes successfully', async function () {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
        const certificationAnswer = domainBuilder.buildAnswer.ko({ challengeId: certificationChallenge.challengeId });
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [certificationAnswer],
        });
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.EXTRA_TIME_EXCEEDED,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const timedChallenge = domainBuilder.buildChallenge({
          timer: 1.33,
        });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };
        const challengeRepository = {
          get: sinon.stub().resolves(timedChallenge),
        };

        // when
        const neutralizationAttempt = await neutralizeIfTimedChallengeStrategy({
          certificationIssueReport,
          certificationAssessment,
          certificationIssueReportRepository,
          challengeRepository,
        });

        // then
        expect(neutralizationAttempt).to.deep.deepEqualInstance(
          CertificationIssueReportResolutionAttempt.resolvedWithEffect()
        );
      });

      it('resolves the issue report', async function () {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
        const certificationAnswer = domainBuilder.buildAnswer.ko({ challengeId: certificationChallenge.challengeId });
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [certificationAnswer],
        });
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.EXTRA_TIME_EXCEEDED,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });

        const timedChallenge = domainBuilder.buildChallenge({
          timer: 1.33,
        });

        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };

        const challengeRepository = {
          get: sinon.stub().resolves(timedChallenge),
        };

        // when
        await neutralizeIfTimedChallengeStrategy({
          certificationIssueReport,
          certificationAssessment,
          certificationIssueReportRepository,
          challengeRepository,
        });

        // then
        expect(certificationIssueReport.isResolved()).to.be.true;
        expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
      });
    });

    context('the challenge does not contain the question designated by the question number', function () {
      it('returns a successful resolution attempt without effect', async function () {
        // given
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.EXTRA_TIME_EXCEEDED,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [domainBuilder.buildCertificationChallengeWithType()],
          certificationAnswersByDate: [],
        });

        // when
        const neutralizationAttempt = await neutralizeIfTimedChallengeStrategy({
          certificationIssueReport,
          certificationAssessment,
          certificationIssueReportRepository,
        });

        // then
        expect(neutralizationAttempt).to.deepEqualInstance(
          CertificationIssueReportResolutionAttempt.resolvedWithoutEffect()
        );
      });

      it('resolves the certification issue report anyway', async function () {
        // given
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.EXTRA_TIME_EXCEEDED,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [domainBuilder.buildCertificationChallengeWithType()],
          certificationAnswersByDate: [],
        });

        // when
        await neutralizeIfTimedChallengeStrategy({
          certificationIssueReport,
          certificationAssessment,
          certificationIssueReportRepository,
        });

        // then
        expect(certificationIssueReport.isResolved()).to.be.true;
        expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
      });
    });

    context('the challenge is not timed', function () {
      it('returns a successful resolution attempt without effect', async function () {
        // given
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.EXTRA_TIME_EXCEEDED,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const notTimedChallenge = domainBuilder.buildChallenge({});
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };
        const challengeRepository = {
          get: sinon.stub().resolves(notTimedChallenge),
        };
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType();
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [domainBuilder.buildAnswer({ challengeId: certificationChallenge.challengeId })],
        });

        // when
        const neutralizationAttempt = await neutralizeIfTimedChallengeStrategy({
          certificationIssueReport,
          certificationAssessment,
          certificationIssueReportRepository,
          challengeRepository,
        });

        // then
        expect(neutralizationAttempt).to.deepEqualInstance(
          CertificationIssueReportResolutionAttempt.resolvedWithoutEffect()
        );
      });

      it('resolves the certification issue report anyway', async function () {
        // given
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.EXTRA_TIME_EXCEEDED,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const notTimedChallenge = domainBuilder.buildChallenge({});
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };
        const challengeRepository = {
          get: sinon.stub().resolves(notTimedChallenge),
        };
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType();
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [domainBuilder.buildAnswer({ challengeId: certificationChallenge.challengeId })],
        });

        // when
        await neutralizeIfTimedChallengeStrategy({
          certificationIssueReport,
          certificationAssessment,
          certificationIssueReportRepository,
          challengeRepository,
        });

        // then
        expect(certificationIssueReport.isResolved()).to.be.true;
        expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
      });
    });

    context('When challenge is not neutralizable', function () {
      it('returns a successful resolution attempt without effect', async function () {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
        const certificationAnswer = domainBuilder.buildAnswer.ok({ challengeId: certificationChallenge.challengeId });
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [certificationAnswer],
        });
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.EXTRA_TIME_EXCEEDED,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const timedChallenge = domainBuilder.buildChallenge({
          timer: 1.33,
        });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };
        const challengeRepository = {
          get: sinon.stub().resolves(timedChallenge),
        };

        // when
        const neutralizationAttempt = await neutralizeIfTimedChallengeStrategy({
          certificationIssueReport,
          certificationAssessment,
          certificationIssueReportRepository,
          challengeRepository,
        });

        // then
        expect(neutralizationAttempt).to.deepEqualInstance(
          CertificationIssueReportResolutionAttempt.resolvedWithoutEffect()
        );
      });

      it('resolves the certification issue report anyway', async function () {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
        const certificationAnswer = domainBuilder.buildAnswer.ok({ challengeId: certificationChallenge.challengeId });
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [certificationAnswer],
        });
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.EXTRA_TIME_EXCEEDED,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const timedChallenge = domainBuilder.buildChallenge({
          timer: 1.33,
        });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };
        const challengeRepository = {
          get: sinon.stub().resolves(timedChallenge),
        };

        // when
        await neutralizeIfTimedChallengeStrategy({
          certificationIssueReport,
          certificationAssessment,
          certificationIssueReportRepository,
          challengeRepository,
        });

        // then
        expect(certificationIssueReport.isResolved()).to.be.true;
        expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
      });
    });
  });

  context('#NEUTRALIZE_OR_VALIDATE_IF_FOCUSED_CHALLENGE', function () {
    context('when challenge is focused', function () {
      context('when answer has been focused out', function () {
        it('resolved successfully', async function () {
          // given
          const certificationChallenge = domainBuilder.buildCertificationChallengeWithType();
          const certificationAnswer = domainBuilder.buildAnswer.focusedOut({
            challengeId: certificationChallenge.challengeId,
          });
          const certificationAssessment = domainBuilder.buildCertificationAssessment({
            certificationChallenges: [certificationChallenge],
            certificationAnswersByDate: [certificationAnswer],
          });
          const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
            subcategory: CertificationIssueReportSubcategories.UNINTENTIONAL_FOCUS_OUT,
            category: CertificationIssueReportCategories.IN_CHALLENGE,
            questionNumber: 1,
          });
          const focusedChallenge = domainBuilder.buildChallenge({ focused: true });
          const certificationIssueReportRepository = {
            save: sinon.stub(),
          };
          const challengeRepository = {
            get: sinon.stub().resolves(focusedChallenge),
          };

          // when
          const resolutionAttempt = await neutralizeOrValidateIfFocusedChallengeStrategy({
            certificationIssueReport,
            certificationAssessment,
            certificationIssueReportRepository,
            challengeRepository,
          });

          // then
          expect(resolutionAttempt).to.deep.deepEqualInstance(
            CertificationIssueReportResolutionAttempt.resolvedWithEffect()
          );
        });

        it('resolves the issue report', async function () {
          // given
          const certificationChallenge = domainBuilder.buildCertificationChallengeWithType();
          const certificationAnswer = domainBuilder.buildAnswer.skipped({
            challengeId: certificationChallenge.challengeId,
          });
          const certificationAssessment = domainBuilder.buildCertificationAssessment({
            certificationChallenges: [certificationChallenge],
            certificationAnswersByDate: [certificationAnswer],
          });
          const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
            subcategory: CertificationIssueReportSubcategories.UNINTENTIONAL_FOCUS_OUT,
            category: CertificationIssueReportCategories.IN_CHALLENGE,
            questionNumber: 1,
          });

          const focusedChallenge = domainBuilder.buildChallenge({
            focused: true,
          });

          const certificationIssueReportRepository = {
            save: sinon.stub(),
          };

          const challengeRepository = {
            get: sinon.stub().resolves(focusedChallenge),
          };

          // when
          await neutralizeOrValidateIfFocusedChallengeStrategy({
            certificationIssueReport,
            certificationAssessment,
            certificationIssueReportRepository,
            challengeRepository,
          });

          // then
          expect(certificationIssueReport.isResolved()).to.be.true;
          expect(certificationIssueReport.resolution).to.equal('Cette question a été neutralisée automatiquement');
          expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
        });
      });

      context('when answer has been skipped', function () {
        it('resolved successfully', async function () {
          // given
          const certificationChallenge = domainBuilder.buildCertificationChallengeWithType();
          const certificationAnswer = domainBuilder.buildAnswer.focusedOut({
            challengeId: certificationChallenge.challengeId,
          });
          const certificationAssessment = domainBuilder.buildCertificationAssessment({
            certificationChallenges: [certificationChallenge],
            certificationAnswersByDate: [certificationAnswer],
          });
          const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
            subcategory: CertificationIssueReportSubcategories.UNINTENTIONAL_FOCUS_OUT,
            category: CertificationIssueReportCategories.IN_CHALLENGE,
            questionNumber: 1,
          });
          const focusedChallenge = domainBuilder.buildChallenge({ focused: true });
          const certificationIssueReportRepository = {
            save: sinon.stub(),
          };
          const challengeRepository = {
            get: sinon.stub().resolves(focusedChallenge),
          };

          // when
          const resolutionAttempt = await neutralizeOrValidateIfFocusedChallengeStrategy({
            certificationIssueReport,
            certificationAssessment,
            certificationIssueReportRepository,
            challengeRepository,
          });

          // then
          expect(resolutionAttempt).to.deep.deepEqualInstance(
            CertificationIssueReportResolutionAttempt.resolvedWithEffect()
          );
        });

        it('resolves the issue report', async function () {
          // given
          const certificationChallenge = domainBuilder.buildCertificationChallengeWithType();
          const certificationAnswer = domainBuilder.buildAnswer.focusedOut({
            challengeId: certificationChallenge.challengeId,
          });
          const certificationAssessment = domainBuilder.buildCertificationAssessment({
            certificationChallenges: [certificationChallenge],
            certificationAnswersByDate: [certificationAnswer],
          });
          const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
            subcategory: CertificationIssueReportSubcategories.UNINTENTIONAL_FOCUS_OUT,
            category: CertificationIssueReportCategories.IN_CHALLENGE,
            questionNumber: 1,
          });

          const focusedChallenge = domainBuilder.buildChallenge({
            focused: true,
          });

          const certificationIssueReportRepository = {
            save: sinon.stub(),
          };

          const challengeRepository = {
            get: sinon.stub().resolves(focusedChallenge),
          };

          // when
          await neutralizeOrValidateIfFocusedChallengeStrategy({
            certificationIssueReport,
            certificationAssessment,
            certificationIssueReportRepository,
            challengeRepository,
          });

          // then
          expect(certificationIssueReport.isResolved()).to.be.true;
          expect(certificationIssueReport.resolution).to.equal('Cette réponse a été acceptée automatiquement');
          expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
        });
      });
    });

    context('the challenge does not contain the question designated by the question number', function () {
      it('returns a successful resolution attempt without effect', async function () {
        // given
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.UNINTENTIONAL_FOCUS_OUT,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [domainBuilder.buildCertificationChallengeWithType()],
          certificationAnswersByDate: [],
        });

        // when
        const neutralizationOrValidationAttempt = await neutralizeOrValidateIfFocusedChallengeStrategy({
          certificationIssueReport,
          certificationAssessment,
          certificationIssueReportRepository,
        });

        // then
        expect(neutralizationOrValidationAttempt).to.deepEqualInstance(
          CertificationIssueReportResolutionAttempt.resolvedWithoutEffect()
        );
      });

      it('resolves the certification issue report anyway', async function () {
        // given
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.UNINTENTIONAL_FOCUS_OUT,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [domainBuilder.buildCertificationChallengeWithType()],
          certificationAnswersByDate: [],
        });

        // when
        await neutralizeOrValidateIfFocusedChallengeStrategy({
          certificationIssueReport,
          certificationAssessment,
          certificationIssueReportRepository,
        });

        // then
        expect(certificationIssueReport.isResolved()).to.be.true;
        expect(certificationIssueReport.resolution).to.equal(`Aucune question ne correspond au numéro 1`);
        expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
      });
    });

    context('When challenge is not focused', function () {
      it('returns a successful resolution attempt without effect', async function () {
        // given
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.UNINTENTIONAL_FOCUS_OUT,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const notFocusedChallenge = domainBuilder.buildChallenge({ focused: false });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };
        const challengeRepository = {
          get: sinon.stub().resolves(notFocusedChallenge),
        };
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType();
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [domainBuilder.buildAnswer({ challengeId: certificationChallenge.challengeId })],
        });

        // when
        const neutralizationOrValidationAttempt = await neutralizeOrValidateIfFocusedChallengeStrategy({
          certificationIssueReport,
          certificationAssessment,
          certificationIssueReportRepository,
          challengeRepository,
        });

        // then
        expect(neutralizationOrValidationAttempt).to.deepEqualInstance(
          CertificationIssueReportResolutionAttempt.resolvedWithoutEffect()
        );
      });

      it('resolves the certification issue report anyway', async function () {
        // given
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.UNINTENTIONAL_FOCUS_OUT,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const notFocusedChallenge = domainBuilder.buildChallenge({ focused: false });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };
        const challengeRepository = {
          get: sinon.stub().resolves(notFocusedChallenge),
        };
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType();
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [domainBuilder.buildAnswer({ challengeId: certificationChallenge.challengeId })],
        });

        // when
        await neutralizeOrValidateIfFocusedChallengeStrategy({
          certificationIssueReport,
          certificationAssessment,
          certificationIssueReportRepository,
          challengeRepository,
        });

        // then
        expect(certificationIssueReport.isResolved()).to.be.true;
        expect(certificationIssueReport.resolution).to.equal(
          "Cette question n'a pas été neutralisée car ce n'est pas une question focus"
        );
        expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
      });
    });
  });

  context('#DO_NOT_RESOLVE', function () {
    it('returns an unresolved resolution attempt', async function () {
      // given
      const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
        subcategory: CertificationIssueReportSubcategories.EMBED_NOT_WORKING,
        category: CertificationIssueReportCategories.IN_CHALLENGE,
        questionNumber: 1,
      });

      // when
      const resolutionAttempt = await doNotResolveStrategy({
        certificationIssueReport,
        certificationAssessment: null,
        certificationIssueReportRepository: null,
        challengeRepository: null,
      });

      // then
      expect(resolutionAttempt).to.deepEqualInstance(CertificationIssueReportResolutionAttempt.unresolved());
    });

    it('does not resolve the certification issue report', async function () {
      // given
      const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
        subcategory: CertificationIssueReportSubcategories.EMBED_NOT_WORKING,
        category: CertificationIssueReportCategories.IN_CHALLENGE,
        questionNumber: 1,
      });

      // when
      await doNotResolveStrategy({
        certificationIssueReport,
        certificationAssessment: null,
        certificationIssueReportRepository: null,
        challengeRepository: null,
      });

      // then
      expect(certificationIssueReport.isResolved()).to.be.false;
    });
  });

  context('#resolve', function () {
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      {
        // eslint-disable-next-line mocha/no-setup-in-describe
        subCategoryToBeResolved: CertificationIssueReportSubcategories.NAME_OR_BIRTHDATE,
        strategyToBeApplied: 'doNotResolve',
      },

      {
        // eslint-disable-next-line mocha/no-setup-in-describe
        subCategoryToBeResolved: CertificationIssueReportSubcategories.EXTRA_TIME_PERCENTAGE,
        strategyToBeApplied: 'doNotResolve',
      },

      {
        // eslint-disable-next-line mocha/no-setup-in-describe
        subCategoryToBeResolved: CertificationIssueReportSubcategories.LEFT_EXAM_ROOM,
        strategyToBeApplied: 'doNotResolve',
      },

      {
        // eslint-disable-next-line mocha/no-setup-in-describe
        subCategoryToBeResolved: CertificationIssueReportSubcategories.SIGNATURE_ISSUE,
        strategyToBeApplied: 'doNotResolve',
      },

      {
        // eslint-disable-next-line mocha/no-setup-in-describe
        subCategoryToBeResolved: CertificationIssueReportSubcategories.IMAGE_NOT_DISPLAYING,
        strategyToBeApplied: 'neutralizeIfImageOrEmbed',
      },

      {
        // eslint-disable-next-line mocha/no-setup-in-describe
        subCategoryToBeResolved: CertificationIssueReportSubcategories.LINK_NOT_WORKING,
        strategyToBeApplied: 'doNotResolve',
      },

      {
        // eslint-disable-next-line mocha/no-setup-in-describe
        subCategoryToBeResolved: CertificationIssueReportSubcategories.EMBED_NOT_WORKING,
        strategyToBeApplied: 'neutralizeIfImageOrEmbed',
      },

      {
        // eslint-disable-next-line mocha/no-setup-in-describe
        subCategoryToBeResolved: CertificationIssueReportSubcategories.FILE_NOT_OPENING,
        strategyToBeApplied: 'neutralizeIfAttachment',
      },

      {
        // eslint-disable-next-line mocha/no-setup-in-describe
        subCategoryToBeResolved: CertificationIssueReportSubcategories.WEBSITE_UNAVAILABLE,
        strategyToBeApplied: 'neutralizeWithoutChecking',
      },

      {
        // eslint-disable-next-line mocha/no-setup-in-describe
        subCategoryToBeResolved: CertificationIssueReportSubcategories.WEBSITE_BLOCKED,
        strategyToBeApplied: 'neutralizeWithoutChecking',
      },

      {
        // eslint-disable-next-line mocha/no-setup-in-describe
        subCategoryToBeResolved: CertificationIssueReportSubcategories.EXTRA_TIME_EXCEEDED,
        strategyToBeApplied: 'neutralizeIfTimedChallenge',
      },

      {
        // eslint-disable-next-line mocha/no-setup-in-describe
        subCategoryToBeResolved: CertificationIssueReportSubcategories.SOFTWARE_NOT_WORKING,
        strategyToBeApplied: 'neutralizeWithoutChecking',
      },

      {
        // eslint-disable-next-line mocha/no-setup-in-describe
        subCategoryToBeResolved: CertificationIssueReportSubcategories.OTHER,
        strategyToBeApplied: 'doNotResolve',
      },

      {
        // eslint-disable-next-line mocha/no-setup-in-describe
        subCategoryToBeResolved: CertificationIssueReportSubcategories.UNINTENTIONAL_FOCUS_OUT,
        strategyToBeApplied: 'neutralizeOrValidateIfFocusedChallenge',
      },
      {
        // eslint-disable-next-line mocha/no-setup-in-describe
        subCategoryToBeResolved: CertificationIssueReportSubcategories.SKIP_ON_OOPS,
        strategyToBeApplied: 'neutralizeWithoutChecking',
      },
      {
        // eslint-disable-next-line mocha/no-setup-in-describe
        subCategoryToBeResolved: CertificationIssueReportSubcategories.ACCESSIBILITY_ISSUE,
        strategyToBeApplied: 'neutralizeWithoutChecking',
      },
    ].forEach(({ subCategoryToBeResolved, strategyToBeApplied }) => {
      it(`apply strategy "${strategyToBeApplied}" when resolving issue report of subcategory "${subCategoryToBeResolved}"`, async function () {
        // given
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: subCategoryToBeResolved,
        });
        const certificationAssessment = domainBuilder.buildCertificationAssessment();
        const certificationIssueReportRepository = {};
        const challengeRepository = {};
        const strategyStub = sinon.stub();

        const strategies = new CertificationIssueReportResolutionStrategies({
          [strategyToBeApplied]: strategyStub,
          certificationIssueReportRepository,
          challengeRepository,
        });

        // when
        await strategies.resolve({ certificationIssueReport, certificationAssessment });

        // then
        expect(strategyStub).to.have.been.calledWith({
          certificationIssueReport,
          certificationAssessment,
          certificationIssueReportRepository,
          challengeRepository,
        });
      });
    });
  });
});
