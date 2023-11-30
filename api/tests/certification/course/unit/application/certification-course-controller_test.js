import { usecases } from '../../../../../src/certification/shared/domain/usecases/index.js';
import { certificationCourseController } from '../../../../../src/certification/course/application/certification-course-controller.js';
import { sinon, hFake, expect } from '../../../../test-helper.js';

describe('Unit | Controller | certification-course-controller', function () {
  describe('reject', function () {
    it('should call the rejectCertificationCourse usecase', async function () {
      const rejectCertificationCourse = sinon.stub(usecases, 'rejectCertificationCourse');
      const certificationCourseId = 12;
      rejectCertificationCourse.resolves();

      const request = {
        params: { id: certificationCourseId },
      };

      const response = await certificationCourseController.reject(request, hFake);

      expect(rejectCertificationCourse).to.have.been.calledWithExactly({
        certificationCourseId,
      });
      expect(response.statusCode).to.equal(200);
    });
  });
});
