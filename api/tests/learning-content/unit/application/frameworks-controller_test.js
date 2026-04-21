import sinon from 'sinon';

import { frameworksController } from '../../../../src/learning-content/application/frameworks-controller.js';
import { usecases } from '../../../../src/learning-content/domain/usecases/index.js';

import { hFake } from '../../../tooling/mocks/hapi.mock.js';

describe('Unit | Controller | frameworks-controller', function () {
  let frameworks;
  let areas;
  let serializedAreas;
  let frameworkAreasSerializer;
  let frameworkSerializer;
  let serializedFrameworks;

  beforeEach(function () {
    frameworks = Symbol('frameworks');
    areas = Symbol('areas');
    serializedAreas = Symbol('serializedAreas');
    serializedFrameworks = Symbol('serializedFrameworks');

    sinon.stub(usecases, 'getFrameworks').returns(frameworks);
    sinon.stub(usecases, 'getFrameworkAreas').returns(areas);
    frameworkAreasSerializer = { serialize: sinon.stub().returns(serializedAreas) };
    frameworkSerializer = {
      serialize: sinon.stub().returns(serializedFrameworks),
    };
  });

  describe('#getFrameworks', function () {
    it('should fetch and return frameworks, serialized as JSONAPI', async function () {
      // when
      const result = await frameworksController.getFrameworks({}, hFake, { frameworkSerializer });

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
      const result = await frameworksController.getFrameworkAreas(request, hFake, { frameworkAreasSerializer });

      // then
      expect(result).to.equal(serializedAreas);
      expect(usecases.getFrameworkAreas).to.have.been.calledWithExactly({ frameworkId });
      expect(frameworkAreasSerializer.serialize).to.have.been.calledWithExactly(areas);
    });
  });

  describe('#getPixFrameworkAreasWithoutThematics', function () {
    it('should fetch and return framework, serialized as JSONAPI', async function () {
      // given
      const locale = 'en';
      const request = {
        state: { locale },
      };

      // when
      const result = await frameworksController.getPixFrameworkAreasWithoutThematics(request, hFake, {
        frameworkAreasSerializer,
      });

      // then
      expect(result).to.equal(serializedAreas);
      expect(usecases.getFrameworkAreas).to.have.been.calledWithExactly({ frameworkName: 'Pix', locale: 'en' });
      expect(frameworkAreasSerializer.serialize).to.have.been.calledWithExactly(areas, { withoutThematics: true });
    });
  });
});
