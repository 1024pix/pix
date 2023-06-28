import { expect, sinon, hFake } from '../../../test-helper.js';
import { usecases } from '../../../../lib/shared/domain/usecases/index.js';
import { lcmsController } from '../../../../lib/shared/application/lcms/lcms-controller.js';

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
