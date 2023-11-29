import { expect, sinon, hFake, domainBuilder } from '../../../../test-helper.js';
import { autonomousCourseTargetProfileController } from '../../../../../src/evaluation/application/autonomous-courses/autonomous-course-target-profile-controller.js';
import { evaluationUsecases } from '../../../../../src/evaluation/domain/usecases/index.js';

describe('Unit | Controller | autonomous-course-target-profile-controller', function () {
  describe('#get', function () {
    it('should return all autonomous course target profiles', async function () {
      // given
      const expectedResult = Symbol('result');

      const autonomousCourseTargetProfiles = [
        domainBuilder.buildTargetProfileForAdmin(),
        domainBuilder.buildTargetProfileForAdmin(),
      ];

      sinon.stub(evaluationUsecases, 'getAutonomousCourseTargetProfiles').resolves(autonomousCourseTargetProfiles);

      const autonomousCourseTargetProfilesSerializer = { serialize: sinon.stub().returns(expectedResult) };

      // when
      const response = await autonomousCourseTargetProfileController.get({}, hFake, {
        usecases: evaluationUsecases,
        autonomousCourseTargetProfilesSerializer,
      });

      // then
      expect(autonomousCourseTargetProfilesSerializer.serialize).to.have.been.calledOnce;
      expect(response).to.deep.equal(expectedResult);
    });
  });
});
