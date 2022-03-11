const { expect, hFake, sinon, generateValidRequestAuthorizationHeader } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const pixFrameworkSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/pix-framework-serializer');
const frameworkSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/framework-serializer');
const frameworksController = require('../../../../lib/application/frameworks/frameworks-controller');

describe('Unit | Controller | frameworks-controller', function () {
  const userId = 42;

  beforeEach(function () {
    sinon.stub(usecases, 'getPixFramework');
    sinon.stub(usecases, 'getFrameworks').returns([{}]);
    sinon.stub(pixFrameworkSerializer, 'serialize');
    sinon.stub(frameworkSerializer, 'serialize');
    sinon.stub(usecases, 'getFramework');
  });

  describe('#getPixFramework', function () {
    it('should fetch and return pix framework, serialized as JSONAPI', async function () {
      // given
      const request = {
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        pre: { userId },
      };

      // when
      await frameworksController.getPixFramework(request, hFake);

      // then
      expect(usecases.getPixFramework).to.have.been.called;
      expect(usecases.getPixFramework).to.have.been.calledWithExactly('fr-fr');
      expect(pixFrameworkSerializer.serialize).to.have.been.called;
    });

    it('should extract the locale and pass it to the usecases', async function () {
      // given
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
      expect(pixFrameworkSerializer.serialize).to.have.been.called;
    });
  });

  describe('#getFrameworks', function () {
    it('should fetch and return frameworks, serialized as JSONAPI', async function () {
      // given
      const request = {
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        pre: { userId },
      };

      // when
      await frameworksController.getFrameworks(request, hFake);

      // then
      expect(usecases.getFrameworks).to.have.been.called;
      expect(frameworkSerializer.serialize).to.have.been.called;
    });
  });

  describe('#getFramework', function () {
    it('should fetch and return framework, serialized as JSONAPI', async function () {
      // given
      const frameworkId = 'frameworkId';
      const request = {
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        pre: { userId },
        params: {
          id: frameworkId,
        },
      };

      // when
      await frameworksController.getFramework(request, hFake);

      // then
      expect(usecases.getFramework).to.have.been.called;
      expect(usecases.getFramework).to.have.been.calledWithExactly({ frameworkId });
      expect(pixFrameworkSerializer.serialize).to.have.been.called;
    });
  });
});
