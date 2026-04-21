import { CertificationCourseVersion } from '../../../../../../src/certification/results/domain/read-models/CertificationCourseVersion.js';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';

describe('Certification | Results | Unit | Domain | Read-models | CertificationCourseVersion', function () {
  describe('#isV2', function () {
    it('should return true when version is V2', function () {
      // given
      const certificationCourseVersion = new CertificationCourseVersion({
        version: AlgorithmEngineVersion.V2,
      });

      // when
      const result = certificationCourseVersion.isV2();

      // then
      expect(result).to.be.true;
    });

    it('should return false when version is V3', function () {
      // given
      const certificationCourseVersion = new CertificationCourseVersion({
        version: AlgorithmEngineVersion.V3,
      });

      // when
      const result = certificationCourseVersion.isV2();

      // then
      expect(result).to.be.false;
    });
  });

  describe('#isV3', function () {
    it('should return true when version is V3', function () {
      // given
      const certificationCourseVersion = new CertificationCourseVersion({
        version: AlgorithmEngineVersion.V3,
      });

      // when
      const result = certificationCourseVersion.isV3();

      // then
      expect(result).to.be.true;
    });

    it('should return false when version is V2', function () {
      // given
      const certificationCourseVersion = new CertificationCourseVersion({
        version: AlgorithmEngineVersion.V2,
      });

      // when
      const result = certificationCourseVersion.isV3();

      // then
      expect(result).to.be.false;
    });
  });
});
