import sinon from 'sinon';

import { getCertificationCourseVersion } from '../../../../../../src/certification/results/domain/usecases/get-certification-course-version.js';

describe('Unit | Certification | Results | Domain | Usecases | get-certification-course-version', function () {
  context('when there is a certification course with the given id', function () {
    it('should return the certification course version', async function () {
      // given
      const certificationCourseId = 123;
      const expectedCertificationCourseVersion = Symbol('certificationCourseVersion');

      const certificationCourseRepository = {
        getVersion: sinon.stub(),
      };

      certificationCourseRepository.getVersion
        .withArgs({ certificationCourseId })
        .resolves(expectedCertificationCourseVersion);

      // when
      const certificationCourseVersion = await getCertificationCourseVersion({
        certificationCourseId,
        certificationCourseRepository,
      });

      // then
      expect(certificationCourseVersion).to.equal(expectedCertificationCourseVersion);
    });
  });
});
