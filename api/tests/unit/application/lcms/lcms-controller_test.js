import { lcmsController } from '../../../../lib/application/lcms/lcms-controller.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../test-helper.js';

describe('Unit | Controller | lcms-controller', function () {
  describe('#createRelease', function () {
    it('should call the createRelease', async function () {
      // given
      sinon.stub(usecases, 'createLcmsRelease').resolves();
      const request = {};

      // when
      await lcmsController.createRelease(request, hFake);

      // then
      expect(usecases.createLcmsRelease).to.have.been.called;
    });
  });
});
