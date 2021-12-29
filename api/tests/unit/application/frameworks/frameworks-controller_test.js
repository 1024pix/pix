const { expect, hFake, sinon, generateValidRequestAuthorizationHeader } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const frameworkSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/framework-serializer');
const frameworksController = require('../../../../lib/application/frameworks/frameworks-controller');

describe('Unit | Controller | frameworks-controller', function () {
  beforeEach(function () {
    sinon.stub(usecases, 'getPixFramework');
    sinon.stub(frameworkSerializer, 'serialize');
  });

  describe('#getPixFramework', function () {
    it('should fetch and return framework, serialized as JSONAPI', async function () {
      // given
      const userId = 42;
      const request = {
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        pre: { userId },
      };

      // when
      await frameworksController.getPixFramework(request, hFake);

      // then
      expect(usecases.getPixFramework).to.have.been.called;
      expect(usecases.getPixFramework).to.have.been.calledWithExactly('fr-fr');
      expect(frameworkSerializer.serialize).to.have.been.called;
    });

    it('should extract the locale and pass it to the usecases', async function () {
      // given
      const userId = 42;
      const request = {
        headers: {
          authorization: generateValidRequestAuthorizationHeader(userId),
          'accept-language': 'en',
        },
        pre: { userId },
      };

      // when
      await frameworksController.getPixFramework(request, hFake);

      // then
      expect(usecases.getPixFramework).to.have.been.called;
      expect(usecases.getPixFramework).to.have.been.calledWithExactly('en');
      expect(frameworkSerializer.serialize).to.have.been.called;
    });
  });
});
