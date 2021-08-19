const { expect, domainBuilder, sinon } = require('../../../test-helper');
const { CertificationIssueReportCategories, CertificationIssueReportSubcategories } = require('../../../../lib/domain/models/CertificationIssueReportCategory');
const CertificationIssueReportResolutionAttempt = require('../../../../lib/domain/models/CertificationIssueReportResolutionAttempt');
const { CertificationIssueReportResolutionStrategies } = require('../../../../lib/domain/models/CertificationIssueReportResolutionStrategies');
const {
  neutralizeWithoutCheckingStrategy,
  neutralizeIfImageStrategy,
  neutralizeIfEmbedStrategy,
  neutralizeIfAttachmentStrategy,
  doNotResolveStrategy,
} = require('../../../../lib/domain/models/CertificationIssueReportResolutionStrategies');

describe('Unit | Domain | Models | CertificationIssueReportResolutionStrategies', function() {

  context('#NEUTRALIZE_WITHOUT_CHECKING', function() {

    context('When challenge is neutralizable', function() {

      it('neutralizes successfully', async function() {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
        const certificationAnswer = domainBuilder.buildAnswer.ko(({ challengeId: certificationChallenge.challengeId }));
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
        const neutralizationAttempt = await neutralizeWithoutCheckingStrategy({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository });

        // then
        expect(neutralizationAttempt).to.deep.equal(CertificationIssueReportResolutionAttempt.resolvedWithEffect());
      });

      it('resolves the issue report', async function() {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
        const certificationAnswer = domainBuilder.buildAnswer.ko(({ challengeId: certificationChallenge.challengeId }));
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
        await neutralizeWithoutCheckingStrategy({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository });

        // then
        expect(certificationIssueReport.isResolved()).to.be.true;
        expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
      });
    });

    context('When challenge is not neutralizable', function() {

      it('returns a successful resolution without effect', async function() {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
        const certificationAnswer = domainBuilder.buildAnswer.ok(({ challengeId: certificationChallenge.challengeId }));
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
        const neutralizationAttempt = await neutralizeWithoutCheckingStrategy({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository });

        // then
        expect(neutralizationAttempt).to.deep.equal(CertificationIssueReportResolutionAttempt.resolvedWithoutEffect());
      });

      it('resolves the certification issue report anyway', async function() {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
        const certificationAnswer = domainBuilder.buildAnswer.ok(({ challengeId: certificationChallenge.challengeId }));
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
        await neutralizeWithoutCheckingStrategy({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository });

        // then
        expect(certificationIssueReport.isResolved()).to.be.true;
        expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
      });
    });
  });

  context('#NEUTRALIZE_IF_IMAGE', function() {

    context('When challenge is neutralizable', function() {

      it('neutralizes successfully', async function() {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
        const certificationAnswer = domainBuilder.buildAnswer.ko(({ challengeId: certificationChallenge.challengeId }));
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
        const neutralizationAttempt = await neutralizeIfImageStrategy({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository, challengeRepository });

        // then
        expect(neutralizationAttempt).to.deep.equal(CertificationIssueReportResolutionAttempt.resolvedWithEffect());
      });

      it('resolves the issue report', async function() {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
        const certificationAnswer = domainBuilder.buildAnswer.ko(({ challengeId: certificationChallenge.challengeId }));
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
        await neutralizeIfImageStrategy({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository, challengeRepository });

        // then
        expect(certificationIssueReport.isResolved()).to.be.true;
        expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
      });
    });

    context('the challenge does not contain the question designated by the question number', function() {

      it('returns a successful resolution without effect', async function() {
        // given
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.SOFTWARE_NOT_WORKING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const certificationIssueReportRepository = {
          save: () => {},
        };
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [domainBuilder.buildCertificationChallengeWithType()],
          certificationAnswersByDate: [],
        });

        // when
        const neutralizationAttempt = await neutralizeIfImageStrategy({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository });

        // then
        expect(neutralizationAttempt).to.deep.equal(CertificationIssueReportResolutionAttempt.resolvedWithoutEffect());
      });

      it('resolves the certification issue report anyway', async function() {
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
        await neutralizeIfImageStrategy({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository });

        // then
        expect(certificationIssueReport.isResolved()).to.be.true;
        expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
      });
    });

    context('the challenge does not contain an image', function() {

      it('returns a successful resolution without effect', async function() {
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
        const neutralizationAttempt = await neutralizeIfImageStrategy({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository, challengeRepository });

        // then
        expect(neutralizationAttempt).to.deep.equal(CertificationIssueReportResolutionAttempt.resolvedWithoutEffect());
      });

      it('resolves the certification issue report anyway', async function() {
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
        await neutralizeIfImageStrategy({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository, challengeRepository });

        // then
        expect(certificationIssueReport.isResolved()).to.be.true;
        expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
      });
    });

    context('When challenge is not neutralizable', function() {

      it('returns a successful resolution attempt without effect', async function() {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
        const certificationAnswer = domainBuilder.buildAnswer.ok(({ challengeId: certificationChallenge.challengeId }));
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
        const neutralizationAttempt = await neutralizeIfImageStrategy({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository, challengeRepository });

        // then
        expect(neutralizationAttempt).to.deep.equal(CertificationIssueReportResolutionAttempt.resolvedWithoutEffect());
      });

      it('resolves the certification issue report anyway', async function() {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
        const certificationAnswer = domainBuilder.buildAnswer.ok(({ challengeId: certificationChallenge.challengeId }));
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
        await neutralizeIfImageStrategy({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository, challengeRepository });

        // then
        expect(certificationIssueReport.isResolved()).to.be.true;
        expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
      });
    });
  });

  context('#NEUTRALIZE_IF_EMBED', function() {

    context('When challenge is neutralizable', function() {

      it('neutralizes successfully', async function() {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
        const certificationAnswer = domainBuilder.buildAnswer.ko(({ challengeId: certificationChallenge.challengeId }));
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [certificationAnswer],
        });
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.EMBED_NOT_WORKING,
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
        const neutralizationAttempt = await neutralizeIfEmbedStrategy({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository, challengeRepository });

        // then
        expect(neutralizationAttempt).to.deep.equal(CertificationIssueReportResolutionAttempt.resolvedWithEffect());
      });

      it('resolves the issue report', async function() {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
        const certificationAnswer = domainBuilder.buildAnswer.ko(({ challengeId: certificationChallenge.challengeId }));
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
        await neutralizeIfEmbedStrategy({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository, challengeRepository });

        // then
        expect(certificationIssueReport.isResolved()).to.be.true;
        expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
      });
    });

    context('the challenge does not contain the question designated by the question number', function() {

      it('returns a successful resolution attempt without effect', async function() {
        // given
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.SOFTWARE_NOT_WORKING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const certificationIssueReportRepository = {
          save: () => {},
        };
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [domainBuilder.buildCertificationChallengeWithType()],
          certificationAnswersByDate: [],
        });

        // when
        const neutralizationAttempt = await neutralizeIfEmbedStrategy({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository });

        // then
        expect(neutralizationAttempt).to.deep.equal(CertificationIssueReportResolutionAttempt.resolvedWithoutEffect());
      });

      it('resolves the certification issue report anyway', async function() {
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
        await neutralizeIfEmbedStrategy({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository });

        // then
        expect(certificationIssueReport.isResolved()).to.be.true;
        expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
      });
    });

    context('the challenge does not contain an embed', function() {

      it('returns a successful resolution without effect', async function() {
        // given
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.SOFTWARE_NOT_WORKING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const challengeWithoutEmbed = domainBuilder.buildChallenge({ embedUrl: null });
        const certificationIssueReportRepository = {
          save: () => {},
        };
        const challengeRepository = {
          get: sinon.stub().resolves(challengeWithoutEmbed),
        };
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType();
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [domainBuilder.buildAnswer({ challengeId: certificationChallenge.challengeId })],
        });

        // when
        const neutralizationAttempt = await neutralizeIfEmbedStrategy({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository, challengeRepository });

        // then
        expect(certificationIssueReport.resolution).to.equal('Cette question n\' a pas été neutralisée car elle ne contient pas d\'application/simulateur');
        expect(neutralizationAttempt).to.deep.equal(CertificationIssueReportResolutionAttempt.resolvedWithoutEffect());
      });

      it('resolves the certification issue report anyway', async function() {
        // given
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.SOFTWARE_NOT_WORKING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const challengeWithoutEmbed = domainBuilder.buildChallenge({ embedUrl: null });
        const certificationIssueReportRepository = {
          save: sinon.stub(),
        };
        const challengeRepository = {
          get: sinon.stub().resolves(challengeWithoutEmbed),
        };
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType();
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [domainBuilder.buildAnswer({ challengeId: certificationChallenge.challengeId })],
        });

        // when
        await neutralizeIfEmbedStrategy({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository, challengeRepository });

        // then
        expect(certificationIssueReport.isResolved()).to.be.true;
        expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
      });
    });

    context('When challenge is not neutralizable', function() {

      it('returns a successful resolution without effect', async function() {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
        const certificationAnswer = domainBuilder.buildAnswer.ok(({ challengeId: certificationChallenge.challengeId }));
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [certificationAnswer],
        });
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.EMBED_NOT_WORKING,
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
        const neutralizationAttempt = await neutralizeIfEmbedStrategy({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository, challengeRepository });

        // then
        expect(neutralizationAttempt).to.deep.equal(CertificationIssueReportResolutionAttempt.resolvedWithoutEffect());
      });

      it('resolves the certification issue report anyway', async function() {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
        const certificationAnswer = domainBuilder.buildAnswer.ok(({ challengeId: certificationChallenge.challengeId }));
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [certificationChallenge],
          certificationAnswersByDate: [certificationAnswer],
        });
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.EMBED_NOT_WORKING,
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
        await neutralizeIfEmbedStrategy({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository, challengeRepository });

        // then
        expect(certificationIssueReport.isResolved()).to.be.true;
        expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
      });
    });
  });

  context('#NEUTRALIZE_IF_ATTACHMENT', function() {

    context('When challenge is neutralizable', function() {

      it('neutralizes successfully', async function() {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
        const certificationAnswer = domainBuilder.buildAnswer.ko(({ challengeId: certificationChallenge.challengeId }));
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
        const neutralizationAttempt = await neutralizeIfAttachmentStrategy({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository, challengeRepository });

        // then
        expect(neutralizationAttempt).to.deep.equal(CertificationIssueReportResolutionAttempt.resolvedWithEffect());
      });

      it('resolves the issue report', async function() {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
        const certificationAnswer = domainBuilder.buildAnswer.ko(({ challengeId: certificationChallenge.challengeId }));
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
        await neutralizeIfAttachmentStrategy({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository, challengeRepository });

        // then
        expect(certificationIssueReport.isResolved()).to.be.true;
        expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
      });
    });

    context('the challenge does not contain the question designated by the question number', function() {

      it('returns a successful resolution attempt without effect', async function() {
        // given
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.SOFTWARE_NOT_WORKING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const certificationIssueReportRepository = {
          save: () => {},
        };
        const certificationAssessment = domainBuilder.buildCertificationAssessment({
          certificationChallenges: [domainBuilder.buildCertificationChallengeWithType()],
          certificationAnswersByDate: [],
        });

        // when
        const neutralizationAttempt = await neutralizeIfAttachmentStrategy({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository });

        // then
        expect(neutralizationAttempt).to.deep.equal(CertificationIssueReportResolutionAttempt.resolvedWithoutEffect());
      });

      it('resolves the certification issue report anyway', async function() {
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
        await neutralizeIfAttachmentStrategy({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository });

        // then
        expect(certificationIssueReport.isResolved()).to.be.true;
        expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
      });
    });

    context('the challenge does not contain an attachment', function() {

      it('returns a successful resolution without effect', async function() {
        // given
        const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
          subcategory: CertificationIssueReportSubcategories.FILE_NOT_OPENING,
          category: CertificationIssueReportCategories.IN_CHALLENGE,
          questionNumber: 1,
        });
        const challengeWithoutAttachment = domainBuilder.buildChallenge({ attachments: [] });
        const certificationIssueReportRepository = {
          save: () => {},
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
        const neutralizationAttempt = await neutralizeIfAttachmentStrategy({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository, challengeRepository });

        // then
        expect(neutralizationAttempt).to.deep.equal(CertificationIssueReportResolutionAttempt.resolvedWithoutEffect());
      });

      it('resolves the certification issue report anyway', async function() {
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
        await neutralizeIfAttachmentStrategy({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository, challengeRepository });

        // then
        expect(certificationIssueReport.isResolved()).to.be.true;
        expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
      });
    });

    context('When challenge is not neutralizable', function() {

      it('returns a successful resolution without effect', async function() {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
        const certificationAnswer = domainBuilder.buildAnswer.ok(({ challengeId: certificationChallenge.challengeId }));
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
        const neutralizationAttempt = await neutralizeIfAttachmentStrategy({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository, challengeRepository });

        // then
        expect(neutralizationAttempt).to.deep.equal(CertificationIssueReportResolutionAttempt.resolvedWithoutEffect());
      });

      it('resolves the certification issue report anyway', async function() {
        // given
        const certificationChallenge = domainBuilder.buildCertificationChallengeWithType({});
        const certificationAnswer = domainBuilder.buildAnswer.ok(({ challengeId: certificationChallenge.challengeId }));
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
        await neutralizeIfAttachmentStrategy({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository, challengeRepository });

        // then
        expect(certificationIssueReport.isResolved()).to.be.true;
        expect(certificationIssueReportRepository.save).to.have.been.calledOnceWithExactly(certificationIssueReport);
      });
    });
  });

  context('#DO_NOT_RESOLVE', function() {
    it('returns an unresolved resolution attempt', async function() {
      // given
      const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
        subcategory: CertificationIssueReportSubcategories.EMBED_NOT_WORKING,
        category: CertificationIssueReportCategories.IN_CHALLENGE,
        questionNumber: 1,
      });

      // when
      const resolutionAttempt = await doNotResolveStrategy({ certificationIssueReport, certificationAssessment: null, certificationIssueReportRepository: null, challengeRepository: null });

      // then
      expect(resolutionAttempt).to.deep.equal(CertificationIssueReportResolutionAttempt.unresolved());
    });

    it('does not resolve the certification issue report', async function() {
      // given
      const certificationIssueReport = domainBuilder.buildCertificationIssueReport({
        subcategory: CertificationIssueReportSubcategories.EMBED_NOT_WORKING,
        category: CertificationIssueReportCategories.IN_CHALLENGE,
        questionNumber: 1,
      });

      // when
      await doNotResolveStrategy({ certificationIssueReport, certificationAssessment: null, certificationIssueReportRepository: null, challengeRepository: null });

      // then
      expect(certificationIssueReport.isResolved()).to.be.false;
    });
  });

  context('#resolve', function() {
    [
      { subCategoryToBeResolved: CertificationIssueReportSubcategories.NAME_OR_BIRTHDATE, strategyToBeApplied: 'doNotResolve' },
      { subCategoryToBeResolved: CertificationIssueReportSubcategories.EXTRA_TIME_PERCENTAGE, strategyToBeApplied: 'doNotResolve' },
      { subCategoryToBeResolved: CertificationIssueReportSubcategories.LEFT_EXAM_ROOM, strategyToBeApplied: 'doNotResolve' },
      { subCategoryToBeResolved: CertificationIssueReportSubcategories.SIGNATURE_ISSUE, strategyToBeApplied: 'doNotResolve' },
      { subCategoryToBeResolved: CertificationIssueReportSubcategories.IMAGE_NOT_DISPLAYING, strategyToBeApplied: 'neutralizeIfImage' },
      { subCategoryToBeResolved: CertificationIssueReportSubcategories.LINK_NOT_WORKING, strategyToBeApplied: 'doNotResolve' },
      { subCategoryToBeResolved: CertificationIssueReportSubcategories.EMBED_NOT_WORKING, strategyToBeApplied: 'neutralizeIfEmbed' },
      { subCategoryToBeResolved: CertificationIssueReportSubcategories.FILE_NOT_OPENING, strategyToBeApplied: 'neutralizeIfAttachment' },
      { subCategoryToBeResolved: CertificationIssueReportSubcategories.WEBSITE_UNAVAILABLE, strategyToBeApplied: 'neutralizeWithoutChecking' },
      { subCategoryToBeResolved: CertificationIssueReportSubcategories.WEBSITE_BLOCKED, strategyToBeApplied: 'neutralizeWithoutChecking' },
      { subCategoryToBeResolved: CertificationIssueReportSubcategories.EXTRA_TIME_EXCEEDED, strategyToBeApplied: 'doNotResolve' },
      { subCategoryToBeResolved: CertificationIssueReportSubcategories.SOFTWARE_NOT_WORKING, strategyToBeApplied: 'neutralizeWithoutChecking' },
      { subCategoryToBeResolved: CertificationIssueReportSubcategories.OTHER, strategyToBeApplied: 'doNotResolve' },
    ].forEach(({
      subCategoryToBeResolved,
      strategyToBeApplied,
    }) => {
      it(`apply strategy "${strategyToBeApplied}" when resolving issue report of subcategory "${subCategoryToBeResolved}"`, async function() {
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
        expect(strategyStub).to.have.been.calledWith({ certificationIssueReport, certificationAssessment, certificationIssueReportRepository, challengeRepository });
      });
    });
  });
});
