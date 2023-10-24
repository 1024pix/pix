import { catchErr, domainBuilder, expect, sinon } from '../../../../../test-helper.js';
import { CertificationChallengeLiveAlertStatus } from '../../../../../../src/certification/session/domain/models/CertificationChallengeLiveAlert.js';
import { NotFoundError } from '../../../../../../lib/domain/errors.js';
import { validateLiveAlert } from '../../../../../../src/certification/session/domain/usecases/validate-live-alert.js';
import {
  CertificationIssueReportCategory,
  CertificationIssueReportSubcategories,
} from '../../../../../../src/certification/shared/domain/models/CertificationIssueReportCategory.js';

describe('Unit | UseCase | validate-live-alert', function () {
  let certificationChallengeLiveAlertRepository;
  let assessmentRepository;
  let issueReportCategoryRepository;
  let certificationIssueReportRepository;

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
    it('should update the LiveAlert and create a new CertificationIssueReport', async function () {
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
      });
      expectedCertificationIssueReport.id = undefined;
      expectedCertificationIssueReport.description = undefined;

      expect(certificationIssueReportRepository.save).to.have.been.calledWith(expectedCertificationIssueReport);
    });
  });
});
