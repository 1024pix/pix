import sinon from 'sinon';

import * as usecase from '../../../../../../src/certification/results/application/usecases/checkUserOwnsCertificationCourse.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Certification | Results | Application | Use Case | checkUserOwnsCertificationCourse', function () {
  context('When user is member of certification center session', function () {
    it('should return true', async function () {
      // given
      const userId = 7;
      const certificationCourseId = 1;
      const certificationCourse = { getUserId: () => userId };

      const certificationCourseRepositoryStub = {
        get: sinon.stub(),
      };

      certificationCourseRepositoryStub.get.withArgs({ id: certificationCourseId }).resolves(certificationCourse);

      // when
      const response = await usecase.execute({
        userId,
        certificationCourseId,
        dependencies: { certificationCourseRepository: certificationCourseRepositoryStub },
      });

      // then
      expect(response).to.be.true;
    });
  });
});
