import sinon from 'sinon';

import { unrejectCertificationCourse } from '../../../../../../src/certification/session-management/domain/usecases/unreject-certification-course.js';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { CertificationCourse } from '../../../../../../src/certification/shared/domain/models/CertificationCourse.js';
import { CertificationCourseUnrejected } from '../../../../../../src/shared/domain/events/CertificationCourseUnrejected.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | UseCase | unreject-certification-course', function () {
  describe('when certification is a V2', function () {
    it('should unreject a rejected certification course', async function () {
      // given
      const certificationCourseRepository = { get: sinon.stub(), update: sinon.stub() };
      const certificationEvaluationRepository = { rescoreV2Certification: sinon.stub() };
      const juryId = 123;

      const dependencies = {
        certificationCourseRepository,
        certificationEvaluationRepository,
      };
      const certificationCourse = domainBuilder.buildCertificationCourse({
        isRejectedForFraud: true,
        version: AlgorithmEngineVersion.V2,
      });
      const certificationCourseId = certificationCourse.getId();

      certificationCourseRepository.get.withArgs({ id: certificationCourseId }).resolves(certificationCourse);
      certificationCourseRepository.update.resolves();
      certificationEvaluationRepository.rescoreV2Certification.resolves();

      // when
      await unrejectCertificationCourse({
        ...dependencies,
        juryId,
        certificationCourseId: certificationCourseId,
      });

      // then
      const expectedCertificationCourse = new CertificationCourse({
        ...certificationCourse.toDTO(),
        isRejectedForFraud: false,
      });

      expect(certificationCourseRepository.update).to.have.been.calledWithExactly({
        certificationCourse: expectedCertificationCourse,
      });
      expect(certificationEvaluationRepository.rescoreV2Certification).to.have.been.calledOnceWithExactly({
        event: new CertificationCourseUnrejected({
          certificationCourseId,
          juryId,
        }),
      });
    });
  });

  describe('when certification is a V3', function () {
    it('should unreject a rejected certification course', async function () {
      // given
      const certificationCourseRepository = { get: sinon.stub(), update: sinon.stub() };
      const certificationEvaluationRepository = { rescoreV3Certification: sinon.stub() };
      const juryId = 123;

      const dependencies = {
        certificationCourseRepository,
        certificationEvaluationRepository,
      };
      const certificationCourse = domainBuilder.buildCertificationCourse({
        isRejectedForFraud: true,
        version: AlgorithmEngineVersion.V3,
      });
      const certificationCourseId = certificationCourse.getId();

      certificationCourseRepository.get.withArgs({ id: certificationCourseId }).resolves(certificationCourse);
      certificationCourseRepository.update.resolves();
      certificationEvaluationRepository.rescoreV3Certification.resolves();

      // when
      await unrejectCertificationCourse({
        ...dependencies,
        juryId,
        certificationCourseId: certificationCourseId,
      });

      // then
      const expectedCertificationCourse = new CertificationCourse({
        ...certificationCourse.toDTO(),
        isRejectedForFraud: false,
      });

      expect(certificationCourseRepository.update).to.have.been.calledWithExactly({
        certificationCourse: expectedCertificationCourse,
      });
      expect(certificationEvaluationRepository.rescoreV3Certification).to.have.been.calledOnceWithExactly({
        event: new CertificationCourseUnrejected({
          certificationCourseId,
          juryId,
        }),
      });
    });
  });
});
