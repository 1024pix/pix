import sinon from 'sinon';

import { ChallengeAlreadyAnsweredError } from '../../../../../../src/certification/evaluation/domain/errors.js';
import { validateLiveAlert } from '../../../../../../src/certification/session-management/domain/usecases/validate-live-alert.js';
import { CertificationChallengeLiveAlertStatus } from '../../../../../../src/certification/shared/domain/models/CertificationChallengeLiveAlert.js';
import {
  CertificationIssueReportCategory,
  CertificationIssueReportSubcategories,
} from '../../../../../../src/certification/shared/domain/models/CertificationIssueReportCategory.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';

import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Unit | UseCase | validate-live-alert', function () {
  let certificationChallengeLiveAlertRepository;
  let assessmentRepository;
  let issueReportCategoryRepository;
  let certificationIssueReportRepository;
  let answerRepository;

  beforeEach(function () {
    certificationChallengeLiveAlertRepository = {
      getOngoingBySessionIdAndUserId: sinon.stub(),
      save: sinon.stub().resolves(),
    };

    assessmentRepository = {
      get: sinon.stub(),
    };

    issueReportCategoryRepository = {
      get: sinon.stub(),
    };

    certificationIssueReportRepository = {
      save: sinon.stub(),
    };

    answerRepository = {
      findByAssessment: sinon.stub(),
    };
  });

  describe('when the liveAlert does not exist', function () {
    it('should throw a NotFoundError', async function () {
      // given
      const sessionId = 123;
      const userId = 456;
      certificationChallengeLiveAlertRepository.getOngoingBySessionIdAndUserId
        .withArgs({
          sessionId,
          userId,
        })
        .resolves(null);

      // when
      const error = await catchErr(validateLiveAlert)({
        certificationChallengeLiveAlertRepository,
        sessionId,
        userId,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  describe('when the liveAlert exists', function () {
    describe('when an answer for the alerted challenge exists', function () {
      it('should throw an error', async function () {
        // given
        const sessionId = 123;
        const userId = 456;
        const assessmentId = 789;
        const questionNumber = 2;
        const challengeId = 'rec123';

        const onGoingLiveAlert = domainBuilder.buildCertificationChallengeLiveAlert({
          questionNumber,
          challengeId,
          assessmentId,
          status: CertificationChallengeLiveAlertStatus.ONGOING,
        });

        certificationChallengeLiveAlertRepository.getOngoingBySessionIdAndUserId
          .withArgs({
            sessionId,
            userId,
          })
          .resolves(onGoingLiveAlert);

        answerRepository.findByAssessment
          .withArgs(onGoingLiveAlert.assessmentId)
          .resolves([domainBuilder.buildAnswer({ challengeId })]);

        const error = await catchErr(validateLiveAlert)({
          certificationChallengeLiveAlertRepository,
          issueReportCategoryRepository,
          certificationIssueReportRepository,
          answerRepository,
          sessionId,
          userId,
        });

        // then
        expect(onGoingLiveAlert.status).equals(CertificationChallengeLiveAlertStatus.DISMISSED);
        expect(certificationChallengeLiveAlertRepository.save).to.have.been.calledWith({
          certificationChallengeLiveAlert: onGoingLiveAlert,
        });

        expect(error).to.be.instanceOf(ChallengeAlreadyAnsweredError);
      });
    });

    it('should update the LiveAlert and create a new resolved CertificationIssueReport', async function () {
      // given
      const sessionId = 123;
      const userId = 456;
      const certificationCourseId = 123456;
      const subcategoryId = 1234;
      const category = CertificationIssueReportCategory.IN_CHALLENGE;
      const subcategory = CertificationIssueReportSubcategories.IMAGE_NOT_DISPLAYING;
      const questionNumber = 2;
      const liveAlert = domainBuilder.buildCertificationChallengeLiveAlert({
        questionNumber,
      });
      const assessment = domainBuilder.buildAssessment({
        id: liveAlert.assessmentId,
        certificationCourseId,
      });

      const issueReportCategory = {
        id: subcategoryId,
        name: subcategory,
        isDeprecated: false,
        isImpactful: true,
        issueReportCategoryId: 5,
      };

      certificationChallengeLiveAlertRepository.getOngoingBySessionIdAndUserId
        .withArgs({
          sessionId,
          userId,
        })
        .resolves(liveAlert);

      assessmentRepository.get.withArgs(liveAlert.assessmentId).resolves(assessment);

      issueReportCategoryRepository.get
        .withArgs({
          name: subcategory,
        })
        .resolves(issueReportCategory);

      answerRepository.findByAssessment.withArgs(liveAlert.assessmentId).resolves([]);

      const validatedLiveAlert = domainBuilder.buildCertificationChallengeLiveAlert({
        assessmentId: liveAlert.assessmentId,
        challengeId: liveAlert.challengeId,
        status: CertificationChallengeLiveAlertStatus.VALIDATED,
        questionNumber,
      });

      // when
      await validateLiveAlert({
        certificationChallengeLiveAlertRepository,
        issueReportCategoryRepository,
        assessmentRepository,
        certificationIssueReportRepository,
        answerRepository,
        subcategory,
        sessionId,
        userId,
      });

      // then
      expect(certificationChallengeLiveAlertRepository.save).to.have.been.calledWithExactly({
        certificationChallengeLiveAlert: domainBuilder.buildCertificationChallengeLiveAlert(validatedLiveAlert),
      });

      const expectedCertificationIssueReport = domainBuilder.buildCertificationIssueReport({
        certificationCourseId,
        subcategory,
        categoryId: issueReportCategory.id,
        category,
        questionNumber,
        liveAlertId: liveAlert.id,
        resolvedAt: sinon.match.date,
        resolution:
          'Le signalement a été validé par le surveillant pendant la session. Une nouvelle question a été proposée au candidat',
        hasBeenAutomaticallyResolved: true,
      });
      expectedCertificationIssueReport.id = undefined;
      expectedCertificationIssueReport.description = undefined;

      expect(certificationIssueReportRepository.save).to.have.been.calledWith({
        certificationIssueReport: expectedCertificationIssueReport,
      });
    });
  });
});
