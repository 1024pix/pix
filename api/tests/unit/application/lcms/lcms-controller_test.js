const { expect, sinon, hFake } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const lcmsController = require('../../../../lib/application/lcms/lcms-controller');

describe('Unit | Controller | lcms-controller', () => {

  describe('#createRelease', () => {

    it('should call the createRelease', async () => {
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
