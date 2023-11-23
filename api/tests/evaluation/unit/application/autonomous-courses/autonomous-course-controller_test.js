import { expect, sinon, hFake } from '../../../../test-helper.js';
import { autonomousCourseController } from '../../../../../src/evaluation/application/autonomous-courses/autonomous-course-controller.js';

describe('Unit | Controller | autonomous-course-controller', function () {
  describe('#save', function () {
    it('should return autonomous course created Id', async function () {
      // given
      const autonomousCourseAttributes = {
        internalTitle: 'Titre pour usage interne',
        publicTitle: 'Titre pour usage public',
        targetProfileId: 'targetProfileId',
        customLandingPageText: 'customLandingPageText',
      };
      const payload = {
        data: {
          type: 'autonomous-courses',
          attributes: autonomousCourseAttributes,
        },
      };
      const request = {
        headers: { 'user-agent': 'Mozilla' },
        payload: payload,
      };
      const h = {
        ...hFake,
      };
      const userId = '123';
      const requestResponseUtils = {
        extractUserIdFromRequest: sinon.stub().returns(userId),
      };
      const expectedAutonomousCourseId = 123;
      const usecases = {
        saveAutonomousCourse: sinon.stub().resolves(expectedAutonomousCourseId),
      };
      const serializedAutonomousCourseId = Symbol('serializedAutonomousCourseId');
      const autonomousCourseSerializer = { serializeId: sinon.stub().returns(serializedAutonomousCourseId) };
      const dependencies = {
        requestResponseUtils,
        usecases,
        autonomousCourseSerializer,
      };

      // when
      await autonomousCourseController.save(request, h, dependencies);

      // then
      expect(requestResponseUtils.extractUserIdFromRequest).to.have.been.called;
      expect(usecases.saveAutonomousCourse).to.have.been.calledWithExactly({
        autonomousCourse: { ...autonomousCourseAttributes, ownerId: userId },
      });
      expect(autonomousCourseSerializer.serializeId).to.have.been.calledWithExactly(expectedAutonomousCourseId);
    });
  });
});
