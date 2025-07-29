import { CertificationCompletedJobController } from '../../../../../../src/certification/evaluation/application/jobs/certification-completed-job-controller.js';
import { CertificationCompletedJob } from '../../../../../../src/certification/evaluation/domain/events/CertificationCompleted.js';
import { usecases } from '../../../../../../src/certification/evaluation/domain/usecases/index.js';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { FRENCH_SPOKEN } from '../../../../../../src/shared/domain/services/locale-service.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | Certification | Application | jobs | CertificationCompletedJobController', function () {
  let certificationCompletedJobController;
  let certificationAssessmentRepository;

  beforeEach(function () {
    certificationCompletedJobController = new CertificationCompletedJobController();
    certificationAssessmentRepository = { get: sinon.stub() };
  });

  context('when assessment is of type CERTIFICATION', function () {
    const assessmentId = 1214;
    const certificationCourseId = 1234;
    const userId = 4567;

    context('when certification is V2', function () {
      let data;
      let certificationAssessment;

      beforeEach(function () {
        data = new CertificationCompletedJob({
          assessmentId,
          userId,
          certificationCourseId: 123,
        });
        certificationAssessment = domainBuilder.buildCertificationAssessment({
          id: assessmentId,
          certificationCourseId,
          userId,
          version: AlgorithmEngineVersion.V2,
        });
        certificationAssessmentRepository.get.withArgs(assessmentId).resolves(certificationAssessment);
      });

      it('should call the scoreCompletedV2Certification usecase', async function () {
        // given
        sinon.stub(usecases, 'scoreCompletedV2Certification');
        sinon.stub(usecases, 'scoreCompletedV3Certification');

        // when
        await certificationCompletedJobController.handle({
          data,
          dependencies: { certificationAssessmentRepository },
        });

        // then
        expect(usecases.scoreCompletedV2Certification).to.have.been.calledWithExactly({
          certificationAssessment,
        });
        expect(usecases.scoreCompletedV3Certification).to.not.have.been.called;
      });
    });

    context('when certification is V3', function () {
      let data;
      let certificationAssessment;

      beforeEach(function () {
        data = new CertificationCompletedJob({
          assessmentId,
          userId,
          certificationCourseId: 123,
          locale: FRENCH_SPOKEN,
        });
        certificationAssessment = {
          id: assessmentId,
          certificationCourseId,
          userId,
          createdAt: Symbol('someCreationDate'),
          version: AlgorithmEngineVersion.V3,
        };
        certificationAssessmentRepository.get.withArgs(assessmentId).resolves(certificationAssessment);
      });

      it('should call the scoreCompletedV3Certification usecase', async function () {
        // given
        sinon.stub(usecases, 'scoreCompletedV2Certification');
        sinon.stub(usecases, 'scoreCompletedV3Certification');

        // when
        await certificationCompletedJobController.handle({
          data,
          dependencies: { certificationAssessmentRepository },
        });

        // then
        expect(usecases.scoreCompletedV3Certification).to.have.been.calledWithExactly({
          certificationAssessment,
          locale: FRENCH_SPOKEN,
        });
        expect(usecases.scoreCompletedV2Certification).to.not.have.been.called;
      });
    });
  });
});
