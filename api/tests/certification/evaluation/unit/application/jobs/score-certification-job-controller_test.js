import { expect } from 'chai';
import sinon from 'sinon';

import { ScoreCertificationJob } from '../../../../../../src/certification/configuration/domain/models/ScoreCertificationJob.js';
import { ScoreCertificationJobController } from '../../../../../../src/certification/evaluation/application/jobs/score-certification-job-controller.js';
import { usecases } from '../../../../../../src/certification/evaluation/domain/usecases/index.js';

describe('Unit | Certification | Evaluation | Application | jobs | ScoreCertificationJobController', function () {
  it('calls scoreV3Certification with the certificationCourseId', async function () {
    // given
    sinon.stub(usecases, 'scoreV3Certification');
    const controller = new ScoreCertificationJobController();
    const data = new ScoreCertificationJob({ certificationCourseId: 123 });

    // when
    await controller.handle({ data });

    // then
    expect(usecases.scoreV3Certification).to.have.been.calledWithExactly({ certificationCourseId: 123 });
  });
});
