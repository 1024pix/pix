import { catchErr, domainBuilder, expect, sinon } from '../../../../../test-helper.js';
import { CertificationChallengeLiveAlertStatus } from '../../../../../../src/certification/session/domain/models/CertificationChallengeLiveAlert.js';
import { NotFoundError } from '../../../../../../lib/domain/errors.js';
import { validateLiveAlert } from '../../../../../../src/certification/session/domain/usecases/validate-live-alert.js';
import {
  CertificationIssueReportCategory,
  CertificationIssueReportSubcategories,
} from '../../../../../../lib/domain/models/CertificationIssueReportCategory.js';

describe('Unit | UseCase | validate-live-alert', function () {
  let certificationChallengeLiveAlertRepository;

  beforeEach(function () {
    certificationChallengeLiveAlertRepository = {
      getOngoingBySessionIdAndUserId: sinon.stub(),
      save: sinon.stub().resolves(),
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
    it('should update the LiveAlert', async function () {
      // given
      const liveAlert = domainBuilder.buildCertificationChallengeLiveAlert();
      const sessionId = 123;
      const userId = 456;
      certificationChallengeLiveAlertRepository.getOngoingBySessionIdAndUserId
        .withArgs({
          sessionId,
          userId,
        })
        .resolves(liveAlert);

      const validatedLiveAlert = domainBuilder.buildCertificationChallengeLiveAlert({
        assessmentId: liveAlert.assessmentId,
        challengeId: liveAlert.challengeId,
        status: CertificationChallengeLiveAlertStatus.VALIDATED,
      });

      // when
      await validateLiveAlert({
        certificationChallengeLiveAlertRepository,
        sessionId,
        userId,
      });

      // then
      expect(certificationChallengeLiveAlertRepository.save).to.have.been.calledWithExactly({
        certificationChallengeLiveAlert: domainBuilder.buildCertificationChallengeLiveAlert(validatedLiveAlert),
      });
    });
  });
});
