import { CertificationCourseVersion } from '../../../../../../src/certification/results/domain/read-models/CertificationCourseVersion.js';
import * as certificationCourseRepository from '../../../../../../src/certification/results/infrastructure/repositories/certification-course-repository.js';
import { CertificationCourse } from '../../../../../../src/certification/shared/domain/models/CertificationCourse.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Results | Integration | Repository | Certification Course', function () {
  describe('#getByVerificationCode', function () {
    context('when there is no associated certification-course', function () {
      it('should throw a NotFoundError', async function () {
        // when
        const error = await catchErr(certificationCourseRepository.getByVerificationCode)({
          verificationCode: 'P-AXAXAXAX',
        });

        // then
        return expect(error).to.be.instanceOf(NotFoundError);
      });
    });

    context('when the associated certification-course exists', function () {
      it('should retrieve the certification-course', async function () {
        // given
        const verificationCode = 'PT-AXAXAXAX';

        const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
          verificationCode,
        });
        await databaseBuilder.commit();

        // when
        const actualCertificationCourse = await certificationCourseRepository.getByVerificationCode({
          verificationCode,
        });

        // then
        const expectedCertificationCourse = new CertificationCourse(certificationCourse);

        expect(actualCertificationCourse).to.deep.equal(expectedCertificationCourse);
      });
    });
  });

  describe('#getVersion', function () {
    context('when the certification course does not exist', function () {
      it('should throw a NotFoundError', async function () {
        // when
        const error = await catchErr(certificationCourseRepository.getVersion)({
          certificationCourseId: 999999,
        });

        // then
        return expect(error).to.be.instanceOf(NotFoundError);
      });
    });

    context('when the certification course exists', function () {
      it('should retrieve the certification course version', async function () {
        // given
        const version = 3;

        const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
          version,
        });
        await databaseBuilder.commit();

        // when
        const certificationCourseVersion = await certificationCourseRepository.getVersion({
          certificationCourseId: certificationCourse.id,
        });

        // then
        const expectedCertificationCourseVersion = new CertificationCourseVersion({ version });

        expect(certificationCourseVersion).to.deep.equal(expectedCertificationCourseVersion);
      });
    });
  });
});
