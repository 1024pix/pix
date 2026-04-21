import sinon from 'sinon';

import { CertificationCompletedJobController } from '../../../../../../src/certification/evaluation/application/jobs/certification-completed-job-controller.js';
import { CertificationCompletedJob } from '../../../../../../src/certification/evaluation/domain/events/CertificationCompleted.js';
import { usecases } from '../../../../../../src/certification/evaluation/domain/usecases/index.js';
import { FRENCH_SPOKEN } from '../../../../../../src/shared/domain/services/locale-service.js';

describe('Unit | Certification | Evaluation | Application | jobs | CertificationCompletedJobController', function () {
  let certificationCompletedJobController, data;
  const certificationCourseId = 123;

  beforeEach(function () {
    certificationCompletedJobController = new CertificationCompletedJobController();
    data = new CertificationCompletedJob({
      certificationCourseId,
      locale: FRENCH_SPOKEN,
    });
  });

  it('should call the scoreV3Certification usecase', async function () {
    // given
    sinon.stub(usecases, 'scoreV3Certification');

    // when
    await certificationCompletedJobController.handle({
      data,
    });

    // then
    expect(usecases.scoreV3Certification).to.have.been.calledWithExactly({
      certificationCourseId: data.certificationCourseId,
      locale: FRENCH_SPOKEN,
    });
  });
});
