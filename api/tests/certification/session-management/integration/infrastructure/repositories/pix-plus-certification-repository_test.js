import * as pixPlusCertificationRepository from '../../../../../../src/certification/session-management/infrastructure/repositories/pix-plus-certification-repository.js';
import { ComplementaryCertificationKeys } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { databaseBuilder, domainBuilder, expect } from '../../../../../test-helper.js';

describe('Certification | Session Management | Integration | Infrastructure | Repositories | Pix Plus Certification', function () {
  describe('#getBySessionId', function () {
    describe('when there is no pix plus certification', function () {
      it('returns an empty array', async function () {
        // given / when
        const pixPlusCertificationCourses = await pixPlusCertificationRepository.getBySessionId(1);

        // then
        expect(pixPlusCertificationCourses).to.deep.equal([]);
      });
    });

    it('returns the non double V3 certifications', async function () {
      // given
      const v2certificationCourseDate = new Date('2020-01-01');
      const v3certificationCourseDate = new Date('2026-01-01');

      const session = databaseBuilder.factory.buildSession();
      const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
        sessionId: session.id,
      });
      const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification();
      const doubleCertification = databaseBuilder.factory.buildComplementaryCertification({
        key: ComplementaryCertificationKeys.CLEA,
      });
      databaseBuilder.factory.buildComplementaryCertificationCourse({
        complementaryCertificationId: complementaryCertification.id,
        certificationCourseId: certificationCourse.id,
        createdAt: v2certificationCourseDate,
      });
      const pixPlusCertificationCourse = databaseBuilder.factory.buildComplementaryCertificationCourse({
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
      const pixPlusCertificationCourses = await pixPlusCertificationRepository.getBySessionId(session.id);

      // then
      const expectedResult = [
        domainBuilder.certification.sessionManagement.buildPixPlusCertificationCourse({
          id: pixPlusCertificationCourse.id,
          createdAt: pixPlusCertificationCourse.createdAt,
        }),
      ];
      expect(pixPlusCertificationCourses).to.deep.equal(expectedResult);
    });
  });
});
