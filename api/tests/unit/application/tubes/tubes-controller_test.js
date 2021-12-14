const { expect, hFake, sinon, generateValidRequestAuthorizationHeader } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const tubeSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/tube-serializer');
const tubesController = require('../../../../lib/application/tubes/tubes-controller');

describe('Unit | Controller | tubes-controller', function () {
  beforeEach(function () {
    sinon.stub(usecases, 'getTubesFromPixFramework');
    sinon.stub(tubeSerializer, 'serialize');
  });

  describe('#getTubes', function () {
    it('should fetch and return tubes, serialized as JSONAPI', async function () {
      // given
      const userId = 42;
      const request = {
        headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        pre: { userId },
      };

      // when
      await tubesController.getTubes(request, hFake);

      // then
      expect(usecases.getTubesFromPixFramework).to.have.been.called;
      expect(usecases.getTubesFromPixFramework).to.have.been.calledWithExactly('fr-fr');
      expect(tubeSerializer.serialize).to.have.been.called;
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
      await tubesController.getTubes(request, hFake);

      // then
      expect(usecases.getTubesFromPixFramework).to.have.been.called;
      expect(usecases.getTubesFromPixFramework).to.have.been.calledWithExactly('en');
      expect(tubeSerializer.serialize).to.have.been.called;
    });
  });
});
