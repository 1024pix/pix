import { domainBuilder, expect, sinon } from '../../../test-helper.js';
import { createCertificationChallengeLiveAlert } from '../../../../lib/domain/usecases/create-certification-challenge-live-alert.js';

describe('Unit | UseCase | create-certification-challenge-live-alert', function () {
  let certificationChallengeLiveAlertRepository;

  beforeEach(function () {
    certificationChallengeLiveAlertRepository = {
      save: sinon.stub(),
    };
  });

  it('should pause the assessment', async function () {
    // given
    const assessmentId = 123;
    const challengeId = 'pix123';
    const certificationChallengeLiveAlert = domainBuilder.buildCertificationChallengeLiveAlert({
      assessmentId,
      challengeId,
    });

    certificationChallengeLiveAlertRepository.save.withArgs({ certificationChallengeLiveAlert }).resolves();

    // when
    await createCertificationChallengeLiveAlert({
      assessmentId,
      challengeId,
      certificationChallengeLiveAlertRepository,
    });

    // then
    expect(certificationChallengeLiveAlertRepository.save).to.have.been.calledOnce;
  });
});
