import * as pixPlusCertificationCourseRepository from '../../../../../../src/certification/evaluation/infrastructure/repositories/pix-plus-certification-course-repository.js';
import { ComplementaryCertificationKeys } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Session Management | Integration | Infrastructure | Repositories | Pix Plus Certification', function () {
  describe('#getByCertificationCourseId', function () {
    describe('when there is no pix plus certification', function () {
      it('returns an empty array', async function () {
        // given / when
        const pixPlusCertificationCourses = await pixPlusCertificationCourseRepository.getByCertificationCourseId(1);

        // then
        expect(pixPlusCertificationCourses).to.deep.equal(null);
      });
    });

    it('returns the non double V3 certifications', async function () {
      // given
      const v2certificationCourseDate = new Date('2020-01-01');
      const v3certificationCourseDate = new Date('2026-01-01');

      const certificationCourse = databaseBuilder.factory.buildCertificationCourse();
      const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification();
      const doubleCertification = databaseBuilder.factory.buildComplementaryCertification({
        key: ComplementaryCertificationKeys.CLEA,
      });
      databaseBuilder.factory.buildComplementaryCertificationCourse({
        complementaryCertificationId: complementaryCertification.id,
        certificationCourseId: certificationCourse.id,
        createdAt: v2certificationCourseDate,
      });
      databaseBuilder.factory.buildComplementaryCertificationCourse({
        complementaryCertificationId: complementaryCertification.id,
        certificationCourseId: certificationCourse.id,
        createdAt: v3certificationCourseDate,
      });
      databaseBuilder.factory.buildComplementaryCertificationCourse({
        complementaryCertificationId: doubleCertification.id,
        certificationCourseId: certificationCourse.id,
        createdAt: v3certificationCourseDate,
      });

      await databaseBuilder.commit();

      // when
      const pixPlusCertificationCourse = await pixPlusCertificationCourseRepository.getByCertificationCourseId(
        certificationCourse.id,
      );

      // then
      const expectedResult = domainBuilder.certification.evaluation.buildPixPlusCertificationCourse({
        id: pixPlusCertificationCourse.id,
      });
      expect(pixPlusCertificationCourse).to.deep.equal(expectedResult);
    });
  });
});
