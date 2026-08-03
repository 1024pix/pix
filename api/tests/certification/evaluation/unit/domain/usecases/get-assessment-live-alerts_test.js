import sinon from 'sinon';

import { getAssessmentLiveAlerts } from '../../../../../../src/certification/evaluation/domain/usecases/get-assessment-live-alerts.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Certification | Evaluation | Domain | UseCase | get-assessment-live-alerts', function () {
  it('returns the challenge and companion live alerts of the assessment', async function () {
    // given
    const assessmentId = 123;
    const challengeLiveAlerts = [Symbol('challengeLiveAlert')];
    const companionLiveAlerts = [Symbol('companionLiveAlert')];
    const certificationChallengeLiveAlertRepository = { getByAssessmentId: sinon.stub() };
    const certificationCompanionAlertRepository = { getAllByAssessmentId: sinon.stub() };
    certificationChallengeLiveAlertRepository.getByAssessmentId
      .withArgs({ assessmentId })
      .resolves(challengeLiveAlerts);
    certificationCompanionAlertRepository.getAllByAssessmentId.withArgs({ assessmentId }).resolves(companionLiveAlerts);

    // when
    const result = await getAssessmentLiveAlerts({
      assessmentId,
      certificationChallengeLiveAlertRepository,
      certificationCompanionAlertRepository,
    });

    // then
    expect(result).to.deep.equal({ challengeLiveAlerts, companionLiveAlerts });
  });
});
