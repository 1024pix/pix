import { expect } from 'chai';

import * as complementaryCertificationCourseRepository from '../../../../../../src/certification/session-management/infrastructure/repositories/complementary-certification-course-repository.ts';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Certification | Session Management | Integration | Infrastructure | Repository | Complementary certification course', function () {
  describe('#getCertificationCourseId', function () {
    it('returns the certification course id of the given complementary certification course', async function () {
      // given
      const complementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification().id;
      const complementaryCertificationBadgeId = databaseBuilder.factory.buildComplementaryCertificationBadge({
        complementaryCertificationId,
        badgeId: null,
      }).id;
      databaseBuilder.factory.buildComplementaryCertificationCourse({
        complementaryCertificationId,
        complementaryCertificationBadgeId,
        certificationCourseId: databaseBuilder.factory.buildCertificationCourse().id,
      });
      const certificationCourse = databaseBuilder.factory.buildCertificationCourse();
      const complementaryCertificationCourse = databaseBuilder.factory.buildComplementaryCertificationCourse({
        complementaryCertificationId,
        complementaryCertificationBadgeId,
        certificationCourseId: certificationCourse.id,
      });
      await databaseBuilder.commit();

      // when
      const certificationCourseId = await complementaryCertificationCourseRepository.getCertificationCourseId({
        complementaryCertificationCourseId: complementaryCertificationCourse.id,
      });

      // then
      expect(certificationCourseId).to.equal(certificationCourse.id);
    });
  });
});
