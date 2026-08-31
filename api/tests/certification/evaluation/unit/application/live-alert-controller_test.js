import { expect } from 'chai';
import sinon from 'sinon';

import { liveAlertController } from '../../../../../src/certification/evaluation/application/live-alert-controller.js';
import { usecases } from '../../../../../src/certification/evaluation/domain/usecases/index.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';

describe('Certification | Evaluation| Unit | Controller | live-alert-controller', function () {
  describe('#create', function () {
    it('should call the createLiveAlert use case', async function () {
      // given
      const assessmentId = 2;
      const challengeId = '123';
      sinon.stub(usecases, 'createLiveAlert');
      usecases.createLiveAlert.resolves();
      const payload = { data: { attributes: { 'challenge-id': challengeId } } };
      const request = { params: { id: assessmentId }, payload };

      // when
      const response = await liveAlertController.create(request, hFake);

      // then
      expect(response.statusCode).to.be.equal(204);
      expect(usecases.createLiveAlert).to.have.been.calledWithExactly({
        assessmentId,
        challengeId,
      });
    });
  });
});
