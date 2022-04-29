const { expect, sinon } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const frameworkAreasSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/framework-areas-serializer');
const frameworkSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/framework-serializer');
const frameworksController = require('../../../../lib/application/frameworks/frameworks-controller');

describe('Unit | Controller | frameworks-controller', function () {
  let frameworks;
  let areas;
  let serializedAreas;
  let serializedFrameworks;

  beforeEach(function () {
    frameworks = Symbol('frameworks');
    areas = Symbol('areas');
    serializedAreas = Symbol('serializedAreas');
    serializedFrameworks = Symbol('serializedFrameworks');

    sinon.stub(usecases, 'getFrameworks').returns(frameworks);
    sinon.stub(frameworkAreasSerializer, 'serialize').returns(serializedAreas);
    sinon.stub(frameworkSerializer, 'serialize').returns(serializedFrameworks);
    sinon.stub(usecases, 'getFrameworkAreas').returns(areas);
  });

  describe('#getPixFramework', function () {
    it('should fetch and return pix framework, serialized as JSONAPI', async function () {
      // given
      const request = {};

      // when
      const result = await frameworksController.getPixFramework(request);

      // then
      expect(result).to.equal(serializedAreas);
      expect(usecases.getFrameworkAreas).to.have.been.calledWith({ frameworkName: 'Pix', locale: 'fr-fr' });
      expect(frameworkAreasSerializer.serialize).to.have.been.calledWithExactly(areas);
    });

    it('should extract the locale and pass it to the usecases', async function () {
      // given
      const request = {
        headers: {
          'accept-language': 'en',
        },
      };

      // when
      const result = await frameworksController.getPixFramework(request);

      // then
      expect(result).to.equal(serializedAreas);
      expect(usecases.getFrameworkAreas).to.have.been.calledWithExactly({ frameworkName: 'Pix', locale: 'en' });
      expect(frameworkAreasSerializer.serialize).to.have.been.calledWithExactly(areas);
    });
  });

  describe('#getFrameworks', function () {
    it('should fetch and return frameworks, serialized as JSONAPI', async function () {
      // when
      const result = await frameworksController.getFrameworks();

      // then
      expect(result).to.equal(serializedFrameworks);
      expect(usecases.getFrameworks).to.have.been.calledWithExactly();
      expect(frameworkSerializer.serialize).to.have.been.calledWithExactly(frameworks);
    });
  });

  describe('#getFrameworkAreas', function () {
    it('should fetch and return framework, serialized as JSONAPI', async function () {
      // given
      const frameworkId = 'frameworkId';
      const request = {
        params: {
          id: frameworkId,
        },
      };

      // when
      const result = await frameworksController.getFrameworkAreas(request);

      // then
      expect(result).to.equal(serializedAreas);
      expect(usecases.getFrameworkAreas).to.have.been.calledWithExactly({ frameworkId });
      expect(frameworkAreasSerializer.serialize).to.have.been.calledWithExactly(areas);
    });
  });
});
