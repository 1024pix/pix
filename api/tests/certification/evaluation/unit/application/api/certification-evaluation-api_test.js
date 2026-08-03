import sinon from 'sinon';

import * as certificationEvaluationApi from '../../../../../../src/certification/evaluation/application/api/certification-evaluation-api.js';
import { usecases } from '../../../../../../src/certification/evaluation/domain/usecases/index.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Application | Certification | Evaluation | API', function () {
  describe('#getAssessmentLiveAlerts', function () {
    it('should call getAssessmentLiveAlerts usecase', async function () {
      // given
      const assessmentId = Symbol('assessmentId');
      const liveAlerts = Symbol('liveAlerts');
      sinon.stub(usecases, 'getAssessmentLiveAlerts').withArgs({ assessmentId }).resolves(liveAlerts);

      // when
      const result = await certificationEvaluationApi.getAssessmentLiveAlerts({ assessmentId });

      // then
      expect(result).to.equal(liveAlerts);
    });
  });

  describe('#completeCertificationAssessment', function () {
    it('should call completeCertificationAssessment', async function () {
      // given
      const locale = Symbol('locale');
      const certificationCourseId = Symbol('certificationCourseId');
      sinon.stub(usecases, 'completeCertificationAssessment');

      // when
      await certificationEvaluationApi.completeCertificationAssessment({ certificationCourseId, locale });

      // then
      expect(usecases.completeCertificationAssessment).to.have.been.calledOnceWith({ locale, certificationCourseId });
    });
  });
});
