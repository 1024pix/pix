import { NotFoundError } from '../../../../../../lib/domain/errors.js';
import { dismissLiveAlert } from '../../../../../../src/certification/session-management/domain/usecases/dismiss-live-alert.js';
import { CertificationChallengeLiveAlertStatus } from '../../../../../../src/certification/shared/domain/models/CertificationChallengeLiveAlert.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | dismiss-live-alert', function () {
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
      const error = await catchErr(dismissLiveAlert)({
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

      const dismissedLiveAlert = domainBuilder.buildCertificationChallengeLiveAlert({
        assessmentId: liveAlert.assessmentId,
        challengeId: liveAlert.challengeId,
        status: CertificationChallengeLiveAlertStatus.DISMISSED,
      });

      // when
      await dismissLiveAlert({
        certificationChallengeLiveAlertRepository,
        sessionId,
        userId,
      });

      // then
      expect(certificationChallengeLiveAlertRepository.save).to.have.been.calledWithExactly({
        certificationChallengeLiveAlert: domainBuilder.buildCertificationChallengeLiveAlert(dismissedLiveAlert),
      });
    });
  });
});
