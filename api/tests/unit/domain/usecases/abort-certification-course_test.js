import { expect, sinon, domainBuilder, catchErr } from '../../../test-helper';
import abortCertificationCourse from '../../../../lib/domain/usecases/abort-certification-course';
import CertificationCourse from '../../../../lib/domain/models/CertificationCourse';
import { EntityValidationError } from '../../../../lib/domain/errors';

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
      certificationCourseRepository.get.withArgs(certificationCourse.getId()).resolves(certificationCourse);

      // when
      await abortCertificationCourse({
        certificationCourseRepository,
        certificationCourseId: certificationCourse.getId(),
        abortReason,
      });

      // then
      expect(certificationCourseRepository.update).to.have.been.calledWithExactly(
        new CertificationCourse({
          ...certificationCourse.toDTO(),
          abortReason: 'technical',
        })
      );
    });

    it('should throw an error if abortReason is not provided', async function () {
      // given
      const abortReason = null;
      const certificationCourse = domainBuilder.buildCertificationCourse({ abortReason: null });
      certificationCourseRepository.get.withArgs(certificationCourse.getId()).resolves(certificationCourse);

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
