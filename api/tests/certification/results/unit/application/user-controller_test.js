import sinon from 'sinon';

import { userController } from '../../../../../src/certification/results/application/user-controller.js';
import { usecases } from '../../../../../src/certification/results/domain/usecases/index.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';

describe('Certification | Results | Unit | Application | Controller | user-controller', function () {
  describe('#findAllCertificationCourses', function () {
    it('should return serialized data', async function () {
      // given
      const findUserCertificationCoursesStub = sinon.stub(usecases, 'findUserCertificationCourses');

      const serializedResponse = Symbol('serialized-content');

      const dependencies = {
        userCertificationCoursesSerializer: {
          serialize: sinon.stub().returns(serializedResponse),
        },
      };

      const request = {
        params: {
          userId: Symbol('userId'),
        },
      };

      // when
      const serializedUserCertificationCourses = await userController.findAllCertificationCourses(
        request,
        hFake,
        dependencies,
      );

      // then
      expect(findUserCertificationCoursesStub.calledOnceWithExactly({ userId: request.params.userId })).to.be.true;
      expect(dependencies.userCertificationCoursesSerializer.serialize.called).to.be.true;
      expect(serializedUserCertificationCourses).to.equal(serializedResponse);
    });
  });
});
