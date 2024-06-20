import * as certificationVersionRepository from '../../../../../../src/certification/results/infrastructure/repositories/certification-version-repository.js';
import { CERTIFICATION_VERSIONS } from '../../../../../../src/certification/shared/domain/models/CertificationVersion.js';
import { databaseBuilder, expect } from '../../../../../test-helper.js';

describe('Certification | Course | Integration | Repository | course-assessment-result', function () {
  describe('#getByCertificationCourseId', function () {
    it('should return the certification version', async function () {
      // given
      const certificationCourseId = 123;
      databaseBuilder.factory.buildCertificationCourse({ version: 2, id: certificationCourseId });
      databaseBuilder.factory.buildCertificationCourse({ version: 3, id: '456' });
      await databaseBuilder.commit();

      // when
      const certificationVersion = await certificationVersionRepository.getByCertificationCourseId({
        certificationCourseId,
      });

      // then
      expect(certificationVersion).to.equal(CERTIFICATION_VERSIONS.V2);
    });
  });
});
