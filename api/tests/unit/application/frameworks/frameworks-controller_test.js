const { expect, sinon, hFake } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases/index.js');
const frameworksController = require('../../../../lib/application/frameworks/frameworks-controller');

describe('Unit | Controller | frameworks-controller', function () {
  let frameworks;
  let areas;
  let serializedAreas;
  let frameworkAreasSerializer;
  let frameworkSerializer;
  let requestResponseUtils;
  let serializedFrameworks;

  beforeEach(function () {
    frameworks = Symbol('frameworks');
    areas = Symbol('areas');
    serializedAreas = Symbol('serializedAreas');
    serializedFrameworks = Symbol('serializedFrameworks');

    sinon.stub(usecases, 'getFrameworks').returns(frameworks);
    sinon.stub(usecases, 'getFrameworkAreas').returns(areas);
    sinon.stub(usecases, 'getLearningContentForTargetProfileSubmission').returns({ frameworks });
    frameworkAreasSerializer = { serialize: sinon.stub().returns(serializedAreas) };
    frameworkSerializer = {
      serialize: sinon.stub().returns(serializedFrameworks),
      serializeDeepWithoutSkills: sinon.stub().returns(serializedFrameworks),
    };
    requestResponseUtils = { extractLocaleFromRequest: sinon.stub().returns('en') };
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
      const request = {
        headers: {
          'accept-language': 'en',
        },
      };

      // when
      const result = await frameworksController.getPixFrameworkAreasWithoutThematics(request, hFake, {
        extractLocaleFromRequest: requestResponseUtils.extractLocaleFromRequest,
        frameworkAreasSerializer,
      });

      // then
      expect(result).to.equal(serializedAreas);
      expect(usecases.getFrameworkAreas).to.have.been.calledWithExactly({ frameworkName: 'Pix', locale: 'en' });
      expect(frameworkAreasSerializer.serialize).to.have.been.calledWithExactly(areas, { withoutThematics: true });
    });
  });

  describe('#getFrameworksForTargetProfileSubmission', function () {
    it('should fetch and return frameworks, serialized as JSONAPI', async function () {
      // given
      const request = {
        headers: {
          'accept-language': 'en',
        },
      };

      // when
      const result = await frameworksController.getFrameworksForTargetProfileSubmission(request, hFake, {
        extractLocaleFromRequest: requestResponseUtils.extractLocaleFromRequest,
        frameworkSerializer,
      });

      // then
      expect(result).to.equal(serializedFrameworks);
      expect(usecases.getLearningContentForTargetProfileSubmission).to.have.been.calledWithExactly({ locale: 'en' });
      expect(frameworkSerializer.serializeDeepWithoutSkills).to.have.been.calledWithExactly(frameworks);
    });
  });
});
