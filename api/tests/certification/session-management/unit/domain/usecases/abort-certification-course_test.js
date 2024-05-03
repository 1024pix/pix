import { abortCertificationCourse } from '../../../../../../src/certification/session-management/domain/usecases/abort-certification-course.js';
import { CertificationCourse } from '../../../../../../src/certification/shared/domain/models/CertificationCourse.js';
import { EntityValidationError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | abort-certification-course', function () {
  let certificationCourseRepository;

  beforeEach(function () {
    certificationCourseRepository = {
      get: sinon.stub(),
      update: sinon.stub(),
    };
  });

  context('when abort reason is valid', function () {
    it('should update the certificationCourse with a reason', async function () {
      // given
      const abortReason = 'technical';
      const certificationCourse = domainBuilder.buildCertificationCourse({ abortReason: null });
      certificationCourseRepository.get.withArgs({ id: certificationCourse.getId() }).resolves(certificationCourse);

      // when
      await abortCertificationCourse({
        certificationCourseRepository,
        certificationCourseId: certificationCourse.getId(),
        abortReason,
      });

      // then
      expect(certificationCourseRepository.update).to.have.been.calledWithExactly({
        certificationCourse: new CertificationCourse({
          ...certificationCourse.toDTO(),
          abortReason: 'technical',
        }),
      });
    });

    it('should throw an error if abortReason is not provided', async function () {
      // given
      const abortReason = null;
      const certificationCourse = domainBuilder.buildCertificationCourse({ abortReason: null });
      certificationCourseRepository.get.withArgs({ id: certificationCourse.getId() }).resolves(certificationCourse);

      // when
      const err = await catchErr(abortCertificationCourse)({
        certificationCourseRepository,
        certificationCourseId: certificationCourse.getId(),
        abortReason,
      });

      // then
      expect(err).to.be.instanceOf(EntityValidationError);
      expect(certificationCourseRepository.update).not.to.have.been.called;
    });
  });
});
