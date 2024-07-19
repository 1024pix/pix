import CertificationRescoredByScript from '../../../../../../lib/domain/events/CertificationRescoredByScript.js';
import { CertificationRescoringByScriptJobHandler } from '../../../../../../src/certification/session-management/infrastructure/jobs/CertificationRescoringByScriptHandler.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Certification | session-management | Unit | Jobs | CertificationRescoringByScriptHandler', function () {
  it('should call usecase with given certificationCourseId', async function () {
    // given
    const certificationCourseId = 1;
    const eventDispatcherStub = {
      dispatch: sinon.stub(),
    };

    const handler = new CertificationRescoringByScriptJobHandler({ eventDispatcher: eventDispatcherStub });

    // when
    await handler.handle({ certificationCourseId });

    // then
    expect(eventDispatcherStub.dispatch).to.have.been.calledWithExactly(
      new CertificationRescoredByScript({ certificationCourseId }),
    );
  });
});
